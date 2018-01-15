import * as React from 'react';
import TagAdder from '../TagAdder/index';
import ElectronMessager from '../../../utils/electron-messaging/electronMessager';
import { UPDATE_NOTE, GET_NAME_OF_LAST_OPENED_NOTE, GET_NOTE_CONTENT } from '../../../constants/index';
import Quill, { DeltaStatic } from 'quill';
import '../../../assets/css/quill.snow.css';

const striptags = require('striptags');

export interface Props {
    notebookName: string;
    lastOpenedNote: string;
    noteContent: string;
    addTagToNote: Function;
    currentNoteTags: string[];
    notes: string[];
    updateNotes: Function;
    updateLastOpenedNote: Function;
    updateNoteContent: Function;
}

export interface State {
    notebookName: string;
    lastOpenedNote: string | null;
}

export class Editor extends React.Component<Props, State> {

    quill: Quill;
    timeout: any;

    constructor(props: Props) {
        super(props);
        this.state = {
            notebookName: this.props.notebookName,
            lastOpenedNote: null,
        };
        ElectronMessager.sendMessageWithIpcRenderer(GET_NAME_OF_LAST_OPENED_NOTE, this.props.notebookName);
    }

    componentDidMount() {
        // After this component gets initialized for the first time it will
        // receive props whose value will stay the same the next time the
        // component gets mounted - this means if we go to a notebook, the first
        // time content of the last opened note will get loaded, but on the 2nd
        // run it won't. Code below explicitly requests note data for this case.
        let lastOpenedNote = this.props.lastOpenedNote as string;
        if (lastOpenedNote.length) {
            let data = {
                notebook: this.state.notebookName,
                note: lastOpenedNote
            };
            ElectronMessager.sendMessageWithIpcRenderer(GET_NOTE_CONTENT, data);
        }

        this.quill = new Quill('#quill-container', {
            modules: {
                toolbar: [
                ['bold', 'italic', 'underline'],
                ['image', 'code-block'],
                ['trash'],
                ]
            },
            placeholder: 'Take notes...',
            theme: 'snow'  // or 'bubble'
        });

        let toolbar = this.quill.getModule('toolbar');
        toolbar.addHandler('omega');

        // Adds text on hover & custom icon to button
        let customButton = document.querySelector('.ql-trash') as Element;
        customButton.setAttribute('title', 'Restore note');
        customButton.innerHTML = '<span class="oi oi-trash quill-custom-button"></span>';
        customButton.addEventListener('click', this.deleteNote.bind(this));

        this.quill.on('text-change', (delta: DeltaStatic, oldContents: DeltaStatic, source: any) => {
            
            let noteName = this.props.lastOpenedNote;
            let notebookName = this.state.notebookName;
            let editor = document.querySelector('.ql-editor') as Element;
            let noteData = editor.innerHTML;
            
            if (source === 'user') {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(updateNote, 60000);
            }

            function updateNote() {
                let data = {
                    noteName: noteName,
                    notebookName: notebookName,
                    noteData: noteData
                };
                ElectronMessager.sendMessageWithIpcRenderer(UPDATE_NOTE, data);
            }
        });

    }

    deleteNote() {
        // TODO:
        // Pass to this component notebook name & note names
        // Ping ipcMain with notebook name & note name
        // Restore the note based on that data
        // Update app state (remove note that got restored from trashcan items)
        // let data = {
        //     note: this.props.lastOpenedNote,
        //     notebook: this.props.notebookName
        // };
        console.log('Move note to trash');
        console.log(this.props);

        // TODO:
        // Get note content from edit
        // Save to note that content
        // Strip note content & save it to DB
        // Move note to trash

        let editor = document.querySelector('.ql-editor') as Element;
        let noteData = editor.innerHTML;

        let data = {
            noteName: this.props.lastOpenedNote,
            notebookName: this.props.notebookName,
            noteData: noteData,
            noteDataTextOnly: striptags(noteData),
            updateNoteData: true
        };
        console.log(data);

        // // Removes note from app state & sets last opened note to be the last
        // // note from the notes array
        let newNotes = removeNote(this.props.notes as string[], data.noteName);
        let updateNotes = this.props.updateNotes as Function;
        updateNotes(newNotes);

        console.log(newNotes);

        let updateLastOpenedNote = this.props.updateLastOpenedNote as Function;
        updateLastOpenedNote(newNotes.pop());

        let updateNoteContent = this.props.updateNoteContent as Function;
        updateNoteContent(this.props.noteContent);

        if (newNotes.length === 0) {
            this.quill.disable();
            this.quill.deleteText(0, this.quill.getLength());
        }

        // ElectronMessager.sendMessageWithIpcRenderer(DELETE_NOTE, data);

    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.lastOpenedNote === 'NO_LAST_OPENED_NOTE') {
            this.quill.disable();
        } else {
            this.quill.enable();
            this.quill.focus();
        }

        if ((this.state.lastOpenedNote === null) || (this.state.lastOpenedNote !== nextProps.lastOpenedNote)) {
            this.setState({lastOpenedNote: nextProps.lastOpenedNote as string});

            let data = {
                notebook: this.state.notebookName,
                note: nextProps.lastOpenedNote
            };
            ElectronMessager.sendMessageWithIpcRenderer(GET_NOTE_CONTENT, data);
        }
    }

    componentWillUpdate(nextProps: Props) {
        // Load saved content from note file into Quill editor
        this.quill.deleteText(0, this.quill.getLength());
        this.quill.clipboard.dangerouslyPasteHTML(0, nextProps.noteContent as string, 'api');
        // Sets cursor to the end of note content
        this.quill.setSelection(this.quill.getLength(), this.quill.getLength());
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        
        let customButton = document.querySelector('.ql-trash') as Element;
        customButton.removeEventListener('click', this.deleteNote);
    }

    render() {
        return (
            <div className="col-sm trashcan main-content">
                {/*
                <h4>Notebook: {this.state.notebookName}</h4>
                <h4>Editing Note: {this.props.lastOpenedNote}</h4> */}
                <TagAdder
                    notebookName={this.state.notebookName}
                    lastOpenedNote={this.props.lastOpenedNote}
                    addTagToNote={this.props.addTagToNote}
                    currentNoteTags={this.props.currentNoteTags}
                />
                <div id="quill-container" />
            </div>
        );
    }
}

export default Editor;

// Helpers
function removeNote(notesList: string[], noteName: string): string[] {
    return notesList.filter((note: string) => { return note !== noteName ? true : false; } );
}