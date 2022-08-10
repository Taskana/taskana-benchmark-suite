const { warmup } = require('../index.node');
const { expect } = require('chai');

/**
 * @todo Write more tests ...
 */

describe('Rust native functions', () => {
    describe('warmup', () => {
        it('should wait for 10 seconds before resolving the promise', () => {
            const t1 = Date.now();

            warmup(10).then(() => {
                const delta = Date.now() - t1;

                expect(delta / 1e3).to.be.greaterThan(10);
            });
        });
    });
});
