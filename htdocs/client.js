function updateElements(display) {
    $.ajax({
        url: "/generated/hours",
        method: "GET",
        data: { display: display },
        success: function(response) {
            // Set display
            $("body").addClass(response.linetype);
            $("#line_identifier_label").text(response.linenumber);
            $("#stopname").text(response.displayname);
            $("#line_identifier").css({
                backgroundColor: "#" + response.linecolor,
                color: getContrastColor(response.linecolor)
            });
            $("body").attr("data-minimumwait", response.minimumwait);


            // List all travels
            response.vehicles.forEach(travel => {
                // Do we have a GUID existing?
                if(document.getElementById(travel.GUID) !== null) {
                    // Already exists! Just update the travel elements
                    console.log(travel.GUID + " already exists");

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
                    
                    // Do we have a departure time?
                    if(travel.departure !== null)
                        vehicle.attr("data-departureTime", travel.departure.datetime);
                    else
                        vehicle.attr("data-departureTime", null);
                
                    // Do we have an arrival time?
                    if(travel.arrival !== null)
                        vehicle.attr("data-arrivalTime", travel.arrival.datetime);
                    else
                        vehicle.attr("data-arrivalTime", null);

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

                    // Adding vehicle elements to list
                    $("#nextVehicles").append(vehicle);
                    console.log("Add new element to DOM", vehicle);

                    // Register
                    registeredElements[travel.GUID] = $("#"+travel.GUID);

                }

                updateTimings(travel.GUID);
            });

        },
        error: function(err) {
            console.error(err);
        }
    });
}


function updateTimings(GUID) {
    let element = $("#" + GUID);

    if(element === undefined || element === null) {
        console.error("Unrecognized GUID " + GUID);
        return false;
    }
    
    console.log("Updating GUID "+GUID+"...");
    
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

        // Update HTML element
        $("#"+GUID + " .vehicleWait_value").text(deltaDisplay);
        $("#"+GUID + " .vehicleWait_unit").text(deltaUnit);

        console.log("    Departure at " + dateDeparture);
        console.log("    => in " + deltaDeparture + " sec");

        // If delta is out of limits
        if(deltaDeparture < $("body").attr("data-minimumwait") || deltaDeparture == NaN)
            element.addClass("hide").removeClass("visible"); // Hide vehicle
        else
            element.removeClass("hide").addClass("visible"); // Show vehicle

        // Remove and unregister element if vehicle is too old
        if(deltaDeparture < -300) {
            element.remove();
            registeredElements[GUID] = undefined;
        }
    }
    else {
        // Remove element
        element.remove();

        // Unregister element
        registeredElements[GUID] = undefined;
    }
}


// List of registered elements
var registeredElements = {};


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


$(document).ready(function() {
    // Getting URL params
    const urlParams = new URLSearchParams(window.location.search);

    // Get displayID in URL
    const displayID = urlParams.get('display');

    // Error if no param
    if(displayID === null || typeof displayID != "string" || displayID.trim()=="")
        document.write("Please set \"display\" GET parameter with a valid display ID.");
    else {
        var intClock = window.setInterval(function() {
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

        // Update elements now and auto get datas from API every minutes
        updateElements(displayID);
        window.setInterval(function() {
            updateElements(displayID);
        }, 60000);

        // Recalculate all elements every 5 seconds
        window.setInterval(function() {
            let count = 0;
            Object.entries(registeredElements).forEach(([GUID, object]) => {
                updateTimings(GUID);
                count++;
            });

            console.log(count + " elements registered in DOM.");
        }, 5000);
    }
});
