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

    } catch (error) {
        console.log("Error fetching sensor data:", error);
    }
}

// Run once immediately
updateDashboard();

// Then refresh every 3 seconds
setInterval(updateDashboard, 3000);