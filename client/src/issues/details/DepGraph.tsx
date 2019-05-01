import * as React from 'react';
import { ProjectEnv } from '../../models';
import { Issue, Query as Q } from '../../../../common/types/graphql';
import gql from 'graphql-tag';
import { GraphModel } from '../../nodegraph';
import { DepGraphContent } from './DepGraphContent';
import { client } from '../../graphql/client';

/** Query a single account by id or account name */
export const ReachableQuery = gql`
  query ReachableQuery($rootSet: [ID!]!) {
    reachableIssues(rootSet: $rootSet) {
      issue {
        id
        type
        state
        summary
      }
      parents
      blockedBy
      related
    }
  }
`;

type ReachableQuery = Pick<Q, 'reachableIssues'>;

function queryReachableIssues(rootSet: string[]) {
  return client.query<ReachableQuery>({
    query: ReachableQuery,
    variables: { rootSet }
  });
}

interface Props {
  issue: Issue;
}

export function DepGraph({ issue }: Props) {
  const env = React.useContext(ProjectEnv);
  const [graph] = React.useState(() => new GraphModel(3, 3, 3, 3));
  React.useEffect(() => {
    queryReachableIssues([issue.id]).then(({ data, loading, errors }) => {
      if (errors) {
        env.error = errors[0];
      } else if (!loading && data) {
        graph.setNodes(data.reachableIssues);
      }
    });
  }, [issue.id]);

  return (
    <DepGraphContent graph={graph} selected={issue.id} />
  );
}
