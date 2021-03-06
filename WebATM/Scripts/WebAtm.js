﻿/// <summary>
/// In this class the UI elements are created.
/// </summary>

var map;
var currentlyDisplayedMarkers = [];
var aviationMode = false;
var planeMode = true;
var marker;
var found = false;
var markerLatLng;
var infowindow;
var iconImage;
var slideLeftMaps;
var shapes = [];
var deletedFlights = 0;


function initMap() {
    //Initialize google maps component
    //Create a dropdown menu with different map types
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 55.2, lng: 9.5 },
        zoom: 8,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
            mapTypeIds: [
              google.maps.MapTypeId.ROADMAP,
              google.maps.MapTypeId.TERRAIN,
              google.maps.MapTypeId.SATELLITE,
              google.maps.MapTypeId.HYBRID
            ]
        }
    });

    //Initialization of the slide left menu
    slideLeftMaps = new Menu({
        wrapper: '#o-wrapper',
        type: 'slide-left',
        menuOpenerClass: '.c-button',
        maskId: '#c-mask'
    });

    //Initialization of the user controls
    var slideLeftBtn = document.querySelector('#c-button--slide-left');
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(slideLeftBtn);

    var planeControl = document.querySelector('#c-button-plane-control');
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(planeControl);

    var squareControl = document.querySelector('#c-button-square-control');
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(squareControl);

    //Event listeners for the user controls.
    slideLeftBtn.addEventListener('click', function (e) {
        e.preventDefault;
        slideLeftMaps.open();
    });

    planeControl.addEventListener('click', function () {
        planeMode = true;
        aviationMode = false;
        clearAllMarkers();
        getDataAndDisplayOnMap();
    });

    squareControl.addEventListener('click', function () {
        aviationMode = true;
        planeMode = false;
        clearAllMarkers();
        getDataAndDisplayOnMap();
    });

    //Get initial data from the WebAPI and display it on the map
    getDataAndDisplayOnMap();

    //Start a javascript timer that starts every 4 seconds for updating the map
    setInterval(updateMap, 4000);
    //Start a javascript timer that starts every 15 seconds for updating the map
    setInterval(removeFlights, 15000);
}

function updateMap() {
    //This will repeat every 4 seconds 
    getDataAndDisplayOnMap();
    document.getElementById("flights_number").innerHTML = currentlyDisplayedMarkers.length + '/' + deletedFlights.toString();
}

function removeFlights() {
    for (var i = 0; i < currentlyDisplayedMarkers.length; i++) {
        //If the currently displayed marker has not been updates in the past 15 seconds, delete it.
        if (!currentlyDisplayedMarkers[i].metadata.updated) {
            currentlyDisplayedMarkers[i].setMap(null);
            deletedFlights++;
            currentlyDisplayedMarkers[i].metadata.updated = false;
        }
    }
}


function getDataAndDisplayOnMap() {
    var uri = 'api/webatm/GetAllFlights';

    //Make AJAX call that returns the data in JSON format
    $.getJSON(uri)
           .done(function (data) {
               // On success, 'data' contains a list of flights.
               for (var i = 0; i < data.length; i++) {
                   found = false;
                   for (var m = 0; m < currentlyDisplayedMarkers.length; m++) {
                       //Find the corresponding marker
                       if (currentlyDisplayedMarkers[m].metadata.id == data[i].TrackNumber) {
                           //Create the new coordinates and change the position of the markers
                           var updatedMarkerLatLng = { lat: data[i].Plots[0].Latitude, lng: data[i].Plots[0].Longitude }
                           var rotation = 90;
                           //Set the new rotation of the svg. only if the plane mode is used
                           if (data[i].Plots.length > 1) {
                               rotation = calculateDirection(data[i].Plots[0].Latitude, data[i].Plots[0].Longitude, data[i].Plots[1].Latitude, data[i].Plots[1].Longitude);
                           }
                           if (planeMode) {
                               iconImage.rotation = rotation;
                           }
                           currentlyDisplayedMarkers[m].setOptions({
                               icon: iconImage
                           });
                           //Set the marker metadata to updated.
                           currentlyDisplayedMarkers[m].setPosition(updatedMarkerLatLng);
                           if (currentlyDisplayedMarkers[m].metadata.numberOfPlots < data[i].Plots.length) {
                               currentlyDisplayedMarkers[m].metadata.updated = true;
                           }
                           found = true;
                       }
                   }
                   //If the marker is not shown already, show it
                   if (!found) {
                       var LatLng = { lat: data[i].Plots[0].Latitude, lng: data[i].Plots[0].Longitude };
                       var info = data[i];
                       createMarker(LatLng, info);
                   }
               }
           });
}

function createMarker(markerLatLng, info) {
    if (planeMode) {
        // Display the marker on the map by using an svg image of a plane.
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
        // Display the marker on the map by using an svg image of a square.
        iconImage = {
            path: 'M265.54,0H13.259C5.939,0,0.003,5.936,0.003,13.256v252.287c0,7.32,5.936,13.256,13.256,13.256H265.54c7.318,0,13.256-5.936,13.256-13.256V13.255C278.796,5.935,272.86,0,265.54,0z M252.284,252.287H26.515V26.511h225.769V252.287z',
            strokeColor: '#800000',
            scale: 0.05,
            fillOpacity: 1,
            strokeWeight: 1
        }
    }

    //Create the information window for the marker
    var aircraftType;
    var adep;
    var ades;
    var callSign;
    var wtc;
    var altitude;
    var speed;
    if (info.AircraftType == null) {
        aircraftType = 'N/A';
    } else {
        aircraftType = info.AircraftType;
    }
    if (info.ADEP == null) {
        adep = 'N/A';
    } else {
        adep = info.ADEP;
    }
    if (info.ADES == null) {
        ades = 'N/A';
    } else {
        ades = info.ADES;
    }
    if (info.CallSign == null) {
        callSign = 'N/A';
    } else {
        callSign = info.CallSign;
    }
    if (info.WTC == null) {
        wtc = 'N/A'
    } else {
        wtc = info.WTC;
    }
    if (info.Plots.CurrentFlightLevel == null) {
        altitude = 'N/A'
    } else {
        altitude = info.Plots.CurrentFlightLevel;
    } if (info.Plots.Velocity == null) {
        speed = 'N/A'
    } else {
        speed = info.Plots.Velocity;
    }

    var sContent = '<div id="iw-container">' +
                    '<div class="iw-content">' +
                    '<div id="parent1">' +
                    '<div class="child_div">' +
                         '<img src="Content/Icons/radarinfo.png" alt="Radar" height="32" width="32">' +
                            '</div>' +
                    '<div class="secondChild_div">' +
                         'Callsign: ' + callSign +
                            '</div>' +
                    '<div class="child_div">' +
                         '<img src="Content/Icons/cloud1.png" alt="Cloud" height="32" width="32">' +
                            '</div>' +
                    '<div class="secondChild_div">' +
                         'Altitude Speed: ' + altitude + '  '+speed+
                            '</div>' +
                            '<div class="child_div">' +
                         '<img src="Content/Icons/atype.png" alt="Plane type" height="32" width="32">' +
                            '</div>' +
                    '<div class="secondChild_div">' +
                         'Aircraft/ WTC: ' + aircraftType + '  ' + wtc +
                            '</div>' +
                    '<div class="child_div">' +
                        '<img src="Content/Icons/takingoff.png" alt="Take off plane" height="32" width="32">' +
                         '</div>' +
                    '<div class="secondChild_div">' +
                         'Departure airport: ' + adep +
                         '</div>' +
                    '<div class="child_div">' +
                         '<img src="Content/Icons/landing.png" alt="Landing plane" height="32" width="32">' +
                         '</div>' +
                    '<div class="secondChild_div">' +
                         'Destination airport: ' + ades +
                         '</div>' +
                     '</div>' + '</div>' + '</div>';

    //Draw the marker and attach it to the map
    marker = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        icon: iconImage,
        draggable: false,
        info: sContent,
        callSign: callSign
    });

    //Add aditional properties to the marker
    marker.metadata = {
        id: info.TrackNumber,
        numberOfPlots: info.Plots.length,
        updated: false
    };

    //Set the content for the information window
    infowindow = new google.maps.InfoWindow({
        content: sContent
    });

    var callSignWindow = new google.maps.InfoWindow({
        content: callSign
    });

    //Event listeners for the information windows
    google.maps.event.addListener(marker, 'mouseover', function () {
        callSignWindow.setContent(this.callSign);
        callSignWindow.open(map, this);
    });

    google.maps.event.addListener(marker, 'mouseout', function () {
        callSignWindow.close();
    });

    //Event listener for the marker.
    //When a marker is clicked the information window is open.
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.close();
        infowindow.setContent(this.info);
        infowindow.open(map, this);
        // createPath(info.Plots);

    });

    //When the user clicks outside the information window, it should close.
    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });

    //Add the marker to the markers array
    currentlyDisplayedMarkers.push(marker);

}

//Generate coordinates for testing purposes
function generateCoordinate(coordinate) {
    var u = Math.random();
    newCoordinate = coordinate + u;

    return newCoordinate;
}

//Clear all the markers on the map
function clearAllMarkers() {
    for (var i = 0; i < currentlyDisplayedMarkers.length; i++) {
        currentlyDisplayedMarkers[i].setMap(null);
    }
    currentlyDisplayedMarkers = []; 
}

//Calculate the bearing using two pairs of coordinates
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

// Validate functions for the checkboxes used for Insero Maps
function validate1() {
    var TMA_B = document.getElementById('TMA B');
    if (TMA_B.checked) {
        drawMap('\n         TMA B\n      ', '\n         EKBI\n      ', 1);
    } else {
        removeShape(1);
    }
}

function validate2() {
    var TMA_C = document.getElementById('TMA C');
    if (TMA_C.checked) {
        drawMap('\n         TMA C\n      ', '\n         EKBI\n      ', 2);
    } else {
        removeShape(2);
    }
}

function validate3() {
    var TMA_D = document.getElementById('TMA D');
    if (TMA_D.checked) {
        drawMap('\n         TMA D\n      ', '\n         EKBI\n      ', 3);
    } else {
        removeShape(3);
    }
}

function validate4() {
    var RR_20NM = document.getElementById('RR 20NM');
    if (RR_20NM.checked) {
        drawMap('\n         RR 20NM\n      ', '\n         EKEB\n      ', 4);
    } else {
        removeShape(4);
    }
}

function validate5() {
    var RR_5NM = document.getElementById('RR 5NM');
    if (RR_5NM.checked) {
        drawMap('\n         RR 5NM\n      ', '\n         EKEB\n      ', 5);
    } else {
        removeShape(5);
    }
}

function validate6() {
    var RR_1NM = document.getElementById('RR 1NM');
    if (RR_1NM.checked) {
        drawMap('\n         RR 1NM\n      ', '\n         EKEB\n      ', 6);
    } else {
        removeShape(6);
    }
}

function validate7() {
    var RR_10NM = document.getElementById('RR 10NM');
    if (RR_10NM.checked) {
        drawMap('\n         RR 10NM\n      ', '\n         EKEB\n      ', 7);
    } else {
        removeShape(7);
    }
}

function validate8() {
    var TMA = document.getElementById('TMA_EKEB');
    if (TMA.checked) {
        drawMap('\n         TMA\n      ', '\n         EKEB\n      ', 8);
    } else {
        removeShape(8);
    }
}

function validate9() {
    var dop_app_08 = document.getElementById('dop app 08');
    if (dop_app_08.checked) {
        drawMap('\n         dop app 08\n      ', '\n         EKEB\n      ', 9);
    } else {
        removeShape(9);
    }
}

function validate10() {
    var CTR = document.getElementById('CTR');
    if (CTR.checked) {
        drawMap('\n         CTR\n      ', '\n         EKSP\n      ', 10);
    } else {
        removeShape(10);
    }
}

function validate11() {
    var TMA = document.getElementById('TMA_EKSP');
    if (TMA.checked) {
        drawMap('\n         TMA\n      ', '\n         EKSP\n      ', 11);
    } else {
        removeShape(11);
    }
}

function validate32() {
    var Vestkraft = document.getElementById('Vestkraft');
    if (Vestkraft.checked) {
        drawMap('\n         Vestkraft\n      ', '\n         MSAW AREAS\n      ', 32);
    } else {
        removeShape(32);
    }
}

function validate33() {
    var Hadsten = document.getElementById('Hadsten');
    if (Hadsten.checked) {
        drawMap('\n         Hadsten\n      ', '\n         MSAW AREAS\n      ', 33);
    } else {
        removeShape(33);
    }
}

function validate34() {
    var Nordenskov = document.getElementById('Nordenskov');
    if (Nordenskov.checked) {
        drawMap('\n         Nordenskov\n      ', '\n         MSAW AREAS\n      ', 34);
    } else {
        removeShape(34);
    }
}

function validate35() {
    var Nybro = document.getElementById('Nybro');
    if (Nybro.checked) {
        drawMap('\n         Nybro\n      ', '\n         MSAW AREAS\n      ', 35);
    } else {
        removeShape(35);
    }
}


function validate45() {
    var DETOP = document.getElementById('DETOP');
    if (DETOP.checked) {
        drawMap('\n         DETOP\n      ', '\n         RNAV\n      ', 45);
    } else {
        removeShape(45);
    }
}

function validate49() {
    var EK_D380_KALLESMÆRSK_ØST = document.getElementById('EK D380 KALLESMÆRSK ØST');
    if (EK_D380_KALLESMÆRSK_ØST.checked) {
        drawMap('\n         EK D380 KALLESMÃ\u0086RSK Ã\u0098ST\n      ', '\n         SkydeomrÃ¥der\n      ', 49);
    } else {
        removeShape(49);
    }
}

function validate50() {
    var EK_D301_Fanoe_TSA = document.getElementById('EK D301 Fanoe-TSA');
    if (EK_D301_Fanoe_TSA.checked) {
        drawMap('\n         EK D301 Fanoe-TSA\n      ', '\n         SkydeomrÃ¥der\n      ', 50);
    } else {
        removeShape(50);
    }
}

function validate51() {
    var Temp_UAV_corridor = document.getElementById('Temp - UAV corridor');
    if (Temp_UAV_corridor.checked) {
        drawMap('\n         Temp - UAV corridor\n      ', '\n         SkydeomrÃ¥der\n      ', 51);
    } else {
        removeShape(51);
    }
}

function validate52() {
    var EK_D381_KALLESMÆSKT_VEST = document.getElementById('EK D381 KALLESMÆSKT VEST');
    if (EK_D381_KALLESMÆSKT_VEST.checked) {
        drawMap('\n         EK D381 KALLESMÃ\u0086SKT VEST\n      ', '\n         SkydeomrÃ¥der\n      ', 52);
    } else {
        removeShape(52);
    }
}

function validate53() {
    var Skallingen = document.getElementById('Skallingen');
    if (Skallingen.checked) {
        drawMap('\n         Skallingen\n      ', '\n         SkydeomrÃ¥der\n      ', 53);
    } else {
        removeShape(53);
    }
}

function validate54() {
    var Temp_Falcon_Transit_Corridor = document.getElementById('Temp - Falcon Transit Corridor');
    if (Temp_Falcon_Transit_Corridor.checked) {
        drawMap('\n         Temp - Falcon Transit Corridor\n     ', '\n         SkydeomrÃ¥der\n      ', 54);
    } else {
        removeShape(54);
    }
}

function validate55() {
    var TEMP_UAS_Hemmet = document.getElementById('TEMP-UAS Hemmet');
    if (TEMP_UAS_Hemmet.checked) {
        drawMap('\n         TEMP- UAS Hemmet\n      ', '\n         SkydeomrÃ¥der\n      ', 55);
    } else {
        removeShape(55);
    }
}

function validate56() {
    var EK_R33_VEJERS = document.getElementById('EK R33 VEJERS');
    if (EK_R33_VEJERS.checked) {
        drawMap('\n         EK R33 VEJERS\n      ', '\n         SkydeomrÃ¥der\n      ', 56);
    } else {
        removeShape(56);
    }
}

function validate57() {
    var EK_R38_RØMØ_ØST = document.getElementById('EK R38 RØMØ ØST');
    if (EK_R38_RØMØ_ØST.checked) {
        drawMap('\n         EK R38 RÃ\u0098MÃ\u0098 Ã\u0098ST\n      ', '\n         SkydeomrÃ¥der\n      ', 57);
    } else {
        removeShape(57);
    }
}

function validate58() {
    var Temp_Falcon_Live_Aim_Area = document.getElementById('Temp - Falcon Live Aim Area');
    if (Temp_Falcon_Live_Aim_Area.checked) {
        drawMap('\n         Temp - Falcon Live Aim Area\n      ', '\n         SkydeomrÃ¥der\n      ', 58);
    } else {
        removeShape(58);
    }
}

function validate59() {
    var UAS_VARDE = document.getElementById('UAS VARDE');
    if (UAS_VARDE.checked) {
        drawMap('\n         UAS VARDE\n      ', '\n         SkydeomrÃ¥der\n      ', 59);
    } else {
        removeShape(59);
    }
}

function validate60() {
    var LILLE_RØMØ_TEMP = document.getElementById('LILLE RØMØ - TEMP');
    if (LILLE_RØMØ_TEMP.checked) {
        drawMap('\n         LILLE RÃ\u0098MÃ\u0098 - TEMP\n      ', '\n         SkydeomrÃ¥der\n      ', 60);
    } else {
        removeShape(60);
    }
}

function validate61() {
    var EK_R34_BORDRUP = document.getElementById('EK R34 BORDRUP');
    if (EK_R34_BORDRUP.checked) {
        drawMap('\n         EK R34 BORDRUP\n      ', '\n         SkydeomrÃ¥der\n      ', 61);
    } else {
        removeShape(61);
    }
}

function validate62() {
    var Temp_Nymindegab_vest = document.getElementById('Temp - Nymindegab vest');
    if (Temp_Nymindegab_vest.checked) {
        drawMap('\n         Temp - Nymindegab vest\n      ', '\n         SkydeomrÃ¥der\n      ', 62);
    } else {
        removeShape(62);
    }
}

function validate63() {
    var Corridor_Fanoe = document.getElementById('Corridor Fanoe');
    if (Corridor_Fanoe.checked) {
        drawMap('\n         Corridor Fanoe\n      ', '\n         SkydeomrÃ¥der\n      ', 63);
    } else {
        removeShape(63);
    }
}

function validate64() {
    var Temp_REX_Live_Aim = document.getElementById('Temp - REX Live Aim');
    if (Temp_REX_Live_Aim.checked) {
        drawMap('\n         Temp - REX Live Aim\n      ', '\n         SkydeomrÃ¥der\n      ', 64);
    } else {
        removeShape(64);
    }
}

function validate65() {
    var EK_R32_OKSBY = document.getElementById('EK R32 OKSBY');
    if (EK_R32_OKSBY.checked) {
        drawMap('\n         EK R32 OKSBY\n      ', '\n         SkydeomrÃ¥der\n      ', 65);
    } else {
        removeShape(65);
    }
}

function validate66() {
    var EK_D379_NYMINDEGAB_ØST = document.getElementById('EK D379 NYMINDEGAB ØST');
    if (EK_D379_NYMINDEGAB_ØST.checked) {
        drawMap('\n         EK D379 NYMINDEGAB Ã\u0098ST\n      ', '\n         SkydeomrÃ¥der\n      ', 66);
    } else {
        removeShape(66);
    }
}

function validate67() {
    var Temp_drone = document.getElementById('Temp - drone');
    if (Temp_drone.checked) {
        drawMap('\n         Temp - drone\n      ', '\n         SkydeomrÃ¥der\n      ', 67);
    } else {
        removeShape(67);
    }
}

function validate68() {
    var EK_R35_HENNE = document.getElementById('EK R35 HENNE');
    if (EK_R35_HENNE.checked) {
        drawMap('\n         EK R35 HENNE\n      ', '\n         SkydeomrÃ¥der\n      ', 68);
    } else {
        removeShape(68);
    }
}

function validate70() {
    var STCAexclude = document.getElementById('STCAexclude');
    if (STCAexclude.checked) {
        drawMap('\n         STCAexclude\n      ', '\n         STCA Areas\n      ', 70);
    } else {
        removeShape(70);
    }
}

function validate71() {
    var EKEB_EnRoute = document.getElementById('EKEB EnRoute');
    if (EKEB_EnRoute.checked) {
        drawMap('\n         EKEB EnRoute\n      ', '\n         STCA Areas\n      ', 71);
    } else {
        removeShape(71);
    }
}

function validate72() {
    var EKAH_EnRoute = document.getElementById('EKAH EnRoute');
    if (EKAH_EnRoute.checked) {
        drawMap('\n         EKAH EnRoute\n      ', '\n         STCA Areas\n      ', 72);
    } else {
        removeShape(72);
    }
}

function validate73() {
    var BOLHEDE_WEST = document.getElementById('BOLHEDE WEST');
    if (BOLHEDE_WEST.checked) {
        drawMap('\n         BOLHEDE WEST\n      ', '\n         SvÃ¦veflyve omrÃ¥der\n      ', 73);
    } else {
        removeShape(73);
    }
}

function validate74() {
    var BOLHEDE = document.getElementById('BOLHEDE');
    if (BOLHEDE.checked) {
        drawMap('\n         BOLHEDE\n      ', '\n         SvÃ¦veflyve omrÃ¥der\n      ', 74);
    } else {
        removeShape(74);
    }
}

function validate75() {
    var VORBASSE = document.getElementById('VORBASSE');
    if (VORBASSE.checked) {
        drawMap('\n         VORBASSE\n      ', '\n         SvÃ¦veflyve omrÃ¥der\n      ', 75);
    } else {
        removeShape(75);
    }
}

function validate76() {
    var GESTEN = document.getElementById('GESTEN');
    if (GESTEN.checked) {
        drawMap('\n         GESTEN\n      ', '\n         SvÃ¦veflyve omrÃ¥der\n      ', 76);
    } else {
        removeShape(76);
    }
}

function validate77() {
    var Horns_Rev_A = document.getElementById('Horns Rev A');
    if (Horns_Rev_A.checked) {
        drawMap('\n         Horns Rev A\n      ', '\n         VindmÃ¸lleparker\n      ', 77);
    } else {
        removeShape(77);
    }
}

function validate78() {
    var Horns_Rev_B = document.getElementById('Horns Rev B');
    if (Horns_Rev_B.checked) {
        drawMap('\n         Horns Rev B\n     ', '\n         VindmÃ¸lleparker\n      ', 78);
    } else {
        removeShape(78);
    }
}

function validate79() {
    var EHHG_H7 = document.getElementById('EHHG H7');
    if (EHHG_H7.checked) {
        drawMap('\n         EHHG H7\n      ', '\n         VindmÃ¸lleparker\n      ', 79);
    } else {
        removeShape(79);
    }
}

function validate80() {
    var Dantysk = document.getElementById('Dantysk');
    if (Dantysk.checked) {
        drawMap('\n         Dantysk\n      ', '\n         Vindmølleparker\n      ', 80);
    } else {
        removeShape(80);
    }
}

function drawMap(mapName, groupName, id) {
    var uri = 'api/webatm/ReadMapElements';
    //Make AJAX call that returns the list of maps
    var mapElement;
    $.getJSON(uri)
          .done(function (data) {
              for (var i = 0; i < data.length; i++) {
                  //Find the map in the list.
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
                               addPolygon(color, pathCoordinates, id);
                           } else if (mapElement.shapes[j].type.localeCompare('Polyline') == 0) {
                               var color = mapElement.shapes[j].Color;
                               var pathCoordinates = [];
                               for (var m = 0; m < mapElement.shapes[j].coordinates.length; m++) {
                                   var coord = { lat: mapElement.shapes[j].coordinates[m].Latitude, lng: mapElement.shapes[j].coordinates[m].Longitude };
                                   pathCoordinates.push(coord);
                               }
                               addPolyline(color, pathCoordinates, id);
                           } else if (mapElement.shapes[j].type.localeCompare('Circle') == 0) {
                               var color = mapElement.shapes[j].Color;
                               var center = { lat: mapElement.shapes[j].centerCoordinates.Latitude, lng: mapElement.shapes[j].centerCoordinates.Longitude };
                               var r = mapElement.shapes[j].Radius;
                               addCircle(color, center, r, id);
                           }
                       }
                   }
               }
           });
}

function addCircle(color, center, r, id) {
    // Add the circle to the map.
    var circle = new google.maps.Circle({
        strokeColor: color,
        map: map,
        center: center,
        radius: r,
        fillOpacity: 0.0
    });
    circle.metadata = {
        id: id
    };
    shapes.push(circle);
}

function addPolygon(color, pathCoordinates, id) {
    // Add the polygon to the map.
    var polygon = new google.maps.Polygon({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: color,
        map: map,
        fillOpacity: 0.0
    });
    polygon.metadata = {
        id: id
    };
    shapes.push(polygon)
}

function addPolyline(color, pathCoordinates, id) {
    // Add the polyline to the map.
    var polyline = new google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: color,
        map: map,
        fillOpacity: 0.0
    });
    polyline.metadata = {
        id: id
    };
    shapes.push(polyline)
}

function removeShape(id) {
    // Remove the shape from the map.
    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i].metadata.id == id) {
            shapes[i].setMap(null);
        }
    }
}