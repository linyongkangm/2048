import { _decorator, Component, Label, UITransform, math, tween } from 'cc';
import { shuffle } from './utils/tools';
import BoardMng from './BoardMng';
const { ccclass } = _decorator;

@ccclass('SliderBlock')
export class SliderBlock extends Component {
  private static optionalValue = [2, 4, 8];
  onLoad() {
    const cellSize = BoardMng.getCellSize();
    const uiTransfrom = this.node.getComponent(UITransform);
    uiTransfrom.width = cellSize.width;
    uiTransfrom.height = cellSize.height;

    const value = shuffle(SliderBlock.optionalValue)[0];
    this.updateValue(value);
  }
  updateValue(value: number) {
    const label = this.getComponentInChildren(Label);
    label.string = `${value}`;
  }
  getValue() {
    const label = this.getComponentInChildren(Label);
    return Number(label.string);
  }

  async moveTo(endPosition: math.Vec3) {
    await new Promise<void>((resolve) => {
      tween(this.node)
        .to(0.2, {
          position: endPosition,
        })
        .call(resolve)
        .start();
    });
  }
}
