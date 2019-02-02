import * as React from 'react';
import { observer } from 'mobx-react';
import { RouteComponentProps, Switch, Route } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { Page } from '../layout';
import { Header } from '../header/Header';
import { LeftNav } from '../nav/LeftNav';
import { styled } from '../style';
import { ProjectListView } from '../projects/ProjectListView';
import { session } from '../models';
import { SetupAccountDialog } from '../settings/SetupAccountDialog';
import { SettingsView } from '../settings/SettingsView';

const MainPageLayout = styled(Page)`
  display: grid;
  grid-template-rows: 2.6rem 1fr;
  grid-template-columns: 12em 1fr;
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

  > header {
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

@observer
export class MainPage extends React.Component<RouteComponentProps<{}>> {
  // private memberships: Memberships;

  public componentWillMount() {
    // this.memberships = new Memberships();
    if (!session.isLoggedIn) {
      session.resume(this.props.location, this.props.history);
    }
  }

  public componentWillUpdate() {
    // this.memberships.release();
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
            position="bottom-right"
            autoClose={10000}
            hideProgressBar={true}
            newestOnTop={false}
        />
        <Header />
        <LeftNav />
        <ContentPaneLayout>
          <Switch>
            <Route path="/settings" component={SettingsView} />
            <Route
                path="/projects"
                component={ProjectListView}
            />
          </Switch>
        </ContentPaneLayout>
        {/* {showEmailVerification && <EmailVerificationDialog />} */}
        {!showEmailVerification && showSetupAccount && <SetupAccountDialog />}
      </MainPageLayout>
    );
  }
}
