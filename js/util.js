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
    // 注意使用 requestAnimationFrame 可以做优化
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
