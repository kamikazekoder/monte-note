import { IpcRenderer, Event } from 'electron';

let ipcRenderer: IpcRenderer;

// Electron's methods are not available outside of electron itself. When we're
// running unit tests and are accessing our application through the web browser
// we'll get an error thrown: window.require is not a function - this try/catch
// suppresses that.
export function ipcRendererEventsBootstrap() {
    try {
        ipcRenderer = window.require('electron').ipcRenderer;
        
        ipcRenderer.on('start-it!', (event: Event, arg: string): boolean => {
            console.log(arg);
            if (arg) {
                return true;
            } else {
                return false;
            }
        });
    } catch (error) {
        ipcRenderer = {} as IpcRenderer;
    } finally {
        return ipcRenderer;
    }
}
