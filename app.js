import { palettes, defaultPaletteName } from './palette.js';
import { HistoryManager } from './history.js';
import { colorGraphGreedyBacktrack } from './coloring.js';
import { GraphCanvas } from './graph.js';
import { RegionsCanvas } from './regions.js';
import { exportSvgElementToFile, exportSvgElementToPng } from './exporter.js';

const statusText = document.getElementById('statusText');
const modeSelect = document.getElementById('modeSelect');
const paletteSelect = document.getElementById('paletteSelect');
const swatchesContainer = document.getElementById('swatches');
const autoColorBtn = document.getElementById('autoColorBtn');
const eyedropperBtn = document.getElementById('eyedropperBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const resetBtn = document.getElementById('resetBtn');
const exportSVGBtn = document.getElementById('exportSVGBtn');
const exportPNGBtn = document.getElementById('exportPNGBtn');

const graphContainer = document.getElementById('graphCanvasContainer');
const regionContainer = document.getElementById('regionCanvasContainer');

let currentColor = null;
let eyedropperActive = false;
const history = new HistoryManager(50);

const graphCanvas = new GraphCanvas(graphContainer, {
  onColorChange: recordHistory,
  onPickColor: (c) => { if (eyedropperActive) { setActiveColor(c); setStatus('Picked color.'); } },
});

const regionsCanvas = new RegionsCanvas(regionContainer, {
  onColorChange: recordHistory,
  onPickColor: (c) => { if (eyedropperActive) { setActiveColor(c); setStatus('Picked color.'); } },
});

async function init() {
  initPalettes();
  setActivePalette(defaultPaletteName);
  setActiveColor(palettes[defaultPaletteName][0]);

  await Promise.all([
    graphCanvas.loadGraphFromUrl('./data/graph-sample.json'),
    regionsCanvas.loadRegionsFromUrl('./data/regions-sample.geojson'),
  ]);

  recordHistory('Initial state');
  attachUiHandlers();
  setStatus('Ready.');
}

function setStatus(text) { statusText.textContent = text; }

function initPalettes() {
  Object.keys(palettes).forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name; paletteSelect.appendChild(opt);
  });
  paletteSelect.addEventListener('change', () => setActivePalette(paletteSelect.value));
}

function renderSwatches(name) {
  swatchesContainer.innerHTML = '';
  palettes[name].forEach((color) => {
    const sw = document.createElement('button');
    sw.className = 'swatch';
    sw.style.background = color;
    sw.addEventListener('click', () => setActiveColor(color));
    swatchesContainer.appendChild(sw);
  });
}

function setActivePalette(name) {
  paletteSelect.value = name;
  renderSwatches(name);
}

function setActiveColor(color) {
  currentColor = color;
  [...swatchesContainer.children].forEach((el) => {
    el.classList.toggle('selected', el.style.background === color);
  });
}

function attachUiHandlers() {
  modeSelect.addEventListener('change', () => switchMode(modeSelect.value));

  autoColorBtn.addEventListener('click', () => {
    if (modeSelect.value === 'graph') autoColorGraph(); else autoColorRegions();
  });

  eyedropperBtn.addEventListener('click', () => {
    eyedropperActive = !eyedropperActive;
    eyedropperBtn.classList.toggle('active', eyedropperActive);
    setStatus(eyedropperActive ? 'Eyedropper active.' : 'Eyedropper off.');
  });

  undoBtn.addEventListener('click', () => {
    const prev = history.undo();
    if (prev) applyState(prev);
  });
  redoBtn.addEventListener('click', () => {
    const next = history.redo();
    if (next) applyState(next);
  });
  resetBtn.addEventListener('click', () => {
    if (modeSelect.value === 'graph') { graphCanvas.reset(); }
    else { regionsCanvas.reset(); }
    recordHistory('Reset');
    setStatus('Reset.');
  });

  exportSVGBtn.addEventListener('click', async () => {
    const svg = activeCanvas().getSvgElement();
    await exportSvgElementToFile(svg, `four-color-${modeSelect.value}.svg`);
    setStatus('Exported SVG.');
  });
  exportPNGBtn.addEventListener('click', async () => {
    const svg = activeCanvas().getSvgElement();
    await exportSvgElementToPng(svg, `four-color-${modeSelect.value}.png`, { scale: 2 });
    setStatus('Exported PNG.');
  });

  // Coloring interactions
  graphCanvas.onRequestColor = () => currentColor;
  regionsCanvas.onRequestColor = () => currentColor;
}

function activeCanvas() { return modeSelect.value === 'graph' ? graphCanvas : regionsCanvas; }

function switchMode(mode) {
  graphContainer.hidden = mode !== 'graph';
  regionContainer.hidden = mode !== 'regions';
  setStatus(mode === 'graph' ? 'Graph mode.' : 'Regions mode.');
}

function recordHistory(reason) {
  const state = {
    mode: modeSelect.value,
    graph: graphCanvas.getState(),
    regions: regionsCanvas.getState(),
  };
  history.push(state, reason);
}

function applyState(state) {
  modeSelect.value = state.mode;
  switchMode(state.mode);
  graphCanvas.setState(state.graph);
  regionsCanvas.setState(state.regions);
}

function autoColorGraph() {
  const { adjacency, nodeOrder } = graphCanvas.getAdjacency();
  const palette = palettes[paletteSelect.value];
  const assignment = colorGraphGreedyBacktrack(adjacency, palette.length);
  graphCanvas.applyColorAssignment(assignment, palette);
  recordHistory('Auto-colored graph');
  setStatus('Graph auto-colored.');
}

function autoColorRegions() {
  const { adjacency, ids } = regionsCanvas.getAdjacency();
  if (!adjacency) { setStatus('No adjacency available for regions.'); return; }
  const palette = palettes[paletteSelect.value];
  const assignment = colorGraphGreedyBacktrack(adjacency, palette.length);
  regionsCanvas.applyColorAssignment(assignment, palette);
  recordHistory('Auto-colored regions');
  setStatus('Regions auto-colored.');
}

init();


