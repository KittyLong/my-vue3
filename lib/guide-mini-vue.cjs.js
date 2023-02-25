'use strict';

const isObject = (val) => {
    return val !== null && typeof val === "object";
};

const publciPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceHandlers = {
    get({ _: instance }, key) {
        //setupState
        const setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publciPropertiesMap[key];
        if (publicGetter) {
            return publicGetter;
        }
        //setup
        //$data
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // init props
    // init slots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.vnode.type;
    // context
    instance.proxy = new Proxy({ _: instance }, PublicInstanceHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    //function object
    // TODO funciton
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if(Component.render){
    instance.render = Component.render;
    // }
}

function render(vnode, container) {
    // patch
    //
    patch(vnode, container);
}
function patch(vnode, container) {
    // SHapeFlags
    // vnode ->flag
    //
    if (typeof vnode.type === 'string') {
        mountElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    vnode.el = el;
    const { children, props } = vnode;
    // string , array
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        //vnode
        mountChildren(children, el);
    }
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(children, container) {
    //vnode
    children.forEach(item => {
        patch(item, container);
    });
}
function processComponent(vnode, container) {
    // 
    mountComponent(vnode, container);
}
function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    const subTree = instance.render.call(instance.proxy);
    //vnode->path
    //vode->element->mountelement
    patch(subTree, container);
    //element 都mount完成
    initialVnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换成vnode
            // component ->vnode
            //所有的逻辑操作都会基于vnode做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
