let map, heatmap, locations

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 43.81402971753634, lng: -79.51167295124651 },
        zoom: 14,
        mapTypeId: 'hybrid',
        disableDefaultUI: true,
        fullscreenControl: true,
        zoomControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        styles: [
            {
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "road",
                stylers: [{ visibility: "off" }]
            }
        ]
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        maxIntensity: document.getElementById('intensitySlider').value,
        radius: document.getElementById('radiusSlider').value
    });
    heatmap.setMap(map);
}

function getLocationsFromTxt(text) {
    const lines = text.split("\n");
    const locations = [];

    lines.forEach(line => {
        const items = line.split(',');

        if (items.length >= 4 && items[2] === 'LOCATION') {
            const latLongItem = items[3].split(' ');
            const latitude = parseFloat(latLongItem[0].split(':')[1]);
            const longitude = parseFloat(latLongItem[1].split(':')[1]);

            if (!isNaN(latitude) && !isNaN(longitude)) {
                const latLng = new google.maps.LatLng(latitude, longitude);
                locations.push(latLng);
            }
        }
    });

    return locations;
}

function updateHeatMap(files) {
    const promises = [];
    const allLocations = [];

    for (let i = 0; i < files.length; i++) {
        promises.push(readFileAsText(files[i]));
    }

    Promise.all(promises)
        .then(fileContentsArray => {
            fileContentsArray.forEach(fileContents => {
                allLocations.push(...getLocationsFromTxt(fileContents));
            });

            heatmap.setData(allLocations);
            heatmap.setOptions({
                maxIntensity: document.getElementById('intensitySlider').value,
                radius: document.getElementById('radiusSlider').value
            });

            document.getElementById('locationsCount').textContent = allLocations.length.toLocaleString();
        })
        .catch(error => {
            console.error('Error reading files:', error);
        });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', function (event) {
            const fileContents = event.target.result;
            resolve(fileContents);
        });

        reader.addEventListener('error', function (event) {
            reject(event.error);
        });

        reader.readAsText(file);
    });
}

function updateMapStyles() {
    const showLabelsCheckbox = document.getElementById('showLabelsCheckbox');
    const showRoadsCheckbox = document.getElementById('showRoadsCheckbox');

    map.setOptions({
        styles: [
            {
                elementType: "labels",
                stylers: [{ visibility: showLabelsCheckbox.checked ? "on" : "off" }]
            },
            {
                featureType: "road",
                stylers: [{ visibility: showRoadsCheckbox.checked ? "on" : "off" }]
            }
        ]
    });
}


document.addEventListener('DOMContentLoaded', function () {
    const mapViewToggleButton = document.getElementById('mapViewButton');
    const satelliteViewToggleButton = document.getElementById('satelliteViewButton');
    const showLabelsCheckbox = document.getElementById('showLabelsCheckbox');
    const showRoadsCheckbox = document.getElementById('showRoadsCheckbox');
    const intensitySlider = document.getElementById('intensitySlider');
    const intensityLabel = document.getElementById('intensityLabel');
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusLabel = document.getElementById('radiusLabel');
    const resetButton = document.getElementById('resetButton');
    const fileInput = document.getElementById('fileInput');

    mapViewToggleButton.addEventListener('click', function () {
        mapViewToggleButton.classList.add('active');
        satelliteViewToggleButton.classList.remove('active');
        map.setMapTypeId('roadmap');
    });

    satelliteViewToggleButton.addEventListener('click', function () {
        satelliteViewToggleButton.classList.add('active');
        mapViewToggleButton.classList.remove('active');
        map.setMapTypeId('hybrid');
    });

    showLabelsCheckbox.addEventListener('change', function () {
        updateMapStyles();
    });

    showRoadsCheckbox.addEventListener('change', function () {
        updateMapStyles();
    });

    intensitySlider.addEventListener('input', function () {
        const maxIntensity = parseInt(intensitySlider.value);
        intensityLabel.textContent = maxIntensity == 0? "x" : maxIntensity;
        heatmap.set("maxIntensity", maxIntensity == 0? null : maxIntensity);
    });

    radiusSlider.addEventListener('input', function () {
        const radius = parseInt(radiusSlider.value);
        radiusLabel.textContent = radius;
        heatmap.set("radius", radius);
    });

    resetButton.addEventListener('click', function () {
        intensitySlider.value = 10;
        intensitySlider.dispatchEvent(new Event('input'));

        radiusSlider.value = 10;
        radiusSlider.dispatchEvent(new Event('input'));
    });

    fileInput.addEventListener('change', function (event) {
        const files = event.target.files;
        updateHeatMap(files);
    });
});

window.initMap = initMap;