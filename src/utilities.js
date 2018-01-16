const inBounds = function (value, bounds) {
	let lowerMet = bounds['lower_inc'] ? (value >= bounds['lower']) : (value > bounds['lower']);
	let upperMet = bounds['upper_inc'] ? (value <= bounds['upper']) : (value < bounds['upper']);

	return lowerMet && upperMet;
};

export { inBounds };
