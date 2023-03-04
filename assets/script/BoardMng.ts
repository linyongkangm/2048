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

  private columns = 5;
  public setColums(columns: number) {
    this.columns = columns;
  }
  public getColums() {
    return this.columns;
  }

  private rows = 6;
  public setRows(rows: number) {
    this.rows = rows;
  }
  public getRows() {
    return this.rows;
  }

  public get startsMap() {
    return {
      [KeyCode.ARROW_UP]: Array.from({ length: this.columns }).map((_, index) => 0 + index),
      [KeyCode.ARROW_DOWN]: Array.from({ length: this.columns }).map(
        (_, index) => this.columns * (this.rows - 1) + index
      ),
      [KeyCode.ARROW_LEFT]: Array.from({ length: this.rows }).map((_, index) => 0 + this.columns * index),
      [KeyCode.ARROW_RIGHT]: Array.from({ length: this.rows }).map((_, index) => this.columns + this.rows * index - 1),
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
