// tslint:disable:max-classes-per-file
import * as React from 'react';
import { Button, Dialog, Autocomplete, SearchCallback } from '../../controls';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import classNames from 'classnames';
import bind from 'bind-decorator';
import { Milestone } from '../../../../common/types/graphql';
import { ViewContext } from '../../models';
import { styled } from '../../style';
import { MilestoneColors } from '../../style/milestoneColors';

const MilestoneSelectorLayout = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;

  > button {
    margin-left: 4px;
  }
`;

const MilestoneTable = styled.table`
  min-width: 20rem;
  border-spacing: 0;
`;

const MilestoneHeaderRow = styled.tr`
  > th {
    padding: 4px;
  }
`;

const MilestoneRow = styled.tr`
  &.selected {
    background-color: ${props => props.theme.tabActiveBgColor};
  }

  td, th {
  padding: 0 4px 0 8px;
  cursor: pointer;

  &.timeless > .mstatus {
    background-color: ${MilestoneColors.TIMELESS};
  }
  &.active > .mstatus {
    background-color: ${MilestoneColors.ACTIVE};
  }
  &.concluded > .mstatus {
    background-color: ${MilestoneColors.CONCLUDED};
  }
  &.pending > .mstatus {
    background-color: ${MilestoneColors.PENDING};
  }

  > .name {
    text-align: left;
  }

  > .mstatus {
    border-radius: 4px;
    margin: 2px;
    padding: 6px 10px;
    text-align: center;
  }
}
`;

interface Props {
  className?: string;
  env: ViewContext;
  selection: string;
  onSelectionChange: (selection: Milestone) => void;
}

class AutocompleteMilestones extends Autocomplete<Milestone> {}

@observer
export class MilestoneSelector extends React.Component<Props> {
  @observable private showDialog = false;
  @observable private milestone: Milestone = null;

  public render() {
    const { env, className, selection, onSelectionChange } = this.props;
    return (
      <MilestoneSelectorLayout>
        <AutocompleteMilestones
            className={className}
            selection={env.getMilestone(selection)}
            onSelectionChange={onSelectionChange}
            onSearch={this.onSearchMilestones}
            onGetValue={this.onGetValue}
            onGetSortKey={this.onGetSortKey}
            onRenderSuggestion={this.onRenderSuggestion}
            onRenderSelection={this.onRenderSelection}
        />
        <Button size="small" onClick={this.onShowDialog}>&hellip;</Button>
        <Dialog
            open={this.showDialog}
            onClose={this.onHideDialog}
            className="choose-milestone-dialog"
        >
          <Dialog.Header hasClose={true}>Select Milestone</Dialog.Header>
          <Dialog.Body>
            <MilestoneTable className="milestone-list">
              <thead>
                <MilestoneHeaderRow className="heading">
                  <th className="name left">Name</th>
                  <th className="status center">Status</th>
                </MilestoneHeaderRow>
              </thead>
              <tbody>
                {env.sortedMilestones.map(m => (
                  <MilestoneRow
                      key={m.id}
                      className={classNames({ selected: m === this.milestone})}
                      onClick={e => { this.milestone = m; }}
                  >
                    <td className="name">{m.name}</td>
                    <td className={classNames('status center', m.status.toLowerCase())}>
                      <div className="mstatus">{m.status}</div>
                    </td>
                  </MilestoneRow>
                ))}
              </tbody>
            </MilestoneTable>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={this.onHideDialog}>Cancel</Button>
            <Button kind="primary" onClick={this.onSelectMilestone}>Select</Button>
          </Dialog.Footer>
        </Dialog>
      </MilestoneSelectorLayout>);
  }

  @bind
  private onSearchMilestones(token: string, callback: SearchCallback<Milestone>) {
    if (token.length === 0) {
      callback([]);
    } else {
      const results: Milestone[] = [];
      for (const milestone of this.props.env.sortedMilestones) {
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
