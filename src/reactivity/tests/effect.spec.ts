import { effect,stop } from "../effect";
import { reactive } from "../reactive";

describe('effect', () => {

    it('happy path', () => {
        const user = reactive({
            age: 10
        })
        let nextAge: any;
        effect(() => {
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11)
        user.age++;
        expect(nextAge).toBe(12)
    })

    it('should return runner when call effect', () => {
        let foo = 10
        const runner = effect(() => {
            foo++
            return 'foo'
        })
        expect(foo).toBe(11)
        const r = runner()
        expect(foo).toBe(12)
        expect(r).toBe('foo')
    })

    it('scheduler', () => {
        let dummy;
        let run: any;
        const scheduler = jest.fn(() => {
            run = runnner;
        })
        const obj = reactive({ foo: 1 })
        const runnner = effect(() => {
            dummy = obj.foo;
        }, { scheduler })
        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        expect(dummy).toBe(1);
        run();
        expect(dummy).toBe(2);
    })

    it('stop', () => {
        let dummy;
        const obj = reactive({ prop: 1 })
        const runnner = effect(() => {
            dummy = obj.prop;
        });
        obj.prop = 2
        expect(dummy).toBe(2)
        stop(runnner)
        // obj.prop=3
        // 触发了get,set
        obj.prop++
        expect(dummy).toBe(2)
        runnner()
        expect(dummy).toBe(3)
    })

    it('onStop',()=>{
        // 调用stop之后的回调函数
        const obj = reactive({ foo: 1 })
        let dummy;
        const onStop = jest.fn()
        const runnner = effect(() => {
            dummy = obj.foo;
        },{onStop});
        obj.foo = 2;
        stop(runnner)
        expect(onStop).toBeCalledTimes(1)
    })
})