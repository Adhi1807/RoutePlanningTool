const geocodingAPI = 'https://geocode.maps.co/search';
const addresses = [];
let technicianLocation;

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

async function addAddress() {
    const addressInput = document.getElementById("addressInput");
    const addressList = document.getElementById("addressList");

    const address = addressInput.value.trim();

    if (address !== "") {
        addresses.push(address);

        const listItem = document.createElement("li");
        listItem.textContent = address;
        addressList.appendChild(listItem);

        // Clear the input field
        addressInput.value = "";
    }
}

function addTechnicianLocation() {
    const technicianLocationInput = document.getElementById("technicianLocationInput");

    technicianLocation = technicianLocationInput.value.trim();

    if (technicianLocation !== "") {
        const technicianMessage = document.getElementById("technicianMessage");
        technicianMessage.textContent = `Technician's location: ${technicianLocation}`;

        // Clear the input field
        technicianLocationInput.value = "";
    }
}

function redirectToMap() {
    // Check if both technicianLocation and at least one address is entered
    if (technicianLocation && addresses.length > 0) {
        const encodedAddresses = encodeURIComponent(JSON.stringify(addresses));
        const encodedTechnicianLocation = encodeURIComponent(technicianLocation);
        const redirectURL = `map.html?addresses=${encodedAddresses}&technicianLocation=${encodedTechnicianLocation}`;
        window.location.href = redirectURL;
    } else {
        // Display an alert if the condition is not met
        alert("Technician's location along with at least one address must be entered");
    }
}
