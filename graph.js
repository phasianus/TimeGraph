function timeGraph(parent, data) {
	
	if (typeof parent === 'string') {
		parent = document.getElementById(parent);
	}
	
	var valueRow = [1,2,5,10];

	var timeRow = [10,15,30,60,180];
	
	var svgNS = "http://www.w3.org/2000/svg"; 
	
	var element = function(name, attributes, children = []) {
		
		var e = document.createElementNS(svgNS, name);
		for (var i in attributes) {
			e.setAttributeNS(null, i, attributes[i]);
		}
		for (var i in children) {
			e.appendChild(children[i]);
		}
		return e;
	}

	this.xGrid = element("g",   {class: "grid x-grid",  id:"xGrid"});
	this.yGrid = element("g",   {class: "grid y-grid",  id:"yGrid"});
	this.points = element("g", {class: "points", id: "points"});
	this.xLabels = element("g", {id: "x-labels", class:"labels x-labels", transform: "translate(0,14)"});
	this.xLabelsBx = element("g", {id:"x-labels-bx",  class:"labels", transform:"translate(0,28)"});
	this.xLabelsAx = element("g", {id:"x-labels-ax", class:"labels", transform:"translate(0,4)"});
	this.yLabels = element("g",  {id:"y-labels", class:"labels y-labels", transform:"translate(-4,3)"});
	this.yLabelsAx = element("g", {id:"y-labels-ax", transform:"translate(-4, 0)"});
	
	this.graph = element("svg", 
			{version: "1.2", 
	         class: "graphcont",  'aria-labelledby': "title", role: "img"}, 
	        [element("title", {}, [document.createTextNode(data.title)]),
	         element("g", {class:"graph", id:"graph"}, [xGrid, yGrid, xLabels, xLabelsBx, xLabelsAx, yLabels, yLabelsAx, points,])]);
	
	graph.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
	graph.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

	parent.appendChild(graph);
	
		
	var printDate = function(date) {
		//return date.toLocaleDateString();
		return date.getDate() + "." + (date.getMonth() + 1) + ".";
	}
		
	var parseTimes = function parseTimes(input) {
		var out = [];
		
		for (var i=0; i<input.length; i++) {
			
			var e = input[i].trim();
			
			if (e.startsWith("+")) {
				var r = /^(\d+)(\s*)(m|h|d)(\s*)((\*)(\s*)(\d+))?$/.exec(e.substring(1).trim());						
				if (! r) console.log("Bad format: '" + e + "'");
			
					
				var f = {
					m: 1,
					h: 60,
					d: 60*24
				}	
				
				var d = parseInt(r[1], 10) * f[r[3]] * 60000;

				var n = r[5] ? parseInt(r[8], 10) : 1;
				for (; n>0; n--) {
					out.push(new Date(out[out.length - 1].getTime() + d));
				}
				
			} else {
				out.push(new Date(Date.parse(e)));                                                  
			}
		}
		return out;
	}
	
	var addLabel = function addLabel(parent, text, x, y) {	
		parent.appendChild(element("text", {x: x, y: y}, [document.createTextNode(text)]));	
	}
	
	var addGridLine = function(parent, x1, y1, x2, y2) {
		parent.appendChild(element("line", {x1: x1, y1: y1, x2: x2, y2: y2, class: "gridLine"}));
	}
	
	var addXLabel = function(text, x) {
		addGridLine(xLabelsAx, x, "100%", x, 0);
	
		addLabel(xLabels, text, x, "100%");
		addGridLine(xGrid, x, 0, x, "100%");
	}
	
	var addXbLabel = function(text, x) {
		addLabel(xLabelsBx, text, x, "100%");
	}
	
	var addYLabel = function(text, y) {
		addLabel(yLabels, text, 0, y);
		addGridLine(yGrid, 0, y, "100%", y);
		addGridLine(yLabelsAx, 0, y, "100%", y);
	}
	
	var addPoint = function(x, y) {
		points.appendChild(element("circle", {cx: x, cy: y, r: 2, fill: "black", stroke: "none"}));
	}
	

	var tX = function(x) {
		return ((x - minX)/(maxX - minX) * 100) + "%";
	}	
	
	var tY = function (y) {
		return (100 - ((y - minY) / (maxY - minY) *100)) + "%";
	}
	
	
	// X labels
	var X_LABELS_NUM=10;
	var n, maxX = 0, minX=Number.MAX_VALUE;
	
	if (data.timeAxis) {
	
		n = parseTimes(data.timeAxis);
	
		maxX = n[n.length-1].getTime() / 60000;
		minX = n[0].getTime() / 60000;
	} else {
		var mi=Number.MAX_VALUE, mx=0, o;
		for (var i=0; i<data.points.length; i+=2) {
			var m = Date.parse(data.points[i]) / 60000;
			if (m < minX) minX = m;
			if (m > maxX) maxX = m;
		}
		alert("Time axis: " + new Date(minX*60000) + " -- " + new Date(maxX*60000) );
		for (var i in timeRow) {
			mi = minX - (minX  % timeRow[i]);
			mx = maxX + (timeRow[i] - (maxX % timeRow[i]));
			if ((mx - mi) / timeRow[i]  <= X_LABELS_NUM) {
				o = timeRow[i];
				break;
			}
		}

		minX = mi;
		maxX = mx;

		alert("Time axis: " + new Date(mi * 60000) + "--" + new Date(mx*60000) + ", step: " + o);
		n = [];
		while (mi <= mx) {
			n.push(new Date(mi * 60000));
			mi += o;
		}
		alert("times: " + n);
	}
	
	
	// Y labels
	var Y_LABELS_NUM = 6;
	var maxY = Number.MIN_VALUE;
	var minY = Number.MAX_VALUE;
	if (data.yLabels) {
		for (var i in data.yLabels) {
			if (data.yLabels[i] > maxY) maxY = data.yLabels[i];
			if (data.yLabels[i] < minY) minY = data.yLabels[i];
		}
		
		for (var i in data.yLabels) {
			addYLabel(data.yLabels[i] + "", tY(data.yLabels[i]));			
		}
	} else {
		
		for (var i=0; i<data.points.length; i += 2) {
			if (data.points[i+1] > maxY) maxY = data.points[i+1];
			if (data.points[i+1] < minY) minY = data.points[i+1];
		}
		
		alert("y: " + minY + " -- " + maxY);
		var o, mi,mx;
		for (var i in valueRow) {
			mi = minY - (minY % valueRow[i]);
			mx = maxY + (valueRow[i] - (maxY % valueRow[i]));
			if ((mx - mi) / valueRow[i]  <= Y_LABELS_NUM) {
				o = valueRow[i];
				break;
			}
		}
		
		alert("mi:" + mi + ", mx:" + mx + ", o:" + o);
		
		
		minY = mi;
		maxY = mx;
		while (mi <= mx) {
			addYLabel(mi + "", tY(mi));
			mi += o;
		}
	}
	
	
	
	
	
	
	
	addXbLabel(printDate(n[0]), tX(n[0].getTime()/60000));

	var d = n[0].getDate();
	

	for (var i=0; i<n.length; i++) {
	
		addXLabel((n[i].getHours() + ":" + n[i].getMinutes() + (n[i].getMinutes() < 9 ? "0" :"")), tX(n[i].getTime() / 60000));
		
		if (d != n[i].getDate()) {
			d = n[i].getDate();
			addXbLabel(printDate(n[i]), tX(n[i].getTime()/60000));		
		}
	}
	
	
	
	for (var i=0; i<data.points.length; i += 2) {							
		addPoint(tX(Date.parse(data.points[i]) / 60000), tY(data.points[i+1]));
	}
	
}