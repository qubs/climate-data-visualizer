# QUBS Climate Data Visualizer

An online tool, located at [http://climate.qubs.ca/](http://climate.qubs.ca/), for visualizing QUBS real-time climate
data sourced from the [API](http://climate.qubs.ca/api/). Written by [David Lougheed](mailto:david.lougheed@gmail.com).

## Dependencies

Uses [NPM](https://www.npmjs.com/) for package management and Highcharts (educational institution project license) for
graphing. Uses Webpack and friends for building.

## Installation

1. Download the latest release from the [Releases page](https://github.com/qubs/climate-data-visualizer/releases).

2. Unzip the resulting file in a directory publicly accessible from the web.

3. Make sure you have NPM installed. In the installation directory, run `npm install`.

4. **If running for development purposes**, run `npm run dev` in the project root.

5. **If running on production**, run `npm build` in the project root.

## Configuration

1. Open up the `src/constants.js` file. Find a line labeled `BEGINNING OF CONFIGURATION`. All lines between that line
and the configuration end label should be edited to match the installation specifics on the host server.

2. If configuring on a production server, run `npm build` again to include the configuration changes.
