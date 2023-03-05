import { _decorator, Component, Prefab, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Component {
  @property({ type: String })
  private label: string = '';
  onLoad() {
    const fieldNode = this.node.getChildByName('Field');
    fieldNode.getComponent(Label).string = this.label;
  }
}
