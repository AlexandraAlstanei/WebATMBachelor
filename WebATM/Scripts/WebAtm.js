var map;
var currentlyDisplayedMarkers = [];

function initMap() {
   //Initialize google maps component
   map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 55.2, lng: 9.5 }, 
      zoom: 4
   });

   //get initial data from the WebAPI and display it on the map
   getDataAndDisplayOnMap();

   //start a javascript timer that starts every 5 seconds
   //on each iteration, get data and redraw it on the map
   setInterval(updateMap, 5000);
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
                var markerLatLng = { lat: data[i].Plots[data[i].Plots.length - 1].latitude, lng: data[i].Plots[data[i].Plots.length - 1].longitude };
                //display the marker on the map
                var marker = new google.maps.Marker({
                   position: markerLatLng,
                   map: map,
                   title: 'Hello World!'
                });

                currentlyDisplayedMarkers.push(marker);
             }
          });
}

function clearAllMarkers() {
   for (var i = 0; i < currentlyDisplayedMarkers.length; i++) {
      currentlyDisplayedMarkers[i].setMap(null);
   }

   currentlyDisplayedMarkers = []; //empty array
}