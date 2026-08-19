// ============================================================
// AI-POWERED TEXTILE WASTE INTELLIGENCE PLATFORM
// Main Frontend JavaScript
// ============================================================

// ============================================================
// BACKEND URL
// ============================================================

const BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// AUTHENTICATION
// ============================================================

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

// ============================================================
// HELPER FUNCTION
// Safely get an element by ID
// ============================================================

function getElement(id) {
  return document.getElementById(id);
}

// ============================================================
// AI FABRIC PREDICTION
// ============================================================

const fabricImage = getElement("fabricImage");
const previewImage = getElement("previewImage");
const predictBtn = getElement("predictBtn");

// ------------------------------------------------------------
// Image Preview
// ------------------------------------------------------------

if (fabricImage && previewImage) {
  fabricImage.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
      previewImage.style.display = "none";
      previewImage.removeAttribute("src");
      return;
    }

    previewImage.src = URL.createObjectURL(file);

    previewImage.style.display = "block";
  });
}

// ------------------------------------------------------------
// AI Prediction
// ------------------------------------------------------------

if (predictBtn) {
  predictBtn.addEventListener("click", async function () {
    const file = fabricImage ? fabricImage.files[0] : null;

    if (!file) {
      alert("Please select a textile image first.");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    // Disable button while prediction is running
    predictBtn.disabled = true;
    predictBtn.innerText = "Predicting...";

    try {
      const response = await fetch(`${BASE_URL}/predict/`, {
        method: "POST",

        headers: getAuthHeaders(),

        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userid");

          alert("Session expired. Please login again.");

          window.location.href = "login.html";
          return;
        }

        alert(data.detail || data.message || "Prediction failed.");

        return;
      }

      // ------------------------------------------------------
      // Show Prediction Result
      // ------------------------------------------------------

      const predictionResult = getElement("predictionResult");

      if (predictionResult) {
        predictionResult.style.display = "block";
      }

      // ------------------------------------------------------
      // Basic Prediction Information
      // ------------------------------------------------------

      const predictedFabric = getElement("predictedFabric");

      const confidence = getElement("confidence");

      const predictedCategory = getElement("predictedCategory");

      if (predictedFabric) {
        predictedFabric.innerText = data.fabric_type ?? "Not available";
      }

      if (confidence) {
        confidence.innerText =
          data.confidence !== undefined
            ? `${data.confidence}%`
            : "Not available";
      }

      if (predictedCategory) {
        predictedCategory.innerText = data.waste_category ?? "Not available";
      }

      // ------------------------------------------------------
      // Additional AI Prediction Information
      // ------------------------------------------------------

      const composition = getElement("composition");

      const assessment = getElement("assessment");

      const disposal = getElement("disposal");

      const emission = getElement("emission");

      const diversion = getElement("diversion");

      const circular = getElement("circular");

      const score = getElement("score");

      const rating = getElement("rating");

      const impact = getElement("impact");

      const water = getElement("water");

      const carbonPrediction = getElement("carbonSaved");

      if (composition) {
        composition.innerText = data.estimated_composition ?? "Not available";
      }

      if (assessment) {
        assessment.innerText = data.visual_assessment ?? "Not available";
      }

      if (disposal) {
        disposal.innerText = data.recommended_disposal ?? "Not available";
      }

      if (carbonPrediction) {
        carbonPrediction.innerText =
          data.carbon_saved !== undefined
            ? `${data.carbon_saved} kg CO₂`
            : "Not available";
      }

      if (emission) {
        emission.innerText =
          data.estimated_emission !== undefined
            ? `${data.estimated_emission} kg CO₂`
            : "Not available";
      }

      if (diversion) {
        diversion.innerText =
          data.waste_diversion !== undefined
            ? data.waste_diversion
            : "Not available";
      }

      if (circular) {
        circular.innerText = data.circular_economy ?? "Not available";
      }

      if (score) {
        score.innerText =
          data.sustainability_score !== undefined
            ? data.sustainability_score
            : "Not available";
      }

      if (rating) {
        rating.innerText = data.rating ?? "Not available";
      }

      if (impact) {
        impact.innerText = data.environmental_impact ?? "Not available";
      }

      if (water) {
        water.innerText = data.water_usage ?? "Not available";
      }

      // ------------------------------------------------------
      // Auto Fill Inventory
      // ------------------------------------------------------

      const fabricField = getElement("fabric_type");

      const categoryField = getElement("category");

      if (fabricField) {
        fabricField.value = data.fabric_type ?? "";
      }

      if (categoryField) {
        categoryField.value = data.waste_category ?? "";
      }
    } catch (error) {
      console.error("Prediction Error:", error);

      alert("Unable to connect to the prediction server.");
    } finally {
      predictBtn.disabled = false;

      predictBtn.innerText = "Predict Fabric";
    }
  });
}

// ============================================================
// DASHBOARD SUMMARY
// ============================================================

async function loadDashboard() {
  const totalPredictions = getElement("totalPredictions");

  // Not on dashboard page
  if (!totalPredictions) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userid");

      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(`Dashboard API error: ${response.status}`);
    }

    const data = await response.json();

    // --------------------------------------------------------
    // Total Predictions
    // --------------------------------------------------------

    const totalPredictionValue = getElement("totalPredictions");

    if (totalPredictionValue) {
      totalPredictionValue.innerText = data.total_predictions ?? 0;
    }

    // --------------------------------------------------------
    // Average Sustainability Score
    // --------------------------------------------------------

    const averageScore = getElement("averageScore");

    if (averageScore) {
      averageScore.innerText = data.average_score ?? 0;
    }

    // --------------------------------------------------------
    // Total Carbon Saved
    // --------------------------------------------------------

    const carbonSaved = getElement("carbonSaved");

    if (carbonSaved) {
      const carbon = Number(data.total_carbon_saved ?? 0);

      carbonSaved.innerText = `${carbon.toFixed(2)} kg`;
    }

    // --------------------------------------------------------
    // Dynamic Waste Diversion
    // --------------------------------------------------------

    const wasteDiversion = getElement("wasteDiversion");

    if (wasteDiversion) {
      if (data.waste_diversion !== undefined) {
        wasteDiversion.innerText = `${data.waste_diversion}%`;
      } else {
        wasteDiversion.innerText = "N/A";
      }
    }

    // --------------------------------------------------------
    // Dashboard Status
    // --------------------------------------------------------

    const dashboardStatus = getElement("dashboardStatus");

    if (dashboardStatus) {
      dashboardStatus.innerText = "Dashboard data loaded successfully.";

      dashboardStatus.className = "dashboard-status success";
    }

    // --------------------------------------------------------
    // Last Updated
    // --------------------------------------------------------

    const lastUpdated = getElement("lastUpdated");

    if (lastUpdated) {
      lastUpdated.innerText = `Last updated: ${new Date().toLocaleString()}`;
    }
  } catch (error) {
    console.error("Dashboard Summary Error:", error);

    const dashboardStatus = getElement("dashboardStatus");

    if (dashboardStatus) {
      dashboardStatus.innerText = "Unable to load dashboard data.";

      dashboardStatus.className = "dashboard-status error";
    }
  }
}

loadDashboard();

// ============================================================
// DASHBOARD CHARTS
// ============================================================

async function loadCharts() {
  const fabricChart = getElement("fabricChart");

  // Not on dashboard page
  if (!fabricChart) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/dashboard/charts`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userid");

      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(`Charts API error: ${response.status}`);
    }

    const data = await response.json();

    // ========================================================
    // DESTROY OLD CHARTS IF PAGE IS RELOADED
    // ========================================================

    if (window.fabricChartInstance) {
      window.fabricChartInstance.destroy();
    }

    if (window.wasteChartInstance) {
      window.wasteChartInstance.destroy();
    }

    if (window.carbonChartInstance) {
      window.carbonChartInstance.destroy();
    }

    // ========================================================
    // FABRIC DISTRIBUTION
    // ========================================================

    const fabricCanvas = getElement("fabricChart");

    if (fabricCanvas && data.fabric) {
      window.fabricChartInstance = new Chart(fabricCanvas, {
        type: "pie",

        data: {
          labels: data.fabric.labels || [],

          datasets: [
            {
              data: data.fabric.values || [],

              backgroundColor: [
                "#4CAF50",
                "#2196F3",
                "#FFC107",
                "#FF5722",
                "#9C27B0",
                "#009688",
                "#795548",
                "#607D8B",
              ],
            },
          ],
        },

        options: {
          responsive: true,

          maintainAspectRatio: true,

          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    }

    // ========================================================
    // WASTE CATEGORY
    // ========================================================

    const wasteCanvas = getElement("wasteChart");

    if (wasteCanvas && data.waste) {
      window.wasteChartInstance = new Chart(wasteCanvas, {
        type: "pie",

        data: {
          labels: data.waste.labels || [],

          datasets: [
            {
              data: data.waste.values || [],

              backgroundColor: [
                "#8BC34A",
                "#03A9F4",
                "#FF9800",
                "#E91E63",
                "#795548",
                "#673AB7",
              ],
            },
          ],
        },

        options: {
          responsive: true,

          maintainAspectRatio: true,

          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    }

    // ========================================================
    // CARBON FOOTPRINT
    // ========================================================

    const carbonCanvas = getElement("carbonChart");

    if (carbonCanvas && data.carbon) {
      window.carbonChartInstance = new Chart(carbonCanvas, {
        type: "bar",

        data: {
          labels: data.carbon.labels || [],

          datasets: [
            {
              label: "Carbon Saved (kg CO₂)",

              data: data.carbon.values || [],

              backgroundColor: "#4CAF50",

              borderRadius: 6,
            },
          ],
        },

        options: {
          responsive: true,

          plugins: {
            legend: {
              display: true,
            },
          },

          scales: {
            y: {
              beginAtZero: true,

              title: {
                display: true,

                text: "Carbon Saved (kg CO₂)",
              },
            },

            x: {
              title: {
                display: true,

                text: "Period",
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Dashboard Charts Error:", error);
  }
}

loadCharts();

// ============================================================
// PREDICTION HISTORY
// ============================================================

async function loadHistory() {
  const table = getElement("historyTable");

  // Not on history page
  if (!table) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/history/`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userid");

      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(`History API error: ${response.status}`);
    }

    const data = await response.json();

    table.innerHTML = "";

    if (!data || data.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="9">
            No prediction history available.
          </td>
        </tr>
      `;

      return;
    }

    data.forEach((item) => {
      table.innerHTML += `
        <tr>

          <td>
            ${item.id ?? "-"}
          </td>

          <td>
            ${item.image_name ?? "-"}
          </td>

          <td>
            ${item.fabric_type ?? "-"}
          </td>

          <td>
            ${item.confidence ?? "-"}
          </td>

          <td>
            ${item.waste_category ?? "-"}
          </td>

          <td>
            ${item.carbon_saved ?? "-"}
          </td>

          <td>
            ${item.sustainability_score ?? "-"}
          </td>

          <td>
            ${item.environmental_impact ?? "-"}
          </td>

          <td>
            ${
              item.created_at ? new Date(item.created_at).toLocaleString() : "-"
            }
          </td>

        </tr>
      `;
    });
  } catch (error) {
    console.error("History Error:", error);

    table.innerHTML = `
      <tr>
        <td colspan="9">
          Unable to load prediction history.
        </td>
      </tr>
    `;
  }
}

loadHistory();

// ============================================================
// DOWNLOAD SUSTAINABILITY REPORT
// ============================================================

const downloadBtn = getElement("downloadReport");

if (downloadBtn) {
  downloadBtn.addEventListener("click", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before downloading the report.");

      window.location.href = "login.html";

      return;
    }

    try {
      downloadBtn.disabled = true;

      downloadBtn.innerText = "Generating Report...";

      const response = await fetch(`${BASE_URL}/report/download`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ----------------------------------------------------
      // Session expired
      // ----------------------------------------------------

      if (response.status === 401) {
        localStorage.removeItem("token");

        localStorage.removeItem("userid");

        alert("Session expired. Please login again.");

        window.location.href = "login.html";

        return;
      }

      // ----------------------------------------------------
      // Other errors
      // ----------------------------------------------------

      if (!response.ok) {
        let errorMessage = "Unable to download report.";

        try {
          const errorData = await response.json();

          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (error) {
          // Response is not JSON
        }

        throw new Error(errorMessage);
      }

      // ----------------------------------------------------
      // Convert response to PDF blob
      // ----------------------------------------------------

      const blob = await response.blob();

      // ----------------------------------------------------
      // Create temporary download URL
      // ----------------------------------------------------

      const url = window.URL.createObjectURL(blob);

      // ----------------------------------------------------
      // Create temporary download link
      // ----------------------------------------------------

      const link = document.createElement("a");

      link.href = url;

      link.download = "textile_sustainability_report.pdf";

      document.body.appendChild(link);

      link.click();

      // ----------------------------------------------------
      // Clean up
      // ----------------------------------------------------

      link.remove();

      window.URL.revokeObjectURL(url);

      alert("Sustainability report downloaded successfully!");
    } catch (error) {
      console.error("Report Download Error:", error);

      alert(error.message || "Unable to download sustainability report.");
    } finally {
      downloadBtn.disabled = false;

      downloadBtn.innerText = "📄 Download Sustainability Report";
    }
  });
}

// ============================================================
// INVENTORY FORM
// ============================================================

const inventoryForm = getElement("inventoryForm");

if (inventoryForm) {
  inventoryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // ------------------------------------------------------
    // Read Form Values
    // ------------------------------------------------------

    const batchField = getElement("batch_id");

    const fabricField = getElement("fabric_type");

    const quantityField = getElement("quantity");

    const colorField = getElement("color");

    const sourceField = getElement("source");

    const conditionField = getElement("condition");

    const categoryField = getElement("category");

    const remarksField = getElement("remarks");

    const payload = {
      batch_id: batchField ? batchField.value.trim() : "",

      fabric_type: fabricField ? fabricField.value.trim() : "",

      quantity: quantityField ? parseFloat(quantityField.value) : 0,

      color: colorField ? colorField.value.trim() : "",

      source: sourceField ? sourceField.value.trim() : "",

      condition: conditionField ? conditionField.value : "",

      category: categoryField ? categoryField.value.trim() : "",

      remarks: remarksField ? remarksField.value.trim() : "",
    };

    // ------------------------------------------------------
    // Basic Validation
    // ------------------------------------------------------

    if (!payload.batch_id) {
      alert("Please enter Batch ID.");

      return;
    }

    if (!payload.fabric_type) {
      alert("Please enter Fabric Type.");

      return;
    }

    if (!payload.quantity || payload.quantity <= 0) {
      alert("Please enter a valid quantity.");

      return;
    }

    if (!payload.category) {
      alert("Please enter Category.");

      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/inventory/add`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          ...getAuthHeaders(),
        },

        body: JSON.stringify(payload),
      });

      // ----------------------------------------------------
      // Session expired
      // ----------------------------------------------------

      if (response.status === 401) {
        localStorage.removeItem("token");

        localStorage.removeItem("userid");

        alert("Session expired. Please login again.");

        window.location.href = "login.html";

        return;
      }

      const data = await response.json();

      if (response.ok) {
        alert("Inventory Added Successfully!");

        inventoryForm.reset();

        // Reload dashboard/history
        // if user navigates back

        await loadDashboard();

        await loadCharts();
      } else {
        alert(data.detail || data.message || "Unable to add inventory.");
      }
    } catch (error) {
      console.error("Inventory Error:", error);

      alert("Unable to connect to backend.");
    }
  });
}

// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("AI Textile Waste Intelligence Platform loaded successfully.");
});
