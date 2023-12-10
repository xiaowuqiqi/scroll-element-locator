/**
 * 批量异步函数，按照顺序执行。
 * */
const asyncMap = async (arr, asyncfn) => {
  const resultArr = [];
  const asyncIterable = {
    [Symbol.asyncIterator]() {
      return {
        i: 0,
        next() {
          if (this.i < arr.length) {
            return asyncfn(arr[this.i], this.i, arr).then((time) => {
              this.i++;
              return { value: time, done: false };
            });
          }
          return Promise.resolve({ done: true });
        },
      };
    },
  };
  for await (const val of asyncIterable) {
    resultArr.push(val);
  }
  return resultArr;
};
/**
 * 转驼峰
 * scroll-top -> scrollTop
 * const strH = str.hump()
 * */
const hump = function(string) {
  if (!string.includes('-')) return string;
  return string
    .split('-')
    .map((str, i) => (i === 0 ? str : str.slice(0, 1).toUpperCase() + str.slice(1)))
    .join('');
}; // 注意箭头函数执行的this是windows

/**
 * 根据路径设置一个值
 * 入参 keyPro => 'style.scrollTop' [style,scrollTop]
 * */
const endSet = function(obj, keyPro, val) {
  if (!keyPro) return obj;
  const setVal = (arr, _val) => {
    arr.reduce((total, key, i) => {
      if (i === arr.length - 1) {
        // eslint-disable-next-line no-param-reassign
        total[hump(key)] = _val;
      }
      return obj[hump(key)];
    }, obj);
  };
  if (Array.isArray(keyPro)) {
    setVal(keyPro, val);
  }
  setVal(keyPro.split('.'), val);
};

/**
 * 根据路径获取一个值
 * 入参 keyPro => 'style.scrollTop' [style,scrollTop]
 * */
const endGet = function(obj, keyPro) {
  if (!keyPro) return obj;
  const getVal = (arr) => {
    return arr.reduce((total, key) => {
      return obj[hump(key)];
    }, obj);
  };
  if (Array.isArray(keyPro)) {
    return getVal(keyPro);
  }
  return getVal(keyPro.split('.'));
};

/**
 * 线性动画
 * 入参 type => 'style.scrollTop' [style,scrollTop]
 *     num => 设置最终值
 * */
const animationLinear = async function(ele, type, num) {
  if (isNaN(num)) return;
  const tepLength = 50;
  // 假如是style内数据，我们用getComputedStyle获取数据
  const ordNumFn = () => {
    if (type.split('.')[0] === 'style') {
      const styleTypeKey = type.split('.');
      styleTypeKey.shift();
      return Number.parseFloat(endGet(window.getComputedStyle(ele), styleTypeKey) || 0);
    } else {
      return endGet(ele, type);
    }
  };
  if (Math.abs(num - ordNumFn()) < 0.001) {
    return;
  } // 如果本来相等，没必要执行动画。
  const tep = (num - ordNumFn()) / tepLength;
  return new Promise((resolve) => {
    let i = 0;
    let guard = null; // 值变动
    // 通过计时器每次赋值，达到动画效果。
    // 注意使用 requestAnimationFrame 可以做优化 ,而不是用 setTimeout setInterval
    function _animation() {
      i++;
      if (i === tepLength || ordNumFn() === guard) {
        endSet(ele, type, num);
        return resolve();
      }
      guard = ordNumFn();
      endSet(ele, type, ordNumFn() + tep);
      window.requestAnimationFrame(_animation);
    }
    _animation();
  });
};

class CreateMaskEle {
  w = 0;

  h = 0;

  x = 0;

  y = 0;

  ele = null;

  constructor(w, h, x, y) {
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.ele = document.createElement('div');
    this.init();
  }

  async init() {
    this.ele.style.width = !isNaN(this.w) ? `${this.w}px` : this.w;
    this.ele.style.height = !isNaN(this.h) ? `${this.h}px` : this.h;
    this.ele.style.position = 'fixed';
    this.ele.style.left = `${this.x}px`;
    this.ele.style.top = `${this.y}px`;
    this.ele.style.zIndex = 990;
    this.ele.style.opacity = 0;
    this.ele.style.backgroundColor = 'rgba(0,0,0,0.6)';
    document.body.appendChild(this.ele);
    await animationLinear(this.ele, 'style.opacity', 1);
  }

  async close() {
    await animationLinear(this.ele, 'style.opacity', 0);
    document.body.removeChild(this.ele);
  }
}

const maskTarget = async (targetEle, option) => {
  // eslint-disable-next-line no-param-reassign
  option = {
    paddingLeft: option ? option.paddingLeft || 0 : 0,
    paddingRight: option ? option.paddingRight || 0 : 0,
    paddingTop: option ? option.paddingTop || 0 : 0,
    paddingBottom: option ? option.paddingBottom || 0 : 0,
  };
  const leftMaskEle = new CreateMaskEle(
    targetEle.getBoundingClientRect().left - option.paddingLeft,
    '100vh',
    0,
    0
  );
  const topMaskEle = new CreateMaskEle(
    targetEle.offsetWidth + option.paddingLeft + option.paddingRight,
    targetEle.getBoundingClientRect().top - option.paddingTop,
    targetEle.getBoundingClientRect().left - option.paddingLeft,
    0
  );
  const bottomMaskEle = new CreateMaskEle(
    targetEle.offsetWidth + option.paddingLeft + option.paddingRight,
    window.outerHeight -
      targetEle.offsetHeight -
      targetEle.getBoundingClientRect().top -
      option.paddingBottom,
    targetEle.getBoundingClientRect().left - option.paddingLeft,
    targetEle.getBoundingClientRect().top + targetEle.offsetHeight + option.paddingBottom
  );
  const rightMaskEle = new CreateMaskEle(
    window.outerWidth -
      targetEle.offsetWidth -
      targetEle.getBoundingClientRect().left -
      option.paddingRight,
    '100vh',
    targetEle.getBoundingClientRect().left + targetEle.offsetWidth + option.paddingRight,
    0
  );
  await new Promise((resolve, reject) =>
    setTimeout(() => {
      Promise.all([
        leftMaskEle.close(),
        topMaskEle.close(),
        bottomMaskEle.close(),
        rightMaskEle.close(),
      ])
        .then(() => {
          resolve();
        })
        .catch((r) => reject(r));
    }, 400)
  );
};
const onRoll = async (targetEle, currentEle) => {
  // targetEle 儿子 currentEle 爸爸
  const currentEleTop = currentEle.nodeName === 'HTML' ? 0 : currentEle.getBoundingClientRect().top;
  const clientHeight =
    Math.min(window.innerHeight, currentEle.clientHeight) || currentEle.clientHeight;
  // 使用scroll()方法可以直接滚动实现
  // element.scroll({
  //   top: 100,
  //   left: 100,
  //   behavior: 'smooth'
  // });
  await animationLinear(
    currentEle,
    'scroll-top',
    currentEle.scrollTop +
    (targetEle.getBoundingClientRect().top - currentEleTop) -
    clientHeight / 2
  );
};
const scrollMain = async (currentEle) => {
  const originEle = currentEle;
  const _scroll = async (currentEle) => {
    if (!currentEle) return;
    const parentEle = currentEle.parentElement;
    if (parentEle.scrollHeight > parentEle.clientHeight) {
     await onRoll(originEle, parentEle)
    }
    if ((parentEle.nodeName || '').toUpperCase() === 'HTML') return;
    await _scroll(parentEle);
  };
  await _scroll(currentEle);
};
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