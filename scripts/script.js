document.addEventListener("DOMContentLoaded", () => {
  // Initialize DOM references
  initializeDOMReferences();

  // Ensure chart container is visible and properly sized
  const chartContainer = document.getElementById("chart-container");
  if (chartContainer && chartContainer.offsetHeight === 0) {
    console.warn("Chart container has zero height. Ensuring proper styling.");
    chartContainer.style.minHeight = "500px";
  }

  const csvFile = document.getElementById("csvFile");
  if (csvFile) csvFile.addEventListener("change", validateCSV);
});

// Global app state
const AppState = {
  chartInstance: null,
  data: [],
  timeIndex: null,
  ampIndex: null,
  isSymbolsVisible: false,
  xAxisPrecision: 3,
  timeUnit: "s",
  cursorA: null,
  cursorB: null,
  analysisResults: null,
  globalStats: null,
  yScale: { min: null, max: null },
};

let CHART_DOM = null;
let LOADING_OVERLAY = null;

const MARK_AREA_COLOR = "rgba(173, 216, 230, 0.4)";
const DATA_SHADOW_COLOR = "rgba(255, 99, 71, 0.8)";

// Initialize chart and overlay elements
function initializeDOMReferences() {
  CHART_DOM = document.getElementById("chart-container");
  LOADING_OVERLAY = document.getElementById("loading-overlay");

  if (!CHART_DOM) console.warn("Chart container not found");
  if (!LOADING_OVERLAY) console.warn("Loading overlay not found");
}

// Check if file is a valid CSV
function validateCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".csv") && fileName !== "") {
    alert("Please select a valid .csv file.");
    event.target.value = "";
    return;
  }
  handleFileSelect(event);
}

// Show loading overlay
function showLoading() {
  if (LOADING_OVERLAY) LOADING_OVERLAY.classList.add("visible");
}

// Hide loading overlay
function hideLoading() {
  if (LOADING_OVERLAY) LOADING_OVERLAY.classList.remove("visible");
}

// Show temporary message
function showToast(message, duration = 1200) {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  toastContainer.appendChild(toast);
  void toast.offsetWidth;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}

// Format time value with unit
function formatTime(value, unit, precision) {
  let val;
  let suffix;
  if (unit === "s") {
    val = value;
    suffix = " s";
  } else if (unit === "ms") {
    val = value * 1000;
    suffix = " ms";
  } else {
    val = value * 1000000;
    suffix = " μs";
  }
  return val.toFixed(precision) + suffix;
}

// Calculate decimal places for time span
function getDecimalPlaces(valueSpan) {
  if (valueSpan >= 1) return 3;
  if (valueSpan >= 0.1) return 4;
  if (valueSpan >= 0.01) return 5;
  if (valueSpan >= 0.001) return 6;
  if (valueSpan >= 0.0001) return 7;
  return 8;
}

// Pick time unit based on visible span
function determineTimeUnit(visibleSpan) {
  if (visibleSpan >= 0.1) {
    return {
      unit: "s",
      precision: Math.max(3, getDecimalPlaces(visibleSpan / 10)),
    };
  }
  if (visibleSpan >= 0.0001) {
    return {
      unit: "ms",
      precision: Math.max(3, getDecimalPlaces((visibleSpan * 1000) / 10)),
    };
  }
  return {
    unit: "us",
    precision: Math.max(3, getDecimalPlaces((visibleSpan * 1000000) / 10)),
  };
}

// Handle file selection and parse CSV
function handleFileSelect(event) {
  const file = event.target.files[0];
  const loadedFileNameSpan = document.getElementById("loaded-file-name");

  if (!file) {
    showToast("No file selected.", 2000);
    return;
  }

  loadedFileNameSpan.textContent = `File: ${file.name}`;
  showToast(`Loading "${file.name}"...`, 2000);
  showLoading();

  if (AppState.cursorA) {
    clearChart();
  }

  setTimeout(() => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function (results) {
        processData(results);
      },
      error: function (error) {
        console.error("PapaParse error:", error);
        showToast(`Error parsing file: ${error.message}`, 3000);
        loadedFileNameSpan.textContent = "Error loading file.";
        hideLoading();
      },
    });
  }, 50);
}

// Process CSV data and prepare arrays
function processData(results) {
  try {
    const headers = results.meta.fields;

    if (!headers || headers.length < 2) {
      throw new Error("The CSV file does not have valid headers.");
    }

    const timeKey = findColumnKey(headers, "Time (s)");
    const currentKey = findColumnKey(headers, "Current (mA)");

    if (!timeKey || !currentKey) {
      throw new Error("Columns 'Time (s)' or 'Current (mA)' not found.");
    }

    const rawData = results.data;
    const len = rawData.length;

    AppState.data = [];
    AppState.timeIndex = new Float32Array(len);
    AppState.ampIndex = new Float32Array(len);

    let validCount = 0;
    for (let i = 0; i < len; i++) {
      const row = rawData[i];
      const t = row[timeKey];
      const c = row[currentKey];

      if (
        typeof t === "number" &&
        typeof c === "number" &&
        !isNaN(t) &&
        !isNaN(c)
      ) {
        AppState.data.push([t, c]);
        AppState.timeIndex[validCount] = t;
        AppState.ampIndex[validCount] = c;
        validCount++;
      }
    }

    if (validCount < len) {
      AppState.timeIndex = AppState.timeIndex.slice(0, validCount);
      AppState.ampIndex = AppState.ampIndex.slice(0, validCount);
    }

    if (AppState.data.length === 0) throw new Error("No valid data found.");

    calculateGlobalStats();
    showToast(
      `Chart loaded with ${AppState.data.length.toLocaleString(
        "en-US"
      )} points.`,
      3000
    );

    renderChart();

    const btnSymbols = document.getElementById("toggleSymbolsButton");
    const btnExport = document.getElementById("exportButton");
    const btnReset = document.getElementById("resetZoomButton");
    if (btnSymbols) btnSymbols.disabled = false;
    if (btnExport) btnExport.disabled = false;
    if (btnReset) btnReset.disabled = false;

    hideLoading();
  } catch (e) {
    console.error("Error processing CSV:", e);
    showToast(`ERROR: ${e.message}`, 3000);
    hideLoading();
  }
}

// Calculate min, max, avg from data
function calculateGlobalStats() {
  if (AppState.data.length === 0) {
    AppState.globalStats = null;
  } else {
    let minVal = Infinity;
    let maxVal = -Infinity;
    let sumVal = 0;
    const arr = AppState.ampIndex;
    const len = arr.length;

    for (let i = 0; i < len; i++) {
      const value = arr[i];
      if (value < minVal) minVal = value;
      if (value > maxVal) maxVal = value;
      sumVal += value;
    }

    AppState.globalStats = {
      count: len,
      minVal: minVal,
      maxVal: maxVal,
      avgVal: sumVal / len,
    };
  }

  if (AppState.globalStats) {
    AppState.globalStats.count = AppState.globalStats.count
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  updateGlobalStatsUI();
}

// Find column header matching target
function findColumnKey(headers, target) {
  const normalizedTarget = target.toLowerCase().replace(/\s/g, "");
  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().replace(/\s/g, "");
    if (normalizedHeader === normalizedTarget) {
      return header;
    }
  }
  return null;
}

// Update global stats display
function updateGlobalStatsUI() {
  updateDisplay(AppState.globalStats, globalStatsMap);
}

// Update digital display with analysis
function updateDigitalDisplay() {
  updateDisplay(AppState.analysisResults, digitalDisplayMap);
}

// Generic display update function
function updateDisplay(data, map) {
  for (const item of map) {
    const element = document.getElementById(item.id);
    if (element) {
      const value = item.formatter
        ? item.formatter(data)
        : data
        ? data[item.key]
        : "---";
      element.textContent = value;
    }
  }
}

// Map for global stats display
const globalStatsMap = [
  {
    id: "stats-count",
    key: "count",
    formatter: (d) => (d ? d.count.toLocaleString("en-US") : "---"),
  },
  {
    id: "stats-min",
    key: "minVal",
    formatter: (d) => (d ? d.minVal.toFixed(2) + " mA" : "---"),
  },
  {
    id: "stats-max",
    key: "maxVal",
    formatter: (d) => (d ? d.maxVal.toFixed(2) + " mA" : "---"),
  },
  {
    id: "stats-avg",
    key: "avgVal",
    formatter: (d) => (d ? d.avgVal.toFixed(2) + " mA" : "---"),
  },
];

// Map for digital display with analysis
const digitalDisplayMap = [
  {
    id: "display-dt",
    key: "finalTimeDeltaFormatted",
    formatter: (d) => (d ? d.finalTimeDeltaFormatted : "---"),
  },
  {
    id: "display-count-ab",
    key: "count",
    formatter: (d) => (d ? d.count.toLocaleString("en-US") : "---"),
  },
  {
    id: "display-max",
    key: "maxVal",
    formatter: (d) => (d ? d.maxVal.toFixed(2) + " mA" : "---"),
  },
  {
    id: "display-avg",
    key: "avgVal",
    formatter: (d) => (d ? d.avgVal.toFixed(2) + " mA" : "---"),
  },
];

// Chart config with tooltip, legend, axes, datazoom
const baseChartOption = {
  animation: false,
  tooltip: {
    trigger: "axis",
    formatter: function (params) {
      if (!params || params.length === 0) return "";
      const dataPoint = params.find((p) => p.seriesName === "Current");
      if (!dataPoint) return "";

      const timeValue = dataPoint.value[0];
      const currentValue = dataPoint.value[1];
      let html = "";
      const analysis = AppState.analysisResults;
      const isAnalysisComplete =
        AppState.cursorA && AppState.cursorB && analysis;

      html += `T: ${formatTime(timeValue, "s", 6)}<br/>`;
      html += `${dataPoint.marker} Current: ${currentValue.toFixed(2)} mA`;

      if (isAnalysisComplete) {
        html += '<hr style="margin: 4px 0;">';
        html +=
          '<span style="color: #007bff; font-weight: bold;">Measurement Result (A - B)</span><br/>';
        html += `Δt: ${analysis.finalTimeDeltaFormatted}<br/>`;
        html += `Points: ${analysis.count.toLocaleString("en-US")}<br/>`;
        html += `Maximum: ${analysis.maxVal.toFixed(2)} mA<br/>`;
        html += `Average: ${analysis.avgVal.toFixed(2)} mA`;
      }
      if (AppState.cursorA && !AppState.cursorB) {
        html += '<hr style="margin: 4px 0;">';
        html +=
          '<span style="color: #DC3545; font-weight: bold;">Waiting for Cursor B...</span>';
      }
      return html;
    },
  },
  legend: { data: ["Current"] },
  grid: [
    {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
      z: 2,
      id: "mainGrid",
    },
  ],
  xAxis: [
    {
      gridIndex: 0,
      id: "mainXAxis",
      type: "value",
      name: "Time",
      min: "dataMin",
      max: "dataMax",
      nameLocation: "middle",
      nameTextStyle: { padding: [20, 0, 0, 0] },
      axisLabel: {
        formatter: (value) => value.toFixed(AppState.xAxisPrecision) + " s",
      },
    },
  ],
  yAxis: {
    gridIndex: 0,
    type: "value",
    name: "Current (mA)",
    axisLabel: { formatter: (value) => value.toFixed(0) + " mA" },
  },
  dataZoom: [
    {
      type: "inside",
      xAxisIndex: [0],
      realtime: false,
    },
    {
      type: "slider",
      xAxisIndex: [0],
      bottom: 0,
      height: 40,
      showDataShadow: true,
      fillerColor: "rgba(255,165,0,0.2)",
      dataBackground: { areaStyle: { color: DATA_SHADOW_COLOR } },
      handleStyle: {
        color: "#ccc",
        shadowBlur: 3,
        shadowColor: "rgba(0, 0, 0, 0.6)",
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
      realtime: false,
      throttle: 0,
    },
  ],
  series: [
    {
      name: "Current",
      type: "line",
      xAxisIndex: 0,
      smooth: false,
      sampling: "lttb",
      showSymbol: AppState.isSymbolsVisible,
      data: [],
      lineStyle: { width: 1, color: "#4a90e2" },
      itemStyle: { color: "#007bff" },
      id: "mainSeries",
      markLine: { symbol: "none", data: [] },
      markArea: { data: [] },
    },
    {
      name: "Cursors",
      type: "scatter",
      symbolSize: 10,
      data: [],
      itemStyle: {
        color: "rgba(0, 0, 0, 0)",
        borderColor: "#e74c3c",
        borderWidth: 2,
        opacity: 1,
      },
      xAxisIndex: 0,
      yAxisIndex: 0,
      z: 10,
    },
  ],
};

// Update chart with new options
function updateChartOption(changes) {
  if (AppState.chartInstance) {
    AppState.chartInstance.setOption(changes);
  }
}

let resizeTimeout;

function renderChart() {
  try {
    if (!CHART_DOM) return;

    if (!AppState.chartInstance) {
      CHART_DOM.style.width = "100%";
      CHART_DOM.style.height = "100%";

      if (typeof echarts === "undefined") {
        showToast("ERROR: ECharts library failed to load.", 3000);
        return;
      }

      AppState.chartInstance = echarts.init(CHART_DOM, null, {
        renderer: "svg",
      });

      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (AppState.chartInstance) {
            AppState.chartInstance.resize();
          }
        }, 300);
      });
    }

    // Apply scale
    baseChartOption.yAxis.min =
      AppState.yScale.min === null ? "dataMin" : AppState.yScale.min;
    baseChartOption.yAxis.max =
      AppState.yScale.max === null ? "dataMax" : AppState.yScale.max;

    baseChartOption.series[0].data = AppState.data;
    baseChartOption.series[0].showSymbol = AppState.isSymbolsVisible;

    // Use 'true' to merge options but clean up old data if necessary
    AppState.chartInstance.setOption(baseChartOption, true);

    updateXAxisPrecision();

    AppState.chartInstance.getZr().off("click");
    AppState.chartInstance.getZr().on("click", handleChartClick);

    AppState.chartInstance.off("datazoom", updateXAxisPrecision);
    AppState.chartInstance.on("datazoom", updateXAxisPrecision);
    AppState.chartInstance.off("datazoom", updateCursorVisuals);
    AppState.chartInstance.on("datazoom", updateCursorVisuals);
  } catch (error) {
    console.error("Error rendering chart:", error);
    showToast(`ERROR: Failed to render chart. ${error.message}`, 3000);
  }
}

// Reset zoom level to show all data
function resetXAxisZoom() {
  if (!AppState.chartInstance || AppState.data.length === 0) {
    showToast("Load data first.", 1000);
    return;
  }

  updateChartOption({
    dataZoom: [
      { type: "inside", xAxisIndex: [0] },
      {
        dataBackground: { areaStyle: { color: "transparent", opacity: 0 } },
        showDataShadow: false,
        type: "slider",
        xAxisIndex: [0],
      },
    ],
  });

  AppState.chartInstance.dispatchAction({
    type: "dataZoom",
    xAxisIndex: [0],
    start: 0,
    end: 100,
  });

  setTimeout(() => {
    updateChartOption({
      dataZoom: [
        { type: "inside", xAxisIndex: [0] },
        {
          dataBackground: {
            areaStyle: { color: DATA_SHADOW_COLOR, opacity: 1 },
          },
          showDataShadow: true,
          type: "slider",
          xAxisIndex: [0],
        },
      ],
    });
    showToast("Zoom reseted.", 800);
  }, 100);
}

// Update x-axis precision based on zoom level
function updateXAxisPrecision() {
  if (!AppState.chartInstance || AppState.data.length === 0) return;

  const dataZoomOpt = AppState.chartInstance
    .getOption()
    .dataZoom.find((dz) => dz.xAxisIndex && dz.xAxisIndex.includes(0));
  if (!dataZoomOpt) return;

  const dataStart = AppState.timeIndex[0];
  const dataEnd = AppState.timeIndex[AppState.timeIndex.length - 1];
  const startPercentage = dataZoomOpt.start || 0;
  const endPercentage = dataZoomOpt.end || 100;

  const startValue =
    dataStart + (dataEnd - dataStart) * (startPercentage / 100);
  const endValue = dataStart + (dataEnd - dataStart) * (endPercentage / 100);
  const visibleSpan = Math.abs(endValue - startValue);

  const { unit: newUnit, precision: newPrecision } =
    determineTimeUnit(visibleSpan);

  if (
    newPrecision !== AppState.xAxisPrecision ||
    newUnit !== AppState.timeUnit
  ) {
    AppState.xAxisPrecision = newPrecision;
    AppState.timeUnit = newUnit;

    updateChartOption({
      xAxis: [
        {
          id: "mainXAxis",
          name: `Time (${
            AppState.timeUnit === "us" ? "μs" : AppState.timeUnit
          })`,
          axisLabel: {
            formatter: (value) =>
              formatTime(value, AppState.timeUnit, AppState.xAxisPrecision),
          },
        },
      ],
    });
  }
}

// Apply custom Y-axis scale
function applyYAxisScale() {
  if (!AppState.chartInstance) return;
  const minYInput = document.getElementById("minY").value;
  const maxYInput = document.getElementById("maxY").value;

  AppState.yScale.min = minYInput !== "" ? parseFloat(minYInput) : null;
  AppState.yScale.max = maxYInput !== "" ? parseFloat(maxYInput) : null;

  updateChartOption({
    yAxis: {
      min: AppState.yScale.min === null ? "dataMin" : AppState.yScale.min,
      max: AppState.yScale.max === null ? "dataMax" : AppState.yScale.max,
    },
  });
}

// Reset Y-axis scale to auto
function resetYAxisScale(isFullClear = false) {
  if (!AppState.chartInstance || !isFullClear) {
    const minEl = document.getElementById("minY");
    const maxEl = document.getElementById("maxY");
    if (minEl) minEl.value = "";
    if (maxEl) maxEl.value = "";

    AppState.yScale.min = null;
    AppState.yScale.max = null;
    if (AppState.chartInstance) applyYAxisScale();
  }
}

// Toggle point symbols on/off
function toggleSymbols() {
  if (!AppState.chartInstance || AppState.data.length === 0) return;

  AppState.isSymbolsVisible = !AppState.isSymbolsVisible;

  updateChartOption({
    series: [
      {
        id: "mainSeries",
        showSymbol: AppState.isSymbolsVisible,
        symbolSize: AppState.isSymbolsVisible ? 4 : 0,
      },
    ],
  });
  const text = `Show Points (${AppState.isSymbolsVisible ? "On" : "Off"})`;
  const btn = document.getElementById("toggleSymbolsButton");
  if (btn) {
    btn.textContent = text;
    btn.classList.toggle("secondary", !AppState.isSymbolsVisible);
  }
  showToast(text, 800);
}

// Binary search to find closest value
function binarySearchClosest(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let mid;

  while (left <= right) {
    mid = (left + right) >>> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  if (left >= arr.length) return arr.length - 1;
  if (left <= 0) return 0;
  const valLeft = arr[left];
  const valPrev = arr[left - 1];
  return Math.abs(valLeft - target) < Math.abs(valPrev - target)
    ? left
    : left - 1;
}

// Handle chart click to set cursor
function handleChartClick(params) {
  if (!AppState.chartInstance || AppState.data.length === 0) return;

  const pointInPixel = [params.offsetX, params.offsetY];

  if (!AppState.chartInstance.containPixel("grid", pointInPixel)) return;

  const pointInGrid = AppState.chartInstance.convertFromPixel(
    "grid",
    pointInPixel
  );
  const clickedTime = Array.isArray(pointInGrid) ? pointInGrid[0] : NaN;
  if (!isFinite(clickedTime)) return;

  const idx = binarySearchClosest(AppState.timeIndex, clickedTime);

  const time = AppState.timeIndex[idx];
  const current = AppState.ampIndex[idx];

  if (AppState.cursorA === null || AppState.cursorB !== null) {
    AppState.cursorA = { time: time, current: current, name: "A" };
    AppState.cursorB = null;
    AppState.analysisResults = null;
    showToast(
      `Cursor A set at ${formatTime(
        time,
        AppState.timeUnit,
        AppState.xAxisPrecision
      )} (${current.toFixed(2)} mA)`,
      1000
    );
  } else {
    AppState.cursorB = { time: time, current: current, name: "B" };
    calculateAnalysis();
    showToast(
      `Cursor B set at ${formatTime(
        time,
        AppState.timeUnit,
        AppState.xAxisPrecision
      )} (${current.toFixed(2)} mA)`,
      1000
    );
  }

  updateCursorVisuals();
}

// Wrapper for click event
function setCursorPoint(params) {
  if (params.event) handleChartClick(params.event);
}

// Calculate analysis between two cursors
function calculateAnalysis() {
  if (!AppState.cursorA || !AppState.cursorB) {
    AppState.analysisResults = null;
    return;
  }

  const t1 = Math.min(AppState.cursorA.time, AppState.cursorB.time);
  const t2 = Math.max(AppState.cursorA.time, AppState.cursorB.time);

  const startIdx = binarySearchClosest(AppState.timeIndex, t1);
  const endIdx = binarySearchClosest(AppState.timeIndex, t2);

  const count = endIdx - startIdx + 1;

  if (count < 2) {
    AppState.analysisResults = null;
    return;
  }

  const finalTimeDelta =
    AppState.timeIndex[endIdx] - AppState.timeIndex[startIdx];
  const { unit: deltaUnit, precision: deltaPrecision } =
    determineTimeUnit(finalTimeDelta);
  const finalTimeDeltaFormatted = formatTime(
    finalTimeDelta,
    deltaUnit,
    Math.max(deltaPrecision, 6)
  );

  let maxVal = -Infinity;
  let sumVal = 0;

  for (let i = startIdx; i <= endIdx; i++) {
    const val = AppState.ampIndex[i];
    if (val > maxVal) maxVal = val;
    sumVal += val;
  }

  AppState.analysisResults = {
    avgVal: sumVal / count,
    maxVal,
    finalTimeDeltaFormatted,
    count: count,
  };
}

function updateCursorVisuals() {
  if (!AppState.chartInstance) return;
  const markAreas = [];
  const markers = [];
  const markLines = [];

  // Construct data
  if (AppState.cursorA) {
    markers.push([AppState.cursorA.time, AppState.cursorA.current]);
    markLines.push({
      xAxis: AppState.cursorA.time,
      xAxisIndex: 0,
      z: 1,
      lineStyle: { color: "#e74c3c", width: 2, type: "solid" },
      label: { formatter: "A", position: "insideEndTop" },
      silent: true,
    });
  }
  if (AppState.cursorB) {
    markers.push([AppState.cursorB.time, AppState.cursorB.current]);
    markLines.push({
      xAxis: AppState.cursorB.time,
      xAxisIndex: 0,
      z: 60,
      lineStyle: { color: "#3498db", width: 2, type: "solid" },
      label: { formatter: "B", position: "insideEndTop" },
      silent: true,
    });
  }

  if (AppState.cursorA && AppState.cursorB) {
    // Area highlight remains on main series (it looks better there)
    markAreas.push([
      {
        xAxis: AppState.cursorA.time,
        xAxisIndex: 0,
        itemStyle: { color: MARK_AREA_COLOR, opacity: 0.5 },
      },
      { xAxis: AppState.cursorB.time, xAxisIndex: 0 },
    ]);
  }

  updateChartOption({
    series: [
      {
        id: "mainSeries",
        sampling: AppState.cursorA || AppState.cursorB ? false : "lttb",
        markLine: { data: [] },
        markArea: { data: markAreas },
      },
      {
        name: "Cursors",
        data: markers,
        markLine: {
          symbol: ["none", "none"],
          animation: false,
          silent: true,
          data: markLines,
        },
      },
    ],
  });
  updateDigitalDisplay();
  renderCursorOverlays();
}

// Clear both cursors
function clearCursors() {
  AppState.cursorA = null;
  AppState.cursorB = null;
  AppState.analysisResults = null;
  if (AppState.chartInstance) {
    updateCursorVisuals();
    AppState.chartInstance.dispatchAction({ type: "hideTip" });
  }
  updateDigitalDisplay();
  showToast("Cursors cleared.", 800);
}

// Clear entire chart and reset
function clearChart() {
  AppState.data = [];
  AppState.timeIndex = null;
  AppState.ampIndex = null;
  AppState.globalStats = null;
  AppState.isSymbolsVisible = false;
  AppState.yScale = { min: null, max: null };

  if (AppState.chartInstance) {
    AppState.chartInstance.dispose();
    AppState.chartInstance = null;
  }

  clearCursors();
  updateGlobalStatsUI();
  resetYAxisScale(true);

  const nameEl = document.getElementById("loaded-file-name");
  const fileEl = document.getElementById("csvFile");
  if (nameEl) nameEl.textContent = "No file selected.";
  if (fileEl) fileEl.value = "";

  showToast("Chart cleared. Load a new file.");

  const ids = ["toggleSymbolsButton", "exportButton", "resetZoomButton"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  });

  const symBtn = document.getElementById("toggleSymbolsButton");
  if (symBtn) {
    symBtn.textContent = "Show Points (Off)";
    symBtn.classList.add("secondary");
  }

  hideLoading();
}

// Export chart as SVG with analysis
function exportChartAsSVG() {
  if (!AppState.chartInstance || AppState.data.length === 0) {
    showToast("Load data first.", 1000);
    return;
  }

  try {
    const globalData = AppState.globalStats
      ? `Points: ${AppState.globalStats.count.toLocaleString(
          "en-US"
        )} | Overall Avg: ${AppState.globalStats.avgVal.toFixed(
          2
        )} mA | Overall Max: ${AppState.globalStats.maxVal.toFixed(2)} mA`
      : "Global Statistics: N/A";

    const analysisData = AppState.analysisResults
      ? `Analysis (A-B): Δt: ${
          AppState.analysisResults.finalTimeDeltaFormatted
        } | Points: ${AppState.analysisResults.count.toLocaleString(
          "en-US"
        )} | Avg: ${AppState.analysisResults.avgVal.toFixed(
          2
        )} mA | Max: ${AppState.analysisResults.maxVal.toFixed(2)} mA`
      : "Analysis (A-B): Cursors A and B not defined";

    const svgElement = CHART_DOM.querySelector("svg");
    if (!svgElement) {
      showToast("Error: Chart not rendered in SVG.", 2000);
      return;
    }

    const clonedSvg = svgElement.cloneNode(true);
    const originalWidth = parseFloat(clonedSvg.getAttribute("width"));
    const originalHeight = parseFloat(clonedSvg.getAttribute("height"));

    const padding = 10;
    const lineHeight = 20;
    const textHeight = lineHeight * 3;
    const newHeight = originalHeight + textHeight + padding * 3;

    clonedSvg.setAttribute("height", newHeight);
    clonedSvg.setAttribute("viewBox", `0 0 ${originalWidth} ${newHeight}`);

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(0, ${originalHeight + padding})`);

    let yPos = padding;
    const createText = (y, fontSize, fontWeight, fill, textContent) => {
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", padding);
      text.setAttribute("y", y);
      text.setAttribute("font-size", fontSize);
      text.setAttribute("font-weight", fontWeight);
      text.setAttribute("fill", fill);
      text.textContent = textContent;
      return text;
    };

    g.appendChild(
      createText(yPos, "14", "bold", "#333", "Analysis Information:")
    );
    yPos += lineHeight;
    g.appendChild(
      createText(yPos, "12", "normal", "#555", `Global: ${globalData}`)
    );
    yPos += lineHeight;
    g.appendChild(createText(yPos, "12", "normal", "#007bff", analysisData));

    clonedSvg.appendChild(g);

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clonedSvg);

    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace(
        "<svg ",
        '<svg xmlns="http://www.w3.org/2000/svg" '
      );
    }

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = `osciloscopio_export_${new Date()
      .toISOString()
      .slice(0, 10)}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showToast("Chart exported as SVG (Vector).", 1500);
  } catch (e) {
    console.error("Error exporting SVG chart:", e);
    showToast("Error exporting. Check the console.", 2000);
  }
}

// Render vertical cursor overlays limited to grid
function renderCursorOverlays() {
  if (!AppState.chartInstance || !CHART_DOM) return;

  function getOrCreate(className) {
    const selector = "." + className.trim().split(/\s+/).join(".");
    let node = CHART_DOM.querySelector(selector);
    if (!node) {
      node = document.createElement("div");
      node.className = className;
      CHART_DOM.appendChild(node);
    }
    return node;
  }

  if (!AppState.cursorA && !AppState.cursorB) {
    const existing = CHART_DOM.querySelectorAll(
      ".chart-cursor-indicator, .cursor-label"
    );
    existing.forEach((n) => n.remove());
    return;
  }

  const sampleY =
    AppState.ampIndex && AppState.ampIndex.length
      ? AppState.ampIndex[Math.floor(AppState.ampIndex.length / 2)]
      : 0;

  let gridTop = 0,
    gridHeight = CHART_DOM.clientHeight;
  try {
    const gridComp = AppState.chartInstance.getModel().getComponent("grid", 0);
    if (gridComp && typeof gridComp.getRect === "function") {
      const rect = gridComp.getRect();
      if (rect) {
        gridTop = rect.y || 0;
        gridHeight = rect.height || gridHeight;
      }
    }
  } catch (e) {
    gridTop = 0;
    gridHeight = CHART_DOM.clientHeight;
  }

  if (AppState.cursorA && typeof AppState.cursorA.time === "number") {
    const x = AppState.chartInstance.convertToPixel("grid", [
      AppState.cursorA.time,
      sampleY,
    ])[0];
    const el = getOrCreate("chart-cursor-indicator cursor-a");
    el.style.position = "absolute";
    el.style.left = `${x}px`;
    el.style.top = `${gridTop}px`;
    el.style.width = "2px";
    el.style.height = `${gridHeight}px`;
    el.style.background = "#e74c3c";
    el.style.boxShadow = "0 0 6px rgba(231, 76, 60, 0.8)";

    let lab = CHART_DOM.querySelector(".cursor-label.label-a");
    if (!lab) {
      lab = document.createElement("div");
      lab.className = "cursor-label label-a";
      lab.textContent = "A";
      CHART_DOM.appendChild(lab);
    }
    lab.style.position = "absolute";
    lab.style.left = `${x}px`;
    lab.style.top = `${Math.max(0, gridTop - 18)}px`;
  }

  if (AppState.cursorB && typeof AppState.cursorB.time === "number") {
    const x = AppState.chartInstance.convertToPixel("grid", [
      AppState.cursorB.time,
      sampleY,
    ])[0];
    const el = getOrCreate("chart-cursor-indicator cursor-b");
    el.style.position = "absolute";
    el.style.left = `${x}px`;
    el.style.top = `${gridTop}px`;
    el.style.width = "2px";
    el.style.height = `${gridHeight}px`;
    el.style.background = "#3498db";
    el.style.boxShadow = "0 0 6px rgba(52, 152, 219, 0.8)";

    let lab = CHART_DOM.querySelector(".cursor-label.label-b");
    if (!lab) {
      lab = document.createElement("div");
      lab.className = "cursor-label label-b";
      lab.textContent = "B";
      CHART_DOM.appendChild(lab);
    }
    lab.style.position = "absolute";
    lab.style.left = `${x}px`;
    lab.style.top = `${Math.max(0, gridTop - 18)}px`;
  }
}

// Initialize page
window.onload = () => {
  updateGlobalStatsUI();
  updateDigitalDisplay();
};
