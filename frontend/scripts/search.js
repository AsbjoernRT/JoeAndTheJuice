//search.js 

//store search
function storeSearch() {
    var inputElement = document.getElementById("searchInput"); // Henter input-elementet for søgning
    var resultsDiv = document.getElementById("searchResults"); // Henter div-elementet hvor søgeresultater vises
  
    var debounceTimerId;
  
    inputElement.addEventListener("input", function () {
      clearTimeout(debounceTimerId); // Stop den tidligere satte timer
      debounceTimerId = setTimeout(() => {
        var searchTerm = inputElement.value; // Gemmer den indtastede søgeværdi
        if (searchTerm.length > 1) {
          // Sikrer at der er mindst 2 tegn før søgning
          fetch("/api/storeSearch?searchTerm=" + searchTerm)
            .then((res) => res.json())
            .then((res) => {
              displayResults(res);
            });
        } else {
          resultsDiv.innerHTML = ""; // Tømmer søgeresultater hvis søgeterm er for kort
        }
      }, 200); // Debounce tid på 200 millisekunder
    });
  }
  
  function displayResults(items) {
    const resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";
  
    items.forEach((item) => {
      const resultItem = document.createElement("div");
      resultItem.classList.add("result-item"); // Tilføjer klasse til resultatdiv
      resultItem.textContent = item.storeName; // Sætter tekstindholdet til fødevarens navn
      resultItem.onclick = function () {
        selectItem(item);
      }; // Tilføjer funktion til at vælge element ved klik
      resultsContainer.appendChild(resultItem);
    });
  }
  
  function selectItem(item) {
    selectedItemData = {};
    document.getElementById("searchInput").value = item.storeName;
  
    const selectedItemElement = document.getElementById("selectedItem");
    if (selectedItemElement) {
      selectedItemElement.textContent = `Selected Item: ${item.storeName}`;
    } else {
    }
  
    document.getElementById("searchResults").innerHTML = "";
  
    sessionStorage.setItem("selectedStore", JSON.stringify(item.storeID));
    sessionStorage.setItem("selectedName", JSON.stringify(item.storeName));
  
    // Gemmer og returnerer data om det valgte element
    return (selectedItemData = {
      storeName: item.storeName,
      storeID: item.storeID,
      storeCountry: item.storeCountry,
      storeCity: item.storeCity,
      storeStreet: item.storeStreet,
      storeHouseNumber: item.storeHouseNumber,
    });
  }


  //product search
  function productSearch() {
    var inputElement = document.getElementById("searchInput"); // Search input element
    var resultsDiv = document.getElementById("searchResults"); // Div to display results
  
    var debounceTimerId;
  
    inputElement.addEventListener("input", function () {
      clearTimeout(debounceTimerId);
      debounceTimerId = setTimeout(() => {
        var searchTerm = inputElement.value;
        if (searchTerm.length > 1) {
          fetch("/api/productSearch?searchTerm=" + encodeURIComponent(searchTerm))
            .then((res) => res.json())
            .then((res) => {z
              displayProductResults(res);
            });
        } else {
          resultsDiv.innerHTML = "";
        }
      }, 200);
    });
  }
  
  function displayProductResults(items) {
    const resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";
  
    items.forEach((item) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      
      productCard.innerHTML = `
        <img src="/assets/${item.productID}.jpg" alt="${item.productName}" 
             onerror="this.src='/assets/joe americano.jpg'">
        <div class="product-info">
          <h3>${item.productName}</h3>
          <h4>${item.productCategory}</h4>
          <p class="price">${item.productPrice} kr</p>
           <button onclick="addToCart(${item.productID}, '${item.productName}', ${item.productPrice})">
            Add to Cart
          </button>
        </div>
      `;
      
      resultsContainer.appendChild(productCard);
    });
  }
  
  function selectProduct(item) {
    selectedItemData = {};
    document.getElementById("searchInput").value = item.productName;
  
    const selectedItemElement = document.getElementById("selectedItem");
    if (selectedItemElement) {
      selectedItemElement.textContent = `Selected Item: ${item.productName}`;
    } else {
    }
  
    document.getElementById("searchResults").innerHTML = "";
  
    sessionStorage.setItem("selectedProduct", JSON.stringify(item.productID));
    sessionStorage.setItem("selectedProductName", JSON.stringify(item.productName));
  
    return (selectedItemData = {
      productName: item.productName,
      productID: item.productID,
      productPrice: item.productPrice,
      productCategory: item.productCategory,
    });
  }
  