let Ini = require("ini");
let FS = require("fs");


try
{
    // Reading INI file
    const data = FS.readFileSync("./settings.ini", "utf-8");

    // Parsing INI file
    module.exports = Ini.parse(data);
}
catch (err)
{
    throw new Error("Error while reading INI file.");
}
