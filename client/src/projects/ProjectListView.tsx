import * as React from 'react';
import { CreateProjectDialog } from './CreateProjectDialog';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import {
  Button,
  Card,
  RelativeDate,
  AccountNameLink,
  Avatar,
  RoleName,
  NavLink,
} from '../controls';
import { Query } from 'react-apollo';
import { ErrorDisplay } from '../graphql/ErrorDisplay';
import { Project } from '../../../common/types/graphql';
import { EmptyList } from '../layout';
import { session } from '../models';
import styled from 'styled-components';
import gql from 'graphql-tag';
import AddBoxIcon from '../svg-compiled/icons/IcAddBox';

const projectsQuery = gql`
  query ProjectsQuery {
    projects {
      id, owner, ownerName, name, title, description, createdAt, updatedAt, role, isPublic
    }
  }
`;

const projectsSubscription = gql`
  subscription ProjectsSubscription($owners: [ID!]!) {
    projectsChanged(owners: $owners) {
      action
      project {
        id, owner, ownerName, name, title, description, createdAt, updatedAt, role, isPublic
      }
    }
  }
`;

const ProjectListEl = styled.section`
  flex: 1 1 0;
  overflow-y: auto;
`;

const ProjectCard = styled(Card)`
  display: grid;
  grid-template-rows: auto 1fr 1fr;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  grid-template-areas:
    "title owner role visibility"
    "description owner role created"
    "description owner role updated";
  padding: .5rem 1rem;
  align-items: start;
  justify-content: start;

  > .id {
    display: none;
  }

  > .title {
    grid-area: title;
    font-weight: bold;
  }

  > .description {
    grid-area: description;
  }

  > .owner {
    align-self: center;
    justify-self: center;
    grid-area: owner;
    > .avatar {
      margin-right: .4rem;
      margin-left: .4rem;
    }
  }

  > .role {
    align-self: center;
    justify-self: center;
    grid-area: role;
  }

  > .visibility {
    grid-area: visibility;
  }

  > .created {
    grid-area: created;
  }

  > .updated {
    grid-area: updated;
  }
`;

const ProjectTitle = styled.span`
  font-weight: bold;
  margin-right: .5rem;
`;

@observer
export class ProjectListView extends React.Component<{}> {
  @observable private openCreate = false;

  public render() {
    return (
      <>
        <header>
          Project List
          {session.isLoggedIn && session.accountName &&
            <Button kind="primary" onClick={this.onClickAddProject}>
              <AddBoxIcon />
              <span>New Project&hellip;</span>
            </Button>
          }
        </header>
        <Query query={projectsQuery} fetchPolicy="cache-and-network">
          {({ loading, error, data, refetch, subscribeToMore }) => {
            if (loading && !(data && data.projects)) {
              // Only display loading indicator if nothing in cache.
              return <div>loading&hellip;</div>;
            } else if (error) {
              return <ErrorDisplay error={error} />;
            } else {
              subscribeToMore({
                document: projectsSubscription,
                variables: {
                  owners: [session.account.id],
                },
                updateQuery: (prev, { subscriptionData }) => {
                  // For the moment we're just going to refresh.
                  // console.log('subscriptionData', subscriptionData);
                  refetch();
                },
              });
              const projects: Project[] = data.projects;
              if (projects.length === 0) {
                return <EmptyList>No projects found.</EmptyList>;
              }
              return (
                <ProjectListEl>
                  {projects.map(prj => (
                    <ProjectCard key={prj.id}>
                      <div className="id">{prj.id}</div>
                      <div className="owner">
                        <b>Owned By:</b> <Avatar id={prj.owner} />
                        <AccountNameLink id={prj.owner} />
                      </div>
                      <div className="title">
                        <ProjectTitle>{prj.title}</ProjectTitle>[
                        <NavLink
                            className="project-link"
                            to={`/${prj.ownerName}/${prj.name}`}
                        >
                          {prj.ownerName}/{prj.name}
                        </NavLink>]
                      </div>
                      <div className="description">{prj.description}</div>
                      <div className="created">
                        <b>Created:</b> <RelativeDate date={prj.createdAt} />
                      </div>
                      <div className="updated">
                        <b>Updated:</b> <RelativeDate date={prj.updatedAt} />
                      </div>
                      <div className="role">
                        <b>Role:</b> <RoleName role={prj.role} />
                      </div>
                      <div className="visibility">
                        <b>Visibility:</b> {prj.isPublic ? 'PUBLIC' : 'PRIVATE'}
                      </div>
                    </ProjectCard>
                  ))}
                </ProjectListEl>
              );
            }
          }}
        </Query>
        <CreateProjectDialog show={this.openCreate} onHide={this.onCloseCreate} />
      </>
    );
  }

  @action.bound
  private onClickAddProject(e: any) {
    this.openCreate = true;
  }

  @action.bound
  private onCloseCreate() {
    this.openCreate = false;
  }
}
