const geocodingAPI = 'https://geocode.maps.co/search';

async function geocodeAddress(address) {
    try {
        const response = await fetch(`${geocodingAPI}?q=${address}&api_key=65cd0da16af11338143595wgc071406`);
        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            if (!isNaN(lat) && !isNaN(lon)) {
                return new google.maps.LatLng(lat, lon);
            } else {
                throw new Error(`Geocoding error for ${address}: Invalid coordinates`);
            }
        } else {
            throw new Error(`Geocoding error for ${address}: No results`);
        }
    } catch (error) {
        console.error(error.message);
    }
}

async function calculateAndDrawRoute(map, locations) {
    const routeList = document.getElementById('routeList');
    const visited = new Set();

    let currentLocation = locations[0];

    for (let i = 0; i < locations.length - 1; i++) {
        visited.add(currentLocation);

        const nearestLocation = await findNearestUnvisited(currentLocation, locations, visited);

        if (nearestLocation) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const startLatLng = await geocodeAddress(currentLocation);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const endLatLng = await geocodeAddress(nearestLocation);

            if (startLatLng && endLatLng) {
                drawRoute(map, startLatLng, endLatLng);

                // Update the route list
                const listItem = document.createElement('li');
                listItem.textContent = `${currentLocation} --> ${nearestLocation}`;
                routeList.appendChild(listItem);

                currentLocation = nearestLocation;
            }
        }
    }
}


async function findNearestUnvisited(currentLocation, locations, visited) {
    let nearestLocation;
    let nearestDistance = Infinity;

    for (const location of locations) {
        if (!visited.has(location) && location !== currentLocation) {
            const distance = await getDistance(currentLocation, location);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestLocation = location;
            }
        }
    }

    return nearestLocation;
}

async function getDistance(location1, location2) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const startLatLng = await geocodeAddress(location1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const endLatLng = await geocodeAddress(location2);

    if (startLatLng && endLatLng) {
        return google.maps.geometry.spherical.computeDistanceBetween(startLatLng, endLatLng);
    } else {
        return Infinity;
    }
}


async function drawRoute(map, startLatLng, endLatLng) {
    const line = new google.maps.Polyline({
        path: [startLatLng, endLatLng],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    line.setMap(map);

    // Calculate bearing between two points
    const bearing = google.maps.geometry.spherical.computeHeading(startLatLng, endLatLng);

    // Add arrow marker at the midpoint
    const midpoint = google.maps.geometry.spherical.interpolate(startLatLng, endLatLng, 0.5);
    new google.maps.Marker({
        position: midpoint,
        map,
        icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            rotation: bearing,
            scale: 4,  // Adjust the scale as needed
            fillColor: '#00F',  // Arrow color
            fillOpacity: 1,
            strokeWeight: 0
        }
    });
}

async function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 2
    });

    const urlParams = new URLSearchParams(window.location.search);
    const addresses = JSON.parse(decodeURIComponent(urlParams.get('addresses') || '[]'));
    const technicianLocation = decodeURIComponent(urlParams.get('technicianLocation') || '');

    for (const address of addresses) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const location = await geocodeAddress(address);
        if (location) {
            new google.maps.Marker({
                position: location,
                map
            });
        }
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    const technicianLocationLatLng = await geocodeAddress(technicianLocation);
    if (technicianLocationLatLng) {
        new google.maps.Marker({
            position: technicianLocationLatLng,
            map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
    }

    const locations = [technicianLocation].concat(addresses);
    calculateAndDrawRoute(map, locations);
}

window.addEventListener('load', initMap);