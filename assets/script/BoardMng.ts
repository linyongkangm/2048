import { Node, KeyCode, UITransform, Layout } from 'cc';

class BoardMng {
  private checkerboard: Node;
  public registerCheckerboard(checkerboard: Node) {
    this.checkerboard = checkerboard;
    this.updateCheckerboardProps();
  }
  public getCheckerboard() {
    return this.checkerboard;
  }
  private updateCheckerboardProps() {
    const uiTransform = this.checkerboard.getComponent(UITransform);
    const size = {
      width: uiTransform.width,
      height: uiTransform.height,
    };
    const layout = this.checkerboard.getComponent(Layout);
    layout.constraintNum = this.columns;
    const innerWidth = size.width - layout.paddingLeft - layout.paddingRight;
    const cellWidth = (innerWidth - layout.spacingX * (this.columns - 1)) / this.columns;
    this.setCellSize({
      width: cellWidth,
      height: cellWidth,
    });
  }
  private skatingRink: Node;
  public registerSkatingRink(skatingRink: Node) {
    this.skatingRink = skatingRink;
  }
  public getSkatingRink() {
    return this.skatingRink;
  }

  private columns = 4;
  public setColums(columns: number) {
    this.columns = columns;
  }
  public getColums() {
    return this.columns;
  }

  private rows = 4;
  public setRows(rows: number) {
    this.rows = rows;
  }
  public getRows() {
    return this.rows;
  }

  public get startsMap() {
    const top = Array.from({ length: this.columns }).map((_, index) => 0 + index);
    const left = Array.from({ length: this.rows }).map((_, index) => 0 + this.columns * index);
    return {
      [KeyCode.ARROW_UP]: top,
      [KeyCode.ARROW_DOWN]: top.map((num) => this.columns * this.rows - num - 1),
      [KeyCode.ARROW_LEFT]: left,
      [KeyCode.ARROW_RIGHT]: left.map((num) => num + this.columns - 1),
    };
  }

  private cellSize: {
    width: number;
    height: number;
  };
  public getCellSize() {
    return this.cellSize;
  }
  public setCellSize(size: { width: number; height: number }) {
    console.log(size);
    this.cellSize = { ...size };
  }
}

export default new BoardMng();
