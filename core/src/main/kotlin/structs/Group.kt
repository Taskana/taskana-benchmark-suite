package structs

/**
 * Wrapper class for representing groups of benchmarks
 * for better semantic separation of benchmarked code.
 *
 * @author knht
 */
class Group(val name: String) {
    val benchmarks = linkedMapOf<String, () -> Unit>()

    /**
     * Adds a benchmark to the group and returns a
     * [Group] instance for ease of use when using the chainable API.
     *
     * @param name The name for this benchmarking block
     * @return The group instance under which the benchmark is being run
     */
    fun bench(name: String, block: () -> Unit): Group {
        benchmarks[name] = block

        return this
    }
}