package lib

import structs.Group

/**
 * Main benchmarking Runner class for adding groups and their
 * respective blocks to be benchmarked. The [Runner] API is chainable.
 *
 * @author knht
 */
class Runner {
    private val groups = linkedMapOf<String, LinkedHashMap<String, () -> Unit>>()

    /**
     * Adds a [Group] to the [Runner] instance.
     *
     * @param group The group to be added to the [Runner]
     * @throws IllegalArgumentException If a group with the same name has already been registered
     * @return The [Runner] instance for this group
     */
    fun addGroup(group: Group): Runner {
        if (groups.containsKey(group.name)) {
            throw IllegalArgumentException("Benchmark group with name ${group.name} already exists.")
        }

        groups[group.name] = group.benchmarks

        return this
    }

    /**
     * Checks all groups for their pending benchmarks
     * and invokes the benchmark runner [lib.run] with their functions.
     */
    @kotlin.contracts.ExperimentalContracts
    fun run() {
        for ((group, benchmarks) in groups) {
            println("Benchmarking group $group:")

            for ((benchmark, block) in benchmarks) {
                println("Data for benchmark $benchmark:")
                /**
                 * @todo
                 * Actually use data instead of just printing it to stdout.
                 * Plan is to serialize data into JSON for later reporting.
                 */
                println(lib.run {
                    block()
                })
            }
        }
    }
}