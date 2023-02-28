import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js";
const Provider = {
    name:'Provider',
    setup(){
        provide('foo','fooval')
        provide('bar','barval')
    },
    render(){
        return h('div',{},[h('p',{},"Provider"),h(Provider2)])
    }
}
const Provider2 = {
    name:'Provider2',
    setup(){
        provide('foo','foo2')
        const foo = inject('foo')
        return {
            foo
        }
    },
    render(){
        return h('div',{},[h('p',{},`Provider2 foo:${this.foo}`),h(Provider3)])
    }
}
const Provider3 ={
    name:'Consumer',
    setup(){
        const foo = inject('foo')
        const bar = inject('bar')

        return {
            foo,
            bar
        }
    },
    render(){
        return h('div',{},`Provider3:foo - ${this.foo} bar- ${this.bar}`)
    }
}
export default {
    name:'App',
    setup(){},
    render(){
        return h('div',{},[h('p',{},'apiInject'),h(Provider)])
    }
}