import { TimelineEntry, Issue } from '../../../../common/types/graphql';
import { session } from '../../models';

/** Set of variables that can be used in workflow action expressions. */
export class ActionEnv {
  constructor(
    private issue: Issue,
    private timeline: TimelineEntry[],
    private props: Map<string, string>) {}

  public get(key: string): string {
    if (this.props.has(key)) {
      const value = this.props.get(key);
      // Because the value might be an Issue object, and we need the id.
      if (value && (value as any).id) {
        return (value as any).id;
      }
      return value;
    }
    return (this as any)[key];
  }

  get summary(): string {
    return this.issue.summary;
  }

  get description(): string {
    return this.issue.description;
  }

  get type(): string {
    return this.issue.type;
  }

  get state(): string {
    return this.issue.state;
  }

  get owner(): string {
    return this.issue.owner;
  }

  get reporter(): string {
    return this.issue.reporter;
  }

  get me(): string {
    return session.account ? session.account.id : null;
  }

  get self(): string {
    return this.issue.id;
  }

  get none(): string {
    return null;
  }

  /** Previous owner */
  get previous(): string {
    const owner = this.issue.owner;
    if (!this.timeline) {
      return undefined;
    }
    for (let i = this.timeline.length - 1; i >= 0; i -= 1) {
      const change = this.timeline[i];
      if (change.owner && change.owner.after !== owner) {
        return change.owner.after;
      }
    }
    return undefined;
  }
}
