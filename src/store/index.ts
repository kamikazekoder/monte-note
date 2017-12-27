import { createStore } from 'redux';
import reducer from '../reducers/index';
import { StoreState } from '../types/index';
import { NOTEBOOK_SAVE_DIRECTORY } from '../utils/constants';
// import ElectronMessager from '../utils/electron-messaging/electronMessager';

// Hydrate the state
let notebooksLocation;
try {
  notebooksLocation = localStorage.getItem(NOTEBOOK_SAVE_DIRECTORY) || '';
} catch (error) {
  notebooksLocation = '';
}

let notebooks: string[];
// try {
  // ElectronMessager.sendMessageWithIpcRenderer(GET_NOTEBOOKS);
// } catch {
notebooks = ['la', 'bla'];
// }

const reduxStore = createStore<StoreState>(reducer, {
  enthusiasmLevel: 1,
  notebooksLocation: notebooksLocation,
  notebooks: notebooks,
});

export default reduxStore;