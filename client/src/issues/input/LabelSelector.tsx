import bind from 'bind-decorator';
import * as React from 'react';
import { Autocomplete, SearchCallback } from '../../controls/Autocomplete';
import { LabelDialog  } from '../../labels/LabelDialog';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { LabelName } from '../../controls/LabelName';
import { Project, Label } from '../../../../common/types/graphql';
import { client } from '../../graphql/client';
import gql from 'graphql-tag';

const LabelsQuery = gql`
  query LabelsQuery($project: ID!, $search: String) {
    labels(project: $project, search: $search) {
      id name color
    }
  }
`;

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

// tslint:disable:max-classes-per-file
class AutocompleteLabels extends Autocomplete<string> {}

@observer
export class LabelSelector extends React.Component<Props> {
  @observable private open = false;
  private ac: AutocompleteLabels;
  private token: string;

  public render() {
    return (
      <div className="label-selector">
        <LabelDialog
            open={this.open}
            project={this.props.project}
            onClose={this.onCloseModal}
            onInsertLabel={this.onInsertLabel}
        />
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
      client.query<{ labels: Label[] }>({
        query: LabelsQuery,
        fetchPolicy: 'network-only',
        variables: {
          project: project.id,
          search: token,
        }
      }).then(({ data, loading, errors }) => {
        console.log(errors);
        if (!loading && !errors && token === this.token) {
          const labels = data.labels;
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
      this.open = true;
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
      return <LabelName key={label} id={label} textOnly={true} />;
    } else {
      const option = label as LabelOption;
      return <span key={option.id}>{option.name}</span>;
    }
  }

  @bind
  private onRenderSelection(label: string) {
    return (
      <LabelName
          key={label}
          id={label}
          onClose={() => this.removeLabel(label)}
      />
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
    this.open = false;
  }

  @bind
  private removeLabel(label: string) {
    this.ac.removeFromSelection(item => item === label);
  }
}
