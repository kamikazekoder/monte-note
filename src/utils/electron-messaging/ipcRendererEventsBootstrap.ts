import { IpcRenderer, Event } from 'electron';
import { NOTEBOOK_SAVE_DIRECTORY, GET_NOTEBOOKS } from '../../utils/constants';
import reduxStore from '../../store/index';
import * as actions from '../../actions/';
import { 
    ADD_NOTEBOOK, 
    LOAD_SETTINGS, 
    ADD_NOTE, 
    GET_NOTES, 
    UPDATE_NOTE_STATE, 
    LOAD_CONTENT_INTO_NOTE,
    GET_NAME_OF_LAST_OPENED_NOTE,
    DELETE_NOTE,
    GET_TRASH
} from '../../constants/index';
    
let ipcRenderer: IpcRenderer;

// Electron's methods are not available outside of electron itself. When we're
// running unit tests and are accessing our application through the web browser
// we'll get an error thrown: window.require is not a function - this try/catch
// suppresses that.
export function ipcRendererEventsBootstrap() {
    try {
        ipcRenderer = window.require('electron').ipcRenderer;
        
        ipcRenderer.on('start-it!', (event: Event, arg: string): boolean => {
            if (arg) {
                return true;
            } else {
                return false;
            }
        });

        ipcRenderer.on('location-for-notebooks', (event: Event, arg: string): void => {
            if (arg) {
                reduxStore.dispatch(actions.setNotebooksLocation(arg));
                localStorage.setItem(NOTEBOOK_SAVE_DIRECTORY, arg);
            }
        });

        ipcRenderer.on(GET_NOTEBOOKS, (event: Event, arg: string[]): void => {
            // console.log('NOTEBOOKS ARE: ');
            // console.log(arg);
            if (arg) {
                reduxStore.dispatch(actions.getNotebooks(arg));
            }
        });

        ipcRenderer.on(ADD_NOTEBOOK, (event: Event, arg: string): void => {
            if (arg) {
                reduxStore.dispatch(actions.addNotebook(arg));
                window.location.href = `/notebooks/${arg}`;
            }
        });

        ipcRenderer.on(LOAD_SETTINGS, (event: Event, arg: any): void => {
            // TODO:
            // Parse the received settings file and dispatch parts of it
            // using appropriate actions
            // console.log('SETTINGS ARE: ' + JSON.stringify(arg));
        });

        ipcRenderer.on(ADD_NOTE, (event: Event, arg: any): void => {
            reduxStore.dispatch(actions.addNote(arg));
        });

        ipcRenderer.on(GET_NOTES, (event: Event, notes: string[]): void => {
            reduxStore.dispatch(actions.loadNotes(notes));
        });

        ipcRenderer.on(UPDATE_NOTE_STATE, (event: Event, data: any): void => {
            // console.log('Notebook updated with last opened: ' + JSON.stringify(data));
            reduxStore.dispatch(actions.loadLastOpenedNote(data.noteName));
        });

        ipcRenderer.on(LOAD_CONTENT_INTO_NOTE, (event: Event, data: string): void => {
            reduxStore.dispatch(actions.loadContentIntoNote(data));
        });

        ipcRenderer.on(GET_NAME_OF_LAST_OPENED_NOTE, (event: Event, note: string): void => {
            // console.log('name of last opened note is: ' + note);
            // reduxStore.dispatch()
            reduxStore.dispatch(actions.loadLastOpenedNote(note));
        });

        ipcRenderer.on(DELETE_NOTE, (event: Event, result: boolean): void => {
            console.log('Note deleted: ' + result);
        });

        ipcRenderer.on(GET_TRASH, (event: Event, data: object) => {
            reduxStore.dispatch(actions.loadTrash(data));
        });

    } catch (error) {
        ipcRenderer = {} as IpcRenderer;
    } finally {
        return ipcRenderer;
    }
}
