import '../src/env';
import { createTestClient } from 'apollo-server-testing';
import { gql } from 'apollo-server-core';
import {
  constructTestServer,
  TestServer,
  createTestProject,
  restoreLogLevel,
  disableErrorLog,
} from './fixtures';
import { Errors } from '../../common/types/json';
import { AccountRecord } from '../src/db/types';
import { ObjectID } from 'mongodb';
import { Relation } from '../../common/types/graphql';

const IssueQuery = gql`query IssueQuery($id: ID!) {
  issue(id: $id) {
    id summary description state type reporter reporterSort owner ownerSort
    labels cc
    custom { key value }
    links { to relation }
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

const IssueChangeQuery = gql`query IssueChangeQuery($project: ID!, $issue: ID!) {
  issueChanges(project: $project, issue: $issue) {
    results {
      id issue project by at
      type { before after }
      state { before after }
      summary { before after }
      description { before after }
      owner { before after }
      cc { added removed }
      labels { added removed }
      custom { key before after }
      linked { to before after }
    }
  }
}`;

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
      server.context.user = server.users.kitten;
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
    const testData = {
      type: 'bug',
      state: 'new',
      summary: 'first',
      description: 'first issue',
    };
    let expectedResponse: any;
    let issueId: string;

    beforeEach(async () => {
      const { mutate } = createTestClient(server.apollo);
      const result = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: {
            ...testData,
            isPublic: false,
          }
        },
      });
      issueId = result.data.newIssue.id;
      expectedResponse = {
        ...testData,
        id: issueId,
        reporter: server.context.user._id.toHexString(),
        reporterSort: server.context.user.accountName,
        owner: null,
        ownerSort: '',
        custom: [],
      };
    });

    afterEach(async () => {
      await server.db.collection('issues').deleteMany({});
      await server.db.collection('issueLinks').deleteMany({});
      await server.db.collection('issueChanges').deleteMany({});
    });

    test('update return', async () => {
      const { mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            type: 'feature',
          }
        },
      });

      expect(res.errors).toBeUndefined();
      expect(res.data.updateIssue).toBeObject();
      expect(res.data.updateIssue).toMatchObject({
        ...expectedResponse,
        type: 'feature',
      });
    });

    test('type', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            type: 'feature',
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...testData,
        type: 'feature',
        reporter: server.context.user._id.toHexString(),
        reporterSort: server.context.user.accountName,
        owner: null,
        ownerSort: '',
        custom: expect.toBeEmptyArray(),
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        issue: issueId,
        project,
        by: server.context.user._id.toHexString(),
        type: { before: 'bug', after: 'feature' },
        state: null,
        summary: null,
        description: null,
        owner: null,
      });
      expect(cres.data.issueChanges.results[0].id).toBeNonEmptyString();
      expect(cres.data.issueChanges.results[0].at).toBeDate();
    });

    test('state', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            state: 'assigned',
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...testData,
        state: 'assigned',
        reporter: server.context.user._id.toHexString(),
        reporterSort: server.context.user.accountName,
        owner: null,
        ownerSort: '',
        custom: expect.toBeEmptyArray(),
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        state: { before: 'new', after: 'assigned' },
      });
    });

    test('summary', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            summary: 'Updated summary',
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...testData,
        summary: 'Updated summary',
        reporter: server.context.user._id.toHexString(),
        reporterSort: server.context.user.accountName,
        owner: null,
        ownerSort: '',
        custom: expect.toBeEmptyArray(),
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        summary: { before: 'first', after: 'Updated summary' },
      });
    });

    test('description', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            description: 'updated description',
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...testData,
        description: 'updated description',
        reporter: server.context.user._id.toHexString(),
        reporterSort: server.context.user.accountName,
        owner: null,
        ownerSort: '',
        custom: expect.toBeEmptyArray(),
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        description: { before: 'first issue', after: 'updated description' },
      });
    });

    test('owner', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            owner: server.users.kitten._id.toHexString(),
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        owner: server.users.kitten._id.toHexString(),
        ownerSort: 'kitten',
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        owner: { before: null, after: server.users.kitten._id.toHexString() },
      });
    });

    test('cc', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            cc: [
              server.users.dflores._id.toHexString(),
              server.users.kitten._id.toHexString(),
            ]
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        cc: [
          server.users.dflores._id.toHexString(),
          server.users.kitten._id.toHexString(),
        ],
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        cc: {
          added: [
            server.users.dflores._id.toHexString(),
            server.users.kitten._id.toHexString(),
          ],
          removed: [],
        },
      });
    });

    test('labels', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const l1 = new ObjectID();
      const l2 = new ObjectID();
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            labels: [ l1.toHexString(), l2.toHexString() ]
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        labels: [ l1.toHexString(), l2.toHexString() ]
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        labels: {
          added: [ l1.toHexString(), l2.toHexString() ],
          removed: [],
        },
      });
    });

    test('custom', async () => {
      const { query, mutate } = createTestClient(server.apollo);
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            custom: [
              { key: 'a', value: 1 },
              { key: 'b', value: 2 },
            ]
          }
        },
      });
      expect(res.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        custom: [
          { key: 'a', value: 1 },
          { key: 'b', value: 2 },
        ]
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        custom: [
          { key: 'a', before: null, after: 1 },
          { key: 'b', before: null, after: 2 },
        ],
      });
    });

    test('link add', async () => {
      const { query, mutate } = createTestClient(server.apollo);

      // Create a second issue
      const ires = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: { type: 'bug', state: 'new', summary: 'second', description: 'second issue' }
        },
      });
      expect(ires.errors).toBeUndefined();
      const otherIssueId = ires.data.newIssue.id;

      // Add an issue link
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: [{ to: otherIssueId, relation: Relation.BlockedBy }],
          }
        },
      });
      expect(res.errors).toBeUndefined();

      // Make sure both issues return the link
      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        links: [{ relation: Relation.BlockedBy, to: otherIssueId }]
      });

      const qres2 = await query({ query: IssueQuery, variables: { id: otherIssueId } });
      expect(qres2.errors).toBeUndefined();
      expect(qres2.data.issue).toMatchObject({
        links: [{ relation: Relation.Blocks, to: issueId }],
      });

      // Make sure both issues have a change entry
      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: Relation.BlockedBy, before: null, to: otherIssueId }],
      });

      const cres2 = await query({
        query: IssueChangeQuery,
        variables: { project, issue: otherIssueId },
      });
      expect(cres2.errors).toBeUndefined();
      expect(cres2.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres2.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: Relation.Blocks, before: null, to: issueId }],
      });
    });

    test('link add (reverse)', async () => {
      const { query, mutate } = createTestClient(server.apollo);

      // Create a second issue
      const ires = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: { type: 'bug', state: 'new', summary: 'second', description: 'second issue' }
        },
      });
      expect(ires.errors).toBeUndefined();
      const otherIssueId = ires.data.newIssue.id;

      // Add an issue link in the opposite direction
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: otherIssueId,
          input: {
            ...testData,
            linked: [{ to: issueId, relation: Relation.Blocks }],
          }
        },
      });
      expect(res.errors).toBeUndefined();

      // Make sure both issues return the link
      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        links: [{ relation: Relation.BlockedBy, to: otherIssueId }],
      });

      const qres2 = await query({ query: IssueQuery, variables: { id: otherIssueId } });
      expect(qres2.errors).toBeUndefined();
      expect(qres2.data.issue).toMatchObject({
        links: [{ relation: Relation.Blocks, to: issueId }],
      });

      // Make sure both issues have a change entry
      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: Relation.BlockedBy, before: null, to: otherIssueId }],
      });

      const cres2 = await query({
        query: IssueChangeQuery,
        variables: { project, issue: otherIssueId },
      });
      expect(cres2.errors).toBeUndefined();
      expect(cres2.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres2.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: Relation.Blocks, before: null, to: issueId }],
      });
    });

    test('link delete', async () => {
      const { query, mutate } = createTestClient(server.apollo);

      // Create a second issue
      const ires = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: { type: 'bug', state: 'new', summary: 'second', description: 'second issue' }
        },
      });
      expect(ires.errors).toBeUndefined();
      const otherIssueId = ires.data.newIssue.id;

      // Add an issue link
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: [{ to: otherIssueId, relation: Relation.BlockedBy }],
          }
        },
      });
      expect(res.errors).toBeUndefined();

      // Clear change list
      await server.db.collection('issueChanges').deleteMany({});

      // Remove the link
      const res2 = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: []
          }
        },
      });
      expect(res2.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        links: []
      });

      const qres2 = await query({ query: IssueQuery, variables: { id: otherIssueId } });
      expect(qres2.errors).toBeUndefined();
      expect(qres2.data.issue).toMatchObject({
        links: []
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: null, before: Relation.BlockedBy, to: otherIssueId }],
      });

      const cres2 = await query({
        query: IssueChangeQuery,
        variables: { project, issue: otherIssueId },
      });
      expect(cres2.errors).toBeUndefined();
      expect(cres2.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres2.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: null, before: Relation.Blocks, to: issueId }],
      });
    });

    test('link delete (reverse)', async () => {
      const { query, mutate } = createTestClient(server.apollo);

      // Create a second issue
      const ires = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: { type: 'bug', state: 'new', summary: 'second', description: 'second issue' }
        },
      });
      expect(ires.errors).toBeUndefined();
      const otherIssueId = ires.data.newIssue.id;

      // Add an issue link
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: [{ to: otherIssueId, relation: Relation.BlockedBy }],
          }
        },
      });
      expect(res.errors).toBeUndefined();

      // Clear change list
      await server.db.collection('issueChanges').deleteMany({});

      // Remove the link fro the other issue
      const res2 = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: otherIssueId,
          input: { ...testData, linked: [] },
        },
      });
      expect(res2.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        links: []
      });

      const qres2 = await query({ query: IssueQuery, variables: { id: otherIssueId } });
      expect(qres2.errors).toBeUndefined();
      expect(qres2.data.issue).toMatchObject({
        links: []
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: null, before: Relation.BlockedBy, to: otherIssueId }],
      });

      const cres2 = await query({
        query: IssueChangeQuery,
        variables: { project, issue: otherIssueId },
      });
      expect(cres2.errors).toBeUndefined();
      expect(cres2.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres2.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: null, before: Relation.Blocks, to: issueId }],
      });
    });

    test('link change (replace relation)', async () => {
      const { query, mutate } = createTestClient(server.apollo);

      // Create a second issue
      const ires = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: { type: 'bug', state: 'new', summary: 'second', description: 'second issue' }
        },
      });
      expect(ires.errors).toBeUndefined();
      const otherIssueId = ires.data.newIssue.id;

      // Add an issue link
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: [{ to: otherIssueId, relation: Relation.BlockedBy }],
          }
        },
      });
      expect(res.errors).toBeUndefined();

      // Clear change list
      await server.db.collection('issueChanges').deleteMany({});

      // Change the link to a new relation type
      const res2 = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: [{ to: otherIssueId, relation: Relation.Duplicate }],
          }
        },
      });
      expect(res2.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        links: [{ relation: Relation.Duplicate, to: otherIssueId }],
      });

      const qres2 = await query({ query: IssueQuery, variables: { id: otherIssueId } });
      expect(qres2.errors).toBeUndefined();
      expect(qres2.data.issue).toMatchObject({
        links: [{ relation: Relation.Duplicate, to: issueId }],
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: Relation.Duplicate, before: Relation.BlockedBy, to: otherIssueId }],
      });

      const cres2 = await query({
        query: IssueChangeQuery,
        variables: { project, issue: otherIssueId },
      });
      expect(cres2.errors).toBeUndefined();
      expect(cres2.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres2.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: Relation.Duplicate, before: Relation.Blocks, to: issueId }],
      });
    });

    test('link change (replace relation, reverse)', async () => {
      const { query, mutate } = createTestClient(server.apollo);

      // Create a second issue
      const ires = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: { type: 'bug', state: 'new', summary: 'second', description: 'second issue' }
        },
      });
      expect(ires.errors).toBeUndefined();
      const otherIssueId = ires.data.newIssue.id;

      // Add an issue link
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: [{ to: otherIssueId, relation: Relation.BlockedBy }],
          }
        },
      });
      expect(res.errors).toBeUndefined();

      // Clear change list
      await server.db.collection('issueChanges').deleteMany({});

      // Change the link to a new relation type (other side)
      const res2 = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: otherIssueId,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'second',
            description: 'second issue',
            linked: [{ to: issueId, relation: Relation.Duplicate }],
          }
        },
      });
      expect(res2.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        links: [{ relation: Relation.Duplicate, to: otherIssueId }],
      });

      const qres2 = await query({ query: IssueQuery, variables: { id: otherIssueId } });
      expect(qres2.errors).toBeUndefined();
      expect(qres2.data.issue).toMatchObject({
        links: [{ relation: Relation.Duplicate, to: issueId }],
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: Relation.Duplicate, before: Relation.BlockedBy, to: otherIssueId }],
      });

      const cres2 = await query({
        query: IssueChangeQuery,
        variables: { project, issue: otherIssueId },
      });
      expect(cres2.errors).toBeUndefined();
      expect(cres2.data.issueChanges.results).toBeArrayOfSize(1);
      expect(cres2.data.issueChanges.results[0]).toMatchObject({
        linked: [{ after: Relation.Duplicate, before: Relation.Blocks, to: issueId }],
      });
    });

    test('link change (no effect)', async () => {
      const { query, mutate } = createTestClient(server.apollo);

      // Create a second issue
      const ires = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: { type: 'bug', state: 'new', summary: 'second', description: 'second issue' }
        },
      });
      expect(ires.errors).toBeUndefined();
      const otherIssueId = ires.data.newIssue.id;

      // Add an issue link
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: [{ to: otherIssueId, relation: Relation.BlockedBy }],
          }
        },
      });
      expect(res.errors).toBeUndefined();

      // Clear change list
      await server.db.collection('issueChanges').deleteMany({});

      // Change the link to the same thing
      const res2 = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: [{ to: otherIssueId, relation: Relation.BlockedBy }],
          }
        },
      });
      expect(res2.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        links: [{ relation: Relation.BlockedBy, to: otherIssueId }],
      });

      const qres2 = await query({ query: IssueQuery, variables: { id: otherIssueId } });
      expect(qres2.errors).toBeUndefined();
      expect(qres2.data.issue).toMatchObject({
        links: [{ relation: Relation.Blocks, to: issueId }],
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(0);

      const cres2 = await query({
        query: IssueChangeQuery,
        variables: { project, issue: otherIssueId },
      });
      expect(cres2.errors).toBeUndefined();
      expect(cres2.data.issueChanges.results).toBeArrayOfSize(0);
    });

    test('link change (no effect, reverse)', async () => {
      const { query, mutate } = createTestClient(server.apollo);

      // Create a second issue
      const ires = await mutate({
        mutation: NewIssueMutation,
        variables: {
          project,
          input: { type: 'bug', state: 'new', summary: 'second', description: 'second issue' }
        },
      });
      expect(ires.errors).toBeUndefined();
      const otherIssueId = ires.data.newIssue.id;

      // Add an issue link
      const res = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: issueId,
          input: {
            ...testData,
            linked: [{ to: otherIssueId, relation: Relation.BlockedBy }],
          }
        },
      });
      expect(res.errors).toBeUndefined();

      // Clear change list
      await server.db.collection('issueChanges').deleteMany({});

      // Change the link to the same thing
      const res2 = await mutate({
        mutation: UpdateIssueMutation,
        variables: {
          id: otherIssueId,
          input: {
            type: 'bug',
            state: 'new',
            summary: 'second',
            description: 'second issue',
            linked: [{ to: issueId, relation: Relation.Blocks }],
          }
        },
      });
      expect(res2.errors).toBeUndefined();

      const qres = await query({ query: IssueQuery, variables: { id: issueId } });
      expect(qres.errors).toBeUndefined();
      expect(qres.data.issue).toMatchObject({
        ...expectedResponse,
        links: [{ relation: Relation.BlockedBy, to: otherIssueId }],
      });

      const qres2 = await query({ query: IssueQuery, variables: { id: otherIssueId } });
      expect(qres2.errors).toBeUndefined();
      expect(qres2.data.issue).toMatchObject({
        links: [{ relation: Relation.Blocks, to: issueId }],
      });

      const cres = await query({ query: IssueChangeQuery, variables: { project, issue: issueId } });
      expect(cres.errors).toBeUndefined();
      expect(cres.data.issueChanges.results).toBeArrayOfSize(0);

      const cres2 = await query({
        query: IssueChangeQuery,
        variables: { project, issue: otherIssueId },
      });
      expect(cres2.errors).toBeUndefined();
      expect(cres2.data.issueChanges.results).toBeArrayOfSize(0);
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
