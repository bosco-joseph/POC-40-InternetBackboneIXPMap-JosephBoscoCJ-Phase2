from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.adapters import load_network_data_adapter
from app.data import (
    get_network_dataset,
)

DATA_ADAPTER = load_network_data_adapter()
DATASET = DATA_ADAPTER.get_dataset() or get_network_dataset()

app = FastAPI(
    title="Internet Backbone & IXP Map API",
    version="0.1.0",
    description="Operational visibility for backbone transit performance and IXP connectivity.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "Internet Backbone & IXP Map",
        "status": "running",
        "description": "Real Rails Intelligence Library",
        "version": "0.1.0",
    }


@app.get("/api/network/summary")
def network_summary():
    summary = DATASET["summary"]
    return {
        "backbone_nodes": summary["backbone_nodes"],
        "ixp_sites": summary["ixp_sites"],
        "regions": summary["regions"],
        "total_capacity_gbps": summary["total_capacity_gbps"],
        "active_links": summary["active_links"],
        "peak_utilization_pct": summary["peak_utilization_pct"],
    }


@app.get("/api/network/topology")
def network_topology():
    return {
        "regions": DATASET["regions"],
        "backbone": DATASET["backbone"],
        "ixps": DATASET["ixps"],
        "links": DATASET["links"],
        "landing_stations": DATASET["landing_stations"],
        "corridors": DATASET["corridors"],
    }


@app.get("/api/network/facilities")
def network_facilities():
    return DATASET["facilities"]


@app.get("/api/network/asns")
def asn_index():
    return DATASET["asns"]


@app.get("/api/network/operators")
def operator_index():
    return DATASET["operators"]


@app.get("/api/network/path-concentration")
def path_concentration():
    return DATASET["path_concentration"]


@app.get("/api/network/filters")
def network_filters():
    return {
        "regions": [region["name"] for region in DATASET["regions"]],
        "operators": [operator["name"] for operator in DATASET["operators"]],
        "ixps": [ixp["name"] for ixp in DATASET["ixps"]],
    }


@app.get("/api/network/route-simulation")
def route_simulation(
    ixp: str | None = Query(default=None, alias="ixp"),
    facility: str | None = Query(default=None, alias="facility"),
    cable: str | None = Query(default=None, alias="cable"),
):
    return DATA_ADAPTER.get_route_simulation(ixp=ixp, facility=facility, cable=cable)


@app.get("/api/network/why-this-matters")
def why_this_matters():
    return {
        "headline": "The internet is a shared operating system for the modern economy.",
        "copy": [
            "When a single exchange or cable corridor is interrupted, the impact spreads beyond one city or region. Traffic reroutes across broader transit systems, driving congestion and delay in markets that depend on digital commerce and cloud access.",
            "This dashboard helps identify where internet infrastructure is concentrated, who owns the critical nodes, and which routes are most exposed to service disruption.",
        ],
    }


@app.get("/api/network/who-controls-the-rail")
def who_controls_the_rail():
    return {
        "summary": "A handful of operators control the majority of terrestrial and peering capacity behind global connectivity.",
        "operators": DATASET["operators"],
    }