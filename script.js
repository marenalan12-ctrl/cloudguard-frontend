// ---------- PAGE SWITCHING ----------

function showPage(pageName) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.style.display = "none";
    });

    const target = document.getElementById(pageName + "Page");
    if (target) {
        target.style.display = "block";
    }

    document.querySelectorAll(".menu").forEach(item => {
        item.classList.remove("active");
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }
}


// ---------- NODE POPUP ----------

function showNodeInfo(nodeNum) {
    document.getElementById("popupTitle").innerText = "Node 0" + nodeNum;
    document.getElementById("popupTemperature").innerText = document.getElementById("temperature").innerText;
    document.getElementById("popupHumidity").innerText = document.getElementById("humidity").innerText;
    document.getElementById("popupRain").innerText = document.getElementById("rain").innerText;
    document.getElementById("popupWater").innerText = document.getElementById("waterLevel").innerText;
    document.getElementById("popupPressure").innerText = document.getElementById("pressure").innerText;

    document.getElementById("nodePopup").style.display = "flex";
}

function closeNodeInfo() {
    document.getElementById("nodePopup").style.display = "none";
}


// ---------- SETTINGS TOGGLE ----------

function toggleSetting(button) {
    if (button.innerText === "ON") {
        button.innerText = "OFF";
        button.style.backgroundColor = "#e5e7eb";
        button.style.color = "#374151";
    } else {
        button.innerText = "ON";
        button.style.backgroundColor = "#2563eb";
        button.style.color = "white";
    }
}
// ---------- HISTORY STORAGE FOR CHARTS ----------

let historyLabels = [];
let tempHistory = [];
let humidityHistory = [];
let rainHistory = [];

let tempChart, humidityChart, rainChart;

function initCharts() {
    const tempCtx = document.getElementById("temperatureChart").getContext("2d");
    tempChart = new Chart(tempCtx, {
        type: "line",
        data: {
            labels: historyLabels,
            datasets: [{
                label: "Temperature (°C)",
                data: tempHistory,
                borderColor: "#ef4444",
                tension: 0.3
            }]
        }
    });

    const humidityCtx = document.getElementById("humidityChart").getContext("2d");
    humidityChart = new Chart(humidityCtx, {
        type: "line",
        data: {
            labels: historyLabels,
            datasets: [{
                label: "Humidity (%)",
                data: humidityHistory,
                borderColor: "#3b82f6",
                tension: 0.3
            }]
        }
    });

    const rainCtx = document.getElementById("rainChart").getContext("2d");
    rainChart = new Chart(rainCtx, {
        type: "line",
        data: {
            labels: historyLabels,
            datasets: [{
                label: "Rain (mm)",
                data: rainHistory,
                borderColor: "#0ea5e9",
                tension: 0.3
            }]
        }
    });
}

function updateCharts(data) {
    const timeLabel = new Date().toLocaleTimeString();

    historyLabels.push(timeLabel);
    tempHistory.push(data.temperature);
    humidityHistory.push(data.humidity);
    rainHistory.push(data.rain);

    // Keep only the last 10 readings
    if (historyLabels.length > 10) {
        historyLabels.shift();
        tempHistory.shift();
        humidityHistory.shift();
        rainHistory.shift();
    }

    tempChart.update();
    humidityChart.update();
    rainChart.update();
}


// ---------- ALERT HISTORY ----------

function addAlertRow(alertText, riskLabel) {
    const tbody = document.getElementById("alertHistory");
    const row = document.createElement("tr");

    const timeCell = document.createElement("td");
    timeCell.innerText = new Date().toLocaleTimeString();

    const alertCell = document.createElement("td");
    alertCell.innerText = alertText;

    const riskCell = document.createElement("td");
    riskCell.innerText = riskLabel;

    const statusCell = document.createElement("td");
    statusCell.innerText = "Active";

    row.appendChild(timeCell);
    row.appendChild(alertCell);
    row.appendChild(riskCell);
    row.appendChild(statusCell);

    // Newest alert at the top
    tbody.insertBefore(row, tbody.firstChild);

    // Keep only the last 10 alerts
    while (tbody.rows.length > 10) {
        tbody.deleteRow(tbody.rows.length - 1);
    }
}

let lastOverallLabel = "🟢 NORMAL";


// ---------- LIVE SENSOR DATA ----------
// ---------- LIVE SENSOR DATA + RISK LOGIC ----------

async function updateDashboard() {
    try {
        const response = await fetch("https://cloudguard-backend-sgym.onrender.com/api/sensors");
        const data = await response.json();

        // Main sensor cards
        document.getElementById("temperature").innerText = data.temperature + "°C";
        document.getElementById("humidity").innerText = data.humidity + "%";
        document.getElementById("rain").innerText = data.rain + " mm";
        document.getElementById("waterLevel").innerText = data.waterLevel + " cm";
        document.getElementById("pressure").innerText = data.pressure + " hPa";

        // Node cards (using the same shared data for now)
        document.getElementById("node1Temperature").innerText = data.temperature + " °C";
        document.getElementById("node1Humidity").innerText = data.humidity + " %";
        document.getElementById("node2Rain").innerText = data.rain + " mm";
        document.getElementById("node2Water").innerText = data.waterLevel + " cm";
        document.getElementById("node3Pressure").innerText = data.pressure + " hPa";
        document.getElementById("node3Temperature").innerText = data.temperature + " °C";

        // ---- RISK CALCULATION ----
        let score = 0;
        let statuses = {};

        // Rain risk (mm)
        if (data.rain > 50) {
            score += 30;
            statuses.rain = "🔴 High";
        } else if (data.rain > 20) {
            score += 15;
            statuses.rain = "🟠 Moderate";
        } else {
            statuses.rain = "🟢 Normal";
        }

        // Water level risk (cm)
        if (data.waterLevel > 80) {
            score += 30;
            statuses.water = "🔴 High";
        } else if (data.waterLevel > 40) {
            score += 15;
            statuses.water = "🟠 Moderate";
        } else {
            statuses.water = "🟢 Normal";
        }

        // Pressure risk (hPa) — very low pressure can signal storms
        if (data.pressure < 980) {
            score += 20;
            statuses.pressure = "🔴 High";
        } else if (data.pressure < 1000) {
            score += 10;
            statuses.pressure = "🟠 Moderate";
        } else {
            statuses.pressure = "🟢 Normal";
        }

        // Temperature risk (°C) — extreme heat
        if (data.temperature > 45) {
            score += 20;
            statuses.temperature = "🔴 High";
        } else if (data.temperature > 38) {
            score += 10;
            statuses.temperature = "🟠 Moderate";
        } else {
            statuses.temperature = "🟢 Normal";
        }

        // Cap score at 100
        if (score > 100) score = 100;

        // Overall status text
        let overallLabel = "🟢 NORMAL";
        if (score >= 60) {
            overallLabel = "🔴 CRITICAL";
        } else if (score >= 30) {
            overallLabel = "🟠 WARNING";
        }

        // ---- UPDATE UI ----

        // Top summary card
        document.getElementById("riskScore").innerText = score + " / 100";
        document.getElementById("riskStatus").innerText = overallLabel;

        // Risk analysis panel
        document.getElementById("riskAnalysis").innerText = score + " / 100";
        document.getElementById("riskDecision").innerText = overallLabel;

        document.getElementById("rainRisk").innerText = statuses.rain;
        document.getElementById("waterRisk").innerText = statuses.water;
        document.getElementById("pressureRisk").innerText = statuses.pressure;
        document.getElementById("temperatureRisk").innerText = statuses.temperature;
        // Update charts with new readings
        updateCharts(data);

        // Add alert row if status just became WARNING or CRITICAL
        if (overallLabel !== lastOverallLabel && overallLabel !== "🟢 NORMAL") {
            addAlertRow("Elevated risk detected", overallLabel);
        }
        lastOverallLabel = overallLabel;
        // Risk message
        const riskMessage = document.getElementById("riskMessage");
        if (score >= 60) {
            riskMessage.innerText = "⚠️ Multiple hazard indicators elevated. Immediate attention recommended.";
        } else if (score >= 30) {
            riskMessage.innerText = "Some environmental readings are above normal range.";
        } else {
            riskMessage.innerText = "No abnormal environmental pattern detected.";
        }

    } catch (error) {
        console.log("Error fetching sensor data:", error);
    }
}

// Run once immediately
updateDashboard();

// Then refresh every 3 seconds
setInterval(updateDashboard, 3000);

// Set up charts, then start fetching data
initCharts();
updateDashboard();
setInterval(updateDashboard, 3000);