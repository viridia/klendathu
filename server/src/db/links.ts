import { IssueLinkInput, Relation } from '../../../common/types/graphql';
import {
  IssueLinkRecord,
  IssueRecord,
  ProjectRecord,
  TimelineEntryRecord,
  AccountRecord
} from './types';
import { inverseRelations } from '../../../common/types/json';

type Maybe<T> = T | null;

export interface UpdateLinkArgs {
  /** List of issues linked to this one. */
  linked?: Maybe<IssueLinkInput[]>;
  addLinks?: Maybe<IssueLinkInput[]>;
  /** Mass edit: remove link. */
  removeLinks?: Maybe<string[]>;
}

export function updateIssueLinks(
    input: UpdateLinkArgs,
    issue: IssueRecord,
    project: ProjectRecord,
    existingLinks: IssueLinkRecord[],
    user: AccountRecord,
    change: TimelineEntryRecord,
    linksToInsert: IssueLinkRecord[],
    linksToRemove: IssueLinkRecord[],
    linksToUpdate: IssueLinkRecord[],
    timelineRecordsToInsert: TimelineEntryRecord[],
) {
  // Change records for the other side of the link.
  const now = new Date();
  const addChangeRecord = (iss: string, ch: { before?: Relation; after?: Relation }) => {
    timelineRecordsToInsert.push({
      project: project._id,
      by: user._id,
      issue: iss,
      at: now,
      linked: [{ to: issue._id, ...ch }],
    });
  };

  // Links from this issue to another issue, indexed by target
  const fwdMap = new Map<string, IssueLinkRecord>(existingLinks
    .filter(link => link.from === issue._id)
    .map(link => [link.to, link] as [string, IssueLinkRecord]));
  // Links to this issue from another issue, indexed by source
  const rvsMap = new Map<string, IssueLinkRecord>(existingLinks
    .filter(link => link.to === issue._id)
    .map(link => [link.from, link] as [string, IssueLinkRecord]));
  change.linked = [];

  if ('linked' in input) {
    // Replace list
    for (const link of input.linked) {
      const inv = inverseRelations[link.relation]; // Inverse relation
      const fwd = fwdMap.get(link.to); // Pre-existing link from this to another issue.
      const rvs = rvsMap.get(link.to); // Pre-existing link from another issue to this.

      if (!fwd && !rvs) {
        // This is a new link (no link between current issue and link.to)
        linksToInsert.push({ from: issue._id, to: link.to, relation: link.relation });
        change.linked.push({ to: link.to, after: link.relation });
        addChangeRecord(link.to, { after: inv });
      } else if (fwd) {
        // Existing forward link, see if the relationship changed
        if (fwd.relation !== link.relation) {
          linksToUpdate.push({ ...fwd, relation: link.relation });
          change.linked.push({ to: link.to, before: fwd.relation, after: link.relation });
          addChangeRecord(link.to, { before: inverseRelations[fwd.relation], after: inv });
        }
      } else if (rvs) {
        // Existing reverse link, see if the (inverse) relationship changed.
        if (rvs.relation !== inv) {
          linksToUpdate.push({ ...rvs, relation: inv });
          change.linked.push({
            to: link.to, before: inverseRelations[rvs.relation], after: inv });
          addChangeRecord(rvs.from, { before: rvs.relation, after: link.relation });
        }
      }
    }

    // Remove any entries from the maps that were maintained
    for (const link of input.linked) {
      fwdMap.delete(link.to);
      rvsMap.delete(link.to);
    }

    // Delete all forward links that weren't in the list
    for (const fwd of fwdMap.values()) {
      // Queue link for deletion
      linksToRemove.push(fwd);
      change.linked.push({ to: fwd.to, before: fwd.relation });
      addChangeRecord(fwd.to, { before: inverseRelations[fwd.relation] });
    }

    // Delete all reverse links that weren't in the list
    for (const rvs of rvsMap.values()) {
      // Queue link for deletion
      linksToRemove.push(rvs);
      change.linked.push({ to: rvs.from, before: inverseRelations[rvs.relation] });
      addChangeRecord(rvs.from, { before: rvs.relation });
    }
  }

  if ('addLinks' in input) {
    for (const link of input.addLinks) {
      const inv = inverseRelations[link.relation]; // Inverse relation
      const fwd = fwdMap.get(link.to); // Pre-existing link from this to another issue.
      const rvs = rvsMap.get(link.to); // Pre-existing link from another issue to this.

      if (!fwd && !rvs) {
        // This is a new link (no link between current issue and link.to)
        linksToInsert.push({ from: issue._id, to: link.to, relation: link.relation });
        change.linked.push({ to: link.to, after: link.relation });
        addChangeRecord(link.to, { after: inv });
      } else if (fwd) {
        // Existing forward link, see if the relationship changed
        if (fwd.relation !== link.relation) {
          linksToUpdate.push({ ...fwd, relation: link.relation });
          change.linked.push({ to: link.to, before: fwd.relation, after: link.relation });
          addChangeRecord(link.to, { before: inverseRelations[fwd.relation], after: inv });
        }
      } else if (rvs) {
        // Existing reverse link, see if the (inverse) relationship changed.
        if (rvs.relation !== inv) {
          linksToUpdate.push({ ...rvs, relation: inv });
          change.linked.push({
            to: link.to, before: inverseRelations[rvs.relation], after: inv });
          addChangeRecord(rvs.from, { before: rvs.relation, after: link.relation });
        }
      }
    }

    // Unlike 'linked' case above, we don't remove any links.
  }

  if ('removeLinks' in input) {
    for (const linkId of input.removeLinks) {
      const fwd = fwdMap.get(linkId); // Pre-existing link from this to another issue.
      const rvs = rvsMap.get(linkId); // Pre-existing link from another issue to this.

      if (fwd) {
        linksToRemove.push(fwd);
        change.linked.push({ to: fwd.to, before: fwd.relation });
        addChangeRecord(fwd.to, { before: inverseRelations[fwd.relation] });
      } else if (rvs) {
        // Existing reverse link, see if the (inverse) relationship changed.
        linksToRemove.push(rvs);
        change.linked.push({ to: rvs.from, before: inverseRelations[rvs.relation] });
        addChangeRecord(rvs.from, { before: rvs.relation });
      }
    }
  }

  if (change.linked.length > 0) {
    change.at = now;
  }
}
