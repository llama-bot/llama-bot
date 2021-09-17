/**
 *  Firestore database interface for the llama bot.
 *  More information about firestore can be found here:
 *  https://firebase.google.com/docs/firestore
 */

import { Snowflake } from "discord-api-types"
import admin from "firebase-admin"

import serviceAccountKey from "./secret/firebase-adminsdk.json"

admin.initializeApp({
	credential: admin.credential.cert(serviceAccountKey as admin.ServiceAccount),
})

let firestoreDB = admin.firestore()
let settings: LlamaBotSettings = {}
let servers: LlamaBotServers = {}

async function initialize() {
	await fetchSettings()
}

async function fetchSettings() {
	const doc = await firestoreDB.collection("llama-bot").doc("settings").get()
	settings = doc.data() as LlamaBotSettings
}

async function fetchServerData(serverSnowflake: Snowflake) {
	const result: { [key: string]: FirebaseFirestore.DocumentData } = {}

	const snapshot = await firestoreDB
		.collection("llama-bot")
		.doc("servers")
		.collection(serverSnowflake)
		.get()

	snapshot.forEach((doc) => {
		result[doc.id] = doc.data()
	})

	servers[serverSnowflake] = result as unknown as LlamaBotServerData
}

export default { settings, initialize, fetchSettings }
