/**
 * Data class representing a benchmark result
 *
 * @author knht
 */
class Result {
    /**
     * Constructs a new Benchmark {@link Result} object
     * 
     * @property {Number} _min The lowest measured time 
     * @property {Number} _max The highest measured time 
     * @property {Number} _avg The average time taken 
     * @property {Number} _total The total time taken
     * @property {String} _basePath The base URL from where the result comes from
     * @property {String} _endpoint The endpoint from where the result comes from
     * @property {String} _method The method used
     * @property {String} _name The name of the benchmark 
     * @property {Array<>} _runs The runs for this benchmark
     */
    constructor() {
        this._min = Number.POSITIVE_INFINITY;
        this._max = Number.NEGATIVE_INFINITY;
        this._avg = 0;
        this._total = 0;
        this._basePath = '';
        this._endpoint = '';
        this._method = '';
        this._name = '';
        this._runs = [];
    }

    get runsDone() {
        return this._runs.length;
    }

    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name;
    }

    get basePath() {
        return this._basePath;
    }

    set basePath(basePath) {
        this._basePath = basePath;
    }

    get endpoint() {
        return this._endpoint;
    }

    set endpoint(endpoint) {
        this._endpoint = endpoint;
    }

    get min() {
        return this._min;
    }

    set min(time) {
        this._min = time;
    }

    get max() {
        return this._max;
    }

    set max(time) {
        this._max = time;
    }

    get average() {
        return this._avg;
    }

    get method() {
        return this._method;
    }

    set method(method) {
        this._method = method;
    }

    addRun(run) {
        this._runs.push(run);
    }

    /**
     * Finishes the benchmark data collection and registers computed values
     * like the total time spent running and the average time for the benchmark.
     */
    collect() {
        this._total = this._runs.reduce((a, b) => a + b, 0);
        this._avg = (this._total / this._runs.length);
    }
}

module.exports = Result;
