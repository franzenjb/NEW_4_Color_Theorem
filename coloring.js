// Simple heuristic k-coloring: greedy with backtracking.
// adjacency: number[][] where adjacency[i][j] = 1 if edge exists, 0 otherwise
// k: number of colors allowed
export function colorGraphGreedyBacktrack(adjacency, k) {
  const n = adjacency.length;
  const colors = new Array(n).fill(-1);

  const order = vertexOrderByDegree(adjacency);

  function isSafe(v, c) {
    for (let u = 0; u < n; u++) {
      if (adjacency[v][u] && colors[u] === c) return false;
    }
    return true;
  }

  function greedyPrefill() {
    for (let i = 0; i < n; i++) {
      const v = order[i];
      const used = new Array(k).fill(false);
      for (let u = 0; u < n; u++) if (adjacency[v][u] && colors[u] !== -1) used[colors[u]] = true;
      const c = used.indexOf(false);
      colors[v] = c === -1 ? -1 : c;
    }
  }

  function backtrack(idx) {
    if (idx === n) return true;
    const v = order[idx];
    if (colors[v] !== -1) return backtrack(idx + 1);
    for (let c = 0; c < k; c++) {
      if (isSafe(v, c)) {
        colors[v] = c;
        if (backtrack(idx + 1)) return true;
        colors[v] = -1;
      }
    }
    return false;
  }

  greedyPrefill();
  for (let i = 0; i < n; i++) if (colors[order[i]] === -1) { backtrack(i); break; }
  // Replace any remaining -1 with 0 as fallback
  for (let i = 0; i < n; i++) if (colors[i] === -1) colors[i] = 0;
  return colors;
}

function vertexOrderByDegree(adjacency) {
  const n = adjacency.length;
  const degrees = Array.from({ length: n }, (_, v) => ({ v, d: degreeOf(adjacency, v) }));
  degrees.sort((a, b) => b.d - a.d);
  return degrees.map(x => x.v);
}

function degreeOf(adjacency, v) {
  let d = 0; for (let u = 0; u < adjacency.length; u++) d += adjacency[v][u] ? 1 : 0; return d;
}


