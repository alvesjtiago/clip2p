const fse = require('fs-extra')
const path = require('path')

module.exports = function (file, dir) {
  // Get file extension
  let extension = file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2)
  
  // Final file path with extension
  var fileName = Math.random().toString(36).slice(2)
  if (extension) { fileName += "." + extension }
  var finalPath = path.join(dir, fileName)
  
  // Copy file to dat location
  fse.copySync(file, finalPath)

  return fileName
}