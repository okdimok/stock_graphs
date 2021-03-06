
// This function draws bars for a single series. See
// multiColumnBarPlotter below for a plotter which can draw multi-series
// bar charts.
function barChartPlotter(e) {
	var ctx = e.drawingContext;
	var points = e.points;
	var y_bottom = e.dygraph.toDomYCoord(0);

	ctx.fillStyle = darkenColor(e.color);

	// Find the minimum separation between x-values.
	// This determines the bar width.
	var min_sep = Infinity;
	for (var i = 1; i < points.length; i++) {
		var sep = points[i].canvasx - points[i - 1].canvasx;
		if (sep < min_sep) min_sep = sep;
	}
	var bar_width = Math.floor(.6 * min_sep); //was 2.0 divided by smth

	// Do the actual plotting.
	for (var i = 0; i < points.length; i++) {
		var p = points[i];
		var center_x = p.canvasx;

		ctx.fillRect(center_x - bar_width / 2, p.canvasy,
		    bar_width, y_bottom - p.canvasy);

		ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
			bar_width, y_bottom - p.canvasy);
	}
}

  function darkenColor(colorStr) {
	// Defined in dygraph-utils.js
	var color = Dygraph.toRGB_(colorStr);
	color.r = Math.floor((255 + color.r) / 2);
	color.g = Math.floor((255 + color.g) / 2);
	color.b = Math.floor((255 + color.b) / 2);
	return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ', .7)';
  }

data_request = function(url, div_id){
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var data_json = JSON.parse(xmlhttp.responseText);
			var data_arr = [];
			var results = data_json.query.results;
			if (!results) {
				console.log("Yahoo gave an empty answer.");
				return;
			}
			results.quote.forEach(function(e){data_arr.unshift(
				[new Date(e.Date), [e.Low, e.Close, e.High], [0, e.Volume*1.0, 0]]
						)});
			graph_create(data_arr, div_id);
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

  
graph_create = function(data, div_id){
	var date_to = new Date(data[0][0]), date_from = new Date(data[data.length-1][0]);
	date_from.setDate(date_from.getDate() - 1);
	date_to.setDate(date_to.getDate() + 1);

	g = new Dygraph(
		document.getElementById(div_id),  // containing div
		data,
		{
			showRangeSelector: true,			
			labels: ["date", "price", "volume"],
			legend: "always",
			customBars: true,
            errorBars: true,
			//dateWindow: [ date_from.getTime(), date_to.getTime() ],
			series: {
				"price":{
					showInRangeSelector: true,
					axis: "y1"
				},
				"volume":{
					plotter: barChartPlotter,
					axis: "y2"
				},

			},

	        axes: {
              y2: {
                // set axis-related properties here
                labelsKMB: true,
				axisLabelWidth: 70,
              }
            },
            ylabel: 'YHOO price',
            y2label: 'day volume',
            rangeSelectorHeight: 40,
		}                                   // the options
);
}
window.onload = function(){
	data_request('http://query.yahooapis.com/v1/public/yql?env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json&q=select%20*%20from%20yahoo.finance.historicaldata%20where%20startDate=%272014-01-01%27%20and%20endDate=%272014-01-10%27%20and%20symbol=%27YHOO%27', 'graphdiv');
	data_request('http://query.yahooapis.com/v1/public/yql?env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json&q=select%20*%20from%20yahoo.finance.historicaldata%20where%20startDate=%272014-01-01%27%20and%20endDate=%272014-01-10%27%20and%20symbol=%27YNDX%27', 'graphdiv2');
};
