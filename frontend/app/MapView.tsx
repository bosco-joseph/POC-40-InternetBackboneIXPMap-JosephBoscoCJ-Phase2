// @ts-nocheck
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip } from "react-leaflet";
import { useMap } from "react-leaflet";
import L from "leaflet";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MapContainerAny: any = MapContainer;
const TileLayerAny: any = TileLayer;
const PolylineAny: any = Polyline;
const CircleMarkerAny: any = CircleMarker;
const TooltipAny: any = Tooltip;
const MarkerAny: any = Marker;

function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [map]);

  return null;
}

const routeAnchors: Record<string, [number, number]> = {
  London: [51.5074, -0.1278],
  Frankfurt: [50.1109, 8.6821],
  "New York": [40.7128, -74.006],
  Singapore: [1.3521, 103.8198],
  Dubai: [25.2048, 55.2708],
  Johannesburg: [-26.2041, 28.0473],
  "San Jose": [37.3382, -121.8863],
  Tokyo: [35.6762, 139.6503],
  Mumbai: [19.0760, 72.8777],
  Marseille: [43.2965, 5.3698],
  Sydney: [33.8688, 151.2093],
  "Los Angeles": [34.0522, -118.2437],
};

const getMidpoint = (positions: [number, number][]): [number, number] => [
  (positions[0][0] + positions[1][0]) / 2,
  (positions[0][1] + positions[1][1]) / 2,
];

const failedLabelIcon = L.divIcon({
  className: "corridor-status-label corridor-status-label--failed",
  html: "<span>FAILED</span>",
  iconSize: [64, 22],
  iconAnchor: [32, 11],
});

const backupLabelIcon = L.divIcon({
  className: "corridor-status-label corridor-status-label--backup",
  html: "<span>BACKUP</span>",
  iconSize: [72, 22],
  iconAnchor: [36, 11],
});

// Icon helper for permanent place name labels
const createCityLabelIcon = (cityName: string) =>
  L.divIcon({
    className: "city-name-label",
    html: `<span style="color: #e2e8f0; font-weight: 600; font-size: 11px; text-shadow: 0 1px 3px rgba(0,0,0,0.9); background: rgba(15, 23, 42, 0.85); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); white-space: nowrap;">${cityName}</span>`,
    iconSize: [100, 20],
    iconAnchor: [-10, 10], // Offsets the text slightly to the right of the anchor node
  });

const getRiskLevel = (route: any) => {
  if (route.congestion_score >= 80 || route.redundancy_score <= 60) return "Critical";
  if (route.congestion_score >= 70 || route.redundancy_score <= 70) return "High";
  if (route.congestion_score >= 50) return "Moderate";
  return "Low";
};

const matchesRoute = (targetState: any, routeName: string) => {
  if (!targetState) return false;
  if (Array.isArray(targetState)) return targetState.includes(routeName);
  return targetState === routeName;
};

const getRouteStyle = (route: any, simulation: any, hoveredRouteId: string | null) => {
  const isFailed = matchesRoute(simulation.failed_route, route.name);
  const isRerouted = matchesRoute(simulation.rerouted_route, route.name);
  const isSelected = matchesRoute(simulation.selected_cable, route.name);
  const isHovered = hoveredRouteId === route.id;

  if (isFailed) {
    return {
      className: "corridor-route corridor-route--failed",
      color: "#ef4444",
      weight: 5,
      opacity: 0.35,
      dashArray: "8 12",
      lineCap: "round",
    };
  }

  if (isRerouted) {
    return {
      className: "corridor-route corridor-route--rerouted",
      color: "#22c55e",
      weight: 7,
      opacity: 1,
      dashArray: undefined,
      lineCap: "round",
    };
  }

  if (isSelected) {
    return {
      className: "corridor-route corridor-route--selected",
      color: "#38bdf8",
      weight: 4,
      opacity: 1,
      dashArray: "12 10",
      lineCap: "round",
    };
  }

  if (isHovered) {
    return {
      className: "corridor-route corridor-route--hovered",
      color: "#fbbf24",
      weight: 4,
      opacity: 0.9,
      dashArray: "16 14",
      lineCap: "round",
    };
  }

  return {
    className: "corridor-route",
    color: "#818cf8",
    weight: 3,
    opacity: 0.82,
    dashArray: "16 14",
    lineCap: "round",
  };
};

type MapViewProps = {
  topology: any;
  facilities: any[];
  simulation: any;
  setSimulation: any;
  filters: any;
  setFilters: any;
  mapFilters: any;
  setMapFilters: any;
  pathConcentration: any;
};

export default function MapView({
  topology,
  facilities,
  simulation,
  setSimulation,
  filters,
  setFilters,
  mapFilters,
  setMapFilters,
  pathConcentration,
}: MapViewProps) {
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);

  const mapRoutes = useMemo(() => {
    return topology.corridors
      .map((corridor: any) => {
        const fromPos = routeAnchors[corridor.from?.trim()];
        const toPos = routeAnchors[corridor.to?.trim()];
        
        const resolvedPositions = (fromPos && toPos) ? [fromPos, toPos] : [];

        return {
          id: corridor.id,
          name: corridor.name,
          from: corridor.from || "Unknown",
          to: corridor.to || "Unknown",
          capacity_gbps: corridor.capacity_gbps,
          congestion_score: corridor.congestion_score,
          regional_dependency: corridor.regional_dependency,
          redundancy_score: corridor.redundancy_score,
          positions: resolvedPositions,
        };
      })
      .filter((route: any) => route.positions.length === 2);
  }, [topology.corridors]);

  const onRouteClick = useCallback((routeName: string) => {
    setSimulation((prev: any) => ({
      ...prev,
      selected_cable: routeName,
      failed_route: undefined,
      rerouted_route: undefined,
      status: "degraded",
    }));
  }, [setSimulation]);

  const onRouteMouseOver = useCallback((routeId: string) => setHoveredRouteId(routeId), []);
  const onRouteMouseOut = useCallback((routeId: string) => {
    setHoveredRouteId((currentId) => (currentId === routeId ? null : currentId));
  }, []);

  const onIxpClick = useCallback((ixp: any) => {
    setSimulation((prev: any) => ({
      ...prev,
      selected_ixp: ixp.name,
      selected_facility: "",
    }));

    setFilters((prev: any) => ({
      ...prev,
      ixp: ixp.name,
    }));

    setMapFilters((prev: any) => ({
      ...prev,
      region: ixp.region,
      facility: "All facilities",
    }));
  }, [setSimulation, setFilters, setMapFilters]);

  const onFacilityClick = useCallback((facility: any) => {
    setSimulation((prev: any) => ({
      ...prev,
      selected_facility: facility.facility_name,
      selected_ixp: "",
    }));

    setMapFilters((prev: any) => ({
      ...prev,
      facility: facility.facility_name,
      region: facility.region,
    }));

    setFilters((prev: any) => ({
      ...prev,
      ixp: "All IXPs",
    }));
  }, [setSimulation, setMapFilters, setFilters]);

  const renderedRoutes = useMemo(() => {
    return mapRoutes.map((route) => (
      <PolylineAny
        key={route.id}
        positions={route.positions}
        eventHandlers={{
          click: () => onRouteClick(route.name),
          mouseover: () => onRouteMouseOver(route.id),
          mouseout: () => onRouteMouseOut(route.id),
        }}
        pathOptions={getRouteStyle(route, simulation, hoveredRouteId)}
      >
        <TooltipAny direction="top" sticky interactive={false} opacity={0.95} className="route-tooltip">
          <div className="map-marker-tooltip route-tooltip-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong style={{ fontSize: '1.1em', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>{route.name}</strong>
            {matchesRoute(simulation.failed_route, route.name) && (
              <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.75rem' }}>STATUS: FAILED</span>
            )}
            {matchesRoute(simulation.rerouted_route, route.name) && (
              <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.75rem' }}>STATUS: BACKUP ROUTE</span>
            )}
            <span>{route.from} to {route.to}</span>
            <span><strong>Capacity:</strong> {route.capacity_gbps} Gbps</span>
            <span><strong>Traffic utilization:</strong> {route.congestion_score}%</span>
            <span><strong>Risk level:</strong> {getRiskLevel(route)}</span>
          </div>
        </TooltipAny>
      </PolylineAny>
    ));
  }, [mapRoutes, simulation.selected_cable, simulation.failed_route, simulation.rerouted_route, hoveredRouteId, onRouteClick, onRouteMouseOver, onRouteMouseOut]);

  const routeStatusLabels = useMemo(() => {
    return mapRoutes.flatMap((route) => {
      const isFailed = matchesRoute(simulation.failed_route, route.name);
      const isRerouted = matchesRoute(simulation.rerouted_route, route.name);

      if (!isFailed && !isRerouted) {
        return [];
      }

      const midpoint = getMidpoint(route.positions as [number, number][]);

      return [
        <MarkerAny
          key={`${route.id}-status-label`}
          position={midpoint}
          icon={isFailed ? failedLabelIcon : backupLabelIcon}
          interactive={false}
          zIndexOffset={1000}
        />,
      ];
    });
  }, [mapRoutes, simulation.failed_route, simulation.rerouted_route]);

  const renderedCityLabels = useMemo(() => {
    return Object.entries(routeAnchors).map(([cityName, coords]) => (
      <MarkerAny
        key={`city-label-${cityName}`}
        position={coords}
        icon={createCityLabelIcon(cityName)}
        interactive={false}
        zIndexOffset={500}
      />
    ));
  }, []);

  const renderedIXPs = useMemo(() => {
    return topology.ixps.map((ixp: any) => {
      const isSelected = simulation.selected_ixp === ixp.name;
      return (
        <CircleMarker
          key={ixp.id}
          center={[ixp.lat, ixp.lng]}
          radius={isSelected ? 10 : 8}
          pathOptions={{
            className: isSelected ? "ixp-marker ixp-marker--selected" : "ixp-marker",
            color: isSelected ? "#fbbf24" : "#38bdf8",
            fillColor: "#38bdf8",
            fillOpacity: 0.95,
            weight: isSelected ? 3 : 2,
          }}
          eventHandlers={{
            click: () => onIxpClick(ixp),
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95} interactive={false}>
            <div className="map-marker-tooltip" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <strong style={{ fontSize: '1.1em', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>{ixp.name}</strong>
              <span>{ixp.region}</span>
              <span><strong>Capacity:</strong> {ixp.members * 2.5} Gbps</span>
              <span><strong>Connected ASNs:</strong> {ixp.members}</span>
            </div>
          </Tooltip>
        </CircleMarker>
      );
    });
  }, [topology.ixps, simulation.selected_ixp, onIxpClick]);

  const renderedFacilities = useMemo(() => {
    return facilities.map((facility: any) => {
      const isSelected = simulation.selected_facility === facility.facility_name;
      return (
        <CircleMarker
          key={facility.id}
          center={[facility.lat, facility.lng]}
          radius={isSelected ? 8 : 6}
          pathOptions={{
            className: isSelected ? "facility-marker facility-marker--selected" : "facility-marker",
            color: isSelected ? "#fbbf24" : "#818cf8",
            fillColor: "#818cf8",
            fillOpacity: 0.95,
            weight: isSelected ? 3 : 2,
          }}
          eventHandlers={{
            click: () => onFacilityClick(facility),
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95} interactive={false}>
            <div className="map-marker-tooltip" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <strong style={{ fontSize: '1.1em', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>{facility.facility_name}</strong>
              <span>{facility.region}</span>
              <span><strong>Capacity:</strong> {facility.capacity} Gbps</span>
              <span><strong>Connected ASNs:</strong> {facility.connected_networks}</span>
            </div>
          </Tooltip>
        </CircleMarker>
      );
    });
  }, [facilities, simulation.selected_facility, onFacilityClick]);

  const renderedStations = useMemo(() => {
    return topology.landing_stations.map((station: any) => (
      <CircleMarker
        key={station.id}
        center={[station.lat, station.lng]}
        radius={5}
        pathOptions={{
          color: "#34d399",
          fillColor: "#34d399",
          fillOpacity: 0.9,
          weight: 2,
        }}
      >
        <Tooltip direction="top" offset={[0, -8]} opacity={0.95} interactive={false}>
          <div className="map-marker-tooltip" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong style={{ fontSize: '1.1em' }}>{station.name}</strong>
            <span>{station.region}</span>
          </div>
        </Tooltip>
      </CircleMarker>
    ));
  }, [topology.landing_stations]);

  return (
    <>
      <div className="map-filters">
        <label className="map-filter">
          <span>Region: </span>
          <select
            value={mapFilters.region}
            onChange={(event) =>
              setMapFilters((prev: any) => ({
                ...prev,
                region: event.target.value,
              }))
            }
          >
            <option>All Regions</option>
            {topology.regions.map((region: any) => (
              <option key={region.name} value={region.name}>
                {region.name}
              </option>
            ))}
          </select>
        </label>

        <label className="map-filter">
          <span>  ASN: </span>
          <select
            value={mapFilters.asn}
            onChange={(event) =>
              setMapFilters((prev: any) => ({
                ...prev,
                asn: event.target.value,
              }))
            }
          >
            <option>All ASNs</option>
            <option>3356</option>
            <option>1299</option>
            <option>6939</option>
            <option>15169</option>
          </select>
        </label>

        <label className="map-filter">
          <span>  Facility: </span>
          <select
            value={mapFilters.facility}
            onChange={(event) => {
              setMapFilters((prev: any) => ({
                ...prev,
                facility: event.target.value,
              }));

              if (event.target.value !== "All facilities") {
                setSimulation((prev: any) => ({
                  ...prev,
                  selected_facility: event.target.value,
                }));
              }
            }}
          >
            <option>All Facilities</option>
            {facilities.map((facility: any) => (
              <option
                key={facility.id}
                value={facility.facility_name}
              >
                {facility.facility_name}
              </option>
            ))}
          </select>
        </label>

        <label className="map-filter">
          <span>  Capacity: </span>
          <select
            value={mapFilters.capacity}
            onChange={(event) =>
              setMapFilters((prev: any) => ({
                ...prev,
                capacity: event.target.value,
              }))
            }
          >
            <option>All Capacities</option>
            <option>500 Gbps+</option>
            <option>1000 Gbps+</option>
            <option>2000 Gbps+</option>
          </select>
        </label>
      </div>

      <div className="real-map" aria-label="Interconnection map">
        <MapContainerAny 
          center={[18, 12]} 
          zoom={2} 
          minZoom={2} 
          maxZoom={6} 
          scrollWheelZoom={false} 
          className="leaflet-map-shell" 
          style={{ height: "100%", width: "100%" }}
        >
          <MapInvalidator />
          <TileLayerAny
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {renderedRoutes}
          {routeStatusLabels}
          {renderedCityLabels}
          {renderedIXPs}
          {renderedFacilities}
          {renderedStations}
        </MapContainerAny>
      </div>

      <div className="mini-stats-grid">
        <div className="mini-stat">
          <span>Critical corridor</span>
          <strong>{pathConcentration.most_critical[0]?.name ?? "SEA-ME-WE-3"}</strong>
        </div>
        <div className="mini-stat">
          <span>Dependency index</span>
          <strong>{pathConcentration.dependency_index.toFixed(1)}</strong>
        </div>
        <div className="mini-stat">
          <span>Redundancy</span>
          <strong>{pathConcentration.redundancy_rating}%</strong>
        </div>
      </div>
    </>
  );
}