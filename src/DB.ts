/**
 * @file Firestore database interface for the llama bot.
 */

import admin from "firebase-admin"
import { Snowflake } from "discord-api-types"

import { Settings, Servers, ServerData } from "./types/llamaBot"

export default class {
	firestoreDB = admin.firestore()

	settings: Settings = {}
	servers: Servers = {}

	async fetchSettings(): Promise<Settings> {
		return this.firestoreDB
			.collection("llama-bot")
			.doc("settings")
			.get()
			.then((doc) => doc.data() as Settings)
	}

	async fetchServerData(serverSnowflake: Snowflake): Promise<ServerData> {
		const result: { [key: string]: FirebaseFirestore.DocumentData } = {}

		const snapshot = await this.firestoreDB
			.collection("llama-bot")
			.doc("servers")
			.collection(serverSnowflake)
			.get()

		snapshot.forEach((doc) => {
			result[doc.id] = doc.data()
		})

		return (this.servers[serverSnowflake] = result as unknown as ServerData)
	}
}
