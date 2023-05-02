const form = document.querySelector('.drivers');
const mapSelect = document.querySelector('.mapselect');
const mapButton = document.querySelector('.mapbutton');
const driverSelect = document.querySelector('#driver');
const driver = document.querySelector('#driver');

// ver si hay un listener para el select de drivers //
if (driver) {
    driver.addEventListener('change', event => {
        if (driverSelect.value === '') {

        }
        else {
            mapButton.classList.remove('hidden');
        }
    })
}

if (form) {
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (driverSelect.value === '') {

        } else {
            mapButton.addEventListener('click', event => {
                mapSelect.classList.add('hidden');
                var driverId = driverSelect.value;
                var driverName = driverSelect.options[driverSelect.selectedIndex].text;
                var url = '/driver/location/' + driverId;
                var polyline = new google.maps.Polyline({
                            path: [],
                            strokeColor: '#0000FF',
                            strokeOpacity: 0.8,
                            strokeWeight: 3,
                            map: map
                        });
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        var lat = parseFloat(data.latitude);
                        var lng = parseFloat(data.longitude);
                        addPointToPolyline(lat, lng);
                        if (data.latitude && data.longitude) {
                            var map = new google.maps.Map(document.getElementById('map'), {
                                zoom: 8,
                                center: {lat: lat, lng: lng}
                            });
                            var marker = new google.maps.Marker({
                                position: {lat: lat, lng: lng},
                                map: map,
                                icon: {
                                    url: "/static/img/truck-icon.png",
                                    scaledSize: new google.maps.Size(50, 50)
                                },
                                title: driverName
                            });
                        }
                            fetch('/driver/starts/' + driverId)
                                .then(response => response.json())
                                .then(data => {
                                    if (data.latitude && data.longitude) {
                                        var startLat = parseFloat(data.latitude);
                                        var startLng = parseFloat(data.longitude);
                                        var marker = new google.maps.Marker({
                                            position: {lat: startLat, lng: startLng},
                                            map: map,
                                            icon: {
                                                url: "/static/img/start-icon.png",
                                                scaledSize: new google.maps.Size(50, 50)
                                            },
                                            title: "Start"
                                        });
                                    }
                                    fetch('/driver/destination/' + driverId)
                                        .then(response => response.json())
                                        .then(data => {
                                            if (data.latitude && data.longitude) {
                                                var destLat = parseFloat(data.latitude);
                                                var destLng = parseFloat(data.longitude);
                                                var marker = new google.maps.Marker({
                                                    position: {lat: destLat, lng: destLng},
                                                    map: map,
                                                    icon: {
                                                        url: "/static/img/destination-icon.png",
                                                        scaledSize: new google.maps.Size(50, 50)
                                                    },
                                                    title: "Destination"
                                                });
                                                var bounds = new google.maps.LatLngBounds();
                                                bounds.extend({lat: lat, lng: lng});
                                                bounds.extend({lat: destLat, lng: destLng});
                                                map.fitBounds(bounds);
                                                // trazar ruta de start a destination //
                                                var directionsService = new google.maps.DirectionsService();
                                                var request = {
                                                    origin: {lat: startLat, lng: startLng},
                                                    destination: {lat: destLat, lng: destLng},
                                                    travelMode: 'DRIVING'
                                                };
                                                directionsService.route(request, function (result, status) {
                                                    if (status === 'OK') {
                                                        var directionsDisplay = new google.maps.DirectionsRenderer({
                                                            map: map,
                                                            directions: result,
                                                            suppressMarkers: true,
                                                            polilyneOptions: {
                                                                strokeColor: '#FF0000',
                                                                strokeOpacity: 0.8,
                                                                strokeWeight: 3
                                                            }
                                                        });
                                                    }
                                                });
                                                // trazar resto de ruta desde el punto actual a destination //
                                                var directionsService2 = new google.maps.DirectionsService();
                                                var request2 = {
                                                    origin: {lat: lat, lng: lng},
                                                    destination: {lat: destLat, lng: destLng},
                                                    travelMode: 'DRIVING'
                                                };
                                                directionsService2.route(request2, function (result, status) {
                                                    if (status === 'OK') {
                                                        var directionsDisplay = new google.maps.DirectionsRenderer({
                                                            map: map,
                                                            directions: result,
                                                            suppressMarkers: true,
                                                            polilyneOptions: {
                                                                strokeColor: '#00FF00',
                                                                strokeOpacity: 0.8,
                                                                strokeWeight: 3
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                });
                        function addPointToPolyline(lat, lng) {
                            var path = polyline.getPath();
                            path.push(new google.maps.LatLng(lat, lng));
                        }
                        var prevLat = null;
                        var prevLng = null;

                        function getDistance(lat1, lng1, lat2, lng2) {
                            var R = 6371; // Radius of the earth in km
                            var dLat = deg2rad(lat2-lat1);  // deg2rad below
                            var dLon = deg2rad(lng2-lng1);
                            var a =
                                Math.sin(dLat/2) * Math.sin(dLat/2) +
                                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                                Math.sin(dLon/2) * Math.sin(dLon/2)
                                ;
                            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                            var d = R * c; // Distance in km
                            return d;
                        }

                        fetch('/driver/destination/' + driverId)
                            .then(response => response.json())
                            .then(data => {
                                if(data.latitude && data.longitude) {
                                var destLat = parseFloat(data.latitude);
                                var destLng = parseFloat(data.longitude);
                                // mostrar distancia, velocidad y tiempo restante de llegada al dar click en el automovil //
                                marker.addListener('click', function () {
                                    var directionsService = new google.maps.DirectionsService();
                                    var request = {
                                        origin: {lat: lat, lng: lng},
                                        destination: {lat: destLat, lng: destLng},
                                        travelMode: 'DRIVING'
                                    };
                                    directionsService.route(request, function (result, status) {
                                        if (status === 'OK') {
                                            var distance = result.routes[0].legs[0].distance.text;
                                            var currentLat = lat;
                                            var currentLng = lng;
                                            var curreentDistance = 0;
                                            if (prevLat && prevLng) {
                                                curreentDistance = getDistance(prevLat, prevLng, currentLat, currentLng);
                                            }
                                            var currentTime = 30;
                                            var currentSpeed = (curreentDistance / currentTime).toFixed(2);
                                            var remainingDistance = distance - curreentDistance;
                                            var remainingTime = (remainingDistance / currentSpeed).toFixed(2);
                                            var contentString =
                                                '<div id="content">' +
                                                '<div id="siteNotice">' +
                                                '</div>' +
                                                '<h2 id="firstHeading" class="h2Map">Información del automóvil</h2>' +
                                                '<div id="bodyContentMap" class="bodyContentMap">' +
                                                '<p><span class="spanMap">Conductor:</span> ' + driverName + '</p>' +
                                                '<p><span class="spanMap">Distancia recorrida:</span> ' + (curreentDistance / 1000).toFixed(2) + ' km</p>' +
                                                '<p><span class="spanMap">Distancia Restante:</span> ' + (distance / 1000).toFixed(2) + ' km</p>' +
                                                '<p><span class="spanMap">Velocidad:</span> ' + (currentSpeed * 3.6).toFixed(2) + ' km/h</p>' +
                                                '<p><span class="spanMap">Tiempo restante:</span> ' + (remainingTime / 60).toFixed(0) + ' min</p>' +
                                                '</div>' +
                                                '</div>';
                                            var infowindow = new google.maps.InfoWindow({
                                                content: contentString
                                            });
                                            infowindow.open(map, marker);
                                        }
                                    });
                                });
                                }
                            });
                    });
            });
        }
    });
}

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

function sendLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            socket.emit('location', {lat: lat, lng: lng});
        });
    }
        else {
            alert("Geolocation is not supported by this browser.")
        }
    }


const btn2 = document.querySelector('#listDriver');
const btn = document.querySelector('#addDriver');

if (btn2) {
    btn.addEventListener('click', () => {
        // mostrar formulario para agregar conductor //
        document.getElementById('driversForm').style.display = 'block';
        document.getElementById('listDrivers').style.display = 'none';
        document.getElementById('listDrivers2').style.display = 'none';
    });
}

if (btn2) {
    btn2.addEventListener('click', () => {
        // ocultar formulario para agregar conductor //
        document.getElementById('listDrivers').style.display = 'block';
        document.getElementById('listDrivers2').style.display = 'block';
        document.getElementById('driversForm').style.display = 'none';
    });
}

function initAutocomplete() {
    var from_input = document.getElementById('from');
    var to_input = document.getElementById('to');
    var options = {
        types: ['geocode'],
    }
    var autocomplete_from = new google.maps.places.Autocomplete(from_input, options);
    var autocomplete_to = new google.maps.places.Autocomplete(to_input, options);
}

var from_input = document.getElementById('from');
var to_input = document.getElementById('to');
var distance_input = document.getElementById('miles');

if(from_input && to_input) {
    to_input.addEventListener('change', calculateDistance);
}

function calculateDistance() {
  var from_address = document.getElementById('from').value;
  var to_address = document.getElementById('to').value;

  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins: [from_address],
    destinations: [to_address],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.IMPERIAL,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status === google.maps.DistanceMatrixStatus.OK) {
        distance_input.value = response.rows[0].elements[0].distance.text;
    }
  });
}

// calcular precio entre millas y mostrar en el input de permile //
var price_input = document.getElementById('price');
if(price_input) {
    price_input.addEventListener('change', calculatePrice);
}

function calculatePrice() {
  var price = parseFloat(document.getElementById('price').value);
  var distance = parseFloat(document.getElementById('miles').value.replace(/[^\d\.]/g, ''));
  document.getElementById('ppm').value = (price / distance).toFixed(2);
}

var weight_input = document.getElementById('weight');
if(weight_input) {
    weight_input.addEventListener('change', weightlbs);
}
function weightlbs() {
    var weightInput = document.getElementById('weight');
    var currentValue = parseFloat(weightInput.value.replace(/[^\d\.]/g, ''));
    weightInput.value = currentValue + " lbs";
}

var length_input = document.getElementById('Length');
if(length_input) {
    length_input.addEventListener('change', lengthft);
}

function lengthft() {
    var lengthInput = document.getElementById('Length');
    var currentValue = parseFloat(lengthInput.value.replace(/[^\d\.]/g, ''));
    lengthInput.value = currentValue + " ft";
}

var width_input = document.getElementById('Width');
if(width_input) {
    width_input.addEventListener('change', widthft);
}

function widthft() {
    var widthInput = document.getElementById('Width');
    var currentValue = parseFloat(widthInput.value.replace(/[^\d\.]/g, ''));
    widthInput.value = currentValue + " ft";
}

var height_input = document.getElementById('Height');
if(height_input) {
    height_input.addEventListener('change', heightft);
}

function heightft() {
    var heightInput = document.getElementById('Height');
    var currentValue = parseFloat(heightInput.value.replace(/[^\d\.]/g, ''));
    heightInput.value = currentValue + " ft";
    cubbed();
}

// calcular Length * Width * Height //

function cubbed() {
    var length = parseFloat(document.getElementById('Length').value.replace(/[^\d\.]/g, ''));
    var width = parseFloat(document.getElementById('Width').value.replace(/[^\d\.]/g, ''));
    var height = parseFloat(document.getElementById('Height').value.replace(/[^\d\.]/g, ''));
    document.getElementById('Cube').value = (length * width * height).toFixed(0) + " ft3";
}

// ver ubicacion de inicio y destino en el mapa de el boton de ver detalles //
var viewmap = document.querySelectorAll('.viewMap')
if(viewmap) {
    viewmap.forEach(function (element) {
        element.addEventListener('click', viewMap);
    });
}

function viewMap(event) {
    // no redireccionar //
    event.preventDefault();
    var loadId = event.target.getAttribute('id');
    var loadUrl = event.target.getAttribute('href');
    if (loadId) {
        fetch(loadUrl)
        .then(response => response.json())
        .then(data => {
            var from = data[0];
            var to = data[1];
            var date = data[2];
            date = date.replace("00:00:00 GMT", " ");
            var date2 = data[3];
            date2 = date2.replace("00:00:00 GMT", " ");
            var dateoff = data[4];
            dateoff = date.replace("00:00:00 GMT", " ");
            var dateoff2 = data[5];
            dateoff2 = date2.replace("00:00:00 GMT", " ");
            var length = data[6];
            var width = data[7];
            var height = data[8];
            var cube = data[9];
            var pieces = data[10];
            var pallets = data[11];
            var broker = data[12];
            var load = data[13];

            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 4,
                center: {lat: 39.8283, lng: -98.5795}
            });
            var directionsService = new google.maps.DirectionsService;
            var directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
            var request = {
                origin: from,
                destination: to,
                travelMode: 'DRIVING'
            }
            directionsService.route(request, function(result, status) {
                if(status === 'OK') {
                    // cambiar icono de inicio y destino //
                    var marker = new google.maps.Marker({
                        position: result.routes[0].legs[0].start_location,
                        map: map,
                        icon: {
                            url: "/static/img/start-icon.png",
                            scaledSize: new google.maps.Size(50, 50)
                        }
                    });
                    var marker = new google.maps.Marker({
                        position: result.routes[0].legs[0].end_location,
                        map: map,
                        icon: {
                            url: "/static/img/destination-icon.png",
                            scaledSize: new google.maps.Size(50, 50)
                        }
                    });
                    // quitar iconos predeterminados de google maps //
                    directionsRenderer.setOptions({
                        suppressMarkers: true,
                    });
                    directionsRenderer.setDirections(result);
                    var dateDiv = document.getElementById('date');
                    dateDiv.innerHTML = "<h3 style='font-size: 15px; margin-top: 20px'>Early Pick Up Date</h3><p style='font-size: 12px'>" + date + "</p>" + "<h3 style='font-size: 15px; margin-top: 20px'>Late Pick Up Date</h3><p style='font-size: 12px'>" + date2 + "</p>";
                    var dateDiv2 = document.getElementById('date2');
                    dateDiv2.innerHTML = "<h3 style='font-size: 15px; margin-top: 20px'>Early Drop Off Date</h3><p style='font-size: 12px'>" + dateoff + "</p>" + "<h3 style='font-size: 15px; margin-top: 20px'>Late Drop Off Date</h3><p style='font-size: 12px'>" + dateoff2 + "</p>";
                    var lengthDiv = document.getElementById('length');
                    lengthDiv.innerHTML = "<h3 style='font-size: 15px; margin-top: 20px'>Length</h3><p style='font-size: 12px'>" + length + "</p>";
                    var widthDiv = document.getElementById('width');
                    widthDiv.innerHTML = "<h3 style='font-size: 15px; margin-top: 20px'>Width</h3><p style='font-size: 12px'>" + width + "</p>";
                    var heightDiv = document.getElementById('height');
                    heightDiv.innerHTML = "<h3 style='font-size: 15px; margin-top: 20px'>Height</h3><p style='font-size: 12px'>" + height + "</p>";
                    var cubeDiv = document.getElementById('cube');
                    cubeDiv.innerHTML = "<h3 style='font-size: 15px; margin-top: 20px'>Cube</h3><p style='font-size: 12px'>" + cube + "</p>";
                    var piecesDiv = document.getElementById('pieces');
                    piecesDiv.innerHTML = "<h3 style='font-size: 15px; margin-top: 20px'>Pieces</h3><p style='font-size: 12px'>" + pieces + "</p>";
                    var palletsDiv = document.getElementById('pallets');
                    palletsDiv.innerHTML = "<h3 style='font-size: 15px; margin-top: 20px'>Pallets</h3><p style='font-size: 12px'>" + pallets + "</p>";
                    var brokerDiv = document.getElementById('broker');
                    brokerDiv.innerHTML = "<h3 style='font-size: 15px; margin-top: 20px'>Broker</h3><a href='/profile/" + broker + "' style='text-decoration: none'><p style='font-size: 12px; color: #0a8dd1'>" + broker + "</p></a>";
                    var loadDiv = document.getElementById('moredetails');
                    loadDiv.innerHTML = "<a href='/driver/loads/" + load + "/take' class='btn btn-primary' style='margin: 20px auto'>Take Load</a>";
                }
            });
        });
    }
}

var alert = document.getElementById('alerts');
if(alert) {
    // borrar alerta despues de 5 segundos //
    setTimeout(function() {
        alert.style.display = 'none';
    }, 3000);
}

initAutocomplete();
sendLocation();
setInterval(sendLocation, 5000);
