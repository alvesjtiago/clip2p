const {
  app, 
  Menu, 
  Tray, 
  Notification, 
  clipboard,
  shell
} = require('electron');

const Dat = require('dat-node');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

var appIcon = null;
var datInstance = null;

app.on('ready', function(){

  // Get path to storage
  const userDataPath = app.getPath('userData');
  const dir = path.join(userDataPath, "datfiles")
  
  // If storage folder does not exist, create it
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  
  // Menu bar icon
  appIcon = new Tray(path.join(__dirname, '/assets/images/iconTemplate.png'));
  
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open folder',
      click () { shell.showItemInFolder(dir) }
    },
    {
      label: 'Close',
      click () { app.quit() }
    }
  ]);
  appIcon.setContextMenu(contextMenu);

  // Hide dock menu
  app.dock.hide()

  // Set dat
  Dat(dir, function (err, dat) {
    if (err) throw err

    datInstance = dat
    console.log('My Dat link is: dat://' + dat.key.toString('hex'))
  })

  appIcon.on('drop-files', function(event, files) {
    
    // Get first file that was dropped on menubar
    let file = files[0]
    let extension = file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2);
    
    // Final file path with extension
    var fileName = Math.random().toString(36).slice(2)
    if (extension) { fileName += "." + extension }
    var finalPath = path.join(dir, fileName)
    
    // Copy file to dat location
    fse.copySync(file, finalPath)

    // Import new file (or files that haven't been synced)
    datInstance.importFiles({watch: true})

    // Join network
    datInstance.joinNetwork()

    // Log the link of the dat folder
    console.log('My Dat link is: dat://' + datInstance.key.toString('hex'))
    
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
      console.log("clicked " + finalDatLink)
    });

  });
});