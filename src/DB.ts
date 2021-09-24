/**
 *  Firestore database interface for the llama bot.
 *  More information about firestore can be found here:
 *  https://firebase.google.com/docs/firestore
 */

import { Snowflake } from "discord-api-types"
import admin from "firebase-admin"

export default class {
	firestoreDB = admin.firestore()
	settings: LlamaBotSettings = {}
	servers: LlamaBotServers = {}

	async fetchSettings() {
		const doc = await this.firestoreDB
			.collection("llama-bot")
			.doc("settings")
			.get()
		this.settings = doc.data() as LlamaBotSettings
	}

	async fetchServerData(serverSnowflake: Snowflake) {
		const result: { [key: string]: FirebaseFirestore.DocumentData } = {}

		const snapshot = await this.firestoreDB
			.collection("llama-bot")
			.doc("servers")
			.collection(serverSnowflake)
			.get()

		snapshot.forEach((doc) => {
			result[doc.id] = doc.data()
		})

		this.servers[serverSnowflake] = result as unknown as LlamaBotServerData
	}
}
