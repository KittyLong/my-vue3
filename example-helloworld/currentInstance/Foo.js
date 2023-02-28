import { h ,getCurrentInstance} from "../../lib/guide-mini-vue.esm.js";
export const Foo = {
    // 1.setup接收props
    // 2.this.xx可以直接访问到props中的属性
    // 3.props的属性是readonly
    name:'Foo',
    setup() {
        const instance = getCurrentInstance()
        console.log('Foo', instance);
    },

    render() {

        return h('p', {},'foo')
    }
}