import { _decorator, Component, Node, EditBox } from 'cc';
import BoardMng from './BoardMng';
const { ccclass, property } = _decorator;

function createPromiseFunc() {
  const assign: {
    resolve: () => void;
    reject: () => void;
  } = {} as any;
  const promise = new Promise<void>((resolve, reject) => {
    Object.assign(assign, { resolve, reject });
  });
  return Object.assign(promise, assign);
}

@ccclass('ConfigForm')
export class ConfigForm extends Component {
  waitPromise = createPromiseFunc();
  onLoad() {
    this.waitPromise = createPromiseFunc();
  }
  start() {
    this.updateFormValues({
      rows: BoardMng.getRows(),
      columns: BoardMng.getColums(),
    });
  }

  onConfirm() {
    const values = this.getFormValues();
    BoardMng.setRows(Number(values.rows) || 4);
    BoardMng.setColums(Number(values.columns) || 4);
    console.log(this.waitPromise);
    this.waitPromise.resolve();
  }
  waitConfirm() {
    return this.waitPromise;
  }

  updateFormValues(value: { rows: number; columns: number }) {
    const { rowsEditBox, columnsEditBox } = this.getEditBoxs();
    rowsEditBox.string = value.rows + '';
    columnsEditBox.string = value.columns + '';
  }

  getFormValues() {
    const { rowsEditBox, columnsEditBox } = this.getEditBoxs();
    return {
      rows: rowsEditBox.string,
      columns: columnsEditBox.string,
    };
  }

  getEditBoxs() {
    const rowsEditBoxNode = this.node.getChildByName('RowsFormItem').getChildByName('EditBox');
    const rowsEditBox = rowsEditBoxNode.getComponent(EditBox);

    const columnsEditBoxNode = this.node.getChildByName('ColumnsFormItem').getChildByName('EditBox');
    const columnsEditBox = columnsEditBoxNode.getComponent(EditBox);
    return {
      rowsEditBox,
      columnsEditBox,
    };
  }
}
