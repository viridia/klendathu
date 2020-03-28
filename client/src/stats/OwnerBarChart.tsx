import * as React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Bucket } from '../../../common/types/graphql';
import { ProjectEnv } from '../models';
import { BarDatum, ResponsiveBar } from '@nivo/bar';
import { numberCompareProperty } from '../lib/order';

const OwnerStatsQuery = gql`
  query OwnerStatsQuery($project: ID!, $filter: StatsFilter) {
    stats(project: $project) { owners(filter: $filter) { key count accountName accountDisplay } }
  }
`;

interface Props {
  open?: boolean;
}

export function OwnerBarChart(_props: Props) {
  const env = React.useContext(ProjectEnv);
  const { project } = env;
  const { loading, error, data } = useQuery(OwnerStatsQuery, {
    variables: {
      project: project.id,
      filter: {
        state: Array.from(env.openStates),
      },
    },
  });

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
    sortedBuckets.sort(numberCompareProperty('value')).slice(10);

    return (
      <section style={{ width: '100%', height: `${32 * sortedBuckets.length}px` }}>
        <ResponsiveBar
          layout="horizontal"
          indexBy="label"
          animate={false}
          enableLabel={true}
          enableGridX={true}
          colorBy={(dat: any) => {
            if (dat.data.id === '') {
              return '#aa66cc';
            } else {
              return '#884488';
            }
          }}
          labelTextColor="white"
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
}
