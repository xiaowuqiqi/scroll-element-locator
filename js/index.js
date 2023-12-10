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