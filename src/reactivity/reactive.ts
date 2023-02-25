import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"
import { track, trigger } from "./effect"

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = "__v_isReadonly"
}
export function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers)
}
export function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers)
}
function createReactiveObject(target, baseHandlers) {
    return new Proxy(target, baseHandlers)
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}
export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}
export function isProxy(value) {
    return isReadonly(value) || isReactive(value)
}