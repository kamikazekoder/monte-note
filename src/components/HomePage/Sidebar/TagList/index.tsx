import * as React from 'react';
import * as $ from 'jquery';
import ElectronMessager from '../../../../utils/electron-messaging/electronMessager';
import { GET_NOTES_WITH_TAGS } from '../../../../constants/index';

export interface Props {
    allTags: string[];
}

export interface State {
    selectedTags: string[];
}

export class TagList extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedTags: []
        };
    }

    selectTag(event: React.MouseEvent<HTMLLIElement>, name: string) {
        
        let tags: string[] = [];
        
        if ( this.isTagSelected(event.target) ) {
            let tagToRemove = $(event.target).text();
            tags = this.state.selectedTags.filter((tag: string) => { return tag !== tagToRemove; });
            $(event.target).removeClass('tag-selected');
        } else {
            tags = this.state.selectedTags;
            tags.push(name);
            $(event.target).addClass('tag-selected');
        }

        this.setState({
            selectedTags: tags
        });

        ElectronMessager.sendMessageWithIpcRenderer(GET_NOTES_WITH_TAGS, tags);
    }

    isTagSelected(element: any) {
        return $(element).hasClass('tag-selected');
    }

    render() {
        return (
            <div>
                <div 
                    className="notebook-name-sidebar" 
                    data-toggle="collapse" 
                    data-target="#collapseExample2" 
                    aria-expanded="false" 
                    title="Tags"
                >
                    Tags
                    <span className="oi oi-chevron-bottom expand-notebook" />
                    <span className="oi oi-chevron-left expand-notebook" />
                </div>
                <div className="collapse notes-sidebar" id="collapseExample2">
                    <ul className="list-group notes">
                        {(this.props.allTags as string[]).map((name: string, index: number) => {
                            return (
                                <li 
                                    key={name}
                                    onClick={(e) => { this.selectTag(e, name); }} 
                                    className={`list-group-item sidebar-note`}
                                >
                                    {name}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    }
}

export default TagList;