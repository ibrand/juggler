
var assert = require('assert');
var vector = require('../vector');

describe('vectors', function(){
    describe('add', function(){
        it('should add the two inputted vectors values',
            function(){
                var result = vector.add({x:3, y:2}, {x:2,y:3});
                assert.equal(5, result.x);
                assert.equal(5, result.x);
            });
    });
});