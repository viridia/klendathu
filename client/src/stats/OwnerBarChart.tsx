import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Bucket } from '../../../common/types/graphql';
import { ProjectEnv } from '../models';
import { BarDatum, ResponsiveBar } from '@nivo/bar';
import { numberCompareProperty } from '../lib/order';

const OwnerStatsQuery = gql`
  query OwnerStatsQuery($project: ID!, $filter: StatsFilter) {
    stats(project: $project) { owners(filter: $filter) { key count accountName accountDisplay } }
  }
`;

export function OwnerBarChart(props: {}) {
  const env = React.useContext(ProjectEnv);
  const { project } = env;
  return (
    <Query
        query={OwnerStatsQuery}
        variables={{ project: project.id }}
    >
      {({ loading, error, data }) => {
        if (loading) {
          return <div className="chart loading" />;
        } else if (error) {
          return <div className="chart error">[Data Load Error]</div>;
        } else if (data.stats && data.stats.owners) {
          const buckets: Bucket[] = data.stats.owners;
          const sortedBuckets: BarDatum[] = buckets.map(bk => ({
            id: bk.accountName || '',
            label: bk.accountDisplay || 'unassigned',
            value: bk.count,
          }));
          sortedBuckets.sort(numberCompareProperty('count')).reverse().slice(10);

          return (
            <section style={{ width: '100%', height: `${32 * sortedBuckets.length}px` }}>
              <ResponsiveBar
                layout="horizontal"
                indexBy="label"
                animate={false}
                enableLabel={true}
                enableGridX={true}
                colors="dark2"
                margin={{
                  left: 150,
                  right: 10,
                }}
                keys={[
                  'value'
                ]}
                data={sortedBuckets}
              />
            </section>
          );
        } else {
          return <div className="chart no-data" />;
        }
      }}
    </Query>
  );
}
