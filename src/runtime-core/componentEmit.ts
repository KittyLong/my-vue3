import { camelize, toHandlerKey } from "../shared/index"

export function emit(instance,event,...args){
    debugger
    //instance.props里面是否有emit event
    const {props} =instance

    //TPP由点到面
    // const handler = props['onAdd']
    // handler && handler()
    // 驼峰

    const handlerName = toHandlerKey(camelize(event))
    const handler = props[handlerName]
    handler && handler(...args)
}