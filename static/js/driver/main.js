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
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.latitude && data.longitude) {
                            var lat = parseFloat(data.latitude);
                            var lng = parseFloat(data.longitude);
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
                                            }
                                        });
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

sendLocation();
setInterval(sendLocation, 5000);