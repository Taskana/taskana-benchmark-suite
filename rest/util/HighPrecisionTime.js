/**
 * High precision timer class providing reliable and 
 * monotonic timestamps with nanosecond precision for
 * high performance use.
 * 
 * @author knht
 */
class HighPrecisionTime {
    constructor() {
        this.startTime = null;
        this.stopTime = null;
        this.diff = null;
    }

    /**
     * Sets the current time in Nanoseconds
     */
    start() {
        try {
            this.startTime = process.hrtime.bigint();
        } catch {}
    }

    /**
     * Stops the measurement and returns the time difference in Nanoseconds
     * 
     * @returns {BigInt} The difference in measured time in Nanoseconds
     */
    stop() {
        try {
            this.stopTime = process.hrtime.bigint();
            this.diff = Number(this.stopTime - this.startTime);

            return this.diff;
        } catch {}
    }
}

module.exports = HighPrecisionTime;
