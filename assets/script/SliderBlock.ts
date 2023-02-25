import { _decorator, Component, Label } from 'cc';
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
}
