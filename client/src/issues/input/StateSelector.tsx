import * as React from 'react';
import { ProjectEnv } from '../../models';
import { WorkflowState, Workflow } from '../../../../common/types/json';
import styled from 'styled-components';
import { Observer } from 'mobx-react';
import { FormLabel, RadioButton } from 'skyhook-ui';

interface Props {
  state: string;
  prevState?: string;
  workflow: Workflow;
  onStateChanged: (state: string) => void;
}

function caption(state: WorkflowState) {
  if (!state) {
    return null;
  }
  if (state.closed) {
    return <span>Closed: {state.caption}</span>;
  } else {
    return state.caption;
  }
}

const StateSelectorLayout = styled.section`
  display: flex;
  flex-direction: column;

  > * {
    margin-bottom: .3rem;
  }

  > .form-label {
    margin-bottom: .7rem;
  }
`;

/** Selects the state of the issue. */
export function StateSelector(props: Props) {
  function onChange(e: any) {
    props.onStateChanged(e.target.dataset.state);
  }

  const env = React.useContext(ProjectEnv);
  return (
    <Observer>
      {() => {
        if (!env.template) {
          return null;
        }
        const { workflow, state, prevState } = props;
        const nextState = state; // State we're going to
        const currState = prevState || state;
        const currStateInfo = env.states.get(currState);
        let transitions: string[];
        if (prevState && currStateInfo) {
          // Let them choose any successor of the current state.
          transitions = currStateInfo.transitions;
          if (workflow && workflow.states) {
            const stateSet = new Set(workflow.states);
            transitions = transitions.filter(st => stateSet.has(st));
          }
        } else if (workflow) {
          // No previous state
          if (workflow.start) {
            // Let them choose one of the starting states.
            transitions = workflow.start;
          } else if (workflow.states) {
            // Let them choose any state in the workflow.
            transitions = workflow.states;
          }
          // if (currState) {
          //   transitions = transitions.filter(st => st !== currState);
          // }
        } else {
          // No workflow, let them choose any state in the template.
          transitions = env.template.states.map(st => st.id);
          // if (currState) {
          //   transitions = transitions.filter(st => st !== currState);
          // }
        }
        return (
          <StateSelectorLayout>
            <FormLabel className="form-label">State</FormLabel>
            {prevState && <RadioButton
              checked={prevState === nextState}
              data-state={prevState}
              onChange={onChange}
              disabled={!workflow}
            >
              {caption(env.states.get(prevState))}
            </RadioButton>}
            {transitions.map(s => {
              const toState = env.states.get(s);
              return toState && (
                <RadioButton
                  key={toState.id}
                  checked={toState.id === nextState}
                  data-state={toState.id}
                  onChange={onChange}
                  disabled={!workflow}
                >
                  {caption(toState)}
                </RadioButton>
              );
            })}
          </StateSelectorLayout>
        );
      }}
    </Observer>
  );
}
