const GIPHY_KEY = "vyK6hHfGc0bHoFYvQzHN4pUdLJs87KPm";

// --- 2. SEARCH FORM LOGIC ---
const searchForm = document.getElementById("searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const food = document.getElementById("foodInput").value.trim();

    if (!food) return alert("Please enter a food name!");
    if (food.length < 3) return alert("Please enter at least 3 characters!");
    if (!/^[a-zA-Z\s]+$/.test(food))
      return alert("Letters only, no numbers or symbols!");

    fetchAndDisplay(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${food}`,
    );
  });
}

// --- 3. RANDOM BUTTON LOGIC ---
const randomBtn = document.getElementById("randomBtn");
if (randomBtn) {
  randomBtn.addEventListener("click", () => {
    fetchAndDisplay("https://www.themealdb.com/api/json/v1/1/random.php", true);
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
async function fetchAndDisplay(url, updateInput = false) {
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
      if (updateInput && foodInput) {
        foodInput.value = foodName;
      }

      // Fetch GIFs
      try {
        let giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(foodName)}+food+cooking+recipe&limit=8&rating=g&lang=en`;

        let giphyResponse = await fetch(giphyUrl);
        let giphyData = await giphyResponse.json();

        // If no GIFs found, try a fallback search
        if (!giphyData.data || giphyData.data.length === 0) {
          giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=cooking+food+recipe&limit=8&rating=g&lang=en`;
          giphyResponse = await fetch(giphyUrl);
          giphyData = await giphyResponse.json();
        }

        // Filter out memes, keep only food-related GIFs
        const foodGifs = giphyData.data.filter((gif) => {
          const title = gif.title?.toLowerCase() || "";
          const slug = gif.slug?.toLowerCase() || "";

          const excludeKeywords = [
            "meme",
            "reaction",
            "funny",
            "lol",
            "wtf",
            "random",
            "anime",
          ];
          const hasExcluded = excludeKeywords.some(
            (word) => title.includes(word) || slug.includes(word),
          );

          const foodKeywords = [
            "food",
            "eat",
            "cook",
            "cooking",
            "recipe",
            "chef",
            "delicious",
            foodName.toLowerCase(),
          ];
          const hasFood = foodKeywords.some(
            (word) => title.includes(word) || slug.includes(word),
          );

          return !hasExcluded && hasFood;
        });

        // If filtering removes everything, use original results
        const finalGifs = (
          foodGifs.length > 0 ? foodGifs : giphyData.data
        ).slice(0, 4);

        // Display GIFs
        if (finalGifs.length > 0) {
          const gifSection = document.createElement("div");
          gifSection.className = "gif-section";
          

          const gifGrid = document.createElement("div");
          gifGrid.className = "gif-grid";

          finalGifs.forEach((gif) => {
            const img = document.createElement("img");
            img.src = gif.images.fixed_height.url;
            gifGrid.appendChild(img);
          });

          gifSection.appendChild(gifGrid);
          resultDiv.appendChild(gifSection);
        }
      } catch (error) {
        console.error("Error fetching GIPHY data:", error);

        const errorMsg = document.createElement("p");
        errorMsg.textContent = "⚠️ Error fetching GIFs.";
        resultDiv.appendChild(errorMsg);
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
