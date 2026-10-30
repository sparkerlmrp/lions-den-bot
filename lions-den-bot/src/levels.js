const db = require('./database');

// XP needed to go from `level` to `level + 1`
function xpForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

function getUser(guildId, userId) {
  let row = db.prepare('SELECT * FROM levels WHERE guildId = ? AND userId = ?').get(guildId, userId);
  if (!row) {
    db.prepare('INSERT INTO levels (guildId, userId, xp, level, lastMessageAt) VALUES (?, ?, 0, 0, 0)').run(guildId, userId);
    row = { guildId, userId, xp: 0, level: 0, lastMessageAt: 0 };
  }
  return row;
}

// Adds XP, handles cooldown, returns { leveledUp, newLevel } or null if on cooldown
function addXp(guildId, userId, amount, cooldownSeconds) {
  const user = getUser(guildId, userId);
  const now = Date.now();
  if (now - user.lastMessageAt < cooldownSeconds * 1000) {
    return null;
  }

  let { xp, level } = user;
  xp += amount;
  let leveledUp = false;

  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
    leveledUp = true;
  }

  db.prepare('UPDATE levels SET xp = ?, level = ?, lastMessageAt = ? WHERE guildId = ? AND userId = ?')
    .run(xp, level, now, guildId, userId);

  return { leveledUp, newLevel: level };
}

function getLeaderboard(guildId, limit = 10) {
  return db.prepare('SELECT * FROM levels WHERE guildId = ? ORDER BY level DESC, xp DESC LIMIT ?').all(guildId, limit);
}

function getRank(guildId, userId) {
  const all = db.prepare('SELECT userId FROM levels WHERE guildId = ? ORDER BY level DESC, xp DESC').all(guildId);
  const index = all.findIndex(r => r.userId === userId);
  return index === -1 ? null : index + 1;
}

module.exports = { xpForLevel, getUser, addXp, getLeaderboard, getRank };
