// Au chargement de la page
$(document).ready(function () {
  const APIKEY = "CLE";

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
        const humidity = data.main.humidity;

        let date1 = new Date();
        let dateLocale = date1.toLocaleString("fr-FR", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        });

        // Affichage des données dans le fichier HTML
        const newLine = `<tr><td class='date'>${dateLocale}</td><td>${city}</td><td>${temp}</td><td><img src="${icon}"/></td><td>${humidity}</td><td><input id="resetOneInput" type="image" src="/supprimer.png"></td></tr>`;
        $("tbody").prepend(newLine);

        addCity(city, temp, icon, dateLocale, humidity);
      },
    });
  }

  // Ajout d'une ville dans le localStorage et récupération des données contenues à l'intérieur
  let cityList = [];
  function addCity(city, temp, icon, dateLocale, humidity) {
    if (localStorage.getItem("city_list")) {
      cityList = JSON.parse(localStorage.getItem("city_list"));
    } else {
      cityList = [];
    }
    let dataCount = cityList.length;
    cityList.unshift({
      index: dataCount + 1,
      city: city,
      temperature: temp,
      icon: icon,
      date: dateLocale,
      humidity: humidity,
    });
    cityList.sort(function (a, b) {
      return b.index - a.index;
    });

    localStorage.setItem("city_list", JSON.stringify(cityList));
    console.log("cityList, end function add()", cityList);
  }

  displayCity();
  // Affichage des villes stockées dans localStorage
  function displayCity() {
    cityList = JSON.parse(localStorage.getItem("city_list"));
    if (cityList && cityList.length > 0) {
      cityList.sort(function (a, b) {
        return a.index - b.index;
      });
      for (var i = 0; i < cityList.length; i++) {
        $("tbody").prepend(
          `<tr><td class='date'>${cityList[i].date}</td><td>${cityList[i].city}</td><td>${cityList[i].temperature}</td><td><img src="${cityList[i].icon}"/></td><td>${cityList[i].humidity}</td><td><input id="resetOneInput" type="image" src="/supprimer.png"></td></tr>`
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
  $("tbody").on("click", "#resetOneInput", function (event) {
    $("#confirmResetOne").toggle();

    const index = $(event.target).closest("tr").index();
    let cityList = JSON.parse(localStorage.getItem("city_list"));
    const cityName = cityList[index].city;
    const cityDate = cityList[index].date;
    $("#deleteOne")
      .empty()
      .append(
        `Voulez-vous supprimer la ville de <br>${cityName}, le ${cityDate} ?`
      );

    $("#confirmResetOne #confirm").click(function () {
      if (cityList != null) {
        cityList = cityList.filter((d, i) => i !== index);
        localStorage.setItem("city_list", JSON.stringify(cityList));
      }
      $(event.target).closest("tr").remove();
      $("#confirmResetOne").hide();
      $("#deleteOne").empty();
    });

    $("#confirmResetOne #cancel").click(function () {
      $("#confirmResetOne").hide();
      $("#deleteOne").empty();
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

        cityLocalisation =
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

  //Mobile

  $("#menu").click(function () {
    $(".tools").toggle();

    $(".tools").css({"top":"50px"});

    
    $(this).css("transition", "transform 0.5s ease");
    if ($(this).css("transform") === "matrix(0, 1, -1, 0, 0, 0)") {
      $(this).css("transform", "none");
    } else {
      $(this).css("transform", "rotate(90deg)");
    }
  });
});

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
