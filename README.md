# Internet Backbone & IXP Map

Real Rails Intelligence Library

**POC 40 — Phase 2: Local Docker Deployment**

## Overview

An interactive map for exploring global internet backbone infrastructure, Internet Exchange Points (IXPs), network facilities, connectivity corridors, and route simulations.

This Phase 2 version adds Docker containerization to make local setup and execution repeatable.

## Technology Stack

- **Frontend:** Next.js, React, TypeScript, React Leaflet
- **Backend:** Python, FastAPI, Uvicorn
- **Containerization:** Docker, Docker Compose

## Prerequisites

- Docker Desktop installed and running
- Docker Compose available through the Docker CLI

## Run with Docker

From the project root, build and start the application:

```bash
docker compose up --build
```

Access the application at:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API documentation:** http://localhost:8000/docs

The frontend and backend run in separate containers connected through Docker Compose.

## Common Commands

Start the application in the background:

```bash
docker compose up -d
```

Rebuild and restart after frontend changes:

```bash
docker compose up -d --build frontend
```

Rebuild the backend:

```bash
docker compose up -d --build backend
```

View running containers:

```bash
docker compose ps
```

View application logs:

```bash
docker compose logs -f
```

Stop and remove the containers:

```bash
docker compose down
```

## Environment Configuration

The frontend API URL is configured through `NEXT_PUBLIC_API_URL` during the Next.js image build.

The current local Docker configuration uses:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This address is intended for browser requests from the host machine. Other deployment environments may require a different API URL.

Do not commit secrets, passwords, or production credentials. Use the example environment files for documenting required configuration.

## Troubleshooting

### Docker engine connection error

Make sure Docker Desktop is running, then retry the Docker Compose command.

### Dependency download timeout

Retry the build. The backend Dockerfile configures a longer pip timeout and additional download retries.

### Frontend changes are not visible

Rebuild the frontend image:

```bash
docker compose up -d --build frontend
```

Refresh the browser. If necessary, perform a hard refresh.

### Inspect service logs

```bash
docker compose logs backend
docker compose logs frontend
```

## Phase 2 Validation

Verify the following before proceeding to cloud deployment:

- [ ] Frontend container builds and starts.
- [ ] Backend container builds and starts.
- [ ] Frontend and backend endpoints respond.
- [ ] Map data, filters, and route simulation work.
- [ ] Containers restart successfully.
- [ ] Setup commands and troubleshooting steps are documented.

## Deployment Scope

This repository is the separate Phase 2 copy used for Docker and deployment preparation. The approved Phase 1 repository remains unchanged.

Azure Container Apps deployment, Selenium validation, and production publishing should begin only after the local Docker environment has been fully validated.

