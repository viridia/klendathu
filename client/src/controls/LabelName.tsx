import * as React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Query as Q } from '../../../common/types/graphql';
import { Chip, SizeVariant } from 'skyhook-ui';

const LabelQuery = gql`
  query LabelQuery($id: ID!) {
    label(id: $id) { id name color }
  }
`;

type Data = Pick<Q, 'label'>;

interface Props {
  id: string;
  className?: string;
  textOnly?: boolean;
  size?: SizeVariant;
  onClose?: () => void;
}

export function LabelName({ id, textOnly, className, size, onClose }: Props) {
  const { loading, error, data } = useQuery<Data>(LabelQuery, {
    variables: { id },
  });

  if (loading || error) {
    return null;
  } else {
    const { label } = data;
    if (label && label.name) {
      if (textOnly) {
        return <span className={className}>{label.name}</span>;
      }
      return <Chip color={label.color} size={size} onClose={onClose}>{label.name}</Chip>;
    } else {
      if (textOnly) {
        return <span className={className}>unknown-label</span>;
      }
      return <Chip size={size} onClose={onClose}>unknown-label</Chip>;
    }
  }
}
