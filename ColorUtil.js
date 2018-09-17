//Color util

ColorUtil = {};

ColorUtil.hexToRGB = function(hexString) {
	hexString = hexString.slice(1);
	var r = parseInt(hexString.substring(0, 2), 16);
	var g = parseInt(hexString.substring(2, 4), 16);
	var b = parseInt(hexString.substring(4, 6), 16);
	return [r, g, b];
};

ColorUtil.rgbToHex = function(rgb) {
	var r = rgb[0].toString(16);
	if (r.length == 1) r = "0" + r;
	var g = rgb[1].toString(16);
	if (g.length == 1) g = "0" + g;
	var b = rgb[2].toString(16);
	if (b.length == 1) b = "0" + b;
	return "#" + r + g + b;
};

ColorUtil.blendColors = function(hexString1, hexString2, ratio) {
	var rgb1 = ColorUtil.hexToRGB(hexString1);
	var rgb2 = ColorUtil.hexToRGB(hexString2);
	var blend = [
		parseInt(rgb1[0] + ratio * (rgb2[0] - rgb1[0])),
		parseInt(rgb1[1] + ratio * (rgb2[1] - rgb1[1])),
		parseInt(rgb1[2] + ratio * (rgb2[2] - rgb1[2]))
	];
	return ColorUtil.rgbToHex(blend);
};