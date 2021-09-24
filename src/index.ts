import { SapphireClient } from "@sapphire/framework"
import dotenv from "dotenv"
import nekosClient from "nekos.life"
import admin from "firebase-admin"

import serviceAccountKey from "./secret/firebase-adminsdk.json"
import DB from "./DB"

admin.initializeApp({
	credential: admin.credential.cert(serviceAccountKey as admin.ServiceAccount),
})

dotenv.config()
// do not start the bot if token is not found
if (!process.env.TOKEN) throw Error("Token not found!")
// set to default values if not defined already
process.env.TESTING ??= "false"
process.env.PREFIX_PROD ??= "-"
process.env.PREFIX_DEV ??= "b-"

process.env.PREFIX =
	process.env.TESTING == "true"
		? process.env.PREFIX_DEV
		: process.env.PREFIX_PROD

const client = new SapphireClient({
	baseUserDirectory: __dirname,
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultPrefix: process.env.PREFIX,
	intents: ["GUILDS", "GUILD_MESSAGES"],
})

client.nekosClient = new nekosClient()
client.db = new DB()

// start the  bot
try {
	client.login(process.env.TOKEN)
} catch (error) {
	client.destroy()
	process.exit(1)
}
