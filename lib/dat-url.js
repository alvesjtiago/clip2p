module.exports = function (url) {
  var pathArray = url.split( '/' )
  var protocol = pathArray[0]
  var host = pathArray[2]
  var baseUrl = protocol + '//' + host
  var path = url.replace(baseUrl,'')

  return {
    protocol: protocol,
    host:     host,
    baseUrl:  baseUrl,
    path:     path
  }
}