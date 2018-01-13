import * as React from 'react';
import Quill from 'quill';
import electronMessager from '../../../utils/electron-messaging/electronMessager';
import { RESTORE_NOTE_FROM_TRASH } from '../../../constants/index';

export interface Props {
    noteContent?: string;
    notebook?: string;
    note?: string;
    trash?: any;
    updateTrash?: Function;
}

export interface State { }

export class TrashcanEditor extends React.Component<Props, State> {

    quill: Quill;

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        this.quill = new Quill('#quill-container', {
            modules: {
                toolbar: [
                    ['omega']
                ]
            },
            theme: 'snow'  // or 'bubble',
        });
        this.quill.disable();

        let toolbar = this.quill.getModule('toolbar');
        toolbar.addHandler('omega');

        // Adds text on hover & custom icon to button
        let customButton = document.querySelector('.ql-omega') as Element;
        customButton.setAttribute('title', 'Restore note');
        customButton.innerHTML = '<span class="oi oi-loop-square quill-custom-button"></span>';
        // customButton.addEventListener('click', function() {
        //     console.log('Restore note');
        //     // electronMessager.sendMessageWithIpcRenderer(RESTORE_NOTE, data);
        // });
        // customButton.addEventListener('click', this.restoreNote);
        customButton.addEventListener('click', this.restoreNote.bind(this));
    }

    componentWillUnmount() {
        let customButton = document.querySelector('.ql-omega') as Element;
        customButton.removeEventListener('click', this.restoreNote);
    }

    restoreNote() {
        // TODO:
        // Pass to this component notebook name & note names
        // Ping ipcMain with notebook name & note name
        // Restore the note based on that data
        // Update app state (remove note that got restored from trashcan items)
        let data = {
            note: this.props.note,
            notebook: this.props.notebook
        };
        // console.log(this.props);
        // Update trash
        let updateTrash = this.props.updateTrash as Function;
        let newTrash = Object.assign({}, this.props.trash);
        for (const notebook in this.props.trash) {
            if (this.props.trash.hasOwnProperty(notebook)) {
                let notes = this.props.trash[notebook];
                notes = notes.filter((note: string) => { return note !== this.props.note; });
                this.props.trash[notebook] = notes;
                newTrash[notebook] = notes;
                break;
            }
        }
        updateTrash(newTrash);
        this.quill.deleteText(0, this.quill.getLength());
        electronMessager.sendMessageWithIpcRenderer(RESTORE_NOTE_FROM_TRASH, data);
    }

    componentWillUpdate(nextProps: Props) {
        // Anytime we switch between notes, load note content inside editor
        this.quill.deleteText(0, this.quill.getLength());
        this.quill.clipboard.dangerouslyPasteHTML(0, nextProps.noteContent as string, 'api');
    }

    render() {
        return (
            <div className="col trashcan main-content">
                <div id="quill-container" />
            </div>
        );
    }
}

export default TrashcanEditor;
