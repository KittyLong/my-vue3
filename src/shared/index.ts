export const extend = Object.assign

export const EMPTY_OBJ = {}
export const isObject = (val) => {
    return val !== null && typeof val === "object"
}
export const toDisplayString =val=>String(val)
export const isString = (value) => typeof value === "string";
export const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal)
}
export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : ''
    })
}
// 转大写
export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
// 加on
export const toHandlerKey = (str: string) => {
    return str ? 'on' + capitalize(str) : ''
}