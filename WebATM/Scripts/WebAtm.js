var map;
var currentlyDisplayedMarkers = [];
var flightPaths = [];
var aviationMode = false;
var planeMode = true;
var marker;
var found = false;
var markerLatLng;


function initMap() {
    //Initialize google maps component
    //Create a dropdown menu with different map types
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 55.2, lng: 9.5 },
        zoom: 8,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.RIGHT_TOP,
            mapTypeIds: [
              google.maps.MapTypeId.ROADMAP,
              google.maps.MapTypeId.TERRAIN,
              google.maps.MapTypeId.SATELLITE,
              google.maps.MapTypeId.HYBRID
            ]
        }
    });
    
    //Button control for Aviation mode
    var centerControlDiv = document.createElement('div');
    var centerControl = new AviationControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(centerControlDiv);

    //Button control for plane mode
    var planeControlDiv = document.createElement('div');
    var planeControl = new PlaneControl(planeControlDiv, map);

    planeControlDiv.index = 2;
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(planeControlDiv);

    //get initial data from the WebAPI and display it on the map
    getDataAndDisplayOnMap();
    
    //start a javascript timer that starts every 4 seconds
    //on each iteration, get data and change the position of the markers
    setInterval(updateMap, 4000);
}

function updateMap() {
    //this will repeat every 4 seconds    
    getDataAndDisplayOnMap();
    document.getElementById("debugwindow").innerHTML = currentlyDisplayedMarkers.length;
}

function getDataAndDisplayOnMap() {
    var uri = 'api/webatm/GetAllFlights';

    //make AJAX call that returns the data in JSON format
    $.getJSON(uri)
           .done(function (data) {
               // On success, 'data' contains a list of flights.
             //  for each flight, draw the last plot on the map
               for (var i = 0; i < data.length; i++) {
                   found = false;
                   for (var m = 0; m < currentlyDisplayedMarkers.length; m++) {                      
                       //find the corresponding marker
                       if (currentlyDisplayedMarkers[m].metadata.id == data[i].TrackNumber) {
                           //create the new coordinates and change the position of the markers
                           var updatedMarkerLatLng = { lat: data[i].Plots[0].Latitude, lng: data[i].Plots[0].Longitude }

                           //  rotation = calculateDirection(data[i].Plots[0].Latitude, data[i].Plots[0].Longitude, data[i].Plots[1].Latitude, data[i].Plots[1].Longitude);
                           currentlyDisplayedMarkers[m].setPosition(updatedMarkerLatLng);
                        //   currentlyDisplayedMarkers[m].iconImage.rotate(rotation);
                           found = true;
                       }
                   }
                   //if the marker is not shown already, show it
                    if (!found)
                       {
                           var LatLng = { lat: data[i].Plots[0].Latitude, lng: data[i].Plots[0].Longitude };
                           createMarker(LatLng, 90, data[i].TrackNumber);
                           drawPolyline(data[i].Plots, data[i].TrackNumber);
                       }
                   }
           });
       }


function createMarker(markerLatLng, direction, id) {
    if (planeMode) {
        //display the marker on the map by using an svg image of a plane
        var iconImage = {
            path: 'M438.8,320.6c-3.6-3.1-147.2-107.2-147.2-107.2c-0.2-0.2-0.4-0.4-0.5-0.5c-5.5-5.6-5.2-10.4-5.6-18.8c0,0-0.9-69-2.2-92  S270,64,256,64c0,0,0,0,0,0s0,0,0,0c-14,0-25.9,15-27.2,38s-2.2,92-2.2,92c-0.4,8.4-0.1,13.2-5.6,18.8c-0.2,0.2-0.4,0.4-0.5,0.5  c0,0-143.5,104.1-147.2,107.2s-9.2,7.8-9.2,18.2c0,12.2,3.6,13.7,10.6,11.6c0,0,140.2-39.5,145.4-40.8s7.9,0.6,8.3,7.5  s0.8,46.4,0.9,51s-0.6,4.7-2.9,7.4l-32,40.8c-1.7,2-2.7,4.5-2.7,7.3c0,0,0,6.1,0,12.4s2.8,7.3,8.2,4.9s32.6-17.4,32.6-17.4  c0.7-0.3,4.6-1.9,6.4-1.9c4.2,0,8-0.1,8.8,6.2c1.3,11.4,4.9,20.3,8.5,20.3c0,0,0,0,0,0s0,0,0,0c3.6,0,7.2-8.9,8.5-20.3  c0.7-6.3,4.6-6.2,8.8-6.2c1.8,0,5.7,1.6,6.4,1.9c0,0,27.2,15,32.6,17.4s8.2,1.4,8.2-4.9s0-12.4,0-12.4c0-2.8-1-5.4-2.7-7.3l-32-40.8  c-2.3-2.7-2.9-2.9-2.9-7.4s0.5-44.1,0.9-51s3.1-8.8,8.3-7.5s145.4,40.8,145.4,40.8c7.1,2.1,10.6,0.6,10.6-11.6  C448,328.4,442.5,323.7,438.8,320.6z',
            fillColor: '#800000',
            strokeColor: '#FFFF99',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            scale: 0.07,
            fillOpacity: 1,
          //  transform: rotate(direction)
        }

    } else {
        var iconImage = {
            path: 'M265.54,0H13.259C5.939,0,0.003,5.936,0.003,13.256v252.287c0,7.32,5.936,13.256,13.256,13.256H265.54c7.318,0,13.256-5.936,13.256-13.256V13.255C278.796,5.935,272.86,0,265.54,0z M252.284,252.287H26.515V26.511h225.769V252.287z',
            strokeColor: '#800000',
            scale: 0.05,
            fillOpacity: 1,
            strokeWeight: 1
        }
        if (aviationMode) {
            var iconImage = {
                path: 'M265.54,0H13.259C5.939,0,0.003,5.936,0.003,13.256v252.287c0,7.32,5.936,13.256,13.256,13.256H265.54c7.318,0,13.256-5.936,13.256-13.256V13.255C278.796,5.935,272.86,0,265.54,0z M252.284,252.287H26.515V26.511h225.769V252.287z',
                strokeColor: '#800000',
                scale: 0.05,
                fillOpacity: 1,
                strokeWeight: 1
            }
        } else {
           // display the marker on the map by using an svg image of a plane
            var iconImage = {
                path: 'M438.8,320.6c-3.6-3.1-147.2-107.2-147.2-107.2c-0.2-0.2-0.4-0.4-0.5-0.5c-5.5-5.6-5.2-10.4-5.6-18.8c0,0-0.9-69-2.2-92  S270,64,256,64c0,0,0,0,0,0s0,0,0,0c-14,0-25.9,15-27.2,38s-2.2,92-2.2,92c-0.4,8.4-0.1,13.2-5.6,18.8c-0.2,0.2-0.4,0.4-0.5,0.5  c0,0-143.5,104.1-147.2,107.2s-9.2,7.8-9.2,18.2c0,12.2,3.6,13.7,10.6,11.6c0,0,140.2-39.5,145.4-40.8s7.9,0.6,8.3,7.5  s0.8,46.4,0.9,51s-0.6,4.7-2.9,7.4l-32,40.8c-1.7,2-2.7,4.5-2.7,7.3c0,0,0,6.1,0,12.4s2.8,7.3,8.2,4.9s32.6-17.4,32.6-17.4  c0.7-0.3,4.6-1.9,6.4-1.9c4.2,0,8-0.1,8.8,6.2c1.3,11.4,4.9,20.3,8.5,20.3c0,0,0,0,0,0s0,0,0,0c3.6,0,7.2-8.9,8.5-20.3  c0.7-6.3,4.6-6.2,8.8-6.2c1.8,0,5.7,1.6,6.4,1.9c0,0,27.2,15,32.6,17.4s8.2,1.4,8.2-4.9s0-12.4,0-12.4c0-2.8-1-5.4-2.7-7.3l-32-40.8  c-2.3-2.7-2.9-2.9-2.9-7.4s0.5-44.1,0.9-51s3.1-8.8,8.3-7.5s145.4,40.8,145.4,40.8c7.1,2.1,10.6,0.6,10.6-11.6  C448,328.4,442.5,323.7,438.8,320.6z',
                fillColor: '#800000',
                strokeColor: '#FFFF99',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                scale: 0.07,
                fillOpacity: 1,
              //  transform: rotate(direction)
            }
        }
    }
    //draw the marker and attach it to the map
    marker = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        icon: iconImage,
        draggable: false
    });
    //add aditional properties to the marker
    marker.metadata = {
        id: id
    };
    addClickHandler(marker);
    //add the marker to the markers array
    currentlyDisplayedMarkers.push(marker);
        
}

function addClickHandler(pathMarker) {
    google.maps.event.addListener(pathMarker, 'click', function () {
        for (var i = 0; i <= flightPaths.length; i++) {
            if (flightPaths[i].metadata.id == pathMarker.metadata.id) {
                flightPaths[i].setMap(map);
            }
        }
    });
}

function drawPolyline(pastPlots, id) {
    var flightCoordinates = [];
    var pastPlot;
    for (var i = 0; i < pastPlots.length; i++) {
        pastPlot = { lat: pastPlots[i].Latitude, lng: pastPlots[i].Longitude };
        flightCoordinates.push(pastPlot);
    }
    var flightPath = new google.maps.Polyline({
        path: flightCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    flightPath.metadata = {
        id: id
    };
    flightPaths.push(flightPath);
}

//create the button to change the marker from a plane image to a square image
function AviationControl(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '18px';
    controlUI.style.marginBottom = '18px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to switch to aviation mode';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '12px';
    controlText.style.lineHeight = '30px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Aviation mode';
    controlUI.appendChild(controlText);

    controlUI.addEventListener('click', function () {
        aviationMode = true;
        planeMode = false;
        clearAllMarkers();
        getDataAndDisplayOnMap();
    });
}

//create the button to change the markers from a square image to a plane image
function PlaneControl(planeControlDiv, map) {

    // Set CSS for the control border.
    var planeControlUI = document.createElement('div');
    planeControlUI.style.backgroundColor = '#fff';
    planeControlUI.style.border = '2px solid #fff';
    planeControlUI.style.borderRadius = '3px';
    planeControlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    planeControlUI.style.cursor = 'pointer';
    planeControlUI.style.textAlign = 'center';
    planeControlUI.title = 'Click to switch to plane mode';
    planeControlDiv.appendChild(planeControlUI);

    // Set CSS for the control interior.
    var planeControlText = document.createElement('div');
    planeControlText.style.color = 'rgb(25,25,25)';
    planeControlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    planeControlText.style.fontSize = '12px';
    planeControlText.style.lineHeight = '30px';
    planeControlText.style.paddingLeft = '5px';
    planeControlText.style.paddingRight = '5px';
    planeControlText.innerHTML = 'Plane mode';
    planeControlUI.appendChild(planeControlText);

    planeControlUI.addEventListener('click', function () {
        planeMode = true;
        aviationMode = false;
        clearAllMarkers();
        getDataAndDisplayOnMap();
    });
}

//generate coordinates for testing purposes
function generateCoordinate(coordinate) {
    var u = Math.random();
    newCoordinate = coordinate + u;

    return newCoordinate;
}

//clear all the markers on the map
function clearAllMarkers() {
    for (var i = 0; i < currentlyDisplayedMarkers.length; i++) {
        currentlyDisplayedMarkers[i].setMap(null);
    }

    currentlyDisplayedMarkers = []; //empty array
}

//calculate the bearing using two pairs of coordinates
function calculateDirection(latitudeA, longitudeA, latitudeB, longitudeB) {
    var x, y, direction;
    x = Math.cos(latitudeB) * Math.sin(longitudeA - longitudeB);
    y = Math.cos(latitudeA) * Math.sin(latitudeB) - Math.sin(latitudeA) * Math.cos(latitudeB) * Math.cos(longitudeA - longitudeB);
    direction = Math.atan2(x, y);
    var directionAngle = 0;
    if (direction > 0) {
        directionAngle = direction * (180 / Math.PI);
    }
    else {
        directionAngle = 360 + (direction * (180 / Math.PI));
    }
    return directionAngle;
}
