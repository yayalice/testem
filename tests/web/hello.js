if (typeof module !== 'undefined'){
    module.exports = hello;
}

function hello(name){
    if (name){
        throw new Error('You are not supposed to supply a name!');
    }
    return 'hello world';
}