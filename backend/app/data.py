from __future__ import annotations
from app.network_graph import NetworkGraph

NETWORK_DATASET = {
    "summary": {
        "backbone_nodes": 23,
        "ixp_sites": 23,
        "regions": 6,
        "total_capacity_gbps": 14850,
        "active_links": 33,
        "peak_utilization_pct": 84,
    },
    "regions": [
        {"name": "Europe", "nodes": 7, "traffic_index": 94, "dependency": "High"},
        {"name": "North America", "nodes": 5, "traffic_index": 91, "dependency": "High"},
        {"name": "Asia Pacific", "nodes": 7, "traffic_index": 88, "dependency": "Moderate"},
        {"name": "Middle East", "nodes": 1, "traffic_index": 76, "dependency": "Moderate"},
        {"name": "Africa", "nodes": 2, "traffic_index": 69, "dependency": "Elevated"},
        {"name": "South America", "nodes": 1, "traffic_index": 72, "dependency": "Moderate"},
    ],
    "asns": [
        {"asn": 3356, "name": "Level 3", "region": "Global", "role": "Transit"},
        {"asn": 1299, "name": "Arelion", "region": "Europe", "role": "Carrier"},
        {"asn": 6939, "name": "Hurricane Electric", "region": "North America", "role": "Carrier"},
        {"asn": 15169, "name": "Google", "region": "Global", "role": "Hyperscale"},
        {"asn": 13335, "name": "Cloudflare", "region": "Global", "role": "Edge"},
        {"asn": 6453, "name": "Tata Communications", "region": "Global", "role": "Backbone"},
    ],
    "operators": [
        {"name": "Equinix", "ownership": "Carrier-neutral colocation", "influence": "High"},
        {"name": "Digital Realty", "ownership": "Wholesale data center operator", "influence": "High"},
        {"name": "Google", "ownership": "Hyperscale infrastructure", "influence": "Very High"},
        {"name": "Cloudflare", "ownership": "Edge delivery network", "influence": "High"},
        {"name": "LINX", "ownership": "Internet exchange operator", "influence": "Medium"},
        {"name": "AMS-IX", "ownership": "Regional exchange hub", "influence": "Medium"},
        {"name": "DE-CIX", "ownership": "Global exchange provider", "influence": "High"},
        {"name": "NTT", "ownership": "Global telecom backbone", "influence": "High"},
    ],
    "ixps": [
        {"id": "IXP-101", "name": "London", "country": "United Kingdom", "region": "Europe", "lat": 51.5074, "lng": -0.1278, "members": 220},
        {"id": "IXP-102", "name": "Frankfurt", "country": "Germany", "region": "Europe", "lat": 50.1109, "lng": 8.6821, "members": 190},
        {"id": "IXP-103", "name": "Amsterdam", "country": "Netherlands", "region": "Europe", "lat": 52.3676, "lng": 4.9041, "members": 175},
        {"id": "IXP-104", "name": "Paris", "country": "France", "region": "Europe", "lat": 48.8566, "lng": 2.3522, "members": 165},
        {"id": "IXP-105", "name": "Madrid", "country": "Spain", "region": "Europe", "lat": 40.4168, "lng": -3.7038, "members": 120},
        {"id": "IXP-106", "name": "Milan", "country": "Italy", "region": "Europe", "lat": 45.4642, "lng": 9.1900, "members": 110},
        {"id": "IXP-107", "name": "Dublin", "country": "Ireland", "region": "Europe", "lat": 53.3498, "lng": -6.2603, "members": 95},
        {"id": "IXP-201", "name": "New York", "country": "United States", "region": "North America", "lat": 40.7128, "lng": -74.0060, "members": 260},
        {"id": "IXP-202", "name": "Chicago", "country": "United States", "region": "North America", "lat": 41.8781, "lng": -87.6298, "members": 180},
        {"id": "IXP-203", "name": "Los Angeles", "country": "United States", "region": "North America", "lat": 34.0522, "lng": -118.2437, "members": 200},
        {"id": "IXP-204", "name": "San Jose", "country": "United States", "region": "North America", "lat": 37.3382, "lng": -121.8863, "members": 185},
        {"id": "IXP-205", "name": "Toronto", "country": "Canada", "region": "North America", "lat": 43.6532, "lng": -79.3832, "members": 140},
        {"id": "IXP-301", "name": "Singapore", "country": "Singapore", "region": "Asia Pacific", "lat": 1.3521, "lng": 103.8198, "members": 210},
        {"id": "IXP-302", "name": "Tokyo", "country": "Japan", "region": "Asia Pacific", "lat": 35.6762, "lng": 139.6503, "members": 195},
        {"id": "IXP-303", "name": "Hong Kong", "country": "Hong Kong", "region": "Asia Pacific", "lat": 22.3193, "lng": 114.1694, "members": 170},
        {"id": "IXP-304", "name": "Seoul", "country": "South Korea", "region": "Asia Pacific", "lat": 37.5665, "lng": 126.9780, "members": 155},
        {"id": "IXP-305", "name": "Mumbai", "country": "India", "region": "Asia Pacific", "lat": 19.0760, "lng": 72.8777, "members": 145},
        {"id": "IXP-306", "name": "Chennai", "country": "India", "region": "Asia Pacific", "lat": 13.0827, "lng": 80.2707, "members": 105},
        {"id": "IXP-307", "name": "Sydney", "country": "Australia", "region": "Asia Pacific", "lat": -33.8688, "lng": 151.2093, "members": 130},
        {"id": "IXP-401", "name": "Dubai", "country": "United Arab Emirates", "region": "Middle East", "lat": 25.2048, "lng": 55.2708, "members": 160},
        {"id": "IXP-501", "name": "Johannesburg", "country": "South Africa", "region": "Africa", "lat": -26.2041, "lng": 28.0473, "members": 130},
        {"id": "IXP-502", "name": "Nairobi", "country": "Kenya", "region": "Africa", "lat": -1.2921, "lng": 36.8219, "members": 85},
        {"id": "IXP-601", "name": "São Paulo", "country": "Brazil", "region": "South America", "lat": -23.5505, "lng": -46.6333, "members": 115},
    ],
    "facilities": [
        {"id": "FAC-01", "facility_name": "Equinix LD8", "country": "United Kingdom", "region": "Europe", "operator": "Equinix", "connected_networks": 118, "capacity": 2400, "importance_score": 98, "lat": 51.5201, "lng": -0.1234},
        {"id": "FAC-02", "facility_name": "Telehouse North", "country": "United Kingdom", "region": "Europe", "operator": "Digital Realty", "connected_networks": 94, "capacity": 1800, "importance_score": 92, "lat": 51.527, "lng": -0.074},
        {"id": "FAC-03", "facility_name": "MDC NYC", "country": "United States", "region": "North America", "operator": "Digital Realty", "connected_networks": 141, "capacity": 2800, "importance_score": 96, "lat": 40.7359, "lng": -74.0037},
        {"id": "FAC-04", "facility_name": "Google DC 1", "country": "United States", "region": "North America", "operator": "Google", "connected_networks": 104, "capacity": 3150, "importance_score": 95, "lat": 37.7749, "lng": -122.4194},
        {"id": "FAC-05", "facility_name": "JINX Data Hub", "country": "South Africa", "region": "Africa", "operator": "NTT", "connected_networks": 52, "capacity": 1100, "importance_score": 77, "lat": -26.12, "lng": 28.03},
        {"id": "FAC-06", "facility_name": "SIN-IX Core", "country": "Singapore", "region": "Asia Pacific", "operator": "LINX", "connected_networks": 96, "capacity": 2200, "importance_score": 91, "lat": 1.289, "lng": 103.851},
    ],
    "landing_stations": [
        {"id": "LS-01", "name": "Bude Landing Station", "country": "United Kingdom", "region": "Europe", "lat": 50.8333, "lng": -4.55},
        {"id": "LS-02", "name": "Virginia Beach Landing", "country": "United States", "region": "North America", "lat": 36.8528, "lng": -75.978},
        {"id": "LS-03", "name": "Mumbai Landing Station", "country": "India", "region": "Asia Pacific", "lat": 19.076, "lng": 72.8777},
    ],
    "corridors": [
        {
            "id": "C-101",
            "name": "London ↔ Frankfurt",
            "from": "London",
            "to": "Frankfurt",
            "capacity_gbps": 480,
            "congestion_score": 76,
            "regional_dependency": "Europe",
            "redundancy_score": 68,
        },
        {
            "id": "C-106",
            "name": "Indian Ocean Transit",
            "from": "Singapore",
            "to": "Johannesburg",
            "capacity_gbps": 410,
            "congestion_score": 67,
            "regional_dependency": "Asia-Africa",
            "redundancy_score": 73,
        },
            {
            "id": "C-102",
            "name": "London ↔ New York",
            "from": "London",
            "to": "New York",
            "capacity_gbps": 430,
            "congestion_score": 71,
            "regional_dependency": "Atlantic",
            "redundancy_score": 74,
        },
        {
            "id": "C-103",
            "name": "Frankfurt ↔ Singapore",
            "from": "Frankfurt",
            "to": "Singapore",
            "capacity_gbps": 520,
            "congestion_score": 82,
            "regional_dependency": "Europe-Middle East",
            "redundancy_score": 62,
        },
        {
            "id": "C-105",
            "name": "New York ↔ Singapore",
            "from": "New York",
            "to": "Singapore",
            "capacity_gbps": 500,
            "congestion_score": 75,
            "regional_dependency": "Global",
            "redundancy_score": 65,
        },
        {
            "id": "C-104",
            "name": "Frankfurt ↔ Dubai",
            "from": "Frankfurt",
            "to": "Dubai",
            "capacity_gbps": 380,
            "congestion_score": 69,
            "regional_dependency": "Europe-Middle East",
            "redundancy_score": 71,
        },
        {
            "id": "C-107",
            "name": "Dubai ↔ Singapore",
            "from": "Dubai",
            "to": "Singapore",
            "capacity_gbps": 440,
            "congestion_score": 73,
            "regional_dependency": "Middle East-Asia",
            "redundancy_score": 66,
        },
        {
            "id": "C-108",
            "name": "Dubai ↔ Mumbai",
            "from": "Dubai",
            "to": "Mumbai",
            "capacity_gbps": 420,
            "congestion_score": 66,
            "regional_dependency": "Middle East-Asia",
            "redundancy_score": 74,
        },
        {
            "id": "C-109",
            "name": "Mumbai ↔ Singapore",
            "from": "Mumbai",
            "to": "Singapore",
            "capacity_gbps": 470,
            "congestion_score": 68,
            "regional_dependency": "Asia",
            "redundancy_score": 76,
        },
        {
            "id": "C-110",
            "name": "Singapore ↔ Tokyo",
            "from": "Singapore",
            "to": "Tokyo",
            "capacity_gbps": 610,
            "congestion_score": 71,
            "regional_dependency": "Asia-Pacific",
            "redundancy_score": 81,
        },
        {
            "id": "C-111",
            "name": "Tokyo ↔ San Jose",
            "from": "Tokyo",
            "to": "San Jose",
            "capacity_gbps": 760,
            "congestion_score": 79,
            "regional_dependency": "Pacific",
            "redundancy_score": 69,
        },
        {
            "id": "C-112",
            "name": "San Jose ↔ Los Angeles",
            "from": "San Jose",
            "to": "Los Angeles",
            "capacity_gbps": 540,
            "congestion_score": 61,
            "regional_dependency": "North America",
            "redundancy_score": 83,
        },
        {
            "id": "C-113",
            "name": "Los Angeles ↔ New York",
            "from": "Los Angeles",
            "to": "New York",
            "capacity_gbps": 690,
            "congestion_score": 73,
            "regional_dependency": "North America",
            "redundancy_score": 72,
        },
        {
            "id": "C-114",
            "name": "Johannesburg ↔ Dubai",
            "from": "Johannesburg",
            "to": "Dubai",
            "capacity_gbps": 360,
            "congestion_score": 64,
            "regional_dependency": "Africa-Middle East",
            "redundancy_score": 77,
        },
        {
            "id": "C-115",
            "name": "Johannesburg ↔ Mumbai",
            "from": "Johannesburg",
            "to": "Mumbai",
            "capacity_gbps": 350,
            "congestion_score": 62,
            "regional_dependency": "Africa-Asia",
            "redundancy_score": 79,
        },
        {
            "id": "C-116",
            "name": "Marseille ↔ Frankfurt",
            "from": "Marseille",
            "to": "Frankfurt",
            "capacity_gbps": 400,
            "congestion_score": 57,
            "regional_dependency": "Europe",
            "redundancy_score": 82,
        },
        {
            "id": "C-117",
            "name": "Marseille ↔ Dubai",
            "from": "Marseille",
            "to": "Dubai",
            "capacity_gbps": 410,
            "congestion_score": 69,
            "regional_dependency": "Europe-Middle East",
            "redundancy_score": 74,
        },
        {
            "id": "C-118",
            "name": "Singapore ↔ Sydney",
            "from": "Singapore",
            "to": "Sydney",
            "capacity_gbps": 530,
            "congestion_score": 65,
            "regional_dependency": "Asia-Pacific",
            "redundancy_score": 80,
        },
        {
            "id": "C-119",
            "name": "Sydney ↔ Tokyo",
            "from": "Sydney",
            "to": "Tokyo",
            "capacity_gbps": 460,
            "congestion_score": 60,
            "regional_dependency": "Pacific",
            "redundancy_score": 84,
        },
        {
            "id": "C-120",
            "name": "London ↔ Marseille",
            "from": "London",
            "to": "Marseille",
            "capacity_gbps": 390,
            "congestion_score": 56,
            "regional_dependency": "Europe",
            "redundancy_score": 86,
        },
        {
            "id": "C-121",
            "name": "Frankfurt ↔ Mumbai",
            "from": "Frankfurt",
            "to": "Mumbai",
            "capacity_gbps": 450,
            "congestion_score": 70,
            "regional_dependency": "Europe-Asia",
            "redundancy_score": 73,
        },
        {
            "id": "C-122",
            "name": "Dubai ↔ Tokyo",
            "from": "Dubai",
            "to": "Tokyo",
            "capacity_gbps": 520,
            "congestion_score": 72,
            "regional_dependency": "Middle East-Asia",
            "redundancy_score": 71,
        },
    ],
    "path_concentration": {
        "most_critical": [
            {"name": "Frankfurt ↔ Singapore", "congestion_score": 82, "regional_dependency": "High", "redundancy_score": 62},
            {"name": "London ↔ New York", "congestion_score": 75, "regional_dependency": "Medium", "redundancy_score": 74},
            {"name": "New York ↔ Singapore", "congestion_score": 88, "regional_dependency": "High", "redundancy_score": 58},
        ],
        "dependency_index": 7.4,
        "redundancy_rating": 71,
    },
    "backbone": [
        {"id": "LON-01", "name": "London Core", "region": "Europe", "capacity_gbps": 1200},
        {"id": "FRA-02", "name": "Frankfurt Transit", "region": "Europe", "capacity_gbps": 980},
        {"id": "JFK-03", "name": "New York Gateway", "region": "North America", "capacity_gbps": 1400},
        {"id": "SJC-04", "name": "San Jose Edge", "region": "North America", "capacity_gbps": 890},
        {"id": "DXB-05", "name": "Dubai Hub", "region": "Middle East", "capacity_gbps": 760},
        {"id": "SIN-06", "name": "Singapore Exchange", "region": "Asia Pacific", "capacity_gbps": 1100},
    ],
    "links": [
        {"from": "LON-01", "to": "FRA-02", "capacity_gbps": 480},
        {"from": "FRA-02", "to": "DXB-05", "capacity_gbps": 380},
        {"from": "DXB-05", "to": "SIN-06", "capacity_gbps": 440},
        {"from": "SIN-06", "to": "JFK-03", "capacity_gbps": 520},
        {"from": "JFK-03", "to": "SJC-04", "capacity_gbps": 360},
        {"from": "LON-01", "to": "JFK-03", "capacity_gbps": 430},
    ],
}


def get_network_dataset():
    return NETWORK_DATASET


def get_mock_route_simulation(ixp: str | None = None, facility: str | None = None, cable: str | None = None):
    ixp_name = (ixp or "London").strip()
    facility_name = (facility or "Equinix LD8").strip()
    cable_name = (cable or "SEA-ME-WE-3").strip()
    graph = NetworkGraph(
        NETWORK_DATASET["backbone"],
        NETWORK_DATASET["links"],
    )

    failed_map = {
        "SEA-ME-WE-3": ("FRA-02", "DXB-05"),
        "Atlantic Crossing": ("LON-01", "JFK-03"),
        "Pacific Transit": ("SIN-06", "JFK-03"),
        "Red Sea Link": ("FRA-02", "DXB-05"),
    }

    failed_edge = failed_map.get(cable_name, ("FRA-02", "DXB-05"))

    simulation = graph.simulate_failure(failed_edge)

    if simulation["route_available"]:
        route_status = "rerouted"
        affected_traffic = "420 Gbps"
        congestion = 72
        redundancy = 18
    else:
        route_status = "critical"
        affected_traffic = "1.4 Tbps"
        congestion = 94
        redundancy = 47

    return {
        "status": route_status,
        "selected_ixp": ixp_name,
        "selected_facility": facility_name,
        "selected_cable": cable_name,

        "affected_traffic": affected_traffic,

        "impacted_regions": [
            "Europe",
            "North America",
            "Asia Pacific",
        ],

        "impacted_facilities": [
            facility_name,
            "Telehouse North",
            "Google DC 1",
        ],

        "recalculated_paths": [
            {
                "route": " → ".join(simulation["original_path"])
                if simulation["original_path"]
                else "Unavailable",
                "status": "failed",
            },
            {
                "route": " → ".join(simulation["rerouted_path"])
                if simulation["rerouted_path"]
                else "No Alternative Route",
                "status": route_status,
            },
        ],

        "metrics": {
            "new_congestion": congestion,
            "redundancy_drop": redundancy,
            "regional_impact": (
                "Medium"
                if simulation["route_available"]
                else "Critical"
            ),
            "recovery_window_hours": (
                2
                if simulation["route_available"]
                else 8
            ),
        },
    }