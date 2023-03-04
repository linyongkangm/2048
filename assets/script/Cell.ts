import { _decorator, Component, Prefab, instantiate, Node, math, UITransform } from 'cc';
import { SliderBlock } from './SliderBlock';
import BoardMng from './BoardMng';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell extends Component {
  @property({ type: Prefab })
  private blockPrefab: Prefab = null;

  onLoad() {
    const cellSize = BoardMng.getCellSize();
    const uiTransfrom = this.node.getComponent(UITransform);
    uiTransfrom.width = cellSize.width;
    uiTransfrom.height = cellSize.height;
  }

  private sliderBlock: SliderBlock | undefined;
  hasSliderBlock() {
    return !!this.sliderBlock;
  }
  replaceSliderBlock(sliderBlock: SliderBlock) {
    this.sliderBlock = sliderBlock;
  }
  removeSliderBlock() {
    this.sliderBlock = undefined;
  }
  getSliderBlock() {
    return this.sliderBlock;
  }
  generateSliderBlock() {
    const sliderBlockNode = instantiate(this.blockPrefab);
    BoardMng.getSkatingRink().addChild(sliderBlockNode);
    BoardMng.getSkatingRink().inverseTransformPoint(sliderBlockNode.position, this.node.getWorldPosition());
    this.sliderBlock = sliderBlockNode.getComponent(SliderBlock);
  }
  // 从cell把他的SliderBlock吸过来
  async absorbSliderBlock(cell: Cell) {
    this.replaceSliderBlock(cell.sliderBlock);
    cell.removeSliderBlock();
    const endPosition = new math.Vec3();
    BoardMng.getSkatingRink().inverseTransformPoint(endPosition, this.node.getWorldPosition());
    await this.sliderBlock.moveTo(endPosition);
  }
  async absorb(cell: Cell) {
    const sliderBlock = this.getSliderBlock();
    const otherSliderBlock = cell.getSliderBlock();

    if (sliderBlock) {
      if (sliderBlock.getValue() === otherSliderBlock.getValue()) {
        await this.absorbSliderBlock(cell);
        otherSliderBlock.updateValue(otherSliderBlock.getValue() * 2);
        sliderBlock.node.removeFromParent(); //合成了，删除一个
        return true;
      }
    } else {
      await this.absorbSliderBlock(cell);
      return true;
    }
    return false;
  }
}
