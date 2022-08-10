import lib.Runner
import structs.Group
import tasks.*

/**
 * Main function for API demonstration
 *
 * @author knht
 */
@kotlin.contracts.ExperimentalContracts
fun main() {
    val runner = Runner()
    val group1 = Group("Loops")
        .bench("for Loop", forLoopTask)
        .bench("while Loop", whileLoopTask)

    val group2 = Group("Maps")
        .bench("HashMap", hashMapTask)
        .bench("LinkedMap", linkedMapTask)

    runner
        .addGroup(group1)
        .addGroup(group2)
        .run()
}