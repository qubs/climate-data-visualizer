<!--suppress JSUnusedGlobalSymbols -->

<template>
    <div id="graph-tab" class="tab-content">
        <ul class="graph-range-container" v-if="loadedReadings">
            <li :class="{ graphRange: true, graphTimeRange: true, selected: daysToShow == 1 }"
                @click="setTimeRange('day')">Day</li>
            <li :class="{ graphRange: true, graphTimeRange: true, selected: daysToShow == 7 }"
                @click="setTimeRange('week')">Week</li>
            <li :class="{ graphRange: true, graphTimeRange: true, selected: daysToShow == 31 }"
                @click="setTimeRange('month')">Month</li>
        </ul>
        <div id="graph-container" class="graph-container"></div>
    </div>
</template>

<script>
    import $ from 'jquery';
    import Highcharts from 'highcharts/highstock';
    import moment from 'moment';

    import { inBounds } from '../utilities';
    import { API_URL, DAYS_TO_LOAD } from '../constants';

    export default {
    	props: ['dataType'],

		computed: {
			// From Store

			loadedReadings: function () { return this.$store.state.loadedReadings },

            stations: function () { return this.$store.getters.stations; },
			stationsByID: function () { return this.$store.state.data.stationsByID; },
			sensorsByID: function () { return this.$store.state.data.sensorsByID; },
			linksByID: function () { return this.$store.state.data.linksByID; },

			dataTypeObject: function () { return this.$store.state.data.dataTypesByShortName[this.dataType]; },
			valueSuffix: function () { return this.dataTypeObject['unit']; },

            // - chart-specific values
            stationSeries: function () { return this.$store.state.chart.stationSeries; },
            processing: function () { return this.$store.state.chart.processing; },
			daysToShow: function () { return this.$store.state.chart.daysToShow; },
			excludeStations: function () { return this.$store.state.chart.excludeStations; },
			chartOptions: function () { return this.$store.state.chart.chartOptions; },
			chartObject: function () { return this.$store.state.chart.chartObject; },
			plotLinesX: function () { return this.$store.state.chart.plotLinesX; },

			// Other Computed Values

			plotLinesY: function () {
				switch (this.dataType) {
					case 'air_temp':
						return [];
					case 'rh':
						return [{
							color: '#EEEEEE',
							value: 100,
							width: 2
						}];
					case 'baro':
						return [];
					default:
						return [];
				}
			},
			yAxisLabel: function () { return `${this.dataTypeObject['name']} (${this.valueSuffix})`; }
		},

		mounted: function () {
			if (this.loadedReadings) {
				this.refreshChart(true);
			}
		},

        watch: {
    		loadedReadings: function (loaded) {
    			if (loaded) {
    				this.refreshChart(true);
                }
            },
            dataType: function () {
				if (this.loadedReadings) {
					this.refreshChart(true);
				}
            }
        },

		methods: {
			setDataType: function (dataType) {
				this.$store.commit('setChartDataType', dataType);
			},
			setTimeRange: function (range) {
				switch (range) {
					case 'day':
						this.$store.commit('setChartDaysToShow', 1);
						break;
					case 'week':
						this.$store.commit('setChartDaysToShow', 7);
						break;
					case 'month':
						this.$store.commit('setChartDaysToShow', 31);
						break;
				}

				let dateRange = new Date();
				dateRange.setDate(dateRange.getDate() - this.$store.state.chart.daysToShow);

				this.$store.commit('setChartXAxisBounds', {
					min: dateRange.getTime(),
                    max: (new Date()).getTime()
                });

				this.refreshChart(false);
			},
			setReadTimeOfLastGraphUpdate: function (date) {
				this.$store.commit('setChartReadTimeOfLastUpdate', date);
			},

			refreshChart: function (updateDataType) {
				let dateRange = new Date();
				dateRange.setDate(dateRange.getDate() - this.$store.state.chart.daysToShow);

				this.$store.commit('setChartXAxisBounds', {
					min: dateRange.getTime(),
                    max: (new Date()).getTime()
                });

				if (updateDataType) {
					this.$store.commit('setChartYAxisTitle', this.yAxisLabel);
					this.$store.commit('setChartYAxisPlotLines', [{
						value: 0,
						width: 1,
						color: '#FF5722'
					}]);

					this.$store.commit('setChartTooltipValueSuffix', this.valueSuffix);

					this.$store.commit('setChartEvents', {
						load: function () {
							setInterval(() => {
								if (!this.$store.state.chart.processing) {
									this.$store.commit('setChartProcessing', true);
									$.get(API_URL + '/settings/receiving_data/', (receivingData) => {
										if (receivingData.value === '0'
											&& this.$store.state.chart.readTimeOfLastUpdate) {
											$.get(API_URL + '/readings/', {
												start: moment(this.$store.state.chart.readTimeOfLastUpdate)
													.add(45, 'm')
													.toISOString(),
												start_exclusive: true,
												interval: 4,
												compact: true
											}, (readings) => {
												if (readings.length > 0) {
													console.log(this.$store.chart.readTimeOfLastUpdate);
													this.addReadings(readings);
													this.$store.commit(
														'setChartReadTimeOfLastUpdate',
														new Date(readings[readings.length-1]['read_time'])
													);
													console.log('Updated readings.');
												}

												this.$store.commit('setChartProcessing', false);
											});
										} else {
											this.$store.commit('setChartProcessing', false);
										}
									});
								}
							}, 20000);
						}.bind(this)
					});

					this.$store.commit(
						'setChartSeries',
						this.$store.state.stationSeries[this.dataType]
					);

                    this.$store.commit(
                        'setChartXAxisPlotLines',
                        (() => {
                            if (this.$store.state.chart.chartOptions.xAxis.plotLines) {
                                return this.$store.state.chart.chartOptions.xAxis.plotLines.concat(this.plotLinesX);
                            } else {
                                return this.plotLinesX;
                            }
                        })()
                    );

                    this.$store.commit(
                        'setChartYAxisPlotLines',
                        (() => {
                            if (this.$store.state.chart.chartOptions.yAxis.plotLines) {
                                return this.$store.state.chart.chartOptions.yAxis.plotLines.concat(this.plotLinesY);
                            } else {
                                return this.plotLinesY;
                            }
                        })()
                    );
				}

				// noinspection JSUnresolvedFunction
				this.$store.commit('setChartObject', Highcharts.chart('graph-container',
                    this.$store.state.chart.chartOptions));
			},

			addReadings: function (readings) {
				const maxReadings = 24 * DAYS_TO_LOAD;  // Right now using 1 sample point every hour

				for (let r in readings) {
					if (readings.hasOwnProperty(r)) {
						const readingLink = this.$store.getters.getLinkByID(readings[r]['station_sensor_link']);

						if (readingLink['data_type']['short_name'] === this.dataType) {
							// Use deep query to save look-ups...
							const station = readingLink['station'];
							let stationIndex = -1;
							for (let s in this.$store.getters.stations) {
								if (this.$store.getters.stations.hasOwnProperty(s)) {
									if (this.$store.getters.stations[s]['id'] === station['id']) {
										stationIndex = s;
									}
								}
							}

							if (stationIndex === -1) break;

							let y = readings[r]['value'];
							if (y !== null)  {
								y /= Math.pow(10, readingLink['sensor']['decimals']);

								if (!inBounds(y, readingLink['data_type']['bounds'])
									|| readings[r]['invalid']) {
									y = null;
								}
							}

							// Any explicitly excluded stations should not get new readings.
							if (this.$store.chart.excludeStations.indexOf(station['id']) === -1) {
								/*
								 Series should have same index as station since they were
								 pushed at the same time. Shift if we have more than a
								 week's worth of data.
								 */

								let seriesIndex = -1;

								for (let c in this.$store.state.chart.chartObject.series) {
									if (this.$store.state.chart.chartObject.series.hasOwnProperty(c)) {
										if (this.$store.state.stations[stationIndex]['name']
											=== this.$store.state.chart.chartObject.series[c]['name']) {
											seriesIndex = c;
										}
									}
								}

								this.$emit('add-data-to-station-series', this.dataType, seriesIndex,
                                    [readings[r]['read_time'], y]); // TODO

								if (seriesIndex !== -1) {
									this.$store.commit('addPointToChartObjectSeries', {
										seriesIndex: seriesIndex,
                                        point: [new Date(readings[r]['read_time']).getTime(), y],
                                        redraw: false,
                                        shift: this.$store.state.chart.chartObject.series[seriesIndex].data.length > maxReadings
                                    });
								}
							}
						}
					}
				}

				let dateRange = new Date();
				dateRange.setDate(dateRange.getDate() - this.$store.chart.daysToShow);

				this.$store.commit('setChartXAxisExtremes', [dateRange.getTime(), (new Date()).getTime()]);
				this.$store.commit('redrawChartObject');
			}
		}
    }
</script>

<style></style>
