from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Protocol

from app.data import NETWORK_DATASET, get_mock_route_simulation


class NetworkDataAdapter(Protocol):
    def get_dataset(self) -> dict:
        ...

    def get_route_simulation(
        self,
        *,
        ixp: str | None = None,
        facility: str | None = None,
        cable: str | None = None,
    ) -> dict:
        ...


class MockNetworkDataAdapter:
    def __init__(self, dataset: dict | None = None):
        self._dataset = dataset or NETWORK_DATASET

    def get_dataset(self) -> dict:
        return self._dataset

    def get_route_simulation(
        self,
        *,
        ixp: str | None = None,
        facility: str | None = None,
        cable: str | None = None,
    ) -> dict:
        return get_mock_route_simulation(ixp=ixp, facility=facility, cable=cable)


class FileNetworkDataAdapter(MockNetworkDataAdapter):
    def __init__(self, dataset_path: str | os.PathLike[str]):
        path = Path(dataset_path)
        with path.open("r", encoding="utf-8") as handle:
            dataset = json.load(handle)
        super().__init__(dataset)


def load_network_data_adapter() -> NetworkDataAdapter:
    dataset_path = os.getenv("REAL_RAILS_DATASET_PATH")
    if dataset_path:
        try:
            return FileNetworkDataAdapter(dataset_path)
        except (FileNotFoundError, OSError, json.JSONDecodeError):
            pass

    return MockNetworkDataAdapter()