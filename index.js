'use strict';

const conv = require("./cie_to_rgb");


/**
 * Initialise the codec
 * @param {object} params Initialisation parameters object
 * @param {function} params.log Logging function
 * @param {object} params.config Configuration
 * @return {object} Encode and/or decode functions
 */
exports.init = function(params) {
    let { log, config } = params;
    log("Trådfri codec initialized with " + config.name + ".");

    function encode(message, info, output) {
        log("Encoding: topic=[" + info.topic + "], property=[" + info.property + "], message=[" + message + "]");
        output(message);
    }
    function decode(message, info, output) {
        log("Decoding: topic=[" + info.topic + "], property=[" + info.property + "], message=[" + message + "]");
        output(message);
    }

    function encode_on(message) {
        return JSON.stringify({ state: message ? "ON" : "OFF" });
    }
    function decode_on(message) {
        const msg = JSON.parse(message);
        return msg.state ? msg.state == "ON" : false;
    }

    function encode_brightness(message) {
        // Map [0, 100] to [0, 254]
        return JSON.stringify({ brightness: Math.round(message * 2.54) });
    }
    function decode_brightness(message) {
        // Map [0, 254] to [0, 100]
        const msg = JSON.parse(message);
        return msg.brightness ? Math.round(msg.brightness / 2.54) : 0;
    }

    function encode_rgb(message) {
        const rgb = message.split(",");
        // See http://www.w3.org/TR/AERT#color-contrast
        const brightness = Math.round(0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
        return JSON.stringify({
            color: { r: +rgb[0], g: +rgb[1], b: +rgb[2] },
            brightness: brightness > 254 ? 254 : brightness
        });
    }
    function decode_rgb(message) {
        const msg = JSON.parse(message);
        return msg.color
            ? conv.cie_to_rgb(msg.color.x, msg.color.y, msg.brightness).join(',')
            : [255, 255, 255];
    }

    return { 
        encode, decode,
        properties: {
            on: {
                encode: encode_on,
                decode: decode_on
            },
            brightness: {
                encode: encode_brightness,
                decode: decode_brightness
            },
            RGB: {
                encode: encode_rgb,
                decode: decode_rgb
            }
        }
    };
}