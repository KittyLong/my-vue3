import { PublicInstanceHandlers } from "./componentPublicInstance"
import { initProps } from "./componentProps"
import { shallowReadonly } from "../reactivity/reactive"
export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState:{},
        props:{}
    }

    return component
}

export function setupComponent(instance) {

    // TODO
    // init props
    initProps(instance,instance.vnode.props)
    // init slots

    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
    const Component = instance.vnode.type

    // context
    instance.proxy = new Proxy({_:instance},PublicInstanceHandlers)
    const { setup } = Component
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props))
        handleSetupResult(instance, setupResult)
    }
}
function handleSetupResult(instance, setupResult: any) {
    //function object
    // TODO funciton
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type

    // if(Component.render){
    instance.render = Component.render
    // }
}
