package lib

/**
 * This file contains the main [run] method for synchronously
 * running budgeted benchmarks on a given lambda expression.
 *
 * @author knht
 */

/**
 * Synchronously benchmark any code passed as a lambda expression
 * via the means of JIT compiled, time constrained execution budgets.
 *
 * @param initialPassingAmount Initial passing amount. Defaults to 10
 * @param saveValues Whether values returned from the benchmarked lambda expression should be stored in memory
 * @param block The lambda expression to benchmark
 * @return The results compacted into a [structs.Result] object instance
 */
@kotlin.contracts.ExperimentalContracts
fun <R> run(initialPassingAmount: Int = 10, saveValues: Boolean = true, block: () -> R): structs.Result {
    var passes = 0
    var runtimeAverage = 0.0
    var warmupAverage = 0.0
    var minimum = Float.POSITIVE_INFINITY.toLong()
    var maximum = Float.NEGATIVE_INFINITY.toLong()
    val allPasses = arrayListOf<Long>()
    val compilate = LongArray(10)

    preparation {
        var offset = 0
        var iterations = 10

        while (iterations-- > 0) {
            val timeNow = System.nanoTime()

            block()

            compilate[offset++] = System.nanoTime() - timeNow
        }

        var count = 0
        var budget = 10 * 1e6
        iterations = 5

        while (0 < budget || 0 < iterations--) {
            val timeNow = System.nanoTime()

            block()

            val timeDelta = System.nanoTime() - timeNow

            if (0 > timeDelta) {
                iterations++
                continue
            }

            count++
            warmupAverage += timeDelta
            budget -= timeDelta
        }

        warmupAverage /= count
    }

    measurement {
        if (warmupAverage > 10_000) {
            var iterations = 10
            var budget = initialPassingAmount * 1e6

            while (0 < budget || 0 < iterations--) {
                val timeNow = System.nanoTime()

                block()

                val timeDelta = System.nanoTime() - timeNow

                if (0 > timeDelta) {
                    iterations++
                    continue
                }

                passes++
                runtimeAverage += timeDelta
                budget -= timeDelta
                allPasses.add(timeDelta)

                if (timeDelta < minimum) {
                    minimum = timeDelta
                }

                if (timeDelta > maximum) {
                    maximum = timeDelta
                }
            }
        } else {
            var iterations = 10
            var budget = initialPassingAmount * 1e6

            if (saveValues) {
                val returnValues = arrayOfNulls<Any?>(1e6.toInt())

                while (0 < budget || 0 < iterations--) {
                    val timeNow = System.nanoTime()

                    for (i in 0..1e4.toInt()) {
                        returnValues[i] = block();
                    }

                    val timeDelta = (System.nanoTime() - timeNow) / 1e4

                    if (0 > timeDelta) {
                        iterations++
                        continue
                    }

                    passes++
                    runtimeAverage += timeDelta
                    allPasses.add(timeDelta.toLong())
                    budget -= timeDelta * 1e4

                    if (timeDelta < minimum) {
                        minimum = timeDelta.toLong()
                    }

                    if (timeDelta > maximum) {
                        maximum = timeDelta.toLong()
                    }
                }
            } else {
                while (0 < budget || 0 < iterations--) {
                    val timeNow = System.nanoTime()

                    for (i in 0..1e4.toInt()) {
                        block()
                    }

                    val timeDelta = (System.nanoTime() - timeNow) / 1e4

                    if (0 > timeDelta) {
                        iterations++
                        continue
                    }

                    passes++
                    runtimeAverage += timeDelta
                    allPasses.add(timeDelta.toLong())
                    budget -= timeDelta * 1e4

                    if (timeDelta < minimum) {
                        minimum = timeDelta.toLong()
                    }

                    if (timeDelta > maximum) {
                        maximum = timeDelta.toLong()
                    }
                }
            }
        }
    }

    allPasses.sort()
    return structs.Result(passes, warmupAverage > 10_000, runtimeAverage, minimum, maximum, compilate, allPasses)
}
