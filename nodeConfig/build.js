const fs = require('fs');
const path = require('path');
const {promisify} = require('./util/promiseify.js');

const writeFilePro = promisify(fs.writeFile);
const readFilePro = promisify(fs.readFile);

(async function () {
  try {
    // 读
    const util = await readFilePro(path.join(__dirname, '../js', 'util.js'))
    const mask = await readFilePro(path.join(__dirname, '../js', 'mask.js'))
    const scroll = await readFilePro(path.join(__dirname, '../js', 'scroll.js'))
    const index = await readFilePro(path.join(__dirname, '../js', 'index.js'))
    const data = util + mask + scroll + index
    await writeFilePro(path.join(__dirname, '../dist', 'index.js'), data, 'UTF-8');
    return console.log(`载入完毕！`);
  } catch (e) {
    return console.log(e);
  }
})();
