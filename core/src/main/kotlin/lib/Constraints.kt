package lib

import kotlin.contracts.InvocationKind
import kotlin.contracts.contract

/**
 * File containing runtime constraints for semantically
 * separating and scoping benchmarking logic from each other.
 *
 * @author knht
 */

/**
 * Block constraint for named-scoping preparation logic
 *
 * @param block Lambda expression to run within preparation period
 * @return Anything the lambda expression returns during preparation
 */
@kotlin.contracts.ExperimentalContracts
inline fun <R> preparation(block: () -> R): R {
    contract {
        callsInPlace(block, InvocationKind.EXACTLY_ONCE)
    }

    return block()
}

/**
 * Block constraint for named-scoping measurement logic
 *
 * @param block Lambda expression to run within measuring period
 * @return Anything the lambda expression returns during measuring
 */
@kotlin.contracts.ExperimentalContracts
inline fun <R> measurement(block: () -> R): R {
    contract {
        callsInPlace(block, InvocationKind.EXACTLY_ONCE)
    }

    return block()
}