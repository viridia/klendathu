import React from 'react';
import { TimeboxType } from '../../../../common/types/graphql';
import { Menu, MenuButton, MenuList, MenuItem, MenuDivider } from '../../controls/widgets';
import { ProjectEnv } from '../../models';
import { ObservableSet } from 'mobx';
import { styled } from '../../style';
import { SprintName, SprintChip } from '../../controls/SprintName';
import { timeboxStateColors } from '../../style/milestoneColors';
import { Observer } from 'mobx-react';

const SelectionButton = styled(MenuButton)`
  padding: 0;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const SelectionButtonContent = styled.div`
  align-items: stretch;
  display: flex;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;

  > .caret {
    display: flex;
    flex: 0 0 0;
    padding: 0 10px;
    border-left: 1px solid ${p => p.theme.button.default.borderColor};
    align-items: center;
  }
`;

const SelectionList = styled.section`
  align-self: stretch;
  align-items: center;
  background-color: ${p => p.theme.cardBgColor};
  display: flex;
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 0 6px;
`;

function TimeboxMenuItem(
  { id, value, children }: { id: string, value: ObservableSet, children: React.ReactNode }) {
  return (
    <MenuItem
      key={id}
      checked={value && value.has(id)}
      onSelect={() => {
        if (value.has(id)) {
          value.delete(id);
        } else {
          value.add(id);
        }
      }}
    >
      {children}
    </MenuItem>
  );
}

const timeboxStateGroups: { [id: string]: string } = {
  active: 'Active',
  pending: 'Pending',
  timeless: 'Timeless',
  concluded: 'Concluded',
};

interface Props {
  type: TimeboxType;
  value: ObservableSet;
  className?: string;
  noStates?: boolean;
}

export function TimeboxSetSelector({ type, value, className, noStates }: Props) {
  const env = React.useContext(ProjectEnv);
  return (
    <Menu>
      <SelectionButton className={className} noCaret>
        <SelectionButtonContent>
          <Observer>
            {() => {
              const selection = Array.from(value.values());
              return (
                <SelectionList>
                    {value.size === 0 && <span>Select Sprint&hellip;</span>}
                    {selection.filter(sp => sp.startsWith('.')).map(id =>
                      <SprintChip key={id} color={timeboxStateColors[id.slice(1)]}>
                        {timeboxStateGroups[id.slice(1)]}
                      </SprintChip>
                    )}
                    {selection.filter(sp => !sp.startsWith('.')).map(sp =>
                      <SprintName key={sp} sprint={sp}></SprintName>)}
                  </SelectionList>
              );
            }}
          </Observer>
          <span className="caret">&#x25BE;</span>
        </SelectionButtonContent>
      </SelectionButton>
      <MenuList checkmarks align="justify">
        {!noStates && Object.keys(timeboxStateGroups).map(id => (
          <TimeboxMenuItem key={`.${id}`} id={`.${id}`} value={value}>
            {timeboxStateGroups[id]}
          </TimeboxMenuItem>
        ))}
        {!noStates && <MenuDivider/>}
        {env.sortedTimeboxes.filter(tb => tb.type === type).map(tb => (
          <TimeboxMenuItem key={tb.id} id={tb.id} value={value}>
            {tb.name}
          </TimeboxMenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
