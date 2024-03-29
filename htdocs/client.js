let logResponse = [];
let logElements = [];
const logType = {
    response: 1,
    elements: 2
};

const logMaxEntries = 10; // Maximum number of logs entries

let traceMode = true; // Trace mode on or off

let pauseRefresh = false; // Pause refresh mode on or off

/**
 * Display console help message.
 */
function help() {
    console.log(`%cWelcome to debug console!
%cYou can use the following commands:

%c### FILTERS FUNCTIONS ###%c
- displayLines(): Display all known lines for this display.
- displayDirections(): Display all known directions for this display.
- displayDestinations(): Display all known destinations for this display.

%c### DEBUG FUNCTIONS ###%c
- displayLogResponse(): Print the 10 last JSON responses.
- displayLogElements(): Print the 10 last DOM elements.

%c### HELP FUNCTIONS ###%c
- help(): Display this help message.

%c### DEBUG VARIABLES ###%c
- traceMode = true/false; to enable or disable trace mode (current: ${traceMode})
- pauseRefresh = true/false; to enable or disable auto refresh (current: ${pauseRefresh}).`,
    'font-weight: bold',
    'font-weight: normal',
    'font-weight: bold',
    'font-weight: normal',
    'font-weight: bold',
    'font-weight: normal',
    'font-weight: bold',
    'font-weight: normal',
    'font-weight: bold',
    'font-weight: normal');
}



let destinationsList = {};
let directionsList = {};
let linesList = {};

/**
 * Add object to log
 * @param {object} object Object to log
 * @param {integer} type Type of log
 */
function addToLog(object, type)
{
    let logObj;
    if(type == logType.response)
        logObj = logResponse;
    else if(type == logType.elements)
        logObj = logElements;
    else
        return false;

    let insertedObject = {
        datetime: new Date(),
        object: object
    };

    logObj.push(insertedObject);
    if(logObj.length > logMaxEntries)
        logObj.shift();

    return true;
}


/**
 * Auto disable trace mode
 */
function disableTraceMode() {
    if(traceMode) {
        traceMode = false;
        console.warn("Trace mode is now disabled. You can enable it again with the following command:\ntraceMode = true;");
    }
}


/**
 * Print all found lineRefs
 */
function displayLines() {
    disableTraceMode();

    console.log("------------------------------------------------------------------------");
    console.log("### LIST OF KNOWN LINES: ###\n");
    for(let line in linesList) {
        console.log(line);
    };
    console.log("------------------------------------------------------------------------");
}


/**
 * Print all found directionNames
 */
function displayDirections() {
    disableTraceMode();

    console.log("------------------------------------------------------------------------");
    console.log("### LIST OF KNOWN DIRECTIONS: ###\n");
    for(let direction in directionsList) {
        console.log(direction);
    };
    console.log("------------------------------------------------------------------------");
}


/**
 * Print all found destinationNames
 */
function displayDestinations() {
    disableTraceMode();

    console.log("------------------------------------------------------------------------");
    console.log("### LIST OF KNOWN DESTINATIONS: ###\n");
    for(let destination in destinationsList) {
        console.log(destination);
    };
    console.log("------------------------------------------------------------------------");
}


/**
 * Print the 10 last responses
 */
function displayLogResponse() {
    logResponse.forEach(response => {
        console.log(response.datetime.toString(), response.object);
    });

    disableTraceMode();
}


/**
 * Print the 10 last data entries
 */
function displayLogElements() {
    logElements.forEach(response => {
        console.log(response.datetime.toString(), response.object);
    });

    disableTraceMode();
}


function updateElements(display) {
    if(pauseRefresh)
        return false;

    $.ajax({
        url: "/generated/hours",
        method: "GET",
        data: { display: display },
        success: function(response) {
            // Logging response
            addToLog(response, logType.response);

            // Set display
            $("body").addClass(response.linetype);
            $("#line_identifier_label").text(response.linenumber);
            $("#stopname").text(response.displayname);
            $("#line_identifier").css({
                backgroundColor: "#" + response.linecolor,
                color: getContrastColor(response.linecolor)
            });
            $("body").attr("data-minimumwait", response.minimumwait);


            let displayClock = true;
            if(urlParams.get("displayclock") != null)
                displayClock = urlParams.get("displayclock") == "1";
            else
                displayClock = response.displayclock == true;

            if(!displayClock)
                $("body").addClass("hideclock");
            
            // Storing limit
            objectsLimit = urlParams.get("limit")==null ? response.limit ?? 0 : parseInt(urlParams.get("limit"));


            // List all travels
            response.vehicles.forEach(travel => {
                // Storing lineRef
                linesList[travel.lineRef] = travel.lineRef;
                // Storing directionName
                directionsList[travel.directionName] = travel.directionName;
                // Storing destinationName
                destinationsList[travel.destinationName] = travel.destinationName;

                // Do we have a GUID existing?
                if(document.getElementById(travel.GUID) !== null) {
                    // Already exists! Just update the travel elements
                    if(traceMode) console.log(travel.GUID + " already exists");

                    var arrivalDatetime = null;
                    var departureDatetime = null;

                    if(travel.arrival !== null)
                        arrivalDatetime = travel.arrival.datetime;

                    if(travel.departure !== null)
                        departureDatetime = travel.departure.datetime;

                    // Edit data attributes
                    $("#"+travel.GUID)
                        .attr("data-arrivalTime", arrivalDatetime)
                        .attr("data-departureTime", departureDatetime);
                }
                else {
                    // Not exists. Create element

                    // Vehicle root element
                    var vehicle = $("<div>")
                        .addClass("vehicle")
                        .attr("id", travel.GUID)
                        .on("click", function(element) {
                            toggleVehicleFollow(element.currentTarget.id)
                            updateFollow();
                        })
                    
                    // Adding delayed stat
                    vehicle.attr("data-departureDelayed", false);
                    // Do we have a departure time?
                    if(travel.departure !== null) {
                        vehicle.attr("data-departureTime", travel.departure.datetime);
                        vehicle.attr("data-departureDelayed", travel.departure.delayed);
                    }
                    else
                        vehicle.attr("data-departureTime", null);
                

                    // Adding delayed stat
                    vehicle.attr("data-arrivalDelayed", false);
                    // Do we have an arrival time?
                    if(travel.arrival !== null) {
                        vehicle.attr("data-arrivalTime", travel.arrival.datetime);
                        vehicle.attr("data-arrivalDelayed", travel.arrival.delayed);
                    }
                    else
                        vehicle.attr("data-arrivalTime", null);
                    
                    // Add waiting time data
                    vehicle.attr("data-waitingTime", 0);

                    // Create vehicle title
                    var title = $("<div>")
                        .addClass("vehicleTitle");
                    
                        var titleContainer = $("<div>")
                            .addClass("container");

                            var titleContainerPosition = $("<span>")
                                .addClass("vehicleTitle_position");
                            
                            var titleContainerType = $("<span>")
                                .addClass("vehicleTitle_type");
                        
                        titleContainer.append(titleContainerPosition).append(titleContainerType);

                    title.append(titleContainer);
                    
                    // Create vehicle wait
                    var wait = $("<div>")
                        .addClass("vehicleWait");
                    
                        var waitContainer = $("<div>")
                            .addClass("container");

                            var waitContainerValue = $("<span>")
                                .addClass("vehicleWait_value")
                                .text("-");
                            
                            var waitContainerUnit = $("<span>")
                                .addClass("vehicleWait_unit")
                                .text("-");
                        
                        waitContainer.append(waitContainerValue).append(waitContainerUnit);

                    wait.append(waitContainer);
                    
                    
                    // Adding elements to root
                    vehicle.append(title).append(wait);

                    // Only add vehicle if have departure
                    if(travel.departure !== null) {
                        // Adding vehicle elements to list
                        $("#nextVehicles").append(vehicle);
                        if(traceMode) console.log("Add new element to DOM", vehicle);

                        // Register
                        registeredElements[travel.GUID] = $("#"+travel.GUID);
                    }

                }

                // Convert datetime to waiting time
                updateTimings(travel.GUID);
    
                // Limit objects
                limitObjects(objectsLimit);
            });

            // Update follow display
            updateFollow();

            // Sort objects
            sortObjects();

            // Log elements
            addToLog(registeredElements, logType.elements);

        },
        error: function(err) {
            console.error(err);
        }
    });
}


function updateTimings(GUID) {
    if(pauseRefresh)
        return false;

    let element = $("#" + GUID);

    if(element === undefined || element === null) {
        console.error("Unrecognized GUID " + GUID);
        return false;
    }
    
    if(traceMode) console.log("Updating GUID "+GUID+"...");
    
    // Do we have a departure and/or arrival?
    var haveArrival = element.data("arrivalTime") !== null;
    var haveDeparture = element.data("departureTime") !== null;

    if(haveDeparture) {
        // Get datetime of arrival and departure
        //let dateArrival = new Date(element.attr("data-arrivalTime"));
        let dateDeparture = new Date(element.attr("data-departureTime"));

        // Get current date
        let currentDate = new Date();

        // Calculate deltas in seconds
        //let deltaArrival = Math.round((dateArrival - currentDate) / 1000);
        let deltaDeparture = Math.round((dateDeparture - currentDate) / 1000);

        // Initialize displayed waiting time
        let deltaDisplay = deltaDeparture;
        let deltaUnit = "";

        // Calculate delta in minutes
        deltaDisplay = Math.ceil(deltaDeparture / 60);
        deltaUnit = "min";

        // Get current value and unit
        let currentObjectValue = $("#"+GUID + " .vehicleWait_value").text();
        let currentObjectUnit = $("#"+GUID + " .vehicleWait_unit").text();

        // By default, no animation
        let animationDuration = 0

        // If new value is different...
        if(currentObjectValue != deltaDisplay || currentObjectUnit !== deltaUnit) {
            if(traceMode) console.log("  New value!");
            // Animate
            animationDuration = 1500;
        }

        // If waiting time is "-" (object initialisation), no animation
        if(currentObjectValue == "-") {
            animationDuration = 0;
        }

        // Fade out
        $("#"+GUID + " .vehicleWait").stop().clearQueue().animate({
            opacity: 0
        }, animationDuration, "linear", function() {
            // Update HTML element
            $("#"+GUID + " .vehicleWait_value").text(deltaDisplay);
            $("#"+GUID + " .vehicleWait_unit").text(deltaUnit);

            // Fade in
            $(this).animate({
                opacity: 1
            }, animationDuration, "linear");
        });

        // If delta is out of limits
        if(deltaDeparture < $("body").attr("data-minimumwait") || deltaDeparture == NaN)
            element.addClass("hide").removeClass("visible"); // Hide vehicle
        else
            element.removeClass("hide").addClass("visible"); // Show vehicle

        if(traceMode) console.log("    Departure at " + dateDeparture);
        if(traceMode) console.log("    => in " + deltaDeparture + " sec");

        // Set waiting time data
        element.attr("data-waitingTime", deltaDeparture); //deltaDeparture);

        // Remove and unregister element if vehicle is too old
        if(deltaDeparture < -100) {
            element.remove();
            registeredElements[GUID] = undefined;

            console.warn("Unregister and remove GUID " + GUID);
        }
    }
    else {
        // Remove element
        element.remove();

        // Unregister element
        registeredElements[GUID] = undefined;

        console.warn("This GUID doesn't have departure informations. Remove and unregister: " + GUID)
    }
}

function sortObjects() {
    
    if(pauseRefresh)
        return false;

    const container = $("#nextVehicles");
    const divs = container.children(".vehicle");

    divs.sort(function(a,b) {
        const aTime = parseInt($(a).attr('data-waitingtime') ?? 0);
        const bTime = parseInt($(b).attr('data-waitingtime') ?? 0);
        return aTime - bTime;
    });

    let orderIndex = 1;
    divs.each(function() {
        $("#" + $(this).attr("id")).css("order", orderIndex++);
    });
}

function limitObjects(limit) {
    if(pauseRefresh)
        return false;

    // Limit only if limit is set to >0 and is not null
    if(limit > 0 && limit !== null) {
        const vehicles = $("#nextVehicles").children(".vehicle");

        vehicles.sort(function(a,b) {
            const aTime = parseInt($(a).attr('data-waitingtime') ?? 0);
            const bTime = parseInt($(b).attr('data-waitingtime') ?? 0);
            return aTime - bTime;
        });

        let i = 1;
        let o = 1;
        for(let vehicle of vehicles) {
            // Limit only visible objects
            if(!vehicle.classList.contains("hide")) {
                // If i is out of limits, hide object
                if(i > limit) {
                    vehicle.classList.add("filtered");
                }
                else {
                    vehicle.classList.remove("filtered");
                }
                i++;
            }

            vehicle.setAttribute("data-order", o.toString());
            o++;
        }
    }
}


function getContrastColor(hexColor) {
    // Convertir la couleur hexadécimale en valeurs RGB
    const red = parseInt(hexColor.substr(0, 2), 16);
    const green = parseInt(hexColor.substr(2, 2), 16);
    const blue = parseInt(hexColor.substr(4, 2), 16);
  
    // Calculer la luminosité de la couleur (formule de luminance relative)
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
  
    // Déterminer la couleur du texte en fonction de la luminosité
    return brightness > 128 ? 'black' : 'white';
}


// Toggle vehicle follow
function toggleVehicleFollow(guid) {
    let currentFollowState = (localStorage.getItem("follow") == guid);

    if(currentFollowState)
        localStorage.setItem("follow", "");
    else
        localStorage.setItem("follow", guid);

    return !currentFollowState;
}


// Update follow display
function updateFollow() {
    let currentFollowGUID = localStorage.getItem("follow") ?? "";
    let currentFollowGUIDFound = false;

    if(currentFollowGUID != null)
        if(traceMode) console.log("[VEHICLE TRACKER] Currently tracked vehicle GUID: " + currentFollowGUID + "...");
    else
        if(traceMode) console.log("[VEHICLE TRACKER] Currently no vehicle are being tracked.");
    
    // List of vehicles in DOM
    $("#nextVehicles > .vehicle").each(function() {
        let followState = currentFollowGUID != "" && $(this).attr("id") == currentFollowGUID;

        if(followState) {
            $(this).addClass("follow");
            currentFollowGUIDFound = true;
        }
        else
            $(this).removeClass("follow");
    });

    if(currentFollowGUIDFound)
        if(traceMode) console.log("[VEHICLE TRACKER] Vehicle found! Highlighted.");
    else
        if(traceMode) console.log("[VEHICLE TRACKER] Vehicle not found here.");

}

// Showing all displays
function showDisplaysIndex() {
    $("#background").remove();
    $("#main").remove();

    // Add indexof class to body
    $("body").addClass("indexof");

    // Create index container and append it to body
    let indexContainer = $("<div>")
        .attr("id", "indexOf");
    
    indexContainer.append($("<h1>Affichages configurés</h1>"))

    let indexContainerList = $("<ul>");
    
    // Get list of displays
    $.ajax({
        url: "/generated/displays",
        method: "GET",
        success: function(response) {

            for(let dis in response) {
                let displayListItem = $("<li>");
                let displayLink = $("<a>")
                    .attr("href", ".?display="+dis);
                
                let displayLinkLine = $("<span>")
                    .addClass("line")
                    .css({
                        "background-color": "#"+response[dis].linecolor,
                        "color": getContrastColor(response[dis].linecolor)
                    })
                    .text((response[dis].linetype.toUpperCase() ?? "") + " " + (response[dis].linenumber.toUpperCase() ?? ""));
            
                let displayLinkName = $("<span>")
                    .addClass("name")
                    .text((response[dis].displayname ?? ""));
                
                // Append child elements to link...
                displayLink
                    .append(displayLinkLine)
                    .append(displayLinkName);
                
                // ...and link to the list
                indexContainerList.append(displayListItem.append(displayLink));
            }

        },
        error: function(err) {
            console.error(err);
        }
    });
    

    indexContainer.append(indexContainerList);
    $("body").append(indexContainer);
}


// List of registered elements
var registeredElements = {};

// Initialise limit value
let objectsLimit = 0;

// Getting URL params
const urlParams = new URLSearchParams(window.location.search);


$(document).ready(function() {
    // Get displayID in URL
    const displayID = urlParams.get('display');

    // Display index if no display specified
    if(displayID === null || typeof displayID != "string" || displayID.trim()=="") {
        if(traceMode) console.log("Showing index of");
        showDisplaysIndex();
    }
    else {
        window.setInterval(function() {
            var dt = new Date();

            var hr = dt.getHours();
            var mn = dt.getMinutes();

            if(hr<10)
                hr = "0" + hr;
            
            if(mn<10)
                mn = "0" + mn;

            document.getElementById("clock_hours").innerText = hr;
            document.getElementById("clock_minutes").innerText = mn;
        }, 200);

        // Update elements from API now
        updateElements(displayID);

        // Get informations from API regularly
        window.setInterval(function() {
            updateElements(displayID);
        }, 90000);

        // Recalculate all elements every 10 seconds
        window.setInterval(function() {
            let count = 0;
            Object.entries(registeredElements).forEach(([GUID, object]) => {
                updateTimings(GUID);
                count++;
            });

            // Sort objects
            sortObjects();

            // Limit objects
            limitObjects(objectsLimit);

            if(traceMode) console.log(document.querySelectorAll(".vehicle").length + " elements registered in DOM.");
        }, 10000);


        // Update follow mode on storage changes
        window.addEventListener("storage", function(e) {
            updateFollow();
        });


        // Animate clock separator
        window.setInterval(function() {
            let dt = new Date();
            if(dt.getMilliseconds() < 500) {
                $("#clock_separator").css("opacity", 1);
            }
            else {
                $("#clock_separator").css("opacity", 0.4);
            }
        }, 50);
    }
});


// Check console status every 500 milliseconds
let lastOpened = false;
setInterval(function() {
    let opened = (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || 
                  window.outerWidth - window.innerWidth > 200 || 
                  window.outerHeight - window.innerHeight > 200;
    
    if(opened != lastOpened) {
        lastOpened = opened;

        if(opened) {
            help(); // Display console help message
        }
    }
}, 500);