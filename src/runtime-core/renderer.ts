import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { craeteAppApI } from "./createApp";

import { Fragment, Text } from "./vnode";
export function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

    function render(vnode, container) {
        patch(null, vnode, container, null)
    }
    //n1 旧节点
    //n2 新节点
    function patch(n1, n2, container, parentComponent) {
        // ShapeFlags
        // vnode ->flag
        //Fragment ->只渲染children
        const { shapeFlag, type } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent)
                }
                break;
        }

    }
    function processText(n1, n2: any, container,) {
        const { children } = n2
        const textNode = document.createTextNode(children)
        n2.el = textNode
        container.append(textNode)
    }

    function processFragment(n1, n2: any, container, parentComponent) {
        mountChildren(n2, container, parentComponent)
    }
    function processElement(n1, n2, container, parentComponent){
        if(!n1){
        mountElement(n1, n2, container, parentComponent)

        }else{
            patchElement(n1,n2,container)
        }
    }
    function patchElement(n1,n2,container){
        // console.log(patch())
        console.log('patchelement')
        console.log(n1)
        console.log(n2)
        // 处理更新对比
    }
    function mountElement(n1, n2: any, container: any, parentComponent) {
        debugger
        const el = hostCreateElement(n2.type)
        n2.el = el
        const { children, props, shapeFlag } = n2
        console.log(props)

        // string , array
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children

        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            //vnode
            mountChildren(n2, el, parentComponent)
        }
        for (const key in props) {
            const val = props[key]
            hostPatchProp(el, key, val)
        }
        hostInsert(el, container)
        // container.append(el)
    }
    function mountChildren(vnode, container, parentComponent) {
        //vnode
        vnode.children.forEach(item => {
            patch(null, item, container, parentComponent)
        })
    }
    function processComponent(n1, n2, container, parentComponent) {

        // 
        mountComponent(n2, container, parentComponent)

    }
    function mountComponent(initialVnode, container, parentComponent) {
        debugger
        const instance = createComponentInstance(initialVnode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container)
    }

    function setupRenderEffect(instance: any, initialVnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const subTree = instance.subTree = instance.render.call(instance.proxy)
                //vnode->path
                //vode->element->mountelement

                patch(null, subTree, container, instance)
                //element 都mount完成
                initialVnode.el = subTree.el
                instance.isMounted = true
            } else {
                const subTree = instance.render.call(instance.proxy)
                const preSubTree = instance.subTree
                instance.subTree = subTree
                patch(preSubTree, subTree, container, instance)
            }

        })
    }
    return {
        createApp: craeteAppApI(render)
    }
}

