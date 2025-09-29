/**
 * Theorem Engine Module
 * Pure logic module for Four Color Theorem computations
 * No UI dependencies - handles graph coloring algorithms
 */

import { ColoringAlgorithms } from '../../contracts/types.js';
import { DSATURAlgorithm } from './algorithms/dsatur.js';
import { GreedyAlgorithm } from './algorithms/greedy.js';
import { WelshPowellAlgorithm } from './algorithms/welsh-powell.js';
import { BacktrackingAlgorithm } from './algorithms/backtracking.js';
import { StateManager } from './state-manager.js';

export class TheoremEngine {
  constructor(options = {}) {
    this.maxUndoSteps = options.maxUndoSteps || 20;
    this.stateManager = new StateManager(this.maxUndoSteps);
    this.currentGraph = null;
    this.currentColoring = null;
  }

  /**
   * Load a graph structure for coloring
   * @param {Graph} graph - Graph with nodes and edges
   */
  loadGraph(graph) {
    this.currentGraph = this._preprocessGraph(graph);
    this.stateManager.clear();
    this.currentColoring = {
      assignments: {},
      palette: [],
      chromatic: 0,
      valid: false
    };
  }

  /**
   * Compute a valid coloring for the loaded graph
   * @param {AlgorithmOptions} options - Algorithm selection and parameters
   * @returns {ColorAssignment} - Valid color assignment
   */
  computeColoring(options = {}) {
    if (!this.currentGraph) {
      throw new Error('No graph loaded');
    }

    const algorithm = this._selectAlgorithm(options.algorithm);
    const coloring = algorithm.compute(
      this.currentGraph, 
      options
    );

    this.currentColoring = coloring;
    this.stateManager.pushState({
      coloring: { ...coloring },
      timestamp: Date.now(),
      action: `Auto-colored using ${options.algorithm || 'default'} algorithm`
    });

    return coloring;
  }

  /**
   * Validate if a given coloring is valid
   * @param {ColorAssignment} coloring - Coloring to validate
   * @returns {boolean} - True if valid
   */
  validateColoring(coloring = null) {
    const toValidate = coloring || this.currentColoring;
    if (!toValidate || !this.currentGraph) return false;

    const { adjacency, nodes } = this.currentGraph;
    const { assignments } = toValidate;

    // Check each edge for color conflicts
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (adjacency[i][j] === 1) {
          const node1 = nodes[i].id;
          const node2 = nodes[j].id;
          
          if (assignments[node1] === assignments[node2] && 
              assignments[node1] !== undefined) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Manually assign a color to a node
   * @param {string} nodeId - Node to color
   * @param {number} colorIndex - Color index from palette
   */
  assignColor(nodeId, colorIndex) {
    if (!this.currentColoring) {
      this.currentColoring = {
        assignments: {},
        palette: this._getDefaultPalette(),
        chromatic: 0,
        valid: false
      };
    }

    const previousColor = this.currentColoring.assignments[nodeId];
    this.currentColoring.assignments[nodeId] = colorIndex;
    
    // Update chromatic number
    const usedColors = new Set(Object.values(this.currentColoring.assignments));
    this.currentColoring.chromatic = usedColors.size;
    this.currentColoring.valid = this.validateColoring();

    this.stateManager.pushState({
      coloring: { ...this.currentColoring },
      timestamp: Date.now(),
      action: `Colored node ${nodeId} with color ${colorIndex}`
    });
  }

  /**
   * Get the chromatic number (minimum colors needed)
   * @returns {number} - Chromatic number of the graph
   */
  getChromaticNumber() {
    if (!this.currentGraph) return 0;

    // Try coloring with increasing number of colors
    for (let k = 1; k <= 4; k++) {
      const algorithm = new BacktrackingAlgorithm();
      const result = algorithm.compute(this.currentGraph, { maxColors: k });
      
      if (result.valid) {
        return k;
      }
    }

    return 4; // Four colors always suffice for planar graphs
  }

  /**
   * Undo the last coloring action
   * @returns {ColorAssignment} - Previous color assignment
   */
  undo() {
    const previousState = this.stateManager.undo();
    if (previousState) {
      this.currentColoring = previousState.coloring;
      return this.currentColoring;
    }
    return null;
  }

  /**
   * Redo the next coloring action
   * @returns {ColorAssignment} - Next color assignment
   */
  redo() {
    const nextState = this.stateManager.redo();
    if (nextState) {
      this.currentColoring = nextState.coloring;
      return this.currentColoring;
    }
    return null;
  }

  /**
   * Reset to uncolored state
   */
  reset() {
    this.currentColoring = {
      assignments: {},
      palette: this._getDefaultPalette(),
      chromatic: 0,
      valid: false
    };
    
    this.stateManager.clear();
    this.stateManager.pushState({
      coloring: { ...this.currentColoring },
      timestamp: Date.now(),
      action: 'Reset to uncolored state'
    });
  }

  /**
   * Get adjacency information for a specific node
   * @param {string} nodeId - Node ID
   * @returns {Array<string>} - Array of adjacent node IDs
   */
  getNeighbors(nodeId) {
    if (!this.currentGraph) return [];
    
    const nodeIndex = this.currentGraph.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return [];
    
    const neighbors = [];
    const { adjacency, nodes } = this.currentGraph;
    
    for (let i = 0; i < nodes.length; i++) {
      if (adjacency[nodeIndex][i] === 1) {
        neighbors.push(nodes[i].id);
      }
    }
    
    return neighbors;
  }

  /**
   * Get graph statistics
   * @returns {Object} - Statistics about the graph
   */
  getStatistics() {
    if (!this.currentGraph) return null;

    const { nodes, edges, adjacency } = this.currentGraph;
    
    // Calculate degrees
    const degrees = nodes.map((node, i) => 
      adjacency[i].reduce((sum, val) => sum + val, 0)
    );

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      avgDegree: degrees.reduce((a, b) => a + b, 0) / nodes.length,
      maxDegree: Math.max(...degrees),
      minDegree: Math.min(...degrees),
      chromaticNumber: this.getChromaticNumber(),
      isPlanar: this._checkPlanarity()
    };
  }

  // Private methods

  _preprocessGraph(graph) {
    // Ensure adjacency matrix exists
    if (!graph.adjacency) {
      graph.adjacency = this._buildAdjacencyMatrix(graph);
    }
    return graph;
  }

  _buildAdjacencyMatrix(graph) {
    const n = graph.nodes.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
    const nodeIndexMap = new Map(graph.nodes.map((node, i) => [node.id, i]));

    graph.edges.forEach(edge => {
      const i = nodeIndexMap.get(edge.source);
      const j = nodeIndexMap.get(edge.target);
      if (i !== undefined && j !== undefined) {
        matrix[i][j] = 1;
        matrix[j][i] = 1;
      }
    });

    return matrix;
  }

  _selectAlgorithm(algorithmName) {
    switch (algorithmName) {
      case ColoringAlgorithms.DSATUR:
        return new DSATURAlgorithm();
      case ColoringAlgorithms.WELSH_POWELL:
        return new WelshPowellAlgorithm();
      case ColoringAlgorithms.BACKTRACKING:
        return new BacktrackingAlgorithm();
      case ColoringAlgorithms.GREEDY:
      default:
        return new GreedyAlgorithm();
    }
  }

  _getDefaultPalette() {
    return [
      '#E63946', // Red
      '#457B9D', // Blue  
      '#F1C40F', // Yellow
      '#27AE60', // Green
    ];
  }

  _checkPlanarity() {
    // Simplified planarity check using Euler's formula
    // For a connected planar graph: V - E + F = 2
    // And E ≤ 3V - 6
    const V = this.currentGraph.nodes.length;
    const E = this.currentGraph.edges.length;
    
    return E <= (3 * V - 6);
  }
}