import { effect } from "../effect";
import { isProxy, isReactive, isReadonly, reactive, shallowReadonly } from "../reactive";

describe('reactive',()=>{

    it.skip('happy path',()=>{
        const original = {foo:1,too:2};
        const observed = reactive(original);
        expect(observed).not.toBe(original);
        expect(observed.foo).toBe(1);
        let  n = 0
        effect(()=>{
            // observed.foo = observed.foo+1
            //TODO get收集 set触发依赖 触发依赖执行fn又会再次observed.foo++无限循环
           n= observed.foo++
            // observed.foo = observed.too+1
        })
        // observed.foo = 2
        // expect(observed.foo).toBe(1);

        // expect(isReactive(observed)).toBe(true)
        // expect(isReactive(original)).toBe(false)
        // expect(isProxy(observed)).toBe(true)
    })

    it('nested reactive',()=>{
        const original = {
            nested:{
                foo:1
            },
            array:[{bar:2}]
        }
        const observed = reactive(original)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    })

    it('shallowReadonly',()=>{
        const props = shallowReadonly({n:{foo:1}});
        expect(isReadonly(props)).toBe(true)
        expect(isReadonly(props.n)).toBe(false)
    })
})