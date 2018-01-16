<template>
	<div id="app">
		<div id="qubsBar">
			<ul>
				<li><a href="https://qubs.ca">QUBS</a></li>
				<li><a href="https://elbowlakecentre.ca">ELEEC</a></li>
				<li class="active"><a href="#">Climate Network</a></li>
				<li><a href="https://dataverse.scholarsportal.info/dataverse/QUBS">QUBS Dataverse</a></li>
				<li><a href="https://opinicon.wordpress.com/">Opinicon Natural History</a></li>
				<li><a href="https://ecoadventurecamp.ca">Eco-Adventure Camp</a></li>
				<li><a href="https://fowlerherbarium.ca">Fowler Herbarium</a></li>
				<li><a href="http://fieldstations.ca">fieldstations.ca</a></li>
			</ul>
		</div>
		<nav id="tab-navigation">
			<h1>QUBS Climate Data Visualizer</h1>
			<ul v-if="loadedReadings">
				<li>
					<router-link :to="{ path: '/' }">Overview</router-link>
				</li>
				<li>
					<router-link :to="{ path: '/graph/air_temp/' }">Temperature</router-link>
				</li>
				<li>
					<router-link :to="{ path: '/graph/rh/' }">Relative Humidity</router-link>
				</li>
				<li>
					<router-link :to="{ path: '/graph/baro/' }">Air Pressure</router-link>
				</li>
				<li>
					<router-link :to="{ path: '/graph/mean_wind_speed/' }">Wind Speed</router-link>
				</li>
			</ul>
			<ul v-if="loadedWeather && !loadedReadings"><li>{{ statusMessage }}</li></ul>
		</nav>
		<div id="tab-containers" v-if="loadedWeather">
			<router-view></router-view>
		</div>
		<div class="status-message" v-if="!loadedWeather">{{ statusMessage }}</div>
	</div>
</template>

<script>
	import $ from 'jquery';
	import moment from 'moment';

	import { inBounds } from './utilities';
	import { API_URL, DAYS_TO_LOAD, LOADING_MESSAGE, NA_STRING, DISABLED_DATA_TYPES } from './constants';

	export default {
		name: 'app',

		created: function () {
			this.fetchData();
		},

		computed: {
			// From Store

			loadedWeather: function () { return this.$store.state.loadedWeather; },
			loadedReadings: function () { return this.$store.state.loadedReadings; },

			statusMessage: function () { return this.$store.state.statusMessage; },

			// - Chart Module

			chartSelectedDataType: function () { return this.$store.state.chart.selectedDataType; }
		},

		methods: {
			changeSelectedDataType: function (dataType) {
				this.$store.commit('setChartDataType', dataType);
			},
			changeReadTimeOfLastGraphUpdate: function (readTime) {
				this.$store.commit('setChartReadTimeOfLastUpdate', readTime);
			},

			fetchData: function () {
				let startTime = new Date();
				startTime.setDate(startTime.getDate() - DAYS_TO_LOAD);

				const loadReadings = $.get({
					url: API_URL + '/readings/',
					cache: false
				}, {
					start: startTime.toISOString(),
					sensors: [1, 2, 4, 6, 20, 23, 25],
					interval: 4,
					compact: true
				}, (readings) => this.$store.commit('setReadings', readings));

				$.when(
					$.get(API_URL + '/stations/', (stations) => this.$store.commit('setStations', stations)),
					$.get(API_URL + '/sensors/', (sensors) => this.$store.commit('setSensors', sensors)),
					$.get(API_URL + '/station-sensor-links/', {deep: true},
						(links) => this.$store.commit('setLinks', links)),
					$.get(API_URL + '/data-types/', (dataTypes) => this.$store.commit('setDataTypes', dataTypes)),
					$.get({
						url: API_URL + '/readings/latest/',
						cache: false
					}, (readings) => this.$store.commit('setLatestReadings', readings))
				).then(() => {
					this.updateWeather(true);
					this.$store.commit('loadedWeather');

					return $.when(loadReadings);
				}).then(() => {
					let stationSeries = {};

					for (let s in this.$store.getters.stations) {
						if (this.$store.getters.stations.hasOwnProperty(s)) {
							const currentStation = this.$store.getters.stations[s];

							// Reference the station's information from an object indexed with the station's
							// web ID.
							this.$store.commit('setStationChartReadings', {
								stationID: currentStation['id'],
								chartReadings: []
							});
							// this.stationsByID[currentStation['id']]['chart_readings'] = [];

							let initialData = {};

							const stationLinks = this.$store.getters.getLinksByStation(currentStation['id']);

							for (let d in stationLinks) {
								if (stationLinks.hasOwnProperty(d)) {
									initialData[stationLinks[d]['data_type']['short_name']] = [];
								}
							}

							for (let r in this.$store.getters.readings) {
								if (this.$store.getters.readings.hasOwnProperty(r)) {
									const readingLink = this.$store.state.data
										.linksByID[this.$store.getters.readings[r]['station_sensor_link']];

									if (readingLink['station']['id'] === currentStation['id']) {
										currentStation['chart_readings'].push(this.$store.getters.readings[r]);

										const readingDataType = readingLink['data_type'];

										let y = this.$store.getters.readings[r]['value'];
										if (y !== null) {
											y /= Math.pow(10, readingLink['sensor']['decimals']);

											if (typeof readingDataType !== 'undefined') {
												if (!inBounds(y, readingDataType['bounds'])
													|| this.$store.getters.readings[r]['invalid']) {
													y = null;
												}
											}
										}

										initialData[readingDataType['short_name']].push([
											new Date(this.$store.getters.readings[r]['read_time']).getTime(), y
										]);
									}
								}
							}

							for (let dd in DISABLED_DATA_TYPES[currentStation['id']]) {
								if (DISABLED_DATA_TYPES[currentStation['id']].hasOwnProperty(dd)) {
									initialData[DISABLED_DATA_TYPES[currentStation['id']][dd]] = [];
								}
							}

							for (let i in initialData) {
								if (initialData.hasOwnProperty(i)) {
									if (stationSeries[i] === undefined) {
										stationSeries[i] = [];
									}

									stationSeries[i].push({
										name: this.$store.getters.stations[s]['name'],
										data: initialData[i]
									});
								}
							}
						}
					}

					this.$store.commit('setStationSeries', stationSeries);

					if (this.$store.readingCount > 0) {
						this.$store.commit(
							'setGraphReadTimeOfLastUpdate',
							new Date(this.$store.lastReading['read_time'])
						);
					}

					this.$store.commit('loadedReadings');

					setInterval(() => {
						$.get({
							url: API_URL + '/settings/receiving_data/',
							cache: false
						}, (receivingData) => {
							if (receivingData.value === '0') {
								$.get({
									url: API_URL + '/readings/latest/',
									cache: false
								}, (readings) => {
									this.$store.commit('setLatestReadings', readings);
									this.updateWeather(false);
								});
							}
						});
					}, 20000);
				}).catch(() => {
					this.$store.commit('setStatusMessage', 'Error loading data.')
				});
			},

			addDataToStationSeries: function (dataType, stationIndex, dataPoint) {
				if (this.$store.state.stationSeries.hasOwnProperty(dataType)) {
					this.$store.state.stationSeries[dataType][stationIndex]['data'].push(dataPoint); // TODO
				} else {
					console.error('Not a valid station series data type: ' + dataType);
				}
			},

			updateWeather: function () {
				// Initialize arrays used for averaging.
				let allValues = {
					'air_temp': [],
					'rh': [],
					'baro': [],
					'wind_speed': [],
					'mean_wind_speed': [],
					'wind_dir': [],
					'mean_wind_direction': []
				};

				// Initialize array used for table values.
				// TODO: Don't use this anymore...
				let weatherReadings = {
					'air_temp': null,
					'rh': null,
					'baro': null,
					'wind_speed': null,
					'mean_wind_speed': null,
					'wind_dir': null,
					'mean_wind_direction': null
				};

				for (let s in this.$store.getters.stations) {
					if (this.$store.getters.stations.hasOwnProperty(s)) {
						const currentStation = this.$store.getters.stations[s];

						const latestReadings = $.grep(this.$store.getters.latestReadings, (e) => {
							return e['station'] === currentStation['id'];
						});

						for (let r in weatherReadings) {
							if (weatherReadings.hasOwnProperty(r)) {
								// Set proper values for table display.

								const rc = r;

								const currentReading = ($.grep(latestReadings, (e) => {
									return this.$store.getters.getLinkByID(e['station_sensor_link'])
											['data_type']['short_name'] === rc;
								}))[0];

								// By default, leave a nice N/A message.
								weatherReadings[r] = NA_STRING;

								if (typeof currentReading !== 'undefined' && currentReading !== null) {
									// A reading was found matching the correct data type.
									const readingStationSensorLink
										= this.$store.getters.getLinkByID(currentReading['station_sensor_link']);

									if (DISABLED_DATA_TYPES[currentStation['id']]
											.indexOf(readingStationSensorLink['data_type']['short_name'])
										=== -1) {
										let value = currentReading['value']
											/ Math.pow(10.0, readingStationSensorLink['sensor']['decimals']);
										if (inBounds(value,
												this.$store.getters.getLinkByID(currentReading['station_sensor_link'])
													['data_type']['bounds'])) {
											allValues[r].push(value);
										}

										// Round off to 1 decimal place and set the value string with the
										// suffix.
										const rp = Math.pow(10.0,
											readingStationSensorLink['sensor']['decimals'] - 1);
										weatherReadings[r] = ((v) => {
											const roundedValue = (Math.round(v * rp) / rp).toString();

											let unitSuffix = '';

											if (readingStationSensorLink['data_type']['unit'] !== 'none') {
												unitSuffix = readingStationSensorLink['data_type']['unit'];
												if (/[a-zA-Z]/.test(unitSuffix.charAt(0))) {
													// Format 'English' suffixes nicely.
													unitSuffix = ' ' + unitSuffix;
												}
											}

											return roundedValue + unitSuffix;
										})(value);
									}
								}
							}
						}

						let wind_dir = weatherReadings['wind_dir'];
						if (currentStation['name'] === 'Queen\'s Point') {
							// Queen's Point has a different sensor type for wind direction.
							wind_dir = weatherReadings['mean_wind_direction'];
						}

						this.$store.commit('setStationLatestReadings', {
							stationIndex: s,
							latestReadings: {
								'air_temp': weatherReadings['air_temp'],
								'rh': weatherReadings['rh'],
								'baro': weatherReadings['baro'],
								'mean_wind_speed': weatherReadings['mean_wind_speed'],
								'wind_dir': wind_dir
							}
						});
					}
				}

				// Force Highcharts to properly draw height.
				$(window).resize();

				this.$store.commit('setWeather', {
					temperature: Math.round(allValues['air_temp'].reduce((total, n) => (total + n), 0)
						/ allValues['air_temp'].length),
					humidity: Math.round(allValues['rh'].reduce((total, n) => (total + n), 0)
						/ allValues['rh'].length),
					lastUpdated: moment(
						this.$store.state.data.latestReadings[this.$store.getters.latestReadings.length - 1]['created']
					).format('MMMM Do [at] h:mm A')
				});
			}
		}
	};
</script>

<style src="./assets/style.css"></style>
