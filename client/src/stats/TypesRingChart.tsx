import * as React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';
import { PieDatum, ResponsivePie } from '@nivo/pie';
import { Bucket } from '../../../common/types/graphql';
import { ProjectEnv } from '../models';
import { parseToHsl, hsl } from 'polished';

const TypeStatsQuery = gql`
  query TypeStatsQuery($project: ID!, $filter: StatsFilter) {
    stats(project: $project) { types(filter: $filter) { key count } }
  }
`;

export function TypesRingChart(_props: {}) {
  const env = React.useContext(ProjectEnv);
  const { project, template } = env;
  const { loading, error, data } = useQuery(TypeStatsQuery, {
    variables: {
      project: project.id,
    },
  });

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
      <section style={{ width: '100%', height: '320px', position: 'relative' }}>
        <ResponsivePie
          innerRadius={0.5}
          colors={(bk: any) => bk.color}
          padAngle={1}
          cornerRadius={3}
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
      </section>
    );
  } else {
    return <div className="chart no-data" />;
  }
}
