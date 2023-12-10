
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
