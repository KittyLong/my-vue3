import { h,renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const FooSlots = {

    setup(props,{emit}) {

    },
    render() {
        
        const foo = h('p',{},'footest')

        const age = 19
        // children->vnode 
        // renderSlots方法
        // return h('div',{},[foo,renderSlots(this.$slots)])

        //渲染到指定位置 具名插槽
        //1.获取要渲染的元素
        // 2.获取要渲染元素的位置
        // return h('div',{},[renderSlots(this.$slots,'header'),foo,renderSlots(this.$slots,'footer')])
        //作用域插槽
        return h('div',{},[renderSlots(this.$slots,'header',{age}),foo])

    }
}