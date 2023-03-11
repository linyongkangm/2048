import {
  _decorator,
  Component,
  instantiate,
  Prefab,
  EventKeyboard,
  KeyCode,
  input,
  Input,
  Node,
  Layout,
  director,
  EventTouch,
} from 'cc';
import { Cell } from './Cell';
import { shuffle } from './utils/tools';
import BoardMng from './BoardMng';
import { Score } from './Score';
import { ConfigForm } from './ConfigForm';
const { ccclass, property } = _decorator;

@ccclass('Board')
export class Board extends Component {
  @property({ type: Prefab })
  private cellPrefab: Prefab = null;

  @property({ type: Prefab })
  private configFormPrefab: Prefab = null;

  start() {
    this.startGame();
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    this.listenTouchEvent();
  }
  startGame() {
    // 重置分数
    const scene = director.getScene();
    const scoreNode = scene.getChildByPath('Canvas/Header/ScoreGroup/Score');
    const score = scoreNode.getComponent(Score);
    score.updateValue(0);

    // 重置棋盘
    const checkerboard = this.node.getChildByName('Checkerboard');
    BoardMng.registerCheckerboard(checkerboard);
    const skatingRink = this.node.getChildByName('SkatingRink');
    BoardMng.registerSkatingRink(skatingRink);
    checkerboard.removeAllChildren();
    skatingRink.removeAllChildren();

    // 重新构建棋盘
    Array.from({
      length: BoardMng.getColums() * BoardMng.getRows(),
    }).forEach(() => {
      const cellNode = instantiate(this.cellPrefab);
      checkerboard.addChild(cellNode);
    });
    checkerboard.getComponent(Layout).updateLayout();
    this.randomGenerateSliderBlock(3);
  }

  private lockKeyDown = false;
  async onKeyDown(event: EventKeyboard) {
    await this.moveByKeyCode(event.keyCode);
  }
  listenTouchEvent() {
    let touchStartTag: 'starting' | 'moving' | 'ending';
    input.on(
      Input.EventType.TOUCH_START,
      () => {
        touchStartTag = 'starting';
      },
      this
    );
    input.on(
      Input.EventType.TOUCH_CANCEL,
      () => {
        touchStartTag = 'ending';
      },
      this
    );
    input.on(
      Input.EventType.TOUCH_END,
      () => {
        touchStartTag = 'ending';
      },
      this
    );

    input.on(
      Input.EventType.TOUCH_MOVE,
      (event) => {
        if (touchStartTag === 'starting') {
          const startLocation = event.touch.getStartLocationInView();
          const location = event.touch.getLocationInView();
          const limit = 20;
          if (Math.max(Math.abs(location.x - startLocation.x), Math.abs(location.y - startLocation.y)) > limit) {
            touchStartTag = 'moving';
            const diffX = location.x - startLocation.x;
            const diffY = location.y - startLocation.y;
            if (Math.abs(diffY) > limit) {
              if (diffY < -limit) {
                this.moveByKeyCode(KeyCode.ARROW_UP);
              } else if (diffY > limit) {
                this.moveByKeyCode(KeyCode.ARROW_DOWN);
              }
            } else {
              if (diffX < -limit) {
                this.moveByKeyCode(KeyCode.ARROW_LEFT);
              } else if (diffX > limit) {
                this.moveByKeyCode(KeyCode.ARROW_RIGHT);
              }
            }
          }
        }
      },
      this
    );
  }
  async moveByKeyCode(keyCode: KeyCode) {
    if (this.lockKeyDown) {
      return;
    }
    const starts = BoardMng.startsMap[keyCode];
    if (!starts) {
      return;
    }
    this.lockKeyDown = true;
    const [length, step] =
      [KeyCode.ARROW_UP, KeyCode.ARROW_DOWN].indexOf(keyCode) !== -1
        ? [BoardMng.getRows(), BoardMng.getColums()]
        : [BoardMng.getColums(), 1];
    const plusOrMinusIndex = [KeyCode.ARROW_UP, KeyCode.ARROW_LEFT].indexOf(keyCode) !== -1 ? 1 : -1;
    const cellNodeIndexGroups = starts.map((start) => {
      return Array.from({ length: length }).map((_, index) => start + step * index * plusOrMinusIndex);
    });
    const cellNodes = BoardMng.getCheckerboard()
      .getComponentsInChildren(Cell)
      .map((cell) => cell.node);
    const absorbPromises: Promise<{
      moved: boolean;
      value: number;
    }>[] = [];
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
    if (movedList.some((result) => result.moved)) {
      const addedValue = movedList.reduce((prev, currnet) => {
        return prev + currnet.value || 0;
      }, 0);
      this.addedScoreValue(addedValue);
      this.randomGenerateSliderBlock(Math.random() > 0.8 ? 2 : 1);
      if (this.finalDecision()) {
        this.lockKeyDown = false;
        this.onReplay();
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
        const rightCell = (index + 1) % BoardMng.getColums() === 0 ? undefined : cellGroup[index + 1];
        const bottomCell = cellGroup[index + BoardMng.getColums()];
        return value !== rightCell?.getSliderBlock().getValue() && value !== bottomCell?.getSliderBlock().getValue();
      });
    }
    return false;
  }

  findEmptyCells() {
    return this.getComponentsInChildren(Cell).filter((cell) => !cell.hasSliderBlock());
  }

  addedScoreValue(value: number) {
    const scene = director.getScene();
    const scoreNode = scene.getChildByPath('Canvas/Header/ScoreGroup/Score');
    const score = scoreNode.getComponent(Score);
    score.addedValue(value);
  }

  async onReplay() {
    if (this.lockKeyDown) {
      return;
    }
    if (this.configFormPrefab) {
      const configForm = instantiate(this.configFormPrefab);
      this.node.addChild(configForm);
      this.lockKeyDown = true;
      await configForm.getComponent(ConfigForm).waitConfirm();
      configForm.removeFromParent();
      this.lockKeyDown = false;
    }

    this.startGame();
  }
}
