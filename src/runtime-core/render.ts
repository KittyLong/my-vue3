import { isObject } from "../reactivity/shared/index";
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {

    // patch
    //

    patch(vnode, container)
}

function patch(vnode, container) {

    //TODO: 判断vnode是不是一个element
    //是elelment那么就该处理element
    //如何区分是element还是component类型
    console.log(vnode.type);
    if (typeof vnode.type === 'string') {
        mountElement(vnode, container)
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container)
    }
}
function mountElement(vnode: any, container: any) {
    const el = document.createElement(vnode.type)

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
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode)

    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container) {
    const subTree = instance.render.call(instance.proxy)
    //vnode->path
    //vode->element->mountelement

    patch(subTree, container)
}

