import {  h ,getCurrentInstance} from "../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"
export const App = {
    //.vue
    //<template>
    //render 
    name: 'App',
    render() {
        return h('div',{},[h('p',{},'currentInstance demo'),h(Foo)])
        // return h(Foo,{},'Appfoo')
    },
    setup() {
        const instance = getCurrentInstance()
        console.log('APP',instance);
    }
}