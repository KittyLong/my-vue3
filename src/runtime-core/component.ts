import { PublicInstanceHandlers } from "./componentPublicInstance"
import { initProps } from "./componentProps"
import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initSlots } from "./componentSlots"
import { proxyRefs } from "../reactivity"

let currentInstance = null

export function createComponentInstance(vnode,parent) {
    
    const component = {
        isMounted:false,
        vnode,
        next:null,
        type: vnode.type,
        setupState:{},
        props:{},
        slots:{},
        provides:parent?parent.provides:{},
        parent,
        emit:()=>{}
    }
    component.emit = emit.bind(null,component) as any
    return component
}

export function setupComponent(instance) {

    initProps(instance,instance.vnode.props)
    initSlots(instance,instance.vnode.children)
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
    const Component = instance.vnode.type
    debugger
    // context
    instance.proxy = new Proxy({_:instance},PublicInstanceHandlers)
    const { setup } = Component

    if (setup) {
        //getCurrentInstance只能在setup和生命周期函数中调用
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props),{emit:instance.emit})
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }
}
function handleSetupResult(instance, setupResult: any) {

    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult)
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type
    if (compiler && !Component.render) {
        if (Component.template) {
          Component.render = compiler(Component.template);
        }
      }
    instance.render = Component.render
}
export function getCurrentInstance(){
  return currentInstance
}
export function setCurrentInstance(instance){
    currentInstance = instance
}
let compiler;

export function registerRuntimeCompiler(_compiler) {
  compiler = _compiler;
}
