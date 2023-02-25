export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState:{}
    }

    return component
}

export function setupComponent(instance) {

    // TODO
    // init props
    // init slots

    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
    const Component = instance.vnode.type

    // context
    instance.proxy = new Proxy({},{
        get(target,key){
            //setupState
            const setupState = instance.setupState
            if(key in setupState){
                return setupState[key]
            }
        }
    })
    const { setup } = Component
    if (setup) {
        const setupResult = setup()
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

