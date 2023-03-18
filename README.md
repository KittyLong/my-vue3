# mini-vue
## 环境配置
1.yarn add typescript --dev
2.npx tsc --init
3.yarn add jest @types/jest --dev 
4.tsconfig中type增加 jest
5.package.json中添加test命令
6.tsconfig中lib添加DOM,es6

## 阶段总结
# 1.reactivity
   1.effect:(fn,options={})=>收集依赖(即收集全局的activeEffect),effect.run方法中activeEffect被赋值,执行this.fn触发get调用track收集=>当值发生改变时触发依赖(执行与否与执行时机需考虑options)=>执行fn=>考虑lazy和scheduler lazy用在computed中当实用计算属性时才会触发fn,scheduler调度函数可在调度函数中做自己的相关操作
   2.reactive:响应式数据的封装函数返回封装的代理对象Proxy, 主要内容是通过Proxy代理目标对象,通过get收集依赖,set触发依赖;其中收集依赖是收集effect函数封装的依赖并不是通过单纯get就会收集,依赖的收集层级 targetMap收集对象所有依赖(target,deps),deps(key,dep)收集key下所有依赖 当key属性值变化 遍历dep触发依赖即执行fn
   3.computed:利用effect收集依赖 computed(()=>{}),computed传入的即副作用函数 类似于effect函数再封装一层,effect传入scheduler控制辅佐函数的执行时机当依赖的属性值发生改变时不执行依赖,只有当获取computed返回对象obj.value时触发get Value才会根据dirty判断是否需要执行依赖
   4.ref:对基本类型和复杂类型数据(reactive)的处理基本类型返回一个对象obj,obj封装get,set value方法 提供proxyref返回代理对象解除ref
# 2.runtime-core
   1.createApp(App).mount('app'):creatApp传入根组件实例返回一个有mount方法的对象,调用mount方法在mount方法中将根组件转换成vnode,调用render方法将根组件vnode渲染到最外层的容器上
   2.render(vnode,container):传入虚拟节点和该虚拟节点容器container,调用patch渲染
   3.patch(n1,n2,container,parentComponet):n1旧节点,n2新节点,在patch中进行新旧比较然后根据元素类型shapeFlag调用相应方法进行渲染


## 依赖关系

    
vue -> runtime-dom  ->runtime-core  -> reactivity