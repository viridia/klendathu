import * as React from 'react';
import { Project } from '../../../common/types/graphql';
import { QueryLink } from '../controls';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { fragments } from '../graphql';
import { Query } from 'react-apollo';

const projectsQuery = gql`
  query ProjectsQuery {
    projects { ...ProjectFields }
  }
  ${fragments.project}
`;

const ProjectList = styled.ul`
  margin: 0;
  padding-left: 30px;
  > li {
    margin: 4px 0;
    > a {
      text-decoration: none;
      color: ${props => props.theme.leftNavTextColor};
      &:hover {
        text-decoration: underline;
      }
      &.active {
        font-weight: bold;
        text-decoration: none;
      }
    }
  }
`;

export function ProjectLinks() {
  return (
    <Query query={projectsQuery} fetchPolicy="cache-and-network">
      {({ error, data }) => {
        if (error) {
          return null;
        } else if (data && data.projects) {
          return (
            <ProjectList>
              {data.projects.map((project: Project) => (
                <li key={project.id}>
                  <QueryLink
                      to={`/${project.ownerName}/${project.name}`}
                      strict={true}
                  >
                    {project.ownerName}/{project.name}
                  </QueryLink>
                </li>
              ))}
            </ProjectList>
          );
        } else {
          return null;
        }
      }}
    </Query>
  );
}
