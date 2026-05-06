const GeneratedResponse = require("./models/GeneratedResponse.js");
const Config = require("./config.js");
const Request = require("sync-request");


/**
 * 
 * @param {Http.IncomingMessage} request HTTP Request
 * @param {ParsedUrlQuery} params Query object that contains GET parameters
 * @returns {GeneratedResponse}
 */
exports.hours = function(request, params) {
    let r = new GeneratedResponse();

    // Get display id
    var displayID = params.display;

    if(displayID == undefined) {
        // display is undefined: error
        r.contentType = "text/plain";
        r.responseCode = 401;
        r.responseBody = "You must define \"display\" GET parameter.";

        return r;
    }

    // Protect display ID as a string
    displayID = displayID.toString();

    if(displayID == "general") {
        // Display can't be "general"
        r.contentType = "text/plain";
        r.responseCode = 401;
        r.responseBody = "display GET parameter can't have \"general\" value.";

        return r;
    }

    if(Config[displayID] == undefined) {
        // Specified display does not exists
        r.contentType = "text/plain";
        r.responseCode = 401;
        r.responseBody = "\"" + displayID + "\" is not a valid registered display.";

        return r;
    }

    // Store display configuration
    let display = Config[displayID];
    
    try {
        // Make request
        const headers = {
            "apikey": Config.general.apikey
        };

        let ref = "";
        if(display.stationid !== undefined)
            ref = "STIF:StopPoint:Q:" + display.stationid.toString() + ":";
        if(display.areaid !== undefined)
            ref = "STIF:StopArea:SP:" + display.areaid.toString() + ":";

        if (ref === "") {
            r.responseCode = 400;
            r.responseBody = "No stationid or areaid defined for this display.";
            return r;
        }
        
        const url = "https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=" + ref;
        
        const rawResponse = Request("GET", url, { headers: headers }).getBody("utf-8");

        const response = JSON.parse(rawResponse);

        // Get list of deliveries
        let deliveries = response.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;

        // Transform lineid array to compatible values
        let filterLines = [];
        if(display.filterLine!== undefined) {
            display.filterLine.forEach((value, key) => {
                if(typeof value == "string")
                    filterLines.push(value);
            });
        }

        // Transform direction array to compatible values
        let filterDirections = [];
        if(display.filterDirection!== undefined) {
            display.filterDirection.forEach((value, key) => {
                if(typeof value == "string")
                    filterDirections.push(value);
            });
        }

        // Transform destinations array to compatible values
        let filterDestinations = [];
        if(display.filterDestination!== undefined) {
            display.filterDestination.forEach((value, key) => {
                if(typeof value == "string")
                    filterDestinations.push(value);
            });
        }

        if(deliveries !== undefined) {
            // Initialize list of travels
            var travels = [];

            let invertLines = display.filterLineInverted === "true" || display.filterLineInverted === true;
            let invertDirections = display.filterDirectionInverted === "true" || display.filterDirectionInverted === true;
            let invertDestinations = display.filterDestinationInverted === "true" || display.filterDestinationInverted === true;

            deliveries.forEach(delivery => {
                // Filtrage des Directions
                if(delivery.MonitoredVehicleJourney.DirectionName[0] != undefined) {
                    const directionVal = delivery.MonitoredVehicleJourney.DirectionName[0].value ?? "";
                    const isDirectionInList = filterDirections.includes(directionVal);
                    
                    if (filterDirections.length > 0) {
                        // Si (normal et pas dans liste) OU (inversé et dans liste) -> on rejette
                        if ((!invertDirections && !isDirectionInList) || (invertDirections && isDirectionInList)) {
                            return false;
                        }
                    }
                }
                
                // Filtrage des Lignes
                if(delivery.MonitoredVehicleJourney.LineRef != undefined) {
                    const lineVal = delivery.MonitoredVehicleJourney.LineRef.value ?? "";
                    const isLineInList = filterLines.includes(lineVal);
                    
                    if (filterLines.length > 0) {
                        if ((!invertLines && !isLineInList) || (invertLines && isLineInList)) {
                            return false;
                        }
                    }
                }

                // Filtrage des Destinations
                if(delivery.MonitoredVehicleJourney.MonitoredCall != undefined && delivery.MonitoredVehicleJourney.MonitoredCall.DestinationDisplay[0] != undefined) {
                    const destVal = delivery.MonitoredVehicleJourney.MonitoredCall.DestinationDisplay[0].value ?? "";
                    const isDestInList = filterDestinations.includes(destVal);
                    
                    if (filterDestinations.length > 0) {
                        if ((!invertDestinations && !isDestInList) || (invertDestinations && isDestInList)) {
                            return false;
                        }
                    }
                }

                travels.push(delivery);
            });

            var vehicles = [];
            // Convert times to relative
            travels.forEach(t => {
                // Is the journey object exists?
                if(t.MonitoredVehicleJourney !== undefined)
                {
                    let monitoredVehicleJourney = t.MonitoredVehicleJourney;

                    // Is the monitored call object exists?
                    if(monitoredVehicleJourney.MonitoredCall !== undefined)
                    {
                        let monitoredCall = monitoredVehicleJourney.MonitoredCall;

                        var itemIdentifier = t.ItemIdentifier ?? "";
                        itemIdentifier = itemIdentifier.replace(":", "_");
                        itemIdentifier = itemIdentifier.replace(/[^a-zA-Z0-9_]/g, "");
                        itemIdentifier = itemIdentifier.replace(/_{2,}/g, "_");
        
                        let departureStatus = monitoredCall.DepartureStatus ?? null;
                        let departureDatetimeString = monitoredCall.ExpectedDepartureTime ?? null;
                        let departureDatetimeObject = new Date(departureDatetimeString);
        
                        let arrivalStatus = monitoredCall.ArrivalStatus ?? null;
                        let arrivalDatetimeString = monitoredCall.ExpectedArrivalTime ?? null;
                        let arrivalDatetimeObject = new Date(arrivalDatetimeString);
        
                        let vehicleAtStop = monitoredCall.VehicleAtStop ?? null;
                        
                        let destinationName = null;
                        if(monitoredCall.DestinationDisplay[0] !== undefined)
                            destinationName = monitoredCall.DestinationDisplay[0].value ?? null;
        
                        let directionName = null;
                        if(monitoredVehicleJourney.DirectionName[0] !== undefined)
                            directionName = monitoredVehicleJourney.DirectionName[0].value ?? "";
        
                        let journeyName = null;
                        if(monitoredVehicleJourney.JourneyNote[0] !== undefined)
                            journeyName = monitoredVehicleJourney.JourneyNote[0].value ?? "";

                        let lineRef = null;
                        if(monitoredVehicleJourney.LineRef !== undefined)
                            lineRef = monitoredVehicleJourney.LineRef.value ?? "";

                        let destinationRef = null;
                        if(monitoredVehicleJourney.DestinationRef !== undefined)
                            destinationRef = monitoredVehicleJourney.DestinationRef.value ?? "";
                        
                        let journeyNameVehicle = null;
                        if(monitoredVehicleJourney.VehicleJourneyName[0] !== undefined)
                            journeyNameVehicle = monitoredVehicleJourney.VehicleJourneyName[0].value ?? "";
        
                        // Make new simplified object
                        var newT = {
                            GUID: itemIdentifier,
                            departure: {
                                datetime: departureDatetimeObject.toISOString(),
                                delayed: departureStatus=="delayed",
                                onTime: departureStatus=="onTime",
                                status: departureStatus
                            },
                            arrival: {
                                datetime: arrivalDatetimeObject.toISOString(),
                                delayed: arrivalStatus=="delayed",
                                onTime: arrivalStatus=="onTime",
                                status: arrivalStatus
                            },
                            vehicleAtStop: vehicleAtStop,
                            destinationName: destinationName,
                            directionName: directionName,
                            lineRef: lineRef,
                            destinationRef: destinationRef,
                            journeyName: journeyName,
                            journeyNameVehicle: journeyNameVehicle
                        };
        
                        if(departureDatetimeString === null)
                            newT.departure = null;
                        if(arrivalDatetimeString === null)
                            newT.arrival = null;
        
                        vehicles.push(newT);
                    }
                }

            });

            // Put vehicles into display object
            let displayObject = {
                linetype: display.linetype ?? "rer",
                linenumber: display.linenumber ?? "A",
                linecolor: display.linecolor ?? "000000",
                displayname: display.displayname ?? "",
                minimumwait: display.minimumwait ?? 0,
                displayclock: display.displayclock ?? true,
                limit: display.limit ?? 0,

                vehicles: vehicles
            };

            r.responseCode = 200;
            r.contentType = "application/json";
            r.responseBody = JSON.stringify(displayObject);
        }
        else {
            r.responseCode = 500;
            r.contentType = "text/plain";
            r.contentBody = "Invalid JSON structure";
        }
    }
    catch(error) {
        console.error(error.message);

        r.responseCode = 200;
        r.contentType = "text/plain";
        r.responseBody = error.message;
    }


    return r;
};


/**
 * 
 * @param {Http.IncomingMessage} request HTTP Request
 * @param {ParsedUrlQuery} params Query object that contains GET parameters
 * @returns {GeneratedResponse}
 */
exports.displays = function(request, params) {
    let r = new GeneratedResponse();
    let displays = {};

    for(let dis in Config) {
        if(dis != "general") {
            displays[dis] = Config[dis];
        }
    }

    r.responseCode = 200;
    r.contentType = "application/json";
    r.responseBody = JSON.stringify(displays);

    return r;
};