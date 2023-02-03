// Ma clé
// 6d8d9cf290d5361d791c399e738096b4

// Clé de Mourad
// e5f50616c148ee9b955e99c2657c32b7

// Au chargement de la page
$(document).ready(function () {
  const APIKEY = "e5f50616c148ee9b955e99c2657c32b7";

  function getWeather(city) {
    // URL API
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}`;

    $.ajax({
      url: url,
      method: "GET",
      success: function (data) {
        // Récupération des données de l'API : nom ville, temp et icone
        // https://openweathermap.org/weather-conditions
        const city = data.name;
        const temp = (data.main.temp - 273.15).toFixed(0) + " °C";
        const img = data.weather[0].icon;
        const icon = `http://openweathermap.org/img/wn/${img}.png`;
        console.log(cityList);
        // Affichage des données dans le fichier HTML
        const newLine = `<tr><td>${city}</td><td>${temp}</td><td><img src="${icon}"/></td></tr>`;
        $("tbody").append(newLine);

        addCity(city, temp, icon);
      },
    });
  }

  // Autocomplétion, ne fonctionne pas très bien
  // $("#searchInput").autocomplete({
  //   source: function (request, response) {
  //     $.getJSON(
  //       "http://api.openweathermap.org/data/2.5/find?q=" +
  //         request.term +
  //         "&appid=" +
  //         APIKEY,
  //       function (data) {
  //         let cities = data.list.map(function (city) {
  //           return city.name;
  //         });
  //         response(cities);
  //       }
  //     );
  //   },
  // });

  // Ajout d'une ville dans le localStorage et récupération des données contenues à l'intérieur
  let cityList = [];
  function addCity(city, temp, icon) {
    if (localStorage.getItem("city_list")) {
      cityList = JSON.parse(localStorage.getItem("city_list"));
    } else {
      cityList = [];
    }
    cityList.push({
      city: city,
      temperature: temp,
      icon: icon,
    });
    localStorage.setItem("city_list", JSON.stringify(cityList));
    console.log("cityList, end function add()", cityList);
  }

  // Afficher les villes sotckées dans LS
  displayCity();

  // Affichage des villes stockées dans localStorage
  function displayCity() {
    cityList = JSON.parse(localStorage.getItem("city_list"));
    if (cityList && cityList.length > 0) {
      for (var i = 0; i < cityList.length; i++) {
        $("tbody").append(
          `<tr><td>${cityList[i].city}</td><td>${cityList[i].temperature}</td><td><img src="${cityList[i].icon}"/></td></tr>`
        );
      }
    } else {
      console.log("Aucune ville trouvée dans le localStorage");
    }
  }

  // Chercher une ville dans l'API
  $("form").submit(function (event) {
    const result = $("#searchInput").val();
    getWeather(result);
    event.preventDefault();
    $("#searchInput").val("");
  });

  //Supprimer une ligne au clic
  $("tbody").on("click", "tr", function (event) {
    $("#confirmResetOne").show();

    const index = $(event.target).closest("tr").index();
    let cityList = JSON.parse(localStorage.getItem("city_list"));
    const cityName = cityList[index].city;
    $("p").append(`Voulez-vous supprimer la ville de ${cityName} ?`);

    $("#confirmResetOne #confirm").click(function () {
      if (cityList != null) {
        cityList = cityList.filter((d, i) => i !== index);
        localStorage.setItem("city_list", JSON.stringify(cityList));
      }
      $(event.target).closest("tr").remove();
      $("#confirmResetOne").hide();
      $("p").empty();
    });

    $("#confirmResetOne #cancel").click(function () {
      $("#confirmResetOne").hide();
      $("p").empty();
    });
  });

  // Supprimer toutes les lignes (var city, vue et localstorage)
  $("#resetAllInput").click(function (event) {
    $("#confirmResetAll").toggle(function () {
      $("#confirm").click(function () {
        $("tbody").empty();
        localStorage.clear("city_list");
        cityList = [];
        $("#confirmResetAll").hide();
        $("span").append(
          "<h5>*** Toutes les villes ont été supprimées. ***</h5>"
        );

        setTimeout(function () {
          $("span").fadeOut(1000);
        }, 3000); // disparaît après 5 secondes avec une transition de 1 seconde
      });

      $("#confirmResetAll #cancel").click(function () {
        $("#confirmResetAll").hide();
      });
    });
  });

  // Géolocalisation avec openstreetmap.
  // Nb de requêtes limitées !!
  $("#find-me").click(function () {
    const status = $("#status");

    function success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      status.text("");

      // Convertir les coordonnées en adresse
      getCityFromCoordinates(latitude, longitude);

      async function getCityFromCoordinates(lat, lng) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        console.log(data.address.town);
        console.log(data.address.city);
        console.log(data.address.village);
        console.log(data.address.state);

        const cityLocalisation =
          data.address.town ||
          data.address.city ||
          data.address.village ||
          data.address.state;

        $("#searchInput").val(cityLocalisation);
      }
    }

    // Si erreur
    function error() {
      status.text("Unable to retrieve your location");
    }

    if (!navigator.geolocation) {
      status.text("Geolocation is not supported by your browser");
    } else {
      status.text("Locating…");
      navigator.geolocation.getCurrentPosition(success, error);
    }
  });
});
