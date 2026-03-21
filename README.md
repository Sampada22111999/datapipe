# DataPipe — Pipeline Studio

A production-grade React application for loading CSV and Excel files, applying a configurable sequence of data transformation operations, and writing the output to a downloadable CSV file or an in-memory database table.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Operations](#available-operations)
- [How to Use](#how-to-use)
- [Configuration Files](#configuration-files)
- [Output Targets](#output-targets)
- [Scripts](#scripts)
- [Architecture Notes](#architecture-notes)

---

## Features

- **Drag-and-drop file loading** — supports `.csv`, `.xlsx`, and `.xls` files
- **8 pipeline operation types** — filter, rename, drop column, add column, sort, deduplicate, transform, limit
- **Configurable pipeline** — enable/disable individual steps, reorder them, label them
- **Live data preview** — paginated table viewer for source data, pipeline output, and database tables
- **Two output targets** — download as CSV or write to an in-memory database table
- **Pipeline config import/export** — save your pipeline as JSON and reload it later
- **Execution log** — per-step log showing row counts, deltas, duration, and any errors
- **Summary stats** — row and column delta between source and output

---

## Tech Stack

| Package           | Version   | Purpose                          |
|-------------------|-----------|----------------------------------|
| React             | ^18.2.0   | UI framework                     |
| Vite              | ^5.1.4    | Build tool and dev server        |
| Zustand           | ^4.4.7    | Global state management          |
| xlsx (SheetJS)    | ^0.18.5   | Excel file parsing               |
| clsx              | ^2.1.0    | Conditional class name utility   |
| lucide-react      | ^0.344.0  | Icon library                     |
| react-dropzone    | ^14.2.3   | File drag-and-drop               |

---

## Project Structure

```
datapipe/
├── index.html                          # HTML entry point
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                        # React root render
    ├── App.jsx                         # Root layout component
    ├── App.module.css                  # 3-column grid shell
    │
    ├── styles/
    │   └── globals.css                 # CSS variables, resets, scrollbars
    │
    ├── constants/
    │   └── operations.js               # Op type metadata, color tokens, operator lists
    │
    ├── utils/
    │   ├── csv.js                      # CSV parser, serialiser, download helper
    │   ├── xlsx.js                     # SheetJS wrapper for Excel parsing
    │   └── pipeline.js                 # Full pipeline execution engine (all 8 ops)
    │
    ├── store/
    │   └── useStore.js                 # Zustand store — single source of truth
    │
    ├── hooks/
    │   ├── useFileLoader.js            # File reading and parsing hook
    │   └── usePipelineRunner.js        # Pipeline run, CSV export, config I/O
    │
    └── components/
        ├── Primitives.jsx              # Button, Input, Select, Field, Badge, etc.
        ├── Primitives.module.css
        ├── AppHeader.jsx               # Top bar with logo and status message
        ├── AppHeader.module.css
        ├── FileDropZone.jsx            # Drag-and-drop / click-to-browse file input
        ├── FileDropZone.module.css
        ├── DataTable.jsx               # Paginated data grid (50 rows/page)
        ├── DataTable.module.css
        ├── OperationCard.jsx           # Collapsible card for a single pipeline step
        ├── OperationCard.module.css
        ├── OperationEditor.jsx         # Per-operation-type form fields
        ├── OperationEditor.module.css
        ├── ExecutionLog.jsx            # Per-step run results with row deltas
        ├── ExecutionLog.module.css
        ├── PipelineSummary.jsx         # Row/column delta stats grid
        ├── PipelineSummary.module.css
        ├── DatabaseBrowser.jsx         # In-memory table list with drop support
        ├── DatabaseBrowser.module.css
        ├── LeftPanel.jsx               # File input + op picker + step list + config I/O
        ├── LeftPanel.module.css
        ├── CenterPanel.jsx             # Tabbed data viewer (source / result / db)
        ├── CenterPanel.module.css
        ├── RightPanel.jsx              # Run controls + log + summary + DB browser
        └── RightPanel.module.css
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

1. **Unzip the project** (if downloaded as a zip):

   ```bash
   unzip datapipe.zip
   cd datapipe
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open in your browser:**

   ```
   http://localhost:5173
   ```

---

## Available Operations

Operations are applied in order from top to bottom. Each step can be individually enabled or disabled.

### Filter
Keeps only rows where a column value matches a condition.

| Operator       | Description                            |
|----------------|----------------------------------------|
| `equals`       | Exact string match                     |
| `not_equals`   | Does not match                         |
| `contains`     | Substring match (case-insensitive)     |
| `not_contains` | Does not contain substring             |
| `starts_with`  | Starts with value (case-insensitive)   |
| `ends_with`    | Ends with value (case-insensitive)     |
| `greater_than` | Numeric greater than                   |
| `less_than`    | Numeric less than                      |
| `not_empty`    | Cell is not blank                      |
| `is_empty`     | Cell is blank                          |

### Rename
Renames a column. All downstream steps reference the new name.

### Drop Column
Removes a column entirely from the output.

### Add Column
Computes a new column using a JavaScript expression. The variable `row` gives access to all current column values.

**Example expressions:**
```js
Number(row.price) * 1.2          // 20% markup
row.first_name + ' ' + row.last_name  // Full name
row.revenue - row.cost            // Profit
rowIndex + 1                      // Row number (1-based)
```

### Sort
Sorts all rows by a chosen column, either ascending or descending. Numeric values are sorted numerically; all others are sorted lexicographically.

### Deduplicate
Removes duplicate rows. Can deduplicate based on a single column (first occurrence kept) or across all columns (exact row match).

### Transform
Applies a built-in transformation to a column's values in place.

| Transform    | Description                      |
|--------------|----------------------------------|
| `trim`       | Removes leading/trailing spaces  |
| `uppercase`  | Converts text to UPPERCASE       |
| `lowercase`  | Converts text to lowercase       |
| `to_number`  | Parses string as a float         |
| `to_string`  | Casts value to string            |
| `round`      | Rounds to 2 decimal places       |
| `abs`        | Takes the absolute value         |

### Limit
Keeps only the first N rows of the dataset.

---

## How to Use

### 1. Load a File
Drag and drop a `.csv` or `.xlsx` / `.xls` file onto the drop zone in the left panel, or click it to open a file browser. The source data will appear in the **Source Data** tab.

### 2. Build a Pipeline
Click any operation button (Filter, Rename, Sort, etc.) to add a step to the pipeline. Each step appears as a collapsible card. Click the card to expand it and configure its fields. Steps can be:
- **Enabled/disabled** via the checkbox on the card
- **Labelled** with a human-readable description
- **Removed** using the ✕ button

### 3. Run the Pipeline
In the right panel, choose your output target (CSV or Database), then click **Run Pipeline**. The execution log will show each step's result, including how many rows were added or removed.

### 4. View the Output
Switch to the **Pipeline Output** tab in the centre panel to preview the processed data.

### 5. Export
- **CSV target:** Click **Download CSV** in the right panel to save the result.
- **Database target:** The result is written to an in-memory table visible in the **Database** tab. Click any table in the Database Browser to preview it. Tables are lost when the page is refreshed.

---

## Configuration Files

You can save and restore a pipeline configuration as a JSON file.

### Export
Click **↓ Export config** at the bottom of the left panel. A `pipeline_config.json` file will be downloaded.

### Import
Click **↑ Import config** and select a previously exported JSON file. All current pipeline steps will be replaced.

### Config format
```json
{
  "operations": [
    {
      "id": "op_1",
      "type": "filter",
      "enabled": true,
      "label": "Remove inactive users",
      "column": "status",
      "operator": "equals",
      "value": "active"
    },
    {
      "id": "op_2",
      "type": "sort",
      "enabled": true,
      "label": "Sort by signup date",
      "column": "created_at",
      "direction": "desc"
    }
  ]
}
```

---

## Output Targets

### CSV File
After running the pipeline, click **Download CSV** to save the processed data as a `.csv` file. The filename is derived from the source file name with `_processed` appended.

### Database (In-Memory)
The result is written to a named table in the browser's in-memory store. You can:
- Write multiple tables with different names in the same session
- Preview any table by clicking it in the Database Browser
- Drop a table using the ✕ button next to it

> **Note:** The in-memory database is not persisted. All tables are lost on page refresh. For persistent storage, use the CSV export and store your files externally.

---

## Scripts

| Command           | Description                                 |
|-------------------|---------------------------------------------|
| `npm run dev`     | Start the Vite development server           |
| `npm run build`   | Build for production (output to `dist/`)    |
| `npm run preview` | Preview the production build locally        |

---

## Architecture Notes

### State Management
All application state lives in a single [Zustand](https://github.com/pmndrs/zustand) store (`src/store/useStore.js`). Components read from and write to the store directly — no prop drilling. The store is intentionally kept flat and readable.

### Pipeline Engine
The execution engine (`src/utils/pipeline.js`) is a pure function — it takes rows, headers, and an operations array, and returns transformed rows, updated headers, and a log. It has no side effects and no React dependencies, making it straightforward to unit test or reuse outside the UI.

### CSS Modules
Every component has a co-located `.module.css` file. Global design tokens (colours, spacing, typography, transitions) are defined as CSS custom properties in `src/styles/globals.css` and referenced via `var(--token-name)` throughout all modules.

### Custom Hooks
- `useFileLoader` — handles file reading, format detection, parsing, and error reporting
- `usePipelineRunner` — orchestrates running the pipeline, routing output to CSV or DB, and config import/export

These hooks keep component files thin and focused purely on rendering.
