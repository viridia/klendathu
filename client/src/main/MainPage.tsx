import * as React from 'react';
import { observer } from 'mobx-react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { Page } from '../layout';
import { Header } from '../header/Header';
import { LeftNav } from '../nav/LeftNav';
import { styled } from '../style';
import { ProjectListView } from '../projects/ProjectListView';
import { session, ViewContext } from '../models';
import { SetupAccountDialog } from '../settings/SetupAccountDialog';
import { SettingsView } from '../settings/SettingsView';
import { ProjectSettings } from '../projects/settings/ProjectSettings';
import { IssueListView } from '../issues/IssueListView';
import { IssueCreateView } from '../issues/IssueCreateView';
import { LabelListView } from '../labels/LabelListView';
import { ViewContextProvider } from './ViewContextProvider';
import { IssueEditView } from '../issues/IssueEditView';
import { IssueDetailsView } from '../issues/IssueDetailsView';
import { ErrorDialog } from '../graphql/ErrorDisplay';
import { ProjectTimeline } from '../timeline/ProjectTimeline';
import { ProgressView } from '../progress/ProgressView';
import { FilterListView } from '../filters/FilterListView';
import { Dashboard } from '../dashboard/Dashboard';

import 'react-datepicker/dist/react-datepicker.css'; // tslint:disable-line

const MainPageLayout = styled(Page)`
  display: grid;
  grid-template-rows: 2.6rem 1fr;
  grid-template-columns: 14em 1fr;
  grid-template-areas:
    "header header"
    "nav main";
`;

const ContentPaneLayout = styled.section`
  background-color: ${props => props.theme.pageBgColor};
  display: flex;
  flex-direction: column;
  grid-area: main;
  padding: 0.6rem;
  overflow-x: hidden;

  > header {
    align-items: center;
    display: flex;
    font-weight: bold;
    font-size: 1.2rem;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
`;

@observer
export class MainPage extends React.Component<RouteComponentProps<{}>> {
  private viewContext = new ViewContext();

  public componentWillMount() {
    if (!session.isLoggedIn) {
      session.resume(this.props.location, this.props.history);
    }
  }

  public componentWillUpdate() {
    if (!session.isLoggedIn) {
      session.resume(this.props.location, this.props.history);
    }
  }

  public render() {
    const showEmailVerification = false;
    const showSetupAccount =
        session.isLoggedIn && session.account &&
        !(session.account.accountName && session.account.display);
    return (
      <MainPageLayout>
        <ToastContainer
          position="bottom-left"
          autoClose={10000}
          hideProgressBar={true}
          newestOnTop={false}
        />
        <ErrorDialog env={this.viewContext} />
        <Header context={this.viewContext} />
        <LeftNav context={this.viewContext} />
        <ContentPaneLayout>
          <Switch>
            <Route path="/settings" component={SettingsView} />
            <Route path="/projects" component={ProjectListView} />
            <Route
              path="/:owner/:name"
              render={
                p => <ViewContextProvider {...p} env={this.viewContext}>
                  {() => (
                    <Switch>
                      <Route path="/:owner/:name/new" component={IssueCreateView} />
                      <Route
                        path="/:owner/:name/clone/:id"
                        render={props =>
                          <IssueEditView {...props} clone={true} />}
                      />
                      <Route path="/:owner/:name/edit/:id" component={IssueEditView} />
                      <Route path="/:owner/:name/:id(\d+)" component={IssueDetailsView} />
                      <Route path="/:owner/:name/issues" exact={true} component={IssueListView} />
                      <Route
                        path="/:owner/:name/labels"
                        exact={true}
                        render={() => (<LabelListView context={this.viewContext} />)}
                      />
                      <Route
                        path="/:owner/:name/filters"
                        exact={true}
                        render={props => (<FilterListView {...props} env={this.viewContext} />)}
                      />
                      <Route
                        path="/:owner/:name/timeline"
                        exact={true}
                        render={props => (<ProjectTimeline {...props} env={this.viewContext} />)}
                      />
                      <Route path="/:owner/:name/progress" exact={true} component={ProgressView} />
                      {/* <Route
                        path="/:owner/:name/dependencies"
                        exact={true}
                        render={props => (<DependenciesView {...props} {...models}/>)}
                      /> */}
                      <Route
                          path="/:owner/:name/settings/:tab?"
                          exact={true}
                          component={ProjectSettings}
                      />
                      <Route component={Dashboard} />
                    </Switch>
                  )}
                </ViewContextProvider>}
            />
            <Redirect path="/" exact={true} to="/projects" />
          </Switch>
        </ContentPaneLayout>
        {/* {showEmailVerification && <EmailVerificationDialog />} */}
        {!showEmailVerification && showSetupAccount && <SetupAccountDialog />}
      </MainPageLayout>
    );
  }
}
