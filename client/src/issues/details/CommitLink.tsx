import * as React from 'react';
import { Commit } from '../../../../common/types/graphql';
import { styled } from '../../style';
import classNames from 'classnames';

const CommitLinkEl = styled.span`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const CommitStatus = styled.span`
  align-items: center;
  background-color: #f44;
  color: #fee;
  display: flex;
  font-size: .7rem;
  font-weight: bold;
  justify-content: center;
  padding: 4px 8px;
  margin-right: 4px;
  min-width: 3rem;

  &.submitted {
    background-color: #2a2;
  }
`;

const CommitId = styled.span`
  font-weight: bold;
  margin-right: 4px;
`;

const CommitMessage = styled.a`
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface Props {
  commit: Commit;
}

export function CommitLink({ commit }: Props) {
  const { submitted } = commit;
  return (
    <CommitLinkEl>
      <CommitStatus className={classNames({ submitted})}>
        {submitted ? 'merged' : 'pending'}
      </CommitStatus>
      <CommitId>
        #{commit.commit}:
      </CommitId>
      <CommitMessage href={commit.url} target="_blank">
        {commit.message}
      </CommitMessage>
    </CommitLinkEl>
  );
}
