const { Worker } = require('worker_threads');
const path = require('path');

// Конфигурация ботов (можно вынести в отдельный файл)
const botsConfig = [
  {
    workerFile: "masha.js"
  },
];

class BotManager {
  constructor() {
    this.workers = new Map();
  }

  startAllBots() {
    botsConfig.forEach((config, index) => {
      this.startBotWorker(config, index + 1);
    });
  }

  startBotWorker(config, botId) {
    const worker = new Worker(path.join(__dirname, config.workerFile), {
      workerData: {
        token: config.token,
        room: config.room,
        botId: botId
      }
    });

    this.workers.set(botId, worker);

    worker.on('message', (msg) => {
      console.log(`[Bot ${botId}]:`, msg);
    });

    worker.on('error', (err) => {
      console.error(`[Bot ${botId} error]:`, err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`[Bot ${botId}] stopped with exit code ${code}`);
        // Автоперезапуск при падении
        setTimeout(() => this.startBotWorker(config, botId), 5000);
      }
    });

    console.log(`[Bot ${botId}] started in room ${config.room}`);
  }

  stopAllBots() {
    this.workers.forEach((worker, botId) => {
      worker.postMessage('shutdown');
      console.log(`[Bot ${botId}] shutdown signal sent`);
    });
  }
}

// Запуск менеджера
const botManager = new BotManager();
botManager.startAllBots();
