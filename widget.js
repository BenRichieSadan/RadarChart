/**
 * Radar Chart main widget file
 * Developed By: Ben Richie Sadan @ Sisense
 * Version : 1.0
 * Last Modified Date : 10-Feb-2020
 */

prism.registerWidget("RadarChart", {
	name: "RadarChart",
	family: "Chart",
	title: "Radar Chart",
	iconSmall: "/plugins/RadarChart/radar-icon-small.png",
	styleEditorTemplate: "/plugins/RadarChart/styler.html",
	hideNoResults: true,

	directive: {
		desktop: "RadarChart"
	},
	style: {
		isRoundStrokes: true
	},
	data: {
		selection: [],
		defaultQueryResult: {},
		panels: [{
				name: 'Dimention',
				type: "visible",
				metadata: {
					types: ['dimensions'],
					maxitems: 1
				},
				visibility: true
			},
			{
				name: 'Value',
				type: "visible",
				metadata: {
					types: ['measures'],
					maxitems: 1
				},
				visibility: true
			},
			{
				name: 'break by',
				type: "series",
				metadata: {
					types: ['dimensions'],
					maxitems: 1
				},
				visibility: true
			},
			{
				name: 'filters',
				type: 'filters',
				metadata: {
					types: ['dimensions'],
					maxitems: -1
				}
			}
		],

		// builds a jaql query from the given widget
		buildQuery: function (widget) {
			//debugger;
			// building jaql query object from widget metadata 
			var query = {
				datasource: widget.datasource,
				format: "json",
				isMaskedResult: true,
				metadata: []
			};

			if (widget.metadata.panel("Dimention").items.length > 0) {
				var buildDimention = widget.metadata.panel("Dimention").items[0];
				buildDimention.PanelName = "Dimention";
				query.metadata.push(buildDimention)
			};

			if (widget.metadata.panel("Value").items.length > 0) {
				var buildValue = widget.metadata.panel("Value").items[0];
				buildValue.PanelName = "Value";
				query.metadata.push(buildValue)
			};

			if (widget.metadata.panel("break by").items.length > 0) {
				var breakBy = widget.metadata.panel("break by").items[0];
				breakBy.PanelName = "break by";
				query.metadata.push(breakBy);
				widget.isBreakByOn = true;
				widget.breakByTitle = widget.metadata.panel("break by").items[0].jaql.title;
			} else {
				widget.isBreakByOn = false;
				widget.breakByTitle = "";
			}

			// pushing filters
			if (defined(widget.metadata.panel("filters"), 'items.0')) {
				widget.metadata.panel('filters').items.forEach(function (item) {
					item = $$.object.clone(item, true);
					item.panel = "scope";
					query.metadata.push(item);
				});
			}
			return query;
		},

		processResult: function (widget, queryResult) {
			var myData;

			if (widget.isBreakByOn) {
				// group the data: I want to draw one line per group
				myData = d3.nest() // nest function allows to group the calculation per level of a factor
					.key(function (d) {
						return d[d.length - 1].data;
					})
					.entries(queryResult.$$rows);
			} else {
				myData = d3.nest() // nest function allows to group the calculation per level of a factor
					.key(function (d) {
						return d[0].data;
					})
					.entries(queryResult.$$rows);
			}

			if(widget.isBreakByOn == false)
			{
				var restructuredData = {};
				restructuredData.key = "Radar Data";
				restructuredData.values = [];

				for (let index = 0; index < myData.length; index++) {
					restructuredData.values.push(myData[index].values[0]);
				}

				myData = [];
				myData.push(restructuredData);
			}

			widget.myData = myData;
			return widget.myData;
		}
	},

	render: function (widget, event) {
		// 	Get widget element, and clear it out
		var element = $(event.element);
		element.empty();

		var chartSpace = document.createElement("div");
		chartSpace.id = "radar" + widget.oid;
		chartSpace.classList.add(chartSpace.id);

		element.append(chartSpace);

		var margin = {
			top: 50,
			right: 50,
			bottom: 50,
			left: 50
		}

		width = element[0].clientWidth - margin.left - margin.right; // Use the window's width 
		height = element[0].clientHeight - 20 - margin.top - margin.bottom; // Use the window's height

		var color = d3.scale.ordinal()
			.range(["#EDC951", "#CC333F", "#00A0B0"]);

		var radarChartOptions = {
			w: width,
			h: height,
			margin: margin,
			maxValue: 0.5,
			levels: 3,
			labelFactor: 1.1,
			roundStrokes: widget.style.isRoundStrokes,
			color: color,
			isBreakByOn: widget.isBreakByOn
		};

		if (height > 440) {
			radarChartOptions.labelFactor = 1.1;
		} else {
			radarChartOptions.labelFactor = 1.25;
		}

		//Call function to draw the Radar chart
		RadarChart("." + chartSpace.id, widget.myData, radarChartOptions);
	},
	options: {
		dashboardFiltersMode: "slice",
		selector: false,
		title: false
	}
});