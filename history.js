export class HistoryManager {
  constructor(maxSteps = 50) {
    this.maxSteps = maxSteps;
    this.stack = [];
    this.index = -1;
  }
  push(state, _reason = '') {
    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push(structuredClone(state));
    if (this.stack.length > this.maxSteps) this.stack.shift();
    this.index = this.stack.length - 1;
  }
  undo() {
    if (this.index <= 0) return null;
    this.index -= 1;
    return structuredClone(this.stack[this.index]);
  }
  redo() {
    if (this.index >= this.stack.length - 1) return null;
    this.index += 1;
    return structuredClone(this.stack[this.index]);
  }
}


