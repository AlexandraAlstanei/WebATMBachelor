﻿var map;
var currentlyDisplayedMarkers = [];
var aviationMode = false;
var planeMode = true;
var marker;
var found = false;
var markerLatLng;
var infowindow;
var iconImage;
var success = false;

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

    var slideLeft = new Menu({
        wrapper: '#o-wrapper',
        type: 'slide-left',
        menuOpenerClass: '.c-button',
        maskId: '#c-mask'
    });

    var slideLeftBtn = document.querySelector('#c-button--slide-left');
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(slideLeftBtn);

    slideLeftBtn.addEventListener('click', function (e) {
        e.preventDefault;
        slideLeft.open();
    });

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
                           var rotation = 90;
                           if (data[i].Plots.length > 1) {
                               rotation = calculateDirection(data[i].Plots[0].Latitude, data[i].Plots[0].Longitude, data[i].Plots[1].Latitude, data[i].Plots[1].Longitude);
                           }
                           currentlyDisplayedMarkers[m].setPosition(updatedMarkerLatLng);
                           iconImage.rotation = rotation;
                           currentlyDisplayedMarkers[m].setOptions({
                               icon: iconImage
                           });
                           found = true;
                       }
                   }
                   //if the marker is not shown already, show it
                   if (!found) {
                       var LatLng = { lat: data[i].Plots[0].Latitude, lng: data[i].Plots[0].Longitude };
                       createMarker(LatLng, data[i].TrackNumber);
                   }
               }
           });
}

function createMarker(markerLatLng, id) {
    if (planeMode) {
        //display the marker on the map by using an svg image of a plane
        iconImage = {
            path: 'M438.8,320.6c-3.6-3.1-147.2-107.2-147.2-107.2c-0.2-0.2-0.4-0.4-0.5-0.5c-5.5-5.6-5.2-10.4-5.6-18.8c0,0-0.9-69-2.2-92  S270,64,256,64c0,0,0,0,0,0s0,0,0,0c-14,0-25.9,15-27.2,38s-2.2,92-2.2,92c-0.4,8.4-0.1,13.2-5.6,18.8c-0.2,0.2-0.4,0.4-0.5,0.5  c0,0-143.5,104.1-147.2,107.2s-9.2,7.8-9.2,18.2c0,12.2,3.6,13.7,10.6,11.6c0,0,140.2-39.5,145.4-40.8s7.9,0.6,8.3,7.5  s0.8,46.4,0.9,51s-0.6,4.7-2.9,7.4l-32,40.8c-1.7,2-2.7,4.5-2.7,7.3c0,0,0,6.1,0,12.4s2.8,7.3,8.2,4.9s32.6-17.4,32.6-17.4  c0.7-0.3,4.6-1.9,6.4-1.9c4.2,0,8-0.1,8.8,6.2c1.3,11.4,4.9,20.3,8.5,20.3c0,0,0,0,0,0s0,0,0,0c3.6,0,7.2-8.9,8.5-20.3  c0.7-6.3,4.6-6.2,8.8-6.2c1.8,0,5.7,1.6,6.4,1.9c0,0,27.2,15,32.6,17.4s8.2,1.4,8.2-4.9s0-12.4,0-12.4c0-2.8-1-5.4-2.7-7.3l-32-40.8  c-2.3-2.7-2.9-2.9-2.9-7.4s0.5-44.1,0.9-51s3.1-8.8,8.3-7.5s145.4,40.8,145.4,40.8c7.1,2.1,10.6,0.6,10.6-11.6  C448,328.4,442.5,323.7,438.8,320.6z',
            fillColor: '#800000',
            strokeColor: '#FFFF99',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            scale: 0.07,
            fillOpacity: 1,
            rotation: 0
        }

    } else {
        iconImage = {
            path: 'M265.54,0H13.259C5.939,0,0.003,5.936,0.003,13.256v252.287c0,7.32,5.936,13.256,13.256,13.256H265.54c7.318,0,13.256-5.936,13.256-13.256V13.255C278.796,5.935,272.86,0,265.54,0z M252.284,252.287H26.515V26.511h225.769V252.287z',
            strokeColor: '#800000',
            scale: 0.05,
            fillOpacity: 1,
            strokeWeight: 1
        }
        if (aviationMode) {
            iconImage = {
                path: 'M265.54,0H13.259C5.939,0,0.003,5.936,0.003,13.256v252.287c0,7.32,5.936,13.256,13.256,13.256H265.54c7.318,0,13.256-5.936,13.256-13.256V13.255C278.796,5.935,272.86,0,265.54,0z M252.284,252.287H26.515V26.511h225.769V252.287z',
                strokeColor: '#800000',
                scale: 0.05,
                fillOpacity: 1,
                strokeWeight: 1
            }
        } else {
            // display the marker on the map by using an svg image of a plane
            iconImage = {
                path: 'M438.8,320.6c-3.6-3.1-147.2-107.2-147.2-107.2c-0.2-0.2-0.4-0.4-0.5-0.5c-5.5-5.6-5.2-10.4-5.6-18.8c0,0-0.9-69-2.2-92  S270,64,256,64c0,0,0,0,0,0s0,0,0,0c-14,0-25.9,15-27.2,38s-2.2,92-2.2,92c-0.4,8.4-0.1,13.2-5.6,18.8c-0.2,0.2-0.4,0.4-0.5,0.5  c0,0-143.5,104.1-147.2,107.2s-9.2,7.8-9.2,18.2c0,12.2,3.6,13.7,10.6,11.6c0,0,140.2-39.5,145.4-40.8s7.9,0.6,8.3,7.5  s0.8,46.4,0.9,51s-0.6,4.7-2.9,7.4l-32,40.8c-1.7,2-2.7,4.5-2.7,7.3c0,0,0,6.1,0,12.4s2.8,7.3,8.2,4.9s32.6-17.4,32.6-17.4  c0.7-0.3,4.6-1.9,6.4-1.9c4.2,0,8-0.1,8.8,6.2c1.3,11.4,4.9,20.3,8.5,20.3c0,0,0,0,0,0s0,0,0,0c3.6,0,7.2-8.9,8.5-20.3  c0.7-6.3,4.6-6.2,8.8-6.2c1.8,0,5.7,1.6,6.4,1.9c0,0,27.2,15,32.6,17.4s8.2,1.4,8.2-4.9s0-12.4,0-12.4c0-2.8-1-5.4-2.7-7.3l-32-40.8  c-2.3-2.7-2.9-2.9-2.9-7.4s0.5-44.1,0.9-51s3.1-8.8,8.3-7.5s145.4,40.8,145.4,40.8c7.1,2.1,10.6,0.6,10.6-11.6  C448,328.4,442.5,323.7,438.8,320.6z',
                fillColor: '#800000',
                strokeColor: '#FFFF99',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                scale: 0.07,
                fillOpacity: 1,
                rotation: 0
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
    });
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


function validate1() {
    var TMA_B = document.getElementById('TMA B');
    var isDuplicate = false;
    if (TMA_B.checked) {
        drawMap('\n         TMA B\n      ', '\n         EKBI\n      ');
    }
}

function validate2() {
    var TMA_C = document.getElementById('TMA C');
    var isDuplicate = false;
    if (TMA_C.checked) {
        drawMap('\n         TMA C\n      ', '\n         EKBI\n      ');
    }
}

function validate3() {
    var TMA_D = document.getElementById('TMA D');
    var isDuplicate = false;
    if (TMA_D.checked) {
        drawMap('\n         TMA D\n      ', '\n         EKBI\n      ');
    }
}

function validate4() {
    var RR_20NM = document.getElementById('RR 20NM');
    var isDuplicate = false;
    if (RR_20NM.checked) {
        drawMap('\n         RR 20NM\n      ', '\n         EKEB\n      ');
    }
}

function validate5() {
    var RR_5NM = document.getElementById('RR 5NM');
    var isDuplicate = false;
    if (RR_5NM.checked) {
        drawMap('\n         RR 5NM\n      ', '\n         EKEB\n      ');
    }
}

function validate6() {
    var RR_1NM = document.getElementById('RR 1NM');
    var isDuplicate = false;
    if (RR_1NM.checked) {
        drawMap('\n         RR 1NM\n      ', '\n         EKEB\n      ');
    }
}

function validate7() {
    var RR_10NM = document.getElementById('RR 10NM');
    var isDuplicate = false;
    if (RR_10NM.checked) {
        drawMap('\n         RR 10NM\n      ', '\n         EKEB\n      ');
    }
}

function validate8() {
    var TMA = document.getElementById('TMA_EKEB');
    var isDuplicate = true;
    if (TMA.checked) {
        drawMap('\n         TMA\n      ', '\n         EKEB\n      ');
    }
}

function validate9() {
    var dop_app_08 = document.getElementById('dop app 08');
    if (dop_app_08.checked) {
        drawMap('\n         dop app 08\n      ', '\n         EKEB\n      ');
    }
}

function validate10() {
    var CTR = document.getElementById('CTR');
    if (CTR.checked) {
        drawMap('\n         CTR\n      ', '\n         EKSP\n      ');
    }
}

function validate11() {
    var TMA = document.getElementById('TMA_EKSP');
    if (TMA.checked) {
        drawMap('\n         TMA\n      ', '\n         EKSP\n      ');
    }
}

function validate12() {
    var AREA = document.getElementById('AREA');
    if (AREA.checked) {
        drawMap('\n         AREA\n      ', '\n         EKSP\n      ');
    }
}

function validate13() {
    var Anholt = document.getElementById('Anholt');
    if (Anholt.checked) {
        drawMap('\n         Anholt\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate14() {
    var Thisted = document.getElementById('Thisted');
    if (Thisted.checked) {
        drawMap('\n         Thisted\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate15() {
    var Endelave = document.getElementById('Endelave');
    if (Endelave.checked) {
        drawMap('\n         Endelave\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate16() {
    var Freerslev = document.getElementById('Freerslev');
    if (Freerslev.checked) {
        drawMap('\n         Freerslev\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate17() {
    var Læsø = document.getElementById('Læsø');
    if (Læsø.checked) {
        drawMap('\n         Læsø\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate18() {
    var Vamdrup = document.getElementById('Vamdrup');
    if (Vamdrup.checked) {
        drawMap('\n         Vamdrup\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate19() {
    var True = document.getElementById('True');
    if (True.checked) {
        drawMap('\n         True\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate20() {
    var Grønholt = document.getElementById('Grønholt');
    if (Grønholt.checked) {
        drawMap('\n         Grønholt\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate21() {
    var Haderslev = document.getElementById('Haderslev');
    if (Haderslev.checked) {
        drawMap('\n         Haderslev\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate22() {
    var Hadsund = document.getElementById('Hadsund');
    if (Hadsund.checked) {
        drawMap('\n         Hadsund\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate23() {
    var Varde = document.getElementById('Varde');
    if (Varde.checked) {
        drawMap('\n         Varde\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate24() {
    var Viborg = document.getElementById('Viborg');
    if (Viborg.checked) {
        drawMap('\n         Viborg\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate25() {
    var Holsted = document.getElementById('Holsted');
    if (Holsted.checked) {
        drawMap('\n         Holsted\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate26() {
    var Stauning = document.getElementById('Stauning');
    if (Stauning.checked) {
        drawMap('\n         Stauning\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate27() {
    var Grenaa = document.getElementById('Grenaa');
    if (Grenaa.checked) {
        drawMap('\n         Grenaa\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate28() {
    var Aars = document.getElementById('Aars');
    if (Aars.checked) {
        drawMap('\n         Aars\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate29() {
    var Samsø = document.getElementById('Samsø');
    if (Samsø.checked) {
        drawMap('\n         Samsø\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate30() {
    var Gørlev = document.getElementById('Gørlev');
    if (Gørlev.checked) {
        drawMap('\n         Gørlev\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate31() {
    var Skive = document.getElementById('Skive');
    if (Skive.checked) {
        drawMap('\n         Skive\n      ', '\n         Flyvepladser\n      ');
    }
}

function validate32() {
    var Vestkraft = document.getElementById('Vestkraft');
    if (Vestkraft.checked) {
        drawMap('\n         Vestkraft\n      ', '\n         MSAW AREAS\n      ');
    }
}

function validate33() {
    var Hadsten = document.getElementById('Hadsten');
    if (Hadsten.checked) {
        drawMap('\n         Hadsten\n      ', '\n         MSAW AREAS\n      ');
    }
}

function validate34() {
    var Nordenskov = document.getElementById('Nordenskov');
    if (Nordenskov.checked) {
        drawMap('\n         Nordenskov\n      ', '\n         MSAW AREAS\n      ');
    }
}

function validate35() {
    var Nybro = document.getElementById('Nybro');
    if (Nybro.checked) {
        drawMap('\n         Nybro\n      ', '\n         MSAW AREAS\n      ');
    }
}

function validate36() {
    var AAL = document.getElementById('AAL');
    if (AAL.checked) {
        drawMap('\n         AAL\n      ', '\n         NAV AIDS\n      ');
    }
}

function validate37() {
    var AMRAM = document.getElementById('AMRAM');
    if (AMRAM.checked) {
        drawMap('\n         AMRAM\n      ', '\n         RNAV\n      ');
    }
}

function validate38() {
    var TEMP_FALCB = document.getElementById('TEMP-FALCB');
    if (TEMP_FALCB.checked) {
        drawMap('\n         TEMP-FALCB\n      ', '\n         RNAV\n      ');
    }
}

function validate39() {
    var TEMP_FALCA = document.getElementById('TEMP-FALCA');
    if (TEMP_FALCA.checked) {
        drawMap('\n         TEMP-FALCA\n      ', '\n         RNAV\n      ');
    }
}

function validate40() {
    var NEBUM = document.getElementById('NEBUM');
    if (NEBUM.checked) {
        drawMap('\n         NEBUM\n      ', '\n         RNAV\n      ');
    }
}

function validate41() {
    var Temp_NORTH = document.getElementById('Temp - NORTH');
    if (Temp_NORTH.checked) {
        drawMap('\n         Temp - NORTH\n      ', '\n         RNAV\n      ');
    }
}

function validate42() {
    var REXW = document.getElementById('REXW');
    if (REXW.checked) {
        drawMap('\n         REXW\n      ', '\n         RNAV\n      ');
    }
}

function validate43() {
    var EPILO = document.getElementById('EPILO');
    if (EPILO.checked) {
        drawMap('\n         EPILO\n      ', '\n         RNAV\n      ');
    }
}

function validate44() {
    var TEMP_BLAAV = document.getElementById('TEMP-BLAAV');
    if (TEMP_BLAAV.checked) {
        drawMap('\n         TEMP-BLAAV\n      ', '\n         RNAV\n      ');
    }
}

function validate45() {
    var DETOP = document.getElementById('DETOP');
    if (DETOP.checked) {
        drawMap('\n         DETOP\n      ', '\n         RNAV\n      ');
    }
}

function validate46() {
    var DRONE = document.getElementById('DRONE');
    if (DRONE.checked) {
        drawMap('\n         DRONE\n      ', '\n         RNAV\n      ');
    }
}

function validate47() {
    var NEBSA = document.getElementById('NEBSA');
    if (NEBSA.checked) {
        drawMap('\n         NEBSA\n      ', '\n         RNAV\n      ');
    }
}

function validate48() {
    var TEMP_FALCC = document.getElementById('TEMP-FALCC');
    if (TEMP_FALCC.checked) {
        drawMap('\n         TEMP-FALCC\n      ', '\n         RNAV\n      ');
    }
}

function validate49() {
    var EK_D380_KALLESMÆRSK_ØST = document.getElementById('EK D380 KALLESMÆRSK ØST');
    if (EK_D380_KALLESMÆRSK_ØST.checked) {
        drawMap('\n         EK D380 KALLESMÆRSK ØST\n      ', '\n         Skydeområder\n      ');
    }
}

function validate50() {
    var EK_D301_Fanoe_TSA = document.getElementById('EK D301 Fanoe-TSA');
    if (EK_D301_Fanoe_TSA.checked) {
        drawMap('\n         EK D301 Fanoe-TSA\n      ', '\n         Skydeområder\n      ');
    }
}

function validate51() {
    var Temp_UAV_corridor = document.getElementById('Temp - UAV corridor');
    if (Temp_UAV_corridor.checked) {
        drawMap('\n         Temp - UAV corridor\n      ', '\n         Skydeområder\n      ');
    }
}

function validate52() {
    var EK_D381_KALLESMÆSKT_VEST = document.getElementById('EK D381 KALLESMÆSKT VEST');
    if (EK_D381_KALLESMÆSKT_VEST.checked) {
        drawMap('\n         EK D381 KALLESMÆSKT VEST\n      ', '\n         Skydeområder\n      ');
    }
}

function validate53() {
    var EK_D373_RØMØ_VEST = document.getElementById('EK D373 RØMØ VEST');
    if (EK_D373_RØMØ_VEST.checked) {
        drawMap('\n         EK D373 RØMØ VEST\n      ', '\n         Skydeområder\n      ');
    }
}

function validate54() {
    var Temp_Falcon_Transit_Corridor = document.getElementById('Temp - Falcon Transit Corridor');
    if (Temp_Falcon_Transit_Corridor.checked) {
        drawMap('\n         Temp - Falcon Transit Corridor\n     ', '\n         Skydeområder\n      ');
    }
}

function validate55() {
    var TEMP_UAS_Hemmet = document.getElementById('TEMP-UAS Hemmet');
    if (TEMP_UAS_Hemmet.checked) {
        drawMap('\n         TEMP- UAS Hemmet\n      ', '\n         Skydeområder\n      ');
    }
}

function validate56() {
    var EK_R33_VEJERS = document.getElementById('EK R33 VEJERS');
    if (EK_R33_VEJERS.checked) {
        drawMap('\n         EK R33 VEJERS\n      ', '\n         Skydeområder\n      ');
    }
}

function validate57() {
    var EK_R38_RØMØ_ØST = document.getElementById('EK R38 RØMØ ØST');
    if (EK_R38_RØMØ_ØST.checked) {
        drawMap('\n         EK R38 RØMØ ØST\n      ', '\n         Skydeområder\n      ');
    }
}

function validate58() {
    var Temp_Falcon_Live_Aim_Area = document.getElementById('Temp - Falcon Live Aim Area');
    if (Temp_Falcon_Live_Aim_Area.checked) {
        drawMap('\n         Temp - Falcon Live Aim Area\n      ', '\n         Skydeområder\n      ');
    }
}

function validate59() {
    var UAS_VARDE = document.getElementById('UAS VARDE');
    if (UAS_VARDE.checked) {
        drawMap('\n         UAS VARDE\n      ', '\n         Skydeområder\n      ');
    }
}

function validate60() {
    var LILLE_RØMØ_TEMP = document.getElementById('LILLE RØMØ - TEMP');
    if (LILLE_RØMØ_TEMP.checked) {
        drawMap('\n         LILLE RØMØ - TEMP\n      ', '\n         Skydeområder\n      ');
    }
}

function validate61() {
    var EK_R34_BORDRUP = document.getElementById('EK R34 BORDRUP');
    if (EK_R34_BORDRUP.checked) {
        drawMap('\n         EK R34 BORDRUP\n      ', '\n         Skydeområder\n      ');
    }
}

function validate62() {
    var Temp_Nymindegab_vest = document.getElementById('Temp - Nymindegab vest');
    if (Temp_Nymindegab_vest.checked) {
        drawMap('\n         Temp - Nymindegab vest\n      ', '\n         Skydeområder\n      ');
    }
}

function validate63() {
    var Corridor_Fanoe = document.getElementById('Corridor Fanoe');
    if (Corridor_Fanoe.checked) {
        drawMap('\n         Corridor Fanoe\n      ', '\n         Skydeområder\n      ');
    }
}

function validate64() {
    var Temp_REX_Live_Aim = document.getElementById('Temp - REX Live Aim');
    if (Temp_REX_Live_Aim.checked) {
        drawMap('\n         Temp - REX Live Aim\n      ', '\n         Skydeområder\n      ');
    }
}

function validate65() {
    var EK_R32_OKSBY = document.getElementById('EK R32 OKSBY');
    if (EK_R32_OKSBY.checked) {
        drawMap('\n         EK R32 OKSBY\n      ', '\n         Skydeområder\n      ');
    }
}

function validate66() {
    var EK_D379_NYMINDEGAB_ØST = document.getElementById('EK D379 NYMINDEGAB ØST');
    if (EK_D379_NYMINDEGAB_ØST.checked) {
        drawMap('\n         EK D379 NYMINDEGAB ØST\n      ', '\n         Skydeområder\n      ');
    }
}

function validate67() {
    var Temp_drone = document.getElementById('Temp - drone');
    if (Temp_drone.checked) {
        drawMap('\n         Temp - drone\n      ', '\n         Skydeområder\n      ');
    }
}

function validate68() {
    var EK_R35_HENNE = document.getElementById('EK R35 HENNE');
    if (EK_R35_HENNE.checked) {
        drawMap('\n         EK R35 HENNE\n      ', '\n         Skydeområder\n      ');
    }
}

function validate70() {
    var STCAexclude = document.getElementById('STCAexclude');
    if (STCAexclude.checked) {
        drawMap('\n         STCAexclude\n      ', '\n         STCA Areas\n      ');
    }
}

function validate71() {
    var EKEB_EnRoute = document.getElementById('EKEB EnRoute');
    if (EKEB_EnRoute.checked) {
        drawMap('\n         EKEB EnRoute\n      ', '\n         STCA Areas\n      ');
    }
}

function validate72() {
    var EKAH_EnRoute = document.getElementById('EKAH EnRoute');
    if (EKAH_EnRoute.checked) {
        drawMap('\n         EKAH EnRoute\n      ', '\n         STCA Areas\n      ');
    }
}

function validate73() {
    var BOLHEDE_WEST = document.getElementById('BOLHEDE WEST');
    if (BOLHEDE_WEST.checked) {
        drawMap('\n         BOLHEDE WEST\n      ', '\n         Svæveflyve områder\n      ');
    }
}

function validate74() {
    var BOLHEDE = document.getElementById('BOLHEDE');
    if (BOLHEDE.checked) {
        drawMap('\n         BOLHEDE\n      ', '\n         Svæveflyve områder\n      ');
    }
}

function validate75() {
    var VORBASSE = document.getElementById('VORBASSE');
    if (VORBASSE.checked) {
        drawMap('\n         VORBASSE\n      ', '\n         Svæveflyve områder\n      ');
    }
}

function validate76() {
    var GESTEN = document.getElementById('GESTEN');
    if (GESTEN.checked) {
        drawMap('\n         GESTEN\n      ', '\n         Svæveflyve områder\n      ');
    }
}

function validate77() {
    var Horns_Rev_A = document.getElementById('Horns Rev A');
    if (Horns_Rev_A.checked) {
        drawMap('\n         Horns Rev A\n      ', '\n         Vindmølleparker\n      ');
    }
}

function validate78() {
    var Horns_Rev_B = document.getElementById('Horns Rev B');
    if (Horns_Rev_B.checked) {
        drawMap('\n         Horns Rev B\n     ', '\n         Vindmølleparker\n      ');
    }
}

function validate79() {
    var EHHG_H7 = document.getElementById('EHHG H7');
    if (EHHG_H7.checked) {
        drawMap('\n         EHHG H7\n      ', '\n         Vindmølleparker\n      ');
    }
}

function validate80() {
    var Dantysk = document.getElementById('Dantysk');
    if (Dantysk.checked) {
        drawMap('\n         Dantysk\n      ', '\n         Vindmølleparker\n      ');
    }
}

function drawMap(mapName, groupName) {
    var uri = 'api/webatm/ReadMapElements';
    //make AJAX call that returns the data in JSON format
    var mapElement;
    $.getJSON(uri)
           .done(function (data) {
               for (var i = 0; i < data.length; i++) {
                       if ((data[i].name.localeCompare(mapName) == 0) && (data[i].groupname.localeCompare(groupName) == 0)) {
                           mapElement = data[i];
                           for (var j = 0; j < mapElement.shapes.length; j++) {
                               if (mapElement.shapes[j].type.localeCompare('Polygon') == 0) {
                                   var color = mapElement.shapes[j].Color;
                                   var pathCoordinates = [];
                                   for (var m = 0; m < mapElement.shapes[j].coordinates.length; m++) {
                                       var coord = { lat: mapElement.shapes[j].coordinates[m].Latitude, lng: mapElement.shapes[j].coordinates[m].Longitude };
                                       pathCoordinates.push(coord);
                                   }
                                   addPolygon(color, pathCoordinates);
                               } else if (mapElement.shapes[j].type.localeCompare('Polyline') == 0) {

                               } else if (mapElement.shapes[j].type.localeCompare('Circle') == 0) {
                                   var color = mapElement.shapes[j].Color;
                                   var center = { lat: mapElement.shapes[j].centerCoordinates[0].Latitude, lng: mapElement.shapes[j].centerCoordinates[0].Longitude };
                                   var r = mapElement.shapes[j].Radius;
                                   addCircle(color, center, r);
                               }
                           }
                       }
                   }
           });
}

function checkGroupName(groupName) {
    var uri = 'api/webatm/ReadMapElements';
    //make AJAX call that returns the data in JSON format
    var isPartOfTheGroup = false;
    $.getJSON(uri)
           .done(function (data) {
               for (var i = 0; i < data.length; i++) {
                   if (data[i].groupname.localeCompare(groupName) == 0) {
                       isPartOfTheGroup = true;
                   }
               }
           });
}

function addCircle(color, center, r) {
    var uri = 'api/webatm/ReadMapElements';
    //make AJAX call that returns the data in JSON format
    $.getJSON(uri)
           .done(function (data) {
               // Add the circle for this city to the map.
               var cityCircle = new google.maps.Circle({
                   strokeColor: color,
                   map: map,
                   center: center,
                   radius: r * 10000,
                   fillOpacity: 0.0
               });
           });
}

function addPolygon(color, pathCoordinates) {
    var uri = 'api/webatm/ReadMapElements';
    //make AJAX call that returns the data in JSON format
    $.getJSON(uri)
           .done(function (data) {
               // Add the circle for this city to the map.
               var flightPath = new google.maps.Polyline({
                   path: pathCoordinates,
                   geodesic: true,
                   strokeColor: color,
                   map: map
               });
           });
}