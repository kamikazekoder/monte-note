import * as React from 'react';
import PouchDB from 'pouchdb';

export interface Props {
    notebooks?: string[];
}

export interface State {
    notebooks: string[];
}

export class NotebooksList extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            notebooks: [],
        };
    }

    componentDidMount() {
        var db = new PouchDB('kittens');
        db.info().then(function (info: any) {
            console.log(info);
        });

        db.get('mittens')
        .then((doc) => {
            console.log(doc);
        })
        .catch((error) => {
            console.log(error);
        });

        // var doc = {
        // '_id': 'mittens',
        // 'name': 'Mittens',
        // 'occupation': 'kitten',
        // 'age': 3,
        // 'hobbies': [
        // 'playing with balls of yarn',
        // 'chasing laser pointers',
        // 'lookin hella cute'
        // ]
        // };

        // db.put(doc)
        // .then((response) => {
        //     console.log(response);
        // });

        // console.log(notebooksData);
    }

    render() {
        return (
            <div className="col-sm-4">
                <h1>Notebooks List!</h1>
                <ul>
                    {(this.state.notebooks as string[]).map((name: string, index: number) => {
                        return <li key={index}>{name}</li>;
                    })}
                </ul>
            </div>
        );
    }
}

export default NotebooksList;