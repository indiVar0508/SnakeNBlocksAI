const IMAGE_WIDTH = 125;
const IMAGE_HEIGHT = 150;

class MemoryBuffer {
  constructor() {
    this.buffer = [];
    this.maxBufferSize = 10000;
    this.tail = 0;
  }

  add(state, action, reward, stateDash) {
    if (this.buffer.length > this.maxBufferSize) {
      // if buffer is full overwrite
      this.maxBufferSize[this.tail] = (state, action, reward, stateDash);
    } else {
      // fill the buffer
      this.buffer.push((state, action, reward, stateDash));
    }
    // move the pointer to location where append has to happen
    this.tail = (this.tail + 1) % this.maxBufferSize;
  }

  sample(size = 500) {
    // FIXME: is there a better wiser way??
    var sampleData = [];
    for (var i = 0; i < size; i++) {
      sampleData.append(
        this.buffer[Math.floor(Math.random() * this.maxBufferSize)]
      );
    }
    return sampleData;
  }
}

class DQNAgent {
  constructor(inputSpace, actionSpace, lr = 0.9, gamma = 0.95) {
    this.memory = new MemoryBuffer();
    this.lr = lr;
    this.gamma = gamma;
    this.inputSpace = inputSpace;
    this.actionSpace = actionSpace; // limit of Q value to map it to X co-ord
    this.model = this.buildModel();
    this.model.summary();
    console.log("Agent is ready")
  }

  remember(state, action, reward, stateDash) {
    this.memory.add(state, action, reward, stateDash)
  }

  act(state) {
    return this.model.predict(state)
  }

  learn() {
    let batch = this.memory.sample(128)
    let target;
    batch.forEach((state, action, reward, stateDash) => {
      target = reward + this.gamma * Math.max(this.act(next_state))
      // this seems wrong!?
      target_f = this.act(state)
      target_f[action] = target
      this.model.fit(state, target_f)
    })
  }

  buildModel() {
    // https://www.geeksforgeeks.org/tensorflow-js/?ref=lbp
    // https://codelabs.developers.google.com/codelabs/tfjs-training-classfication#4
    var model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [IMAGE_HEIGHT, IMAGE_WIDTH, 1],
          kernelSize: 10,
          filters: 4,
          strides: 1,
          activation: "relu",
          kernelInitializer: "varianceScaling",
        }),
        tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }),
        tf.layers.conv2d({
          kernelSize: 2,
          filters: 2,
          strides: 1,
          activation: "relu",
          kernelInitializer: "varianceScaling",
        }),
        tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 100 }),
        tf.layers.dense({ units: 200 }),
        tf.layers.dense({ units: this.actionSpace }),
      ],
    });
    return model;
  }
}
