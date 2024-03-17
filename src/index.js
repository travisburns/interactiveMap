class FantasyMap {
    constructor() {
        this.map = null;
        this.locations = [];
        this.markers = [];
        this.bridgeMarkerVisible = true;

        this.initializeMap();
        this.fetchLocationsData();
        this.createDonutChart();

        
        this.createClassesChart();
        // this.createFaction();  - wanted to implement a third graph displaying the factions, but could not impliment with given time
        const bridgeImage = document.getElementById('bridge-image');
        bridgeImage.addEventListener('click', () => this.toggleMarkerVisibility('bridge'));

    }

    initializeMap() {
        if (!this.map) {
            const initialZoom = 10.9;

            this.map = L.map('map', {
                renderer: L.canvas(),
                minZoom: initialZoom,
                maxZoom: 18,
            }).setView([0, 0], initialZoom);

            const imageUrl = './assets/siruksvalleymap.png';

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
        }
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
            this.addBridgeIconToLocationsTab(); // Add bridge icon to locations tab
        } catch (error) {
            console.error('Error fetching locations data:', error);
        }
    }

    addMarkers() {
        this.locations.forEach((location, index) => {
            const { XCoord, YCoord, Name, type, image } = location;
            console.log('Marker index:', index);
            const marker = L.marker([YCoord, XCoord], {
                icon: this.customIcon(type)
            }).addTo(this.map)
                .on('click', () => this.onMarkerClick(location, index))
                

            marker._leaflet_id = index;
            this.markers.push(marker);
        });
    }

   

    onMarkerClick(location, index) {
        const { Name, type, image, stats, description, species, classes, faction } = location;
        const detailsTab = document.getElementById('details-tab');
        console.log('Classes:', classes);
        detailsTab.innerHTML = `
            <h2 style="background-color:#00000080; margin-bottom: 1px">${Name}</h2>
            <img src="${image}" alt="${Name}">
            <p style="background-color:#00000080; border-radius: 5px;">Description: ${description}</p>
            <div class="columns">
                <div class="details-column">
                    <p style="background-color:#00000080; border-radius: 5px;">Type: ${type}</p>
                    <p style="background-color:#00000080; border-radius: 5px;">Population: ${stats.population}</p>
                    <p style="background-color:#00000080; border-radius: 5px;">military: ${stats.military}</p>
                </div>
                <div class="details-column">
                    <p style="background-color:#00000080; border-radius: 5px;">Magic: ${stats.magic}</p>
                    <p style="background-color:#00000080; border-radius: 5px;">Wealth: ${stats.money}</p>
                    <p style="background-color:#00000080; border-radius: 5px;">Resource: ${stats.resource}</p>
                </div>
                <div class="details-column">
                    <p style="background-color:#00000080; border-radius: 5px;">Govern: ${stats.governance}</p>
                    <p style="background-color:#00000080; border-radius: 5px;">Tech: ${stats.tech}</p>
                    <p style="background-color:#00000080; border-radius: 5px;">Peace: ${stats.peaceLevel}</p>
                </div>
            </div>
            <h2>Statistics</h2>
            <div class="donut-settings">  <canvas id="donut-chart-${index}"> </canvas></div>
            <div id="classes-tab" class="classes-settings"> <canvas id="classes-chart-${index}"></canvas></div>
            
        `;

        if (species) {
            setTimeout(() => {
                this.createDonutChart(species, index);
            }, 100);
        }
    
        if (classes) {
            this.createClassesChart(classes, index);
        }

        // if (faction) {
        //     this.createFaction(faction, index);
        // }
    

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

            case 'swamp':
                iconUrl = 'assets/swamp-icon.png';
                break;

            default:
                iconUrl = 'assets/ruins-icon.png';
                break;
        }

        return L.icon({
            iconUrl,
            iconSize,
            iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
            popupAnchor: [0, -iconSize[1] / 2],
            type: type
            
        });
    }



    



    createDonutChart(species, index,) {
        const canvasId = `donut-chart-${index}`;
        const canvas = document.getElementById(canvasId);

        if (!canvas) {
            console.error(`Canvas not found for ID: ${canvasId}`);
            return;
        }

        const ctx = canvas.getContext('2d');

        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded or initialized.');
            return;
        }

        if (!species || Object.keys(species).length === 0) {
            console.error('Species data is empty or undefined.');
            return;
        }

        Chart.defaults.global.animation = false;

        const speciesNames = Object.keys(species);
        const speciesValues = Object.values(species);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: speciesNames,
                datasets: [{
                    data: speciesValues,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 50,
                title: {
                    display: true,
                    text: 'Species Demographs',
                    fontColor: 'white'
                },
                tooltips: {
                    enabled: true,
                    callbacks: {
                        label: (tooltipItem, data) => {
                            const dataset = data.datasets[tooltipItem.datasetIndex];
                            const total = dataset.data.reduce((previousValue, currentValue) => previousValue + currentValue);
                            const currentValue = dataset.data[tooltipItem.index];
                            const percentage = Math.floor(((currentValue / total) * 100) + 0.5);
                            return `${data.labels[tooltipItem.index]}: ${percentage}%`;
                        }
                    }
                },
                legend: {
                    labels: {
                        fontColor: 'white'
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                    }
                }
            }
        });
    }

    createClassesChart(classes, index) {
        const canvasId = `classes-chart-${index}`;
        const canvas = document.getElementById(canvasId);
        console.log(canvasId)
        console.log(index)
        console.log('Classes:', classes);
        if (!canvas) {
            console.error(`Canvas not found for ID: ${canvasId}`);
            return;
        }
    
        const ctx = canvas.getContext('2d');
    
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded or initialized.');
            return;
        }
    
        if (!classes || Object.keys(classes).length === 0) {
            console.error('Classes data is empty or undefined.');
            return;
        }
    
        Chart.defaults.global.animation = false;
    
        const classNames = Object.keys(classes);
        const classValues = Object.values(classes);
        console.log('Classes:', classes);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: classNames,
                datasets: [{
                    data: classValues,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 50,
                title: {
                    display: true,
                    text: 'Classes Demographs',
                    fontColor: 'white'
                },
                tooltips: {
                    enabled: true,
                    callbacks: {
                        label: (tooltipItem, data) => {
                            const dataset = data.datasets[tooltipItem.datasetIndex];
                            const total = dataset.data.reduce((previousValue, currentValue) => previousValue + currentValue);
                            const currentValue = dataset.data[tooltipItem.index];
                            const percentage = Math.floor(((currentValue / total) * 100) + 0.5);
                            return `${data.labels[tooltipItem.index]}: ${percentage}%`;
                        }
                    }
                },
                legend: {
                    labels: {
                        fontColor: 'white'
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                    }
                }
            }
        });
    }


    // // Inside createFactionControlChart method

    // createFaction(faction, index) {
        
    //     const areaLabels = Object.keys(faction);
    //     const factionData = Object.values(faction);
    
    //     const canvasId = `faction-chart-${index}`;
    //     const canvas = document.getElementById(canvasId);
    //     console.log(`this is canvasID: ${canvasId}`)
    //     console.log(`this is faction: ${faction}`)
    //     console.log(`this is index: ${index}`)
    //     if (!canvas) {
    //         console.error(`Canvas not found for ID: ${canvasId}`);
    //         return;
    //     }
    
    //     const ctx = canvas.getContext('2d');
    
    //     new Chart(ctx, {
    //         type: 'line',
    //         data: {
    //             labels: areaLabels,
    //             datasets: factionData.map((faction, i) => ({
    //                 label: `Faction ${i + 1}`,
    //                 data: faction,
    //                 fill: false,
    //                 borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
    //                 borderWidth: 1
    //             }))
    //         },
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             scales: {
    //                 yAxes: [{ ticks: { beginAtZero: true } }]
    //             }
    //         }
    //     });
    // }

    


    addBridgeIconToLocationsTab() {
        const locationsTab = document.getElementById('locations-tab');
        locationsTab.innerHTML=`Locations`
        // Get unique location types
        const uniqueTypes = [...new Set(this.locations.map(location => location.type))];
    
        // Create buttons for each unique location type
        uniqueTypes.forEach(type => {
            const button = document.createElement('button');
            button.textContent = type;
            button.classList.add('location-button');
            button.addEventListener('click', () => this.toggleLocationVisibility(type));
            locationsTab.appendChild(button);
        });
    }

    toggleLocationVisibility(type) {
        this.markers.forEach(marker => {
            if (marker.options && marker.options.icon && marker.options.icon.options) {
                const locationType = marker.options.icon.options.type;
                if (locationType === type) {
                    if (this.map.hasLayer(marker)) {
                        this.map.removeLayer(marker);
                    } else {
                        this.map.addLayer(marker);
                    }
                } else {
                    if (!this.map.hasLayer(marker)) {
                        this.map.addLayer(marker);
                    }
                }
                
            } else {
                console.error('Marker icon options are undefined or do not exist.');
            }
        });
    }
}
const fantasyMap = new FantasyMap();