import * as React from 'react';
import { Query } from 'react-apollo';
import { ProjectContext } from '../../../common/types/graphql';
import gql from 'graphql-tag';
import { ErrorDisplay } from './ErrorDisplay';
import { Template } from '../../../common/types/json';

const ProjectContextQuery = gql`
  query ProjectContextQuery($owner: String!, $name: String!) {
    projectContext(owner: $owner, name: $name) {
      project { id name title description owner isPublic }
      account { id accountName type display photo }
      template
    }
  }
`;

export interface ViewContext extends ProjectContext {
  loading?: boolean;
  template: Template;
}

interface Props {
  owner: string;
  name: string;
  children: (context: ViewContext) => React.ReactNode;
}

/** Provider component that resolves the owner/name URL into project, account, etc. */
export function ProjectContextProvider({ owner, name, children }: Props) {
  return (
    <Query query={ProjectContextQuery} variables={{ owner, name }} >
      {({ loading, error, data }) => {
        if (loading) {
          return children({ loading, account: null, project: null, template: null });
        } else if (error) {
          return <ErrorDisplay error={error} />;
        } else {
          return children({ ...data.projectContext });
        }
      }}
    </Query>
  );
}
