'use strict';

/**
 * Binary Utility functions.
 */
function BinaryUtils() {}

/**
 * Check that a given index is a power of two.
 * @param index The index to check
 * @return true if a power of two
 */
BinaryUtils.prototype.isTwoPower = function(index) {
    while (index !== 0) {
        if (index === 1) {
            return true;
        } else if ((index & 1) === 1) { // jshint ignore:line: binary and desired
            return false;
        } else {
            index = index >> 1; // jshint ignore:line: binary shift desired
        }
    }

    return false;
};

/**
 * Convert a ASCII string to a binary stream (left least significant).
 * @param input The input string
 * @return Binary list
 */
BinaryUtils.prototype.stringToBinary = function(input) {
    var binaryList = [];
    for (var i = 0; i < input.length; i++) {
        // obtain binary string of the character with left most significant bit
        var compact = input[i].charCodeAt(0).toString(2);

        // left pad with zeros to 8 bits
        var padded = new Array(9 - compact.length).join('0') + compact;

        // reverse to obtain right most significant ordering (we read the stream left to right)
        var reversedList = padded.split('').reverse().map(function(character) { return +character; });

        binaryList = binaryList.concat(reversedList);
    }
    return binaryList;
};

/**
 * @ngdoc service
 * @name hammingCodeApp.binaryUtils
 * @description
 * # binaryUtils
 * Service in the hammingCodeApp.
 */
angular.module('binaryutils', [])
  .service('binaryUtils', BinaryUtils);
