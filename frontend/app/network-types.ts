export type Summary = {
  backbone_nodes: number;
  ixp_sites: number;
  regions: number;
  total_capacity_gbps: number;
  active_links: number;
  peak_utilization_pct: number;
};

export type Region = {
  name: string;
  nodes: number;
  traffic_index: number;
  dependency?: string;
};

export type BackboneNode = {
  id: string;
  name: string;
  region: string;
  capacity_gbps: number;
};

export type IxpSite = {
  id: string;
  name: string;
  country: string;
  region: string;
  members: number;
  lat: number;
  lng: number;
};

export type LandingStation = {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
};

export type Corridor = {
  id: string;
  name: string;
  from: string;
  to: string;
  capacity_gbps: number;
  congestion_score: number;
  regional_dependency: string;
  redundancy_score: number;
};

export type NetworkTopology = {
  regions: Region[];
  backbone: BackboneNode[];
  ixps: IxpSite[];
  landing_stations: LandingStation[];
  corridors: Corridor[];
  links: Array<{ from: string; to: string; capacity_gbps: number }>;
};

export type Facility = {
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

export type Operator = {
  name: string;
  ownership: string;
  influence: string;
};

export type PathConcentration = {
  most_critical: Array<{
    name: string;
    congestion_score: number;
    regional_dependency: string;
    redundancy_score: number;
  }>;
  dependency_index: number;
  redundancy_rating: number;
};

export type SimulationResult = {
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

export type NetworkFilters = {
  region: string;
  operator: string;
  ixp: string;
};

export type MapFilters = {
  region: string;
  asn: string;
  facility: string;
  capacity: string;
};

export type WhyThisMatters = {
  headline: string;
  copy: string[];
};
