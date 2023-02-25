import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive";
import { hasChanged, isObject } from "./shared";

class RefImpl {
    private _value: any
    public dep;
    private _rawValue: any;
    public __v_isRef=true;
    constructor(newValue) {
        this._rawValue = newValue
        //value->reactive
        //1.看value是不是对象

        this._value = convert(newValue)
        this.dep = new Set()
    }
    get value() {
        if (isTracking()) {
            trackEffects(this.dep)
        }
        return this._value
    }
    set value(newValue) {
        //一定是先修改了 才触发依赖
        if (hasChanged(this._rawValue, newValue)) {
            this._rawValue = newValue
            this._value = convert(newValue)
            triggerEffects(this.dep)
        }
    }

}
function convert(value){
    return  isObject(value) ? reactive(value) : value
}
export function ref(value) {
    return new RefImpl(value)
}
export function isRef(ref){
    return !!ref.__v_isRef;
}
export function unRef(ref){
    return isRef(ref)?ref.value:ref
}
export function proxyRefs(target){
  return new Proxy(target,{
    get(target,key){
        return unRef(Reflect.get(target,key))
    },
    set(target,key,value){
        if(isRef(Reflect.get(target,key))){
            Reflect.set(target,key,isRef(value)?value:ref(value))
        }else{
            Reflect.set(target,key,value)
        }
        return true
    }
  })
}