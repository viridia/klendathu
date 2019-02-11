import '../src/env';
import { createTestClient } from 'apollo-server-testing';
import { gql } from 'apollo-server-core';
import { constructTestServer, TestServer } from './fixtures';

const ProjectsQuery = gql`query { projects { id name title } }`;

const CreateProjectMutation = gql`mutation CreateProjectMutation(
  $owner: ID!,
  $name: String!,
  $input: ProjectInput!)
{
  createProject(owner: $owner, name: $name, input: $input) { id name title }
}`;

const RemoveProjectMutation = gql`mutation RemoveProjectMutation($id: ID!) {
  removeProject(id: $id) { id }
}`;

describe('projects', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await constructTestServer();
  });

  afterEach(async () => {
    await server.db.collection('projects').deleteMany({});
  });

  afterAll(async () => {
    await server.close();
  });

  test('empty project list', async () => {
    const { query } = createTestClient(server.apollo);
    const res = await query({ query: ProjectsQuery });
    expect(res.errors).toBeUndefined();
    expect(res.data).toHaveProperty('projects');
    expect(res.data.projects).toBeArrayOfSize(0);
  });

  test('create project', async () => {
    const { query, mutate } = createTestClient(server.apollo);
    const res = await mutate({
      mutation: CreateProjectMutation,
      variables: {
        owner: server.context.user._id.toHexString(),
        name: 'test-project',
        input: {
          title: 'Test Project',
          description: 'A test project',
          isPublic: false,
        }
      },
    });
    expect(res.errors).toBeUndefined();
    expect(res.data).toHaveProperty('createProject');
    expect(res.data.createProject).toBeObject();
    expect(res.data.createProject).toHaveProperty('id');
    expect(res.data.createProject).toHaveProperty('name', 'test-project');
    expect(res.data.createProject).toHaveProperty('title', 'Test Project');

    const res2 = await query({ query: ProjectsQuery });
    expect(res2.errors).toBeUndefined();
    expect(res2.data).toHaveProperty('projects');
    expect(res2.data.projects).toBeArrayOfSize(1);
    expect(res2.data.projects[0].id).toEqual(res.data.createProject.id);
    expect(res2.data.projects[0].name).toEqual(res.data.createProject.name);
    expect(res2.data.projects[0].title).toEqual(res.data.createProject.title);
  });

  test('remove project', async () => {
    const { query, mutate } = createTestClient(server.apollo);
    const res = await mutate({
      mutation: CreateProjectMutation,
      variables: {
        owner: server.context.user._id.toHexString(),
        name: 'test-project',
        input: {
          title: 'Test Project',
          description: 'A test project',
          isPublic: false,
        }
      },
    });

    await mutate({
      mutation: RemoveProjectMutation,
      variables: { id: res.data.createProject.id },
    });

    const res3 = await query({ query: ProjectsQuery });
    expect(res3.errors).toBeUndefined();
    expect(res3.data).toHaveProperty('projects');
    expect(res3.data.projects).toBeArrayOfSize(0);
  });
});
