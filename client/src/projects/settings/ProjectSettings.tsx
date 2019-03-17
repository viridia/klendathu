import * as React from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import { Tab, TabBar } from '../../controls';
import { Role } from '../../../../common/types/json';
import { ProjectInfoEdit } from './ProjectInfoEdit';
import { ProjectEnv } from '../../models';
import { ColumnSettings } from './columns/ColumnSettings';
import { ProjectMembers } from './members/ProjectMembers';
import { WebhookSettings } from './webhooks/WebhookSettings';
import { MilestoneListView } from './milestones/MilestoneListView';
// import { ProjectTemplateEdit } from './ProjectTemplateEdit';
// import { WorkflowEdit } from './workflow/WorkflowEdit';

// TODO: finish
export function ProjectSettings(props: RouteComponentProps<{ tab?: string }>) {
  const env = React.useContext(ProjectEnv);
  const { project } = env;
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
        {project.role >= Role.MANAGER &&
            <Tab to={`${locationPrefix}/webhooks`}>Webhooks</Tab>}
      </TabBar>
      <Switch>
        <Route
          path={`${locationPrefix}/info`}
          render={() => <ProjectInfoEdit {...props} env={env} />}
        />
        <Route
          path={`${locationPrefix}/columns`}
          render={() => <ColumnSettings env={env} />}
        />
        <Route path={`${locationPrefix}/members`} component={ProjectMembers} />
        <Route
            path={`${locationPrefix}/milestones`}
            render={() => <MilestoneListView env={env} />}
        />
        <Route path={`${locationPrefix}/templates`} />
        <Route path={`${locationPrefix}/workflow`} />
        <Route
          path={`${locationPrefix}/webhooks`}
          render={() => <WebhookSettings env={env} />}
        />
        <Redirect path={`${locationPrefix}/`} to={`${locationPrefix}/info`} />
      </Switch>
    </React.Fragment>
  );
}

// {project.role >= Role.MANAGER && (<Tab eventKey="templates" title="Issue Templates">
//   {/*<ProjectTemplateEdit {...this.props} />*/}
// </Tab>)}
// {project.role >= Role.MANAGER && (<Tab eventKey="workflow" title="Workflow">
//   <WorkflowEdit {...this.props} />
// </Tab>)}
