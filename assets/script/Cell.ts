import { _decorator, Component, Prefab, instantiate, Node, math } from 'cc';
import { SliderBlock } from './SliderBlock';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell extends Component {
  @property({ type: Prefab })
  private blockPrefab: Prefab = null;

  private skatingRink: Node;
  public setSkatingRink(node: Node) {
    this.skatingRink = node;
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
    this.skatingRink.addChild(sliderBlockNode);
    this.skatingRink.inverseTransformPoint(sliderBlockNode.position, this.node.getWorldPosition());
    this.sliderBlock = sliderBlockNode.getComponent(SliderBlock);
  }
  // 从cell把他的SliderBlock吸过来
  async absorbSliderBlock(cell: Cell) {
    this.replaceSliderBlock(cell.sliderBlock);
    cell.removeSliderBlock();
    const endPosition = new math.Vec3();
    this.skatingRink.inverseTransformPoint(endPosition, this.node.getWorldPosition());
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
