
class FantasyMap {
    constructor() {
        const initialZoom = 10.9;

        this.map = L.map('map', {
            renderer: L.canvas(),
            minZoom: initialZoom,
            maxZoom: 18,
        }).setView([0, 0], initialZoom);

        const imageUrl = 'assets/siruksvalleymap.png';

        const bounds = [
            [-1, -1],
            [1, 1]
        ];

        L.imageOverlay(imageUrl, bounds).addTo(this.map);

        this.map.setMaxBounds(bounds);
        this.map.options.maxBoundsViscosity = 1.0;

        this.map.on('zoomend', () => {
            const currentZoom = this.map.getZoom();
            if (currentZoom < initialZoom) {
                this.map.setZoom(initialZoom);
            }
        });

        this.map.on('click', (e) => {
            console.log('Current Coordinates:', e.latlng);
        });

        this.fetchLocationsData();
    }

    async fetchLocationsData() {
        try {
            const response = await fetch('http://localhost:3000/locations');
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            this.locations = data || [];
            console.log('Locations Data:', this.locations);

            this.addMarkers();
        } catch (error) {
            console.error('Error fetching locations data:', error);
        }
    }

    addMarkers() {
        this.locations.forEach((location, index) => {
            const { XCoord, YCoord, Name, Type, image } = location;

            const marker = L.marker([YCoord, XCoord], {
                icon: this.customIcon(Type)
            }).addTo(this.map)
            .on('click', () => this.onMarkerClick(location, index))
            .bindPopup(`${Name} - ${Type}`);

            marker._leaflet_id = index;
        });
    }

    onMarkerClick(location, index) {
        const { Name, Type, image, stats } = location;

        const detailsTab = document.getElementById('details-tab');
        detailsTab.innerHTML = `
            <img src="${image}" alt="${Name}">
            <h2>${Name}</h2>
            <p>Type: ${Type}</p>
            <p>Population: ${stats.population}</p>
            <p>magic: ${stats.magic}</p>
            
        `;

        detailsTab.style.display = 'flex';
    }

    customIcon(type) {
        let iconUrl;
        let iconSize = [64, 64];

        switch (type) {
            case 'city':
                iconUrl = 'assets/city-icon.png';
                break;
            case 'bridge':
                iconUrl = 'assets/bridge-icon.png';
                break;
            
            case 'forest':
                iconUrl = 'assets/forest-icon.png';
                break;

            case 'ruins':
                iconUrl = 'assets/ruins-icon.png';
                break;

                case 'mine':
                iconUrl = 'assets/mine-icon.png';
                break;

            case 'sacredsite':
                iconUrl = 'assets/sacredsite-icon.png';
                break;

            case 'ancientBattle':
                iconUrl = 'assets/ancientBattle-icon.png';
                break;

            default:
                iconUrl = 'assets/ruins-icon.png';
                break;
        }

        return L.icon({
            iconUrl,
            iconSize,
            iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
            popupAnchor: [0, -iconSize[1] / 2]
        });
    }
}

const fantasyMap = new FantasyMap();

const locationsTab = document.getElementById('locations-tab');
const detailsTab = document.getElementById('details-tab');

locationsTab.addEventListener('click', () => {
    detailsTab.style.display = 'none';
});
