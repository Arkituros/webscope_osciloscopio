# webscope_oscilloscope

## 📘Description
Web application for visualizing oscilloscope signals (current vs. time) from CSV log files.

## 🧰Features
- Real-time signal plotting with zoom
- Statistics calculation (minimum, maximum, average)
- A-B measurement cursors
- SVG graph export

## 🐳Technologies
- HTML, CSS, JavaScript
- ECharts.js and PapaParse
- Docker and GitHub Actions

## 🧭Overview of Main Tasks
- [ ] Implement Base HTML with CSV Upload
    - [X] ~~Create initial project structure (index.html, script.js, styles.css)~~
    - [X] ~~Add CSV upload input (<input type="file" accept=".csv">)~~
    - [X] ~~Display selected filename in UI~~
    - [X] ~~Add container for controls and statistics~~
    - [x]~~Implement basic file reading (JavaScript FileReader)~~
    - [ ] Validate file extension (.csv)
    - [x] ~~Error handling for empty/invalid file~~
    - [ ] Console output to confirm file loading
    - [ ] Prepare DOM placeholders for future features (stats, charts, cursors)

- [ ] Add Calculations (Sample Count, Min, Max, Average)
    - [ ] Integrate PapaParse
    - [ ] Parse CSV into a structured dataset
    - [ ] Extract required columns: Time (s), Current (mA)
    - [ ] Validate numeric conversion (filter invalid rows)
    - [ ] Calculate total samples (N points)
    - [ ] Calculate minimum current value
    - [ ] Calculate maximum current value
    - [ ] Calculate average current value
    - [ ] Display computed values in UI fields
    - [ ] Add warning if CSV contains malformed data
    - [ ] Create test CSV samples for validation (tests/sample.csv)

- [ ] Implement CSS and Full UI Styling
    - [ ] Create responsive layout container
    - [ ] Style upload button and status text
    - [ ] Add bordered panels for vertical scale controls, visualization controls, quick actions
    - [ ] Style global statistics cards
    - [ ] Style cursor analysis section (dark digital-style panels)
    - [ ] Add consistent button styles (primary, secondary)
    - [ ] Add hover/focus states for better UX
    - [ ] Ensure mobile/tablet responsiveness
    - [ ] Add consistent spacing, padding, and typography

- [ ] Implement Chart Rendering
    - [ ] Add ECharts script (via CDN)
    - [ ] Create <div id="chart-container"> with responsive size
    - [ ] Convert parsed CSV values into chart-ready arrays
    - [ ] Render waveform (Current vs Time)
    - [ ] Add zooming (dataZoom)
    - [ ] Add panning (inside zoom)
    - [ ] Add tooltip on hover
    - [ ] Add optional point display toggle
    - [ ] Handle chart updates when new CSV is loaded
    - [ ] Add error handling for empty or invalid dataset

- [ ] Implement Markers / Cursors
    - [ ] Capture click events on the chart
    - [ ] Identify nearest data point to cursor click
    - [ ] Assign cursor A on first click
    - [ ] Assign cursor B on second click
    - [ ] Add visible markers for A and B (scatter points)
    - [ ] Highlight selected region (ECharts markArea)
    - [ ] Compute Δt for selected interval
    - [ ] Compute points in interval
    - [ ] Compute min, max, average value in cursor region
    - [ ] Display computed values in the cursor analysis panel
    - [ ] Add “Clear Cursors” button functionality
    - [ ] Add “Show/Hide points” interaction if needed

- [ ] Implement Export to Image / SVG
    - [ ] Extract SVG from ECharts container
    - [ ] Append annotation text (statistics) into SVG
    - [ ] Build downloadable file (export.svg)
    - [ ] Add “Export Graph (SVG)” button
    - [ ] Disable export button if no data loaded
    - [ ] Validate exported SVG opens in Chrome, Firefox, Inkscape
    - [ ] (Optional) Add PNG export

- [ ] Implement Documentation and Report
    - [X] ~~Create README.md with project description, setup and usage instructions, screenshots, CI and Docker instructions~~
    - [ ] Create relatorio.md including branching strategy (Git Flow), change control, CI/CD workflow, versioning strategy, issue lifecycle, team reflections
    - [ ] Create CHANGELOG.md and populate with:
        - [X] ~~v0.1.0 — Initial HTML + upload~~
        - [ ] ...
        - [ ] v1.0.0 — Full features

## 👥 Authors
- **Arthur Oliveira**
- **Marinel Borges**
