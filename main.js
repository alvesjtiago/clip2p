const {
  app, 
  Menu, 
  Tray, 
  Notification, 
  clipboard,
  shell
} = require('electron')

const Dat = require('dat-node')
const fs = require('fs')
const path = require('path')

const copy = require('./lib/copy.js')
const datUrl = require('./lib/dat-url.js')

var appIcon = null
var datInstance = null

app.on('ready', function(){

  // Get path to storage
  const userDataPath = app.getPath('userData')
  const dir = path.join(userDataPath, "datfiles")
  const downloads_dir = path.join(userDataPath, "downloads")
  
  // If storage folder does not exist, create it
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
  }

  // If downloads folder does not exist, create it
  if (!fs.existsSync(downloads_dir)){
    fs.mkdirSync(downloads_dir)
  }
  
  // Menu bar icon
  appIcon = new Tray(path.join(__dirname, '/assets/images/iconTemplate.png'))
  
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open folder',
      click () { shell.showItemInFolder(dir) }
    },
    {
      label: 'Close',
      click () { app.quit() }
    }
  ])
  appIcon.setContextMenu(contextMenu)

  // Hide dock menu
  app.dock.hide()

  // Set dat
  Dat(dir, function (err, dat) {
    if (err) throw err

    datInstance = dat
  })

  appIcon.on('drop-files', function(event, files) {
    
    // Copy first file to dat folder
    let file = files[0]
    let fileName = copy(file, dir)

    // Import new file (or files that haven't been synced)
    datInstance.importFiles({watch: true})

    // Join network
    datInstance.joinNetwork()
    
    // Final dat link to the file stored
    finalDatLink = 'dat://' + datInstance.key.toString('hex') + '/' + fileName
    
    // Launch notification with information about upload
    let notification = new Notification({
      title: 'File added',
      body: 'Click to copy dat link: ' + finalDatLink
    })
    notification.show()

    // Click to copy action
    notification.on('click', function(event) {
      clipboard.writeText(finalDatLink)
    })

  })

  appIcon.on('drop-text', function(event, text) {

    var url = datUrl(text)

    if (url.protocol == "dat:") {

      var download_path = path.join(downloads_dir, url.host)
    
      Dat(download_path, {key: url.baseUrl, sparse: true}, function (err, dat) {
        dat.joinNetwork()

        dat.archive.readFile(url.path, function (err, content) {
          shell.openItem(download_path + url.path)
          dat.close()
        })
      })

    } else {
      // Launch notification with information about upload
      let notification = new Notification({
        title: "Wrong format",
        body: 'The URL does not conform to the dat protocol.'
      })
      notification.show()
    }

  })
})