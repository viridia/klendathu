// tslint:disable:max-classes-per-file
import * as React from 'react';
import { Button, Dialog, CheckBox } from 'skyhook-ui';
import { Autocomplete, SearchCallback } from '../../controls';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import classNames from 'classnames';
import bind from 'bind-decorator';
import { Timebox, TimeboxType, TimeboxStatus } from '../../../../common/types/graphql';
import { ViewContext } from '../../models';
import { styled } from '../../style';
import { MilestoneColors } from '../../style/milestoneColors';

const MilestoneSelectorLayout = styled.div`
  align-items: center;
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
  margin-bottom: 8px;
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
  onSelectionChange: (selection: Timebox) => void;
}

@observer
export class MilestoneSelector extends React.Component<Props> {
  @observable private showDialog = false;
  @observable private timebox: Timebox = null;
  @observable private includeConcluded = false;

  public render() {
    const { env, className, selection, onSelectionChange } = this.props;
    return (
      <MilestoneSelectorLayout>
        <Autocomplete<Timebox>
          className={className}
          selection={env.getTimebox(selection)}
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
                {this.milestones.map(m => (
                  <MilestoneRow
                    key={m.id}
                    className={classNames({ selected: m === this.timebox})}
                    onClick={e => { this.timebox = m; }}
                    onDoubleClick={e => { this.timebox = m; this.onSelectMilestone(); }}
                  >
                    <td className="name">{m.name}</td>
                    <td className={classNames('status center', m.status.toLowerCase())}>
                      <div className="mstatus">{m.status}</div>
                    </td>
                  </MilestoneRow>
                ))}
              </tbody>
            </MilestoneTable>
            <CheckBox
              checked={this.includeConcluded}
              onChange={checked => { this.includeConcluded = checked.target.checked; }}
            >
              Include concluded milestones.
            </CheckBox>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={this.onHideDialog}>Cancel</Button>
            <Button variant="primary" onClick={this.onSelectMilestone}>Select</Button>
          </Dialog.Footer>
        </Dialog>
      </MilestoneSelectorLayout>);
  }

  @bind
  private onSearchMilestones(token: string, callback: SearchCallback<Timebox>) {
    if (token.length === 0) {
      callback([]);
    } else {
      const results: Timebox[] = [];
      for (const milestone of this.props.env.sortedTimeboxes) {
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
    if (this.timebox) {
      this.props.onSelectionChange(this.timebox);
    }
  }

  @bind
  private onRenderSuggestion(milestone: Timebox) {
    return <div key={milestone.id}>{milestone.name}</div>;
  }

  @bind
  private onRenderSelection(milestone: Timebox) {
    return <div key={milestone.id}>{milestone.name}</div>;
  }

  @bind
  private onGetValue(milestone: Timebox): string {
    return milestone.id;
  }

  @bind
  private onGetSortKey(milestone: Timebox) {
    return milestone.name;
  }

  private get milestones() {
    const { env } = this.props;
    const milestones = env.sortedTimeboxes.filter(m => m.type === TimeboxType.Milestone);
    if (this.includeConcluded) {
      return milestones;
    } else {
      return milestones.filter(m => m.status !== TimeboxStatus.Concluded);
    }
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
