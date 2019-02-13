import * as React from 'react';
import { Project, ProjectPrefs } from '../../../common/types/graphql';
import { Query } from 'react-apollo';
import { fragments } from '../graphql';
import gql from 'graphql-tag';
import { LabelName } from '../controls/LabelName';
import styled from 'styled-components';

const ProjectPrefsQuery = gql`
  query ProjectPrefsQuery($project: ID!) {
    projectPrefs(project: $project) { labels }
  }
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

const LabelList = styled.ul`
  margin: 4px 0;
  padding-left: 30px;
  > li {
    margin: 4px 0;
  }
`;

interface Props {
  project: Project;
}

export function LabelLinks({ project }: Props) {
  return (
    <Query
        query={ProjectPrefsQuery}
        variables={{
          project: project.id,
        }}
        fetchPolicy="cache-and-network"
    >
      {({ loading, error, data, refetch, subscribeToMore }) => {
        if (loading && !(data && data.projectPrefs)) {
          return null;
        } else if (error) {
          return null;
        } else {
          subscribeToMore({
            document: PrefsChangeSubscription,
            variables: {
              project: project.id,
            },
            updateQuery: (prev, { subscriptionData }) => {
              // For the moment we're just going to refresh.
              // console.log('subscriptionData', subscriptionData);
              refetch();
            },
          });
          // TODO: This would be done better as a join so that we can sort.
          const prefs: ProjectPrefs = data.projectPrefs;
          return (
            <LabelList>
              {prefs.labels.map(labelId => (
                <li key={labelId}><LabelName id={labelId} small={true} /></li>
              ))}
            </LabelList>
          );
        }
      }}
    </Query>
  );
}
