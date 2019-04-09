import * as React from 'react';
import { TimelineEntry, Subscription, Issue } from '../../../common/types/graphql';
import { TimelineEntryDisplay, TimeLabel } from '../timeline';
import { fragments, ErrorDisplay } from '../graphql';
import { Query } from 'react-apollo';
import { session } from '../models';
import { isSameDay } from 'date-fns';
import gql from 'graphql-tag';
import { relativeDay } from '../controls/RelativeDate';

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
          const entries: JSX.Element[] = [];

          timeline.results.forEach((te: TimelineEntry) => {
            if (prevTime === null || !isSameDay(prevTime, te.at)) {
              prevTime = te.at;
              entries.push(<TimeLabel key={`time_${te.id}`}>{relativeDay(te.at)}:</TimeLabel>);
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
