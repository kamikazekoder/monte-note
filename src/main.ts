import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import NotebookManager from './utils/notebook-management/notebookManager';
import { CHOOSE_LOCATION_FOR_NOTEBOOKS, ADD_NOTEBOOK, GET_NOTEBOOKS, LOAD_SETTINGS, ADD_NOTE, GET_NOTES } from './constants/index';
// import Db from './db/index';
import DbMessager from './utils/dbMessager';

// let db = new Db().getDb() as Nedb;
let mainWindow: Electron.BrowserWindow;
// let notebookManager: NotebookManager;
let dbMessager = new DbMessager();

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
  });

  // // and load the index.html of the app.
  // mainWindow.loadURL(url.format({
  //     pathname: path.join(__dirname, '../index.html'),
  //     protocol: 'file:',
  //     slashes: true,
  // }));
  mainWindow.loadURL('http://localhost:3000');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // mainWindow = null;
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('get-global-packages', () => {
    console.log('create nbook!');
});

ipcMain.on('is-location-for-notebooks-set', (event: any, args: any) => {
  event.sender.send('start-it!', NotebookManager.getNotebookLocation());
});

ipcMain.on(CHOOSE_LOCATION_FOR_NOTEBOOKS, (event: any, args: any) => {
  let location = dialog.showOpenDialog({properties: ['openDirectory']}).shift();

  // notebookManager = new NotebookManager(notebooksDirectory as string);
  // notebookManager.setNotebooksLocation(location as string)
  // .then((result: boolean) => {
  //   if (result) {
  //     event.sender.send('location-for-notebooks', location);
  //   }
  // });
  console.log('location is: ' + location);
  dbMessager.updateSettings('notebooksLocation', location as string)
  .then((result: boolean) => {
    if (result) {
      event.sender.send('location-for-notebooks', location);
    }
  });

});

ipcMain.on(ADD_NOTEBOOK, (event: any, notebookName: any) => {
  console.log('ADD NOTEBOOK: ' + notebookName);

  dbMessager.getFromSettings('notebooksLocation')
  .then((location: string) => {
    if (location) {
      NotebookManager.addNotebook(location, notebookName)
      .then((result: boolean) => {
        if (result) {
          dbMessager.addNotebook(notebookName);
          event.sender.send(ADD_NOTEBOOK, notebookName);
        }
      });
    }
  });
});

ipcMain.on(GET_NOTEBOOKS, (event: any, args: any) => {
  console.log('GET THE NOTEBOOKS FROM DB.');
  // Bootstrap db with notebooks entry
  dbMessager.getFromSettings('notebooksLocation')
  .then((location: string) => {
    let notebooks = NotebookManager.getNotebooks(location);
    // dbMessager.updateSettings('notebooks', notebooks)
    dbMessager.addExistingNotebooks(notebooks)
    .then(() => {
      event.sender.send(GET_NOTEBOOKS, notebooks);
    });
  });
});

ipcMain.on(LOAD_SETTINGS, (event: any) => {

  console.log('Query DB to get the application settings.');

  dbMessager.loadSettings()
  .then((settings: any) => {
    event.sender.send(LOAD_SETTINGS, settings);
  });

});

ipcMain.on(ADD_NOTE, (event: any, args: any) => {
  let noteName = args.noteName;
  let notebook = args.notebookName;

  dbMessager.getFromSettings('notebooksLocation')
  .then((location: string) => {
    console.log('location is: ' + location);
    NotebookManager.addNote(`${location}\\${notebook}`, noteName)
    .then((result: boolean) => {
      
      if (result) {
        event.sender.send(ADD_NOTE, noteName);
      }

    });
  });

});

ipcMain.on(GET_NOTES, (event: any, notebook: string) => {

  console.log('GET NOTES FOR NOTEBOOK: ' + notebook);
  dbMessager.getFromSettings('notebooksLocation')
  .then((location: string) => {
    console.log('location is: ' + location);
    NotebookManager.getNotes(`${location}\\${notebook}`)
    .then((notes: string[]) => {

      console.log('NOTES ARE: ' + notes);
      NotebookManager.getNotesCreationDate(`${location}\\${notebook}`, notes)
      .then((result: any) => {
        // console.log('CREATION DATE OF NOTES: ' + JSON.stringify(result));
        notes = NotebookManager.orderNotesBy(result, 'created_at');
        console.log('ORDERED NOTES BY CREATED_AT: ' + notes);
      });
      // NotebookManager
      // event.sender.send(GET_NOTES, notes);
    });
  });

});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.