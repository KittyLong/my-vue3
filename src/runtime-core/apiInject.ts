import { getCurrentInstance } from "./component"

export function provide(key, val) {
    const currentInstance: any = getCurrentInstance()

    if (currentInstance) {
        let { provides } = currentInstance
        const parentProvides = currentInstance.parent.provides
        if(provides===parentProvides){
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = val
    }

}
export function inject(key,defaultValue?) {
    debugger
    const instance: any = getCurrentInstance()
    const { provides } = instance.parent
    if (provides[key]) {
        return provides[key]
    }else if(defaultValue){
        if(typeof defaultValue ==='function'){
            return defaultValue()
        }
        return defaultValue
    }
}
