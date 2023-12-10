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
