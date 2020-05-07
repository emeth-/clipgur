const {app, BrowserWindow, dialog, globalShortcut, clipboard} = require('electron')
const path = require('path')
const { spawn } = require('child_process');

var imgur = require('imgur');
imgur.setClientId('79c0cfb5c8e08ca');

app.on('ready', () => {
  globalShortcut.register('CommandOrControl+Shift+C', () => {

  const { execSync } = require('child_process');
  execSync('sleep 0.1;gnome-screenshot -ac ', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
  });

  var clipimage = clipboard.readImage();
  var base64_clipimage = clipimage.toDataURL();
  base64_clipimage = base64_clipimage.split("base64,")[1];
  base64_clipimage = base64_clipimage.substring(0, base64_clipimage.length - 1);

  imgur.uploadBase64(base64_clipimage)
    .then(function (json) {
        console.log(json.data.link);
        clipboard.writeText(json.data.link)
    })
    .catch(function (err) {
        console.error(err.message);
    });
  })
})


/*
dialog.showMessageBox({
  type: 'info',
  message: 'Success!',
  detail: 'You pressed the registered global shortcut keybinding.',
  buttons: ['OK']
})
*/

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})
