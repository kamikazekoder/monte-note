import * as React from 'react';
import Sidebar from '../../containers/NotebookPage/Sidebar';
import { Link } from 'react-router-dom';
import ElectronMessager from '../../utils/electron-messaging/electronMessager';
import { GET_NOTES } from '../../constants/index';
import Quill, { DeltaStatic } from 'quill';
import '../../assets/css/quill.snow.css';

export interface Props {
    location: any;
    lastOpenedNote?: string;
}

export interface State {
    notebookName: string;
    lastOpenedNote: string;
}

export class Notebook extends React.Component<Props, State> {

    quill: Quill;

    constructor(props: Props) {
        super(props);
        this.state = {
            notebookName: this.props.location.pathname.split('/').pop(),
            lastOpenedNote: this.props.lastOpenedNote as string,
        };
    }

    componentDidMount() {
        this.quill = new Quill('#editor-container', {
            modules: {
              toolbar: [
                ['bold', 'italic', 'underline'],
                ['image', 'code-block']
              ]
            },
            placeholder: 'Take notes...',
            theme: 'snow'  // or 'bubble'
        });

        this.quill.on('text-change', (delta: DeltaStatic, oldContents: DeltaStatic) => {
            console.log('text changed!');
            console.log('CONTENT OF EDITOR: ');
            let content = document.querySelector('.ql-editor') as Element;
            console.log(content.innerHTML as string);
        });
    }

    componentWillMount() {
        ElectronMessager.sendMessageWithIpcRenderer(GET_NOTES, this.state.notebookName);
    }

    componentWillUpdate(nextProps: Props) {
        if (!nextProps.lastOpenedNote) {
            this.quill.disable();
        } else {
            this.quill.enable();
            this.quill.focus();
        }
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <Sidebar notebookName={this.state.notebookName} />
                    <div className="col-sm">
                        <Link to="/">Home</Link>
                        <h4>Notebook: {this.state.notebookName}</h4>
                        <div id="editor-container" />
                    </div>
                </div>
            </div>
        );
    }
}

export default Notebook;