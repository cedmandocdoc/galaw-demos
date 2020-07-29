class Engine {
  constructor() {
    this.queue = 0;
    this.running = false;
    this.tasks = new Map();
  }

  add(task) {
    this.tasks.set(this.queue, task);

    if (!this.running) {
      this.running = true;
      this.step();
    }

    return this.queue++;
  }

  delete(id) {
    this.tasks.delete(id);
  }

  step() {
    window.requestAnimationFrame(time => {
      this.tasks.forEach(task => task(time));
      if (this.tasks.size) this.step();
      else this.running = false;
    });
  }
}

export default new Engine();
