import * as React from 'react';
import { Link } from 'react-router-dom';
import electronMessager from '../../../utils/electron-messaging/electronMessager';
import { GET_NOTE_FROM_TRASH } from '../../../constants/index';

export interface Props {
    trash: object;
}

export interface State { }

export class TrashcanSidebar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    getNoteFromTrash(notebook: string, note: string) {
        let data = {
            notebook: notebook,
            note: note
        };
        electronMessager.sendMessageWithIpcRenderer(GET_NOTE_FROM_TRASH, data);
    }

    markNoteActive(e: any, sidebar?: string) {
        $('.sidebar-note').removeClass('notebook-name-sidebar-active');
        $('.currently-opened-note-sidebar-sm').removeClass('currently-opened-note-sidebar-sm');
        if (sidebar === 'sm') {
            let tagName = $(e.target).prop('tagName').toLowerCase();
            if (tagName === 'p') {
                $(e.target).children().addClass('currently-opened-note-sidebar-sm');
            } else {
                $(e.target).addClass('currently-opened-note-sidebar-sm');
            }
        } else {
            $(e.target).addClass('notebook-name-sidebar-active');
        }
    }

    render() {
        return (

            <React.Fragment>
            
                {/* <!-- Sidebar --> */}

                <div className="col-2 sidebar-container col-1-sidebar-container-sm">
                    <div className="sidebar">
                        <div className="sidebar-item sidebar-item-md">
                            <div className="sidebar-item-text-container">
                                <Link
                                    to={'/'}
                                    title="Home"
                                    className="sidebar-item-text"
                                >
                                <p className="link-sidebar-lg">
                                    Home <span className="sidebar-item-icon oi oi-home"/>
                                </p>
                                </Link>
                            </div>
                        </div>

                        <div className="sidebar-item sidebar-item-sm">
                            <div className="sidebar-item-text-container sidebar-item-text-container-sm">
                                <Link
                                    to={'/'}
                                    title="Home"
                                >
                                    <span className="sidebar-item-icon sidebar-item-icon-sm oi oi-home" />
                                </Link>
                            </div>
                        </div>

                        <div className="sidebar-item sidebar-item-md">
                            <div className="sidebar-item-text-container">
                                <ul className="list-group notes"/>
                            </div>
                        </div>

                        <div className="sidebar-item sidebar-item-sm">
                            <div 
                                className="sidebar-item-text-container sidebar-item-text-container-sm new-notebook-container-sm"
                            >
                                <a 
                                    href="#newNotebook" 
                                    title="New Note" 
                                    className="sidebar-item-text"
                                ><span className="sidebar-item-icon sidebar-item-icon-sm oi oi-document"/>
                                </a>
                            </div>
                        </div>
        
                        {/* <!-- Notebooks Dropdown --> */}
                        <div className="sidebar-item sidebar-item-sm">
                            <div className="sidebar-item-text-container sidebar-notebooks-dropdown sidebar-notebooks-dropdown-sm sidebar-item-text-container-sm">
                                <a 
                                    className="sidebar-item-text" 
                                    title="Notes" 
                                    href="#collapseNotebooksSmallSidebar" 
                                    data-toggle="collapse" 
                                    aria-expanded="false" 
                                    aria-controls="collapseNotebooksSmallSidebar"
                                >
                                    <span className="sidebar-item-icon sidebar-item-icon-sm oi oi-layers"/>
                                </a>
                            </div>
                        </div>

                        <div className="sidebar-item">

                            <div 
                                className="sidebar-item-text-container sidebar-notebooks-dropdown sidebar-notebooks-dropdown-md sidebar-item-text-container-md"
                            />

                            <div className="sidebar-collapse-content collapse" id="collapseNotebooksBigSidebar">
                                <ul className="sidebar-collapsed-content list-unstyled"/>
                            </div>
                        </div>
                        {/* <!-- /Notebooks Dropdown --> */}
        
                        {/* <!-- Trash --> */}
                        <div className="sidebar-item sidebar-item-md">
                            <div className="sidebar-item-text-container">
                                <Link
                                    to={'/trashcan'}
                                    className="sidebar-item-text sidebar-link-lg"
                                    title="Trash"
                                >
                                    Trash <span className="sidebar-item-icon oi oi-trash"/>
                                </Link>
                            </div>
                        </div>
        
                        <div className="sidebar-item sidebar-item-sm">
                            <div className="sidebar-item-text-container sidebar-item-text-container-sm">
                                <Link
                                    to={'/trashcan'}
                                    className="sidebar-item-text sidebar-link-md"
                                    title="Trash"
                                >
                                    <span className="sidebar-item-icon sidebar-item-icon-sm oi oi-trash trashcan" />
                                </Link>
                            </div>
                        </div>
                        {/* <!-- /Trash --> */}
        
                    </div>
                </div>

                {/* <!-- Sidebar Extension for Medium & Small Devices --> */}
                <div className="col-2 sidebar-extension-sm sidebar-notebook-links-sm">
                    <div className="sidebar-collapse-content"/>
                </div>

                {/* <!-- Add Note Extension --> */}
                <div className="col-2 sidebar-extension-sm sidebar-links-sm new-notebook-sm">
                    <div className="sidebar-collapse-content new-notebook-sidebar-md">
                        <div className={`sidebar-app-form input-group input-group-sm visible`}/>
                    </div>
                </div>
                {/* <!-- /Add Note Extension --> */}

                {/* <!-- /Sidebar Extension for Medium & Small Devices --> */}

                {/* <!-- Navbar for Smallest Devices --> */}
                <div className="col-12 navbar-sm-container">
                    <nav className="navbar navbar-expand-lg navbar-light bg-light navbar-fixed-top">
                        <a className="navbar-brand" href="#">Logo</a>
                        <button 
                            className="navbar-toggler" 
                            type="button" 
                            data-toggle="collapse" 
                            data-target="#navbarNavDropdown" 
                            aria-controls="navbarNavDropdown"
                            aria-expanded="false" 
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"/>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNavDropdown">
                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <Link
                                        to={'/'}
                                        className="hamburger-menu-link"
                                    >
                                        <p
                                            className="nav-link"
                                        >Home
                                        </p>
                                    </Link>
                                </li>


                                {(Object.keys(this.props.trash).map((notebook: string) => {
                                    if (this.props.trash[notebook].length > 0) {
                                        // let notebookNameForId = notebook.split(' ').join('-');
                                        // let notebookNameTrimmed = notebook.length > 25 ? notebook.slice(0, 23) + '...' : notebook;
                                        return (
                                            <li 
                                            key={notebook}
                                            className="nav-item dropdown">
                                                <a 
                                                    className="nav-link dropdown-toggle" 
                                                    href="#" 
                                                    id={notebook}
                                                    data-toggle="dropdown" 
                                                    aria-haspopup="true" 
                                                    aria-expanded="false"
                                                >
                                                    {notebook}
                                                </a>
                                                <div className="dropdown-menu" aria-labelledby="navbarDropdownNotesLink">
                                                    <ul className="sidebar-collapsed-content list-unstyled">
                                                        {(this.props.trash[notebook].map((note: string, index: number) => {
                                                            return (
                                                                <p
                                                                    key={note + index}
                                                                    className={`hamburger-menu-tag-element dropdown-item`}
                                                                    onClick={(e) => {
                                                                        this.getNoteFromTrash(notebook, note);
                                                                        this.markNoteActive(e, 'sm');
                                                                    }}
                                                                >
                                                                    <span>{note}</span>
                                                                </p>
                                                            );
                                                        }))}
                                                    </ul>
                                                </div>
                                            </li>
                                        );
                                    } else {
                                        return;
                                    }
                                }))}

                                <li
                                    className="nav-item open-input"
                                >
                                    <a
                                        className="nav-link"
                                        href="#"
                                    >
                                        New Note
                                    </a>
                                </li>

                                <li className="nav-item dropdown active">

                                    <div className="dropdown-menu" aria-labelledby="navbarDropdownNotesLink"/>

                                </li>
                                <li className="nav-item">
                                    <Link
                                        to={'/trashcan'}
                                        className="hamburger-menu-link"
                                    >
                                        <p
                                            className="nav-link"
                                        >Trash
                                        </p>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
                {/* <!-- /Navbar for Smallest Devices --> */}
            
            </React.Fragment>


            // <div className="col-2 trashcan sidebar">
            //     <Link className="home-sidebar" to="/">
            //         <div className="notebook-name-sidebar" id="home-sidebar">
            //             Home
            //         </div>
            //     </Link>

            //     <section className="notebooks">

            //         {(Object.keys(this.props.trash).map((notebook: string) => {
            //             if (this.props.trash[notebook].length > 0) {
            //                 let notebookNameForId = notebook.split(' ').join('-');
            //                 let notebookNameTrimmed = notebook.length > 25 ? notebook.slice(0, 23) + '...' : notebook;
            //                 return (
            //                     <div key={notebook}>
            //                         <div
            //                             className="notebook-name-sidebar"
            //                             data-toggle="collapse"
                                   
            //                             data-target={`#${notebookNameForId}`}
            //                             aria-expanded="false"
            //                         >
            //                             {notebookNameTrimmed}
            //                             <span className="oi oi-chevron-bottom expand-notebook" />
            //                             <span className="oi oi-chevron-left expand-notebook" />
            //                         </div>
            //                         <div className="collapse notes-sidebar" id={notebookNameForId}>
            //                             <ul className="list-group notes">
            //                                 {(this.props.trash[notebook].map((note: string) => {
            //                                     return (
            //                                         <li 
            //                                             key={note} 
            //                                             className="list-group-item sidebar-note home-link"
            //                                             onClick={(e) => { 
            //                                                 this.getNoteFromTrash(notebook, note); 
            //                                                 this.markNoteActive(e);
            //                                             }}
            //                                         >
            //                                         {note}
            //                                         </li>
            //                                     );
            //                                 }))}
            //                             </ul>
            //                         </div>
            //                     </div>
            //                 );
            //             } else {
            //                 return;
            //             }
            //         }))}
            //     </section>
            // </div>
        );
    }
}

export default TrashcanSidebar;
