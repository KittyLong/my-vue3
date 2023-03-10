import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppAPI } from "./createApp";

import { Fragment, Text } from "./vnode";
export function createRenderer(options) {
    const { createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options

    function render(vnode, container) {
        patch(null, vnode, container, null, null)
    }
    //n1 旧节点
    //n2 新节点
    function patch(n1, n2, container, parentComponent, anchor) {
        debugger
        // ShapeFlags
        // vnode ->flag
        //Fragment ->只渲染children
        const { shapeFlag, type } = n2
        switch (type) {
            //slot渲染内容避免多一层div包含
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent, anchor)
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

    function processFragment(n1, n2: any, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor)
    }
    function processElement(n1, n2, container, parentComponent, anchor) {

        if (!n1) {
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        // 处理更新对比
        // 对比新旧props
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        const el = (n2.el = n1.el)
        // const el = n2.el
        patchChildren(n1, n2, el, parentComponent, anchor)
        patchProps(el, oldProps, newProps)
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const c1 = n1.children;
        const c2 = n2.children;
        const oldShapFlag = n1.shapeFlag
        const newShapFlag = n2.shapeFlag
        // array -> text
        if (newShapFlag & ShapeFlags.TEXT_CHILDREN) {
            if (oldShapFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 清除原children
                unmountChildren(n1.children)
            }
            // text->text
            if (c1 !== c2) {
                // 设置text children
                hostSetElementText(container, c2)
            }
        } else {
            // text->array
            if (oldShapFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '')
                mountChildren(n2.children, n2.el, parentComponent, anchor)
            } else {
                // array->array
                patchKeyedChildren(c1, c2, container, parentComponent)
            }

        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent) {
        let j = 0
        let newEnd = c2.length - 1
        let oldEnd = c1.length - 1
        function isSameNode(v1, v2) {

            return v1.type === v2.type && v1.key === v2.key
        }
        // 左侧的处理
        while (j <= newEnd && j <= oldEnd) {
            const n1 = c1[j]
            const n2 = c2[j]
            if (isSameNode(n1, n2)) {
                patch(n1, n2, container, parentComponent, null)
            } else {
                break
            }
            j++
        }
        //右侧相同处理
        while (j <= newEnd && j <= oldEnd) {
            const n1 = c1[oldEnd]
            const n2 = c2[newEnd]
            if (isSameNode(n1, n2)) {
                patch(n1, n2, container, parentComponent, null)
            } else {
                break
            }
            newEnd--
            oldEnd--
        }
        // 中间不同的
        if (j > oldEnd && j <= newEnd) {
            // 新增
            // 锚点就是尾部相同节点第一个 C就是锚点 因为 C插入M之后再插入N才能保证顺序
            // new : A B C D
            // old : A B M N C D
            const anchorIndex = newEnd + 1
            const anchor = anchorIndex < c2.length ? c2[anchorIndex].el : null
            while (j <= newEnd) {
                patch(null, c2[j++], container, parentComponent, anchor)
            }
        } else if (j <= oldEnd && j > newEnd) {
            // 删除
            while (j <= oldEnd) {
                hostRemove(c1[j++].el)
            }
        } else {
            //非理想状态
            let count = newEnd - j + 1 //新节点中间部分长度
            let pos = 0 //记录最大index 判断是否需要移动位置
            let moved = false //是否需要移动
            let patched = 0
            let newIndexToOldIndexMap = new Array(count).fill(0) //新节点中间非理想状态节点在旧节点中的位置,用于求最长递增子序列
            let keyIndexs = {} //在新节点中节点key和index的映射关系

            for (let i = j; i <= newEnd; i++) {
                keyIndexs[c2[i].key] = i
            }
            for (let i = j; i <= oldEnd; i++) {

                let oldNode = c1[i]
                if (patched >= count) {
                    hostRemove(oldNode.el)
                    continue
                }
                let newKeyIndex = keyIndexs[oldNode.key] //对应老节点在新节点中的位置
                if (newKeyIndex !== undefined) {
                    newIndexToOldIndexMap[newKeyIndex - j] = i
                    if (newKeyIndex >= pos) {
                        pos = newKeyIndex //递增序列不需要移动所以如果有后面的节点index变小就需要移动
                    } else {
                        moved = true
                    }
                    patch(oldNode, c2[newKeyIndex], container, parentComponent, null)
                    patched++
                } else {
                    hostRemove(oldNode.el)
                }
            }

            //获取最长递增子序列 这里返回的是最长递增子序列的index 所以下面比价是i和arrIncrease的值比较
            let increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
            let increaseIndex = increasingNewIndexSequence.length - 1
            // 从后往前遍历 保证insertBefore插入的anchor已经处理过
            for (let i = count - 1; i >= 0; i--) {
                const newIndex = j + i
                const newNode = c2[newIndex]
                const anchor = newIndex + 1 < c2.length ? c2[newIndex + 1].el : null

                if (newIndexToOldIndexMap[i] === 0) {
                    // 新增元素
                    patch(null, newNode, container, parentComponent, anchor)
                } else if (i !== increasingNewIndexSequence[increaseIndex]) {
                    // 所以下面比价是i和arrIncrease的值比较
                    // patch(null,newNode,container,parentComponent,anchor)
                    // 不在递增子序列里面 需要移动
                    // const preNode = 
                    hostInsert(newNode.el, container, anchor)
                } else {
                    increaseIndex--
                }
            }

        }

    }
    function unmountChildren(children) {
        children.forEach(element => {
            hostRemove(element)
        });
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (let key in newProps) {
                const oldProp = oldProps[key]
                const newProp = newProps[key]
                if (oldProp !== newProp) {
                    hostPatchProp(el, key, oldProp, newProp)
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (let key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }
    function mountElement(vnode: any, container: any, parentComponent, anchor) {
        const el = hostCreateElement(vnode.type)
        vnode.el = el
        const { children, props, shapeFlag } = vnode

        // string , array
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children

        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            //vnode
            mountChildren(vnode.children, el, parentComponent, anchor)
        }
        for (const key in props) {
            const val = props[key]
            hostPatchProp(el, key, null, val)
        }
        hostInsert(el, container, anchor)
        // container.append(el)
    }
    function mountChildren(children, container, parentComponent, anchor) {
        //vnode
        children.forEach(item => {
            patch(null, item, container, parentComponent, anchor)
        })
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {

        debugger
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor)
        } else {
            updateComponent(n1, n2)
        }

    }
    function updateComponent(n1, n2) {
        debugger
        const instance = (n2.component = n1.component)
        if (shouldUpdateComponent(n1, n2)) {
            // next 为新节点
            instance.next = n2
            instance.update()
        } else {
            n2.el = n1.el
            instance.vnode = n2
        }
        // 判断是否需要更新
        // 更新 props
        // render调用
    }
    function mountComponent(initialVnode, container, parentComponent, anchor) {
        debugger
        const instance = createComponentInstance(initialVnode, parentComponent)
        initialVnode.component = instance
        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container, anchor)
    }

    function setupRenderEffect(instance: any, initialVnode, container, anchor) {
        debugger
        instance.update = effect(() => {
            debugger
            if (!instance.isMounted) {
                const subTree = instance.subTree = instance.render.call(instance.proxy)
                //vnode->path
                //vode->element->mountelement

                patch(null, subTree, container, instance, anchor)
                //element 都mount完成
                initialVnode.el = subTree.el
                instance.isMounted = true
            } else {
                const {next,vnode} = instance
                if(next){
                    next.el = vnode.el
                    updateComponentPreRender(instance,next)
                }
                const subTree = instance.render.call(instance.proxy)
                const preSubTree = instance.subTree
                instance.subTree = subTree
                // 初始化时subtree被赋值 这里的substree没有
                subTree.el = preSubTree.el
                patch(preSubTree, subTree, container, instance, anchor)
            }

        })

    }
    return {
        createApp: createAppAPI(render)
    }
}
function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
  
    instance.props = nextVNode.props;
  }
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
