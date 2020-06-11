'use strict';

const codec = require("./index");
const conv = require("./cie_to_rgb")

// Get the coders and define the test vectors
const coders = codec.init({ log: console.log, config: {} })
const test_vectors = [
    {
        func: coders.properties.on.encode,
        arg: true,
        expected: JSON.stringify({ state: "ON", transition: 0.7 })
    },
    { 
        func: coders.properties.on.encode,
        arg: false,
        expected: JSON.stringify({ state: "OFF", transition: 0.7 })
    },
    { 
        func: coders.properties.on.decode,
        arg: JSON.stringify({ state: "ON" }),
        expected: true 
    },
    { 
        func: coders.properties.on.decode, 
        arg: JSON.stringify({ state: "OFF" }),
        expected: false 
    },


    {
        func: coders.properties.brightness.encode,
        arg: 0,
        expected: JSON.stringify({ brightness: 0, transition: 0.7 })
    },
    {
        func: coders.properties.brightness.encode,
        arg: 100,
        expected: JSON.stringify({ brightness: 254, transition: 0.7 })
    },
    {
        func: coders.properties.brightness.decode,
        arg: JSON.stringify({ brightness: 0 }),
        expected: 0
    },
    {
        func: coders.properties.brightness.decode,
        arg: JSON.stringify({ brightness: 254 }),
        expected: 100
    },

    {
        func: coders.properties.RGB.encode,
        arg: "255, 255, 255",
        expected: JSON.stringify({
            color: { r: 255, g: 255, b: 255 },
            brightness: 254,
            transition: 0.7
        })
    },
    {
        func: coders.properties.RGB.decode,
        arg: JSON.stringify({ 
            color: { x: 0.3227, y: 0.3290 },
            brightness: 180
        }),
        expected: "181,181,181"
    },

    {
        func: coders.properties.colorTemperature.encode,
        arg: 400,
        expected: JSON.stringify({ color_temp: 400, transition: 0.7 })
    },
    {
        func: coders.properties.colorTemperature.decode,
        arg: JSON.stringify({ color_temp: 400 }),
        expected: 400
    }
]

// Execute test vectors
for (const test_vector of test_vectors) {
    const result = test_vector.func(test_vector.arg)
    if (result != test_vector.expected)
        throw "Test vector '" + JSON.stringify(test_vector) + "' failed with result '" + JSON.stringify(result) + "'"
}