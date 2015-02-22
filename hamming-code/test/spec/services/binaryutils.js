'use strict';

describe('Service: binaryUtils', function() {

    beforeEach(module('binaryutils'));

    var binaryUtils;
    beforeEach(inject(function (_binaryUtils_) {
        binaryUtils = _binaryUtils_;
    }));

    it('should convert string "abc"', function () {
        expect(binaryUtils.stringToBinary('abc')).toEqual(
            [1,0,0,0,0,1,1,0,0,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0]
        );
    });

    it('should verify powers of two', function () {
        expect(binaryUtils.isTwoPower(1)).toBe(true);
        expect(binaryUtils.isTwoPower(2)).toBe(true);
        expect(binaryUtils.isTwoPower(4)).toBe(true);

        expect(binaryUtils.isTwoPower(3)).toBe(false);
        expect(binaryUtils.isTwoPower(6)).toBe(false);
    });
});
