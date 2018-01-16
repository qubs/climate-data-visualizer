import Vue from 'vue';
import Vuex from 'vuex';

import { LOADING_MESSAGE } from '../constants';

import dataModule from './data';
import weatherModule from './weather';
import chartModule from './chart';


Vue.use(Vuex);

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

		stationSeries: {}
	},

	mutations: {
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
