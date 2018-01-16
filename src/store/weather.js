export default {
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
