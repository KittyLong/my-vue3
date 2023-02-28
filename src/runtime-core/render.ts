import { isObject } from "../reactivity/shared/index";
import { ShapeFlags } from "../reactivity/shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {

    // patch
    //
    patch(vnode, container,null)
}

function patch(vnode, container,parentComponent) {
    // ShapeFlags
    // vnode ->flag
    //Fragment ->只渲染children
    const { shapeFlag, type } = vnode
    switch (type) {
        case Fragment: processFragment(vnode, container,parentComponent)
            break;
        case Text: processText(vnode, container)
            break;
        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                mountElement(vnode, container,parentComponent)
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container,parentComponent)
            }
            break;
    }

}
function processText(vnode: any, container,) {
    const { children } = vnode
    const textNode = document.createTextNode(children)
    vnode.el = textNode
    container.append(textNode)
}

function processFragment(vnode: any, container,parentComponent) {
    mountChildren(vnode, container,parentComponent)
}

function mountElement(vnode: any, container: any,parentComponent) {
    const el = document.createElement(vnode.type)
    vnode.el = el
    const { children, props, shapeFlag } = vnode
    // string , array
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children

    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //vnode
        mountChildren(vnode, el,parentComponent)
    }
    const eventTxt = /^on[A-Z]/
    for (const key in props) {
        const val = props[key]
        const isOn = (key: string) => eventTxt.test(key)
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val)
        }
    }
    container.append(el)
}
function mountChildren(vnode, container,parentComponent) {
    //vnode
    vnode.children.forEach(item => {
        patch(item, container,parentComponent)
    })
}
function processComponent(vnode, container,parentComponent) {

    // 
    mountComponent(vnode, container,parentComponent)

}
function mountComponent(initialVnode, container,parentComponent) {
    const instance = createComponentInstance(initialVnode,parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance: any, initialVnode, container) {
    const subTree = instance.render.call(instance.proxy)
    //vnode->path
    //vode->element->mountelement

    patch(subTree, container,instance)
    //element 都mount完成
    initialVnode.el = subTree.el
}

