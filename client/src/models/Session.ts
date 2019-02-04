import { Account } from '../../../common/types/graphql';
import { History, Location } from 'history';
import { observable } from 'mobx';
import { handleAxiosError } from '../network/requests';
import { client } from '../graphql/client';
import axios from 'axios';
import gql from 'graphql-tag';
import * as qs from 'qs';

const meQuery = gql`
  query MeQuery {
    me { id accountName display photo }
  }
`;

export class Session {
  @observable.ref public account: Account = null;
  public request = axios.create();
  public token: string;

  constructor() {
    this.request.interceptors.request.use(config => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
        return config;
      }
      return config;
    });
  }

  get headers(): { [name: string]: string } {
    if (this.token) {
      return {
        Authorization: `Bearer ${this.token}`,
      };
    }
    return {};
  }

  get isLoggedIn() {
    return !!this.account;
  }

  get accountName(): string {
    return this.account ? this.account.accountName : null;
  }

  public resume(location: Location, history: History) {
    this.account = null;
    this.token = localStorage.getItem('token');
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    if (!this.token) {
      if (query.token) {
        this.token = query.token;
        delete query.token;
      } else {
        return;
      }
    }

    if (!this.account) {
      client.query<{ me: Account }>({ query: meQuery }).then(({ data, errors, loading }) => {
        if (data.me) {
          this.account = data.me;
          localStorage.setItem('token', this.token);
        }
      }, error => {
        console.error(error);
      });
    }
  }

  public login(email: string, password: string): Promise<Account> {
    return this.request.post('/auth/login', { email, password }).then(loginResp => {
      this.token = loginResp.data.token;
      localStorage.setItem('token', this.token);
    }, handleAxiosError).then(() => {
      client.query<{ me: Account }>({ query: meQuery }).then(({ data, errors, loading }) => {
        if (data.me) {
          this.account = data.me;
        }
      }, error => {
        console.error(error);
      });
    }).then(() => {
      return this.account;
    });
  }

  /** Reload the user's account info. Used when changing display name or other user props. */
  public reload() {
    client.query<{ me: Account }>({ query: meQuery }).then(({ data, errors, loading }) => {
      if (data.me) {
        this.account = data.me;
      }
    }, error => {
      console.error(error);
    });
  }

  public logout() {
    this.token = null;
    this.account = null;
    localStorage.removeItem('token');
  }
}

export const session = new Session();
export const request = session.request;
