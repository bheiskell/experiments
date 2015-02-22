'use strict';

/**
 * Hamming code stream.
 */
function HammingEncoder(binaryUtils) {
    this.binaryUtils = binaryUtils;

    this.reset();
}

/**
 * Reset the instance.
 */
HammingEncoder.prototype.reset = function() {
    // Hamming code is one indexed (in this implementation)
    this.index = 1;

    // Encoded list is zero indexed
    this.encoded = [];
};

/**
 * Append all bits using this.appendBit(bit);
 * @param bits The bits to append
 */
HammingEncoder.prototype.appendBits = function(bits) {
    for (var i = 0; i < bits.length; i++) {
        this.appendBit(+bits[i]);
    }
};

/**
 * Appends a bit to the encoded index, populating and adjusting the appropriate
 * power of two indexes.
 * @param bit The bit to append
 */
HammingEncoder.prototype.appendBit = function(bit) {

    if ( bit !== 0 && bit !== 1) {
        throw new Error('appendBit only accepts 0 or 1: ' + bit);
    }

    while (this.binaryUtils.isTwoPower(this.index)) {
        this.encoded.push(0);
        this.index++;
    }
    this.encoded.push(bit);

    if (bit === 1) {
        var encodedIndex = 1;
        var remainingIndex = this.index;

        while (remainingIndex !== 0) {
            if ((encodedIndex & remainingIndex) !== 0) { // jshint ignore:line: binary and desired
                this._flip(encodedIndex);
                remainingIndex = remainingIndex ^ encodedIndex; // jshint ignore:line: binary xor desired
            }
            encodedIndex = encodedIndex << 1; // jshint ignore:line: binary shift desired
        }
    }

    this.index++;
};

/**
 * Get a copy of the Hamming Code.
 * @return List of bits
 */
HammingEncoder.prototype.getCode = function() {
    return this.encoded.slice();
};

/**
 * Flip the bit in the encoded list for a given Hamming Code index.
 *
 * Because we're not using the zero bit parity check, hamming code indexes are
 * 1 indexed, while the encoded list implementation is zero indexed. This
 * function reconciles that difference.
 *
 * @param index The one indexed Hamming Code index
 */
HammingEncoder.prototype._flip = function(index) {
    this.encoded[index-1] = (1 === this.encoded[index-1]) ? 0 : 1;
};


/**
 * @ngdoc service
 * @name hammingCodeApp.hammingEncoder
 * @description
 * # hammingCode
 * Service in the hammingCodeApp.
 */
angular.module('hammingencoder', ['binaryutils'])
  .service('hammingEncoder', HammingEncoder);
