import * as React from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import { Tab, TabBar } from '../../controls';
import { Role } from '../../../../common/types/json';
import { ProjectInfoEdit } from './ProjectInfoEdit';
import { ViewContext } from '../../models';
import { ColumnSettings } from './columns/ColumnSettings';
import { ProjectMembers } from './members/ProjectMembers';
// import { ProjectMilestonesEdit } from './milestones/ProjectMilestonesEdit';
// import { ProjectTemplateEdit } from './ProjectTemplateEdit';
// import { WorkflowEdit } from './workflow/WorkflowEdit';

interface Props extends RouteComponentProps<{ tab?: string }> {
  context: ViewContext;
  // milestones: MilestoneListQuery;
}

// TODO: finish
export class ProjectSettings extends React.Component<Props> {
  public render() {
    const { project } = this.props.context;
    if (!project) {
      return <section />;
    }
    const locationPrefix = `/${project.ownerName}/${project.name}/settings`;
    return (
      <React.Fragment>
        <header>Project settings for: {project.title}</header>
        <TabBar>
          <Tab to={`${locationPrefix}/info`}>Project Info</Tab>
          <Tab to={`${locationPrefix}/columns`}>Columns</Tab>
          <Tab to={`${locationPrefix}/members`}>Members</Tab>
          {project.role >= Role.DEVELOPER &&
              <Tab to={`${locationPrefix}/milestones`}>Milestones</Tab>}
          {project.role >= Role.MANAGER &&
              <Tab to={`${locationPrefix}/templates`}>Templates</Tab>}
          {project.role >= Role.MANAGER &&
              <Tab to={`${locationPrefix}/workflow`}>Workflow</Tab>}
        </TabBar>
        <Switch>
          <Route
            path={`${locationPrefix}/info`}
            render={() => <ProjectInfoEdit {...this.props} />}
          />
          <Route
            path={`${locationPrefix}/columns`}
            render={() => <ColumnSettings env={this.props.context} />}
          />
          <Route path={`${locationPrefix}/members`} component={ProjectMembers} />
          <Route path={`${locationPrefix}/milestones`} />
          <Route path={`${locationPrefix}/templates`} />
          <Route path={`${locationPrefix}/workflow`} />
          <Redirect path={`${locationPrefix}/`} to={`${locationPrefix}/info`} />
        </Switch>
      </React.Fragment>
    );
  }

// {project.role >= Role.DEVELOPER && (<Tab eventKey="milestones" title="Milestones">
//   <ProjectMilestonesEdit {...this.props} />
// </Tab>)}
// {project.role >= Role.MANAGER && (<Tab eventKey="templates" title="Issue Templates">
//   {/*<ProjectTemplateEdit {...this.props} />*/}
// </Tab>)}
// {project.role >= Role.MANAGER && (<Tab eventKey="workflow" title="Workflow">
//   <WorkflowEdit {...this.props} />
// </Tab>)}
}
