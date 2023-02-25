import { isObject } from "../reactivity/shared/index";
import { ShapeFlags } from "../reactivity/shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {

    // patch
    //

    patch(vnode, container)
}

function patch(vnode, container) {
    // ShapeFlags
    // vnode ->flag
    //
    const { shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.ELEMENT) {
        mountElement(vnode, container)
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
    }
}
function mountElement(vnode: any, container: any) {
    const el = document.createElement(vnode.type)
    vnode.el = el
    const { children, props, shapeFlag } = vnode
    // string , array
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children

    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //vnode
        mountChildren(children, el)
    }
    const eventTxt = /^on[A-Z]/
    for (const key in props) {
        const val = props[key]
        const isOn = (key:string) => /^on[A-Z]/.test(key)
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val)
        }else{
            el.setAttribute(key, val)
        }
    }
    container.append(el)
}
function mountChildren(children, container) {
    //vnode
    children.forEach(item => {
        patch(item, container)
    })
}
function processComponent(vnode, container) {

    // 
    mountComponent(vnode, container)

}
function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode)

    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance: any, initialVnode, container) {
    const subTree = instance.render.call(instance.proxy)
    //vnode->path
    //vode->element->mountelement

    patch(subTree, container)
    //element 都mount完成
    initialVnode.el = subTree.el
}

