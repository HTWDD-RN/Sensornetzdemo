'use strict';
const Jimp = require("jimp");
const Color = require("onecolor");

/**
 * 
 * @param {string} base64Image 
 * @param {number} containerCount 
 */
exports.getDominantColors = function (base64Image, containerCount) {
    const imageData = base64Image.indexOf("base64,") === -1 ? base64Image : base64Image.split("base64,")[1];
    const startTime = new Date().getTime();
    // get colors and put them into containers according to hue
    Jimp.read(Buffer.from(imageData, 'base64'), function (err, img) {
        if (err) throw err;
        const containers = new Array(containerCount);
        var width = img.bitmap.width;
        var height = img.bitmap.height;
        //resize for faster processing
        if (width > height && width > 250) {
            img.resize(250, Jimp.AUTO);
        } else if (height > 250) {
            img.resize(Jimp.AUTO, 250);
        }
        width = img.bitmap.width;
        height = img.bitmap.height;
        const sum = width * height;
        var minHue = Number.POSITIVE_INFINITY;
        var maxHue = Number.NEGATIVE_INFINITY;
        var pixelValues = [];
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                const clrHex = img.getPixelColor(x, y);
                const clrRgb = Jimp.intToRGBA(clrHex);
                const hue = new Color("rgb(" + clrRgb.r + "," + clrRgb.g + "," + clrRgb.b + ")").hue();
                const hueDeg = parseInt(360 * hue);
                if (minHue > hueDeg) {
                    minHue = hueDeg;
                }
                if (maxHue < hueDeg) {
                    maxHue = hueDeg;
                }
                pixelValues.push({
                    rgb: clrRgb,
                    hue: hueDeg
                });
            }
        }
        if (minHue > 360) {
            minHue = 0;
        }
        if (maxHue < 0) {
            maxHue = 360;
        }
        const range = maxHue - minHue;
        for (var idx = 0; idx < pixelValues.length; idx++) {
            const colorData = pixelValues[idx];
            const hue = colorData.hue;
            const rgb = colorData.rgb;
            var containerIdx = parseInt(hue / parseInt(range / containerCount));
            if (Number.isNaN(containerIdx)) {
                containerIdx = 0;
            }
            if (!containers[containerIdx]) {
                containers[containerIdx] = new Array();
            }
            containers[containerIdx].push([rgb.r, rgb.g, rgb.b]);
        }
        //sort containers by elements included
        var i = 0;
        for (i = 0; i < containerCount; i++) {
            if (!containers[i]) {
                containers[i] = new Array();
            }
        }
        const sortedContainers = containers.sort(function (a, b) {
            return b.length - a.length;
        });
        //average color
        const result = [];
        for (i = 0; i < containerCount; i++) {
            var rSum = 0;
            var gSum = 0;
            var bSum = 0;
            const lngth = sortedContainers[i].length;
            if (lngth === 0) {
                continue;
            }
            for (var j = 0; j < lngth; j++) {
                let rgb = sortedContainers[i][j];
                rSum += rgb[0];
                gSum += rgb[1];
                bSum += rgb[2];
            }
            result.push({
                r: parseInt(rSum / lngth),
                g: parseInt(gSum / lngth),
                b: parseInt(bSum / lngth),
                dominance: parseInt(lngth / sum * 100).toString() + "%"
            });
        }
        console.log(result);
        console.log("Got dominant colors of an image in", (new Date().getTime() - startTime), "ms");
    });
}