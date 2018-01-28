jest.mock('../db/index');
import DbMessager from './dbMessager';

let dbMessager: DbMessager;
beforeAll(() => {
    dbMessager = new DbMessager();
});

beforeEach(() => {
    const NOTEBOOK_LIST = ['test-notebook-cars', 'test-nbook-sea', 'candy-stripes'];
    
    // Load mock database with data
    require('../db/index').Db.__setNotebookList(NOTEBOOK_LIST);
});

test('sets up database', () => {
    expect(dbMessager).toHaveProperty('db');
});

test('messages db & gets a list of notebooks', done => {
    dbMessager.getNotebooks()
    .then((result: string[]) => {
        expect(result).toHaveLength(3);
        done();
    });

});

test('adds notebook to list of notebooks', done => {
    let notebook = 'test-notebook-123';
    dbMessager.addNotebook(notebook)
    .then((result: boolean) => {
        done();
        expect(result).toEqual(true);
    });
});

test('adds location for notebooks to db', () => {
    let location = 'C:\\test-dir';
    require('../db/index').Db.__setNotebooksLocation(location);
    let notebooksLocation = require('../db/index').Db.notebooksLocation;
    
    dbMessager.setNotebooksLocation(location);
    expect(notebooksLocation).toEqual(location);
});

test('adds all existing notebooks to db', done => {

    let notebooksToBeAdded = ['ex-nb-1', 'ex-nb-2', 'ex-nb-3'];
    
    dbMessager.addExistingNotebooks(notebooksToBeAdded)
    .then(() => {
        let notebooksInDb = require('../db/index').Db.__getNotebooksList();
        expect(notebooksInDb).toContain(notebooksToBeAdded[1]);
        done();
    });

});

test('initializes and returns a settings object', done => {
    dbMessager.loadSettings()
    .then((settings: any) => {
        done();
        expect(settings).toHaveProperty('notebooksLocation');
    });
});

test('updates an item in settings object', done => {
    let testDir = 'test-dir';
    dbMessager.updateSettings('notebooksLocation', testDir)
    .then((result: any) => {
        done();
        expect(result).toEqual(true);
    });
});

test('gets item from the settings object', done => {
    let item = 'notebooksLocation';
    dbMessager.getFromSettings(item)
    .then((value: string) => {
        done();
        expect(value).toEqual('');
    });
});

test('sets lastOpenedNote value for a notebook', done => {
    let notebookName = 'testNotebook';
    let lastOpenedNote = 'test-note-23';

    dbMessager.setLastOpenedNote(notebookName, lastOpenedNote)
    .then((result: boolean) => {
        done();
        expect(result).toEqual(true);
    });
});

test('gets last opened note of a notebook from db', done => {
    let notebookName = 'testNotebook';

    dbMessager.getLastOpenedNote(notebookName)
    .then((note: string) => {
        done();
        expect(note).toEqual('test-note-23');
    });
});

test('creates document for a specific notebook', done => {
    let notebookName = 'testNotebook';

    dbMessager.createNotebook(notebookName)
    .then((result: boolean) => {
        done();
        expect(result).toEqual(true);
    });
});

test('adds note tag to note document', done => {
    let notebookName = 'testNotebook';
    let noteName = 'test-note';
    let noteTag = 'stuff to review';

    let data = {
        notebook: notebookName,
        note: noteName,
        tag: noteTag
    };

    dbMessager.addTagToNote(data)
    .then((result: boolean) => {
        done();
        expect(result).toEqual(true);
    });
});

test('gets tags from a note document', done => {
    let notebookName = 'testNotebook';
    let noteName = 'test-note';
    
    dbMessager.getNoteTags(notebookName, noteName)
    .then((result: string[]) => {
        done();
        expect(result).toEqual(['tag-1', 'tag-2', 'tag-3']);
    });
});

test('create note document', done => {
    let notebookName = 'testNotebook';
    let noteName = 'test-note';

    dbMessager.createNote(notebookName, noteName)
    .then((result: boolean) => {
        done();
        expect(result).toEqual(true);
    });

});

test('removes note document from db', done => {
    let notebookName = 'testNotebook';
    let noteName = 'test-note';

    dbMessager.removeNote(notebookName, noteName)
    .then((result: boolean) => {
        done();
        expect(result).toEqual(true);
    });
});

test('removes tag value from note document', done => {
    let notebookName = 'testNotebook';
    let noteName = 'test-note';
    let tagToRemove = 'tag-1';

    dbMessager.removeTagFromNote(notebookName, noteName, tagToRemove)
    .then((result: boolean) => {
        done();
        expect(result).toEqual(true);
    });
});

test('gets tags from all note documents', done => {
    
    dbMessager.getAllTags()
    .then((tags: string[]) => {
        done();
        expect(tags).toHaveLength(3);
    });
});

test('formats a note file data for database save', done => {
  let noteLocation = 'C:\\Users\\seneca\\Documents\\my-notebooks\\NinjaNote Notebooks\\note-1\\index.html';

  dbMessager.prepareNoteForDb('note-1', noteLocation)
  .then((doc: any) => {
    done();
    expect(doc).toHaveProperty('notebookName');
    expect(doc).toHaveProperty('noteName');
    expect(doc).toHaveProperty('noteContent');
    expect(doc).toHaveProperty('tags');
    expect(doc).toHaveProperty('documentFor');
  });

});

test('adds all existing notes to database', done => {
    let testData = {
            'Chemistry': [
                'C:\\Users\\seneca\\Documents\\my-notebooks\\NinjaNote Notebooks\\note-1\\index.html',
                'C:\\Users\\seneca\\Documents\\my-notebooks\\NinjaNote Notebooks\\note-2\\index.html',
                'C:\\Users\\seneca\\Documents\\my-notebooks\\NinjaNote Notebooks\\note-3\\index.html',
            ],
            'Biking': [
                'C:\\Users\\seneca\\Documents\\my-notebooks\\NinjaNote Notebooks\\note-1\\index.html',
                'C:\\Users\\seneca\\Documents\\my-notebooks\\NinjaNote Notebooks\\note-1\\index.html',
                'C:\\Users\\seneca\\Documents\\my-notebooks\\NinjaNote Notebooks\\note-1\\index.html',
            ]
        };

    dbMessager.addAllExistingNotes(testData)
    .then((result: boolean) => {
        done();
        expect(result).toEqual(true);
    });

});