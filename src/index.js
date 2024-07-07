

/// class method FantasyMap that inclued all methods for the completion of the application
class FantasyMap {
    // relative constructor class
    constructor() {
        //this.map is in charge of setting up the basic map. 
        this.map = null;
        //this.locations is in charge of setting up the locations found in the map, found by connecting to the URL from the locations.JSON FILE
        this.locations = [];
        //this.markers is in charge of setting up the toggle Markers of the applications. 
        this.markers = [];
        //this is is charge of making sure that the markers are visible by defualt when the map starts. 
        this.bridgeMarkerVisible = true;
        //this activates the initializeMap method
        this.initializeMap();
        //this activates the fetchLocationsData that draws from the locations.json data.
        this.fetchLocationsData();
        //this is for creating the donutChart that will use chart.js to get the species data from the locations.json
        this.createDonutChart();
        //this is for creating the classes chart that will use chart.js to get the classes data from the locations.

        this.createClassesChart();
        // this.createFaction();  - wanted to implement a third graph displaying the factions, but could not impliment with given time
 }


    //initializeMap method is in charge of getting the base map information
    initializeMap() {
        //set up the map connection
        if (!this.map) {
            // set up its starting zoom level, taken from leaflet.js configuration
            const initialZoom = 10.9;
            //set up the map's canvas 
            this.map = L.map('map', {
                renderer: L.canvas(),
                //set its minzoom level to the exact same zoom level as its starting intialZoom
                minZoom: initialZoom,
                //set max zoom to 18
                maxZoom: 18,
            }).setView([0, 0], initialZoom);
            //connect the imageUrl to the map file as its background
            const imageUrl = './assets/siruksvalleymap.png';
            // set its bound's, so to avoid a terrible white screen outside the map size
            const bounds = [
                [-1, -1],
                [1, 1]
            ];
            //take the imageUrl and its defined bounds and add it to the this.map found above in a leaflet image overlay
            L.imageOverlay(imageUrl, bounds).addTo(this.map);
            //with the map set is maxbounds to the parameter of bounds defined above.
            this.map.setMaxBounds(bounds);
            //set its viscosity
            this.map.options.maxBoundsViscosity = 1.0;
            //set a additional zoom buttons on the left top side of the map
            this.map.on('zoomend', () => {
                const currentZoom = this.map.getZoom();
                if (currentZoom < initialZoom) {
                    this.map.setZoom(initialZoom);
                }
            });
            //used for debugging. used to click on the map and console.log the coordinates as to setup a way to set the locations.json data to relevant point in the map.  
            this.map.on('click', (e) => {
                console.log('Current Coordinates:', e.latlng);
            });
        }
    }
    // a async function used to fetch the data from the local host. 
    async fetchLocationsData() {
        try {
            const response = await fetch('./locations'); //this is supposed to be the citWeb location address to host, however was not able to get it to connect. 
            // if the data is not found that it should push a error with its status issue
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            //set a variable data equal to the await's response.json
            const data = await response.json();
            //this.locations variable will be equal to the data variable defined above or a empty array.
            this.locations = data || [];
            //used for testing purposes, will log the locations data. 
            console.log('Locations Data:', this.locations);
            //the addMarkers method will be used to get the actual data from the locations found and add a relative icon to it on the bottom tab(explained further below)
            // both methods below will need to fire the moment the fetch locationsData is fired in order to correctly pass correct icons to the bottom tab.
            this.addMarkers();
            this.addBridgeIconToLocationsTab(); // Add the icon to the bottom tab. 
            // a error to be set up if the locations data is not found. was used for testing purposes. 
        } catch (error) {
            console.error('Error fetching locations data:', error);
        }
    }

    //addMarkers method. Used to get the exact coordinates and type from the locations.json data and pass those values to the bottom tab, making it relative to the icon tab

    addMarkers() {
        //set up a for each method with location and index passed as parameters
        this.locations.forEach((location, index) => {
            //the xCoord, and YCorrd, as well as type is equal to the location
            const { XCoord, YCoord, type } = location;
            //for testing purposes logging the markers index
            console.log('Marker index:', index);
            //the marker now equals the leafletmarker at the object values of YCood and XCoord
            const marker = L.marker([YCoord, XCoord], {
                //within the marker method icon is equal to the customIcon relative to type attribute found in the locations.Json data
                icon: this.customIcon(type)
                //add a second property to marker whcih is addTo with the parameter this.map, within add a click event that will return onMarkerClick with the location and index as parameters
            }).addTo(this.map)
                .on('click', () => this.onMarkerClick(location, index))
                
            //set marker._leaflet_id equal to the index found on the click.
            marker._leaflet_id = index;
            //push the marker to marker. 
            this.markers.push(marker);
        });
    }

   //onMarkerClick is responsible for determing the output of what happens when you click the map icon on the map. Called above within the addMarker method, below defines it
 //onMarkerClick takes the parameters location, and index. 
    onMarkerClick(location, index) {

       //set up a constant that equals the location. Basically you are fetching from the location data the name, type, image, stats, description, species, classes, and faction(not implemented) from the data
        const { Name, type, image, stats, description, species, classes, faction } = location;
        //detailsTab is equal to the details tab ID from the html. It appends the data to the details-tab html in a template literal.
        const detailsTab = document.getElementById('details-tab');
        //console.log the classes data, this was done to test the chart data later defined below. 
        console.log('Classes:', classes);
        //within the detailsTab.innerHTML you are setting the details tab information and its look, felt even with styles it was easier to implemnt in a template literal. each line of the html
        //carries with it the data type from the locations.json relative to the map location. 
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
        //above the template literal will also setup the chartjs location and what property to pass. In this case it is either donut-chart and the relative index, or classes-chart and its relative index.
        
        // below is used to set up the chart.js intitialization, if species is true then set a timeout that will call the createDonutChat with its parameters species and relative index. 
        //in the first example, I wanted to set up a time sequence just to experiment, in all reality the timeout is not really neccasary. 
        if (species) {
            setTimeout(() => {
                this.createDonutChart(species, index);
            }, 100);
        }
        //if statement that states that if classes is true then render the createClassesChart with classes and relative index passed as its parameters. 
        if (classes) {
            this.createClassesChart(classes, index);
        }

        //below was used to initially set up a third chart. However was not able to get the lines to show up on it for whatever reason, and ran out of time. 

        // if (faction) {
        //     this.createFaction(faction, index);
        // }
    
        //ensuring that the detailsTab style is set to flex for design purposes. 
        detailsTab.style.display = 'flex';
    }

    //below is used to setup the logic behind the customIcon with its type as a parameter, 

    customIcon(type) {
        //define iconUrl 
        //define iconSize which is equal to 64, 64. 
        //this is relative to leaflet.js's documentation on controling the icon's 
        let iconUrl;
        let iconSize = [64, 64];


        // a switch statement that defines the location type and its relative image per type found in the locations.json
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

        //as per leaflets documentation, you want to return the Leaflet icon with its iconUrl, iconSize, iconAnchor, its popupAnchor, and its type: type. 
        //BIG NOTE: when attempting to create a icon filter where you click the icon image at the bottom tab and it toggles the visibility of the actual map icon. I understood the logic, however, 
        //could not tie it to leaflet's way of handling icons. I struggled for around six hours attempting to figure out why toggleLocationVisibility(type) defined below was not working. As I was 
        //correctly passing the type parameter to the toggleLocationVIsibility. However after hours of debugging I found that within the L.icon, it had to define type: type, otherwise the data just
        //was not connecting to the leaflet customization for the icon. 
        return L.icon({
            iconUrl,
            iconSize,
            iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
            popupAnchor: [0, -iconSize[1] / 2],
            //type: type. this simple key value pair, cuased me hours of debugging and frustration, but eventually found that type: type had be defined in order for the type parameter from the icon to correctly pass
            type: type
            
        });
    }



    


    //the createDonutChart is responsible for creating the chart relative to the species data found in locations.json, it takes it parameters species, and index. 
    //majority of the setup for the charts I was able to implement by simply looking over project 6's event application as the way the charts run are similiar.
    createDonutChart(species, index,) {
        //canvasID is equal to the value `donut-chart-' found in the template literal html, However what is extremelly important is passing the index to the template literal as `donut-chart-${index}`
        // the index placed after the html tag means that the html of donut-chart- is now relative to the species index. 
        //canvas is just attaching a getElementById to the CanvasID defined. 
        const canvasId = `donut-chart-${index}`;
        const canvas = document.getElementById(canvasId);
        
        //essential error handling if canvasID is not found - by default it will log an eror becuase it only returns the id once you click on the specific map location
        if (!canvas) {
            // console.log(`Canvas not found for ID: ${canvasId}`);
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
        //speciesNames and speciesValues are important to be tied to the Object.keys and object.values. this is important becuase for displaying the correct graph key value pairs, these must be
        //defined as key value pairs rendered as objects. 
        const speciesNames = Object.keys(species);
        const speciesValues = Object.values(species);

        //this is directly responsible for the visual display of the species 'doughnut chart'
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
                        //this is in charge of displaying the values in the tooltip, essentially making the tooltip show the dataset, its total, the currentValue of the dataset, and basically
                        //appending a percentage after each value. 
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

    //very similiar to above, in fact essentially the same functionality. The createClassesChart method is used to set up the chart for the second graph, where classes and its index are displayed.

    createClassesChart(classes, index) {
        //this very key part is shown again, where canvasId is equal to `classes-chart-` then its relative index to the classes parameter. 
        const canvasId = `classes-chart-${index}`;
        const canvas = document.getElementById(canvasId);
        //console.log for testing purposes, wished to see if the index for classes was passed correctly. - placed as comments becuase it will be defualt pass a not found or undefined until map location clicked
        // console.log(canvasId)
        // console.log(index)
        // console.log('Classes:', classes);
        //error handling if classes index was not found. 
        if (!canvas) {
            // console.error(`Canvas not found for ID: ${canvasId}`); - by default will throw a error as the map location is not clicked
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


    //the below method was created and nearly finished however couldn't figure out the issue with the lines not showing up within the amount of time given. 


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

    
    //below method to define the add icon to the below locations tab. 

    addBridgeIconToLocationsTab() {
        //locationsTab is equal to the id of locations tab. 
        const locationsTab = document.getElementById('locations-tab');
        //locationsTab inner HTHML is set to Locations. 
        locationsTab.innerHTML=`Locations`

        // Get unique location types - you want to set the spread of the new Set data at this.locations map where location will return the location.type. Type found of course in the locations.json.
        const uniqueTypes = [...new Set(this.locations.map(location => location.type))];
    
        // Create buttons for each unique location type. this will render a button for each unique location type 
        uniqueTypes.forEach(type => {
            //button is equal to the document.create button
            const button = document.createElement('button');
            //the buttons text content is equal to the type
            button.textContent = type;
            //add location button class to the button
            button.classList.add('location-button');
            //then add a event listener which is a click event which will return the toggleLOcationVIsibility method with type as its parameter. 
            button.addEventListener('click', () => this.toggleLocationVisibility(type));
            //at the locationsTab, append a child element with button as its parameter 
            locationsTab.appendChild(button);
        });
    }

    //below is the toggleLocationVisibility method with type passed as its parameter 

    toggleLocationVisibility(type) {
        //for each markers, marker will return a statement with conditional rendering
        this.markers.forEach(marker => {
            // if the marker options, markeroptionsicon and marker options icon options are all true then render the locationTpye equal to marker.options.icon.options.type. Which by defualt will be true. 
            if (marker.options && marker.options.icon && marker.options.icon.options) {
                const locationType = marker.options.icon.options.type;
                // if locationType has a type relative to the type found in the location, the map at hasLayer from leaflet with is marker parameter will removethe leaflet layer. meaning remove the leaflet icon
                if (locationType === type) {
                    if (this.map.hasLayer(marker)) {
                        this.map.removeLayer(marker);
                    } else {
                        this.map.addLayer(marker);
                    }
                } else {
                    //basically if the leaflet hasLayer is not true and the button is clicked, it will then make the icon appear, hasLayer(marker)
                    if (!this.map.hasLayer(marker)) {
                        this.map.addLayer(marker);
                    }
                }
                //if the marker icon is not defined or found, then a error will apear to the console. 
            } else {
                console.error('Marker icon options are undefined or do not exist.');
            }
        });
    }
}

//call the class FantasyMap within a constant called fantasyMap
const fantasyMap = new FantasyMap();
