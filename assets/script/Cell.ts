import { _decorator, Component, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell extends Component {
  @property({ type: Prefab })
  private blockPrefab: Prefab = null;

  generateBlock() {
    this.node.addChild(instantiate(this.blockPrefab));
  }
}
