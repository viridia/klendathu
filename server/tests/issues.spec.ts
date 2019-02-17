import '../src/env';
import { createTestClient } from 'apollo-server-testing';
import { gql } from 'apollo-server-core';
import {
  constructTestServer,
  TestServer,
  createTestProject,
  createTestUserAccount,
  restoreLogLevel,
  disableErrorLog,
} from './fixtures';
import { Errors } from '../../common/types/json';
import { AccountRecord } from '../src/db/types';

const IssueQuery = gql`query IssueQuery($id: ID!) {
  issue(id: $id) {
    id summary description state type reporter reporterSort owner ownerSort
    labels
    custom { key value }
  }
}`;

const IssuesQuery = gql`query IssuesQuery($query: IssueQueryParams!) {
  issues(query: $query) {
    issues {
      id summary description state type reporter reporterSort owner ownerSort
      labels
      custom { key value }
    }
  }
}`;

// const IssueChangeQuery = gql`query IssueChangeQuery($id: ID!) {
//   issue(id: $id) {
//     id summary description state type reporter reporterSort owner ownerSort
//     labels
//     custom { key value }
//   }
// }`;

const NewIssueMutation = gql`mutation NewIssueMutation($project: ID!, $input: IssueInput!) {
  newIssue(project: $project, input: $input) {
    id summary description state type reporter reporterSort owner ownerSort custom { key value }
  }
}`;

const UpdateIssueMutation = gql`mutation UpdateIssueMutation($id: ID!, $input: IssueInput!) {
  updateIssue(id: $id, input: $input) {
    id summary description state type reporter reporterSort owner ownerSort custom { key value }
  }
}`;

describe('issues', () => {
  let server: TestServer;
  let project: string;

  beforeAll(async () => {
    server = await constructTestServer();
    project = await createTestProject(server);
  });

  afterAll(async () => {
    await server.db.collection('projects').deleteMany({});
    await server.close();
  });

  test('empty issue list', async () => {
    const { query } = createTestClient(server.apollo);
    const qResult = await query({
      query: IssuesQuery,
      variables: {
        query: {
          project,
        }
      }
    });
    expect(qResult.errors).toBeUndefined();
    expect(qResult.data).toHaveProperty('issues');
    expect(qResult.data.issues.issues).toBeArrayOfSize(0);
  });

  describe('create issue', () => {
    afterEach(async () => {
      await server.db.collection('issues').deleteMany({});
    });

    test('basic', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'An issue',
            description: 'Something to do',
            isPublic: false,
          }
        },
      });
      expect(res.errors).toBeUndefined();
      expect(res.data).toHaveProperty('newIssue');
      expect(res.data.newIssue).toBeObject();
      expect(res.data.newIssue).toHaveProperty('summary', 'An issue');
      expect(res.data.newIssue).toHaveProperty('description', 'Something to do');

      const qResult = await query({
        query: IssuesQuery,
        variables: {
          query: {
            project,
          }
        }
      });
      expect(qResult.errors).toBeUndefined();
      expect(qResult.data).toHaveProperty('issues');
      expect(qResult.data.issues.issues).toBeArrayOfSize(1);
      const issue = qResult.data.issues.issues[0];
      expect(issue.id).toBeString();
      expect(issue.type).toEqual('bug');
      expect(issue.state).toEqual('new');
      expect(issue.summary).toEqual('An issue');
      expect(issue.description).toEqual('Something to do');
      expect(issue.reporter).toEqual(server.context.user._id.toHexString());
      expect(issue.reporterSort).toEqual(server.context.user.accountName);
      expect(issue.owner).toBeNull();
      expect(issue.ownerSort).toEqual('');
      expect(issue.custom).toBeArrayOfSize(0);
    });

    test('custom field', async () => {
      const { mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'An issue',
            description: 'Something to do',
            isPublic: false,
            custom: [
              { key: 'int', value: 1 },
              { key: 'str', value: 'x' },
              { key: 'bool', value: true },
            ]
          }
        },
      });
      expect(res.errors).toBeUndefined();
      expect(res.data).toHaveProperty('newIssue');
      expect(res.data.newIssue).toBeObject();
      expect(res.data.newIssue).toHaveProperty('custom');
      expect(res.data.newIssue.custom).toBeArrayOfSize(3);
      expect(res.data.newIssue.custom).toEqual([
        { key: 'int', value: 1 },
        { key: 'str', value: 'x' },
        { key: 'bool', value: true },
      ]);
    });
  });

  describe('create issue (error)', () => {
    let savedUser: AccountRecord;

    beforeAll(disableErrorLog);
    afterAll(restoreLogLevel);

    beforeEach(() => {
      savedUser = server.context.user;
    });

    afterEach(() => {
      server.context.user = savedUser;
    });

    test('anonymous user', async () => {
      const { mutate } = createTestClient(server.apollo);
      server.context.user = null;
      const res = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'An issue',
            description: 'Something to do',
            isPublic: false,
          }
        },
      });
      expect(res.errors).toBeArrayOfSize(1);
      expect(res.errors[0].message).toEqual(Errors.UNAUTHORIZED);
    });

    test('non-member of project', async () => {
      const { mutate } = createTestClient(server.apollo);
      server.context.user = await createTestUserAccount(server.db, 'smith', '"Kitten" Smith');
      const res = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'An issue',
            description: 'Something to do',
            isPublic: false,
          }
        },
      });
      expect(res.errors).toBeArrayOfSize(1);
      expect(res.errors[0].message).toEqual(Errors.FORBIDDEN);
    });

    // TODO: Insufficient role
  });

  describe('update issue', () => {
    let issueId: string;

    beforeEach(async () => {
      const { mutate } = createTestClient(server.apollo);
      const result = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'first',
            description: 'first issue',
            isPublic: false,
          }
        },
      });
      issueId = result.data.newIssue.id;
    });

    afterEach(async () => {
      await server.db.collection('issues').deleteMany({});
    });

    test('update return', async () => {
      const { mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            type: 'feature',
            state: 'new',
            summary: 'first',
            description: 'first issue',
          }
        },
      });

      expect(res.errors).toBeUndefined();
      expect(res.data.updateIssue).toBeObject();
      expect(res.data.updateIssue).toEqual(
        expect.objectContaining({
          type: 'feature',
          state: 'new',
          summary: 'first',
          description: 'first issue',
          reporter: server.context.user._id.toHexString(),
          reporterSort: server.context.user.accountName,
          owner: null,
          ownerSort: '',
          custom: expect.toBeEmptyArray(),
        }),
      );
    });

    test('type', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            type: 'feature',
            state: 'new',
            summary: 'first',
            description: 'first issue',
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toEqual(
        expect.objectContaining({
          type: 'feature',
          state: 'new',
          summary: 'first',
          description: 'first issue',
          reporter: server.context.user._id.toHexString(),
          reporterSort: server.context.user.accountName,
          owner: null,
          ownerSort: '',
          custom: expect.toBeEmptyArray(),
        }),
      );
    });

    test('state', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            type: 'bug',
            state: 'assigned',
            summary: 'first',
            description: 'first issue',
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toEqual(
        expect.objectContaining({
          type: 'bug',
          state: 'assigned',
          summary: 'first',
          description: 'first issue',
          reporter: server.context.user._id.toHexString(),
          reporterSort: server.context.user.accountName,
          owner: null,
          ownerSort: '',
          custom: expect.toBeEmptyArray(),
        }),
      );
    });

    test('summary', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'Updated summary',
            description: 'first issue',
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toEqual(
        expect.objectContaining({
          type: 'bug',
          state: 'new',
          summary: 'Updated summary',
          description: 'first issue',
          reporter: server.context.user._id.toHexString(),
          reporterSort: server.context.user.accountName,
          owner: null,
          ownerSort: '',
          custom: expect.toBeEmptyArray(),
        }),
      );
    });

    test('description', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'first',
            description: 'updated description',
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toEqual(
        expect.objectContaining({
          type: 'bug',
          state: 'new',
          summary: 'first',
          description: 'updated description',
          reporter: server.context.user._id.toHexString(),
          reporterSort: server.context.user.accountName,
          owner: null,
          ownerSort: '',
          custom: expect.toBeEmptyArray(),
        }),
      );
    });
  });

  describe('issue query', () => {
    beforeAll(async () => {
      const { mutate } = createTestClient(server.apollo);
      await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'first',
            description: 'first issue',
            isPublic: false,
          }
        },
      });
      await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: {
            type: 'task',
            state: 'accepted',
            summary: 'second',
            description: 'issue the second',
            isPublic: false,
            labels: [`${project}.1`, `${project}.2`],
          }
        },
      });
      await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: {
            type: 'doc',
            state: 'assigned',
            summary: 'third',
            description: 'a third issue',
            isPublic: true,
          }
        },
      });
    });

    afterAll(async () => {
      await server.db.collection('issues').deleteMany({});
    });

    test('all', async () => {
      const { query } = createTestClient(server.apollo);
      const qResult = await query({
        query: IssuesQuery,
        variables: {
          query: {
            project,
          }
        }
      });
      expect(qResult.errors).toBeUndefined();
      expect(qResult.data.issues.issues).toBeArrayOfSize(3);
    });

    test('by label', async () => {
      const { query } = createTestClient(server.apollo);
      const qResult = await query({
        query: IssuesQuery,
        variables: {
          query: {
            project,
            labels: [`${project}.1`]
          }
        }
      });
      expect(qResult.errors).toBeUndefined();
      expect(qResult.data.issues.issues).toBeArrayOfSize(1);
    });
  });
});
