package fmt

/**
 * Formatting functions for better display and quantification of resulting data
 *
 * @author knht
 */

/**
 * Formats time passed in Nanoseconds to a human-readable form
 * ranging from picoseconds to minutes.
 *
 * @param time The time to be formatted in Nanoseconds
 * @return The formatted duration
 */
fun duration(time: Long): String {
    if (time < 1e0) return "${"%.2f".format(time * 1e3)} ps"
    if (time < 1e3) return "${"%.2f".format(time * 1.0)} ns"
    if (time < 1e6) return "${"%.2f".format(time / 1e3)} µs"
    if (time < 1e9) return "${"%.2f".format(time / 1e6)} ms"
    if (time < 1e12) return "${"%.2f".format(time / 1e9)} s"

    return "${"%.2f".format(time / 60e9)} m"
}