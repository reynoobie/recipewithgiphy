const GIPHY_KEY = "vyK6hHfGc0bHoFYvQzHN4pUdLJs87KPm";

// --- 2. SEARCH FORM LOGIC ---
const searchForm = document.getElementById("searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const food = document.getElementById("foodInput").value.trim();
    if (!food) return alert("Please enter a food name!");
    fetchAndDisplay(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${food}`,
    );
  });
}

// --- 3. RANDOM BUTTON LOGIC ---
const randomBtn = document.getElementById("randomBtn");
if (randomBtn) {
  randomBtn.addEventListener("click", () => {
    fetchAndDisplay("https://www.themealdb.com/api/json/v1/1/random.php");
  });
}

// --- 4. CLEAR BUTTON LOGIC (NEW) ---
const clearBtn = document.getElementById("clearBtn");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    // 1. Clear Input Box
    const foodInput = document.getElementById("foodInput");
    if (foodInput) foodInput.value = "";

    // 2. Clear Results Area
    const resultDiv = document.getElementById("result");
    if (resultDiv) resultDiv.innerHTML = "";

    // 3. Focus back on input so user can type immediately
    foodInput.focus();
  });
}

// --- 5. MAIN FETCH FUNCTION ---
async function fetchAndDisplay(url) {
  const resultDiv = document.getElementById("result");
  const foodInput = document.getElementById("foodInput");

  resultDiv.innerHTML = '<div class="loader"></div>';

  try {
    const mealResponse = await fetch(url);
    const mealData = await mealResponse.json();

    resultDiv.innerHTML = "";

    if (mealData.meals) {
      const meal = mealData.meals[0];
      const foodName = meal.strMeal;

      // Update Input Box with the found food name
      if (foodInput) {
        foodInput.value = foodName;
      }

      // Fetch GIFs
      const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${foodName}+delicious&limit=4`;
      const giphyResponse = await fetch(giphyUrl);
      const giphyData = await giphyResponse.json();

      // Display GIFs
      if (giphyData.data.length > 0) {
        const gifSection = document.createElement("div");
        gifSection.className = "gif-section";
        gifSection.innerHTML = `<h3>✨ ${foodName} Vibes</h3>`;

        const gifGrid = document.createElement("div");
        gifGrid.className = "gif-grid";

        giphyData.data.forEach((gif) => {
          const img = document.createElement("img");
          img.src = gif.images.fixed_height.url;
          gifGrid.appendChild(img);
        });

        gifSection.appendChild(gifGrid);
        resultDiv.appendChild(gifSection);
      }

      // Display Recipe
      const recipeGrid = document.createElement("div");
      recipeGrid.className = "recipe-grid";

      mealData.meals.forEach((m) => {
        const recipeDiv = document.createElement("div");
        recipeDiv.className = "recipe";

        let ingredients = "";
        for (let i = 1; i <= 20; i++) {
          const ing = m[`strIngredient${i}`];
          const mea = m[`strMeasure${i}`];
          if (ing && ing.trim()) ingredients += `<li>${ing} - ${mea}</li>`;
        }

        recipeDiv.innerHTML = `
                    <h2>${m.strMeal}</h2>
                    <p><strong>Category:</strong> ${m.strCategory} | ${m.strArea}</p>
                    <p>${m.strInstructions.substring(0, 150)}...</p>
                    <ul>${ingredients}</ul>
                    <a href="${m.strSource}" target="_blank">View Full Instructions &rarr;</a>
                `;
        recipeGrid.appendChild(recipeDiv);
      });
      resultDiv.appendChild(recipeGrid);
    } else {
      resultDiv.innerHTML = "<p>No recipes found.</p>";
    }
  } catch (error) {
    console.error("Error:", error);
    resultDiv.innerHTML = "<p>Error fetching data.</p>";
  }
}

// --- 6. QUICK SEARCH FUNCTION ---
function quickSearch(term) {
  const foodInput = document.getElementById("foodInput");
  if (foodInput) foodInput.value = term;
  fetchAndDisplay(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`,
  );
}
