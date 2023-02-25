import { _decorator, Component, instantiate } from 'cc';
import { Cell } from './Cell';
const { ccclass, property } = _decorator;

@ccclass('Board')
export class Board extends Component {
  start() {
    const cell = this.getComponentInChildren(Cell);
    const node = cell.node;
    Array.from({
      length: 4 * 4 - 1,
    }).forEach(() => {
      this.node.addChild(instantiate(node));
    });
  }

  update(deltaTime: number) {}
}
