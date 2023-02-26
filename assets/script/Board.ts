import { _decorator, Component, instantiate, Prefab, EventKeyboard, KeyCode, input, Input, Node } from 'cc';
import { Cell } from './Cell';
import { SliderBlock } from './SliderBlock';
import { shuffle } from './utils/tools';
const { ccclass, property } = _decorator;

@ccclass('Board')
export class Board extends Component {
  @property({ type: Prefab })
  private cellPrefab: Prefab = null;

  private columns = 4; // 列数
  private rows = 4; // 行数
  private startsMap: {
    [index: number]: number[];
  } = {
    [KeyCode.ARROW_UP]: Array.from({ length: this.columns }).map((_, index) => 0 + index),
    [KeyCode.ARROW_DOWN]: Array.from({ length: this.columns }).map(
      (_, index) => this.columns * (this.rows - 1) + index
    ),
    [KeyCode.ARROW_LEFT]: Array.from({ length: this.rows }).map((_, index) => 0 + this.columns * index),
    [KeyCode.ARROW_RIGHT]: Array.from({ length: this.rows }).map((_, index) => this.columns + this.rows * index - 1),
  };
  start() {
    Array.from({
      length: this.columns * this.rows,
    }).forEach(() => {
      const cellNode = instantiate(this.cellPrefab);
      this.node.addChild(cellNode);
    });
    this.randomGenerateBlock(3);

    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }
  randomGenerateBlock(num: number) {
    shuffle(this.getComponentsInChildren(Cell))
      .filter((cell) => !cell.hasSliderBlockChild())
      .slice(0, num)
      .forEach((cell) => {
        cell.generateBlock();
      });
  }
  onKeyDown(event: EventKeyboard) {
    let isMove = false;
    const starts = this.startsMap[event.keyCode];
    if (!starts) {
      return;
    }
    const [length, step] =
      [KeyCode.ARROW_UP, KeyCode.ARROW_DOWN].indexOf(event.keyCode) !== -1
        ? [this.rows, this.columns]
        : [this.columns, 1];
    const plusOrMinusIndex = [KeyCode.ARROW_UP, KeyCode.ARROW_LEFT].indexOf(event.keyCode) !== -1 ? 1 : -1;
    const cellNodeIndexGroups = starts.map((start) => {
      return Array.from({ length: length }).map((_, index) => start + step * index * plusOrMinusIndex);
    });
    const cellNodes = this.getComponentsInChildren(Cell).map((cell) => cell.node);
    cellNodeIndexGroups.forEach((cellNodeIndexGroup) => {
      cellNodeIndexGroup.slice(0, -1).forEach((cellNodeIndex, index) => {
        const cellNode = cellNodes[cellNodeIndex] as Node;
        const cell = cellNode.getComponent(Cell);
        const otherCells = cellNodeIndexGroup
          .slice(index + 1)
          .map((otherCellNodeIndex) => {
            const otherCellNode = cellNodes[otherCellNodeIndex] as Node;
            return otherCellNode.getComponent(Cell);
          })
          .filter((otherCell) => otherCell?.hasSliderBlockChild());
        // 如果cell本身没有数字块的话，先挪一个上去
        if (!cell.hasSliderBlockChild()) {
          const otherCell = otherCells.shift();
          if (otherCell) {
            cell.absorb(otherCell);
            isMove = true;
          }
        }
        const otherCell = otherCells.shift();
        if (otherCell) {
          cell.absorb(otherCell);
          isMove = true;
        }
      });
    });
    if (isMove) {
      this.randomGenerateBlock(1);
    }
  }

  update(deltaTime: number) {}
}
