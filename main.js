const {app, BrowserWindow, dialog, globalShortcut, clipboard, Menu, Tray, nativeImage} = require('electron')
const path = require('path')
const { spawn } = require('child_process');

var imgur = require('imgur');
imgur.setClientId('79c0cfb5c8e08ca');


let tray = null
app.on('ready', () => {

  globalShortcut.register('CommandOrControl+Shift+C', () => {
      const { execSync } = require('child_process');
      //process.platform === 'win32'
      /*
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') app.quit()
      */
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
  });


  var clipboard_icon_ni = nativeImage.createFromDataURL(clipboard_icon);
  tray = new Tray(clipboard_icon_ni)

  const contextMenu = Menu.buildFromTemplate([{
    label: 'Quit',
    click: () => {
      app.quit()
    }
  }])

  tray.setToolTip('Clipgur in the tray.')
  tray.setContextMenu(contextMenu)
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


  var clipboard_icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVuG7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohbyS1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL42K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8OokmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAT9JREFUOBFjZMANGJGk/iOxUZhMKDwop4GBgWkVEAO5/7epMLABMTs2dSAxZFtQ1Pg5ykNs/f//OQMjI/Om/Q/FURRAOXADIjzVUJz57cdPBo+gcrCyHes6Gb59+wnX//X7L4bjl96B9YIJkGa/wGC4ghXLlzHUdaxjODnfHCxmnniSoakiiMHNzQnMP3zoKMOjp2/AhrDAdUEZ8+bOZ9i47y6Yp9n7ES69fMs1Bn8nZQYHByu4GIgBNgDkXGQAUkgswHBBbFw0XO/nT+/g7A8fEK6BCwIZKNH4+/cvuBwuzV+/foarATHABoBCmBzNcAOQjSTWZpgeFC8Qo/nfb9QABxsAShjkaAa5Ah4LoMRBLHj76hlQKRtYOTwpW+oJoSRlQoahJGUkxSAD5YBYBIhZkcRhzN9AxhsgfgTEYAsBxjOL8yHWiL4AAAAASUVORK5CYII=";
