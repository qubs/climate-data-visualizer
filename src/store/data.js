export default {
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
