import { h, ref } from "../../lib/guide-mini-vue.esm.js";
import Child from "./Child.js";
// 组件更新
// processComponent 判断组件时更新还是挂载
// 根据msg发生变化触发triggerEffect
// 执行fn 调用patch, patch 根据shapeFlag值及,有n1触发更新
// 判断是否需要更新 根据props
// 更新props
export const App = {
  name: "App",
  setup() {
    const msg = ref("123");
    const count = ref(1);

    window.msg = msg;

    const changeChildProps = () => {
      msg.value = "456";
      // console.log(msg)
    };

    const changeCount = () => {
      count.value++;
    };

    return { msg, changeChildProps, changeCount, count };
  },

  render() {
    return h("div", {}, [
      h("div", {}, "你好"),
      h(
        "button",
        {
          onClick: this.changeChildProps,
        },
        "change child props"
      ),
      h(Child, {
        msg: this.msg,
      }),
      h(
        "button",
        {
          onClick: this.changeCount,
        },
        "change self count"
      ),
      h("p", {}, "count: " + this.count),
    ]);
  },
};
