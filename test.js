'use strict';

const codec = require("./index");
const conv = require("./color")

// Get the coders and define the test vectors
const coders = codec.init({
    log: console.log,
    config: { debug: true, codecTransitionInterval: 0.7 }
})
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
        func: coders.properties.HSV.encode,
        arg: "13.642,76.389,87.560",
        expected: JSON.stringify({
            color: { x: 0.48, y: 0.356 },
            brightness: 222,
            transition: 0.7
        })
    },
    {
        func: coders.properties.HSV.decode,
        arg: JSON.stringify({
            color: { x: 0.48, y: 0.356 },
            brightness: 222
        }),
        expected: "13.5385,76.4706,87.4016"
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