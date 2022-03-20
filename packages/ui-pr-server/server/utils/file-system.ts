
import fs from 'fs'
import path from 'path'
// import childProcess from 'child_process'

/**
  * @param { copiedPath: String } (被复制文件的地址，绝对地址)
  * @param { resultPath: String } (放置复制文件的地址，绝对地址)
  */
export function copyFolder(copiedPath: string, resultPath: string) {
  function createDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
  }

  if (fs.existsSync(copiedPath)) {
    createDir(resultPath)

    /**
     * @des 方式二：
     */
    const files = fs.readdirSync(copiedPath, { withFileTypes: true });
    for (let i = 0; i < files.length; i++) {
      const cf = files[i]
      const ccp = path.join(copiedPath, cf.name)
      const crp = path.join(resultPath, cf.name)
      if (cf.isFile()) {
        /**
         * @des 创建文件,使用流的形式可以读写大文件
         */
        // const readStream = fs.createReadStream(ccp)
        // const writeStream = fs.createWriteStream(crp)
        // readStream.pipe(writeStream)
        fs.copyFileSync(ccp, crp)
      } else {
        try {
          /**
           * @des 判断读(R_OK | W_OK)写权限
           */
          fs.accessSync(path.join(crp, '..'), fs.constants.W_OK)
          copyFolder(ccp, crp)
        } catch (error) {
          console.log('folder write error:', error);
        }

      }
    }
  } else {
    console.log('do not exist path: ', copiedPath);
  }
}

/**
 * 删除目录
 * @param targetPath 
 */
export function deleteFolder(targetPath: string) {
  let files = [];
  if (fs.existsSync(targetPath)) {
    files = fs.readdirSync(targetPath);
    files.forEach((file, index) => {
      let curPath = targetPath + "/" + file
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath); //递归删除文件夹
      } else {
        fs.unlinkSync(curPath); //删除文件
      }
    });
    fs.rmdirSync(targetPath);  // 删除文件夹自身
  }
}
