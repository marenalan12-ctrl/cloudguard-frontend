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

// Run once immediately
updateDashboard();

// Then refresh every 3 seconds
setInterval(updateDashboard, 3000);