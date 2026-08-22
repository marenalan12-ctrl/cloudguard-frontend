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