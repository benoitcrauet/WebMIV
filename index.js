const Config = require("./config.js");
const Package = require("./package.json");
const Http = require("http");
const Url = require("url");
const FS = require("fs");
const Path = require("path");
const Mime = require("mime");
const GeneratedResponse = require("./models/GeneratedResponse.js");



let welcomeText = "MyMIV "+Package.version;
console.log("+" + "-".repeat(welcomeText.length + 2) + "+");
console.log("| " + welcomeText + " |");
console.log("+" + "-".repeat(welcomeText.length + 2) + "+");
console.log(" ");


const HttpServer = Http.createServer(function(request, response) {
    // Extracting query values
    var parsedUrl = Url.parse(request.url, true);
    const queryObject = parsedUrl.query;
    const requestedUrl = request.url.split('?')[0] ?? "";

    console.log("Requested "+requestedUrl);
    console.log(queryObject);
    console.log(" ");

    // Making path
    let filePath = Path.join(__dirname, 'htdocs', requestedUrl).replace(/\\/g, "/");
    
    // If filePath is a generated file
    if(requestedUrl.substring(0, "/generated/".length) == "/generated/")
    {
        // Get the filename
        var filename = Path.basename(requestedUrl);

        // Include generated functions file
        const Generated = require("./generated.js");
        
        if(Generated[filename] !== undefined) {
            // Function is found

            // Execute generated content
            var content = Generated[filename](request, queryObject);
            
            // Is function a valid response?
            if(content instanceof GeneratedResponse) {
                // Return response from function
                response.statusCode = content.responseCode;
                response.setHeader('Content-Type', content.contentType);
                response.end(content.responseBody);
            }
            else {
                // Return 500 error code
                response.statusCode = 500;
                response.end('Internal error: invalid generated content');
            }
        }
        else {
            // File doesn't exist
            response.statusCode = 404;
            response.end('File not found');
        }

        
    }
    else
    {
        // Is requested URL index?
        if(filePath.substring(filePath.length-1) == "/")
        // Add index.html
        filePath += "index.html";

        // Does the file exists?
        FS.access(filePath, FS.constants.F_OK, (err) => {
            if (err) {
                // File doesn't exist
                response.statusCode = 404;
                response.end('File not found');
            } else {
                // File exists. Trying to read.
                FS.readFile(filePath, (err, data) => {
                    if (err) {
                        // Unable to read: error
                        response.statusCode = 500;
                        response.end('Internal server error');
                    } else {
                        // Readable, return content and get mime type
                        const contentType = Mime.getType(filePath);
                        
                        response.setHeader('Content-Type', contentType);
                        response.end(data);
                    }
                });
            }
        });
    }

    
});

HttpServer.listen(Config.general.httpport, () => {
    console.log(`HTTP server is running on port ` + Config.general.httpport);
    console.log(" ");
});
