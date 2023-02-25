import { isObject } from "../reactivity/shared/index";
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {

    // patch
    //

    patch(vnode, container)
}

function patch(vnode, container) {
    // SHapeFlags
    // vnode ->flag
    //
    if (typeof vnode.type === 'string') {
        mountElement(vnode, container)
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container)
    }
}
function mountElement(vnode: any, container: any) {
    const el = document.createElement(vnode.type)
    vnode.el = el
    const {children,props} = vnode
    // string , array
    if(typeof children ==='string'){
        el.textContent = children

    }else if(Array.isArray(children)){
        //vnode
        mountChildren(children,el)
    }
    for (const key in props) {
       const val = props[key]
       el.setAttribute(key,val)
    }
    container.append(el)
}
function mountChildren (children,container){
          //vnode
          children.forEach(item=>{
            patch(item,container)
        })
}
function processComponent(vnode, container) {

    // 
    mountComponent(vnode, container)

}
function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode)

    setupComponent(instance)
    setupRenderEffect(instance,initialVnode, container)
}

function setupRenderEffect(instance: any, initialVnode,container) {
    const subTree = instance.render.call(instance.proxy)
    //vnode->path
    //vode->element->mountelement

    patch(subTree, container)
    //element 都mount完成
    initialVnode.el = subTree.el
}

