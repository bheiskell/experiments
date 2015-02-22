'use strict';

describe('Controller: MainCtrl', function() {

    var MainCtrl,
        scope;

    beforeEach(module('hammingCodeApp'));
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        MainCtrl = $controller('MainCtrl', {
            $scope: scope
        });
    }));

    it('should have correct encoded bit', function () {
        scope.input = 'a';
        scope.onInputChange('a');

        expect(scope.hammingIndexes).toEqual([
            1,2,3,4,5,6,7,8,9,10,11,12
        ]);
        expect(scope.inputBits).toEqual([
            undefined,undefined,1,undefined,0,0,0,undefined,0,1,1,0
        ]);
        expect(scope.encodedBits).toEqual([
            0,1,1,0,0,0,0,0,0,1,1,0
        ]);
        expect(scope.receivedBits).toEqual([
            { bit: 0, flipped: false },
            { bit: 1, flipped: false },
            { bit: 1, flipped: false },
            { bit: 0, flipped: false },
            { bit: 0, flipped: false },
            { bit: 0, flipped: false },
            { bit: 0, flipped: false },
            { bit: 0, flipped: false },
            { bit: 0, flipped: false },
            { bit: 1, flipped: false },
            { bit: 1, flipped: false },
            { bit: 0, flipped: false }
        ]);
        expect(scope.incorrectIndexes).toEqual([]);
        expect(scope.incorrectIndex).toBe(0);

        scope.flip(2); // flip third bit
        expect(scope.incorrectIndexes).toEqual([1,2]);
        expect(scope.incorrectIndex).toBe(3);
    });
});
