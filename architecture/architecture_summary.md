# Architecture Summary

## Project

**Internet Backbone & IXP Map**

---

## Overview

The Internet Backbone & IXP Map is an interactive network intelligence dashboard that visualizes global Internet infrastructure, including Internet Exchange Points (IXPs), data center facilities, and backbone corridors. It enables users to explore connectivity, inspect facilities, and simulate route failures to understand the impact on network traffic.

---

## High-Level Architecture

```
+-----------------------------+
|         User Browser        |
+-------------+---------------+
              |
              v
+-----------------------------+
|     Next.js + React UI      |
|                             |
| - Dashboard                 |
| - React Components          |
| - React Leaflet Map         |
| - Filters                   |
| - Route Simulation          |
+-------------+---------------+
              |
              |
      REST API Calls
              |
              v
+-----------------------------+
|      FastAPI Backend        |
|                             |
| - API Endpoints             |
| - Network Topology Data     |
| - Simulation Logic          |
+-------------+---------------+
              |
              v
+-----------------------------+
|      Sample Dataset         |
|                             |
| - Regions                   |
| - IXPs                      |
| - Facilities                |
| - Backbone Corridors        |
+-----------------------------+
```

---

## Frontend

- Next.js
- React
- TypeScript
- React Leaflet
- Tailwind CSS

Responsibilities:

- Render the interactive world map
- Display facilities and IXPs
- Display backbone corridors
- Apply filters
- Simulate route failures
- Display network metrics

---

## Backend

- FastAPI
- Python

Responsibilities:

- Serve topology data
- Provide corridor information
- Supply simulation data
- Expose REST API endpoints

---

## Core Features

- Interactive global map
- Facility visualization
- IXP visualization
- Backbone corridor visualization
- Route selection
- Route failure simulation
- Alternative route visualization
- Network statistics dashboard
- Interactive filters

---

## Data Flow

1. User opens the application.
2. Frontend requests topology data from the FastAPI backend.
3. Backend returns regions, facilities, IXPs, and corridors.
4. Frontend renders the map and dashboard.
5. User interactions update the dashboard and route visualization.
6. Route failure simulation recalculates and displays alternative paths.

---

## Conclusion

The application demonstrates a modular full-stack architecture with a React-based frontend and a FastAPI backend, providing an interactive visualization of Internet backbone infrastructure and simulated network resilience.