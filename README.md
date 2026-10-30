# Lion's Den Discord Bot

A full-featured Discord bot built with **discord.js v14**. It includes:

- **Moderation** — `/warn`, `/warnings`, `/clearwarnings`, `/timeout`, `/kick`, `/ban`, `/unban`, `/clear`, plus automatic deletion of banned words and mass-mention spam.
- **Leveling** — members earn XP for chatting, with `/rank` and `/leaderboard`, and a level-up announcement.
- **Welcome system** — greets new members in a configurable channel and can auto-assign a role.
- **Ticket system** — `/ticket-panel` posts a button that opens a private support channel per member, with a Close Ticket button.
- **Utility & fun** — `/ping`, `/userinfo`, `/serverinfo`, `/avatar`, `/poll`, `/8ball`, `/coinflip`, `/roll`, `/rps`.
- **`/setup`** — configure the welcome channel, auto-role, ticket category, and support role from inside Discord (no code editing needed).

All data (warnings, XP, settings, tickets) is stored in a local SQLite file (`bot.sqlite`) — no external database required.

---

## 1. Create the bot application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** → name it (e.g. "Lion's Den Bot").
2. Go to **Bot** (left sidebar) → **Reset Token** → copy it. This is your `DISCORD_TOKEN`. Keep it secret.
3. On the same page, under **Privileged Gateway Intents**, enable:
   - **Server Members Intent**
   - **Message Content Intent**
4. Go to **OAuth2 → General** and copy the **Application (Client) ID**. This is your `CLIENT_ID`.
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Administrator` is simplest for a first setup, or at minimum: Manage Roles, Manage Channels, Kick Members, Ban Members, Moderate Members, Manage Messages, Send Messages, Read Message History, Add Reactions, View Channels.
   - Copy the generated URL, open it, and invite the bot to your Lion's Den server.
6. In Discord, enable **Developer Mode** (User Settings → Advanced), then right-click your server icon → **Copy Server ID**. This is your `GUILD_ID`.

## 2. Configure the project

1. Rename `.env.example` to `.env`.
2. Fill in `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID`.
3. (Optional) Edit `config.json` to change colors, XP rate, the banned-word list, or the default welcome message. Everything in `config.json` can also be overridden per-server with `/setup` once the bot is running, except the banned words and XP rate.

## 3. Install & run locally (to test before hosting)

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run deploy   # registers the slash commands to your server — run this once, and again whenever you add/edit commands
npm start        # starts the bot
```

If `/warn`, `/ping`, etc. don't show up in Discord, wait a minute (guild commands can take a moment) or restart your Discord client.

## 4. First-time setup inside Discord

Once the bot is online and invited:

- `/setup welcome-channel channel:#welcome` — where new-member greetings post
- `/setup auto-role role:@Member` — role given automatically to new joiners (optional)
- `/setup ticket-category category:Tickets` — category new ticket channels are created under (create this category first)
- `/setup support-role role:@Support` — role that can see new tickets
- `/ticket-panel` — run this in whatever channel you want the "Open Ticket" button to live

## 5. Free hosting (so it runs 24/7 without your PC on)

A few realistic free-tier options as of late 2026 — availability and limits change, so check each provider's current terms before committing:

- **Render** (render.com) — free "Background Worker" / web service tier. You'll need a tiny `Keep-Alive`-style workaround isn't needed for background workers, but free web services sleep when idle — a background worker type avoids that.
- **Railway** (railway.app) — offers limited free trial credit, then paid; good if you just want to test before committing to a cheap plan (~$5/mo covers a bot easily).
- **Fly.io** — has a free usage allowance that can cover a small always-on bot.
- **Your own PC / a Raspberry Pi** — genuinely free and simplest if you have something that can stay on. Use a process manager like [PM2](https://pm2.keymetrics.io/) (`npm install -g pm2` then `pm2 start index.js --name lions-den-bot`) so it restarts automatically if it crashes or the machine reboots.

Whichever you pick, the deploy steps are the same: upload the project (minus `node_modules` and `.env`), set `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID` as **environment variables** in the host's dashboard (don't upload your `.env` file), then set the start command to `npm install && npm run deploy && npm start` (or install/deploy once, then just `npm start`).

## Project structure

```
lions-den-bot/
├── index.js              # bot entry point — loads commands & events
├── deploy-commands.js    # registers slash commands with Discord
├── config.json           # server-wide defaults (colors, XP rate, banned words...)
├── .env.example          # copy to .env and fill in your token/IDs
├── src/
│   ├── database.js       # SQLite connection + schema
│   └── levels.js         # XP/leveling math
├── events/                # Discord.js event listeners
├── commands/
│   ├── moderation/
│   ├── leveling/
│   ├── utility/
│   └── fun/
```

## Adding your own commands

Drop a new file in the right `commands/` subfolder exporting `{ data, execute }` (copy any existing command as a template), then run `npm run deploy` again.
