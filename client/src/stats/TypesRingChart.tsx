import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Pie, PieDatum } from '@nivo/pie';
import { Bucket } from '../../../common/types/graphql';
import { ProjectEnv } from '../models';
import { parseToHsl, hsl } from 'polished';
import { Card } from '../controls';

const TypeStatsQuery = gql`
  query TypeStatsQuery($project: ID!, $filter: StatsFilter) {
    stats(project: $project) { types(filter: $filter) { key count } }
  }
`;

export function TypesRingChart(props: {}) {
  const env = React.useContext(ProjectEnv);
  const { project, template } = env;
  return (
    <Query
        query={TypeStatsQuery}
        variables={{ project: project.id }}
    >
      {({ loading, error, data }) => {
        if (loading) {
          return <div className="chart loading" />;
        } else if (error) {
          env.error = error;
          return <div className="chart error">[Data Load Error]</div>;
        } else if (data.stats && data.stats.types) {
          const buckets: Bucket[] = data.stats.types;
          const bucketMap = new Map(buckets.map(bk => [bk.key, bk] as [string, Bucket]));
          const numTypes = template.types.length;
          const color = parseToHsl('#ff88ff');
          // Arrange types in the order they are declared in the template.
          const sortedBuckets: PieDatum[] = [];
          template.types.forEach(ty => {
            const bk = bucketMap.get(ty.id);
            if (bk) {
              sortedBuckets.push({
                id: ty.caption,
                label: ty.caption,
                value: bk.count,
                color: hsl(color),
              });
            }
            color.hue += 200 / numTypes;
          });

          return (
            <Card>
              <header>Issue types</header>
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
