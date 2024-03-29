const extend = Object.assign;
const EMPTY_OBJ = {};
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const toDisplayString = val => String(val);
const isString = (value) => typeof value === "string";
const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
// 转大写
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// 加on
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

let activeEffect;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.active = true; //stop状态标识
        this.deps = [];
        this._fn = fn;
    }
    ;
    run() {
        if (!this.active) {
            return this._fn();
        }
        // 应该收集
        // 应该收集 shouldtrack 只有通过effect.run 即effect中的 obj.xx获取才进行依赖收集 非effect封装的get操作不进行依赖收集
        shouldTrack = true;
        activeEffect = this;
        // this._fn() 会触发get从而track
        // cleanupEffect(this)
        const res = this._fn();
        //reset
        shouldTrack = false;
        // computed需要返回值
        return res;
    }
    ;
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    // const effToRun = new Set()
    // dep && dep.forEach(effect => {
    //     if (effect.computed) {
    //         effToRun.add(effect)
    //     } else {
    //         if (effect !== activeEffect) {
    //             effToRun.add(effect)
    //         }
    //     }
    // })
    // effToRun.forEach((eff: any) => {
    //     if (eff.scheduler) {
    //         eff.scheduler()
    //     } else {
    //         eff.run()
    //     }
    // })
    for (const eff of dep) {
        if (eff.scheduler) {
            eff.scheduler();
        }
        else {
            eff.run();
        }
    }
}
function effect(fn, options = {}) {
    let _effect = new ReactiveEffect(fn, options.scheduler);
    _effect = extend(_effect, options);
    _effect.run();
    const runnner = _effect.run.bind(_effect);
    runnner.effect = _effect;
    return runnner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        //看res是不是object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`target key is readonly`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} 不是一个对象`);
    }
    return new Proxy(target, baseHandlers);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        debugger;
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlags(type),
    };
    //children
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    //slots children
    //组件类型,children是object
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        //funciton
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const publciPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
};
const PublicInstanceHandlers = {
    get({ _: instance }, key) {
        //setupState
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publciPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
        //setup
        //$data
        // $props
    }
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

function emit(instance, event, ...args) {
    debugger;
    //instance.props里面是否有emit event
    const { props } = instance;
    //TPP由点到面
    // const handler = props['onAdd']
    // handler && handler()
    // 驼峰
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initSlots(instance, children) {
    // slots 处理判断
    //   instance.slots = Array.isArray(children)?children:[children]
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normallizeSlotValue(value(props));
    }
}
function normallizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    const component = {
        isMounted: false,
        vnode,
        next: null,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.vnode.type;
    debugger;
    // context
    instance.proxy = new Proxy({ _: instance }, PublicInstanceHandlers);
    const { setup } = Component;
    if (setup) {
        //getCurrentInstance只能在setup和生命周期函数中调用
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template);
        }
    }
    instance.render = Component.render;
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
}

function provide(key, val) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = val;
    }
}
function inject(key, defaultValue) {
    debugger;
    const instance = getCurrentInstance();
    const { provides } = instance.parent;
    if (provides[key]) {
        return provides[key];
    }
    else if (defaultValue) {
        if (typeof defaultValue === 'function') {
            return defaultValue();
        }
        return defaultValue;
    }
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转换成vnode
                // component ->vnode
                //所有的逻辑操作都会基于vnode做处理
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

const p = Promise.resolve();
const queue = [];
// 控制执行频率
let isFlushPending = false;
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    // 没有isFlushPending每添加一个任务就会开始执行 执行多次
    // 加入这个控制只有第一次进来执行 后面再添加任务的代码是同步的,nextTick中的代码是微任务在执行时job已经添加完成
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    console.log('123');
    isFlushPending = false;
    let job;
    while ((job = queue.shift())) {
        job && job();
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null, null);
    }
    //n1 旧节点
    //n2 新节点
    function patch(n1, n2, container, parentComponent, anchor) {
        debugger;
        // ShapeFlags
        // vnode ->flag
        //Fragment ->只渲染children
        const { shapeFlag, type } = n2;
        switch (type) {
            //slot渲染内容避免多一层div包含
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = document.createTextNode(children);
        n2.el = textNode;
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        // 处理更新对比
        // 对比新旧props
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        // const el = n2.el
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const c1 = n1.children;
        const c2 = n2.children;
        const oldShapFlag = n1.shapeFlag;
        const newShapFlag = n2.shapeFlag;
        // array -> text
        if (newShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (oldShapFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 清除原children
                unmountChildren(n1.children);
            }
            // text->text
            if (c1 !== c2) {
                // 设置text children
                hostSetElementText(container, c2);
            }
        }
        else {
            // text->array
            if (oldShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(container, '');
                mountChildren(n2.children, n2.el, parentComponent, anchor);
            }
            else {
                // array->array
                patchKeyedChildren(c1, c2, container, parentComponent);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent) {
        let j = 0;
        let newEnd = c2.length - 1;
        let oldEnd = c1.length - 1;
        function isSameNode(v1, v2) {
            return v1.type === v2.type && v1.key === v2.key;
        }
        // 左侧的处理
        while (j <= newEnd && j <= oldEnd) {
            const n1 = c1[j];
            const n2 = c2[j];
            if (isSameNode(n1, n2)) {
                patch(n1, n2, container, parentComponent, null);
            }
            else {
                break;
            }
            j++;
        }
        //右侧相同处理
        while (j <= newEnd && j <= oldEnd) {
            const n1 = c1[oldEnd];
            const n2 = c2[newEnd];
            if (isSameNode(n1, n2)) {
                patch(n1, n2, container, parentComponent, null);
            }
            else {
                break;
            }
            newEnd--;
            oldEnd--;
        }
        // 中间不同的
        if (j > oldEnd && j <= newEnd) {
            // 新增
            // 锚点就是尾部相同节点第一个 C就是锚点 因为 C插入M之后再插入N才能保证顺序
            // new : A B C D
            // old : A B M N C D
            const anchorIndex = newEnd + 1;
            const anchor = anchorIndex < c2.length ? c2[anchorIndex].el : null;
            while (j <= newEnd) {
                patch(null, c2[j++], container, parentComponent, anchor);
            }
        }
        else if (j <= oldEnd && j > newEnd) {
            // 删除
            while (j <= oldEnd) {
                hostRemove(c1[j++].el);
            }
        }
        else {
            //非理想状态
            let count = newEnd - j + 1; //新节点中间部分长度
            let pos = 0; //记录最大index 判断是否需要移动位置
            let moved = false; //是否需要移动
            let patched = 0;
            let newIndexToOldIndexMap = new Array(count).fill(0); //新节点中间非理想状态节点在旧节点中的位置,用于求最长递增子序列
            let keyIndexs = {}; //在新节点中节点key和index的映射关系
            for (let i = j; i <= newEnd; i++) {
                keyIndexs[c2[i].key] = i;
            }
            for (let i = j; i <= oldEnd; i++) {
                let oldNode = c1[i];
                if (patched >= count) {
                    hostRemove(oldNode.el);
                    continue;
                }
                let newKeyIndex = keyIndexs[oldNode.key]; //对应老节点在新节点中的位置
                if (newKeyIndex !== undefined) {
                    newIndexToOldIndexMap[newKeyIndex - j] = i;
                    if (newKeyIndex >= pos) {
                        pos = newKeyIndex; //递增序列不需要移动所以如果有后面的节点index变小就需要移动
                    }
                    else {
                        moved = true;
                    }
                    patch(oldNode, c2[newKeyIndex], container, parentComponent, null);
                    patched++;
                }
                else {
                    hostRemove(oldNode.el);
                }
            }
            //获取最长递增子序列 这里返回的是最长递增子序列的index 所以下面比价是i和arrIncrease的值比较
            let increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let increaseIndex = increasingNewIndexSequence.length - 1;
            // 从后往前遍历 保证insertBefore插入的anchor已经处理过
            for (let i = count - 1; i >= 0; i--) {
                const newIndex = j + i;
                const newNode = c2[newIndex];
                const anchor = newIndex + 1 < c2.length ? c2[newIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    // 新增元素
                    patch(null, newNode, container, parentComponent, anchor);
                }
                else if (i !== increasingNewIndexSequence[increaseIndex]) {
                    // 所以下面比价是i和arrIncrease的值比较
                    // patch(null,newNode,container,parentComponent,anchor)
                    // 不在递增子序列里面 需要移动
                    // const preNode = 
                    hostInsert(newNode.el, container, anchor);
                }
                else {
                    increaseIndex--;
                }
            }
        }
    }
    function unmountChildren(children) {
        children.forEach(element => {
            hostRemove(element);
        });
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (let key in newProps) {
                const oldProp = oldProps[key];
                const newProp = newProps[key];
                if (oldProp !== newProp) {
                    hostPatchProp(el, key, oldProp, newProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (let key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const el = hostCreateElement(vnode.type);
        vnode.el = el;
        const { children, props, shapeFlag } = vnode;
        // string , array
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            //vnode
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        hostInsert(el, container, anchor);
        // container.append(el)
    }
    function mountChildren(children, container, parentComponent, anchor) {
        //vnode
        children.forEach(item => {
            patch(null, item, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        debugger;
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        debugger;
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            // next 为新节点
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
        // 判断是否需要更新
        // 更新 props
        // render调用
    }
    function mountComponent(initialVnode, container, parentComponent, anchor) {
        debugger;
        const instance = createComponentInstance(initialVnode, parentComponent);
        initialVnode.component = instance;
        setupComponent(instance);
        setupRenderEffect(instance, initialVnode, container, anchor);
    }
    function setupRenderEffect(instance, initialVnode, container, anchor) {
        debugger;
        instance.update = effect(() => {
            debugger;
            if (!instance.isMounted) {
                const subTree = instance.subTree = instance.render.call(instance.proxy, instance.proxy);
                //vnode->path
                //vode->element->mountelement
                patch(null, subTree, container, instance, anchor);
                //element 都mount完成
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const subTree = instance.render.call(instance.proxy, instance.proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                // 初始化时subtree被赋值 这里的substree没有
                subTree.el = preSubTree.el;
                patch(preSubTree, subTree, container, instance, anchor);
            }
        }, { scheduler: () => {
                // 同步任务中很多值变化 控制当所有值变化完再更新视图
                // 即把更新视图任务加入微任务即可
                queueJobs(instance.update);
            } });
    }
    return {
        createApp: createAppAPI(render)
    };
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
                }
                else {
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

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, oldVal, newVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, newVal);
    }
    else {
        if (newVal === null || newVal === undefined) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, newVal);
        }
    }
}
function insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null);
}
function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...args) {
    return renderer.createApp(...args);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    createElementVNode: createVNode,
    createRenderer: createRenderer,
    createTextVNode: createTextVNode,
    getCurrentInstance: getCurrentInstance,
    h: h,
    inject: inject,
    nextTick: nextTick,
    provide: provide,
    proxyRefs: proxyRefs,
    ref: ref,
    registerRuntimeCompiler: registerRuntimeCompiler,
    renderSlots: renderSlots,
    toDisplayString: toDisplayString
});

const TO_DISPLAY_STRING = Symbol("toDisplayString");
const CREATE_ELEMENT_VNODE = Symbol("createElementVNode");
const helperMapName = {
    [TO_DISPLAY_STRING]: "toDisplayString",
    [CREATE_ELEMENT_VNODE]: "createElementVNode",
};

function generate(ast) {
    const context = createCodegenContext();
    genFunctionPreamble(ast, context);
    const functionName = 'render';
    const args = ['_ctx', '_cache'];
    const signature = args.join(', ');
    context.push(`function  ${functionName}(${signature}){`);
    context.push(`return `);
    genNode(ast.codegenNode, context);
    context.push('}');
    return {
        code: context.code
    };
}
function createCodegenContext() {
    let context = {
        code: '',
        push(str) {
            context.code += str;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
        }
    };
    return context;
}
function genNode(node, context) {
    // 
    switch (node.type) {
        case 3 /* NodeTypes.TEXT */:
            getText(node, context);
            break;
        case 0 /* NodeTypes.INTERPOLATION */:
            getInterpolation(node, context);
            break;
        case 1 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
}
function getText(node, context) {
    context.push(`'${node.content}'`);
}
function getInterpolation(node, context) {
    const { push, helper } = context;
    context.push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(')');
}
// 处理interplation引入前缀
function genFunctionPreamble(ast, context) {
    const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
    if (ast.helpers.length > 0) {
        context.push(`const { ${ast.helpers.map(aliasHelper).join(",")}} = Vue`);
    }
    context.push('\n');
    context.push('return ');
}
function genExpression(node, context) {
    context.push(`${node.content}`);
}
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, children, props } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullable([tag, props, children]), context);
    push(")");
}
function genCompoundExpression(node, context) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            context.push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function genNodeList(nodes, context) {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            context.push(node);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            context.push(', ');
        }
    }
}
function genNullable(args) {
    return args.map(arg => arg || 'null');
}

function baseParse(content) {
    const context = createParseContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        const s = context.source;
        let node;
        if (s.startsWith('{{')) {
            node = parseInterpolation(context);
        }
        else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function parseText(context) {
    let endIndex = context.source.length;
    const endTokens = ['<', "{{"];
    // let length = context.source
    // 找到最近的endtoken
    for (let i = 0; i < endTokens.length; i++) {
        let index = context.source.indexOf(endTokens[i]);
        if (index !== -1) {
            endIndex = Math.min(endIndex, index);
        }
    }
    let content = parseTextData(context, endIndex);
    advanceBy(context, endIndex);
    return {
        type: 3 /* NodeTypes.TEXT */,
        content: content,
    };
}
function parseElement(context, ancestors) {
    const element = parseTag(context, 0 /* TagType.Start */);
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, 1 /* TagType.End */);
    }
    else {
        throw new Error(`miss tag:${element.tag}`);
    }
    return {
        type: element === null || element === void 0 ? void 0 : element.type,
        tag: element === null || element === void 0 ? void 0 : element.tag,
        children: element.children,
    };
}
function parseInterpolation(context) {
    // {{text}}
    // 插值处理
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    advanceBy(context, 2);
    const rawContentLength = closeIndex - openDelimiter.length;
    const rawContent = parseTextData(context, rawContentLength);
    const content = rawContent.trim();
    console.log(context.source);
    advanceBy(context, rawContentLength + closeDelimiter.length);
    return {
        type: 0 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 1 /* NodeTypes.SIMPLE_EXPRESSION */,
            content: content,
        }
    };
}
function parseTextData(context, rawContentLength) {
    return context.source.slice(0, rawContentLength);
}
function createParseContext(content) {
    return {
        source: content
    };
}
function createRoot(children) {
    return { children, type: 4 /* NodeTypes.ROOT */ };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
function isEnd(context, ancestors) {
    //context.source消费完
    //出现结束标志</
    // 结束时ancestors中的结束节点要相同
    const s = context.source;
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }
    return !s;
}
function startsWithEndTagOpen(source, tag) {
    return (source.startsWith("</") &&
        source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase());
}
function parseTag(context, type) {
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1]; //括号中的内容
    advanceBy(context, match[0].length); //match[0] 是<div 没有>所以后面还要再推进1位
    advanceBy(context, 1);
    if (type === 1 /* TagType.End */)
        return;
    return {
        type: 2 /* NodeTypes.ELEMENT */,
        tag,
    };
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    // 1.深度优先遍历
    // 2.修改内容
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
function traverseNode(node, context) {
    const { nodeTransforms } = context;
    const exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const onExit = transform(node, context);
        if (onExit)
            exitFns.push(onExit);
    }
    switch (node.type) {
        case 0 /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 4 /* NodeTypes.ROOT */:
        case 2 /* NodeTypes.ELEMENT */:
            traverseChildren(node, context);
            break;
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function traverseChildren(node, context) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context);
    }
}
function createTransformContext(root, options) {
    let context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        },
    };
    return context;
}
function createRootCodegen(root) {
    // root.codegenNode = root.children[0]
    const child = root.children[0];
    if (child.type === 2 /* NodeTypes.ELEMENT */) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = root.children[0];
    }
}

function createVNodeCall(context, tag, props, children) {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: 2 /* NodeTypes.ELEMENT */,
        tag,
        props,
        children,
    };
}

function transformElement(node, context) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            // tag
            const vnodeTag = `'${node.tag}'`;
            // props
            let vnodeProps;
            // children
            const children = node.children;
            let vnodeChildren = children[0];
            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
        };
    }
}

function transformExpression(node) {
    if (node.type === 0 /* NodeTypes.INTERPOLATION */) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function isText(node) {
    return (node.type === 3 /* NodeTypes.TEXT */ || node.type === 0 /* NodeTypes.INTERPOLATION */);
}

function transformText(node) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            const { children } = node;
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [child],
                                };
                            }
                            currentContainer.children.push(" + ");
                            currentContainer.children.push(next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText],
    });
    return generate(ast);
}

//  mini-vue的出口
function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("Vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

export { createApp, createVNode as createElementVNode, createRenderer, createTextVNode, getCurrentInstance, h, inject, nextTick, provide, proxyRefs, ref, registerRuntimeCompiler, renderSlots, toDisplayString };
