import { SapphireClient } from "@sapphire/framework"
import dotenv from "dotenv"
import nekosClient from "nekos.life"
import admin from "firebase-admin"
import { start as startPrettyError } from "pretty-error"

import serviceAccountKey from "./secret/firebase-adminsdk.json"
import DB from "./DB"

function initializeEnv() {
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
}

function initializeFirebaseAdmin() {
	admin.initializeApp({
		credential: admin.credential.cert(
			serviceAccountKey as admin.ServiceAccount
		),
	})
}

function initialize() {
	startPrettyError()
	initializeEnv()
	initializeFirebaseAdmin()
}

initialize()

export const globalObject = {
	startTime: 0,
	nekosClient: new nekosClient(),
	db: new DB(),
}

export const client = new SapphireClient({
	baseUserDirectory: __dirname,
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultPrefix: process.env.PREFIX,
	intents: ["GUILDS", "GUILD_MESSAGES"],
})

//
// start the  bot
//

try {
	client.login(process.env.TOKEN)
} catch (err) {
	console.log("The bot crashed :(")
	console.error(err)

	client.destroy()
}
