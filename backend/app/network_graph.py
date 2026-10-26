from collections import defaultdict, deque
from copy import deepcopy


class NetworkGraph:
    def __init__(self, nodes, links):
        self.nodes = {node["id"]: node for node in nodes}
        self.original_links = deepcopy(links)

    def _build_graph(self, failed_edge=None):
        graph = defaultdict(list)

        for edge in self.original_links:
            a = edge["from"]
            b = edge["to"]

            if failed_edge:
                if (
                    (a == failed_edge[0] and b == failed_edge[1])
                    or (a == failed_edge[1] and b == failed_edge[0])
                ):
                    continue

            graph[a].append(b)
            graph[b].append(a)

        return graph

    def shortest_path(self, start, end, failed_edge=None):
        graph = self._build_graph(failed_edge)

        queue = deque([[start]])
        visited = {start}

        while queue:
            path = queue.popleft()
            node = path[-1]

            if node == end:
                return path

            for nxt in graph[node]:
                if nxt not in visited:
                    visited.add(nxt)
                    queue.append(path + [nxt])

        return None

    def simulate_failure(self, failed_edge):
        start = failed_edge[0]
        end = failed_edge[1]

        original = self.shortest_path(start, end)

        rerouted = self.shortest_path(
            start,
            end,
            failed_edge=failed_edge,
        )

        return {
            "failed_link": {
                "from": start,
                "to": end,
            },
            "original_path": original,
            "rerouted_path": rerouted,
            "route_available": rerouted is not None,
        }