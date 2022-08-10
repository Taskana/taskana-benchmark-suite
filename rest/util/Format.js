const Constants = require('../config/Constants.js');

/**
 * Class exposing static formatting methods for better display and quantification of resulting data
 *
 * @author knht
 */
class Format {
    /**
     * Formats time passed in Nanoseconds to a human-readable form
     * ranging from picoseconds to minutes.
     * 
     * @param {BigInt} time The time to be formatted in Nanoseconds
     * @returns {String} The formatted duration
     */
    static duration(time) {
        if (time < 1e0) return `${Number((time * 1e3).toFixed(2)).toLocaleString(Constants.LOCALE)} ps`;
        if (time < 1e3) return `${Number(time.toFixed(2)).toLocaleString(Constants.LOCALE)} ns`;
        if (time < 1e6) return `${Number((time / 1e3).toFixed(2)).toLocaleString(Constants.LOCALE)} µs`;
        if (time < 1e9) return `${Number((time / 1e6).toFixed(2)).toLocaleString(Constants.LOCALE)} ms`;
        if (time < 1e12) return `${Number((time / 1e9).toFixed(2)).toLocaleString(Constants.LOCALE)} s`;

        return `${Number((time / 60e9).toFixed(2)).toLocaleString(Constants.LOCALE)} m`;
    }
}

module.exports = Format;
