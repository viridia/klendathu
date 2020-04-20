import React from 'react';
import classNames from 'classnames';
import { Button, Dialog, CheckBox } from 'skyhook-ui';
import { TimeboxType, TimeboxStatus } from '../../../../common/types/graphql';
import { ProjectEnv } from '../../models';
import { styled } from '../../style';
import { MilestoneColors } from '../../style/milestoneColors';
import { Table, TableHead, TableRow } from '../../layout';
import { Panel } from '../../controls/Panel';
import { format } from 'date-fns';
import { observer } from 'mobx-react';
import { ObservableSet } from 'mobx';
import { SprintName } from '../../controls/SprintName';

const SprintSelectorLayout = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const SprintTable = styled(Table)`
  min-width: 30rem;
`;

const TablePanel = styled(Panel)`
  margin-bottom: 8px;
`;

const SprintRow = styled.tr`
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
  selection: string[];
  onSelectionChange: (selection: string[]) => void;
}

export const SprintSelector = observer(({ className, selection, onSelectionChange }: Props) => {
  const env = React.useContext(ProjectEnv);
  const [showDialog, setShowDialog] = React.useState(false);
  const [newSelection] = React.useState(() => new ObservableSet<string>());
  const [includeConcluded, setIncludeConcluded] = React.useState(false);

  const sprints = React.useMemo(() => {
    const sprintList = env.sortedTimeboxes.filter(m => m.type === TimeboxType.Sprint);
    if (includeConcluded) {
      return sprintList;
    } else {
      return sprintList.filter(m => m.status !== TimeboxStatus.Concluded);
    }
  }, [includeConcluded]);

  return (
    <SprintSelectorLayout className={className}>
      <div>
        {selection.map(spId => <SprintName key={spId} sprint={spId} />)}
      </div>
      <Button
        size="small"
        onClick={e => {
          e.preventDefault();
          newSelection.replace(selection);
          setShowDialog(true);
        }}>
        Edit&hellip;
      </Button>
      <Dialog
        open={showDialog}
        onClose={() => { setShowDialog(false); }}
        className="choose-sprints-dialog"
      >
        <Dialog.Header hasClose={true}>Select Sprint</Dialog.Header>
        <Dialog.Body>
          <TablePanel>
            <SprintTable className="sprint-list">
              <TableHead>
                <TableRow className="heading">
                  <th className="selected center"></th>
                  <th className="name center">Name</th>
                  <th className="status center">Status</th>
                  <th className="start center">Start</th>
                  <th className="end center">End</th>
                </TableRow>
              </TableHead>
              <tbody>
                {sprints.map(sp => (
                  <SprintRow key={sp.id} >
                    <td className="selected center">
                      <CheckBox
                        checked={newSelection.has(sp.id)}
                        onChange={ev => {
                          if (ev.target.checked) {
                            newSelection.add(sp.id);
                          } else {
                            newSelection.delete(sp.id);
                          }
                        }}
                      />
                    </td>
                    <td className="name center">{sp.name}</td>
                    <td className={classNames('status center', sp.status.toLowerCase())}>
                      <div className="mstatus">{sp.status}</div>
                    </td>
                    <td className="start center pad">
                      {sp.status !== TimeboxStatus.Timeless && sp.startDate ?
                        format(sp.startDate, 'MM/DD/YYYY') : null}
                    </td>
                    <td className="end center pad">
                      {sp.status !== TimeboxStatus.Timeless && sp.endDate ?
                        format(sp.endDate, 'MM/DD/YYYY') : null}
                    </td>
                  </SprintRow>
                ))}
              </tbody>
            </SprintTable>
          </TablePanel>
          <CheckBox
            checked={includeConcluded}
            onChange={checked => { setIncludeConcluded(checked.target.checked); }}
          >
            Include concluded sprints.
          </CheckBox>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={e => { e.preventDefault(); setShowDialog(false); }}>Cancel</Button>
          <Button variant="primary" onClick={e => {
            e.preventDefault();
            onSelectionChange(Array.from(newSelection));
            setShowDialog(false);
          }}>
            Select
          </Button>
        </Dialog.Footer>
      </Dialog>
    </SprintSelectorLayout>
  );
});
