import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Label } from '../../../common/types/graphql';
import { Chip } from './Chip';

const LabelQuery = gql`
  query LabelQuery($id: ID!) {
    label(id: $id) { id name color }
  }
`;

interface Props {
  id: string;
  className?: string;
  textOnly?: boolean;
  small?: boolean;
  onClose?: () => void;
}

export function LabelName({ id, textOnly, className, small, onClose }: Props) {
  return (
    <Query query={LabelQuery} variables={{ id }} >
      {({ loading, error, data }) => {
        if (loading || error) {
          return null;
        } else {
          const label: Label = data.label;
          if (label && label.name) {
            if (textOnly) {
              return <span className={className}>{label.name}</span>;
            }
            return <Chip color={label.color} small={small} onClose={onClose}>{label.name}</Chip>;
          } else {
            if (textOnly) {
              return <span className={className}>unknown-label</span>;
            }
            return <Chip small={small} onClose={onClose}>unknown-label</Chip>;
          }
        }
      }}
    </Query>
  );
}
