import { _decorator, Component, instantiate, Prefab } from 'cc';
import { Cell } from './Cell';
import { shuffle } from './utils/tools';
const { ccclass, property } = _decorator;

@ccclass('Board')
export class Board extends Component {
  @property({ type: Prefab })
  private cellPrefab: Prefab = null;
  start() {
    Array.from({
      length: 4 * 4,
    }).forEach(() => {
      this.node.addChild(instantiate(this.cellPrefab));
    });
    shuffle(this.node.children)
      .slice(0, 3)
      .forEach((node) => {
        const cell = node.getComponent(Cell);
        cell.generateBlock();
      });
  }

  update(deltaTime: number) {}
}
