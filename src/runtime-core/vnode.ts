import { ShapeFlags } from "../reactivity/shared/ShapeFlags"

export function createVNode(type, props?, children?) {
    
    const vnode = {
        type,
        props,
        children,
        el:null,
        shapeFlag:getShapeFlags(type),
    }
    //children
    if(typeof children==='string'){
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    }else if(Array.isArray(children)){
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }
    //slots children
    //组件类型,children是object
    if(vnode.shapeFlag& ShapeFlags.STATEFUL_COMPONENT){
        if(typeof children==='object'){
            vnode.shapeFlag = ShapeFlags.SLOT_CHILDREN
        }
    }
    return vnode
}
function getShapeFlags(type){
    return typeof type === 'string'?ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}