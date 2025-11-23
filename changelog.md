# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] — 2025-11-14

### Added
- Initial HTML structure with CSV upload functionality
- Basic file input with CSV file type validation
- Project foundation and project structure setup

## [0.1.1] — 2025-11-17

### Added
- External libraries for Graphs and Excel parsing
- Added basic Excel Parse data extraction and processing


## [1.0.0] — 2025-11-17

### Added
- Calculations for sample count, minimum, maximum, and average values
- PapaParse CSV integration
- CSV parsing into structured dataset
- Extraction of Time (s) and Current (mA) columns
- UI fields for computed statistics
- Tooltip, zoom, panning, and point-toggle chart features
- ECharts waveform rendering
- Cursor markers (A and B) with scatter points
- Interval analysis (Δt, points count, min/max/avg inside region)
- Region highlight via markArea
- “Clear Cursors” functionality
- SVG export with appended statistics
- Export button with validation
- Responsive layout container and mobile/tablet support
- Styled upload button, panels, statistics cards, buttons, and UI components
- Hover/focus states for improved UX
- Test CSV sample for validation
- Chart rendering when new CSV is loaded

### Improved
- Numeric validation and filtering of invalid CSV rows
- Error handling for empty or malformed datasets
- Consistent spacing, padding, and typography
- Button style consistency
- Layout and visual hierarchy in the UI
- Cursor interaction integration with chart symbol visibility
- Export compatibility (Chrome, Firefox, Inkscape)