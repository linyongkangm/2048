import { _decorator, Component, Prefab, instantiate } from 'cc';
import { SliderBlock } from './SliderBlock';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell extends Component {
  @property({ type: Prefab })
  private blockPrefab: Prefab = null;

  generateBlock() {
    this.node.addChild(instantiate(this.blockPrefab));
  }
  absorb(cell: Cell) {
    const sliderBlock = this.getComponentInChildren(SliderBlock);
    const otherSliderBlock = cell.getComponentInChildren(SliderBlock);
    if (sliderBlock) {
      if (sliderBlock.getValue() === otherSliderBlock.getValue()) {
        otherSliderBlock.node.removeFromParent();
        sliderBlock.updateValue(sliderBlock.getValue() * 2);
      }
    } else {
      this.node.addChild(otherSliderBlock.node);
    }
  }
  hasSliderBlockChild() {
    return !!this.getComponentInChildren(SliderBlock);
  }
}
