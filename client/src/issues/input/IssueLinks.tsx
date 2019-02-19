import * as React from 'react';
import { IssueCondensedDisplay } from '../IssueCondensedDisplay';
import { Observer } from 'mobx-react-lite';
import { RelationName, Button } from '../../controls';
import { Relation } from '../../../../common/types/graphql';

import CloseIcon from '../../svg-compiled/icons/IcClose';
import styled from 'styled-components';

const IssueLinksEl = styled.ul`
  margin: 0 0 0 14px;
  padding: 4px 8px 12px 8px;
`;

const IssueLink = styled.div`
  display: flex;

  > .relation {
    font-weight: bold;
    color: ${props => props.theme.textAccented};
    margin-right: 5px;
  }
`;

const DismissButton = styled(Button)`
  align-items: center;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  justify-content: center;
  margin-left: .5rem;
  padding: 0;

  > svg {
    width: 20px;
    height: 20px;
  }
`;

interface Props {
  links: Map<string, Relation>;
  onRemoveLink?: (to: string) => void;
}

export function IssueLinks({ links, onRemoveLink }: Props) {
  if (!links || links.size === 0) {
    return null;
  }
  return (
    <Observer>
      {() => (
        <IssueLinksEl className="issue-links">{
          Array.from(links.entries()).map(([to, relation]) => (
            <li className="issue-link" key={to}>
              <IssueLink>
                <RelationName relation={relation} />
                <IssueCondensedDisplay id={to} />
                {onRemoveLink && (
                  <DismissButton
                      size="mini"
                      kind="default"
                      onClick={() => onRemoveLink(to)}
                  >
                    <CloseIcon />
                  </DismissButton>)}
              </IssueLink>
            </li>
          )
        )}</IssueLinksEl>

      )}
    </Observer>
  );
}
