import * as React from 'react';
import Sidebar from './Sidebar/index';
import MainSection from './MainSection/index';
import PreviewNote from './PreviewNote/index';
import ElectronMessager from '../../utils/electron-messaging/electronMessager';
import { GLOBAL_SEARCH } from '../../constants/index';

export interface Props {
    notebooks: string[];
    searchResults: object[];
    previewContent: object;
    updateTags: Function;
    goToRoute: Function;
    allTags: string[];
    updateSelectedTags: Function;
    selectedTags: string[];
    updateSearchQuery: Function;
    searchQuery: string;
    updateSelectedNotebook: Function;
    selectedNotebook: string;
    lastOpenedNote: string;
    updatePreview: Function;
    previewData: object;
    updateAllTags: Function;
}
export interface State {
    searchQuery: string;
}

export class HomePage extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            searchQuery: ''
        };
    }

    // Adds tag on Enter key press
    handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        let searchQuery = this.state.searchQuery;
        console.log('search for: ' + searchQuery);
        let data = {
            searchQuery: searchQuery
        };
        ElectronMessager.sendMessageWithIpcRenderer(GLOBAL_SEARCH, data);
    }

    updateInputValue(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({searchQuery: e.target.value});
    }

    render() {
        return (
            <div className="row home-page">
                <Sidebar 
                    notebooks={this.props.notebooks} 
                    goToRoute={this.props.goToRoute}
                    allTags={this.props.allTags}
                    updateSelectedTags={this.props.updateSelectedTags}
                    searchQuery={this.props.searchQuery}
                    selectedNotebook={this.props.selectedNotebook}
                    selectedTags={this.props.selectedTags}
                    updateSelectedNotebook={this.props.updateSelectedNotebook}
                    updateSearchQuery={this.props.updateSearchQuery}
                />
                <MainSection 
                    searchResults={this.props.searchResults} 
                    notebooks={this.props.notebooks}
                    selectedTags={this.props.selectedTags}
                    updateSearchQuery={this.props.updateSearchQuery}
                    updateSelectedNotebook={this.props.updateSelectedNotebook}
                    updatePreview={this.props.updatePreview}
                    previewData={this.props.previewData}
                    searchQuery={this.props.searchQuery}
                    previewContent={this.props.previewContent} 
                    goToRoute={this.props.goToRoute}
                    lastOpenedNote={this.props.lastOpenedNote}
                />
                <PreviewNote 
                    previewContent={this.props.previewContent} 
                    updateTags={this.props.updateTags}
                    goToRoute={this.props.goToRoute}
                    lastOpenedNote={this.props.lastOpenedNote}
                    updateAllTags={this.props.updateAllTags}
                />
            </div>
        );
    }
}

export default HomePage;
