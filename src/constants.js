// BEGINNING OF CONFIGURATION
const API_URL = 'http://localhost:8000/api/climate';
const DAYS_TO_LOAD = 31;

const DISABLED_DATA_TYPES = {
	1: [],						// Elbow Lake
	2: [],						// Hill Island
	3: [],						// Leroi Swamp
	4: [],						// Lindsay Lake
	5: [],						// Long Lake
	6: [],						// Queen's Point
	7: [],						// Round Lake
	8: []						// Warner Lake
};
// END OF CONFIGURATION

const NA_STRING = '<span class="not-available">N/A</span>';
const LOADING_MESSAGE = 'Loading...';

export {
	API_URL,
	DAYS_TO_LOAD,
	DISABLED_DATA_TYPES,

	NA_STRING,
	LOADING_MESSAGE
}
