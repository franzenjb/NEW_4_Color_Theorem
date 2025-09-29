# NEW_4_Color_Theorem — Project Specification & Vision

## 1. Project Overview  
This is an educational, interactive web application for **advanced users** (artists, cartographers, GIS professionals) to explore, visualize, and experiment with the **Four Color Theorem** and extensions into multivariate mapping (e.g. bivariate choropleths). The design is refined, serious, and avoids gimmicks — this is not for casual users or playful styling.

## 2. Core Functionality & Requirements

### 2.1 Theorem & Demonstration  
- Provide a clear, precise explanation of the Four Color Theorem (in prose + diagrams).  
- Show curated example maps, planar graphs, and adjacency diagrams (SVG/PNG).  
- Let users **manually color** regions or graphs using a palette (click/select).  
- Provide an **auto-color** mode that computes a valid 4-coloring automatically.

### 2.2 State Management & Controls  
- Support **undo** for multiple steps (configurable default, e.g. 20).  
- Support **full reset** — revert to the original uncolored state.  
- No server persistence needed in the initial version; state lives client-side.

### 2.3 Export & Share  
- Allow **export/download** of the colored result: SVG and PNG formats.  
- Simple and clean output, suitable for embedding or sharing.

### 2.4 Extensions & Data Integration  
- Accept **CSV** or **GeoJSON** uploads (map or region data).  
- From uploaded data, derive region adjacency / map geometry.  
- Render uploaded maps and allow coloring / choropleth overlays.  
- Optionally use mapping libraries (Leaflet, MapLibre, D3) for interaction, zoom, overlays.

### 2.5 Responsive & Accessible UI  
- Target **desktop** as the primary platform.  
- Support **tablet** view gracefully (reflow layout, simplified UI).  
- Mobile support if feasible (but not at cost of desktop experience).  
- Use strong contrast, keyboard navigation, clear labels, and screen reader compatibility.

## 3. Architectural Boundaries & Modules

### 3.1 *theorem_engine* Module  
- Pure logic module (no UI dependencies).  
- Accepts adjacency / graph input and outputs color assignments.  
- Methods:  
  - `computeColoring(graph) → coloring`  
  - `validateColoring(graph, coloring) → boolean`  
  - `undo()`  
  - `reset()`  

### 3.2 *map_engine* Module  
- UI / rendering module (SVG, Canvas, or map library).  
- Accepts coloring from theorem_engine and applies it visually.  
- Handles map / region data ingestion (CSV/GeoJSON), user interactions (click, hover), tooltips.  
- Provides `exportSVG()` and `exportPNG()`.

### 3.3 Shared Contracts & Data Types  
Define a shared contract layer (e.g. `src/contracts/`) with types/interfaces for:  
- Graph / adjacency structure  
- Region / map geometry  
- Color assignments  
- Metadata (region names, colors, IDs)

### 3.4 Interaction Flow  
1. App loads a default example or user-uploaded map.  
2. User manually colors or hits auto-color.  
3. theorem_engine produces or verifies coloring.  
4. map_engine renders result, handles UI events.  
5. Undo / reset / export / re-upload features interact with both modules.

## 4. Task Sketch (Order of Implementation)

- Project skeleton & directory structure  
- Load/display example maps / graphs  
- Manual coloring UI  
- Undo / reset logic  
- Auto-color algorithm (DSATUR, greedy)  
- Export (SVG / PNG)  
- CSV / GeoJSON upload and parsing  
- Rendering uploaded maps  
- Integration with mapping library (Leaflet, etc.)  
- Responsive UI, accessibility, polish  
- Testing (coloring logic, file parsing, rendering)  
- Documentation, readme, examples