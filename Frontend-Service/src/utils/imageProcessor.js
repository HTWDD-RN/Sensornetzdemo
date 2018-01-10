'use strict';
const Jimp = require("jimp");
const Color = require("onecolor");

exports.getDominantColors = function (base64Image, containerCount) {
    //TODO: get hue min and hue max
    //TODO: fucking performance
    // get colors and put them into containers according to hue
    Jimp.read(Buffer.from(base64Image, 'base64'), function (err, img) {
        if (err) throw err;
        const containers = new Array(containerCount);
        const width = img.bitmap.width;
        const height = img.bitmap.height;
        const sum = width * height;
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                const clrHex = img.getPixelColor(x, y);
                const clrRgb = Jimp.intToRGBA(clrHex);
                const hue = new Color("rgb(" + clrRgb.r + "," + clrRgb.g + "," + clrRgb.b + ")").hue();
                const hueDeg = parseInt(360 * hue);
                const containerIdx = parseInt(hueDeg / parseInt(360 / containerCount));
                if (!containers[containerIdx]) {
                    containers[containerIdx] = new Array();
                }
                containers[containerIdx].push([clrRgb.r, clrRgb.g, clrRgb.b]);
            }
        }
        //sort containers by elements included
        var i = 0;
        for (i = 0; i < containerCount; i++) {
            if (!containers[i]) {
                containers[i] = new Array();
            }
            console.log(containers[i].length);
        }
        const sortedContainers = containers.sort(function (a, b) {
            return b.length - a.length;
        });
        //average color
        console.log(sortedContainers[0].length, sortedContainers[1].length);
        const result = [];
        for (i = 0; i < containerCount; i++) {
            var rSum = 0;
            var gSum = 0;
            var bSum = 0;
            const lngth = sortedContainers[i].length;
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
    });
}