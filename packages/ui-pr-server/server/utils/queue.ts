export class Queue {
  queueList: Array<any> = []
  //入队操作  
  push(element: any) {
    this.queueList.push(element);
    return true;
  }
  //出队操作  
  pop() {
    return this.queueList.shift();
  }
  //获取队首  
  getFront() {
    return this.queueList[0];
  }
  //获取队尾  
  getRear() {
    return this.queueList[this.queueList.length - 1]
  }
  //清空队列  
  clear() {
    this.queueList = [];
  }
  //获取队长  
  size() {
    return this.queueList.length
  }
}  