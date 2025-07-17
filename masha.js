const { Highrise, Events, Facing, Emotes, GoldBars } = require("highrise.sdk.dev");
// const { GoldBars } = require("highrise.sdk");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const token = "8115e4bb579acdca207321848a4c3f3eaca0133d3bd6c5acc14b62695e07261e";
const room = "68529363d23340447bc0b10c";
const ownerID = "https://high.rs/room?id=68529363d23340447bc0b10c&invite_id=6878f0cda2765ebef404143f"

const userCord = new Map

const bot = new Highrise({
  Events: [Events.Messages, Events.Movements, Events.Leaves, Events.DirectMessages, Events.Joins, Events.Tips],
  AutoFetchMessages: true,
  Cache: true
});

  setInterval(() => {
    bot.message.send("ЛЮДИ НЕ ПОПРОШАЙНИЧАТЬ БУДЬТЕ ТЕРПИЛИВЫМИ ЕСЛИ ВЫ НЕ ТЕРПЕЛИВЫ ТО БУДЕТЕ КИКНУТЫ С РУМЫ ЗАДАВАТЬ ГЛУПЫЕ ВОПРОСЫ ПО ТИПУ А ТУТ ЧЕ РАЗДАЧА - КИК ЧИТАЙТЕ НАЗВАНИЕ РУМЫ ЛС СОЗДАТЕЛЬНИЦЫ МУСОРОМ НЕ ЗАСОРЯТЬ РЕКЛАМА СВОИХ РУМ ЗАПРЕЩЕНА").catch(console.error);
  }, 120000)

bot.on("ready", () => {
  bot.move.walk(18.5, 2, 1.5, Facing.FrontLeft)
})

bot.on("playerTip", async (sender, receiver, tip) => {
  const balance = await bot.wallet.gold.get().catch(console.error)
})

bot.on("chatCreate", async (user, message) => {
  const msg = message.toLowerCase();
  console.log(`${user.username}: ${msg}`)
  if (user.id != "67a2b617a337e1b57da53360" && user.id != '6370bcc817c7908be2648aef') return
  console.log(`[CHAT]: ${user.username}:${user.id} - ${message}`);
  console.log(await bot.room.players.get())
  if (msg === 'баланс' || msg === 'бал') {
    const balance = await bot.wallet.gold.get().catch(console.error)
    bot.message.send(`баланс - ${balance}`).catch(console.error);
    return
  }

  // if (msg === 'ой') {
  //    bot.player.teleport('6878e7decf32433a6c6f14ef', 1, 40, 0, Facing.FrontLeft).catch(e => console.error(e));
  // }

  const price = extractNumberFromString(msg)
  if (price !== 0) {
    try {
        const balance = await bot.wallet.gold.get();
        console.log('Current balance:', balance);
        
        if (!balance) {
            console.error('Failed to get balance');
            return;
        }

        const players = await bot.room.players.get();
        if (!players || !players.length) {
            console.error('No players found');
            return;
        }

        const playerIDs = players.map(item => item[0].id);
        const totalPlayers = playerIDs.length;

        // Проверка баланса и отправка чаевых
        let barType, requiredAmount;
        
        switch(price) {
            case 1:
                barType = GoldBars.BAR_1;
                requiredAmount = totalPlayers * 2;
                break;
            case 5:
                barType = GoldBars.BAR_5;
                requiredAmount = totalPlayers * 6;
                break;
            case 10:
                barType = GoldBars.BAR_10;
                requiredAmount = totalPlayers * 11;
                break;
            default:
                console.error('Invalid price value');
                return;
        }

        if (balance < requiredAmount) {
            await bot.message.send(`Не хватает золота! Баланс: ${balance}, требуется: ${requiredAmount}`);
            return;
        }

        // Отправка чаевых всем игрокам
let successCount = 0;
let failedCount = 0;

for (const id of playerIDs) {
  if (id === '6370bcc817c7908be2648aef') continue
    try {
        await bot.player.tip(id, barType);
        console.log(`Sent tip to ${id}`);
        successCount++;
    } catch (error) {
        console.error(`Failed to tip player ${id}:`, error);
        failedCount++;
    }
}

// Отправляем итоговое сообщение
try {
  await bot.message.send(`✅ Успешно отправлены чаевые всем ${successCount} игрокам!`);
    
} catch (error) {
    console.error('Failed to send result message:', error);
}

    } catch (error) {
        console.error('Error in tipping process:', error);
    }
}
})

function extractNumberFromString(inputString) {
  try {
    // Проверяем что это строка и не пустая
    if (typeof inputString !== 'string' || inputString.trim() === '') return 0;
    
    // Строгая проверка формата "тип 123"
    const match = inputString.match(/^тип\s(\d+)$/);
    if (!match) return 0;
    
    // Парсим число
    const number = parseInt(match[1], 10);
    return isNaN(number) ? 0 : number;
    
  } catch {
    return 0;
  }
}

bot.on("playerMove", async (user, position) => {
  // console.log(position.x, position.y, position.z)

  if (position.entity_id) {
    userCord.set(user.id, position)
    return
  }

  if (userCord.has(user.id)) {
    const pos = userCord.get(user.id)
    const distance = getDistance(pos.x, pos.z, position.x, position.z)
    if (Math.abs(pos.y - position.y) > 5 || distance > 10) {
      await tp(bot, user.id, position.x, position.y, position.z)
    }
  } else {
    await tp(bot, user.id, position.x, position.y, position.z)
  }
  userCord.set(user.id, position)

});

async function tp(bot, id, x, y, z) {
  userCord.set(id, {x: x, y: y, z: z})
  await bot.player.teleport(id, x, y, z, Facing.FrontLeft).catch(console.error);
}

function getDistance(x1, z1, x2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dz * dz);
}


bot.login(token, room);