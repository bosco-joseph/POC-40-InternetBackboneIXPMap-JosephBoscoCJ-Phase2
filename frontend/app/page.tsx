// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

type Summary = {
  backbone_nodes: number;
  ixp_sites: number;
  regions: number;
  total_capacity_gbps: number;
  active_links: number;
  peak_utilization_pct: number;
};

type Region = {
  name: string;
  nodes: number;
  traffic_index: number;
  dependency?: string;
};

type Node = {
  id: string;
  name: string;
  region: string;
  capacity_gbps: number;
};

type IxpSite = {
  id: string;
  name: string;
  country: string;
  region: string;
  members: number;
  lat: number;
  lng: number;
};

type Facility = {
  id: string;
  facility_name: string;
  country: string;
  region: string;
  operator: string;
  connected_networks: number;
  capacity: number;
  importance_score: number;
  lat: number;
  lng: number;
};

type Operator = {
  name: string;
  ownership: string;
  influence: string;
};

type PathConcentration = {
  most_critical: Array<{
    name: string;
    congestion_score: number;
    regional_dependency: string;
    redundancy_score: number;
  }>;
  dependency_index: number;
  redundancy_rating: number;
};

type SimulationResult = {
  status: string;
  selected_ixp: string;
  selected_facility: string;
  selected_cable: string;
  failed_route?: string;
  rerouted_route?: string;
  affected_traffic: string;
  impacted_regions: string[];
  impacted_facilities: string[];
  recalculated_paths: Array<{ route: string; status: string }>;
  metrics: {
    new_congestion: number;
    redundancy_drop: number;
    regional_impact: string;
    recovery_window_hours: number;
  };
};

const defaultSummary: Summary = {
  backbone_nodes: 6,
  ixp_sites: 5,
  regions: 5,
  total_capacity_gbps: 6200,
  active_links: 8,
  peak_utilization_pct: 84,
};

const defaultTopology = {
  regions: [
    { name: "Europe", nodes: 2, traffic_index: 94, dependency: "High" },
    { name: "North America", nodes: 2, traffic_index: 91, dependency: "High" },
    { name: "Asia Pacific", nodes: 1, traffic_index: 88, dependency: "Moderate" },
    { name: "Middle East", nodes: 1, traffic_index: 76, dependency: "Moderate" },
    { name: "Africa", nodes: 1, traffic_index: 69, dependency: "Elevated" },
  ] as Region[],
  backbone: [
    { id: "LON-01", name: "London Core", region: "Europe", capacity_gbps: 1200 },
    { id: "FRA-02", name: "Frankfurt Transit", region: "Europe", capacity_gbps: 980 },
    { id: "JFK-03", name: "New York Gateway", region: "North America", capacity_gbps: 1400 },
    { id: "SJC-04", name: "San Jose Edge", region: "North America", capacity_gbps: 890 },
    { id: "DXB-05", name: "Dubai Hub", region: "Middle East", capacity_gbps: 760 },
    { id: "SIN-06", name: "Singapore Exchange", region: "Asia Pacific", capacity_gbps: 1100 },
  ] as Node[],
  ixps: [
    { id: "IXP-101", name: "London", country: "United Kingdom", region: "Europe", members: 220, lat: 51.5074, lng: -0.1278 },
    { id: "IXP-202", name: "Frankfurt", country: "Germany", region: "Europe", members: 190, lat: 50.1109, lng: 8.6821 },
    { id: "IXP-303", name: "New York", country: "United States", region: "North America", members: 260, lat: 40.7128, lng: -74.006 },
    { id: "IXP-404", name: "Johannesburg", country: "South Africa", region: "Africa", members: 130, lat: -26.2041, lng: 28.0473 },
    { id: "IXP-505", name: "Singapore", country: "Singapore", region: "Asia Pacific", members: 210, lat: 1.3521, lng: 103.8198 },
  ] as IxpSite[],
  landing_stations: [
    { id: "LS-01", name: "Bude Landing Station", country: "United Kingdom", region: "Europe", lat: 50.8333, lng: -4.55 },
    { id: "LS-02", name: "Virginia Beach Landing", country: "United States", region: "North America", lat: 36.8528, lng: -75.978 },
    { id: "LS-03", name: "Mumbai Landing Station", country: "India", region: "Asia Pacific", lat: 19.076, lng: 72.8777 },
  ],
  corridors: [
    { id: "C-101", name: "London ↔ Frankfurt", from: "London", to: "Frankfurt", capacity_gbps: 480, congestion_score: 76, regional_dependency: "Europe", redundancy_score: 68 },
    { id: "C-106", name: "Indian Ocean Transit", from: "Singapore", to: "Johannesburg", capacity_gbps: 410, congestion_score: 67, regional_dependency: "Asia-Africa", redundancy_score: 73 },
    { id: "C-102", name: "London ↔ New York", from: "London", to: "New York", capacity_gbps: 430, congestion_score: 71, regional_dependency: "Atlantic", redundancy_score: 74 },
    { id: "C-103", name: "Frankfurt ↔ Singapore", from: "Frankfurt", to: "Singapore", capacity_gbps: 520, congestion_score: 82, regional_dependency: "Europe-Middle East", redundancy_score: 62 },
    { id: "C-105", name: "New York ↔ Singapore", from: "New York", to: "Singapore", capacity_gbps: 500, congestion_score: 75, regional_dependency: "Global", redundancy_score: 65 },
    { id: "C-104", name: "Frankfurt ↔ Dubai", from: "Frankfurt", to: "Dubai", capacity_gbps: 380, congestion_score: 69, regional_dependency: "Europe-Middle East", redundancy_score: 71 },
    { id: "C-107", name: "Dubai ↔ Singapore", from: "Dubai", to: "Singapore", capacity_gbps: 440, congestion_score: 73, regional_dependency: "Middle East-Asia", redundancy_score: 66 },
  ],
} as const;

const defaultFacilities: Facility[] = [
  { id: "FAC-01", facility_name: "Equinix LD8", country: "United Kingdom", region: "Europe", operator: "Equinix", connected_networks: 118, capacity: 2400, importance_score: 98, lat: 51.5201, lng: -0.1234 },
  { id: "FAC-02", facility_name: "Telehouse North", country: "United Kingdom", region: "Europe", operator: "Digital Realty", connected_networks: 94, capacity: 1800, importance_score: 92, lat: 51.527, lng: -0.074 },
  { id: "FAC-03", facility_name: "MDC NYC", country: "United States", region: "North America", operator: "Digital Realty", connected_networks: 141, capacity: 2800, importance_score: 96, lat: 40.7359, lng: -74.0037 },
  { id: "FAC-04", facility_name: "Google DC 1", country: "United States", region: "North America", operator: "Google", connected_networks: 104, capacity: 3150, importance_score: 95, lat: 37.7749, lng: -122.4194 },
  { id: "FAC-05", facility_name: "JINX Data Hub", country: "South Africa", region: "Africa", operator: "NTT", connected_networks: 52, capacity: 1100, importance_score: 77, lat: -26.12, lng: 28.03 },
  { id: "FAC-06", facility_name: "SIN-IX Core", country: "Singapore", region: "Asia Pacific", operator: "LINX", connected_networks: 96, capacity: 2200, importance_score: 91, lat: 1.289, lng: 103.851 },
];

const defaultOperators: Operator[] = [
  { name: "Equinix", ownership: "Carrier-neutral colocation", influence: "High" },
  { name: "Digital Realty", ownership: "Wholesale data center operator", influence: "High" },
  { name: "Google", ownership: "Hyperscale infrastructure", influence: "Very High" },
  { name: "Cloudflare", ownership: "Edge delivery network", influence: "High" },
  { name: "LINX", ownership: "Internet exchange operator", influence: "Medium" },
  { name: "AMS-IX", ownership: "Regional exchange hub", influence: "Medium" },
  { name: "DE-CIX", ownership: "Global exchange provider", influence: "High" },
  { name: "NTT", ownership: "Global telecom backbone", influence: "High" },
];

const defaultPathConcentration: PathConcentration = {
  most_critical: [
    { name: "Frankfurt ↔ Singapore", congestion_score: 82, regional_dependency: "High", redundancy_score: 62 },
    { name: "London ↔ New York", congestion_score: 75, regional_dependency: "Medium", redundancy_score: 74 },
    { name: "New York ↔ Singapore", congestion_score: 88, regional_dependency: "High", redundancy_score: 58 },
  ],
  dependency_index: 7.4,
  redundancy_rating: 71,
};

const defaultSimulation: SimulationResult = {
  status: "degraded",
  selected_ixp: "London",
  selected_facility: "Equinix LD8",
  selected_cable: "Frankfurt ↔ Singapore",
  failed_route: undefined,
  rerouted_route: undefined,
  affected_traffic: "842 Gbps",
  impacted_regions: ["Europe", "Middle East"],
  impacted_facilities: ["Equinix LD8", "Telehouse North", "SIN-IX Core"],
  recalculated_paths: [
    { route: "London -> Frankfurt -> Dubai", status: "rerouted" },
    { route: "Singapore -> New York", status: "degraded" },
  ],
  metrics: {
    new_congestion: 69,
    redundancy_drop: 22,
    regional_impact: "High",
    recovery_window_hours: 4,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCorridorRiskLevel(corridor?: { congestion_score: number; redundancy_score: number }) {
  if (!corridor) {
    return "Moderate";
  }

  if (corridor.congestion_score >= 80 || corridor.redundancy_score <= 60) {
    return "Critical";
  }

  if (corridor.congestion_score >= 70 || corridor.redundancy_score <= 70) {
    return "High";
  }

  if (corridor.congestion_score >= 50) {
    return "Moderate";
  }

  return "Low";
}

function getCorridorImpactRegions(corridor?: { regional_dependency: string; from: string; to: string }) {
  if (!corridor) {
    return ["Global"];
  }

  const dependencyMap: Record<string, string[]> = {
    "Europe-Asia": ["Europe", "Asia Pacific"],
    "Europe-North America": ["Europe", "North America"],
    "Asia-Pacific": ["Asia Pacific", "North America"],
    "Middle East-Europe": ["Middle East", "Europe"],
    Europe: ["Europe"],
    Atlantic: ["Europe", "North America"],
    "Europe-Middle East": ["Europe", "Middle East"],
    "Middle East-Asia": ["Middle East", "Asia Pacific"],
    "Asia-Africa": ["Asia Pacific", "Africa"],
    Global: ["Europe", "North America", "Asia Pacific"],
  };

  return dependencyMap[corridor.regional_dependency] ?? [corridor.from, corridor.to];
}

function buildAlternativePaths(routeName: string, backupRoute?: { from: string; to: string } | null) {
  if (backupRoute) {
    return [
      { route: `${backupRoute.from} → ${backupRoute.to}`, status: "rerouted" },
      { route: `${backupRoute.from} → Dubai → ${backupRoute.to}`, status: "degraded" },
    ];
  }

  switch (routeName) {
    case "London ↔ New York":
      return [
        { route: "London → Frankfurt → Dubai → Singapore → New York", status: "rerouted" },
        { route: "London → Frankfurt → New York", status: "degraded" },
      ];
    case "Frankfurt ↔ Singapore":
      return [
        { route: "Frankfurt → Dubai → Singapore", status: "rerouted" },
        { route: "Frankfurt → London → New York → Singapore", status: "degraded" },
      ];
    case "London ↔ Frankfurt":
      return [
        { route: "London → New York → Frankfurt", status: "rerouted" },
        { route: "London → Dubai → Frankfurt", status: "degraded" },
      ];
    case "New York ↔ Singapore":
      return [
        { route: "New York → London → Frankfurt → Dubai → Singapore", status: "rerouted" },
        { route: "New York → London → Singapore", status: "degraded" },
      ];
    case "Indian Ocean Transit":
      return [
        { route: "Singapore → Dubai → Frankfurt → London", status: "rerouted" },
        { route: "Johannesburg → London → Singapore", status: "degraded" },
      ];
    default:
      return [
        { route: `${routeName} alternate path`, status: "rerouted" },
        { route: `${routeName} fallback path`, status: "degraded" },
      ];
  }
}

export default function Home() {
  const [summary, setSummary] = useState<Summary>(defaultSummary);
  const [topology, setTopology] = useState(defaultTopology);
  const [facilities, setFacilities] = useState<Facility[]>(defaultFacilities);
  const [operators, setOperators] = useState<Operator[]>(defaultOperators);
  const [pathConcentration, setPathConcentration] = useState<PathConcentration>(defaultPathConcentration);
  const [why, setWhy] = useState({ headline: "The internet is a shared operating system for the modern economy.", copy: ["When a single exchange or cable corridor is interrupted, the impact spreads beyond one city or region. Traffic reroutes across broader transit systems, driving congestion and delay in markets that depend on digital commerce and cloud access.", "This dashboard helps identify where internet infrastructure is concentrated, who owns the critical nodes, and which routes are most exposed to service disruption."] });
  const [simulation, setSimulation] = useState<SimulationResult>(defaultSimulation);
  const [filters, setFilters] = useState({ region: "All regions", operator: "All operators", ixp: "All IXPs" });
  const [mapFilters, setMapFilters] = useState({ region: "All regions", asn: "All ASNs", facility: "All facilities", capacity: "All capacities" });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleDownloadSampleData = async () => {
    const sampleData = {
      summary,
      topology,
      facilities,
      operators,
      pathConcentration,
      why,
      simulation,
      filters,
      mapFilters,
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "real-rails-sample-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryResponse, topologyResponse, facilityResponse, operatorsResponse, pathResponse, whyResponse] = await Promise.all([
          fetch(`${API_URL}/api/network/summary`),
          fetch(`${API_URL}/api/network/topology`),
          fetch(`${API_URL}/api/network/facilities`),
          fetch(`${API_URL}/api/network/operators`),
          fetch(`${API_URL}/api/network/path-concentration`),
          fetch(`${API_URL}/api/network/why-this-matters`),
        ]);

        if (summaryResponse.ok) {
          setSummary(await summaryResponse.json());
        }
        if (topologyResponse.ok) {
          setTopology(await topologyResponse.json());
        }
        if (facilityResponse.ok) {
          setFacilities(await facilityResponse.json());
        }
        if (operatorsResponse.ok) {
          setOperators(await operatorsResponse.json());
        }
        if (pathResponse.ok) {
          setPathConcentration(await pathResponse.json());
        }
        if (whyResponse.ok) {
          const whyData = await whyResponse.json();
          setWhy(whyData);
        }
      } catch (error) {
        console.error("Unable to load network telemetry:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const effectiveRegion = mapFilters.region === "All regions" ? filters.region : mapFilters.region;
      const regionMatches = effectiveRegion === "All regions" || facility.region === effectiveRegion;
      const operatorMatches = filters.operator === "All operators" || facility.operator === filters.operator;
      const ixpMatches = filters.ixp === "All IXPs" || topology.ixps.some((ixp) => ixp.name === filters.ixp && ixp.region === facility.region);
      const facilityMatches = mapFilters.facility === "All facilities" || facility.facility_name === mapFilters.facility;
      const capacityMatches = mapFilters.capacity === "All capacities" ||
        (mapFilters.capacity === "500 Gbps+" && facility.capacity >= 500) ||
        (mapFilters.capacity === "1000 Gbps+" && facility.capacity >= 1000) ||
        (mapFilters.capacity === "2000 Gbps+" && facility.capacity >= 2000);
      return regionMatches && operatorMatches && ixpMatches && facilityMatches && capacityMatches;
    });
  }, [facilities, filters, mapFilters, topology.ixps]);

  useEffect(() => {
    const loadSimulation = async () => {
      try {
        const params = new URLSearchParams({
          ixp: filters.ixp === "All IXPs" ? "London" : filters.ixp,
          facility: filteredFacilities[0]?.facility_name ?? "Equinix LD8",
          cable: "Frankfurt ↔ Singapore",
        });
        const response = await fetch(`${API_URL}/api/network/route-simulation?${params.toString()}`);
        if (response.ok) {
          const nextSimulation = await response.json();
          setSimulation(nextSimulation);
        }
      } catch (error) {
        console.error("Simulation error:", error);
      }
    };

    loadSimulation();
  }, []);

  const mapMarkers = useMemo(() => {
    return [
      ...topology.ixps.map((ixp) => ({ ...ixp, type: "IXP" as const, name: ixp.name })),
      ...topology.landing_stations.map((station) => ({ ...station, type: "Cable Landing" as const, name: station.name })),
      ...facilities.map((facility) => ({ ...facility, type: "Facility" as const, name: facility.facility_name })),
    ] as Array<{ id: string; name: string; type: "IXP" | "Cable Landing" | "Facility"; lat: number; lng: number; region?: string; capacity?: number; connected_networks?: number; members?: number }>;
  }, [facilities, topology.ixps, topology.landing_stations]);

  const selectedFacility = useMemo(() => {
      if (!simulation.selected_facility) return null;

      return (
          facilities.find(
              (facility) =>
                  facility.facility_name === simulation.selected_facility
          ) ?? null
      );
  }, [facilities, simulation.selected_facility]);

  const selectedCorridor = useMemo(
    () => topology.corridors.find((corridor) => corridor.name === simulation.selected_cable) ?? topology.corridors[0],
    [simulation.selected_cable, topology.corridors],
  );
  const backupRouteMap: Record<string, string> = {
    "London ↔ Frankfurt": "London ↔ New York",
    "London ↔ New York": "Frankfurt ↔ Dubai",
    "Frankfurt ↔ Dubai": "Dubai ↔ Singapore",
    "Dubai ↔ Singapore": "London ↔ Frankfurt",
    "Frankfurt ↔ Singapore": "Frankfurt ↔ Dubai",
    "New York ↔ Singapore": "London ↔ New York",
    "Indian Ocean Transit": "Dubai ↔ Singapore",
  };

  const failedCorridor = useMemo(
    () => topology.corridors.find((corridor) => corridor.name === simulation.failed_route) ?? null,
    [simulation.failed_route, topology.corridors],
  );

  const backupCorridor = useMemo(
    () => topology.corridors.find((corridor) => corridor.name === simulation.rerouted_route) ?? null,
    [simulation.rerouted_route, topology.corridors],
  );
  const simulateSelectedCorridorFailure = () => {
    if (!selectedCorridor) {
      return;
    }

  const riskLevel = getCorridorRiskLevel(selectedCorridor);
  const impactRegions = getCorridorImpactRegions(selectedCorridor);
  const trafficUtilization = clamp(
    selectedCorridor.congestion_score + 11,
    0,
    100
  );

  const backupRouteName = backupRouteMap[selectedCorridor.name];

  const backupRoute =
    topology.corridors.find(
      (route) => route.name === backupRouteName
    ) ?? null;

  setSimulation((prev) => ({
    ...prev,
    status: "rerouted",
    failed_route: selectedCorridor.name,
    rerouted_route: backupRoute ? backupRoute.name : undefined,
    affected_traffic: `${Math.round(selectedCorridor.capacity_gbps * 1.8)} Gbps`,
    impacted_regions: impactRegions,
    impacted_facilities: [
      selectedFacility?.facility_name ?? prev.selected_facility,
      "Telehouse North",
      "SIN-IX Core",
    ]
      .filter(Boolean)
      .slice(0, 3),
    recalculated_paths: buildAlternativePaths(selectedCorridor.name, backupRoute),
    metrics: {
      new_congestion: clamp(
        backupRoute ? backupRoute.congestion_score + 18 : trafficUtilization,
        0,
        100
      ),
      redundancy_drop: clamp(100 - selectedCorridor.redundancy_score, 0, 100),
      regional_impact: riskLevel,
      recovery_window_hours: selectedCorridor.capacity_gbps >= 500 ? 6 : 4,
    },
  }));

  setSummary((prev) => ({
    ...prev,
    active_links: Math.max(0, prev.active_links - 1),
    peak_utilization_pct: clamp(
      prev.peak_utilization_pct + 8,
      0,
      100
    ),
    total_capacity_gbps: Math.max(
      0,
      prev.total_capacity_gbps - selectedCorridor.capacity_gbps
    ),
  }));
};

  const updateSimulationSelection = (field: "selected_ixp" | "selected_facility" | "selected_cable", value: string) => {
    setSimulation(prev => ({
        ...prev,
        [field]: value,
        ...(field === "selected_cable" ? { failed_route: undefined, rerouted_route: undefined, status: "degraded" } : {}),
    }));

    if (field === "selected_ixp") {
      setFilters((prev) => ({ ...prev, ixp: value }));
    }

    if (field === "selected_facility") {
      setMapFilters((prev) => ({ ...prev, facility: value }));
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-[#030712] m-0 p-0">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937] bg-[#0B1117] shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-semibold text-slate-100">
              Real Rails Intelligence Library - Internet Backbone & IXP Map
            </h1>
            <p className="text-[11px] text-slate-500">Global infrastructure routing & connectivity insights</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400">
            Peak <span className="text-[#38BDF8] font-semibold">{summary.peak_utilization_pct}%</span>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-[#1F2937]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400">100% Connected</span>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex h-7 w-7 items-center justify-center rounded border border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/20 ml-1"
              title="Toggle Intelligence Sidebar"
            >
              i
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-row w-full h-[calc(100vh-73px)] overflow-hidden">
        <section className={`h-full flex flex-col border-r border-[#1F2937] bg-[#030712] overflow-y-auto transition-all ${isSidebarOpen ? "w-[70%]" : "w-full"}`}>
          <div className="p-4 grid grid-cols-4 gap-4 shrink-0">
            <article className="bg-[#0B1117] border border-[#1F2937] rounded-lg p-3 flex flex-col">
              <span className="text-xs text-slate-400 font-medium">Backbone nodes</span>
              <strong className="text-lg font-bold text-slate-100 mt-1">{summary.backbone_nodes}</strong>
            </article>
            <article className="bg-[#0B1117] border border-[#1F2937] rounded-lg p-3 flex flex-col">
              <span className="text-xs text-slate-400 font-medium">IXP sites</span>
              <strong className="text-lg font-bold text-slate-100 mt-1">{summary.ixp_sites}</strong>
            </article>
            <article className="bg-[#0B1117] border border-[#1F2937] rounded-lg p-3 flex flex-col">
              <span className="text-xs text-slate-400 font-medium">Regions</span>
              <strong className="text-lg font-bold text-slate-100 mt-1">{summary.regions}</strong>
            </article>
            <article className="bg-[#0B1117] border border-[#1F2937] rounded-lg p-3 flex flex-col">
              <span className="text-xs text-slate-400 font-medium">Total capacity</span>
              <strong className="text-lg font-bold text-slate-100 mt-1">{summary.total_capacity_gbps} Gbps</strong>
            </article>
          </div>

          <div className="px-4 flex-1 flex flex-col min-h-[450px]">
            <div className="bg-[#0B1117] border border-[#1F2937] rounded-lg flex-1 flex flex-col overflow-hidden relative">
              <MapView
                topology={topology}
                facilities={facilities}
                simulation={simulation}
                setSimulation={setSimulation}
                filters={filters}
                setFilters={setFilters}
                mapFilters={mapFilters}
                setMapFilters={setMapFilters}
                pathConcentration={pathConcentration}
              />
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-[#0B1117] border border-[#1F2937] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-200">Facility cards</h2>
                <span className="text-xs text-[#38BDF8]">{filteredFacilities.length} active</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {filteredFacilities.slice(0, 4).map((facility) => (
                  <article
                    key={facility.id}
                    className={`bg-[#030712] border border-[#1F2937] rounded p-3 flex flex-col gap-2 ${
                      filteredFacilities.length === 1 ? "col-span-2" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-semibold text-slate-200 truncate">
                        {facility.facility_name}
                      </strong>
                      <span className="text-[10px] text-slate-400">
                        {facility.country}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Operator</span>
                        <span className="text-slate-300 truncate block">
                          {facility.operator}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Networks</span>
                        <span className="text-slate-300 block">
                          {facility.connected_networks}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Capacity</span>
                        <span className="text-slate-300 block">
                          {facility.capacity} Gbps
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Score</span>
                        <span className="text-slate-300 block">
                          {facility.importance_score}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="bg-[#0B1117] border border-[#1F2937] rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-200">Path concentration</h2>
              </div>
              <div className="flex flex-col gap-2.5 flex-1 justify-center">
                {pathConcentration.most_critical.map((item) => (
                  <div key={item.name} className="bg-[#030712] border border-[#1F2937] rounded p-2.5 flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-semibold text-slate-200 block">{item.name}</strong>
                      <small className="text-[10px] text-slate-400">{item.regional_dependency}</small>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-400 block">{item.congestion_score}%</span>
                        <small className="text-[9px] text-slate-500">Congestion</small>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#38BDF8] block">{item.redundancy_score}%</span>
                        <small className="text-[9px] text-slate-500">Redundancy</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-[#0B1117] border border-[#1F2937] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-200">Route failure simulation</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{simulation.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-slate-400">IXP</span>
                  <select className="bg-[#030712] border border-[#1F2937] rounded p-1 text-slate-200 text-xs" value={simulation.selected_ixp} onChange={(event) => updateSimulationSelection("selected_ixp", event.target.value)}>
                    {topology.ixps.map((ixp) => (
                      <option key={ixp.id} value={ixp.name}>{ixp.name}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-slate-400">Facility</span>
                  <select className="bg-[#030712] border border-[#1F2937] rounded p-1 text-slate-200 text-xs" value={simulation.selected_facility} onChange={(event) => updateSimulationSelection("selected_facility", event.target.value)}>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.facility_name}>{facility.facility_name}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-slate-400">Cable</span>
                  <select className="bg-[#030712] border border-[#1F2937] rounded p-1 text-slate-200 text-xs" value={simulation.selected_cable} onChange={(event) => updateSimulationSelection("selected_cable", event.target.value)}>
                    {topology.corridors.map((corridor) => (
                      <option key={corridor.id} value={corridor.name}>{corridor.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="bg-[#030712] border border-[#1F2937] rounded p-2.5 flex items-center justify-between text-xs mb-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">Affected traffic</span>
                  <strong className="text-slate-200 font-semibold">{simulation.affected_traffic}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Impacted regions</span>
                  <strong className="text-slate-200 font-semibold">{simulation.impacted_regions.join(", ")}</strong>
                </div>
              </div>
              <ul className="flex flex-col gap-1.5">
                {simulation.recalculated_paths.map((path) => (
                  <li key={path.route} className="bg-[#030712]/50 border border-[#1F2937]/50 rounded px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{path.route}</span>
                    <em className="text-amber-400 not-italic font-medium">{path.status}</em>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0B1117] border border-[#1F2937] rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-200">Who controls the rail</h2>
              </div>
              <ul className="flex flex-col gap-2 flex-1 justify-center">
                {operators.map((operator) => (
                  <li key={operator.name} className="bg-[#030712] border border-[#1F2937] rounded p-2 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-200 font-semibold block">{operator.name}</strong>
                      <small className="text-[10px] text-slate-400">{operator.ownership}</small>
                    </div>
                    <span className="text-[11px] font-medium text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">{operator.influence}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {isSidebarOpen && (
          <aside className="w-[30%] h-full bg-[#0B1117] border-l border-[#1F2937] flex flex-col overflow-y-auto p-4 gap-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#38BDF8] font-semibold">Intelligence Controls</span>
                <h2 className="text-sm font-semibold text-slate-200 mt-1">Filters & Context</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded transition"
                title="Close drawer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#030712] border border-[#1F2937] rounded-lg p-4">
              <h3 className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider mb-3">Key Metrics</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Active links</span>
                  <strong className="text-sm font-bold text-slate-100">{summary.active_links}</strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Traffic</span>
                  <strong className="text-sm font-bold text-slate-100">{simulation.affected_traffic}</strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Risk</span>
                  <strong className="text-sm font-bold text-amber-400">{simulation.metrics.regional_impact}</strong>
                </div>
              </div>
            </div>

            <div className="bg-[#030712] border border-[#1F2937] rounded-lg p-4 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Selected IXP</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-slate-100">Active Route:</strong>{" "}
                {simulation.selected_ixp || "--"} 
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Facility</span>
                  <strong className="text-slate-200 truncate block">
                    {selectedFacility?.facility_name || simulation.selected_facility || "--"}
                  </strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Capacity</span>
                  <strong className="text-slate-200 block">{selectedFacility?.capacity ?? 2400} Gbps</strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Connected networks</span>
                  <strong className="text-slate-200 block">{selectedFacility?.connected_networks ?? 118}</strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Importance score</span>
                  <strong className="text-slate-200 block">{selectedFacility?.importance_score ?? 98}</strong>
                </div>
              </div>
            </div>

            <div className="bg-[#030712] border border-[#1F2937] rounded-lg p-4 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Selected Corridor</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-slate-100">{selectedCorridor?.name ?? simulation.selected_cable}</strong> is the active backbone route in the intelligence layer.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Source</span>
                  <strong className="text-slate-200 truncate block">{selectedCorridor?.from ?? "Unknown"}</strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Destination</span>
                  <strong className="text-slate-200 truncate block">{selectedCorridor?.to ?? "Unknown"}</strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Capacity</span>
                  <strong className="text-slate-200 block">{selectedCorridor?.capacity_gbps ?? 0} Gbps</strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Traffic utilization</span>
                  <strong className="text-slate-200 block">{selectedCorridor ? clamp(selectedCorridor.congestion_score + 11, 0, 100) : 0}%</strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Risk level</span>
                  <strong className="text-amber-400 block">{getCorridorRiskLevel(selectedCorridor)}</strong>
                </div>
                <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                  <span className="text-[10px] text-slate-400 block">Regional dependency</span>
                  <strong className="text-slate-200 truncate block">{selectedCorridor?.regional_dependency ?? "Unknown"}</strong>
                </div>
              </div>
              <button type="button" className="w-full mt-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold py-2 rounded transition-colors" onClick={simulateSelectedCorridorFailure}>
                Simulate Failure
              </button>
            </div>

            {simulation.failed_route && (
              <div className="bg-[#030712] border border-red-500/30 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Route Failure Active</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">FAILED</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="bg-[#0B1117] border border-red-500/20 rounded p-2">
                    <span className="text-[10px] text-slate-400 block">Failed Corridor</span>
                    <strong className="text-red-400 block">{failedCorridor?.name ?? simulation.failed_route}</strong>
                    <span className="text-[10px] text-slate-500">{failedCorridor?.from} → {failedCorridor?.to}</span>
                  </div>
                  <div className="bg-[#0B1117] border border-emerald-500/20 rounded p-2">
                    <span className="text-[10px] text-slate-400 block">Backup Corridor</span>
                    <strong className="text-emerald-400 block">{backupCorridor?.name ?? simulation.rerouted_route ?? "No backup available"}</strong>
                    {backupCorridor && (
                      <span className="text-[10px] text-slate-500">{backupCorridor.from} → {backupCorridor.to}</span>
                    )}
                  </div>
                  <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2">
                    <span className="text-[10px] text-slate-400 block">Traffic rerouted via</span>
                    <strong className="text-slate-200 block">
                      {backupCorridor
                        ? `${backupCorridor.from} → ${backupCorridor.to} (${backupCorridor.name})`
                        : simulation.recalculated_paths[0]?.route ?? "Alternate path"}
                    </strong>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2 text-center">
                      <span className="text-[10px] text-slate-400 block">Congestion</span>
                      <strong className="text-amber-400 block">{simulation.metrics.new_congestion}%</strong>
                    </div>
                    <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2 text-center">
                      <span className="text-[10px] text-slate-400 block">Redundancy</span>
                      <strong className="text-[#38BDF8] block">-{simulation.metrics.redundancy_drop}%</strong>
                    </div>
                    <div className="bg-[#0B1117] border border-[#1F2937] rounded p-2 text-center">
                      <span className="text-[10px] text-slate-400 block">Recovery</span>
                      <strong className="text-slate-200 block">{simulation.metrics.recovery_window_hours}h</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#030712] border border-[#1F2937] rounded-lg p-4 flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Why This Matters</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{why.copy[0]}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{why.copy[1]}</p>
            </div>

            <div className="bg-[#030712] border border-[#1F2937] rounded-lg p-4 flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">Who Controls the Rail</h3>
              <ul className="flex flex-col gap-1.5">
                {operators.slice(0, 6).map((operator) => (
                  <li key={operator.name} className="flex items-center justify-between text-xs py-1 border-b border-[#1F2937]/50 last:border-0">
                    <strong className="text-slate-200">{operator.name}</strong>
                    <span className="text-slate-400 text-[11px]">{operator.influence}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#030712] border border-[#1F2937] rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Functional Filters
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Region
                  </label>
                  <select
                    className="w-full h-10 rounded-lg bg-[#0B1117] border border-[#1F2937] px-3 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                    value={filters.region}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        region: event.target.value,
                      }))
                    }
                  >
                    <option value="All regions">All Regions</option>
                    {topology.regions.map((region) => (
                      <option key={region.name} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Operator
                  </label>
                  <select
                    className="w-full h-10 rounded-lg bg-[#0B1117] border border-[#1F2937] px-3 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                    value={filters.operator}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        operator: event.target.value,
                      }))
                    }
                  >
                    <option value="All operators">All Operators</option>
                    {operators.map((operator) => (
                      <option key={operator.name} value={operator.name}>
                        {operator.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Internet Exchange Point (IXP)
                  </label>
                  <select
                    className="w-full h-10 rounded-lg bg-[#0B1117] border border-[#1F2937] px-3 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                    value={filters.ixp}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        ixp: event.target.value,
                      }))
                    }
                  >
                    <option value="All IXPs">All IXPs</option>
                    {topology.ixps.map((ixp) => (
                      <option key={ixp.id} value={ixp.name}>
                        {ixp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="button" className="w-full bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-semibold py-2.5 rounded transition-colors" onClick={handleDownloadSampleData}>
              Download Sample Data
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}