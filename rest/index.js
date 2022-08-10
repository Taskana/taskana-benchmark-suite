const cluster = require('cluster');
const Benchmark = require('./lib/Benchmark.js');
const Format = require('./util/Format.js');
const { warmup } = require('./index.node');

/**
 * Main benchmark invoker. This HTTP Benchmark is highly parallelized in two ways:
 * 
 * 1. The Node.js process is clustered. Forked workers report their acquired data via IPC to the master process
 * 2. HTTP requests are scheduled on the Tokio runtime each of which get their pooled share of resources.
 * 
 * Depending on the benchmarking strategy, the specified amount of virtual users determine the amount of workers forked.
 * 
 * Data is broadcasted via IPC and signalized once done via a message type of `FINISHED`.
 * 
 * From the nature of clustered shared work, final augmentation and reporting must be done within the 
 * master process, otherwise race-conditions or duplicates may occur when data isn't fully finished broadcasting back to master.
 * 
 * @author knht
 */
class TaskanaBenchmark {
    constructor(strategyName = 'benchmarks/taskana.yaml') {
        this._clusterMap = new Map();
        this._results = new Map();
        this._runner = new Benchmark(strategyName, { outputJson: true });
        this._count = 0;
        this._initialize();
    }

    /**
     * Internal initialization function for booting up the clustered benchmarking suite.
     * 
     * @async
     * @private
     */
    async _initialize() {
        if (cluster.isMaster) {
            console.log(`Warming up libuv Foreign Function Interface for ${this._runner.warmupDuration} second${(this._runner.warmupDuration === 1) ? '' : 's'}...\n`);
    
            await warmup(this._runner.warmupDuration);
    
            for (let i = 0; i < this._runner.concurrentOperations; i++) {
                const identifier = i + 100;
                const worker = cluster.fork({ workerId: identifier });
    
                this._clusterMap.set(worker.id, identifier);
    
                worker.on('message', (message) => {
                    switch (message.type) {
                        case 'STARTED': {
                            console.log(`Worker ${this._clusterMap.get(worker.id)} started benchmarking ...`);
                            break;
                        }
    
                        case 'FINISHED': {
                            this._count++;
                            this._results.set(this._clusterMap.get(worker.id), message.payload);
                            console.log(`Worker ${this._clusterMap.get(worker.id)} finished benchmarking. Collecting data ...`);
    
                            if (this._count === this._runner.concurrentOperations) {
                                for (const [worker, result] of this._results) {
                                    const parsedData = JSON.parse(result.results);
    
                                    console.log('+------------------------+');
                                    console.log(`| Result from worker ${worker} |`);
                                    console.log('+------------------------+\n');
                                    console.log(`Worker ${worker} ran ${parsedData.length} benchmarks.\n`);
    
                                    for (const entry of parsedData) {
                                        console.log(`${entry._name} - ${entry._method} ${entry._endpoint} (OK)`);
                                        console.log('Min: ' + Format.duration(entry._min));
                                        console.log('Max: ' + Format.duration(entry._max));
                                        console.log('Avg: ' + Format.duration(entry._avg));
                                        console.log(`All: ${entry._runs} (${entry._runs.length} total)\n`);
                                    }
    
                                    console.log(`Benchmark from worker ${worker} ran in total ${Format.duration(result.totalRuntime)} \n\n`);
                                }
    
                                cluster.disconnect();
                            }
    
                            break;
                        }
    
                        default: {
                            console.log('Received invalid IPC message, discarding ...');
                            break;
                        }
                    }
                });
            }
        } else {
            await this._runner.run();
        }
    }
}

module.exports = new TaskanaBenchmark('benchmarks/simple.yaml');
