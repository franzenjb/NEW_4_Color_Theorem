/**
 * DSATUR Algorithm Implementation
 * One of the most effective heuristic algorithms for graph coloring
 * Selects vertices based on saturation degree (number of different colors in neighbors)
 */

export class DSATURAlgorithm {
  compute(graph, options = {}) {
    const { nodes, adjacency } = graph;
    const n = nodes.length;
    const maxColors = options.maxColors || 4;
    const constraints = options.constraints || [];
    
    // Initialize color assignments (-1 means uncolored)
    const colors = new Array(n).fill(-1);
    const saturation = new Array(n).fill(0);
    const degree = new Array(n);
    
    // Apply constraints if any
    constraints.forEach(constraint => {
      const nodeIndex = nodes.findIndex(node => node.id === constraint.nodeId);
      if (nodeIndex !== -1 && constraint.colorIndex !== undefined) {
        colors[nodeIndex] = constraint.colorIndex;
      }
    });
    
    // Calculate degree for each vertex
    for (let i = 0; i < n; i++) {
      degree[i] = adjacency[i].reduce((sum, val) => sum + val, 0);
    }
    
    // Color vertices one by one
    let colored = constraints.filter(c => c.colorIndex !== undefined).length;
    
    while (colored < n) {
      // Find vertex with maximum saturation degree
      // In case of tie, choose vertex with maximum degree
      let maxSat = -1;
      let maxDeg = -1;
      let chosenVertex = -1;
      
      for (let i = 0; i < n; i++) {
        if (colors[i] === -1) {
          const sat = this._getSaturationDegree(i, colors, adjacency);
          if (sat > maxSat || (sat === maxSat && degree[i] > maxDeg)) {
            maxSat = sat;
            maxDeg = degree[i];
            chosenVertex = i;
          }
        }
      }
      
      if (chosenVertex === -1) break;
      
      // Find the smallest available color for the chosen vertex
      const availableColors = this._getAvailableColors(chosenVertex, colors, adjacency, maxColors);
      
      if (availableColors.length === 0) {
        // No valid coloring with given constraints
        return {
          assignments: {},
          palette: this._generatePalette(maxColors),
          chromatic: 0,
          valid: false
        };
      }
      
      colors[chosenVertex] = availableColors[0];
      colored++;
    }
    
    // Convert to output format
    const assignments = {};
    let maxColorUsed = -1;
    
    for (let i = 0; i < n; i++) {
      if (colors[i] !== -1) {
        assignments[nodes[i].id] = colors[i];
        maxColorUsed = Math.max(maxColorUsed, colors[i]);
      }
    }
    
    return {
      assignments,
      palette: this._generatePalette(maxColorUsed + 1),
      chromatic: maxColorUsed + 1,
      valid: true
    };
  }
  
  _getSaturationDegree(vertex, colors, adjacency) {
    const neighborColors = new Set();
    const n = adjacency.length;
    
    for (let i = 0; i < n; i++) {
      if (adjacency[vertex][i] === 1 && colors[i] !== -1) {
        neighborColors.add(colors[i]);
      }
    }
    
    return neighborColors.size;
  }
  
  _getAvailableColors(vertex, colors, adjacency, maxColors) {
    const usedColors = new Set();
    const n = adjacency.length;
    
    for (let i = 0; i < n; i++) {
      if (adjacency[vertex][i] === 1 && colors[i] !== -1) {
        usedColors.add(colors[i]);
      }
    }
    
    const available = [];
    for (let color = 0; color < maxColors; color++) {
      if (!usedColors.has(color)) {
        available.push(color);
      }
    }
    
    return available;
  }
  
  _generatePalette(numColors) {
    const baseColors = [
      '#E63946', // Red
      '#457B9D', // Blue  
      '#F1C40F', // Yellow
      '#27AE60'  // Green
    ];
    
    if (numColors <= 4) {
      return baseColors.slice(0, numColors);
    }
    
    // Generate additional colors if needed
    const palette = [...baseColors];
    const hueStep = 360 / numColors;
    
    for (let i = 4; i < numColors; i++) {
      const hue = (i * hueStep) % 360;
      palette.push(`hsl(${hue}, 70%, 50%)`);
    }
    
    return palette;
  }
}