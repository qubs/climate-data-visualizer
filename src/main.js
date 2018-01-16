import Vue from 'vue';
import $ from 'jquery';
import Highcharts from 'highcharts/highstock';

import store from './store';
import router from './router';

import App from './App.vue';


Highcharts.setOptions({
	global : { useUTC : false }
});
Highcharts.theme = {
	colors: ['#F44336', '#9C27B0', '#03A9F4', '#CDDC39', '#FF9800', '#607D8B', '#009688', '#FFEB3B', '#3F51B5'],
	chart: {
		backgroundColor: '#FEFEFE'
	},
	title: {
		style: {
			color: '#424242',
			font: '600 1rem "Open Sans", sans-serif'
		}
	},
	subtitle: {
		style: {
			color: '#9E9E9E',
			font: 'normal 0.8rem "Open Sans", sans-serif'
		}
	},

	xAxis: {
		gridLineColor: '#EEEEEE',
		gridLineWidth: 1,

		lineColor: '#E0E0E0',
		tickColor: '#E0E0E0',

		labels: {
			style: { font: 'normal 0.7rem "Open Sans", sans-serif' }
		}
	},
	yAxis: {
		gridLineColor: '#EEEEEE',
		gridLineWidth: 1,
		labels: {
			style: { font: 'normal 0.7rem "Open Sans", sans-serif' }
		}
	},

	legend: {
		itemStyle: {
			font: '9pt "Open Sans", sans-serif',
			color: '#424242'
		},
		itemHoverStyle:{
			color: '#757575'
		}
	},

	scrollbar: {
		barBackgroundColor: '#CFD8DC'
	}
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);


$(function () {
	$(window).resize();

	new Vue({
		el: '#app',
		router: router,
		store: store,

		template: '<App />',
		components: { App }
	});
});
