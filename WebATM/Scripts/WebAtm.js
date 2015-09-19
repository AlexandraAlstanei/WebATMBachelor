var map;
var currentlyDisplayedMarkers = [];

function initMap() {
    //Initialize google maps component
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 55.2, lng: 9.5 },
        zoom: 7
    });

    //get initial data from the WebAPI and display it on the map
    getDataAndDisplayOnMap();

    //start a javascript timer that starts every 5 seconds
    //on each iteration, get data and redraw it on the map
    setInterval(updateMap, 4000);
}

function updateMap() {
    //this will repeat every 5 seconds
    getDataAndDisplayOnMap();
}

function getDataAndDisplayOnMap() {
    var uri = 'api/webatm/GetAllFlights';

    //make AJAX call that returns the data in JSON format
    $.getJSON(uri)
           .done(function (data) {
               // On success, 'data' contains a list of flights.

               //clear the old data on the map
               clearAllMarkers();

               //for each flight, draw the last plot on the map
               for (var i = 0; i < data.length; i++) {
               //    var markerLatLng = { lat: data[i].Plots[data[i].Plots.length - 1].latitude, lng: data[i].Plots[data[i].Plots.length - 1].longitude };
              //     var direction = calculateDirection(data[i].Plots[data[i].Plots.length - 2].latitude, data[i].Plots[data[i].Plots.length - 2].longitude, data[i].Plots[data[i].Plots.length - 1].latitude, data[i].Plots[data[i].Plots.length - 1].longitude);
                   var markerLatLng = { lat: generateCoordinate (data[i].Plots[data[i].Plots.length - 1].latitude), lng: generateCoordinate(data[i].Plots[data[i].Plots.length - 1].longitude) };
                   var direction = calculateDirection(data[i].Plots[data[i].Plots.length - 1].latitude, data[i].Plots[data[i].Plots.length - 1].longitude, generateCoordinate (data[i].Plots[data[i].Plots.length - 1].latitude), generateCoordinate (data[i].Plots[data[i].Plots.length - 1].longitude));
                   var iconImage = chooseIcon(direction);
                   //display the marker on the map
                   var marker = new google.maps.Marker({
                       position: markerLatLng,
                       map: map,
                       icon: iconImage
                   });

                   currentlyDisplayedMarkers.push(marker);
               }
           });
}

function generateCoordinate(coordinate) {
    var r = 100 / 111300 // = 100 meters
      , y0 = coordinate
      , u = Math.random()
      , v = Math.random()
      , w = r * Math.sqrt(u)
      , t = 2 * Math.PI * v
      , y1 = w * Math.sin(t)

    newY = y0 + y1
    return newY;
}


function clearAllMarkers() {
    for (var i = 0; i < currentlyDisplayedMarkers.length; i++) {
        currentlyDisplayedMarkers[i].setMap(null);
    }

    currentlyDisplayedMarkers = []; //empty array
}

function chooseIcon(direction) {
    switch (direction) {
        case 'N':
            return 'https://dl.dropboxusercontent.com/u/1936953/N.png';
        case 'N - E':
            return 'https://dl.dropboxusercontent.com/u/1936953/NE.png';
        case 'S - E':
            return 'https://dl.dropboxusercontent.com/u/1936953/SE.png';
        case 'S':
            return 'https://dl.dropboxusercontent.com/u/1936953/S.png';
        case 'S - W':
            return 'https://dl.dropboxusercontent.com/u/1936953/SW.png';
        case 'E':
            return 'https://dl.dropboxusercontent.com/u/1936953/E.png';
        case 'W':
            return 'https://dl.dropboxusercontent.com/u/1936953/W.png';
        case 'N - W':
            return 'https://dl.dropboxusercontent.com/u/1936953/NW.png';
        default:
            return 'https://dl.dropboxusercontent.com/u/1936953/N.png';
    }
}

function calculateDirection(latitudeA, longitudeA, latitudeB, longitudeB) {
    var x, y, direction;
    x = Math.cos(latitudeB) * Math.sin(longitudeA - longitudeB);
    y = Math.cos(latitudeA) * Math.sin(latitudeB) - Math.sin(latitudeA) * Math.cos(latitudeB) * Math.cos(longitudeA - longitudeB);
    direction = Math.atan2(x, y);
    directionAngle = 0;
    if (direction > 0) {
        directionAngle = direction * (180 / Math.PI);
    }
    else {
        directionAngle = 360 + (direction * (180 / Math.PI));
    }
    if ((directionAngle > 22.5) && (directionAngle < 67.5)) {
        return 'N - E';
    }
    else if ((directionAngle > 112.5) && (directionAngle < 157.5)) {
        return 'S - E';
    }
    else if ((directionAngle > 202.5) && (directionAngle < 247.5)) {
        return 'S - W';
    }
    else if ((directionAngle > 292.5) && (directionAngle < 337.5)) {
        return 'N - W';
    }
    else if ((directionAngle < 22.5) || (directionAngle > 337.5)) {
        return 'N';
    }
    else if ((directionAngle > 67.5) || (directionAngle < 112.5)) {
        return 'E';
    }
    else if ((directionAngle > 157.5) || (directionAngle < 202.5)) {
        return 'S';
    }
    else if ((directionAngle > 247.5) || (directionAngle < 292.5)) {
        return 'W';
    }
    return 'N';
}