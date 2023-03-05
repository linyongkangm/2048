import { _decorator, Component, Prefab, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Component {
  @property({ type: String })
  private label: string = '';
  onLoad() {
    this.updateField(this.label);
  }
  updateField(text: string) {
    const fieldNode = this.node.getChildByName('Field');
    fieldNode.getComponent(Label).string = text;
  }
  updateValue(value: number) {
    const valueNode = this.node.getChildByName('Value');
    const label = valueNode.getComponent(Label);
    label.string = value + '';
    label.fontSize = 30 - Math.max(label.string.length - 4, 0) * 4;
  }
  getValue() {
    const valueNode = this.node.getChildByName('Value');
    return Number(valueNode.getComponent(Label).string) || 0;
  }

  addedValue(value: number) {
    const prevValue = this.getValue();
    this.updateValue(prevValue + value);
  }
}
