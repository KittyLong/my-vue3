import { ReactiveEffect } from "./effect";
import { ref } from "./ref";

class computedRefIml{
    private _getter :any;
    private _dirty:boolean=true;
    private _value:any;
    private _effct:ReactiveEffect;
    constructor(getter){
        this._getter = getter
        this._effct =new ReactiveEffect(getter,()=>{
            if(!this._dirty){
                this._dirty = true
            }
        })
    }
    get value(){
        //get 
        // get value > dirty true
        // 当依赖的响应式对象的值发生改变的时候
        if(this._dirty){
            this._dirty = false
            this._value = this._effct.run()
        }
        return this._value
    }
}

export function computed(getter){ 
  return new computedRefIml(getter)
}