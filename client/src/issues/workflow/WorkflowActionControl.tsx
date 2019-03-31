import * as React from 'react';
import { Button } from 'skyhook-ui';
import { AccountName, RELATION_NAMES } from '../../controls';
import { Issue } from '../../../../common/types/graphql';
import { ExecutableAction, ExecutableLinkEffect } from './ExecutableAction';
import { ActionEnv } from './ActionEnv';
import { OperandType, ProjectEnv } from '../../models';
import styled from 'styled-components';
import { IssueCondensedDisplay } from '../IssueCondensedDisplay';

const WorkflowActionEl = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 16px;

  > button {
    display: inline-block;
    justify-content: center;
    margin-bottom: 2px;
    white-space: normal;
  }
`;

const WorkflowEffect = styled.section`
  display: block;
  font-size: 90%;
  margin-left: 20px;
  text-indent: -12px;

  > * {
    text-indent: 0;
  }

  > .value {
    font-weight: bold;
  }

  & .placeholder {
    color: ${props => props.theme.textAccented};
  }

  & .unassigned {
    font-style: italic;
    color: ${props => props.theme.textMuted};
  }
`;

interface Props {
  issue: Issue;
  execAction: ExecutableAction;
  vars: ActionEnv;
  onExec: (execAction: ExecutableAction) => any;
}

function LinkEffectDisplay({ link }: { link: ExecutableLinkEffect }) {
  const relation: React.ReactNode =
    typeof link.relation === 'string' ? RELATION_NAMES[link.relation] || link.relation : '?';
  const to: React.ReactNode =
    typeof link.to === 'string' ? <IssueCondensedDisplay id={link.to} /> : '?';
  return (
    <WorkflowEffect className="effect">
      add link &#x21d2; <span className="value">
        {relation}: {to}
      </span>
    </WorkflowEffect>
  );
}

export function WorkflowActionControl(props: Props) {
  const env = React.useContext(ProjectEnv);
  const { execAction, issue, vars, onExec } = props;
  const effects = execAction.effects(issue, vars);
  if (effects.length === 0) {
    return null;
  }
  return (
    <WorkflowActionEl>
      <Button variant="default" onClick={() => onExec(execAction)}>{execAction.caption}</Button>
      {execAction.target && execAction.target !== 'self' && (
        <WorkflowEffect className="effect">
          target: <span className="value">{execAction.target}</span>
        </WorkflowEffect>
      )}
      {effects.map(effect => {
        if (typeof effect.value === 'symbol') {
          return (
            <WorkflowEffect key={effect.key} className="effect">
              {effect.key} &#x21d2; <span className="value">
                <span className="placeholder">?</span></span>
            </WorkflowEffect>
          );
        } else if (typeof effect.value === 'string' || effect.value === null) {
          const value = effect.value as string;
          if (effect.type === OperandType.USER) {
            return (
              <WorkflowEffect key={effect.key} className="effect">
                {effect.key} &#x21d2; <span className="value"><AccountName id={value} /></span>
              </WorkflowEffect>
            );
          } else if (effect.type === OperandType.STATE) {
            const st = env.states.get(value);
            const stateName = st ? st.caption : value;
            return (
              <WorkflowEffect key={effect.key} className="effect">
                {effect.key} &#x21d2; <span className="value">{stateName}</span>
              </WorkflowEffect>
            );
          } else {
            return (
              <WorkflowEffect key={effect.key} className="effect">
                {effect.key} &#x21d2; <span className="value">{value}</span>
              </WorkflowEffect>
            );
          }
        } else if (effect.type === OperandType.LINK) {
          return effect.value.map((linkEffect, index) => (
            <LinkEffectDisplay key={`${effect.key}_${index}`} link={linkEffect} />
          ));
        } else {
          return (
            <WorkflowEffect key={effect.key} className="effect">
              {effect.key} &#x21d2; <span className="value">{effect.value}</span>
            </WorkflowEffect>
          );
        }
      })}
    </WorkflowActionEl>
  );
}
