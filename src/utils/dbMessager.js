"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../db/index");
class DbMessager {
    constructor() {
        let setup = new index_1.default();
        this.db = setup.getDb();
    }
    getNotebooks() {
        return this.db.find({ name: 'notebooks' }, (err, docs) => {
            if (docs.length) {
                return docs[0].notebooks;
            }
            return [];
        });
    }
    getNotebooksLocation() {
        return this.db.find({ name: 'notebooksLocation' }, (err, docs) => {
            if (docs.length) {
                localStorage.setItem('NOTEBOOK_SAVE_DIRECTORY', docs[0].notebooksLocation);
                return docs[0].notebooksLocation;
            }
            return '';
        });
    }
    addNotebook(name) {
        return this.db.update({ name: 'notebooks' }, { $push: { notebooks: name } }, {}, (err) => {
            if (err) {
                return false;
            }
            return true;
        });
    }
    setNotebooksLocation(location) {
        let documentName = 'notebooksLocation';
        this.db.find({ name: documentName }, (err, docs) => {
            if (docs.length) {
                this.db.update({ name: documentName }, { notebooksLocation: location });
            }
            else {
                this.db.insert({ name: documentName, notebooksLocation: location });
            }
        });
    }
    messageDb() {
        console.log('LOLOLOLO');
        this.db.find({ name: 'notebooks' }, function (err, docs) {
            console.log(docs);
        });
    }
}
exports.DbMessager = DbMessager;
exports.default = DbMessager;
