import * as React from 'react';
import { ProjectEnv } from '../../../models';
import gql from 'graphql-tag';
import { fragments, ErrorDisplay } from '../../../graphql';
import { useQuery } from '@apollo/client';
import { Membership } from '../../../../../common/types/graphql';
import { ProjectMemberList } from './ProjectMemberList';

const ProjectMembersQuery = gql`
  query ProjectMembersQuery($project: ID!) {
    projectMembers(project: $project) { ...MembershipFields }
  }
  ${fragments.membership}
`;

const ProjectMemberChangeSubscription = gql`
  subscription ProjectMemberChangeSubscription($project: ID!) {
    membershipChanged(project: $project) {
      action
      value { ...MembershipFields }
    }
  }
  ${fragments.membership}
`;

export function ProjectMembers(props: {}) {
  const env = React.useContext(ProjectEnv);
  const { project } = env;
  const { loading, error, data, refetch, subscribeToMore } = useQuery(ProjectMembersQuery, {
    variables: {
      project: project.id,
    },
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !(data && data.labels)) {
    // Only display loading indicator if nothing in cache.
    return <div>loading&hellip;</div>;
  } else if (error) {
    return <ErrorDisplay error={error} />;
  } else {
    subscribeToMore({
      document: ProjectMemberChangeSubscription,
      variables: {
        project: project.id,
      },
      updateQuery: (/*prev, { subscriptionData }*/) => {
        // For the moment we're just going to refresh.
        // console.log('subscriptionData', subscriptionData);
        refetch();
      },
    });
    const members: Membership[] = data.projectMembers;
    return (
      <ProjectMemberList members={members} env={env} />
    );
  }
}
