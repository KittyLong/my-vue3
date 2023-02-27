export const enum ShapeFlags {
    ELEMENT = 1, //0001
    STATEFUL_COMPONENT = 1 << 1, //0010
    TEXT_CHILDREN = 1 << 2,//0100
    ARRAY_CHILDREN = 1 << 3,//1000
    SLOT_CHILDREN = 1 << 4
    // ELEMENT = 1, // 表示一个普通的HTML元素
    // FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件
    // STATEFUL_COMPONENT = 1 << 2,  // 有状态组件
    // TEXT_CHILDREN = 1 << 3, // 子节点是文本
    // ARRAY_CHILDREN = 1 << 4, // 子节点是数组
    // SLOTS_CHILDREN = 1 << 5, // 子节点是插槽
    // TELEPORT = 1 << 6, // 表示vnode描述的是个teleport组件
    // SUSPENSE = 1 << 7, // 表示vnode描述的是个suspense组件
    // COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 表示需要被keep-live的有状态组件
    // COMPONENT_KEPT_ALIVE = 1 << 9, // 已经被keep-live的有状态组件
    // COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT // 组件，有状态组件和函数式组件的统称
}