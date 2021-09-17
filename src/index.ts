import { SapphireClient } from "@sapphire/framework"
import dotenv from "dotenv"
import db from "./db"

dotenv.config()
// do not start the bot if token is not found
if (!process.env.TOKEN) throw Error("Token not found!")
// set to false if not explicitly stated
process.env.TESTING ??= "false"

db.initialize()

const client = new SapphireClient({
	baseUserDirectory: __dirname,
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultPrefix: process.env.TESTING == "true" ? "b-" : "-",
	intents: ["GUILDS", "GUILD_MESSAGES"],
})

// start the  bot
try {
	client.login(process.env.TOKEN)
} catch (error) {
	client.destroy()
	process.exit(1)
}
