export class RegionsCanvas {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks || {};
    this.onRequestColor = () => '#cccccc';
    this.svg = createSvg();
    this.container.appendChild(this.svg);
    this.features = []; // { id, d, color, neighbors: Set<string> }
    this.pathElements = new Map();
  }

  async loadRegionsFromUrl(url) {
    const res = await fetch(url);
    const gj = await res.json();
    this.loadRegionsFromGeoJSON(gj);
  }

  loadRegionsFromGeoJSON(gj) {
    // Expect FeatureCollection with Polygon/MultiPolygon
    // We'll compute adjacency by path touching via shared boundaries (approx bbox + path).
    this.features = [];
    let idx = 0;
    for (const f of gj.features) {
      const id = f.properties?.id ?? String(idx++);
      const d = toPathD(f.geometry);
      this.features.push({ id, d, color: '#2b2b31', neighbors: new Set() });
    }
    // naive adjacency by bbox overlap (fast, approximate)
    // In v1 this is sufficient for curated samples; can replace with robust topology later.
    this.render();
    this.computeAdjacencyApprox();
  }

  computeAdjacencyApprox() {
    const boxes = [];
    for (const ft of this.features) {
      const path = this.pathElements.get(ft.id);
      const bb = path.getBBox();
      boxes.push({ id: ft.id, x: bb.x, y: bb.y, w: bb.width, h: bb.height });
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (overlap(boxes[i], boxes[j])) {
          const a = this.features.find(f => f.id === boxes[i].id);
          const b = this.features.find(f => f.id === boxes[j].id);
          a.neighbors.add(b.id); b.neighbors.add(a.id);
        }
      }
    }
  }

  render() {
    this.svg.innerHTML = '';
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svg.appendChild(g);
    this.pathElements.clear();
    for (const ft of this.features) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', ft.d);
      p.setAttribute('class', 'region');
      p.setAttribute('fill', ft.color);
      p.addEventListener('click', () => this.handleRegionClick(ft.id));
      g.appendChild(p);
      this.pathElements.set(ft.id, p);
    }
  }

  handleRegionClick(id) {
    const ft = this.features.find(f => f.id === id);
    if (!ft) return;
    const color = this.onRequestColor ? this.onRequestColor() : '#cccccc';
    ft.color = color;
    const el = this.pathElements.get(id);
    if (el) el.setAttribute('fill', color);
    if (this.callbacks.onColorChange) this.callbacks.onColorChange('region-color');
  }

  reset() {
    this.features.forEach(f => f.color = '#2b2b31');
    for (const [id, el] of this.pathElements) {
      const ft = this.features.find(x => x.id === id);
      el.setAttribute('fill', ft.color);
    }
  }

  getAdjacency() {
    const ids = this.features.map(f => f.id);
    const idToIndex = new Map(ids.map((id, i) => [id, i]));
    const n = ids.length;
    const adj = Array.from({ length: n }, () => new Array(n).fill(0));
    for (const f of this.features) {
      const i = idToIndex.get(f.id);
      for (const nId of f.neighbors) {
        const j = idToIndex.get(nId);
        if (i !== j) { adj[i][j] = 1; adj[j][i] = 1; }
      }
    }
    return { adjacency: adj, ids };
  }

  applyColorAssignment(assignment, palette) {
    for (let i = 0; i < this.features.length; i++) {
      const ft = this.features[i];
      const colorIndex = assignment[i] % palette.length;
      const color = palette[colorIndex];
      ft.color = color;
      const el = this.pathElements.get(ft.id);
      if (el) el.setAttribute('fill', color);
    }
  }

  getState() {
    return { features: this.features.map(f => ({ id: f.id, color: f.color })) };
  }
  setState(state) {
    if (!state || !state.features) return;
    const m = new Map(state.features.map(f => [f.id, f.color]));
    this.features.forEach(f => { if (m.has(f.id)) f.color = m.get(f.id); });
    for (const [id, el] of this.pathElements) {
      const ft = this.features.find(x => x.id === id);
      if (ft) el.setAttribute('fill', ft.color);
    }
  }

  getSvgElement() { return this.svg; }
}

function createSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1000 700');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  return svg;
}

function overlap(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

function toPathD(geom) {
  if (!geom) return '';
  if (geom.type === 'Polygon') return polygonToD(geom.coordinates);
  if (geom.type === 'MultiPolygon') return geom.coordinates.map(polygonToD).join(' ');
  return '';
}

function polygonToD(rings) {
  // Assume coordinates in [lon, lat] with viewBox 1000x700; fit with simple projection
  const fl = (lon, lat) => {
    const x = ((lon + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 700;
    return [x, y];
  };
  let d = '';
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i++) {
      const [x, y] = fl(ring[i][0], ring[i][1]);
      d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }
    d += ' Z';
  }
  return d;
}


