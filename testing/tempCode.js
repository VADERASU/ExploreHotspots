require("./index.scss");
const commnonFun = require("../common/common.js");
require("../common/geovtLeaflet.js")
require("../common/ttkWebSocketIO.js")
require("../common/kdeRenderer.js")
require("../common/three.min.js")




//global Variable
globalV = {}
globalV["paras"] = [null, null, null, null, null, null]
globalV["fourMethods"] = {
	"SuperLevel": 0,
	"LeafComponent": 1,
	"CrownComponent": 2,
	"MorseComplex": 3
}
globalV["pairs"] = null
globalV["persistanceThreshold"] = 0
globalV["curveView"] = {}
globalV["curveView"]["xscale"] = null
globalV["curveView"]["curveData"] = null
globalV["diagramView"] = {}
globalV["diagramView"]["yscale"] = null
globalV["diagramView"]["xMaxPoint"] = null
globalV["filteredOutIndex"] = new Set()
globalV["branchIDParent_crownfilter"] = null
globalV["branchIDParent_levelfilter"] = null
globalV["categeryMap"] = null


// local variable
let colorMap = new Uint8Array([
	166, 206, 227,
	31, 120, 180,
	178, 223, 138,
	51, 160, 44,
	251, 154, 153,
	227, 26, 28,
	253, 191, 111,
	255, 127, 0,
	202, 178, 214,
	106, 61, 154,
	255, 255, 153,
	177, 89, 40
]);
let modulo = 12
let highlightStrokeWidth = 8
let strokeWidth = 4
let circleR = 4
let highlightCircleR = 6
let width4CrownRect = 10
let centerLatLong = [41.77269, -87.61115]
let abbrevMap = {
	"FOURCORNERHUSTLERS": "Four Corner Hustlers",
	"GANGSTERDISCIPLES": "GANGSTER DISCIPLES",
	"TWOSIX": "TWO SIX",
	"BLACKPSTONES": "BLACK P STONES",
	"SPANISHVICELORDS": "SPANISH VICE LORDS",
	"BLACKDISCIPLES": "BLACK DISCIPLES",
	"BLACKGANGSTERS": "BLACK GANGSTERS",
	"NA": "NA",
	"NEWBREED": "NEW BREED",
	"AMBROSE": "AMBROSE",
	"LATINDRAGONS": "LATIN DRAGONS",
	"BLACKSOULS": "BLACK SOULS",
	"LATINSAINTS": "LATIN SAINTS",
	"VICELORDS": "VICE LORDS",
	"MICKEYCOBRAS": "MICKEY COBRAS",
	"SATANDISCIPLES": "SATAN DISCIPLES",
	"CICEROINSANEVICELORDS": "CICERO INSANE VICE LORDS",
	"EBONYVICELORDS": "EBONY VICE LORDS",
	"LATINKINGS": "LATIN KINGS",
	"TRAVELINGVICELORDS": "TRAVELING VICE LORDS",
	"MAFIAINSANEVICELORDS": "MAFIA INSANE VICE LORDS",
	"KRAZYGETDOWNBOYS": "KRAZY GETDOWN BOYS",
	"CONSERVATIVEVICELORDS": "CONSERVATIVE VICE LORDS",
	"RENEGADEVICELORDS": "RENEGADE VICE LORDS",
	"SPANISHCOBRAS": "SPANISH COBRAS",
	"SPANISHGANGSTERDISCIPLES": "SPANISH GANGSTER DISCIPLES",
	"IMPERIALGANGSTERS": "IMPERIAL GANGSTERS",
	"UNDERTAKERVICELORDS": "UNDERTAKER VICE LORDS",
	"LATINCOUNTS": "LATIN COUNTS",
	"UNKNOWNVICELORDS": "UNKNOWN VICE LORDS",
	"INSANEDEUCES": "INSANE DEUCES",
	"INSANEUNKNOWNS": "INSANE UNKNOWNS",
	"MANIACLATINDISCIPLES": "MANIAC LATIN DISCIPLES",
	"LARAZA": "LA RAZA",
	"SPANISHLORDS": "SPANISH LORDS",
	"LATINJIVERS": "LATIN JIVERS",
	"ELRUKNS": "EL RUKNS",
	"12THSTREETPLAYERS": "12TH STREET PLAYERS",
	"INSANEPOPES": "INSANE POPES",
	"GANGSTERSTONES": "GANGSTER STONES",
	"IMPERIALINSANEVICELORDS": "IMPERIAL INSANE VICE LORDS",
	"BLOODS": "BLOODS",
	"LATINOSOUTOFCONTROL": "LATINOS OUT OF CONTROL",
	"SINCITYBOYS": "SIN CITY BOYS",
	"LAFAMILIASTONES": "LA FAMILIA STONES",
	"SURENO13": "SURENO 13",
	"SIMONCITYROYALS": "SIMON CITY ROYALS",
	"Y.L.O.DISCIPLES": "Y.L.O. DISCIPLES",
	"INSANEDRAGONS": "INSANE DRAGONS",
	"TITANICPSTONES": "TITANIC P STONES",
	"GAYLORDS": "GAYLORDS",
	"ORCHESTRAALBANY": "ORCHESTRA ALBANY",
	"WOLCOTTBOYS": "WOLCOTT BOYS",
	"HARRISONGENTS": "HARRISON GENTS",
	"MANIACCAMPBELLBOYS": "MANIAC CAMPBELL BOYS",
	"ASHLANDVIKINGS": "ASHLAND VIKINGS",
	"BISHOPS": "BISHOPS",
	"PARTYPEOPLE": "PARTY PEOPLE",
	"LATINEAGLES": "LATIN EAGLES",
	"LATINBROTHERSORGANIZATION": "LATIN BROTHERS ORGANIZATION",
	"LATINSOULS": "LATIN SOULS",
	"ALMIGHTYPOPES": "ALMIGHTY POPES",
	"MORGANBOYS": "MORGAN BOYS",
	"RACINEBOYS": "RACINE BOYS"
}



/*************************add the base map of leaflet*******************/
var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

let map = L.map("mapView", {
	center: centerLatLong,
	zoom: 10
});


// add lat and long when mouse move on the map
{
	L.Control.MousePosition = L.Control.extend({
		options: {
			position: 'bottomleft',
			separator: ' : ',
			emptyString: 'Unavailable',
			lngFirst: false,
			numDigits: 5,
			lngFormatter: undefined,
			latFormatter: undefined,
			prefix: ""
		},

		onAdd: function (map) {
			this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
			L.DomEvent.disableClickPropagation(this._container);
			map.on('mousemove', this._onMouseMove, this);
			this._container.innerHTML = this.options.emptyString;
			// console.log("I can work mousemove");
			return this._container;
		},

		onRemove: function (map) {
			map.off('mousemove', this._onMouseMove)
		},

		_onMouseMove: function (e) {
			var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
			var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
			var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
			var prefixAndValue = this.options.prefix + ' ' + value;
			this._container.innerHTML = prefixAndValue;
		}

	});

	L.Map.mergeOptions({
		positionControl: false
	});

	L.Map.addInitHook(function () {
		if (this.options.positionControl) {
			this.positionControl = new L.Control.MousePosition();
			this.addControl(this.positionControl);
		}
	});

	L.control.mousePosition = function (options) {
		return new L.Control.MousePosition(options);
	};
	L.control.mousePosition().addTo(map);
}

// map.invalidateSize()

Stadia_AlidadeSmooth.addTo(map);

const kdeRenderer = new KDERenderer(map);

let tooltip = d3.select("body")
	.append("div")
	.style("opacity", 0)
	.attr("class", "tooltip")
	.style("background-color", "white")
	.style("border", "solid")
	.style("border-width", "2px")
	.style("border-radius", "5px")
	.style("padding", "5px")

var slider = document.getElementById("myRange")
d3.select(".slidecontainer")
	.append("text")
	.attr("class", "text4range")
	.html(" " + slider.value)

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
	d3.select(".text4range").html(" " + this.value)
	// update the exiting pie on the map
	d3.select(".leaflet-pane.leaflet-overlay-pane").selectAll('svg')
		.each(function () {
			let piesvgname = d3.select(this).attr('class')
			// console.log("piesvgname: ", piesvgname)
			let branchId = piesvgname.slice(13)
			let cur = globalV["brachID2distribution"][branchId]
			showPie(cur[0],
				cur[1],
				cur[2],
				'pieDiv' + branchId)

		});

}

/***********************fill the configuration and some basic functions *****************/


/********************************general function************************************/
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
	const hex = x.toString(16)
	return hex.length === 1 ? '0' + hex : hex
}).join('')

function updatemask(svg, poly) {
	let mask = svg.selectAll("polygon")
		.data([poly])

	mask.enter()
		.append("polygon")
		.merge(mask)
		.attr("points", function (d) {
			return d.map(function (d) {
				return d.join(",");
			}).join(" ");
		})

	mask.exit().remove();
}

function getPair(objects) {
	const tree = objects[0];

	const vertexIds = tree.fieldData.VertexId.data;
	const pairIds = tree.fieldData.PairId.data;
	const scalar = tree.pointData.KDE.data;
	const branchid = objects[0].fieldData.BranchId.data

	const pairs = [];
	for (let i = 0; i < pairIds.length; i++) {
		let p1 = i
		let p2 = pairIds[i]
		let kde1 = scalar[vertexIds[p1]]
		let kde2 = scalar[vertexIds[p2]]
		if (kde1 >= kde2) {
			pairs.push([
				[kde2, kde1, branchid[i]],
				[kde2, kde2, branchid[pairIds[i]]]
			])
		}
	}

	// console.log("pairs: ", pairs);
	return pairs
}

function drawDiagram(pairs) {
	let diagramDiv = d3.select("#diagramDiv")
	//clean the previous one
	diagramDiv.selectAll('svg').remove();

	let divW = diagramDiv.node().getBoundingClientRect().width
	let divH = diagramDiv.node().getBoundingClientRect().height
	// set the dimensions and margins of the graph
	let margin = { top: 10, right: 30, bottom: 90, left: 60 },
		width = divW - margin.left - margin.right,
		height = divH - margin.top - margin.bottom;

	let xMax = d3.max(pairs, (d) => d[0][0])
	let yMax = d3.max(pairs, (d) => d[0][1])

	// append the svg object to the body of the page
	let svg = diagramDiv
		.append("svg")
		.attr("class", "svg4diagram")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");


	let xScale = d3.scaleLinear()
		.domain([0, xMax + 0.5 * xMax / pairs.length])
		.range([0, width]);

	let yScale = d3.scaleLinear()
		.domain([0, yMax + 0.5 * yMax / pairs.length])
		.range([height, 0]);

	globalV["diagramView"]["yscale"] = yScale
	globalV["diagramView"]["xscale"] = xScale

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).tickFormat(d3.format(".2")));

	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale).tickFormat(d3.format(".2")));

	// text label for the x axis
	svg.append("text")
		.attr("transform",
			"translate(" + (width / 2) + " ," +
			(height + margin.top + 20) + ")")
		.style("text-anchor", "middle")
		.text("Density");


	// text label for the y axis
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Density");


	// draw the line
	svg.append("line")
		.attr("x1", xScale(0))
		.attr("y1", yScale(0))
		.attr("x2", xScale(xMax + 0.5 * xMax / pairs.length))
		.attr("y2", yScale(xMax + 0.5 * xMax / pairs.length))
		.attr("stroke-width", 1)
		.attr("stroke", "gray");



	// creat the smaller circle in svg
	svg.selectAll(".smallerC")
		.data(pairs)
		.enter()
		.append("circle")
		.attr("class", "smallerC")
		.attr("cx", d => xScale(d[0][0]))
		.attr("cy", d => yScale(d[0][0]))
		.attr("r", circleR / 4)
		.style("fill", "black");

	// creat the bigger circle in svg
	svg.selectAll(".biggerC")
		.data(pairs)
		.enter()
		.append("circle")
		.attr("class", "biggerC")
		.attr("id", (d, i) => "biggerC" + i)
		.attr("cx", d => xScale(d[0][0]))
		.attr("cy", d => yScale(d[0][1]))
		.attr("r", circleR)
		.style("fill", d => {
			// if color by brachid
			let colorId = d[0][2] % modulo
			// if color by ith cat for the branchid
			if ($('#catColorRadio').is(':checked')) {
				let ith = d3.select('#ithCat').node().value
				let catId2color = globalV["brachID2distribution"][d[0][2]][0][ith][0]
				colorId = catId2color % modulo
			}
			return rgbToHex(colorMap[colorId * 3],
				colorMap[colorId * 3 + 1],
				colorMap[colorId * 3 + 2])
		});

	// draw the line between the two points
	svg.selectAll(".connectline")
		.data(pairs)
		.enter()
		.append("line")
		.attr("class", "connectline")
		.attr("id", (d, i) => "connectlineID" + i)
		.attr("x1", d => xScale(d[0][0]))
		.attr("y1", d => yScale(d[0][1]))
		.attr("x2", d => xScale(d[0][0]))
		.attr("y2", d => yScale(d[0][0]))
		.attr("stroke-width", strokeWidth)
		.attr("stroke", d => {
			let colorId = d[0][2] % modulo
			// if color by ith cat for the branchid
			if ($('#catColorRadio').is(':checked')) {
				let ith = d3.select('#ithCat').node().value
				let catId2color = globalV["brachID2distribution"][d[0][2]][0][ith][0]
				colorId = catId2color % modulo
			}
			return rgbToHex(colorMap[colorId * 3],
				colorMap[colorId * 3 + 1],
				colorMap[colorId * 3 + 2])
		})
		.on("mouseover", function (d, i) {
			// console.log("branchID: ", d3.select(this).attr("id").slice(13) )
			let indexid = d3.select(this).attr("id").slice(13)
			// console.log("branchIDL ", pairs[indexid], pairs[indexid][0][2])
			d3.select(this)
				.attr("stroke-width", highlightStrokeWidth)
				.style("stroke-opacity", 0.8)
			svg.select("#biggerC" + i)
				.attr("r", highlightCircleR)

			// also highlight the pair in the mergeTree view
			d3.select("#mergeTreeDiv").select("#arcLineID" + i)
				.attr("stroke-width", highlightStrokeWidth)

			d3.select("#mergeTreeDiv").select("#biggerCID" + i)
				.attr("r", highlightCircleR)

			// hover the corresponding hotspot
			let defaultFirst = $("#firstDropDown :selected").index()
			let defaultSecond = $("#secondDropDown :selected").index()
			let defaultOpacity = d3.select("#opacity").node().value
			let defaultContours = d3.select("#contours").node().value

			kdeRenderer.render(defaultFirst, defaultSecond, defaultOpacity, defaultContours, 1, pairs[indexid][0][2]);
		})
		.on("mouseout", function (d, i) {
			d3.select(this)
				.attr("stroke-width", strokeWidth)
				.style("stroke-opacity", 1)
			svg.select("#biggerC" + i)
				.attr("r", circleR)

			// also highlight the pair in the mergeTree view
			d3.select("#mergeTreeDiv").select("#arcLineID" + i)
				.attr("stroke-width", strokeWidth)

			d3.select("#mergeTreeDiv").select("#biggerCID" + i)
				.attr("r", circleR)

			// after the filter, always make the filter line for rect on the top of svg
			d3.select("#line4crownRectID" + i).raise();

			// unhover the corresponding hotspot
			let defaultFirst = $("#firstDropDown :selected").index()
			let defaultSecond = $("#secondDropDown :selected").index()
			let defaultOpacity = d3.select("#opacity").node().value
			let defaultContours = d3.select("#contours").node().value

			kdeRenderer.render(defaultFirst, defaultSecond, defaultOpacity, defaultContours, 1, -1);


		})
		.on("click", function (d, i) {
			let indexid = d3.select(this).attr("id").slice(13)
			let branchid = pairs[indexid][0][2]
			// display the gangdistribution on the map
			if (d3.select('.pieSvg4pieDiv' + branchid).node()) {
				//remove the pie chart
				d3.select('.pieSvg4pieDiv' + branchid).remove()
			} else {
				// add the pie chart
				displayDistribution(branchid)
			}
		})
	// draw the filtering line
	// add tooltip for the filtering
	let tooltip = svg
		.append("text")
		.attr("class", "tooltip4filtering")
		.attr("transform",
			"translate(" + (width / 2) + " ," +
			(margin.top + 1) + ")")
		.style("text-anchor", "middle")
		.text("Persistence Threshold: 0")

	let xMaxPoint = xMax + 0.5 * xMax / pairs.length
	globalV["diagramView"]["xMaxPoint"] = xMaxPoint
	svg.append("line")
		.attr("class", "filteringline")
		.attr("x1", xScale(0))
		.attr("y1", yScale(0))
		.attr("x2", xScale(xMaxPoint))
		.attr("y2", yScale(xMaxPoint))
		.attr("stroke-width", 4)
		.attr("stroke", "#94989c")
		.call(d3.drag()
			.on("drag", function () {
				if (yScale.invert(d3.mouse(this)[1]) >= xScale.invert(d3.mouse(this)[0])) {
					let y1V = d3.mouse(this)[1] + (yScale(0) - yScale(xScale.invert(d3.mouse(this)[0])))
					let y2V = d3.mouse(this)[1] - (yScale(xScale.invert(d3.mouse(this)[0])) - yScale(xMaxPoint))
					d3.select(this)
						.attr('y1', y1V)
						.attr('y2', y2V);

					globalV["persistanceThreshold"] = yScale.invert(d3.mouse(this)[1]) - xScale.invert(d3.mouse(this)[0])
					tooltip
						.html("Persistence Threshold: " + globalV["persistanceThreshold"])

					//add mask for filtering
					let poly = [
						[xScale(0), yScale(0)],
						[xScale(0) + 2, y1V],
						[xScale(xMaxPoint) + 2, y2V],
						[xScale(xMaxPoint), yScale(xMaxPoint)]
					];
					updatemask(svg, poly)

					// move the filtering line in Curve view.
					d3.select("#curveDiv").select(".filteringline")
						.attr('x1', globalV["curveView"]["xscale"](globalV["persistanceThreshold"]))
						.attr('x2', globalV["curveView"]["xscale"](globalV["persistanceThreshold"]));

					let bisect = d3.bisector(function (d) { return d[0]; }).left;
					let i = bisect(globalV["curveView"]["curveData"], globalV["persistanceThreshold"], 1) - 1;
					selectedData = globalV["curveView"]["curveData"][i]

					d3.select("#curveDiv").select(".tooltip4filtering")
						.html("Number of filtered hotspots: " + selectedData[1])

					//// update the mask for the curve view
					d3.select("#curveDiv").select(".maskRect").attr("width", globalV["curveView"]["xscale"](globalV["persistanceThreshold"]))

					// Get the filtered out pairs and transparent the branches in the merge tree view
					globalV["filteredOutIndex"].clear();
					for (let index = 0; index < pairs.length; index++) {
						const pair = pairs[index];
						let curPS = pair[0][1] - pair[0][0]
						if (curPS < globalV["persistanceThreshold"]) {
							globalV["filteredOutIndex"].add(index)
							d3.select("#arcLineID" + index).style("stroke-opacity", 0.1)
							d3.select("#biggerCID" + index).style("fill-opacity", 0.1)
							d3.select("#arcLineID" + index).style('pointer-events', 'none');
							d3.select("#biggerCID" + index).style('pointer-events', 'none');

							if (d3.select("#crownRectID" + index)) {
								d3.select("#crownRectID" + index).style("fill", "none")
								d3.select("#line4crownRectID" + index).style("stroke-opacity", 0)
								d3.select("#line4crownRectID" + index).style('pointer-events', 'none');
							}

						} else {
							d3.select("#arcLineID" + index).style("stroke-opacity", 1)
							d3.select("#biggerCID" + index).style("fill-opacity", 1)
							d3.select("#arcLineID" + index).style('pointer-events', "auto");
							d3.select("#biggerCID" + index).style('pointer-events', 'auto');
							if (d3.select("#crownRectID" + index)) {
								d3.select("#crownRectID" + index).style("fill", "gray")
								d3.select("#line4crownRectID" + index).style("stroke-opacity", 1)
								d3.select("#line4crownRectID" + index).style('pointer-events', 'auto');
							}
						}

					}

					// send the udpated persistence threshold to ttk
					//// case2, just update the may layers based on the filtered result
					const vtkObject = new TTK.vtkDataSet("vtkUnstructuredGrid")
					vtkObject.fieldData.caseType = new TTK.vtkArray("caseType", 1, 1, TTK.CONSTS.VTK_INT, [2])
					vtkObject.fieldData.persistanceThreshold = new TTK.vtkArray("persistanceThreshold", 1, 1, TTK.CONSTS.VTK_DOUBLE, [globalV["persistanceThreshold"]])
					sendDatatoTTK.sendVTKDataSet(vtkObject)

				}

			})
		)


	// add mask

	let poly = [
		[xScale(0), yScale(0)],
		[xScale(xMaxPoint), yScale(xMaxPoint)]
	];
	updatemask(svg, poly)
}

function drawCurve(pairs) {
	let curveData = [[0, pairs.length]]
	let persistancesSet = new Set()
	for (let index = 0; index < pairs.length; index++) {
		const element = pairs[index];
		persistancesSet.add(element[0][1] - element[0][0])

	}
	let persistances = Array.from(persistancesSet);
	persistances.sort(function (a, b) { return a - b });
	// console.log("persistances: ", persistances)

	let sourcedata = pairs
	for (let i = 0; i < persistances.length; i++) {
		const curPersis = persistances[i];
		let filtered = sourcedata.filter(twoPoints => twoPoints[0][1] - twoPoints[0][0] > curPersis);
		curveData.push([curPersis, filtered.length])
		sourcedata = filtered
	}
	// console.log("curveData: ", curveData)
	globalV["curveView"]["curveData"] = curveData


	let diagramDiv = d3.select("#curveDiv")
	//clean
	diagramDiv.selectAll('svg').remove();

	let divW = diagramDiv.node().getBoundingClientRect().width
	let divH = diagramDiv.node().getBoundingClientRect().height
	// set the dimensions and margins of the graph
	let margin = { top: 5, right: 40, bottom: 95, left: 60 },
		width = divW - margin.left - margin.right,
		height = divH - margin.top - margin.bottom;

	let xMax = persistances.slice(-1)[0]
	let yMax = d3.max(curveData, (d) => d[1])

	// append the svg object to the body of the page
	let svg = diagramDiv
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	let xScale = d3.scaleLinear()
		.domain([0, xMax + 0.5 * xMax / persistances.length])
		.range([0, width]);

	globalV["curveView"]["xscale"] = xScale

	let yScale = d3.scaleLinear()
		.domain([0, yMax + 0.5 * yMax / persistances.length])
		.range([height, 0]);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).tickFormat(d3.format(".2")));

	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale));

	// text label for the x axis
	svg.append("text")
		.attr("transform",
			"translate(" + (width / 2) + " ," +
			(height + margin.top + 30) + ")")
		.style("text-anchor", "middle")
		.text("Persistence Threshold");


	// text label for the y axis
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Number of filtered hotspots");



	let line = d3.line()
		.x(d => xScale(d[0]))
		.y(d => yScale(d[1]))

	// create new curveData for drawing the special line chart
	let newCurveData = []
	for (let i = 0; i < curveData.length - 1; i++) {
		let p1 = curveData[i]
		let p2 = curveData[i + 1]
		let p3 = [p2[0], p1[1]]
		newCurveData.push(p1)
		newCurveData.push(p3)
		newCurveData.push(p2)

	}

	svg.append("path")
		.datum(newCurveData)
		.attr("class", "line")
		.attr("d", line)
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("stroke-width", 2)

	let bisect = d3.bisector(function (d) { return d[0]; }).left;
	let y2origin = yMax + 0.5 * yMax / persistances.length
	svg.append("line")
		.attr("class", "filteringline")
		.attr("x1", xScale(0))
		.attr("y1", yScale(0))
		.attr("x2", xScale(0))
		.attr("y2", yScale(y2origin))
		.attr("stroke-width", 4)
		.attr("stroke", "#94989c")
		.call(d3.drag()
			.on("drag", function (e) {
				if (xScale.invert(d3.mouse(this)[0]) >= 0 && xScale.invert(d3.mouse(this)[0]) <= xMax + 0.5 * xMax / persistances.length) {
					d3.select(this)
						.attr('x1', d3.mouse(this)[0])
						.attr('x2', d3.mouse(this)[0]);

					var x0 = xScale.invert(d3.mouse(this)[0]);
					var i = bisect(curveData, x0, 1) - 1;
					selectedData = curveData[i]
					console.log()

					tooltip
						.html("Number of filtered hotspots: " + selectedData[1])
					// add mask to filtering
					mask.attr("width", xScale(x0))

					// filtering the line in the diagram
					d3.select("#diagramDiv").select(".filteringline")
						.attr('y1', globalV["diagramView"]["yscale"](x0))
						.attr('y2', globalV["diagramView"]["yscale"](globalV["diagramView"]["xMaxPoint"] + x0));

					globalV["persistanceThreshold"] = x0
					d3.select("#diagramDiv").select(".tooltip4filtering")
						.html("Persistence Threshold: " + globalV["persistanceThreshold"])

					// update the mask in diagram view
					let poly = [
						[globalV["diagramView"]["xscale"](0), globalV["diagramView"]["yscale"](0)],
						[globalV["diagramView"]["xscale"](0) + 2, globalV["diagramView"]["yscale"](x0)],
						[globalV["diagramView"]["xscale"](globalV["diagramView"]["xMaxPoint"]) + 2, globalV["diagramView"]["yscale"](globalV["diagramView"]["xMaxPoint"] + x0)],
						[globalV["diagramView"]["xscale"](globalV["diagramView"]["xMaxPoint"]), globalV["diagramView"]["yscale"](globalV["diagramView"]["xMaxPoint"])]
					];
					updatemask(d3.select("#diagramDiv").select("svg"), poly)

					// Get the filtered out pairs and transparent the branches in the merge tree view
					globalV["filteredOutIndex"].clear();
					for (let index = 0; index < pairs.length; index++) {
						const pair = pairs[index];
						let curPS = pair[0][1] - pair[0][0]
						if (curPS < globalV["persistanceThreshold"]) {
							globalV["filteredOutIndex"].add(index)
							d3.select("#arcLineID" + index).style("stroke-opacity", 0.1)
							d3.select("#biggerCID" + index).style("fill-opacity", 0.1)
							d3.select("#arcLineID" + index).style('pointer-events', 'none');
							d3.select("#biggerCID" + index).style('pointer-events', 'none');

							if (d3.select("#crownRectID" + index)) {
								d3.select("#crownRectID" + index).style("fill", "none")
								d3.select("#line4crownRectID" + index).style("stroke-opacity", 0)
								d3.select("#line4crownRectID" + index).style('pointer-events', 'none');
							}

						} else {
							d3.select("#arcLineID" + index).style("stroke-opacity", 1)
							d3.select("#biggerCID" + index).style("fill-opacity", 1)
							d3.select("#arcLineID" + index).style('pointer-events', "auto");
							d3.select("#biggerCID" + index).style('pointer-events', 'auto');
							if (d3.select("#crownRectID" + index)) {
								d3.select("#crownRectID" + index).style("fill", "gray")
								d3.select("#line4crownRectID" + index).style("stroke-opacity", 1)
								d3.select("#line4crownRectID" + index).style('pointer-events', 'auto');
							}
						}

					}


					// send the updated ps to ttk
					//// case2, just update the may layers based on the filtered result
					const vtkObject = new TTK.vtkDataSet("vtkUnstructuredGrid")
					vtkObject.fieldData.caseType = new TTK.vtkArray("caseType", 1, 1, TTK.CONSTS.VTK_INT, [2])
					vtkObject.fieldData.persistanceThreshold = new TTK.vtkArray("persistanceThreshold", 1, 1, TTK.CONSTS.VTK_DOUBLE, [globalV["persistanceThreshold"]])
					sendDatatoTTK.sendVTKDataSet(vtkObject)
				}

				// always put the filter line to the top of the layer
				d3.select(this).raise();

			})
		)

	// draw the filtering line
	// add tooltip for the filtering
	let tooltip = svg
		.append("text")
		.attr("class", "tooltip4filtering")
		.attr("transform",
			"translate(" + (width / 2) + " ," +
			(margin.top + 5) + ")")
		.style("text-anchor", "middle")
		.text("Number of filtered hotspots: " + curveData[0][1])

	// add filter mask for the line chart
	let mask = svg.append("rect")
		.attr("class", "maskRect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 0)
		.attr("height", yScale(0))
		.style("fill", "gray")
		.attr("fill-opacity", 0.3)


}

function rendermapLayer(objects) {
	kdeRenderer.setVtkDataSet(objects[0]);
	//create options for the first layer and second layer for the 4 methods
	// 0. superlevel 1. leaf component 2. crown component 3. morse complex
	let defaultFirst = $("#firstDropDown :selected").index()
	let defaultSecond = $("#secondDropDown :selected").index()
	let defaultOpacity = d3.select("#opacity").node().value
	let defaultContours = d3.select("#contours").node().value

	kdeRenderer.render(defaultFirst, defaultSecond, defaultOpacity, defaultContours, 1, -1);

	$('#firstDropDown').on('change', (event) => {
		let firstV = globalV["fourMethods"][event.target.value]
		let secondV = $("#secondDropDown :selected").index()
		let curOpa = d3.select("#opacity").node().value
		let curContours = d3.select("#contours").node().value
		kdeRenderer.render(firstV, secondV, curOpa, curContours, 1, -1);
	});

	$('#secondDropDown').on('change', (event) => {
		// console.log(event.target.value);
		let firstV = $("#firstDropDown :selected").index()
		let secondV = globalV["fourMethods"][event.target.value]
		let curOpa = d3.select("#opacity").node().value
		let curContours = d3.select("#contours").node().value
		kdeRenderer.render(firstV, secondV, curOpa, curContours, 1, -1);
	});

	$('#opacity').on('change', (event) => {
		let firstV = $("#firstDropDown :selected").index()
		let secondV = $("#secondDropDown :selected").index()
		let curContours = d3.select("#contours").node().value
		kdeRenderer.render(firstV, secondV, event.target.value, curContours, 1, -1);
	});

	$('#contours').on('change', (event) => {
		let firstV = $("#firstDropDown :selected").index()
		let secondV = $("#secondDropDown :selected").index()
		let curOpa = d3.select("#opacity").node().value
		kdeRenderer.render(firstV, secondV, curOpa, event.target.value, 1, -1);
	});

}

function getData4mergetree(objects) {
	let layout = objects[0].fieldData.Layout.data
	let pairs = objects[0].fieldData.PairId.data
	let branchid = objects[0].fieldData.BranchId.data
	let vertexId = objects[0].fieldData.VertexId.data
	let kdeArr = objects[0].pointData.KDE.data
	// console.log("layout ", layout)
	// console.log("pairs ", pairs)
	// console.log("branchid ", branchid)
	// console.log("vertexId ", vertexId)

	let data4mt = []
	let xRange = []
	let yRange = []
	let mainBranchX = null
	for (let i = 0; i < pairs.length; i++) {
		let kde1 = kdeArr[vertexId[i]]
		let kde2 = kdeArr[vertexId[pairs[i]]]
		if (kde1 >= kde2) {
			data4mt.push([
				[layout[i * 2 + 1], kde1, branchid[i]],
				[layout[pairs[i] * 2 + 1], kde2, branchid[pairs[i]]]
			])
			xRange.push(layout[i * 2 + 1])
			xRange.push(layout[pairs[i] * 2 + 1])
			yRange.push(kde1)
			yRange.push(kde2)
			if (layout[i * 2 + 1] == layout[pairs[i] * 2 + 1]) {
				mainBranchX = layout[i * 2 + 1]
			}

		}
	}
	return { "data": data4mt, "xRange": d3.extent(xRange), "yRange": d3.extent(yRange), "mainBranchX": mainBranchX }
}

function drawMergeTree(data2draw) {
	let mergeTreeDIV = d3.select("#mergeTreeDiv")
	//clean
	mergeTreeDIV.selectAll('svg').remove();

	let divW = mergeTreeDIV.node().getBoundingClientRect().width
	let divH = mergeTreeDIV.node().getBoundingClientRect().height
	// set the dimensions and margins of the graph
	let margin = { top: 10, right: 30, bottom: 90, left: 60 },
		width = divW - margin.left - margin.right,
		height = divH - margin.top - margin.bottom;

	let extraX = (data2draw.xRange[1] - data2draw.xRange[0]) / 10
	let extraY = (data2draw.yRange[1] - data2draw.yRange[0]) / 20

	// append the svg object to the body of the page
	let svg = mergeTreeDIV
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");


	let xScale = d3.scaleLinear()
		.domain([data2draw.xRange[0] - extraX, data2draw.xRange[1] + extraX])
		.range([0, width]);

	let yScale = d3.scaleLinear()
		.domain([data2draw.yRange[0] - extraY, data2draw.yRange[1] + extraY])
		.range([height, 0]);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale).tickFormat(d3.format(".2")));

	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale).tickFormat(d3.format(".2")));

	// text label for the x axis
	svg.append("text")
		.attr("transform",
			"translate(" + (width / 2) + " ," +
			(height + margin.top + 20) + ")")
		.style("text-anchor", "middle")
		.text("Layout");


	// text label for the y axis
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left + 10)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Density");

	// create the arc leaf of merge three
	svg.selectAll(".arcLine")
		.data(data2draw.data)
		.enter()
		.append("path")
		.attr("class", "arcLine")
		.attr("id", (d, i) => "arcLineID" + i)
		.attr("d", d => {
			let x1 = xScale(d[0][0])
			let x2 = xScale(d[1][0])
			let y1 = yScale(d[0][1])
			let y2 = yScale(d[1][1])
			let x3 = x1
			let y3 = y2

			let path = d3.path()
			path.moveTo(x1, y1);
			path.lineTo(x3, y3);
			path.lineTo(x2, y2);
			return path.toString()
		})
		.attr("stroke-width", strokeWidth)
		.attr("stroke", d => {
			let colorId = d[0][2] % modulo
			// if color by ith cat for the branchid
			if ($('#catColorRadio').is(':checked')) {
				let ith = d3.select('#ithCat').node().value
				let catId2color = globalV["brachID2distribution"][d[0][2]][0][ith][0]
				colorId = catId2color % modulo
			}
			return rgbToHex(colorMap[colorId * 3],
				colorMap[colorId * 3 + 1],
				colorMap[colorId * 3 + 2])
		})
		.style("fill", "none")
		.on("mouseover", function (d, i) {
			// console.log("d and i: ", d, i)
			d3.select(this)
				.attr("stroke-width", highlightStrokeWidth)
				.style("stroke-opacity", 0.8)
			svg.select("#biggerCID" + i)
				.attr("r", highlightCircleR)

			// also highlight the pair in the diagram view
			d3.select("#diagramDiv").select("#connectlineID" + i)
				.attr("stroke-width", highlightStrokeWidth)

			d3.select("#diagramDiv").select("#biggerC" + i)
				.attr("r", highlightCircleR)

			// hover the corresponding hotspot
			let defaultFirst = $("#firstDropDown :selected").index()
			let defaultSecond = $("#secondDropDown :selected").index()
			let defaultOpacity = d3.select("#opacity").node().value
			let defaultContours = d3.select("#contours").node().value

			if ($('#levelRadio').is(':checked')) {
				kdeRenderer.render(defaultFirst, defaultSecond, defaultOpacity, defaultContours, 1, d[0][2]);
			} else {
				kdeRenderer.render(defaultFirst, defaultSecond, defaultOpacity, defaultContours, 1, globalV["branchIDParent_crownfilter"][d[0][2]]);

			}

		})
		.on("mouseout", function (d, i) {
			d3.select(this)
				.attr("stroke-width", strokeWidth)
				.style("stroke-opacity", 1)
			svg.select("#biggerCID" + i)
				.attr("r", circleR)

			// also highlight the pair in the diagram view
			d3.select("#diagramDiv").select("#connectlineID" + i)
				.attr("stroke-width", strokeWidth)

			d3.select("#diagramDiv").select("#biggerC" + i)
				.attr("r", circleR)

			// after the filter, always make the filter line for rect on the top of svg
			d3.select("#line4crownRectID" + i).raise();

			// unhover the corresponding hotspot
			let defaultFirst = $("#firstDropDown :selected").index()
			let defaultSecond = $("#secondDropDown :selected").index()
			let defaultOpacity = d3.select("#opacity").node().value
			let defaultContours = d3.select("#contours").node().value

			kdeRenderer.render(defaultFirst, defaultSecond, defaultOpacity, defaultContours, 1, -1);
		})
		.on("click", function (d, i) {
			let branchid = d[0][2]
			if ($('#crownRadio').is(':checked')) {
				branchid = globalV["branchIDParent_crownfilter"][d[0][2]]
			}

			// display the gangdistribution on the map
			if (d3.select('.pieSvg4pieDiv' + branchid).node()) {
				//remove the pie chart
				d3.select('.pieSvg4pieDiv' + branchid).remove()
			} else {
				// add the pie chart
				displayDistribution(branchid)
			}
		})


	// creat the bigger circle in svg
	svg.selectAll(".biggerC")
		.data(data2draw.data)
		.enter()
		.append("circle")
		.attr("class", "biggerC")
		.attr("id", (d, i) => "biggerCID" + i)
		.attr("cx", d => xScale(d[0][0]))
		.attr("cy", d => yScale(d[0][1]))
		.attr("r", circleR)
		.style("fill", d => {
			if ($('#levelRadio').is(':checked') && d[0][1] < level) {
				return "#c7c8ca"
			}
			let colorId = d[0][2] % modulo
			// if color by ith cat for the branchid
			if ($('#catColorRadio').is(':checked')) {
				let ith = d3.select('#ithCat').node().value
				let catId2color = globalV["brachID2distribution"][d[0][2]][0][ith][0]
				colorId = catId2color % modulo
			}
			return rgbToHex(colorMap[colorId * 3],
				colorMap[colorId * 3 + 1],
				colorMap[colorId * 3 + 2])
		});

	let originx1 = data2draw.xRange[0] - extraX
	let originy1 = data2draw.yRange[0] - extraY
	let originx2 = data2draw.xRange[1] + extraX
	let originy2 = data2draw.yRange[1] + extraY

	// prepare the sorted arr for crown filtering
	//// 1> sort the data2draw.data based on the higher point
	let sortedArcArr = data2draw.data.map((item, index) => {
		item.push(index)
		return item
	})
	sortedArcArr.sort((a, b) => b[0][1] - a[0][1])

	// console.log("sortedArcArr: ", sortedArcArr)
	// two function to draw the filtering by level/crown
	function mergeBranch4crown(crown) {
		// remove all the things on the level filtering
		if (d3.selectAll(".filterLevelLine").node()) {
			d3.selectAll(".filterLevelLine").remove()
		}

		if (d3.selectAll(".crownRect").node()) {
			d3.selectAll(".crownRect").remove()
		}
		// empty the parentsarray
		globalV["branchIDParent_crownfilter"] = new Array(globalV["branchIDParent_crownfilter"].length)

		let coloredSet = new Set()

		//// 2> recursively color the children branches
		for (let index = 0; index < sortedArcArr.length; index++) {
			const arc2drawRect = sortedArcArr[index];
			if (globalV["filteredOutIndex"].has(arc2drawRect[2])) {
				continue
			}
			if (coloredSet.has(arc2drawRect[2])) {
				if (d3.select("#line4crownRectID" + arc2drawRect[2]).node()) {
					d3.select("#line4crownRectID" + arc2drawRect[2]).remove()
				}
				continue
			}

			globalV["branchIDParent_crownfilter"][arc2drawRect[0][2]] = arc2drawRect[0][2]

			let colorId = arc2drawRect[0][2] % modulo
			// if color by ith cat for the branchid
			if ($('#catColorRadio').is(':checked')) {
				let ith = d3.select('#ithCat').node().value
				let catId2color = globalV["brachID2distribution"][arc2drawRect[0][2]][0][ith][0]
				colorId = catId2color % modulo
			}
			let color = rgbToHex(colorMap[colorId * 3],
				colorMap[colorId * 3 + 1],
				colorMap[colorId * 3 + 2])
			let arcHeight = yScale(arc2drawRect[1][1]) - yScale(arc2drawRect[0][1])
			let crownHeight = yScale(arc2drawRect[0][1] - crown) - yScale(arc2drawRect[0][1])
			let rectHeight = Math.min(crownHeight, arcHeight)

			// draw the rect for the crown
			let startX = xScale(arc2drawRect[0][0]) - width4CrownRect / 2
			let startY = yScale(arc2drawRect[0][1])
			svg.append("rect")
				.attr("class", "crownRect")
				.attr("id", "crownRectID" + arc2drawRect[2])
				.attr("x", startX)
				.attr("y", startY)
				.attr("width", width4CrownRect)
				.attr("height", rectHeight)
				.style("fill", "gray")
				.attr("fill-opacity", 0.3)

			if (d3.select("#line4crownRectID" + arc2drawRect[2]).node()) {
				d3.select("#line4crownRectID" + arc2drawRect[2])
					.attr("y1", startY + rectHeight)
					.attr("y2", startY + rectHeight)
			} else {
				svg.append("line")
					.attr("class", "line4crownRect")
					.attr("id", "line4crownRectID" + arc2drawRect[2])
					.attr("x1", startX)
					.attr("y1", startY + rectHeight)
					.attr("x2", startX + width4CrownRect)
					.attr("y2", startY + rectHeight)
					.attr("stroke-width", 4)
					.attr("stroke", "gray")
					.call(d3.drag()
						.on("drag", function () {
							d3.select(this).raise();
							if (d3.mouse(this)[1] >= startY && d3.mouse(this)[1] <= yScale(arc2drawRect[1][1])) {
								let height4rectMask = d3.mouse(this)[1] - startY
								d3.selectAll(".crownRect").each(function () {
									let id4pair = parseInt((d3.select(this).attr("id").slice(11)))
									let longestHeight = yScale(data2draw.data[id4pair][1][1]) - yScale(data2draw.data[id4pair][0][1])
									let validHeight = Math.min(longestHeight, height4rectMask)
									d3.select(this)
										.attr("height", validHeight)
								})
								d3.selectAll(".line4crownRect").each(function () {
									let id4pair = parseInt((d3.select(this).attr("id").slice(16)))
									let curY = yScale(data2draw.data[id4pair][0][1]) + height4rectMask
									let longestY = yScale(data2draw.data[id4pair][1][1])
									let validY = Math.min(curY, longestY)
									d3.select(this)
										.attr('y1', validY)
										.attr('y2', validY)
								})
								// update the mergered branches
								let udpatedCrown = yScale.invert(startY) - yScale.invert(d3.mouse(this)[1])

								$("#crown").val(udpatedCrown)
								mergeBranch4crown(udpatedCrown)

								//// this is case3, only change the level and crown
								let curlevel = d3.select("#level").node().value
								const vtkObject = new TTK.vtkDataSet("vtkUnstructuredGrid")
								vtkObject.fieldData.caseType = new TTK.vtkArray("caseType", 1, 1, TTK.CONSTS.VTK_INT, [3])
								vtkObject.fieldData.level = new TTK.vtkArray("level", 1, 1, TTK.CONSTS.VTK_DOUBLE, [curlevel])
								vtkObject.fieldData.crown = new TTK.vtkArray("crown", 1, 1, TTK.CONSTS.VTK_DOUBLE, [udpatedCrown])
								sendDatatoTTK.sendVTKDataSet(vtkObject)
							}
						}))
			}

			colorBranches(arc2drawRect, coloredSet, sortedArcArr, color, arc2drawRect[0][2])
		}

		function colorBranches(arc2drawRect, coloredSet, sortedArcArr, color, branchID) {
			if (globalV["filteredOutIndex"].has(arc2drawRect[2])) {
				return
			}
			coloredSet.add(arc2drawRect[2])
			let lowDensity = Math.max(arc2drawRect[0][1] - crown, arc2drawRect[1][1])

			// color the arc2drawRect line
			d3.select("#arcLineID" + arc2drawRect[2])
				.attr("stroke", color)
			// color the arc2drawRect biggerCircle
			d3.select("#biggerCID" + arc2drawRect[2])
				.style("fill", color)

			// find all the arcs covered by the main branch
			let arc2color = sortedArcArr.filter(item => {
				if (globalV["filteredOutIndex"].has(item[2])) return false
				if (coloredSet.has(item[2])) return false
				if (item[1][0] != arc2drawRect[0][0]) return false
				if (item[1][1] < lowDensity) return false
				if (item[1][1] >= arc2drawRect[0][1]) return false
				return true
			})

			// put them to the set and color them
			for (let index = 0; index < arc2color.length; index++) {
				const element = arc2color[index]
				globalV["branchIDParent_crownfilter"][element[0][2]] = branchID
				colorBranches(element, coloredSet, sortedArcArr, color, branchID)
			}
		}
	}

	function filterArcbyLevel(level) {
		// remove all the things for the crown filtering
		if (d3.selectAll(".crownRect").node()) {
			d3.selectAll(".crownRect").remove()
		}
		if (d3.selectAll(".line4crownRect").node()) {
			d3.selectAll(".line4crownRect").remove()
		}

		if (d3.selectAll(".filterLevelLine").node()) {
			d3.selectAll(".filterLevelLine").remove()
		}

		// create the filter line
		svg.append("line")
			.attr("class", "filterLevelLine")
			.attr("x1", xScale(originx1))
			.attr("y1", yScale(level))
			.attr("x2", xScale(originx2))
			.attr("y2", yScale(level))
			.attr("stroke-width", 4)
			.attr("stroke", "#94989c")
			.attr("stroke-dasharray", "4")
			.call(d3.drag()
				.on("drag", function (e) {
					let densityYscale = d3.mouse(this)[1]
					let curLevel = yScale.invert(densityYscale)
					if (curLevel >= 0 && curLevel <= originy2) {
						d3.select(this)
							.attr('y1', densityYscale)
							.attr('y2', densityYscale);

						// change the level in the inputs of configuration
						$("#level").val(curLevel)

						// change the arc color of the merge tree by the level
						updateMTbyLevel(curLevel)

						//// this is case3, only change the level and crown
						let curcrown = d3.select("#crown").node().value
						const vtkObject = new TTK.vtkDataSet("vtkUnstructuredGrid")
						vtkObject.fieldData.caseType = new TTK.vtkArray("caseType", 1, 1, TTK.CONSTS.VTK_INT, [3])
						vtkObject.fieldData.level = new TTK.vtkArray("level", 1, 1, TTK.CONSTS.VTK_DOUBLE, [curLevel])
						vtkObject.fieldData.crown = new TTK.vtkArray("crown", 1, 1, TTK.CONSTS.VTK_DOUBLE, [curcrown])
						sendDatatoTTK.sendVTKDataSet(vtkObject)

					}

				})
			)

		updateMTbyLevel(level)
		function updateMTbyLevel(level) {
			// empty the parentsarray
			globalV["branchIDParent_levelfilter"] = new Array(globalV["branchIDParent_levelfilter"].length)

			let coloredSet4levelFilter = new Set()

			// hide the arc under the level filter line
			for (let i = sortedArcArr.length - 1; i > -1; i--) {
				const arc2hide = sortedArcArr[i]
				if (globalV["filteredOutIndex"].has(arc2hide[2])) {
					continue
				}
				if (arc2hide[0][1] < level) {
					d3.select("#arcLineID" + arc2hide[2]).attr("stroke", "#c7c8ca")
					d3.select("#biggerCID" + arc2hide[2]).style("fill", "#c7c8ca")
					coloredSet4levelFilter.add(arc2hide[2])
				} else {
					break
				}
			}

			// color the arc and all its valid children arcs
			for (let index = 0; index < sortedArcArr.length; index++) {
				const arc2drawRect = sortedArcArr[index];
				if (globalV["filteredOutIndex"].has(arc2drawRect[2])) {
					continue
				}
				if (coloredSet4levelFilter.has(arc2drawRect[2])) {
					continue
				}

				globalV["branchIDParent_levelfilter"][arc2drawRect[0][2]] = arc2drawRect[0][2]

				let colorId = arc2drawRect[0][2] % modulo
				if ($('#catColorRadio').is(':checked')) {
					let ith = d3.select('#ithCat').node().value
					let catId2color = globalV["brachID2distribution"][arc2drawRect[0][2]][0][ith][0]
					colorId = catId2color % modulo
				}
				let color = rgbToHex(colorMap[colorId * 3],
					colorMap[colorId * 3 + 1],
					colorMap[colorId * 3 + 2])

				colorBranchbyLevel(arc2drawRect, coloredSet4levelFilter, sortedArcArr, color, arc2drawRect[0][2])
			}

			function colorBranchbyLevel(arc2drawRect, coloredSet4levelFilter, sortedArcArr, color, branchID) {
				if (globalV["filteredOutIndex"].has(arc2drawRect[2])) {
					return
				}
				// color the arc2drawRect line
				d3.select("#arcLineID" + arc2drawRect[2])
					.attr("stroke", color)
				// color the arc2drawRect biggerCircle
				d3.select("#biggerCID" + arc2drawRect[2])
					.style("fill", color)

				coloredSet4levelFilter.add(arc2drawRect[2])

				// find all the arcs covered by the main branch
				let arc2color = sortedArcArr.filter(item => {
					if (globalV["filteredOutIndex"].has(item[2])) return false
					if (coloredSet4levelFilter.has(item[2])) return false
					if (item[1][0] != arc2drawRect[0][0]) return false
					if (item[1][1] < level) return false
					return true
				})

				// put them to the set and color them
				for (let index = 0; index < arc2color.length; index++) {
					const element = arc2color[index]
					globalV["branchIDParent_levelfilter"][element[0][2]] = branchID
					colorBranchbyLevel(element, coloredSet4levelFilter, sortedArcArr, color, branchID)
				}

			}
		}

	} // end of the levelFiltering function


	/***************controll color the merge tree by level or crown************/
	// draw the default filter line for the merge Tree based on level or crown
	if ($('#levelRadio').is(':checked')) {
		filterArcbyLevel(d3.select("#level").node().value)
	} else {
		mergeBranch4crown(d3.select("#crown").node().value
		)
	}

	// swith the two radios
	d3.select("#levelRadio").on("click", function () {
		let curlevel = d3.select("#level").node().value
		console.log("level is checked!", curlevel)
		filterArcbyLevel(curlevel)

	})
	d3.select("#crownRadio").on("click", function () {
		let curcrown = d3.select("#crown").node().value
		console.log("crown is checked!", curcrown)
		mergeBranch4crown(curcrown)
	})

	// listen to the level and crown input in the configurations
	d3.select("#level").on("change", function () {
		if ($('#levelRadio').is(':checked')) {
			let curLevel = this.value
			if (curLevel >= 0 && curLevel <= originy2) {
				//// this is case3, only change the level and crown
				let curcrown = d3.select("#crown").node().value
				const vtkObject = new TTK.vtkDataSet("vtkUnstructuredGrid")
				vtkObject.fieldData.caseType = new TTK.vtkArray("caseType", 1, 1, TTK.CONSTS.VTK_INT, [3])
				vtkObject.fieldData.level = new TTK.vtkArray("level", 1, 1, TTK.CONSTS.VTK_DOUBLE, [curLevel])
				vtkObject.fieldData.crown = new TTK.vtkArray("crown", 1, 1, TTK.CONSTS.VTK_DOUBLE, [curcrown])
				sendDatatoTTK.sendVTKDataSet(vtkObject)
				// move the filter line
				svg.select(".filterLevelLine")
					.attr('y1', yScale(curLevel))
					.attr('y2', yScale(curLevel))

				filterArcbyLevel(curLevel)
			} else {
				alert("The level is not valid!")
			}


		}
	})

	d3.select("#crown").on("change", function () {
		if ($('#crownRadio').is(':checked')) {
			let curCrown = this.value
			console.log("crown changes: ", curCrown)
			if (curCrown >= 0 && curCrown <= sortedArcArr[0][0][1] - sortedArcArr[0][1][1]) {
				//// this is case3, only change the level and crown
				let curlevel = d3.select("#level").node().value
				const vtkObject = new TTK.vtkDataSet("vtkUnstructuredGrid")
				vtkObject.fieldData.caseType = new TTK.vtkArray("caseType", 1, 1, TTK.CONSTS.VTK_INT, [3])
				vtkObject.fieldData.level = new TTK.vtkArray("level", 1, 1, TTK.CONSTS.VTK_DOUBLE, [curlevel])
				vtkObject.fieldData.crown = new TTK.vtkArray("crown", 1, 1, TTK.CONSTS.VTK_DOUBLE, [curCrown])
				sendDatatoTTK.sendVTKDataSet(vtkObject)
				mergeBranch4crown(curCrown)
			} else {
				alert("The relevance is not valid!")
			}

		}
	})

	/***************controll coloring by BranchID and dominateing color on Pie************/
	// swith the two radios of brachid and topN cat on Pie
	d3.select("#branchidRadio").on("click", function () {
		// color the digram pair line
		colorDiagram(null)
		// color the arcline in the merge tree
		if ($('#levelRadio').is(':checked')) {
			filterArcbyLevel(d3.select("#level").node().value)
		} else {
			mergeBranch4crown(d3.select("#crown").node().value)
		}
	})
	d3.select("#catColorRadio").on("click", function () {
		// color the digram pair line
		let ith = d3.select('#ithCat').node().value
		colorDiagram(ith)
		// color the arcline in the merge tree
		if ($('#levelRadio').is(':checked')) {
			filterArcbyLevel(d3.select("#level").node().value)
		} else {
			mergeBranch4crown(d3.select("#crown").node().value)
		}
	})

	// listen to the topN cat color
	d3.select("#ithCat").on("change", function () {
		if ($('#catColorRadio').is(':checked')) {
			let ith = this.value
			colorDiagram(ith)

			// color the arcline in the merge tree
			if ($('#levelRadio').is(':checked')) {
				filterArcbyLevel(d3.select("#level").node().value)
			} else {
				mergeBranch4crown(d3.select("#crown").node().value)
			}

		}
	})

}
function colorDiagram(ith) {
	// color the digram pair line
	d3.select("#diagramDiv").selectAll(".biggerC")
		.each(function (d, i) {
			let colorId = d[0][2] % modulo
			if (ith) {
				let catId2color = globalV["brachID2distribution"][d[0][2]][0][ith][0]
				colorId = catId2color % modulo
			}
			let color = rgbToHex(colorMap[colorId * 3],
				colorMap[colorId * 3 + 1],
				colorMap[colorId * 3 + 2])
			d3.select(this).style("fill", color)
		})

	d3.select("#diagramDiv").selectAll(".connectline")
		.each(function (d, i) {
			let colorId = d[0][2] % modulo
			if (ith) {
				let catId2color = globalV["brachID2distribution"][d[0][2]][0][ith][0]
				colorId = catId2color % modulo
			}
			let color = rgbToHex(colorMap[colorId * 3],
				colorMap[colorId * 3 + 1],
				colorMap[colorId * 3 + 2])
			d3.select(this).attr("stroke", color)
		})
}

function GetDistirbution(distribution, nConpoments4Count, locations) {
	let result = []
	let maxCount = null
	let minCount = null
	let branchCnt = locations.length / 2
	for (let index = 0; index < branchCnt; index++) {
		const curDistribution = distribution.slice(index * nConpoments4Count, (index + 1) * nConpoments4Count)
		let index2count = []
		for (let j = 0; j < curDistribution.length; j++) {
			// filter out "NA"
			if (j < nConpoments4Count - 1 && globalV["categeryMap"][j] == "NA") continue
			index2count.push([j, curDistribution[j]])

		}
		index2count.sort(function (a, b) { return b[1] - a[1] })
		if (!maxCount) {
			maxCount = index2count[0][1]
			minCount = index2count[0][1]
		} else {
			maxCount = d3.max([index2count[0][1], maxCount])
			minCount = d3.min([index2count[0][1], minCount])
		}
		result.push([index2count, [locations[index * 2 + 1], locations[index * 2]]])
	}

	let resultwithRadiusRatio = result.map(info => {
		let ratio = Math.pow((info[0][0][1] - minCount) / (maxCount - minCount), 1 / 3)
		return [info[0], info[1], ratio]
	})

	return resultwithRadiusRatio
}
function displayDistribution(branchid) {
	let cur = globalV["brachID2distribution"][branchid]
	let curDistribution = cur[0]
	let curLocation = cur[1]
	let curRatio = cur[2]

	let className4pie = 'pieDiv' + branchid
	showPie(curDistribution, curLocation, curRatio, className4pie)

	// // create the pie using divIcon of leaflet
	// let html4pie = bakeThePie(curDistribution, className4pie)

	// var myIcon = L.divIcon({
	// 	className: className4pie,
	// 	iconSize: null,
	// 	html: html4pie
	// });
	// L.marker(curLocation, { icon: myIcon }).addTo(map)
}

function bakeThePie(distributionPlusTotal, className4pie) {
	let totalCount = distributionPlusTotal[0]
	let distribution = distributionPlusTotal.slice(1)


	const width = 150;
	const height = 150;
	const radius = Math.min(width, height) / 2;

	var svg = d3.select("body")
		.append("svg")
		.attr("class", "pieSvg4" + className4pie)
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", `translate(${width / 2}, ${height / 2})`);

	// const color = d3.scaleOrdinal(["#66c2a5", "#fc8d62", "#8da0cb",
	// 	"#e78ac3", "#a6d854", "#ffd92f"]);

	const pie = d3.pie()
		.value(d => d[1])
		.sort(null);

	const arc = d3.arc()
		.innerRadius(0)
		.outerRadius(radius);


	const path = svg.selectAll("path")
		.data(pie(distribution));


	path.enter().append("path")
		// .attr("fill", (d, i) => color(i))
		.attr("fill", "#7275778f")
		.attr("d", arc)
		.attr("stroke", "black")
		.attr("stroke-width", "1px")


	svg.selectAll('mySlices')
		.data(pie(distribution))
		.enter()
		.append('text')
		.text(function (d) { return globalV["categeryMap"][d.data[0]] })
		.attr("transform", function (d, i) { return "translate(" + arc.centroid(d) + ")"; })
		.style("text-anchor", "middle")
		.style("font-size", "0.2rem")
		.on("mouseover", function (d, i) {
			console.log("mouseover: ", d, i)
		})


	var serializer = new XMLSerializer();
	var str4svg = serializer.serializeToString(d3.select(".pieSvg4" + className4pie).node());
	return str4svg

}

function showPie(distributionPlusTotal, curLocation, curRatio, className4pie) {
	let totalCount = distributionPlusTotal[0][1]
	let distribution = distributionPlusTotal.slice(1)
	distribution = distribution.slice(0, slider.value)

	let borderWidth = 1

	// Add an SVG element to Leaflets overlay pane
	let svg = d3.select(map.getPanes().overlayPane)
		.append("svg")
		.attr("class", "pieSvg4" + className4pie)
	let g = svg.append("g").attr("class", "leaflet-zoom-hide")


	const pie = d3.pie()
		.value(d => d[1])

	const path = g.selectAll("path")
		.data(pie(distribution));


	map.on("zoomend", reset);

	reset();

	// fit the SVG element to leaflet's map layer
	function reset() {
		let centerPoint = map.latLngToLayerPoint(new L.LatLng(curLocation[0], curLocation[1]));
		// get the radius of the pie, make a consistant unitDist for the svg on the leaflet
		let unitPoint0 = map.latLngToLayerPoint(new L.LatLng(centerLatLong[0], centerLatLong[1]));
		let unitPoint1 = map.latLngToLayerPoint(new L.LatLng(centerLatLong[0] + 0.001, centerLatLong[1] + 0.001));
		let unitDist = Math.sqrt((unitPoint0.x - unitPoint1.x) ** 2 + (unitPoint0.y - unitPoint1.y) ** 2)

		const radius = 7 * unitDist
		const minRadius = 3 * unitDist
		const radiu2draw = curRatio * (radius - minRadius) + minRadius
		const width = 2 * radiu2draw + borderWidth * 5
		const height = 2 * radiu2draw + borderWidth * 5
		const left = centerPoint.x - radiu2draw
		const top = centerPoint.y - radiu2draw

		svg.attr("width", width)
			.attr("height", height)
			.style("left", left + "px")
			.style("top", top + "px");

		g.attr("transform", `translate(${width / 2}, ${height / 2})`);

		const arc = d3.arc()
			.innerRadius(0)
			.outerRadius(radiu2draw)

		if (d3.selectAll(".path4" + className4pie)) d3.selectAll(".path4" + className4pie).remove()
		path.enter().append("path")
			.attr("class", "path4" + className4pie)
			.attr("fill", (d, i) => {
				let colorId = d.data[0] % modulo
				return rgbToHex(colorMap[colorId * 3],
					colorMap[colorId * 3 + 1],
					colorMap[colorId * 3 + 2])
			})
			.attr("d", arc)
			.attr("stroke", "white")
			.attr("stroke-width", borderWidth + "px")
		// .on("mouseover", (d, i) => {
		// 	console.log("hover the path")
		// })


		if (d3.selectAll(".text4" + className4pie)) d3.selectAll(".text4" + className4pie).remove()
		let currentZoom = map.getZoom();
		let fontSize = (radiu2draw / radius) * (currentZoom / 25)
		// console.log("fontSize: ", fontSize)
		g.selectAll('mySlices')
			.data(pie(distribution))
			.enter()
			.append('text')
			.attr("class", "text4" + className4pie)
			.text(function (d) {
				let name = abbrevMap[globalV["categeryMap"][d.data[0]]]
				if (currentZoom > 13) {
					return name
				}
				let words = name.split(' ')
				let result = words.map(data => data[0])
				return result.join('')

			})
			.attr("transform", function (d, i) { return "translate(" + arc.centroid(d) + ")"; })
			.style("text-anchor", "middle")
			.style("font-size", fontSize + "rem")
			.on("mouseover", (d, i) => {
				tooltip.style("opacity", 1)
			})
			.on("mousemove", (d, i) => {
				// console.log("mousemoveing! ", d)
				tooltip
					.html(
						"Category name: </br> <strong>"
						+ abbrevMap[globalV["categeryMap"][d.data[0]]]
						+ "</strong> </br>"
						+ "Count: <strong>" + d.data[1] + "</strong> "
						+ "Ratio: <strong>" + d3.format(",.1f")(d.data[1] / totalCount * 100) + "%</strong> "
						+ "</br>"
						+ "Total event count: <strong>" + totalCount + "</strong>")
					.style("left", d3.event.pageX + "px")
					.style("top", d3.event.pageY + "px")
					.style("font-size", "0.5rem")
			})
			.on("mouseleave", (d, i) => {
				tooltip.style("opacity", 0)
			})


		{/* For the drop shadow filter... */
			// var defs = svg.append("defs");

			// var filter = defs.append("filter")
			// 	.attr("id", "dropshadow")

			// filter.append("feGaussianBlur")
			// 	.attr("in", "SourceAlpha")
			// 	.attr("stdDeviation", 4)
			// 	.attr("result", "blur");
			// filter.append("feOffset")
			// 	.attr("in", "blur")
			// 	.attr("dx", 2)
			// 	.attr("dy", 2)
			// 	.attr("result", "offsetBlur");

			// var feMerge = filter.append("feMerge");

			// feMerge.append("feMergeNode")
			// 	.attr("in", "offsetBlur")
			// feMerge.append("feMergeNode")
			// 	.attr("in", "SourceGraphic");

			if (d3.selectAll(".border4pie" + className4pie)) d3.selectAll(".border4pie" + className4pie).remove()
			svg.append("circle")
				.attr("class", "border4pie" + className4pie)
				.attr("cx", width / 2)
				.attr("cy", height / 2)
				.attr("r", radiu2draw)
				.style("fill", "none")
				.attr("stroke", "#9E9E9E")
				.attr("stroke-width", borderWidth * 2 + "px")
			// .attr("filter", "url(#dropshadow)")
		}



	}


}




/************************************communication with TTK*******************************/

// 1) Create a WebSocketIO instance for requestData and sendData from/or ttk
const sendDatatoTTK = new TTK.ttkWebSocketIO();
const requestDatafromTTK = new TTK.ttkWebSocketIO();

// 2) Attach connection listeners
sendDatatoTTK.on('open', () => {
	console.log('sendDatatoTTK Connected.')
	$("#submitButton").click(function () {
		// to do: for the different parameter
		let bandwidth = d3.select("#bandwidth").node().value
		let resx = d3.select("#resolutionX").node().value
		let resy = d3.select("#resolutionY").node().value
		let level = d3.select("#level").node().value
		let crown = d3.select("#crown").node().value
		let kernalIndex = $("#kernalDropDown :selected").index()

		// update parameters in the globalV
		let newParas = [parseFloat(bandwidth), parseFloat(resx), parseFloat(resy), parseInt(kernalIndex), parseFloat(level), parseFloat(crown)]
		console.log("sending data to ttk: ", newParas, globalV["paras"])

		if (JSON.stringify(newParas) == JSON.stringify(globalV["paras"])) {
			alert("There is no change of the configuration!")
		} else {
			if (JSON.stringify(newParas.slice(0, 4)) == JSON.stringify(globalV["paras"].slice(0, 4))) {
				console.log("case3")
				// this is case3, only change the level and crown
				const vtkObject = new TTK.vtkDataSet("vtkUnstructuredGrid")
				vtkObject.fieldData.caseType = new TTK.vtkArray("caseType", 1, 1, TTK.CONSTS.VTK_INT, [3])
				vtkObject.fieldData.level = new TTK.vtkArray("level", 1, 1, TTK.CONSTS.VTK_DOUBLE, [newParas[4]])
				vtkObject.fieldData.crown = new TTK.vtkArray("crown", 1, 1, TTK.CONSTS.VTK_DOUBLE, [newParas[5]])
				sendDatatoTTK.sendVTKDataSet(vtkObject)
			} else {
				// this is case1, send al the parameters to ttk
				console.log("case1")
				const vtkObject = new TTK.vtkDataSet("vtkUnstructuredGrid")
				vtkObject.fieldData.caseType = new TTK.vtkArray("caseType", 1, 1, TTK.CONSTS.VTK_INT, [1])
				vtkObject.fieldData.bandwidth = new TTK.vtkArray("bandwidth", 1, 1, TTK.CONSTS.VTK_DOUBLE, [newParas[0]])
				vtkObject.fieldData.resolution = new TTK.vtkArray("resolution", 1, 2, TTK.CONSTS.VTK_DOUBLE, [newParas[1], newParas[2]])
				vtkObject.fieldData.kernalFun = new TTK.vtkArray("kernalFun", 1, 1, TTK.CONSTS.VTK_INT, [newParas[3]])
				vtkObject.fieldData.level = new TTK.vtkArray("level", 1, 1, TTK.CONSTS.VTK_DOUBLE, [newParas[4]])
				vtkObject.fieldData.crown = new TTK.vtkArray("crown", 1, 1, TTK.CONSTS.VTK_DOUBLE, [newParas[5]])
				sendDatatoTTK.sendVTKDataSet(vtkObject)
			}
			globalV["paras"] = newParas
		}
	})

});
sendDatatoTTK.on('close', () => console.log('sendDatatoTTK Connection Closed.'));
sendDatatoTTK.on('error', () => console.log('Error for sendDatatoTTK (see console for details).'));

requestDatafromTTK.on('open', () => {
	console.log('requestDatafromTTK Connected.')
	requestDatafromTTK.sendString('RequestInputVtkDataSet');
});
requestDatafromTTK.on('close', () => console.log('requestDatafromTTK Connection Closed.'));
requestDatafromTTK.on('error', () => console.log('Error for requestDatafromTTK (see console for details).'));

// 3) Create a button that will trigger a connection request (default ip/port)
sendDatatoTTK.connect('localhost', 9285);
requestDatafromTTK.connect('localhost', 9286);

// 4) In this example we assume every message sequence the sever is sending encodes
// a serialized vtkDataObject, so each sequence is fed into a factory constructor.
requestDatafromTTK.on('messageSequence', msgs => {
	TTK.vtkDataSet.createFromMessageSequence(msgs).then(objects => {
		console.log("Recived objects from TTK.")
		// console.log("received objects: ", objects)
		if (objects.length == 0) {
			console.log("Empty content from TTK!")
		} else {
			// checkreturn Type
			let caseType = objects[0].fieldData.caseTypeReturn.data[0]
			console.log("returned caseType: ", caseType)
			// clean the pie chart
			if (d3.select(map.getPanes().overlayPane).selectAll("svg").nodes().length > 0) {
				d3.select(map.getPanes().overlayPane).selectAll("svg").remove()
			}

			if (!globalV["categeryMap"]) {
				let catArr = objects[0].fieldData.CategoryDictionary.data
				globalV["categeryMap"] = catArr.map(cat => cat.replace(/"/g, ""))
				slider.max = d3.min([slider.max, catArr.length])
			}
			// update the distributiondata for the three cases.
			globalV["brachID2distribution"] = GetDistirbution(objects[0].fieldData.Count.data,
				objects[0].fieldData.Count.nComponents,
				objects[0].fieldData.BranchMaximum.data)


			if (caseType == 1) {
				// case one, render map and draw diagram, curve, merge tree
				rendermapLayer(objects)
				globalV["filteredOutIndex"].clear();
				let pairs = getPair(objects)
				let data2mergeTree = getData4mergetree(objects)

				// console.log("value: ", globalV["brachID2distribution"])
				globalV["pairs"] = pairs
				globalV["branchIDParent_crownfilter"] = new Array(pairs.length)
				globalV["branchIDParent_levelfilter"] = new Array(pairs.length)
				drawDiagram(pairs)
				drawCurve(pairs)
				drawMergeTree(data2mergeTree)
			} else if (caseType == 2) {
				// case2, change the persistence threshold. only update layers
				rendermapLayer(objects)
			} else if (caseType == 3) {
				// case3, change the level and crown. render map and redraw three views
				rendermapLayer(objects)
				// drawDiagram(globalV["pairs"])
				// drawCurve(globalV["pairs"])

			}
		}

	});
});
