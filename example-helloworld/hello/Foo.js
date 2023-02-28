import { h } from "../../lib/guide-mini-vue.esm.js";
export const Foo = {
    // 1.setup接收props
    // 2.this.xx可以直接访问到props中的属性
    // 3.props的属性是readonly
    setup(props,{emit}) {
        const emitAdd = ()=>{
            console.log('emitAdd');
            emit('add',1,2)
            // add-foo
            emit('add-foo',1,2)
        }
        return {
            emitAdd
        }
    },
    render() {
        
        const btn = h('button',{
            onClick:this.emitAdd,


        },'emitAdd')
        return h('p', {}, ['foo' + this.count,btn])
    }
}