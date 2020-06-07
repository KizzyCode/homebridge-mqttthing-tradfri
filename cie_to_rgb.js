'use strict';


/**
 * Converts a CIE color representation to RGB
 * @param {Number} x
 * @param {Number} y
 * @param {Number} brightness - [1, 255)
 * @return {Array} A R,G,B array
 */
exports.cie_to_rgb = function(x, y, brightness = 254) {
    // Precompute values
    const z = 1.0 - x - y;
	const Y = (brightness / 254).toFixed(2);
	const X = (Y / y) * x;
    const Z = (Y / y) * z;
    
    // Get RGB using "Wide RGB D65"
	let r =  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
	let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
	let b =  X * 0.051713 - Y * 0.121364 + Z * 1.011530;

	// Limit rgb to a maximum of 1.0
	if (r > b && r > g && r > 1.0) {
		g = g / r;
		b = b / r;
		r = 1.0;
	} else if (g > b && g > r && g > 1.0) {
		r = r / g;
		b = b / g;
		g = 1.0;
	} else if (b > r && b > g && b > 1.0) {
		r = r / b;
		g = g / b;
		b = 1.0;
    }
    
    // Convert to hexadecimal
	r = Math.round(r * 255);
	g = Math.round(g * 255);
	b = Math.round(b * 255);
	return [isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b];
}


exports.rgb_to_cie = function ( red, green, blue) {
	// RGB values to XYZ using the Wide RGB D65 conversion formula
	const X 		= red * 0.664511 + green * 0.154324 + blue * 0.162028;
	const Y 		= red * 0.283881 + green * 0.668433 + blue * 0.047685;
	const Z 		= red * 0.000088 + green * 0.072310 + blue * 0.986039;

	// Calculate the xy values from the XYZ values
	let x 		  = (X / (X + Y + Z)).toFixed(4);
	let y 		  = (Y / (X + Y + Z)).toFixed(4);

	if (isNaN( x)) x = 0;
	if (isNaN( y)) y = 0;
	return [x, y];
}