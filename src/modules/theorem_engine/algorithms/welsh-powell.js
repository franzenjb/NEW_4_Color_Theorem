/**
 * Welsh-Powell Algorithm Implementation
 * Colors vertices ordered by degree (highest first)
 * Excellent for emergency response mapping where high-connectivity regions need priority
 */

export class WelshPowellAlgorithm {
  compute(graph, options = {}) {
    const { nodes, adjacency } = graph;
    const n = nodes.length;
    const maxColors = options.maxColors || 4;
    
    // Calculate degree for each vertex
    const degrees = [];
    for (let i = 0; i < n; i++) {
      const degree = adjacency[i].reduce((sum, val) => sum + val, 0);
      degrees.push({ index: i, degree: degree });
    }
    
    // Sort vertices by degree (descending)
    degrees.sort((a, b) => b.degree - a.degree);
    
    const colors = new Array(n).fill(-1);
    
    // Apply constraints
    if (options.constraints) {
      options.constraints.forEach(constraint => {
        const nodeIndex = nodes.findIndex(node => node.id === constraint.nodeId);
        if (nodeIndex !== -1 && constraint.colorIndex !== undefined) {
          colors[nodeIndex] = constraint.colorIndex;
        }
      });
    }
    
    // Color vertices in degree order
    for (const vertex of degrees) {
      if (colors[vertex.index] === -1) {
        const availableColors = this._getAvailableColors(
          vertex.index, 
          colors, 
          adjacency, 
          maxColors
        );
        
        if (availableColors.length === 0) {
          return {
            assignments: {},
            palette: this._generatePalette(maxColors),
            chromatic: 0,
            valid: false
          };
        }
        
        colors[vertex.index] = availableColors[0];
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
      valid: true,
      metadata: {
        algorithm: 'Welsh-Powell',
        vertexOrder: degrees.map(d => nodes[d.index].id),
        degreeDistribution: degrees.map(d => d.degree)
      }
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
    // Red Cross / Emergency mapping colors
    const emergencyColors = [
      '#DC143C', // Crimson - High Priority
      '#4169E1', // Royal Blue - Medium Priority  
      '#FFD700', // Gold - Low Priority
      '#228B22'  // Forest Green - Safe/Clear
    ];
    
    return emergencyColors.slice(0, Math.min(numColors, 4));
  }
}