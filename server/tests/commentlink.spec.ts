import '../src/env';
import { IssueLinkInput, Relation } from '../../common/types/graphql';
import { scanForDirectives } from '../src/resolvers/issueMutations';

describe('comment processing', () => {
  test('link directives', async () => {
    const comment1 = `
This is an example comment.
:blocks #1
:dup #2
    `;
    const comment2 = `
This is another comment.
:part of #3
:related http://localhost:4000/user/foo/4
:contains #5
:blocked by #6
    `;
    const issueLinks: IssueLinkInput[] = [];
    scanForDirectives('user', 'foo', '12345678', [comment1, comment2], issueLinks);
    expect(issueLinks).toEqual([
      { relation: Relation.Blocks, to: '12345678.1' },
      { relation: Relation.Duplicate, to: '12345678.2' },
      { relation: Relation.PartOf, to: '12345678.3' },
      { relation: Relation.Related, to: '12345678.4' },
      { relation: Relation.HasPart, to: '12345678.5' },
      { relation: Relation.BlockedBy, to: '12345678.6' },
    ]);
  });

  test('invalid link directives', async () => {
    const comment1 = `
This is an example comment.
:block #1
:dup 2
    `;
    const comment2 = `
This is another comment.
:related https://localhost:4000/user/foo/4
:related http://localhost:4000/other/foo/4
:related http://localhost:4000/user/other/4
    `;
    const issueLinks: IssueLinkInput[] = [];
    scanForDirectives('user', 'foo', '12345678', [comment1, comment2], issueLinks);
    expect(issueLinks).toBeArrayOfSize(0);
  });
});
