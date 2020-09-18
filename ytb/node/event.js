import { EventEmitter } from "events";

const e = new EventEmitter()

e.on('foo', (n,a) => {
    console.log('触发了foo');
    console.log(`${n}今年${a}岁了`);
})

e.once('one',()=>{
    console.log('触发了 once，只会触发一次，多次emit也没用');
})

e.prependListener('pre',() => {
    console.log('prependListener 触发了 pre，但是有什么用？');
})


const timer = setInterval(() => {
    e.emit('pre',)
    e.emit('foo','毛毛',15)
    e.emit('one',)
    
    console.log('=======================================');
}, 1000)

setTimeout(() => {
    clearInterval(timer)
}, 5000);