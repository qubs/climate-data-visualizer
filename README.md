# QUBS Climate Data Visualizer

An online tool, located at [http://climate.qubs.ca/](http://climate.qubs.ca/), for visualizing QUBS real-time climate
data sourced from the [API](http://climate.qubs.ca/api/). Written by [David Lougheed](mailto:david.lougheed@gmail.com).

## Dependencies

Uses [Bower](https://bower.io/) for package management and Highcharts (not-for-profit project license) for graphing.

## Installation

1. Download the latest release from the [Releases page](https://github.com/qubs/climate-data-visualizer/releases).

2. Unzip the resulting file in a directory publicly accessible from the web.

3. Make sure you have Bower installed. In the installation directory, run `bower install`.

## Configuration

1. Open up the `index.html` file. Find a line labeled `BEGINNING OF CONFIGURATION`. All lines between that line and the
configuration end label should be edited to match the installation specifics on the host server.
