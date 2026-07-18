"""Sidecar de deteccao de comunidades.

Recebe as arestas do grafo de proximidade dos alambiques e devolve a
particao em comunidades calculada pelo HP-MOCD (pymocd).
"""
import sys

import networkx as nx
from flask import Flask, jsonify, request
from pymocd import HpMocd

app = Flask(__name__)


def detect(edges: list) -> dict:
    # ponytail: pymocd espera nos inteiros; mapeia id <-> indice e volta
    ids = sorted({str(n) for e in edges for n in e[:2]})
    idx = {n: i for i, n in enumerate(ids)}
    graph = nx.Graph()
    graph.add_nodes_from(range(len(ids)))
    graph.add_edges_from((idx[str(a)], idx[str(b)]) for a, b, *_ in edges)
    solution = HpMocd(graph).run()
    return {ids[node]: int(comm) for node, comm in solution.items()}


@app.post("/communities")
def communities():
    edges = (request.get_json(silent=True) or {}).get("edges", [])
    if not isinstance(edges, list) or len(edges) < 1:
        return jsonify({"error": "informe 'edges' como lista de pares de ids"}), 400
    return jsonify({"algorithm": "HP-MOCD", "communities": detect(edges)})


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        # dois triangulos ligados por uma unica aresta -> duas comunidades
        result = detect([["a", "b"], ["b", "c"], ["a", "c"],
                         ["x", "y"], ["y", "z"], ["x", "z"], ["c", "x"]])
        assert result["a"] == result["b"] == result["c"], result
        assert result["x"] == result["y"] == result["z"], result
        assert result["a"] != result["x"], result
        print("selftest ok:", result)
    else:
        app.run(host="0.0.0.0", port=5000)
