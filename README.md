# scroll-element-locator

元素定位小插件，自动计算滚动条位置，并滚动出用户需要看到的元素。

demo 访问地址：https://xiaowuqiqi.github.io/scroll-element-locator/guide

![image-20231210225248263](./README.assets/image-20231210225248263.png)

## 使用

在 js 中使用

```js
let click = true
const startLocation = async (ele) => {
  if (click){
    click = false
    await scrollMain(ele)
    await maskTarget(ele)
    console.log('定位结束', ele.outerHTML)
    click = true
  }
}
```

在 react 中使用

```jsx
/// 写一个对外接口
import { useRef } from 'react';
import { maskTarget } from './js/mask';
import { scrollMain } from './js/scroll';
// 写一个自定义 hook
const useOrientation = (
  option?: common.ObjectAny
): [React.MutableRefObject<any>, () => Promise<void>] => {
  const domPro = useRef<any>();
  const sentryPro = useRef<boolean>(true);
  const fn = async () => {
    if (sentryPro.current) {
      sentryPro.current = false;
      await scrollMain(domPro.current); // 滚动
      await maskTarget(domPro.current, option); // 遮罩
      sentryPro.current = true;
    }
  };
  return [domPro, fn]; // 需要返回 ref和执行函数
};
export default useOrientation;
 
/// 使用的时候只需要设置 ref 即可.
<div
  ref={domRef}
  className={classNames({
    [styles.label]: node.errShow,
    [styles.active]: node.active,
  })}
></div>
```

