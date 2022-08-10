package structs

import fmt.duration
import kotlin.math.ceil

/**
 * Data class representing a benchmark result
 *
 * @author knht
 */
data class Result(
    val n: Int,
    val t: Boolean,
    val avg: Double,
    val min: Long,
    val max: Long,
    val jit: LongArray,
    val all: ArrayList<Long>) {

    val runs = n
    val minimum = min
    val maximum = max
    val results = jit
    val average = if (t) (avg / n) else ceil(avg / n)
    val p75 = all[ceil(n * (75.0 / 100.0)).toInt() - 1]
    val p99 = all[ceil(n * (99.0 / 100.0)).toInt() - 1]
    val p995 = all[ceil(n * (99.5 / 100.0)).toInt() - 1]

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Result

        if (n != other.n) return false
        if (t != other.t) return false
        if (avg != other.avg) return false
        if (min != other.min) return false
        if (max != other.max) return false
        if (!jit.contentEquals(other.jit)) return false
        if (all != other.all) return false
        if (runs != other.runs) return false
        if (minimum != other.minimum) return false
        if (maximum != other.maximum) return false
        if (!results.contentEquals(other.results)) return false
        if (average != other.average) return false
        if (p75 != other.p75) return false
        if (p99 != other.p99) return false
        if (p995 != other.p995) return false

        return true
    }

    override fun hashCode(): Int {
        var result = n
        result = 31 * result + t.hashCode()
        result = 31 * result + avg.hashCode()
        result = 31 * result + min.hashCode()
        result = 31 * result + max.hashCode()
        result = 31 * result + jit.contentHashCode()
        result = 31 * result + all.hashCode()
        result = 31 * result + runs
        result = 31 * result + minimum.hashCode()
        result = 31 * result + maximum.hashCode()
        result = 31 * result + results.contentHashCode()
        result = 31 * result + average.hashCode()
        result = 31 * result + p75.hashCode()
        result = 31 * result + p99.hashCode()
        result = 31 * result + p995.hashCode()
        return result
    }

    override fun toString(): String {
        return "Result(runs=$runs, minimum=${duration(minimum)}, maximum=${duration(maximum)}, results=${results.contentToString()}, average=$average, p75=$p75, p99=$p99, p995=$p995)"
    }
}