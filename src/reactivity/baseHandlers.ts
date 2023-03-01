import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"
import { extend, isObject } from "../shared"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true,true)
export function createGetter(isReadonly = false,shallow=false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }
        const res = Reflect.get(target, key)

        if(shallow){
            return res
        }
        //看res是不是object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }

        if (!isReadonly) {
            // 依赖收集
            track(target, key)
        }
        return res
    }
}
export function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const mutableHandlers = {
    get,
    set,
}
export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`target key is readonly`)
        return true
    }
}
export const shallowReadonlyHandlers =extend({},readonlyHandlers, {
    get: shallowReadonlyGet
})