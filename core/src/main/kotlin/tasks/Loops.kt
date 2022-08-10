package tasks

/**
 * Task file for bundling jobs regarding loops
 *
 * @author knht
 */

val forLoopTask = {
    for (i in 0..(10 * 1e3).toInt()) {
        continue
    }
}

val whileLoopTask = {
    var i: Long = 0

    while (i < (10 * 1e3).toInt()) {
        i++
    }
}