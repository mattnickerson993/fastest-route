
// initialize buttons and elements

const plusBtn = document.getElementById('btn-plus');
const minusBtn = document.getElementById('btn-minus');
let count = 0
const myDestinations = document.getElementById('my-destinations')
const xButton = document.querySelector('.x');

// event listeners and functions to handle adding and removing destinations


minusBtn.addEventListener('click', removeDestination)

plusBtn.addEventListener('click', addDestination)


function addDestination(e){
    
    count ++

    let newInput = document.createElement('input');
    newInput.id = `destination${count}`
    newInput.classList.add('destination')
    newInput.classList.add('dest')
    newInput.setAttribute('type', 'text')
    newInput.placeholder = `Destination ${count}`
    myDestinations.appendChild(newInput)
    e.preventDefault();

    //  `
    //  <input type="text" class="destination dest" id="destination${count}" placeholder="Destination ${count}">
    //  `
    //  ---- was used in the orignal function ---however, form would always clear even with use of preventdefault
    //  ---- switch to creating dom element and adding attributes
     
    // myDestinations.innerHTML += `
    // <input type="text" class="destination dest" id="destination${count}" placeholder="Destination ${count}">
    // `
    
}


function removeDestination(e){
    e.preventDefault()
    let removedInput = document.getElementById(`destination${count}`);
    if( count > 0){
        myDestinations.removeChild(removedInput);
        count --;
    }
    

}

// map 

// Create the script tag, set the appropriate attributes
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
// Append the 'script' element to 'head'
document.head.appendChild(script);

// global variables
let map;
let geocoder;

// initalize function is called when body loads

function initialize() {
  // JS API is loaded and available
    // map center is initially set for CVille VA
    
    const options = {
        center: {lat: 38.031052, lng: -78.474159},
        zoom: 9
    }


    
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), options)
   
    
    

    
};



let submitBtn = document.getElementById('btn-submit');
submitBtn.addEventListener('click', codeAddress)

// main function of program
// takes array of inputs and plots as points on map using plotAddresses function
// destArrayValues is an array of address strings
// getDistance matrix provides data between legs of trip (ie mileage and time)
// getDirecitons fills in travel pattern for legs of trip

function codeAddress(){
    let destArray =Array.from(document.getElementsByClassName('dest'));

    
    plotAddresses(destArray);
    let destArrayValues = destArray.map(dest => dest.value)
    
    getDistanceMatrix(destArrayValues);
    getDirections(destArrayValues);
    // displays new window
    finalData.style.display = 'block';
    
    

}


function plotAddresses(addresses){
    for(let i = 0; i< addresses.length; i++){
        let address = document.getElementById(`destination${i}`).value;
        geocoder.geocode({'address': address}, function(results, status){
        if(status == 'OK'){
            if(i === 0){
                // set center of map to starting point
                map.setCenter(results[0].geometry.location);
            }
            let marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        }
        else{
            alert('Geocode was not successful for the following reason: ' + status);
        }
    })
    }

}

// define arrays to be use for display
let travel = []
let miles = []
let time = []

// function provides ton of data... provides data for each value in origins array (all but last destination)
// in relation to all values in destinations array ( all but starting address)
function getDistanceMatrix(arrDest){
    

    let service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
    {
        origins: arrDest.slice(0,arrDest.length-1),
        destinations: arrDest.slice(1),
        travelMode: 'DRIVING',
        // provides data in miles
        unitSystem: google.maps.UnitSystem.IMPERIAL

    }, getDistanceBetween)

    function getDistanceBetween(response, status){
        if (status == 'OK') {
            // console.log(response)
            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;
    
        for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            // console.log(results)
            // console.log(`${origins[i]} to ${destinations[i]}` )
            travel.push(`${origins[i]} to ${destinations[i]}`)
            // console.log(results[i].distance.text)
            miles.push(results[i].distance.text)
            // console.log(results[i].duration.text)
            time.push(results[i].duration.text)
            // directionsPract(`${origins[i]}`, `${destinations[i]}`)
        //   for (var j = 0; j < results.length; j++) {
        //     var element = results[j];
        //     var distance = element.distance.text;
        //     console.log(distance)
        //     var duration = element.duration.text;
        //     var from = origins[i];
        //     var to = destinations[j];
        //   }
        }
        displayTravelData();
      }
    }

}


// define start and end, all other legs of trips are in waypoints array



function getDirections(arrOfDest){

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    let start = arrOfDest[0]
    let end = arrOfDest[arrOfDest.length-1]
    let waypts = []
    
    for(let i = 1; i < arrOfDest.length-1; i++){
        waypts.push({
            location: arrOfDest[i],
            stopover: true
        });
    }


    directionsRenderer.setMap(map);
    


    let request = {
        origin: start,
        destination: end,
        waypoints: waypts,
        travelMode: 'DRIVING',
        // optimizeWaypoints: true


    };
    
    
    directionsService.route(request, function(result, status){
        if(status == 'OK'){
            directionsRenderer.setDirections(result)
            console.log(result)
        }
    });
}

// handles display of final data popup
const finalData = document.getElementById('final-data');

function displayTravelData(){


    
    
    for(let i=0; i < travel.length; i++){
        
        finalData.innerHTML +=
        `  <div class="card">
            <div class ="travel">${travel[i]}</div>
            <div class="time">Travel Time: ${time[i]}</div>
            <div class="miles">Mileage: ${miles[i]}</div>
            </div>
        `
    }
    parseMiles(miles);
    // parseTime(time);
        
}

// tried and failed miserably to make parseTime function just like parseMiles...saved for another day


// function parseTime(time){
//     let newTime = time.map(entry => {
//         console.log(entry)
//         return entry.replace(/[a-z]/gi,"").split(' ');
//     })
//     console.log(newTime)
//     let finalTime = newTime.map(entry => {
//         return  entry.filter(t => t !== "")
//     })
//     let majorArr = []
//     let finalFinalTime = finalTime.map(t => {
//         for(let i = 0; i< t.length; i++){
//             console.log(typeof t[i])
//              t[i] = parseFloat(t[i])
//              majorArr.push(t[i])
//         }
//         return t
        
//     })
//     console.log(finalFinalTime)
//     console.log(maj)

//     for(let i =1; i < finalFinalTime.length; i++){
//         finalFinalTime[0].concat(finalFinalTime[i])
//     }
//     console.log(finalFinalTime)
//     // finalData.innerHTML += `
//     //     <div class="card">
//     //     <div class="time">Total Trip Time: ${parsedMiles.reduce((a,b) => a+b)} miles</div>
//     //     </div>
//     // `

    
        
    

// }

function parseMiles(miles){
    let parsedMiles = miles.map(mile => {
        mile = mile.replace(/,/, "");
        let index = mile.indexOf(" ")
        return parseFloat(mile.slice(0, index));
    })
    finalData.innerHTML += `
         <div class="card card-popup">
         <div class="miles">Total Trip Mileage: ${parsedMiles.reduce((a,b) => a+b)} miles</div>
         </div>
     `
    
    
}

// clicking this will remove popup and reset page --- in other words....do not want to call prevent default
xButton.addEventListener('click', shiftData);

function shiftData(){
    finalData.classList.add('shift');
}