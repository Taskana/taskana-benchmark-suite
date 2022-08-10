package tasks

/**
 * Task file for bundling jobs regarding maps
 *
 * @author knht
 */

val hashMapTask = {
    val ages = hashMapOf<String, Int>()

    ages["John"] = 32
    ages["Jane"] = 27

    ages["John"]

    Unit
}

val linkedMapTask = {
    val ages = linkedMapOf<String, Int>()

    ages["John"] = 32
    ages["Jane"] = 27

    ages["John"]

    Unit
}