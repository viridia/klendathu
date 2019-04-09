import * as React from 'react';
import { TimelineEntry, Subscription } from '../../../common/types/graphql';
import { TimelineEntryDisplay } from '../timeline';
import { fragments, ErrorDisplay } from '../graphql';
import { Query } from 'react-apollo';
import { session, ViewContext } from '../models';
import { isSameDay } from 'date-fns';
import { TimeLabel } from './TimeLabel';
import gql from 'graphql-tag';
import { relativeDay } from '../controls/RelativeDate';
import styled from 'styled-components';

const ProjectTimelineQuery = gql`
  query ProjectTimelineQuery($project: ID!) {
    timeline(project: $project, recent: true) {
      count offset results { ...TimelineEntryFields }
    }
  }
  ${fragments.timelineEntry}
`;

const ProjectTimelineSubscription = gql`
  subscription IssueTimelineSubscription($project: ID!) {
    timelineChanged(project: $project) {
      action
      value { ...TimelineEntryFields }
    }
  }
  ${fragments.timelineEntry}
`;

type TimelineChangeResult = Pick<Subscription, 'timelineChanged'>;

const TimelineLayout = styled.section`
  align-items: flex-start;
  display: grid;
  flex: 1;
  gap: 8px;
  grid-auto-flow: row;
  grid-template-columns: [labels] auto [controls] 1fr;
  justify-items: flex-start;
  margin: 0 0 0 1rem;
  padding: 0 0.5rem 1rem 0;
  overflow-y: scroll;

  > .fill {
    justify-self: stretch;
  }
`;

interface Props {
  env: ViewContext;
}

export function ProjectTimeline({ env }: Props) {
  const { project } = env;
  return (
    <Query
      query={ProjectTimelineQuery}
      variables={{
        project: project.id,
      }}
      fetchPolicy="cache-and-network"
    >
      {({ data, error, subscribeToMore, refetch }) => {
        if (error) {
          return <ErrorDisplay error={error} />;
        }
        const { timeline } = data;
        if (session.account && project) {
          subscribeToMore<TimelineChangeResult>({
            document: ProjectTimelineSubscription,
            variables: {
              project: project.id,
            },
            updateQuery: (/*prev, { subscriptionData } */) => {
              // TODO: be smarter about updating the cache.
              // return {
              //   timeline: subscriptionData.data.timelineChanged.value,
              // };
              // console.log('prev', prev);
              // console.log('subscriptionData', subscriptionData);
              // // For the moment we're just going to refresh.
              // // console.log('subscriptionData', subscriptionData);
              refetch();
            },
          });
        }

        if (timeline && timeline.results && timeline.results.length > 0) {
          let prevTime: Date = null;
          const entries: JSX.Element[] = [];

          timeline.results.forEach((te: TimelineEntry) => {
            if (prevTime === null || !isSameDay(prevTime, te.at)) {
              prevTime = te.at;
              entries.push(<TimeLabel key={`time_${te.id}`}>{relativeDay(te.at)}:</TimeLabel>);
            }
            entries.push(<TimelineEntryDisplay key={te.id} change={te} showIssue={true} />);
          });

          return (
            <TimelineLayout>
              {entries}
            </TimelineLayout>
          );
        }
        return null;
      }}
    </Query>
  );
}
