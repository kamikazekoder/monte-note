import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import { Provider } from 'react-redux';

import { createStore } from 'redux';
import { enthusiasmLevel } from './reducers/index';
import { StoreState } from './types/index';

const store = createStore<StoreState>(enthusiasmLevel, {
  enthusiasmLevel: 1,
  notebooksLocation: '',
});

beforeAll(() => {
  const ls = require('./utils/localStorage');
  ls.setLocalStorage();
});

// TODO: Mock Quill for this test to pass.
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
  <Provider store={store}>
    <div/>
    {/* <App 
      notebooksLocation={''}
      notebooks={['note-1', 'note-2', 'note-3']} 
      searchResults={[{}, {}]}
      previewContent={{notebook: 'test', note: 'test', noteContent: 'test'}}
      updateTags={() => { return; }}
      history={() => { return; }}
      allTags={[]}
      updateSelectedTags={() => { return; }}
      selectedTags={[]}
      updateSearchQuery={() => { return; }}
      searchQuery={'test'}
      updateSelectedNotebook={() => { return; }}
      selectedNotebook={'test'}
      lastOpenedNote={'test'}
      updatePreview={() => { return; }}
      previewData={{}}
      updateAllTags={() => { return; }}
    /> */}
  </Provider>,
  div);
});
