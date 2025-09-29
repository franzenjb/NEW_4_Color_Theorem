export class GraphCanvas {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks || {};
    this.onRequestColor = () => '#cccccc';
    this.svg = createSvg();
    this.container.appendChild(this.svg);
    this.nodes = []; // { id, x, y, color }
    this.edges = []; // { u, v }
    this.nodeElements = new Map();
    this.edgeElements = [];
  }

  async loadGraphFromUrl(url) {
    const res = await fetch(url);
    const data = await res.json();
    this.loadGraph(data);
  }

  loadGraph(data) {
    this.nodes = data.nodes.map(n => ({ id: n.id, x: n.x, y: n.y, color: n.color || '#2b2b31' }));
    this.edges = data.edges.map(e => ({ u: e.source || e.u, v: e.target || e.v }));
    this.render();
  }

  render() {
    this.svg.innerHTML = '';
    const gEdges = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gNodes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svg.appendChild(gEdges);
    this.svg.appendChild(gNodes);
    this.edgeElements = [];
    this.nodeElements.clear();

    const nodeMap = new Map(this.nodes.map(n => [n.id, n]));
    for (const e of this.edges) {
      const a = nodeMap.get(e.u), b = nodeMap.get(e.v);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('class', 'edge');
      gEdges.appendChild(line);
      this.edgeElements.push(line);
    }
    for (const n of this.nodes) {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', n.x); ring.setAttribute('cy', n.y);
      ring.setAttribute('r', 16); ring.setAttribute('class', 'node-ring');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', 'black'); ring.setAttribute('stroke-opacity', '0.25');
      const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      node.setAttribute('cx', n.x); node.setAttribute('cy', n.y);
      node.setAttribute('r', 12); node.setAttribute('class', 'node');
      node.setAttribute('fill', n.color);
      node.addEventListener('click', () => this.handleNodeClick(n.id));
      group.appendChild(ring); group.appendChild(node); gNodes.appendChild(group);
      this.nodeElements.set(n.id, node);
    }
  }

  handleNodeClick(id) {
    const node = this.nodes.find(n => n.id === id);
    if (!node) return;
    if (this.callbacks.onPickColor && this.onRequestColor == null) {
      this.callbacks.onPickColor(node.color);
      return;
    }
    const color = this.onRequestColor ? this.onRequestColor() : '#cccccc';
    node.color = color;
    const el = this.nodeElements.get(id);
    if (el) el.setAttribute('fill', color);
    if (this.callbacks.onColorChange) this.callbacks.onColorChange('node-color');
  }

  reset() {
    this.nodes.forEach(n => n.color = '#2b2b31');
    for (const [id, el] of this.nodeElements) {
      const n = this.nodes.find(x => x.id === id);
      el.setAttribute('fill', n.color);
    }
  }

  getAdjacency() {
    const idToIndex = new Map(this.nodes.map((n, i) => [n.id, i]));
    const n = this.nodes.length;
    const adj = Array.from({ length: n }, () => new Array(n).fill(0));
    for (const e of this.edges) {
      const u = idToIndex.get(e.u), v = idToIndex.get(e.v);
      adj[u][v] = 1; adj[v][u] = 1;
    }
    return { adjacency: adj, nodeOrder: this.nodes.map(n => n.id) };
  }

  applyColorAssignment(assignment, palette) {
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const colorIndex = assignment[i] % palette.length;
      const color = palette[colorIndex];
      n.color = color;
      const el = this.nodeElements.get(n.id);
      if (el) el.setAttribute('fill', color);
    }
  }

  getState() {
    return { nodes: this.nodes.map(n => ({ id: n.id, color: n.color })), edges: this.edges.slice() };
  }
  setState(state) {
    if (!state || !state.nodes) return;
    const m = new Map(state.nodes.map(n => [n.id, n.color]));
    this.nodes.forEach(n => { if (m.has(n.id)) n.color = m.get(n.id); });
    for (const [id, el] of this.nodeElements) {
      const n = this.nodes.find(x => x.id === id);
      if (n) el.setAttribute('fill', n.color);
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


