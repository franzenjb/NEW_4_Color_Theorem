/**
 * Four Color Theorem - Main Application
 * Professional visualization tool for cartographers and GIS professionals
 */

// Import modules - using relative paths for ES6 modules
// Note: These will need to be loaded as modules in the browser

class FourColorApp {
  constructor() {
    this.currentPanel = 'workspace';
    this.selectedColor = 0;
    this.currentGraph = null;
    this.theoremEngine = null;
    this.mapEngine = null;
    
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupColorPalette();
    this.setupControls();
    this.loadDefaultExample();
    this.setupFileUpload();
  }

  setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetPanel = e.target.dataset.panel;
        this.switchPanel(targetPanel);
      });
    });
  }

  switchPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    // Remove active state from tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Show selected panel
    const panel = document.getElementById(`${panelName}-panel`);
    if (panel) {
      panel.classList.add('active');
    }
    
    // Activate corresponding tab
    const tab = document.querySelector(`[data-panel="${panelName}"]`);
    if (tab) {
      tab.classList.add('active');
    }
    
    this.currentPanel = panelName;
  }

  setupColorPalette() {
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        // Remove active class from all swatches
        swatches.forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked swatch
        e.target.classList.add('active');
        
        // Update selected color
        this.selectedColor = parseInt(e.target.dataset.color);
      });
    });
  }

  setupControls() {
    // Auto-color button
    const autoColorBtn = document.getElementById('autoColorBtn');
    if (autoColorBtn) {
      autoColorBtn.addEventListener('click', () => {
        this.autoColorGraph();
      });
    }

    // Undo button
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        this.undo();
      });
    }

    // Redo button
    const redoBtn = document.getElementById('redoBtn');
    if (redoBtn) {
      redoBtn.addEventListener('click', () => {
        this.redo();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetColors();
      });
    }

    // Export buttons
    const exportSvgBtn = document.getElementById('exportSvgBtn');
    if (exportSvgBtn) {
      exportSvgBtn.addEventListener('click', () => {
        this.exportSVG();
      });
    }

    const exportPngBtn = document.getElementById('exportPngBtn');
    if (exportPngBtn) {
      exportPngBtn.addEventListener('click', () => {
        this.exportPNG();
      });
    }

    // Example data buttons
    const exampleButtons = {
      'loadUSStates': () => this.loadUSStatesExample(),
      'loadPetersenGraph': () => this.loadPetersenGraphExample(),
      'loadPlanarK5': () => this.loadPlanarK5Example(),
      'loadEuropeMap': () => this.loadEuropeMapExample()
    };

    Object.keys(exampleButtons).forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', exampleButtons[id]);
      }
    });
  }

  setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    if (uploadArea && fileInput) {
      // Drag and drop
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.handleFileUpload(files[0]);
        }
      });

      // File input change
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }
  }

  handleFileUpload(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      const extension = file.name.split('.').pop().toLowerCase();
      
      try {
        if (extension === 'json' || extension === 'geojson') {
          const data = JSON.parse(content);
          this.loadGraphData(data);
        } else if (extension === 'csv') {
          this.loadCSVData(content);
        }
      } catch (error) {
        console.error('Error loading file:', error);
        this.updateStatus('Error loading file: ' + error.message);
      }
    };
    
    reader.readAsText(file);
  }

  loadDefaultExample() {
    // Load a simple planar graph as default
    const defaultGraph = {
      nodes: [
        { id: 'A', x: 200, y: 100 },
        { id: 'B', x: 400, y: 100 },
        { id: 'C', x: 600, y: 100 },
        { id: 'D', x: 200, y: 300 },
        { id: 'E', x: 400, y: 300 },
        { id: 'F', x: 600, y: 300 },
        { id: 'G', x: 300, y: 200 },
        { id: 'H', x: 500, y: 200 }
      ],
      edges: [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
        { source: 'A', target: 'D' },
        { source: 'B', target: 'E' },
        { source: 'C', target: 'F' },
        { source: 'D', target: 'E' },
        { source: 'E', target: 'F' },
        { source: 'A', target: 'G' },
        { source: 'G', target: 'B' },
        { source: 'B', target: 'H' },
        { source: 'H', target: 'C' },
        { source: 'D', target: 'G' },
        { source: 'G', target: 'E' },
        { source: 'E', target: 'H' },
        { source: 'H', target: 'F' }
      ]
    };
    
    this.loadGraphData(defaultGraph);
  }

  loadGraphData(data) {
    this.currentGraph = data;
    this.renderGraph();
    this.updateStatistics();
    this.updateStatus('Graph loaded successfully');
  }

  renderGraph() {
    const svg = document.getElementById('mainSvg');
    if (!svg || !this.currentGraph) return;

    // Clear existing content
    svg.innerHTML = '';

    // Create groups for edges and nodes
    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    svg.appendChild(edgeGroup);
    svg.appendChild(nodeGroup);

    // Create node map for easy lookup
    const nodeMap = new Map();
    this.currentGraph.nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });

    // Render edges
    this.currentGraph.edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (sourceNode && targetNode) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceNode.x);
        line.setAttribute('y1', sourceNode.y);
        line.setAttribute('x2', targetNode.x);
        line.setAttribute('y2', targetNode.y);
        line.setAttribute('stroke', '#999');
        line.setAttribute('stroke-width', '2');
        edgeGroup.appendChild(line);
      }
    });

    // Render nodes
    const colors = ['#E63946', '#457B9D', '#F1C40F', '#27AE60'];
    
    this.currentGraph.nodes.forEach(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
      circle.setAttribute('r', '20');
      circle.setAttribute('fill', node.color || '#fff');
      circle.setAttribute('stroke', '#333');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      
      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.y + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.textContent = node.id;
      
      // Click handler for manual coloring
      circle.addEventListener('click', () => {
        node.color = colors[this.selectedColor];
        circle.setAttribute('fill', node.color);
        this.updateStatistics();
        this.checkValidity();
      });
      
      group.appendChild(circle);
      group.appendChild(text);
      nodeGroup.appendChild(group);
    });
  }

  autoColorGraph() {
    if (!this.currentGraph) return;

    const algorithm = document.getElementById('algorithmSelect').value;
    const colors = ['#E63946', '#457B9D', '#F1C40F', '#27AE60'];
    
    // Simple greedy coloring algorithm for now
    // In production, this would call the theorem_engine module
    const nodeColors = this.greedyColoring();
    
    this.currentGraph.nodes.forEach((node, i) => {
      node.color = colors[nodeColors[i]];
    });
    
    this.renderGraph();
    this.updateStatistics();
    this.updateStatus(`Graph colored using ${algorithm} algorithm`);
  }

  greedyColoring() {
    const n = this.currentGraph.nodes.length;
    const colors = new Array(n).fill(-1);
    const adjacency = this.buildAdjacencyMatrix();
    
    for (let i = 0; i < n; i++) {
      const usedColors = new Set();
      
      for (let j = 0; j < n; j++) {
        if (adjacency[i][j] && colors[j] !== -1) {
          usedColors.add(colors[j]);
        }
      }
      
      let color = 0;
      while (usedColors.has(color)) {
        color++;
      }
      
      colors[i] = color;
    }
    
    return colors;
  }

  buildAdjacencyMatrix() {
    const n = this.currentGraph.nodes.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(false));
    const nodeIndexMap = new Map();
    
    this.currentGraph.nodes.forEach((node, i) => {
      nodeIndexMap.set(node.id, i);
    });
    
    this.currentGraph.edges.forEach(edge => {
      const i = nodeIndexMap.get(edge.source);
      const j = nodeIndexMap.get(edge.target);
      if (i !== undefined && j !== undefined) {
        matrix[i][j] = true;
        matrix[j][i] = true;
      }
    });
    
    return matrix;
  }

  checkValidity() {
    if (!this.currentGraph) return true;

    const nodeMap = new Map();
    this.currentGraph.nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });

    let isValid = true;
    this.currentGraph.edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (sourceNode.color && targetNode.color && 
          sourceNode.color === targetNode.color) {
        isValid = false;
      }
    });

    document.getElementById('statValid').textContent = isValid ? 'Yes' : 'No';
    return isValid;
  }

  updateStatistics() {
    if (!this.currentGraph) return;

    document.getElementById('statNodes').textContent = this.currentGraph.nodes.length;
    document.getElementById('statEdges').textContent = this.currentGraph.edges.length;
    
    // Calculate chromatic number (colors used)
    const usedColors = new Set();
    this.currentGraph.nodes.forEach(node => {
      if (node.color) {
        usedColors.add(node.color);
      }
    });
    
    document.getElementById('statChromatic').textContent = 
      usedColors.size > 0 ? usedColors.size : '-';
    
    this.checkValidity();
  }

  updateStatus(message) {
    const statusElement = document.getElementById('canvasStatus');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  resetColors() {
    if (!this.currentGraph) return;
    
    this.currentGraph.nodes.forEach(node => {
      node.color = '#fff';
    });
    
    this.renderGraph();
    this.updateStatistics();
    this.updateStatus('Colors reset');
  }

  undo() {
    // Placeholder for undo functionality
    this.updateStatus('Undo not yet implemented');
  }

  redo() {
    // Placeholder for redo functionality
    this.updateStatus('Redo not yet implemented');
  }

  exportSVG() {
    const svg = document.getElementById('mainSvg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'four-color-graph.svg';
    link.click();
    
    this.updateStatus('Exported as SVG');
  }

  exportPNG() {
    // Placeholder for PNG export
    this.updateStatus('PNG export not yet implemented');
  }

  // Example loaders
  loadUSStatesExample() {
    this.updateStatus('Loading US States example...');
    // Would load actual US states data
  }

  loadPetersenGraphExample() {
    const petersenGraph = {
      nodes: [
        { id: '0', x: 300, y: 100 },
        { id: '1', x: 470, y: 170 },
        { id: '2', x: 470, y: 330 },
        { id: '3', x: 300, y: 400 },
        { id: '4', x: 130, y: 330 },
        { id: '5', x: 130, y: 170 },
        { id: '6', x: 300, y: 200 },
        { id: '7', x: 370, y: 230 },
        { id: '8', x: 370, y: 270 },
        { id: '9', x: 300, y: 300 },
        { id: '10', x: 230, y: 270 },
        { id: '11', x: 230, y: 230 }
      ],
      edges: [
        { source: '0', target: '1' },
        { source: '1', target: '2' },
        { source: '2', target: '3' },
        { source: '3', target: '4' },
        { source: '4', target: '5' },
        { source: '5', target: '0' },
        { source: '0', target: '6' },
        { source: '1', target: '7' },
        { source: '2', target: '8' },
        { source: '3', target: '9' },
        { source: '4', target: '10' },
        { source: '5', target: '11' },
        { source: '6', target: '8' },
        { source: '6', target: '10' },
        { source: '7', target: '9' },
        { source: '7', target: '11' },
        { source: '8', target: '11' },
        { source: '9', target: '10' }
      ]
    };
    
    this.loadGraphData(petersenGraph);
    this.updateStatus('Loaded Petersen Graph');
  }

  loadPlanarK5Example() {
    this.updateStatus('Loading Planar K5-e example...');
    // Would load K5 minus one edge (planar)
  }

  loadEuropeMapExample() {
    this.updateStatus('Loading Europe regions example...');
    // Would load Europe map regions
  }

  loadCSVData(content) {
    // Parse CSV adjacency matrix or edge list
    this.updateStatus('CSV import not yet fully implemented');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.fourColorApp = new FourColorApp();
});