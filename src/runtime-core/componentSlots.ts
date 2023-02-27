import { ShapeFlags } from "../reactivity/shared/ShapeFlags"

export function initSlots(instance, children) {
    // slots 处理判断
    //   instance.slots = Array.isArray(children)?children:[children]
    const { vnode } = instance
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots)
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key]
        slots[key] = (props) => normallizeSlotValue(value(props))
    }
}
function normallizeSlotValue(value) {
    return Array.isArray(value) ? value : [value]
}