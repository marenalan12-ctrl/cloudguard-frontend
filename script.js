async function updateDashboard() {
    try {
       const response = await fetch("https://cloudguard-backend-sgym.onrender.com/api/sensors");
        const data = await response.json();

        document.getElementById("temperature").innerText = data.temperature + "°C";
        document.getElementById("humidity").innerText = data.humidity + "%";
        document.getElementById("rain").innerText = data.rain + " mm";
        document.getElementById("waterLevel").innerText = data.waterLevel + " cm";
        document.getElementById("pressure").innerText = data.pressure + " hPa";

    } catch (error) {
        console.log("Error fetching sensor data:", error);
    }
}

// Run once immediately
updateDashboard();

// Then refresh every 3 seconds
setInterval(updateDashboard, 3000);