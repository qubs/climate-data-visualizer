<!--suppress JSUnusedGlobalSymbols, JSUnresolvedVariable -->

<template>
	<div id="overview-tab" class="tab-content">
		<div id="weather-overview">
			It is currently around
			<span id="weather-temperature">{{ weather.temperature }}&deg;C</span> across
			QUBS properties, <br>
			with a humidity level of about <span id="weather-humidity">{{ weather.humidity }}%</span>.
			<div id="weather-last-update">Last updated {{ weather.lastUpdated }}.</div>
		</div>
		<div id="weather-table-container">
			<table id="weather-table">
				<thead>
				<tr>
					<th>Station</th>
					<th>Air Temperature</th>
					<th>Relative Humidity</th>
					<th>Air Pressure</th>
					<th>Wind Speed</th>
					<th>Wind Direction</th>
				</tr>
				</thead>
				<tbody v-if="loadedWeather">
				<tr v-for="station in stations"
					v-if="station['name'] != 'Lindsay Lake' && station['name'] != 'Long Lake'">
					<td class="station-name">{{ station['name'] }}</td>
					<td class="station-air-temp"><span v-html="station['latestReadings']['air_temp']"></span></td>
					<td><span v-html="station['latestReadings']['rh']"></span></td>
					<td><span v-html="station['latestReadings']['baro']"></span></td>
					<td><span v-html="station['latestReadings']['mean_wind_speed']"></span></td>
					<td>
						<span v-html="station['latestReadings']['wind_dir']"></span>
						<div class="wind-direction-indicator"
							 v-if="station['latestReadings']['wind_dir'] !== NA_STRING"
							 :style="{transform: `rotate(${station['latestReadings']['wind_dir'].slice(0, -1)}deg)`}">
							&uarr;
						</div>
					</td>
				</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
	import { NA_STRING } from '../constants';

	export default {
		computed: {
			loadedWeather: function () { return this.$store.state.loadedWeather },
			stations: function () { return this.$store.getters.stations; },
			weather: function () { return this.$store.getters.getWeather; },

			// Constants
			NA_STRING: () => NA_STRING
		}
	}
</script>
