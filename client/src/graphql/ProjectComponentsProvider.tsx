import * as React from 'react';
import { Query } from 'react-apollo';
import { ProjectComponents } from '../../../common/types/graphql';
import gql from 'graphql-tag';
import { ErrorDisplay } from './ErrorDisplay';

const projectComponentsQuery = gql`
  query ProjectComponentsQuery($owner: String!, $name: String!) {
    projectComponents(owner: $owner, name: $name) {
      project { id name title description owner isPublic }
      account { id accountName type display photo }
    }
  }
`;

export interface Components extends ProjectComponents {
  loading?: boolean;
}

interface Props {
  owner: string;
  name: string;
  children: (components: Components) => React.ReactNode;
}

/** Provider component that resolves the owner/name URL into project, account, etc. */
export function ProjectComponentsProvider({ owner, name, children }: Props) {
  return (
    <Query query={projectComponentsQuery} variables={{ owner, name }} >
      {({ loading, error, data }) => {
        if (loading) {
          return children({ loading, account: null, project: null });
        } else if (error) {
          return <ErrorDisplay error={error} />;
        } else {
          return children({ ...data.projectComponents });
        }
      }}
    </Query>
  );
}
