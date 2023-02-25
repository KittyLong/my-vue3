import { h } from "../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"

window.self = null
export const App = {
    //.vue
    //<template>
    //render 
    name:'App',
    render() {
        window.self = this
        return h('div', {
            id: 'root',
            class: ['red', 'hard'],
            onClick() {
                console.log('click')
            }
        },

            // string
            // 'hi,' + this.msg
            // array
            // [h('p',{class:'red'},'hi'),h('p',{class:'blue'},'mini-vue')])
           [h('div',{},'hi'+this.msg), h(Foo,{count:1})]
        )
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