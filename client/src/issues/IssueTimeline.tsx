import * as React from 'react';
import { TimelineEntry, Subscription, Issue } from '../../../common/types/graphql';
import { TimelineEntryDisplay } from '../timeline';
import { fragments, ErrorDisplay } from '../graphql';
import { Query } from 'react-apollo';
import { session } from '../models';
import { isSameDay, format, differenceInWeeks, distanceInWordsToNow } from 'date-fns';
// import styled from 'styled-components';
import gql from 'graphql-tag';
import { styled } from '../style';

const IssueTimelineQuery = gql`
  query IssueTimelineQuery($project: ID!, $issue: ID!) {
    timeline(project: $project, issue: $issue) {
      count offset results { ...TimelineEntryFields }
    }
  }
  ${fragments.timelineEntry}
`;

const IssueTimelineSubscription = gql`
  subscription IssueTimelineSubscription($project: ID!, $issue: ID!) {
    timelineChanged(project: $project, issue: $issue) {
      action
      value { ...TimelineEntryFields }
    }
  }
  ${fragments.timelineEntry}
`;

export const TimeLabel = styled.span`
  color: ${props => props.theme.textExtraMuted};
  font-weight: bold;
  grid-column: labels;
  justify-self: end;
  white-space: nowrap;
`;

type TimelineChangeResult = Pick<Subscription, 'timelineChanged'>;

interface Props {
  issue: Issue;
}

export function IssueTimeline({ issue }: Props) {
  return (
    <Query
        query={IssueTimelineQuery}
        variables={{
          issue: issue.id,
          project: issue.project,
        }}
        fetchPolicy="cache-and-network"
    >
      {({ data, error, loading, subscribeToMore, refetch }) => {
        if (error) {
          return <ErrorDisplay error={error} />;
        }
        const { timeline } = data;
        if (session.account && issue) {
          subscribeToMore<TimelineChangeResult>({
            document: IssueTimelineSubscription,
            variables: {
              issue: issue.id,
              project: issue.project,
            },
            updateQuery: (prev, { subscriptionData }) => {
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
          const now = new Date();
          const entries: JSX.Element[] = [];

          timeline.results.forEach((te: TimelineEntry) => {
            if (prevTime === null || !isSameDay(prevTime, te.at)) {
              prevTime = te.at;
              if (differenceInWeeks(now, te.at) < 1) {
                entries.push(
                  <TimeLabel key={`time_${te.id}`}>{format(te.at, 'dddd')}:</TimeLabel>);
              } else {
                entries.push(
                  <TimeLabel key={`time_${te.id}`}>{distanceInWordsToNow(te.at)}:</TimeLabel>);
              }
            }
            entries.push(<TimelineEntryDisplay key={te.id} change={te} />);
          });

          return entries;
        }
        return null;
      }}
    </Query>
  );
}
