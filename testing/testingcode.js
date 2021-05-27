const fs = require('fs');

// clean road network
let unvalidLine = ["footway", "service", "steps", "track", "path", "pedestrian", null, "razed", "proposed", "planned", "raceway", "elevator"]
let unvalidLineSet = new Set(unvalidLine)

function cleanRoad(geojsonData, unvalidLine) {
    result = []
    let lines = geojsonData.features
    for (i = 0; i < lines.length; i++) {
        let curLine = lines[i]
        let highwayType = curLine.properties.highway
        if (unvalidLine.has(highwayType)) continue
        curLine.properties = { "highway": highwayType }
        result.push(curLine)
    }
    geojsonData.features = result
}

geoJsonData = null
const roadsPath = "/home/ray/Documents/projects/hotspot/testCode/HotspotCoding/data/ChicagoCity.geojson"
try {
    const data = fs.readFileSync(roadsPath, 'utf8')
    geoJsonData = JSON.parse(data)
    // console.log("parsed: ", parsed.features.length)
} catch (err) {
    console.error(err)
}
// console.log("geoJsonData: ", geoJsonData.features.length)
cleanRoad(geoJsonData, unvalidLineSet)

let geoJsonDataStr = JSON.stringify(geoJsonData);
fs.writeFileSync('ChicagoCity.geojson', geoJsonDataStr);