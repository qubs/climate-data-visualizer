"use strict";

var QCNChart = function (properties) {
	this.daysToShow = properties.daysToShow || 7;
	this.daysToLoad = properties.daysToLoad || 31;

	this.yAxisLabel = properties.yAxisLabel || "";
	this.valueSuffix = properties.valueSuffix || "";

	this.dataID = properties.dataID || "";

	this.container = properties.container || "dummy-container";
	this.centralDataStore = properties.centralDataStore || {};

	this.stationSeries = properties.stationSeries || [];
	this.bounds = properties.bounds || [-999999, 999999];

	this.plotLinesX = properties.plotLinesX || [];
	this.plotLinesY = properties.plotLinesY || [];

	this.excludeStations = properties.excludeStations || [];

	this.processing = false;

	var dateRange = new Date();
	dateRange.setDate(dateRange.getDate() - this.daysToShow);

	// TODO: Fix this by making it the actual read time.
	this.readTimeOfLastGraphUpdate = this.centralDataStore.readTimeOfLastGraphUpdate;

	this.chartOptions = {
		title: { text: "" },
		subtitle: { text: "" },

		xAxis: {
			type: "datetime",
			tickPixelInterval: 150,
			min: dateRange.getTime(),
			max: (new Date()).getTime()
		},
		yAxis: {
			title: { text: this.yAxisLabel },
			plotLines: [{
				value: 0,
				width: 1,
				color: "#FF5722"
			}]
		},
		tooltip: { valueSuffix: this.valueSuffix },
		scrollbar: { enabled: true },

		plotOptions: {
			series: {
				marker: { enabled: false },
				gapSize: 5
			}
		},

		chart: {
			renderTo: this.container,
			type: "line",
			animation: Highcharts.svg,
			zoomType: "x",
			spacingTop: 40,
			events: {
				load: function () {
					window.setInterval(function () {
						if (!this.processing) {
							this.processing = true;
							$.get(API_URL + "/settings/receiving_data/", function (receivingData) {
								if (receivingData.value === "0") {
									$.get(API_URL + "/readings/", {
										start: this.readTimeOfLastGraphUpdate.toISOString(),
										start_exclusive: true
									}, function (readings) {
										if (readings.length > 0) {
											this.addReadings(readings);
											this.readTimeOfLastGraphUpdate
												= new Date(readings[readings.length - 1]["read_time"]);
											console.log("Updated readings.");
										}

										this.processing = false;
									}.bind(this));
								} else {
									this.processing = false;
								}
							}.bind(this));
						}
					}.bind(this), 5000);
				}.bind(this)
			}
		},
		series: this.stationSeries
	};

	if (this.chartOptions.xAxis.plotLines) {
		this.chartOptions.xAxis.plotLines = this.chartOptions.xAxis.plotLines.concat(this.plotLinesX);
	} else {
		this.chartOptions.xAxis.plotLines = this.plotLinesX;
	}

	if (this.chartOptions.yAxis.plotLines) {
		this.chartOptions.yAxis.plotLines = this.chartOptions.yAxis.plotLines.concat(this.plotLinesY);
	} else {
		this.chartOptions.yAxis.plotLines = this.plotLinesY;
	}

	this.refreshChart();
};

QCNChart.prototype.refreshChart = function () {
	this.chartOptions.xAxis.max = (new Date()).getTime();
	this.chartObject = new Highcharts.Chart(this.chartOptions);
};

QCNChart.prototype.setDaysToShow = function (days) {
	this.daysToShow = days;
	var dateRange = new Date();

	this.chartOptions.xAxis.max = dateRange.getTime();
	dateRange.setDate(dateRange.getDate() - this.daysToShow);
	this.chartOptions.xAxis.min = dateRange.getTime();

	this.refreshChart();
};

QCNChart.prototype.addReadings = function (readings) {
	const maxReadings = 4 * 24 * this.daysToLoad;

	for (var r in readings) {
		if (readings.hasOwnProperty(r)) {
			if (this.centralDataStore.indexedSensors[readings[r]["sensor"]]["data_id"] === this.dataID) {
				const station = this.centralDataStore.indexedStations[readings[r]["station"]];
				var stationIndex = -1;
				for (var s in this.centralDataStore.stations) {
					if (this.centralDataStore.stations.hasOwnProperty(s)) {
						if (this.centralDataStore.stations[s]["id"] === station["id"]) {
							stationIndex = s;
						}
					}
				}

				if (stationIndex === -1) break;

				var y = readings[r]["value"];
				if (y !== null)  {
					y = y / 100.0;

					if ((y < this.bounds[0] || y > this.bounds[1]) || readings[r]["invalid"]) {
						y = null;
					}
				}

				// Any explicitly excluded stations should not get new readings.
				if (this.excludeStations.indexOf(station["id"]) === -1) {
					/*
						Series should have same index as station since they were
						pushed at the same time. Shift if we have more than a
						week's worth of data.
					*/

					var seriesIndex = -1;

					for (var c in this.chartObject.series) {
						if (this.chartObject.series.hasOwnProperty(c)) {
							if (stationIndex === this.chartObject.series[c]["stationIndex"]) {
								seriesIndex = c;
							}
						}
					}

					if (seriesIndex !== -1) {
						this.chartObject.series[seriesIndex].addPoint([
							new Date(readings[r]["read_time"]).getTime(), y
						], false, (this.chartObject.series[seriesIndex].data.length > maxReadings));
					}
				}
			}
		}
	}

	var dateRange = new Date();
	dateRange.setDate(dateRange.getDate() - this.daysToShow);

	this.chartObject.xAxis[0].setExtremes(dateRange.getTime(), (new Date()).getTime());
	this.chartObject.redraw();
};
