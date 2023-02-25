import { h } from "../lib/guide-mini-vue.esm.js"
window.self = null
export const App = {
    //.vue
    //<template>
    //render 

    render() {
        window.self = this
        return h('div', {
            id: 'root',
            class: ['red', 'hard']
        },

            // string
            'hi,' + this.msg
            // array
            // [h('p',{class:'red'},'hi'),h('p',{class:'blue'},'mini-vue')])
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