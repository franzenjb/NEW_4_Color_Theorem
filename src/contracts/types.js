/**
 * Shared type definitions and contracts for the Four Color Theorem application
 * These types define the interface between theorem_engine and map_engine modules
 */

/**
 * Graph representation for the theorem engine
 * @typedef {Object} Graph
 * @property {Array<Node>} nodes - Array of nodes in the graph
 * @property {Array<Edge>} edges - Array of edges connecting nodes
 * @property {AdjacencyMatrix} adjacency - Adjacency matrix representation
 */

/**
 * Node in a graph or region in a map
 * @typedef {Object} Node
 * @property {string} id - Unique identifier
 * @property {string} [name] - Human-readable name
 * @property {number} [x] - X coordinate for visualization
 * @property {number} [y] - Y coordinate for visualization
 * @property {Object} [geometry] - GeoJSON geometry for regions
 * @property {Object} [properties] - Additional metadata
 */

/**
 * Edge connecting two nodes
 * @typedef {Object} Edge
 * @property {string} source - ID of source node
 * @property {string} target - ID of target node
 * @property {number} [weight] - Optional edge weight
 */

/**
 * Adjacency matrix representation
 * @typedef {Array<Array<number>>} AdjacencyMatrix
 */

/**
 * Color assignment for nodes/regions
 * @typedef {Object} ColorAssignment
 * @property {Object<string, number>} assignments - Map of node ID to color index
 * @property {Array<string>} palette - Array of color values (hex codes)
 * @property {number} chromatic - Chromatic number (colors used)
 * @property {boolean} valid - Whether the coloring is valid
 */

/**
 * Coloring constraint
 * @typedef {Object} Constraint
 * @property {string} nodeId - Node that has a constraint
 * @property {number} [colorIndex] - Fixed color for this node
 * @property {Array<number>} [forbidden] - Colors that cannot be used
 */

/**
 * State snapshot for undo/redo
 * @typedef {Object} StateSnapshot
 * @property {ColorAssignment} coloring - Current color assignment
 * @property {number} timestamp - When this state was created
 * @property {string} action - Description of the action that led to this state
 */

/**
 * Map data structure
 * @typedef {Object} MapData
 * @property {string} type - 'FeatureCollection' for GeoJSON
 * @property {Array<Feature>} features - Array of geographic features
 * @property {Object} [crs] - Coordinate reference system
 * @property {Object} [bbox] - Bounding box
 */

/**
 * Geographic feature
 * @typedef {Object} Feature
 * @property {string} type - 'Feature'
 * @property {Object} geometry - GeoJSON geometry
 * @property {Object} properties - Feature properties including ID and metadata
 */

/**
 * Export options
 * @typedef {Object} ExportOptions
 * @property {string} format - 'svg' or 'png'
 * @property {number} [width] - Output width in pixels
 * @property {number} [height] - Output height in pixels
 * @property {number} [scale] - Scale factor for high DPI
 * @property {boolean} [includeLabels] - Whether to include region labels
 * @property {boolean} [includeLegend] - Whether to include color legend
 */

/**
 * Algorithm options
 * @typedef {Object} AlgorithmOptions
 * @property {string} algorithm - 'greedy', 'dsatur', 'backtracking', 'welsh-powell'
 * @property {number} [maxColors] - Maximum colors to use (default: 4)
 * @property {Array<Constraint>} [constraints] - Pre-colored or forbidden colors
 * @property {number} [timeout] - Maximum time in ms before giving up
 * @property {boolean} [randomize] - Whether to randomize node ordering
 */

export const ColoringAlgorithms = {
  GREEDY: 'greedy',
  DSATUR: 'dsatur',
  BACKTRACKING: 'backtracking',
  WELSH_POWELL: 'welsh-powell'
};

export const ExportFormats = {
  SVG: 'svg',
  PNG: 'png',
  GEOJSON: 'geojson',
  CSV: 'csv'
};

export const DataFormats = {
  GEOJSON: 'application/geo+json',
  CSV: 'text/csv',
  GRAPH_JSON: 'application/json'
};