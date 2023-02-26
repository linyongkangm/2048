import { _decorator, Component, Label, Animation, animation, Node, RealKeyframeValue, math } from 'cc';
import { shuffle } from './utils/tools';
const { ccclass } = _decorator;

@ccclass('SliderBlock')
export class SliderBlock extends Component {
  private static optionalValue = [2, 4, 8];
  private label: Label;
  start() {
    const value = shuffle(SliderBlock.optionalValue)[0];
    this.label = this.getComponentInChildren(Label);
    this.updateValue(value);
  }
  updateValue(value: number) {
    this.label.string = `${value}`;
  }
  getValue() {
    return Number(this.label.string);
  }

  async moveTo(targetNode: Node) {
    targetNode.inverseTransformPoint(this.node.position, this.node.getWorldPosition());
    targetNode.addChild(this.node);
    console.log(this.node.position);

    const animation = this.getComponent(Animation);

    const clip = animation.defaultClip;
    const track = clip.getTrack(0);
    const [xChannel, yChannel] = track.channels();

    const startX = xChannel.curve.getKeyframeValue(0) as RealKeyframeValue;
    startX.value = this.node.position.x;

    const startY = yChannel.curve.getKeyframeValue(0) as RealKeyframeValue;
    startY.value = this.node.position.y;

    const endX = xChannel.curve.getKeyframeValue(1) as RealKeyframeValue;
    endX.value = 0;

    const endY = yChannel.curve.getKeyframeValue(1) as RealKeyframeValue;
    endY.value = 0;

    await new Promise((resolve) => {
      animation.once(Animation.EventType.FINISHED, resolve);
      animation.play();
    });
  }
  onMove() {
    console.log('onMove');
  }
}
