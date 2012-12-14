if (typeof module !== 'undefined'){
    var hello = require('./hello');
}

describe('hello', function(){
    it('says hello world', function(){
        hello();
    });

    it('says hello to human', function(){
        hello('bob');
    });
});