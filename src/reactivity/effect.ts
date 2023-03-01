import { extend } from "../shared/index";
let activeEffect;
let shouldTrack=false;
export class ReactiveEffect {
    private _fn;
    active = true;
    deps=[];
    onStop?:()=>void;
    constructor(fn,public scheduler?) {
        this._fn = fn
    };

    run() {
        if(!this.active){
            return this._fn()
        }
        // 应该收集
        shouldTrack = true
        activeEffect = this
        // this._fn() 会触发get从而track
        const res = this._fn()
        
        //reset
        shouldTrack = false
        return res
    };
    stop(){
        if(this.active){
            cleanupEffect(this)
            if(this.onStop){
                this.onStop()
            }
            this.active=false
        }
    }
}

export function isTracking(){
    return shouldTrack && activeEffect!==undefined
}
function cleanupEffect(effect){
    effect.deps.forEach((dep:any) => {
        dep.delete(effect)
    });
    effect.deps.length=0
}
const targetMap = new Map()
export function track(target, key) {
    if(!isTracking()) return
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key,dep)
    }
    trackEffects(dep)
}
export function trackEffects(dep){
    if(dep.has(activeEffect)) return;
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}
export function trigger(target,key){
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    triggerEffects(dep)
}
export function triggerEffects(dep){
    for (const eff
        of dep) {
       if(eff.scheduler){
           eff.scheduler()
       }else{
           eff.run()
       }
   }
}
export function effect(fn,options:any={}) {
    let _effect = new ReactiveEffect(fn,options.scheduler)
    _effect = extend(_effect,options)
    _effect.run()
    const runnner:any = _effect.run.bind(_effect)
    runnner.effect = _effect
    return  runnner
}

export function stop(runner){
    runner.effect.stop()
}