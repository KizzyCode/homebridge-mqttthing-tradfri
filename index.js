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

    function encode_rgb(message) {
        const rgb = message.split(",");
        // See http://www.w3.org/TR/AERT#color-contrast
        const brightness = Math.round(0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
        const encoded = JSON.stringify({
            color: { r: +rgb[0], g: +rgb[1], b: +rgb[2] },
            brightness: brightness > 254 ? 254 : brightness,
            transition: transition_interval
        });

        debug("`encode_rgb`: message='" + message + "' -> '" + encoded + "'");
        return encoded;
    }
    function decode_rgb(message) {
        const { color, brightness } = JSON.parse(message);
        const decoded = color
            ? conv.cie_to_rgb(color.x, color.y, brightness).join(',')
            : [255, 255, 255];

        debug("`decode_rgb`: message='" + message + "' -> '" + decoded + "'");
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
            RGB: {
                encode: encode_rgb,
                decode: decode_rgb
            },
            colorTemperature: {
                encode: encode_colortemp,
                decode: decode_colortemp
            }
        }
    };
}