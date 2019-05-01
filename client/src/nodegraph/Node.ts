import { observable } from 'mobx';
import { ReachableIssue } from '../../../common/types/graphql';

export class Node {
  @observable public data: ReachableIssue;
  public index: number;

  // Subnodes placed to the right and below this node.
  public right: Node[] = [];
  public bottom: Node[] = [];

  // Location of this node relative to the graph layout.
  public x: number;
  public y: number;

  // How many cells this node takes up, including all of its connected subnodes.
  public layoutWidth = 1;
  public layoutHeight = 1;

  constructor(data: ReachableIssue, index: number) {
    this.data = data;
    this.index = index;
  }

  public get id(): string {
    return this.data.issue.id;
  }
}
