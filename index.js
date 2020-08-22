'use strict';

// TODO: const conv = require("./cie_to_rgb");
const conv = require("./color");


/**
 * Initialise the codec
 * @param {object} params Initialisation parameters object
 * @param {function} params.log Logging function
 * @param {object} params.config Configuration
 * @return {object} Encode and/or decode functions
 */
exports.init = function(params) {
    const { log, config } = params;
    log("Trådfri codec initialized with " + config.name + ": " + JSON.stringify(config, null, 4));

    // Read codec configuration
    const transition_interval = isNaN(config.codecTransitionInterval) ? 0.5 : config.codecTransitionInterval;
    function debug(text) {
        if (config.debug === true) log(text);
    }

    function encode(message, info, output) {
        debug("`encode`: topic='" + info.topic + "', property='" + info.property + "', message='" + message + "'");
        output(message);
    }
    function decode(message, info, output) {
        debug("`decode`: topic='" + info.topic + "', property='" + info.property + "', message='" + message + "'");
        output(message);
    }

    function encode_on(message) {
        const encoded = JSON.stringify({ state: message ? "ON" : "OFF", transition: transition_interval });
        debug("`encode_on`: message='" + message + "' -> '" + encoded + "'");
        return encoded;
    }
    function decode_on(message) {
        const { state } = JSON.parse(message);
        const decoded = state ? state == "ON" : false;

        debug("`decode_on`: message='" + message + "' -> '" + decoded + "'");
        return decoded;
    }

    function encode_brightness(message) {
        // Map [0, 100] to [0, 254]
        const encoded = JSON.stringify({ brightness: Math.round(message * 2.54), transition: transition_interval });
        debug("`encode_brightness`: message='" + message + "' -> '" + encoded + "'");
        return encoded;
    }
    function decode_brightness(message) {
        // Map [0, 254] to [0, 100]
        const { brightness } = JSON.parse(message);
        const decoded = brightness ? Math.round(brightness / 2.54) : 0;

        debug("`decode_brightness`: message='" + message + "' -> '" + decoded + "'");
        return decoded;
    }

    function encode_hsv(message) {
        // Inspired by https://github.com/arachnetech/homebridge-mqttthing/issues/80#issuecomment-475384764
        const [h, s, v] = message.split(",");
        const { x, y } = conv.hsv_to_cie(h, s, 100);
        const encoded = JSON.stringify({
            color: { x: x, y: y },
            brightness: Math.round(Math.min(v * 2.54, 254)),
            transition: transition_interval
        });

        debug("`encode_hsv`: message='" + message + "' -> '" + encoded + "'");
        return encoded;
    }
    function decode_hsv(message) {
        const { color, brightness } = JSON.parse(message);
        const { h, s } = color
            ? conv.cie_to_hsv(color.x, color.y)
            : { h: 360, s: 100};
        const decoded = h + "," + s + "," + (brightness / 2.54).toFixed(4);

        debug("`decode_hsv`: message='" + message + "' -> '" + decoded + "'");
        return decoded;
    }

    function encode_colortemp(message) {
        const encoded = JSON.stringify({ color_temp: message, transition: transition_interval });
        debug("`encode_colortemp`: message='" + message + "' -> '" + encoded + "'");
        return encoded;
    }
    function decode_colortemp(message) {
        let { color_temp } = JSON.parse(message);
        const decoded = color_temp ? color_temp : 100;

        debug("`decode_colortemp`: message='" + message + "' -> '" + decoded + "'");
        return decoded;
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
            HSV: {
                encode: encode_hsv,
                decode: decode_hsv
            },
            colorTemperature: {
                encode: encode_colortemp,
                decode: decode_colortemp
            }
        }
    };
}