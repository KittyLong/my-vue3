import { h } from "../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"
import { FooSlots } from "./FooSlots.js"
window.self = null
export const App = {
    //.vue
    //<template>
    //render 
    name: 'App',
    render() {
        window.self = this
        const app = h('div', {}, 'Apptest')
        // return h('div', {
        //     id: 'root',
        //     class: ['red', 'hard'],
        // },

        //     // string
        //     // 'hi,' + this.msg
        //     // array
        //     // [h('p',{class:'red'},'hi'),h('p',{class:'blue'},'mini-vue')])
        // //    [h('div',{},'hi'+this.msg), h(Foo,
        // //     {
        // //         count:1,
        // //         onAdd(a,b){
        // //             console.log('add',a+b)
        // //         },
        // //         onAddFoo(a,b){
        // //             console.log('addFoo',a+b)
        // //         }
        // //     }
        // //     )]
        // slot为数组
        // const foo = h(FooSlots,{},[h('p',{},'123'),h('p',{},'456')])
        // slot为单个元素
        // const foo = h(FooSlots,{},h('p',{},'123'))
        //slot 具名slot
        // const foo = h(FooSlots,{},{
        //     header:h('p',{},'123'),
        //     footer:h('p',{},'456')
        // })
        //z作用域插槽
        // const foo = h(FooSlots, {}, {
        //     header: (age) =>
        //         h('p', {}, age)
        //     ,
        //     // footer:({age})=> h('p', {}, age)
        // })
        const foo = h(FooSlots, {}, {
            header: ({age}) =>
                //TODO 这里目前children用字符转 暂时不只支持纯数字 shapeFlags缺少类型 后期补充
                h('p', {}, 'foott' + age)
            ,
            // footer:({age})=> h('p', {}, age)
        })
        // ------------------------------------

        // // -------------------------slots
        // )
        return h('div', {}, [app, foo])
    },
    setup() {
        // composition api
        // setupState
        // this.$el-> get root element
        // proxy
        return {
            msg: 'mini-vue-hah'
        }
    }
}