if (jQuery) {
  console.log('jQuery');
}

if (jQuery) {
  console.log('jQuery');
}

// variable declation
let allCities = [];
let removeBtn = $('#removeBtn');
let submitBtn = $('#submitBtn');
let searchList = $('#searchList');
let searchBar = $('#searchBar');

let newDate = new Date();
let dd = newDate.getDate();
let mm = newDate.getMonth() + 1;
let yyyy = newDate.getFullYear();
let date = `${yyyy}.${mm}.${dd}`;

$.getJSON('./usStates.json', (json) => {
  json.forEach((state) => {
    let display = `
    <tr>
    <td ><button id='state'>${state.name}</button></td>
    </tr>
    `;
    // console.log(display);
    $('#stateList').append(display);
  });
});

$('#stateList').on('click', '#state', function () {
  let thisState = $(this).text();
  console.log(thisState);
  getCityInfo(thisState);
});

//functions
const getCityInfo = (cityName) => {
  var APIkey = 'b328ccab8d372c776afbedb2b4434e8c';
  var oneDayURL =
    'https://api.openweathermap.org/data/2.5/weather?q=' +
    cityName +
    '&appid=' +
    APIkey;

  $.ajax({
    url: oneDayURL,
    method: 'GET',
  })
    .then((response) => {
      console.log(response);
      let cityName = response.name;
      let country = response.sys.country;
      let tempK = response.main.temp;
      let tempF = ((parseFloat(tempK) - 273.15) * 1.8 + 32).toFixed(2);
      let humidity = response.main.humidity;
      let wind = response.wind.speed;
      let icon = response.weather[0].icon;
      let tempHigh = (
        (parseFloat(response.main.temp_max) - 273.15) * 1.8 +
        32
      ).toFixed(2);
      let tempLow = (
        (parseFloat(response.main.temp_min) - 273.15) * 1.8 +
        32
      ).toFixed(2);

      //setting response to corresponding html tags
      $('#cityName').text(`${cityName}, ${country}`);
      $('#date').text(`${date}`);
      $('#temperature').text(`${tempF} °F`);
      $('#temp-high').text(`${tempHigh} °F`);
      $('#temp-low').text(`${tempLow} °F`);
      $('#humidity').text(`${humidity}`);
      $('#wind').text(`${wind}`);

      $('#icon').attr(
        'src',
        'http://openweathermap.org/img/wn/' + icon + '@2x.png'
      );
      $('#icon').append(icon);

      allCities.push(cityName);
      renderButtons();
      resetSearchBar();
      storeSearch();

      // creating a nesting ajax to call upon independent UV API
      var uvURL =
        'https://api.openweathermap.org/data/2.5/uvi?appid=' +
        APIkey +
        '&lat=' +
        response.coord.lat +
        '&lon=' +
        response.coord.lon;
      $.ajax({
        url: uvURL,
        method: 'GET',
      }).then(function (response) {
        var uv = response.value;
        $('#uv').text(uv);
        // giving <uv span> color according to value number
        if (response.value >= 10) {
          $('#uv').css('background-color', 'red');
        } else if (response.value < 10 && response.value > 6) {
          $('#uv').css('background-color', 'yellow');
        } else {
          $('#uv').css('background-color', 'green');
        }
      });
    })
    .catch((error) => {
      if (error) {
        alert('check spelling');
      }
    });

  // api call for fiveDayForecase

  let fiveDaysURL =
    'https://api.openweathermap.org/data/2.5/forecast?q=' +
    cityName +
    '&appid=' +
    APIkey;

  $.ajax({
    url: fiveDaysURL,
    method: 'GET',
  }).then((fiveDays) => {
    renderFiveDays(fiveDays);
  });
};
getCityInfo('los angeles');

function renderFiveDays(fiveDays) {
  let fiveDayArr = getForecastForEachDay(fiveDays.list);
  $('.fiveDaysList').text(' ');
  fiveDayArr.forEach((day, index) => {
    // console.log(day);
    let divTag = $('<div>');
    divTag.attr('class', 'days');

    let temp = $('<h3>');
    temp.attr('class', '');
    let tempK = day.main.temp;
    console.log(tempK);
    let tempF = ((parseFloat(tempK) - 273.15) * 1.8 + 32).toFixed(2);
    temp.text(` ${tempF} °F`);

    let date = $('<h2>');
    date.text(day.dt_txt.split(' ')[0]);

    let humidity = $('<h4>');
    humidity.text(`Humidity: ${day.main.humidity}`);

    let tempLow = $('<h4>');
    let tempLowF = (
      (parseFloat(day.main.temp_min) - 273.15) * 1.8 +
      32
    ).toFixed(2);
    tempLow.text(`Low: ${tempLowF}`);

    let tempHigh = $('<h4>');
    let tempHighF = (
      (parseFloat(day.main.temp_max) - 273.15) * 1.8 +
      32
    ).toFixed(2);
    tempHigh.text(`High: ${tempHighF}`);

    let icon = $('<img>');
    icon.attr(
      'src',
      'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png'
    );

    divTag.append(date);
    divTag.append(icon);
    divTag.append(temp);

    divTag.append(tempLow);
    divTag.append(tempHigh);
    divTag.append(humidity);
    // divTag.append(icon);

    $('.fiveDaysList').append(divTag);
  });
}
function getForecastForEachDay(listOfForecasts) {
  var forecastArray = [];
  var currentDate = '';
  for (var i = 0; i < listOfForecasts.length; i++) {
    // We want to capture one weather object for each day in the list. Once we've captured that
    // object, we can ignore all other objects for the same day
    var dateOfListItem = listOfForecasts[i].dt_txt.split(' ')[0];
    if (dateOfListItem !== currentDate) {
      // We need to extract just the date part and ignore the time
      currentDate = dateOfListItem;
      // Push this weather object to the forecasts array
      if (forecastArray.length < 5) {
        forecastArray.push(listOfForecasts[i]);
      }
    }
  }
  return forecastArray;
}

// to render cities as buttons
function renderButtons() {
  searchList.html(' ');
  allCities = [...new Set(allCities)];
  allCities.forEach((city, index) => {
    let btn = `<button id='cityBtn'>${city}</button>`;
    let removeBtn = `<button data-index='${index}' id='removeBtn'><i class='fa fa-trash'></i></button>`;
    let divTag = $('<div id=searchResult>');

    divTag.append(btn);
    divTag.append(removeBtn);
    searchList.append(divTag);
  });
}

//to clear text after search;
const resetSearchBar = () => {
  searchBar.val('');
};

//to remove selected city
searchList.on('click', '#removeBtn', function (event) {
  event.preventDefault();
  let element = event.target;
  let index = element.parentElement.getAttribute('data-index');

  allCities.splice(index, 1);
  storeSearch();
  renderButtons();
});

//on submit, retrieve city search info
submitBtn.on('click', function (event) {
  event.preventDefault();
  let cityName = searchBar.val().toLowerCase();

  getCityInfo(cityName);
});

// on click, display saved city
searchList.on('click', '#cityBtn', function () {
  let cityName = $(this).text();

  getCityInfo(cityName);
});

// save search history to local storage
const storeSearch = () => {
  localStorage.setItem('cities', JSON.stringify(allCities));
};

// get saved search from local storage
const getStoredSearch = () => {
  let storedSearch = JSON.parse(localStorage.getItem('cities'));
  if (storedSearch !== null) {
    allCities = storedSearch;
  }
  renderButtons();
};

// retrieve saved searches on page refresh
getStoredSearch();
