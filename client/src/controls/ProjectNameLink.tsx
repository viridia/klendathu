import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Query as Q } from '../../../common/types/graphql';
import { Project } from '../../../common/types/graphql';
import { NavLink } from './NavLink';
import gql from 'graphql-tag';

const projectQuery = gql`
  query ProjectQuery($id: ID) {
    project(id: $id) { id, name, title, ownerName }
  }
`;

interface Props {
  id?: string;
}

/** Given a project id, renders a link that includes the account name and project name. */
export function ProjectNameLink({ id }: Props) {
  const { loading, error, data } = useQuery<Pick<Q, 'project'>>(projectQuery, {
    variables: { id },
  });

  if (loading) {
    return <div className="project-name loading" />;
  } else if (error) {
    return <div className="project-name error">[Project Load Error]</div>;
  } else {
    const project: Project = data.project;
    return (
      <NavLink
        className="project-link"
        to={`${project.ownerName}/${project.name}`}
      >
        {project.title}
      </NavLink>
    );
  }
}
