import * as React from 'react';
import './App.css';
import HomePage from './containers/HomePage/HomePage';
import Welcome from './containers/WelcomePage/Welcome';
import ElectronMessager from './utils/electron-messaging/electronMessager';
import { LOAD_SETTINGS } from './constants/index';

interface Props {
  enthusiasmLevel?: number;
  notebooksLocation?: string;
  notebooks?: string[];
}

class App extends React.Component<Props, object> {

  isNotebooksLocationSet: boolean;

  componentWillMount() {
    ElectronMessager.sendMessageWithIpcRenderer(LOAD_SETTINGS);
  }

  render() {
    // console.log(this.props);
    let enthusiasmLevel = this.props.notebooksLocation as string;

    let componentToRender = <Welcome name={'John'} notebooksLocation={''} />;
    if (enthusiasmLevel) {
      componentToRender = <HomePage />;
    }

    return (
      <div className="App container-fluid">
        
        {componentToRender}

      </div>
    );
  }
}

export default App;
