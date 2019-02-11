// tslint:disable:max-classes-per-file
import bind from 'bind-decorator';
import { Project } from '../../../models';
import * as React from 'react';
import { Autocomplete, SearchCallback } from '../../controls/Autocomplete';
import { LabelName } from '../../common/LabelName';
import { LabelDialog  } from '../../labels/LabelDialog';
import { action, observable } from 'mobx';
import { searchLabels } from '../../../network/requests';
import { observer } from 'mobx-react';

interface Props {
  className?: string;
  project: Project;
  selection: string[];
  onSelectionChange: (selection: string[]) => void;
}

interface LabelOption {
  name: JSX.Element;
  id: string;
}

class AutocompleteLabels extends Autocomplete<string> {}

@observer
export class LabelSelector extends React.Component<Props> {
  @observable private showModal = false;
  private ac: AutocompleteLabels;
  private token: string;

  public render() {
    return (
      <div className="label-selector">
        {this.showModal && (
          <LabelDialog
              project={this.props.project}
              onHide={this.onCloseModal}
              onInsertLabel={this.onInsertLabel}
          />)}
        <AutocompleteLabels
            {...this.props}
            multiple={true}
            onSearch={this.onSearchLabels}
            onGetValue={this.onGetValue}
            onGetSortKey={this.onGetSortKey}
            onChooseSuggestion={this.onChooseSuggestion}
            onRenderSuggestion={this.onRenderSuggestion}
            onRenderSelection={this.onRenderSelection}
            ref={el => { this.ac = el; }}
        />
      </div>);
  }

  @bind
  private onSearchLabels(token: string, callback: SearchCallback<string>) {
    const newLabelOption = {
      name: <span>New&hellip;</span>,
      id: '*new*',
    };
    if (token.length === 0) {
      callback([], [newLabelOption]);
    } else {
      const { project } = this.props;
      this.token = token;
      searchLabels(project.account, project.uname, token, labels => {
        if (this.token === token) {
          callback(labels.slice(0, 5).map(l => l.id), [newLabelOption]);
        }
      });
    }
  }

  @action.bound
  private onChooseSuggestion(label: string) {
    if (typeof label === 'string') {
      return false;
    }
    const option = label as LabelOption;
    if (option.id === '*new*') {
      this.showModal = true;
      return true;
    }
    return false;
  }

  @bind
  private onInsertLabel(label: string) {
    if (label === null || label === undefined) {
      throw new Error('invalid label');
    }
    this.ac.addToSelection(label);
  }

  @bind
  private onRenderSuggestion(label: string) {
    if (typeof label === 'string') {
      return <LabelName key={label} label={label} textOnly={true} />;
    } else {
      const option = label as LabelOption;
      return <span key={option.id}>{option.name}</span>;
    }
  }

  @bind
  private onRenderSelection(label: string) {
    return (
      <LabelName key={label} label={label} className="chip" />
    );
  }

  @bind
  private onGetValue(label: string): string {
    return label;
  }

  @bind
  private onGetSortKey(label: string) {
    return label;
  }

  @action.bound
  private onCloseModal() {
    this.showModal = false;
  }
}
