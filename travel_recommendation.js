async function fetchTravelData() {
  try {
    const response = await fetch("travel_recommendation_api.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { status: "success", data };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

async function handleSubmitSearchDestination(event) {
  event.preventDefault();
  try {
    const inputText = document.getElementById("search-input").value;

    const travelData = await fetchTravelData();

    if (travelData.status === "error") {
      throw new Error(travelData.message);
    }

    const filteredData = filterByKeyword(inputText, travelData.data);

    clearSearchDestinations();

    filteredData.forEach((data) => addSearchDestination(data));

    if (filteredData.length === 0) {
      noSearchDestinationResults();
    }
  } catch (error) {
    console.error("An error occurred:", error);
    alert("something went wrong during the submission, please try again...");
  }
}

function filterByKeyword(keyword, data) {
  const keywordLower = keyword.toLowerCase();
  let results = [];

  // Check if the keyword matches any category name in the data
  if (data[keywordLower]) {
    const category = data[keywordLower];

    // for each category, check if it countains cities
    category.forEach((item) => {
      if (item.cities) {
        // if category contains cities property, add each city to the results
        item.cities.forEach((city) => {
          results.push(city);
        });
      } else {
        // add all cities to the results
        results.push(item);
      }
    });
  } else {
    // Otherwise, search within each category based on name and description
    for (const category in data) {
      // if category name includes our keyword, add all its cities to the results
      if (category.includes(keywordLower)) {
        if (Array.isArray(data[category].cities)) {
          data[category].cities.forEach((city) => {
            results.push(city);
          });
        } else {
          data[category].forEach((city) => {
            results.push(city);
          });
        }
      } else {
        data[category].filter((entry) => {
          if (Array.isArray(entry.cities)) {
            // Filter cities based on the keyword
            const matchingCities = entry.cities.filter(
              (city) =>
                city.name.toLowerCase().includes(keywordLower) ||
                city.description.toLowerCase().includes(keywordLower)
            );

            // If there are matching cities or the country name matches, include it in results
            matchingCities.forEach((city) => {
              results.push(city);
            });
          } else {
            // For simple entries (like temples or beaches)
            if (
              entry.name.toLowerCase().includes(keywordLower) ||
              entry.description.toLowerCase().includes(keywordLower)
            ) {
              results.push(entry);
            }
          }
        });
      }
    }
  }

  return results;
}

function clearSearchDestinations() {
  document.getElementById("travel-search-content").innerHTML = "";
}

function addSearchDestination(destination) {
  document.getElementById("travel-search-content").innerHTML += `
    <div class="card w-100 mb-3">
        <img
            src="images/${destination.imageUrl}"
            class="card-img-top"
            alt=""
        />
        <div class="card-body">
            <h5 class="card-title">${destination.name}</h5>
            <p class="card-text">
            ${destination.description}
            </p>
            <a href="#" class="btn btn-success">Visit</a>
        </div>
    </div>
    `;
}

function noSearchDestinationResults() {
  document.getElementById("travel-search-content").innerHTML += `
    <div class="card w-100 mb-3">
        <div class="card-body">
            <h5 class="card-title">No results</h5>
            <p class="card-text">
            No matching destinations found for the given keyword or destination name. Please try again.
            </p>
        </div>
    </div>
    `;
}

document
  .getElementById("form-search-destination")
  .addEventListener("submit", handleSubmitSearchDestination);
