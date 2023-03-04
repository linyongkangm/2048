import { _decorator, Component, instantiate, Prefab, EventKeyboard, KeyCode, input, Input, Node, Layout } from 'cc';
import { Cell } from './Cell';
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
  onLoad() {
    const checkerboard = this.node.getChildByName('Checkerboard');
    const skatingRink = this.node.getChildByName('SkatingRink');
    Array.from({
      length: this.columns * this.rows,
    }).forEach(() => {
      const cellNode = instantiate(this.cellPrefab);
      cellNode.getComponent(Cell).setSkatingRink(skatingRink);
      checkerboard.addChild(cellNode);
    });
    checkerboard.getComponent(Layout).updateLayout();
  }
  start() {
    this.randomGenerateSliderBlock(3);
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  private lockKeyDown = false;
  async onKeyDown(event: EventKeyboard) {
    if (this.lockKeyDown) {
      return;
    }
    const starts = this.startsMap[event.keyCode];
    if (!starts) {
      return;
    }
    this.lockKeyDown = true;
    const [length, step] =
      [KeyCode.ARROW_UP, KeyCode.ARROW_DOWN].indexOf(event.keyCode) !== -1
        ? [this.rows, this.columns]
        : [this.columns, 1];
    const plusOrMinusIndex = [KeyCode.ARROW_UP, KeyCode.ARROW_LEFT].indexOf(event.keyCode) !== -1 ? 1 : -1;
    const cellNodeIndexGroups = starts.map((start) => {
      return Array.from({ length: length }).map((_, index) => start + step * index * plusOrMinusIndex);
    });
    const checkerboard = this.node.getChildByName('Checkerboard');
    const cellNodes = checkerboard.getComponentsInChildren(Cell).map((cell) => cell.node);
    const absorbPromises: Promise<boolean>[] = [];
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
          .filter((otherCell) => otherCell?.hasSliderBlock());
        // 如果cell本身没有数字块的话，先挪一个上去
        Array.from({
          length: !cell.hasSliderBlock() ? 2 : 1,
        }).forEach(() => {
          const otherCell = otherCells.shift();
          if (otherCell) {
            absorbPromises.push(cell.absorb(otherCell));
          }
        });
      });
    });

    const movedList = await Promise.all(absorbPromises);
    if (movedList.some((bol) => bol)) {
      this.randomGenerateSliderBlock(5);
      if (this.finalDecision()) {
        console.log('终局了');
        return;
      }
    }
    this.lockKeyDown = false;
  }

  randomGenerateSliderBlock(num: number) {
    const emptyCells = this.findEmptyCells();
    shuffle(emptyCells)
      .slice(0, num)
      .forEach((cell) => {
        cell.generateSliderBlock();
      });
  }

  // 没有空格了，相邻cell上的block不能合并，为终局
  finalDecision() {
    const emptyCells = this.findEmptyCells();
    if (emptyCells.length === 0) {
      return this.getComponentsInChildren(Cell).every((cell, index, cellGroup) => {
        const value = cell.getSliderBlock().getValue();
        const rightCell = (index + 1) % this.columns === 0 ? undefined : cellGroup[index + 1];
        const bottomCell = cellGroup[index + this.columns];
        return value !== rightCell?.getSliderBlock().getValue() && value !== bottomCell?.getSliderBlock().getValue();
      });
    }
    return false;
  }

  findEmptyCells() {
    return this.getComponentsInChildren(Cell).filter((cell) => !cell.hasSliderBlock());
  }
}
