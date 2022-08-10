const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const HighPrecisionTime = require('../util/HighPrecisionTime.js');
const HTTPClient = require('./HTTPClient.js');
const Result = require('./Result.js');

/**
 * Benchmarking class for constructing, initializing, reading and preparing
 * all data needed for the provided benchmarking strategy.
 * 
 * @author knht
 */
class Benchmark {
    /**
     * Creates a new Benchmark instance for reading strategies and executing runs
     * 
     * @param {String} benchmarkStrategy The strategy name to read from the file system
     * @param {Object} options Additional options for configuring the output format
     */
    constructor(benchmarkStrategy = 'benchmark.yaml', options = {}) {
        this.benchmarkStrategy = benchmarkStrategy;
        this.outputJson = options.outputJson || true;
        this.concurrentOperations = null;
        this.strategyData = null;
        this.baseUrl = null;
        this.warmupDuration = 0;
        this.benchmarks = [];
        this.results = new Set();

        this._initialize();
    }

    /**
     * Initializes the Benchmark runner with needed data coming from the strategy file
     * provided by name when constructing a new Benchmark instance.
     * 
     * @private
     */
    _initialize() {
        this.strategyData = yaml.parse(fs.readFileSync(path.join(process.cwd(), this.benchmarkStrategy), { encoding: 'utf-8' }));
        this.concurrentOperations = this.strategyData.virtual_users;
        this.baseUrl = this.strategyData.base_url;
        this.warmupDuration = this.strategyData.warmup_duration;

        for (const benchmarkRun of this.strategyData.resources) {
            this.benchmarks.push(benchmarkRun);
        }
    }

    /**
     * Asynchronously run the benchmark according to the strategy file and
     * publish its results via IPC to the cluster.
     * 
     * @async
     * @returns {Promise<void>} An empty promise once the data has been serialized and sent via the IPC layer
     */
    async run() {
        process.send({
            type: 'STARTED',
            payload: null,
        });

        const benchmarkTracker = new HighPrecisionTime();
        const hrTimer = new HighPrecisionTime();
        const benchmarkClient = new HTTPClient(this.baseUrl);

        benchmarkTracker.start();

        for (const benchmark of this.benchmarks) {
            const result = new Result();

            result.basePath = this.baseUrl;
            result.endpoint = benchmark.request.url;
            result.name = benchmark.name;
            result.method = benchmark.request.method;

            for (let i = 0; i < benchmark.iterations; i++) {
                hrTimer.start();

                await benchmarkClient.request(
                    benchmark.request.url,
                    benchmark.request.method,
                    benchmark.request.headers,
                );

                const timeDelta = hrTimer.stop();

                if (timeDelta < result.min) result.min = timeDelta;
                if (timeDelta > result.max) result.max = timeDelta;

                result.addRun(timeDelta);
            }

            result.collect();
            this.results.add(result);
        }

        const suiteDone = benchmarkTracker.stop();

        process.send({
            type: 'FINISHED',
            payload: {
                totalRuntime: suiteDone,
                results: JSON.stringify([...this.results.values()]),
            },
        });

        return Promise.resolve();
    }
}

module.exports = Benchmark;
