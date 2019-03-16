import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Pie, PieDatum } from '@nivo/pie';
import { Bucket } from '../../../common/types/graphql';
import { ProjectEnv } from '../models';
import { parseToHsl, hsl } from 'polished';
import { Card } from '../controls';

const StateStatsQuery = gql`
  query StateStatsQuery($project: ID!, $filter: StatsFilter) {
    stats(project: $project) { states(filter: $filter) { key count } }
  }
`;

interface Props {
  open?: boolean;
}

export function StatesRingChart(props: Props) {
  const env = React.useContext(ProjectEnv);
  const { project, template } = env;
  return (
    <Query
        query={StateStatsQuery}
        variables={{ project: project.id }}
    >
      {({ loading, error, data }) => {
        if (loading) {
          return <div className="chart loading" />;
        } else if (error) {
          return <div className="chart error">[Data Load Error]</div>;
        } else if (data.stats && data.stats.states) {
          const buckets: Bucket[] = data.stats.states;
          const bucketMap = new Map(buckets.map(bk => [bk.key, bk] as [string, Bucket]));
          const numClosedStates = template.states.filter(st => st.closed).length;
          const numOpenStates = template.states.length - numClosedStates;
          const closedColor = parseToHsl('#4488ee');
          const openColor = parseToHsl('#33eeaa');
          // Arrange states in the order they are declared in the template.
          const sortedBuckets: PieDatum[] = [];
          template.states.forEach(st => {
            const bk = bucketMap.get(st.id);
            if (bk) {
              sortedBuckets.push({
                id: st.caption,
                label: st.caption,
                value: bk.count,
                color: hsl(st.closed ? closedColor : openColor),
              });
            }
            if (st.closed) {
              closedColor.hue += 50 / numClosedStates;
            } else {
              openColor.hue += 50 / numOpenStates;
            }
          });

          return (
            <Card>
              <header>Issue states</header>
              <Pie
                  width={430}
                  height={320}
                  innerRadius={0.5}
                  colorBy={(bk: any) => bk.color}
                  margin={{
                    top: 40,
                    right: 80,
                    bottom: 40,
                    left: 80,
                  }}
                  borderWidth={1}
                  borderColor="inherit:darker(0.6)"
                  data={sortedBuckets}
              />
            </Card>
          );
        } else {
          return <div className="chart no-data" />;
        }
      }}
    </Query>
  );
}
