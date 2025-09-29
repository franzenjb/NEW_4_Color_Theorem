/**
 * Greedy Algorithm Implementation
 * Simple, fast algorithm that colors vertices in order using the first available color
 */

export class GreedyAlgorithm {
  compute(graph, options = {}) {
    const { nodes, adjacency } = graph;
    const n = nodes.length;
    const maxColors = options.maxColors || 4;
    
    const colors = new Array(n).fill(-1);
    
    // Apply any constraints
    if (options.constraints) {
      options.constraints.forEach(constraint => {
        const nodeIndex = nodes.findIndex(node => node.id === constraint.nodeId);
        if (nodeIndex !== -1 && constraint.colorIndex !== undefined) {
          colors[nodeIndex] = constraint.colorIndex;
        }
      });
    }
    
    // Color vertices in order
    for (let i = 0; i < n; i++) {
      if (colors[i] === -1) {
        const availableColors = this._getAvailableColors(i, colors, adjacency, maxColors);
        
        if (availableColors.length === 0) {
          return {
            assignments: {},
            palette: this._generatePalette(maxColors),
            chromatic: 0,
            valid: false
          };
        }
        
        colors[i] = availableColors[0];
      }
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
    
    return baseColors.slice(0, Math.min(numColors, 4));
  }
}