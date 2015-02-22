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

'use strict';

/**
 * Hamming code stream.
 */
function HammingEncoder(binaryUtils) {
    this.binaryUtils = binaryUtils;

    this.reset();
}
HammingEncoder.$inject = ["binaryUtils"];

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

'use strict';

/**
 * @ngdoc overview
 * @name hammingCodeApp
 * @description
 * # hammingCodeApp
 *
 * Main module of the application.
 */
angular
  .module('hammingCodeApp', ['underscore', 'binaryutils', 'hammingencoder']);

'use strict';

/**
 * @ngdoc function
 * @name hammingCodeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the hammingCodeApp
 */
angular.module('hammingCodeApp').controller('MainCtrl', ["$scope", "_", "binaryUtils", "hammingEncoder", function($scope, _, binaryUtils, hammingEncoder) {

    function getInputBits(input) {
        return binaryUtils.stringToBinary(input);
    }

    /**
     * Create a hamming code for the input bits.
     * @param inputBits input bit array
     * @param hamming code bit array
     */
    function getEncodedBits(inputBits) {
        // TODO: Refactor HammingEncoder
        hammingEncoder.reset();
        hammingEncoder.appendBits(inputBits);
        return hammingEncoder.getCode();
    }

    /**
     * Align the input bits with their positions within the hamming code by
     * injecting empty columns at every index that's a power of two.
     * @param inputBits input bits
     * @return spaced input bits
     */
    function skipTwoPowers(inputBits) {
        var currentIndex = 1;
        return _.reduce(inputBits, function(memo, bit) {
            while (binaryUtils.isTwoPower(currentIndex)) {
                memo.push(undefined);
                currentIndex++;
            }

            memo.push(bit);
            currentIndex++;

            return memo;
        }, []);
    }

    /**
     * Get an array containing the indexes of bits. The indexes are 1 indexed
     * (meaning starting at one).
     * @param bits the array whose length we're indexing
     * @return array of numbers
     */
    function getHammingIndexes(bits) {
        return _.range(1, bits.length + 1);
    }

    /**
     * Get the hamming indexes which are powers of two.
     * @param bits the array whose length we're indexing
     * @return array of numbers which are powers of two
     */
    function getPowersOfTwo(bits) {
        return _.filter(getHammingIndexes(bits), function(hammingIndex) {
            return binaryUtils.isTwoPower(hammingIndex);
        });
    }

    /**
     * Explode the hamming code into rows. Each row represents a power of two.
     * Each column represents the bits which apply to that power of two.
     * @param hammingCodeBits hamming code bits to explode
     * @return [ ..., {
     *      powerOfTwo: 8,
     *      flipped: true,
     *      bits: [ ..., {
     *          bit: 1,
     *          flipped:true } ] } ]
     */
    function getExplodedCalc(hammingCodeBits) {
        var incorrectPowersOfTwo = getCalculatedPowersOfTwo(hammingCodeBits);

        return _.map(getPowersOfTwo(hammingCodeBits), function(powerOfTwo) {
            var bits = _.map(hammingCodeBits, function(bit, index) {
                var hammingIndex = index + 1;
                var masked       = (powerOfTwo & hammingIndex); // jshint ignore:line: binary and desired
                var flipped      = incorrectPowersOfTwo[hammingIndex] &&
                                  (powerOfTwo === hammingIndex); // only indicate a flip on powers of two
                return {
                    bit: masked ? bit : undefined,
                    flipped: flipped
                };
            });

            return {
                powerOfTwo: powerOfTwo,
                flipped: incorrectPowersOfTwo[powerOfTwo],
                bits: bits
            };
        });
    }

    /**
     * Get a map of powers of two to a boolean indicating that the calculation was incorrect.
     * @param receivedBits hamming code bits to verify
     * @return map of powers of two to a boolean whose true value means the calculation was incorrect
     */
    function getCalculatedPowersOfTwo(receivedBits) {
        return _.reduce(receivedBits, function(memo, receivedBit, index) {

            var hammingIndex = index + 1;
            var isPowerOfTwo = binaryUtils.isTwoPower(hammingIndex);

            // Initialize the flipped state to zero
            if (memo[hammingIndex] === undefined && isPowerOfTwo) {
                memo[hammingIndex] = false;
            }

            // Zero bits have no effect on the calculation
            if (0 === receivedBit) {
                return memo;
            }

            if (isPowerOfTwo) {
                memo[hammingIndex] = !memo[hammingIndex];

            } else {
                var power = 0;
                var shiftedIndex = hammingIndex;
                while (shiftedIndex !== 0) {
                    if ((shiftedIndex & 1) === 1) {     // jshint ignore:line: binary and desired
                        var twoPowerIndex = 1 << power; // jshint ignore:line: binary shift desired
                        memo[twoPowerIndex] = !memo[twoPowerIndex];
                    }
                    power++;
                    shiftedIndex = shiftedIndex >> 1; // jshint ignore:line: binary shift desired
                }
            }
            return memo;
        }, {});
    }

    /**
     * Get the list of indexes which are incorrect.
     * @param explodedCalc output from getExplodedCalc
     * @return list of hamming indexes which are incorrect
     */
    function getIncorrectIndexes(explodedCalc) {
        return _.chain(explodedCalc)
            .filter(function(powerRow) {
                return powerRow.flipped;
            })
            .pluck('powerOfTwo')
            .value();
    }

    function calculateReceived(receivedBits) {

        var bits             = _.pluck(receivedBits, 'bit');
        var explodedCalc     = getExplodedCalc(bits);
        var incorrectIndexes = getIncorrectIndexes(explodedCalc);

        $scope.receivedBits     = receivedBits;
        $scope.explodedCalc     = explodedCalc;
        $scope.incorrectIndexes = incorrectIndexes;

        $scope.incorrectIndex = _.reduce(incorrectIndexes, function(memo, hammingIndex) {
            return memo + hammingIndex;
        }, 0);
    }

    $scope.input = 'hi';
    $scope.onInputChange = function(input) {
        var inputBits      = getInputBits(input);
        var encodedBits    = getEncodedBits(inputBits);
        var hammingIndexes = getHammingIndexes(encodedBits);
        var receivedBits = _.map(encodedBits, function(bit) {
            return {
                bit: bit,
                flipped: false
            };
        });

        $scope.hammingIndexes = hammingIndexes;
        $scope.inputBits      = skipTwoPowers(inputBits);
        $scope.encodedBits    = encodedBits;

        calculateReceived(receivedBits);
    };
    $scope.onInputChange($scope.input);

    $scope.flip = function(index) {
        var receivedBits = $scope.receivedBits;
        var receivedBit  = receivedBits[index];

        receivedBit.bit     = receivedBit.bit === 1 ? 0 : 1;
        receivedBit.flipped = !receivedBit.flipped;

        calculateReceived(receivedBits);
    };
}]);
