'use strict';

describe('Service: hammingCode', function() {

    beforeEach(module('hammingencoder'));

    var hammingEncoder;
    beforeEach(inject(function (_hammingEncoder_) {
        hammingEncoder = _hammingEncoder_;
    }));

    it('should encode a bit stream [1,0,1,1]', function () {
        hammingEncoder.appendBit(1);
        expect(hammingEncoder.getCode()).toEqual([1,1,1]);

        hammingEncoder.appendBit(0);
        expect(hammingEncoder.getCode()).toEqual([1,1,1,0,0]);

        hammingEncoder.appendBit(1);
        expect(hammingEncoder.getCode()).toEqual([1,0,1,1,0,1]);

        hammingEncoder.appendBit(1);
        expect(hammingEncoder.getCode()).toEqual([0,1,1,0,0,1,1]);
    });

    it('should reset and encode [0,0,0]', function () {
        hammingEncoder.appendBits([1,1,1]);
        hammingEncoder.reset();

        hammingEncoder.appendBits([0,0,0]);
        expect(hammingEncoder.getCode()).toEqual([0,0,0,0,0,0]);
    });
});
