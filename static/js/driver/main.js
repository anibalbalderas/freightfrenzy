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

btn.addEventListener('click', () => {
    // mostrar formulario para agregar conductor //
    document.getElementById('driversForm').style.display = 'block';
    document.getElementById('listDrivers').style.display = 'none';
    document.getElementById('listDrivers2').style.display = 'none';
});

btn2.addEventListener('click', () => {
    // ocultar formulario para agregar conductor //
    document.getElementById('listDrivers').style.display = 'block';
    document.getElementById('listDrivers2').style.display = 'block';
    document.getElementById('driversForm').style.display = 'none';
});

sendLocation();
setInterval(sendLocation, 5000);