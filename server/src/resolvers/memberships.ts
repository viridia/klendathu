import {
  MembershipRecord,
} from '../db/types';

export const types = {
  Membership: {
    id: (m: MembershipRecord) => m._id.toHexString(),
    project: (m: MembershipRecord) => m.project ? m.project.toHexString() : null,
    organization: (m: MembershipRecord) => m.organization ? m.organization.toHexString() : null,
    createdAt: (m: MembershipRecord) => m.created,
    updatedAt: (m: MembershipRecord) => m.updated,
  },
};
