import * as React from 'react';
import { Switch, Route, Redirect, useLocation, useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Page } from '../layout';
import { Header } from '../header/Header';
import { LeftNav } from '../nav/LeftNav';
import { styled } from '../style';
import { ProjectListView } from '../projects/ProjectListView';
import { session, ViewContext, ProjectEnv } from '../models';
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
import { useObserver } from 'mobx-react';

import 'react-datepicker/dist/react-datepicker.css';
import { ErrorBoundary } from './ErrorBoundary';

const MainPageLayout = styled(Page)`
  display: grid;
  grid-template-rows: 2.6rem 1fr;
  grid-template-columns: 14em 1fr;
  grid-template-areas:
    "header header"
    "nav main";
`;

const ContentPaneLayout = styled.section`
  background-color: ${props => props.theme.pageColor};
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
    height: 2em;
  }
`;

export const MainPage = () => {
  const [ viewContext ] = React.useState(() => new ViewContext());
  const location = useLocation();
  const history = useHistory();

  return useObserver(() => {
    if (!session.isLoggedIn) {
      session.resume(location, history);
    }
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
        <ProjectEnv.Provider value={viewContext}>
          <ErrorDialog env={viewContext} />
          <Header />
          <LeftNav context={viewContext} />
        </ProjectEnv.Provider>
        <ContentPaneLayout>
          <Switch>
            <Route path="/settings" component={SettingsView} />
            <Route path="/projects" component={ProjectListView} />
            <Route
              path="/:owner/:name"
              render={
                p => <ViewContextProvider {...p} env={viewContext}>
                  {() => (
                    <ErrorBoundary>
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
                          exact
                          render={() => (<LabelListView context={viewContext} />)}
                        />
                        <Route
                          path="/:owner/:name/filters"
                          exact
                          render={props => (<FilterListView {...props} env={viewContext} />)}
                        />
                        <Route
                          path="/:owner/:name/timeline"
                          exact
                          render={props => (<ProjectTimeline {...props} env={viewContext} />)}
                        />
                        <Route
                          path="/:owner/:name/progress"
                          exact
                          component={ProgressView} />
                        {/* <Route
                          path="/:owner/:name/dependencies"
                          exact={true}
                          render={props => (<DependenciesView {...props} {...models}/>)}
                        /> */}
                        <Route
                          path="/:owner/:name/settings/:tab?"
                          exact
                          component={ProjectSettings}
                        />
                        <Route component={Dashboard} />
                      </Switch>
                    </ErrorBoundary>
                  )}
                </ViewContextProvider>}
            />
            <Redirect path="/" exact={true} to="/projects" />
          </Switch>
        </ContentPaneLayout>
        {/* {showEmailVerification && <EmailVerificationDialog />} */}
        {!showEmailVerification && showSetupAccount && <SetupAccountDialog />}
      </MainPageLayout>
    )
  });
};
