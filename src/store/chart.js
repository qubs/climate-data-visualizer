import Highcharts from 'highcharts/highstock';

export default {
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
				// renderTo: 'graph-container',
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
