import * as React from 'react';
import ElectronMessager from '../../../utils/electron-messaging/electronMessager';
// import { ADD_NOTE, UPDATE_NOTE_STATE, GET_NOTES, UPDATE_NOTE, DELETE_NOTE } from '../../../constants/index';
import { ADD_NOTE, UPDATE_NOTE_STATE, GET_NOTES, UPDATE_NOTE } from '../../../constants/index';
import { Link } from 'react-router-dom';
var striptags = require('striptags');

export interface Props {
    location?: any;
    notebookName: string;
    notes: string[];
    noteContent: string;
    lastOpenedNote: string;
    updateNotes: Function;
    updateLastOpenedNote: Function;
    updateNoteContent: Function;
}

export interface State {
    showInput: string;
    inputValue: string;
    lastOpenedNote: string;
    noteContent: string;
    notes: string[];
}

export class Sidebar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showInput: 'hidden',
            inputValue: '',
            lastOpenedNote: '',
            noteContent: '',
            notes: []
        };
        ElectronMessager.sendMessageWithIpcRenderer(GET_NOTES, this.props.notebookName);
    }

    showInput() {
        let showInput = this.state.showInput === 'visible' ? 'hidden' : 'visible';
        this.setState({showInput: showInput});

        let editor = document.querySelector('.ql-editor') as Element;
        let noteContentToUpdate = editor.innerHTML;

        // Save note data only if there are notes in notebook
        if (this.props.notes.length) {

            let noteDataToSave = prepareNoteData(this.props, noteContentToUpdate);
    
            // Updates note data only if the data got changed
            if (noteDataToSave.noteData !== this.props.noteContent) {
                ElectronMessager.sendMessageWithIpcRenderer(UPDATE_NOTE, noteDataToSave);
            }

        }

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
            this.setState(
                {lastOpenedNote: name,
                noteContent: '',
                notes: this.props.notes}
            );
            let data = {notebookName: this.props.notebookName, noteName: name};
            ElectronMessager.sendMessageWithIpcRenderer(ADD_NOTE, data);
            ElectronMessager.sendMessageWithIpcRenderer(UPDATE_NOTE_STATE, data);

            // let noteDataToSave = {
            //     noteName: this.props.lastOpenedNote,
            //     notebookName: this.props.notebookName,
            //     noteData: noteContentToUpdate,
            //     noteDataTextOnly: striptags(noteContentToUpdate)
            // };

        }
    }

    // Switches to selected note and loads its content. Saves content of
    // the note we are switching from as well (if needed).
    updateLastOpenedNote(name: string) {
        let editor = document.querySelector('.ql-editor') as Element;
        let noteContentToUpdate = editor.innerHTML;

        let noteDataToSave = prepareNoteData(this.props, noteContentToUpdate);

        let noteToSwitchTo = {
            notebookName: this.props.notebookName, 
            noteName: name
        };

        // Updates note data only if the data got changed
        if (noteDataToSave.noteData !== this.props.noteContent) {
            ElectronMessager.sendMessageWithIpcRenderer(UPDATE_NOTE, noteDataToSave);
        }

        // Switch to another note and get that note's content
        ElectronMessager.sendMessageWithIpcRenderer(UPDATE_NOTE_STATE, noteToSwitchTo);
    }

    render() {
        return (
            <div className="col-sm-2 trashcan sidebar">
                <section className="links">
                    <ul className="list-group notes">
                        <Link className="home-sidebar" to="/">
                            <li 
                                className="notebook-name-sidebar list-group-item sidebar-note"
                            >
                                Home
                                <span className="oi oi-home home-icon"/>
                            </li>
                        </Link>
                    </ul>
                </section>
                <section className="links">
                    <ul className="list-group notes">
                        <li 
                            className="list-group-item sidebar-note add-note"
                            onClick={() => this.showInput()}
                        >
                            Add Note 
                            <span className="oi oi-home home-icon"/>
                        </li>
                    </ul>
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
                </section>
                <section className="notebooks">
                    <ul className="list-group notes">
                        {(this.props.notes as string[]).map((name: string, index: number) => {
                            let activeNote = name === this.props.lastOpenedNote ? 'notebook-name-sidebar-active' : '';
                            return (
                            <li 
                                key={name} 
                                {...(name === this.props.lastOpenedNote ? '' : '')}
                                className={`list-group-item sidebar-note ${activeNote}`}
                                onClick={() => this.updateLastOpenedNote(name)}
                            >
                            {name}
                            </li>
                                // <span onClick={() => this.deleteNote(name)}> X</span>
                            );
                        })}
                    </ul>
                </section>
            </div> 
        );
    }
}

export default Sidebar;

// Helpers

// Creates note data object for sending out to the ipcMain process
function prepareNoteData(props: Props, noteData: string) {
    let noteDataToSave = {
        noteName: props.lastOpenedNote,
        notebookName: props.notebookName,
        noteData: noteData,
        noteDataTextOnly: striptags(noteData)
    };
    return noteDataToSave;
}