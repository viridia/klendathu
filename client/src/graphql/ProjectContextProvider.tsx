import * as React from 'react';
import { Query } from 'react-apollo';
import { ProjectContext, ProjectPrefs } from '../../../common/types/graphql';
import gql from 'graphql-tag';
import { ErrorDisplay } from './ErrorDisplay';
import { fragments } from './fragments';
// import { Template } from '../../../common/types/json';

const ProjectContextQuery = gql`
  query ProjectContextQuery($owner: String!, $name: String!) {
    projectContext(owner: $owner, name: $name) {
      project { ...ProjectFields }
      account { ...AccountFields }
      prefs { columns labels filters { name } }
      template
    }
  }
  ${fragments.project}
  ${fragments.account}
`;

const PrefsChangeSubscription = gql`
  subscription PrefsChangeSubscription($project: ID!) {
    prefsChanged(project: $project) {
      action
      prefs { ...ProjectPrefsFields }
    }
  }
  ${fragments.projectPrefs}
`;

export interface ViewContext extends ProjectContext {
  loading?: boolean;
  visibleLabels: Set<string>;
  // template: Template;
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
      {({ loading, error, data, subscribeToMore, refetch }) => {
        if (loading) {
          return children({
            loading,
            account: null,
            project: null,
            prefs: null,
            template: null,
            visibleLabels: null,
          });
        } else if (error) {
          return <ErrorDisplay error={error} />;
        } else {
          if (data.projectContext.project) {
            // TODO: Prefs changes shouldn't have to refresh the whole project.
            subscribeToMore({
              document: PrefsChangeSubscription,
              variables: {
                project: data.projectContext.project.id,
              } as any,
              updateQuery: (prev, { subscriptionData }) => {
                // TODO: For the moment we're just going to refresh.
                // console.log('subscriptionData', subscriptionData);
                refetch();
              },
            });
          }
          const prefs: ProjectPrefs = data.projectContext.prefs;
          const visibleLabels = new Set<string>(prefs ? prefs.labels : []);
          return children({ ...data.projectContext, visibleLabels });
        }
      }}
    </Query>
  );
}
