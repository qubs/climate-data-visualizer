import Vue from 'vue';
import Vuex from 'vuex';

import Highcharts from 'highcharts/highstock';

import { LOADING_MESSAGE } from './constants';


Vue.use(Vuex);


// Modules

const dataModule = {
	state: {
		stations: [],
		stationsByID: {},

		sensorsByID: {},

		linksByID: {},
		linksByStation: {},

		dataTypesByShortName: {},

		readings: [],
		latestReadings: []
	},
	mutations: {
		setStations: (state, stations) => {
			state.stations = stations;
			for (let s in stations) {
				if (stations.hasOwnProperty(s)) {
					state.stationsByID[stations[s]['id']] = stations[s];
				}
			}
		},

		setStationChartReadings: (state, payload) => {
			state.stationsByID[payload.stationID]['chart_readings'] = payload.chartReadings;
		},

		setStationLatestReadings: (state, payload) => {
			state.stations[payload.stationIndex]['latestReadings'] = payload.latestReadings;
		},

		setSensors: (state, sensors) => {
			for (let s in sensors) {
				if (sensors.hasOwnProperty(s)) {
					state.sensorsByID[sensors[s]['id']] = sensors[s];
				}
			}
		},
		setLinks: (state, links) => {
			for (let l in links) {
				if (links.hasOwnProperty(l)) {
					state.linksByID[links[l]['id']] = links[l];

					if (typeof state.linksByStation[links[l]['station']['id']] === 'undefined') {
						state.linksByStation[links[l]['station']['id']] = [links[l]];
					} else {
						state.linksByStation[links[l]['station']['id']].push(links[l]);
					}
				}
			}
		},
		setDataTypes: (state, dataTypes) => {
			for (let d in dataTypes) {
				if (dataTypes.hasOwnProperty(d)) {
					state.dataTypesByShortName[dataTypes[d]['short_name']] = dataTypes[d];
				}
			}
		},
		setReadings: (state, readings) => {
			state.readings = readings;
		},

		setLatestReadings: (state, latestReadings) => {
			state.latestReadings = latestReadings;
		}
	},
	getters: {
		lastReading: (state, getters) => (state.readings[getters.readingCount - 1]),

		stations: (state) => (state.stations),

		getStationByID: (state) => {
			return (id) => (state.stationsByID[id]);
		},

		getLinkByID: (state) => {
			return (id) => (state.linksByID[id]);
		},
		getLinksByStation: (state) => {
			return (stationID) => (state.linksByStation[stationID]);
		},

		readings: (state) => (state.readings),
		readingCount: (state) => (state.readings.length),

		latestReadings: (state) => (state.latestReadings),
	}
};

const weatherModule = {
	state: {
		temperature: 0,
		humidity: 0,

		lastUpdated: ''
	},
	mutations: {
		setWeather: (state, payload) => {
			state.temperature = payload.temperature;
			state.humidity = payload.humidity;
			state.lastUpdated = payload.lastUpdated;
		}
	},
	getters: {
		getWeather: (state) => {
			return {
				temperature: state.temperature,
				humidity: state.humidity,

				lastUpdated: state.lastUpdated
			};
		}
	}
};

const chartModule = {
	state: {
		selectedDataType: 'air_temp',
		daysToShow: 7,

		processing: false,

		excludeStations: [],

		chartOptions: {
			title: {text: ''},
			subtitle: {text: ''},

			xAxis: {
				type: 'datetime',
				tickPixelInterval: 150,
				min: Date.now(),
				max: Date.now()
			},
			yAxis: {
				title: {text: ''},
				plotLines: []
			},
			tooltip: {valueSuffix: ''},
			scrollbar: {enabled: true},

			plotOptions: {
				series: {
					marker: {enabled: false},
					gapSize: 5
				}
			},

			chart: {
				renderTo: 'graph-container',
				type: 'line',
				animation: Highcharts.svg,
				zoomType: 'x',
				spacingTop: 40,
				events: {}
			},
			series: []
		},
		chartObject: null,
		plotLinesX: [],

		readTimeOfLastUpdate: null
	},
	mutations: {
		setChartDataType: (state, dataType) => {
			state.selectedDataType = dataType;
		},
		setChartDaysToShow: (state, daysToShow) => {
			state.daysToShow = daysToShow;
		},
		setChartTimeRange: (state, range) => {
			switch (range) {
				case 'day':
					state.daysToShow = 1;
					break;
				case 'week':
					state.daysToShow = 7;
					break;
				case 'month':
					state.daysToShow = 31;
			}

			let dateRange = new Date();
			state.chartOptions.xAxis.max = dateRange.getTime();
			dateRange.setDate(dateRange.getDate() - state.daysToShow);
			state.chartOptions.xAxis.min = dateRange.getTime();

			// this.refreshChart(); TODO: MOVE THIS ELSEWHERE
		},

		setChartReadTimeOfLastUpdate: (state, readTime) => {
			console.log('changed read time to ' + readTime.toISOString());
			state.readTimeOfLastUpdate = readTime;
		},

		setChartProcessing: (state, processing) => {
			state.processing = processing;
		},


		setChartOptions: (state, chartOptions) => {
			state.chartOptions = chartOptions;
		},
		setChartXAxisBounds: (state, bounds) => {
			state.chartOptions.xAxis.min = bounds.min;
			state.chartOptions.xAxis.max = bounds.max;
		},
		setChartXAxisExtremes: (state, extremes) => {
			state.chartObject.xAxis[0].setExtremes.apply(...extremes);
		},
		setChartXAxisPlotLines: (state, plotLines) => {
			state.chartOptions.xAxis.plotLines = plotLines;
		},
		setChartYAxisTitle: (state, title) => {
			state.chartOptions.yAxis.title.text = title;
		},
		setChartYAxisPlotLines: (state, plotLines) => {
			state.chartOptions.yAxis.plotLines = plotLines;
		},
		setChartTooltipValueSuffix: (state, valueSuffix) => {
			state.chartOptions.tooltip.valueSuffix = valueSuffix;
		},
		setChartEvents: (state, events) => {
			state.chartOptions.chart.events = events;
		},
		setChartSeries: (state, series) => {
			state.chartOptions.series = series;
		},

		setChartObject: (state, chartObject) => {
			state.chartObject = chartObject;
		},
		redrawChartObject: (state) => (state.chartObject.redraw()),
		addPointToChartObjectSeries: (state, payload) => {
			state.chartObject.series[payload.seriesIndex].addPoint(payload.point, payload.redraw, payload.shift);
		},
	},
	getters: {

	}
};


// Central Store

export default new Vuex.Store({
	modules: {
		weather: weatherModule,
		data: dataModule,
		chart: chartModule
	},
	state: {
		// Loading
		loadedWeather: false,
		loadedReadings: false,
		statusMessage: LOADING_MESSAGE,

		selectedTab: 'overview',

		stationSeries: {}
	},

	mutations: {
		setSelectedTab: (state, tab) => {
			state.selectedTab = tab;
		},

		// Loading Mutations

		loadedWeather: (state) => {
			state.loadedWeather = true;
		},
		loadedReadings: (state) => {
			state.loadedReadings = true;
		},

		setStatusMessage: (state, message) => {
			state.statusMessage = message;
		},

		setStationSeries: (state, stationSeries) => {
			state.stationSeries = stationSeries;
		}
	},
	getters: {},

	// strict: true
});
