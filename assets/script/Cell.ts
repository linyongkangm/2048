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
  absorb(sliderBlock: SliderBlock) {
    const selfSliderBlock = this.getComponentInChildren(SliderBlock);
    if (selfSliderBlock) {
      if (selfSliderBlock.getValue() === sliderBlock.getValue()) {
        sliderBlock.node.removeFromParent();
        selfSliderBlock.updateValue(selfSliderBlock.getValue() * 2);
      }
    } else {
      this.node.addChild(sliderBlock.node);
    }
  }
  hasSliderBlockChild() {
    return !!this.getComponentInChildren(SliderBlock);
  }
}
