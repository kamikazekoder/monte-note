import * as React from 'react';
import ElectronMessager from '../../../utils/electron-messaging/electronMessager';
import { ADD_NOTE, UPDATE_NOTE_STATE, GET_NOTES, UPDATE_NOTE } from '../../../constants/index';

export interface Props {
    location?: any;
    notebookName: string;
    notes?: string[];
    noteContent?: string;
    lastOpenedNote?: string;
}

export interface State {
    showInput: string;
    inputValue: string;
    lastOpenedNote: string;
}

export class Sidebar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showInput: 'hidden',
            inputValue: '',
            lastOpenedNote: ''
        };
        ElectronMessager.sendMessageWithIpcRenderer(GET_NOTES, this.props.notebookName);
    }

    showInput() {
        let showInput = this.state.showInput === 'visible' ? 'hidden' : 'visible';
        this.setState({showInput: showInput});
    }

    // Creates notebook on Enter key press
    handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            let note = this.prepareNote(this.state.inputValue as string);
            this.addNote(note);
            this.resetComponentState();
        }
    }

    // Creates notebook when input field loses focus
    handleFocusOut() {
        let note = this.prepareNote(this.state.inputValue as string);
        this.addNote(note);
        this.resetComponentState();
    }

    // After notebook name gets submitted through the input field, resets the
    // component state to default
    resetComponentState() {
        this.setState({
            showInput: 'hidden',
            inputValue: '',
        });
    }

    updateInputValue(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({inputValue: e.target.value});
    }

    prepareNote(name: string) {
        return name.trim();
    }

    addNote(name: string) {
        if (name) {
            let data = {notebookName: this.props.notebookName, noteName: name};
            ElectronMessager.sendMessageWithIpcRenderer(ADD_NOTE, data);
            ElectronMessager.sendMessageWithIpcRenderer(UPDATE_NOTE_STATE, data);
        }
    }

    updateLastOpenedNote(name: string) {
        this.setState({lastOpenedNote: this.props.lastOpenedNote as string});
        let data = {notebookName: this.props.notebookName, noteName: name};
        ElectronMessager.sendMessageWithIpcRenderer(UPDATE_NOTE_STATE, data);
    }

    componentWillReceiveProps(nextProps: Props) {
        if ( (nextProps.noteContent !== 'GETTING_NOTE_CONTENT') && (this.state.lastOpenedNote) ) {
            if ( (this.state.lastOpenedNote) !== (nextProps.lastOpenedNote) ) {
                let editor = document.querySelector('.ql-editor') as Element;
                let noteData = editor.innerHTML;
                let data = {
                    noteName: this.state.lastOpenedNote,
                    notebookName: this.props.notebookName,
                    noteData: noteData
                };
                ElectronMessager.sendMessageWithIpcRenderer(UPDATE_NOTE, data);
            }

        }
    }

    componentWillUnmount() {
        console.log("We're exiting notebook page. Save content of current note to db.");
    }

    render() {
        return (
            <div className="col-sm-2 sidebar">
                <button 
                    onClick={() => this.showInput()}
                    type="button"
                    className="btn btn-secondary btn-sm add-note"
                >
                    Add Note
                </button>

                <div className={`input-group input-group-sm ${this.state.showInput}`}>
                    <input 
                        value={this.state.inputValue}
                        onChange={e => this.updateInputValue(e)}
                        pattern="^[a-zA-Z0-9]+$"
                        ref={input => input && input.focus()}
                        onKeyPress={(e) => this.handleKeyPress(e)}
                        onBlur={() => this.handleFocusOut()}
                        type="text" 
                        className="form-control" 
                        placeholder="Note" 
                        aria-label="Note" 
                        aria-describedby="sizing-addon2"
                    />
                </div>

                <h3>Notes List</h3>

                <ul>
                    {(this.props.notes as string[]).map((name: string, index: number) => {
                        return <li onClick={() => this.updateLastOpenedNote(name)} key={index}>{name}</li>;
                    })}
                </ul>

            </div> 
        );
    }
}

export default Sidebar;