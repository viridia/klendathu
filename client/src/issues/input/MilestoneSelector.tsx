// tslint:disable:max-classes-per-file
import * as React from 'react';
import { Project, MilestoneListQuery } from '../../../models';
import { Button, Dialog, Autocomplete, SearchCallback } from '../../controls';
import { observer } from 'mobx-react';
import { Milestone } from 'klendathu-json-types';
import { observable, action } from 'mobx';
import classNames from 'classnames';
import bind from 'bind-decorator';

interface Props {
  className?: string;
  project: Project;
  selection: string;
  milestones: MilestoneListQuery;
  onSelectionChange: (selection: Milestone) => void;
}

class AutocompleteMilestones extends Autocomplete<Milestone> {}

@observer
export class MilestoneSelector extends React.Component<Props> {
  @observable private showDialog = false;
  @observable private milestone: Milestone = null;

  public render() {
    const { className, selection, milestones, onSelectionChange } = this.props;
    return (
      <div className="milestone-selector">
        <AutocompleteMilestones
            className={className}
            selection={milestones.byId(selection)}
            onSelectionChange={onSelectionChange}
            onSearch={this.onSearchMilestones}
            onGetValue={this.onGetValue}
            onGetSortKey={this.onGetSortKey}
            onRenderSuggestion={this.onRenderSuggestion}
            onRenderSelection={this.onRenderSelection}
        />
        <Button onClick={this.onShowDialog}>&hellip;</Button>
        <Dialog
            open={this.showDialog}
            onClose={this.onHideDialog}
            className="choose-milestone-dialog"
        >
          <Dialog.Header hasClose={true}>Select Milestone</Dialog.Header>
          <Dialog.Body>
            <table className="milestone-list">
                <thead>
                  <tr className="heading">
                    <th className="name left">Name</th>
                    <th className="status center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.asList.map(m => (
                    <tr
                        key={m.id}
                        className={classNames({ selected: m === this.milestone})}
                        onClick={e => { this.milestone = m; }}
                    >
                      <td className="name">{m.name}</td>
                      <td className={classNames('status center', m.status)}>
                        <div className="mstatus">{m.status}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={this.onHideDialog}>Cancel</Button>
            <Button kind="primary" onClick={this.onSelectMilestone}>Select</Button>
          </Dialog.Footer>
        </Dialog>
      </div>);
  }

  @bind
  private onSearchMilestones(token: string, callback: SearchCallback<Milestone>) {
    if (token.length === 0) {
      callback([]);
    } else {
      const results: Milestone[] = [];
      for (const milestone of this.props.milestones.asList) {
        if (milestone.name.toLowerCase().startsWith(token.toLowerCase())) {
          results.push(milestone);
        }
        if (results.length > 5) {
          break;
        }
      }
      callback(results);
    }
  }

  @action.bound
  private onSelectMilestone() {
    this.showDialog = false;
    if (this.milestone) {
      this.props.onSelectionChange(this.milestone);
    }
  }

  @bind
  private onRenderSuggestion(milestone: Milestone) {
    return <div key={milestone.id}>{milestone.name}</div>;
  }

  @bind
  private onRenderSelection(milestone: Milestone) {
    return <div key={milestone.id}>{milestone.name}</div>;
  }

  @bind
  private onGetValue(milestone: Milestone): string {
    return milestone.id;
  }

  @bind
  private onGetSortKey(milestone: Milestone) {
    return milestone.name;
  }

  @action.bound
  private onShowDialog(e: any) {
    e.preventDefault();
    this.showDialog = true;
  }

  @action.bound
  private onHideDialog() {
    this.showDialog = false;
  }
}
