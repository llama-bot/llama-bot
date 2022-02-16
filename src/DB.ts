/**
 * @file Database interface for the llama bot.
 * Currently using firebase firestore but will be replaced with redis in the future.
 */

import admin from "firebase-admin"
import { Snowflake } from "discord-api-types"
import serviceAccountKey from "./secret/firebase-adminsdk.json"

import { Settings, Servers, ServerData } from "./types/llamaBot"

admin.initializeApp({
	credential: admin.credential.cert(serviceAccountKey as admin.ServiceAccount),
})

export const firestoreDB = admin.firestore()

export const settings: Settings = {}
export const servers: Servers = {}

export async function fetchSettings(): Promise<Settings> {
	return firestoreDB
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

export default {
	firestoreDB,
	settings,
	servers,
	fetchSettings,
	fetchServerData,
}
