"use strict";

var createClient = require('../'),
    assert = require('assert');

describe('ssh client', function(){
    it('should work', function(done){
        var client = createClient('ubuntu', 'lucas-dev.ex.fm', function(){
            client.exec('pwd', function(err, out){
                assert.ifError(err);
                done();
            });
        });
    });
});