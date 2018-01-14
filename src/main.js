"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const notebookManager_1 = require("./utils/notebook-management/notebookManager");
const index_1 = require("./constants/index");
const dbMessager_1 = require("./utils/dbMessager");
var path = require('path');
// let db = new Db().getDb() as Nedb;
let mainWindow;
// let notebookManager: NotebookManager;
let dbMessager = new dbMessager_1.default();
function createWindow() {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
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
    mainWindow.on('close', () => {
        mainWindow.webContents.send(index_1.EXIT_APP_SAVE_CONTENT);
    });
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
electron_1.app.on('ready', createWindow);
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
electron_1.ipcMain.on('get-global-packages', () => {
    console.log('create nbook!');
});
electron_1.ipcMain.on('is-location-for-notebooks-set', (event, args) => {
    event.sender.send('start-it!', notebookManager_1.default.getNotebookLocation());
});
electron_1.ipcMain.on(index_1.CHOOSE_LOCATION_FOR_NOTEBOOKS, (event, args) => {
    let location = electron_1.dialog.showOpenDialog({ properties: ['openDirectory'] }).shift();
    dbMessager.updateSettings('notebooksLocation', location)
        .then((result) => {
        if (result) {
            event.sender.send('location-for-notebooks', location);
        }
    });
});
electron_1.ipcMain.on(index_1.ADD_NOTEBOOK, (event, notebookName) => {
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        if (location) {
            notebookManager_1.default.addNotebook(location, notebookName)
                .then((result) => {
                if (result) {
                    dbMessager.addNotebook(notebookName);
                    event.sender.send(index_1.ADD_NOTEBOOK, notebookName);
                }
            });
        }
    });
});
electron_1.ipcMain.on(index_1.GET_NOTEBOOKS, (event, args) => {
    // Bootstrap db with notebooks entry
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        let notebooks = notebookManager_1.default.getNotebooks(location);
        // dbMessager.updateSettings('notebooks', notebooks)
        dbMessager.addExistingNotebooks(notebooks)
            .then(() => {
            event.sender.send(index_1.GET_NOTEBOOKS, notebooks);
        });
    });
});
electron_1.ipcMain.on(index_1.LOAD_SETTINGS, (event) => {
    dbMessager.loadSettings()
        .then((settings) => {
        event.sender.send(index_1.LOAD_SETTINGS, settings);
    });
});
electron_1.ipcMain.on(index_1.ADD_NOTE, (event, args) => {
    let noteName = args.noteName;
    let notebook = args.notebookName;
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        notebookManager_1.default.addNote(`${location}\\${notebook}`, noteName)
            .then((result) => {
            if (result) {
                dbMessager.addNoteToNotebook(notebook, noteName);
                dbMessager.setLastOpenedNote(notebook, noteName)
                    .then((res) => {
                    event.sender.send(index_1.UPDATE_NOTE_STATE, args);
                    event.sender.send(index_1.ADD_NOTE, noteName);
                });
            }
        });
    });
});
electron_1.ipcMain.on(index_1.GET_NOTES, (event, notebook) => {
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        notebookManager_1.default.getNotes(`${location}\\${notebook}`)
            .then((notes) => {
            notebookManager_1.default.getNotesCreationDate(`${location}\\${notebook}`, notes)
                .then((result) => {
                notes = notebookManager_1.default.orderNotesBy(result, 'created_at');
                notes = notebookManager_1.default.formatNotes(notes);
                event.sender.send(index_1.GET_NOTES, notes);
                // dbMessager.getLastOpenedNote(notebook)
                // .then((note: string) => {
                //   let data = {
                //     notebook: notebook,
                //     noteName: note
                //   };
                //   event.sender.send(UPDATE_NOTE_STATE, data);
                //   if (note) {
                //     let absolutePathToNote = path.join(location, notebook, note + '.html');
                //     NotebookManager.getNoteData(absolutePathToNote)
                //     .then((noteData: string) => {
                //       event.sender.send(LOAD_CONTENT_INTO_NOTE, noteData);
                //     });
                //   }
                // });
            });
        });
    });
});
electron_1.ipcMain.on(index_1.GET_NOTE_CONTENT, (event, data) => {
    let notebook = data.notebook;
    let note = data.note;
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        let absolutePathToNote = path.join(location, notebook, note + '.html');
        notebookManager_1.default.getNoteData(absolutePathToNote)
            .then((noteData) => {
            event.sender.send(index_1.LOAD_CONTENT_INTO_NOTE, noteData);
        });
    });
});
electron_1.ipcMain.on(index_1.GET_NAME_OF_LAST_OPENED_NOTE, (event, notebook) => {
    dbMessager.getLastOpenedNote(notebook)
        .then((note) => {
        event.sender.send(index_1.GET_NAME_OF_LAST_OPENED_NOTE, note);
    });
});
electron_1.ipcMain.on(index_1.UPDATE_NOTE_STATE, (event, args) => {
    let noteName = args.noteName;
    let notebook = args.notebookName;
    dbMessager.setLastOpenedNote(notebook, noteName)
        .then((result) => {
        event.sender.send(index_1.UPDATE_NOTE_STATE, args);
    });
});
electron_1.ipcMain.on(index_1.UPDATE_NOTE, (event, data) => {
    // console.log('WRITE NOTE CONTENT TO FILE');
    // console.log(JSON.stringify(data));
    let noteName = data.noteName;
    let notebookName = data.notebookName;
    let notebookData = data.noteData;
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        if (location) {
            let absolutePathToNote = path.join(location, notebookName, noteName + '.html');
            notebookManager_1.default.updateNoteData(absolutePathToNote, notebookData)
                .then((result) => {
                if (result) {
                    console.log('Note content updated successfully');
                }
            });
        }
    });
});
electron_1.ipcMain.on(index_1.DELETE_NOTE, (event, data) => {
    let note = data.noteName;
    let notebook = data.notebookName;
    console.log('DELETE NOTE');
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        let noteLocation = path.join(location, notebook, note + '.html');
        if (data.updateNoteData) {
            notebookManager_1.default.updateNoteData(noteLocation, data.noteData)
                .then((result) => {
                if (result) {
                    notebookManager_1.default.trashNote(location, notebook, note + '.html')
                        .then((res) => {
                        event.sender.send(index_1.DELETE_NOTE, res);
                        let notebookLocation = path.join(location, notebook);
                        notebookManager_1.default.getNotes(notebookLocation)
                            .then((notes) => {
                            notebookManager_1.default.getNotesCreationDate(notebookLocation, notes)
                                .then((response) => {
                                notes = notebookManager_1.default.orderNotesBy(response, 'created_at');
                                notes = notebookManager_1.default.formatNotes(notes);
                                let lastCreatedNote = notes.pop();
                                if (lastCreatedNote) {
                                    dbMessager.setLastOpenedNote(notebook, lastCreatedNote);
                                }
                                else {
                                    dbMessager.setLastOpenedNote(notebook, '');
                                }
                            });
                        });
                    });
                }
            });
        }
        else {
            notebookManager_1.default.trashNote(location, notebook, note)
                .then((res) => {
                event.sender.send(index_1.DELETE_NOTE, res);
            });
        }
    });
    // TODO: After successful delete
    // If we updated a note & deleted it, that means we also need to updated lastOpenedNote
    // Get a list of all notes in dir
    // Sort them by date created
    // Get last item
});
electron_1.ipcMain.on(index_1.GET_TRASH, (event, args) => {
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        notebookManager_1.default.getTrash(location)
            .then((data) => {
            event.sender.send(index_1.GET_TRASH, data);
        });
    });
});
electron_1.ipcMain.on(index_1.GET_NOTE_FROM_TRASH, (event, data) => {
    let note = data.note;
    let notebook = data.notebook;
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        let absolutePathToNote = path.join(location, '.trashcan', notebook, note + '.html');
        notebookManager_1.default.getNoteData(absolutePathToNote)
            .then((noteData) => {
            let noteInfo = {
                note: note,
                notebook: notebook,
                data: noteData
            };
            event.sender.send(index_1.GET_NOTE_FROM_TRASH, noteInfo);
        });
    });
});
electron_1.ipcMain.on(index_1.RESTORE_NOTE_FROM_TRASH, (event, data) => {
    let note = data.note;
    let notebook = data.notebook;
    console.log(`Restore note: ${note} from notebook: ${notebook}`);
    dbMessager.getFromSettings('notebooksLocation')
        .then((location) => {
        notebookManager_1.default.restoreNoteFromTrash(location, notebook, note + '.html')
            .then((result) => {
            event.sender.send(index_1.RESTORE_NOTE_FROM_TRASH, result);
        });
    });
});
electron_1.ipcMain.on(index_1.ADD_TAG_TO_NOTE, (event, data) => {
    console.log('Add tag to note');
    let notebook = data.notebook;
    dbMessager.getNotebook(notebook)
        .then((result) => {
        console.log(result);
    });
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here. 
