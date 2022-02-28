/**
 * @file Database interface for the bot.
 */

import admin from "firebase-admin"
import { Snowflake } from "discord-api-types"
import serviceAccountKey from "./secret/firebase-adminsdk.json"

import { Settings, Servers, ServerData } from "./types/bot"

admin.initializeApp({
	credential: admin.credential.cert(serviceAccountKey as admin.ServiceAccount),
})

const firestoreDB = admin.firestore()

export let settings: Settings = {}
export const servers: Servers = {}

export async function fetchSettings(): Promise<void> {
	settings = await firestoreDB
		.collection("llama-bot")
		.doc("settings")
		.get()
		.then((doc) => doc.data() as Settings)
}

export async function fetchServerData(
	serverSnowflake: Snowflake
): Promise<ServerData> {
	const result: { [key: string]: FirebaseFirestore.DocumentData } = {}

	const snapshot = await firestoreDB
		.collection("llama-bot")
		.doc("servers")
		.collection(serverSnowflake)
		.get()

	snapshot.forEach((doc) => {
		result[doc.id] = doc.data()
	})

	return (servers[serverSnowflake] = result as unknown as ServerData)
}

//
// initialize
//

// todo: make sure settings is fetched before anyone runs a command
fetchSettings()

export default {
	settings,
	servers,
	fetchSettings,
	fetchServerData,
}
