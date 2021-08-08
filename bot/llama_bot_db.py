import firebase_admin.firestore

from google.cloud.firestore_v1.client import Client
from google.cloud.firestore_v1.collection import CollectionReference
from google.cloud.firestore_v1.types import WriteResult


class LlamaBotDB:
    """
    Firestore interface for the llama bot.
    More information about firestore can be found here:
    https://firebase.google.com/docs/firestore
    """

    def __init__(self, certificate_path):
        cred = firebase_admin.credentials.Certificate(certificate_path)
        firebase_admin.initialize_app(cred, {"projectId": cred.project_id})

        self.db: Client = firebase_admin.firestore.client()

        # collection reference to the llama bot collection
        self.ref = self.db.collection(u"llama-bot")
        self.servers_ref = self.ref.document(u"servers")
        self.settings_ref = self.ref.document(u"settings")

        # create /llama-bot/servers document if it doesn't exist already
        if not self.servers_ref.get([]).exists:
            self.servers_ref.set({}, merge=True)

    def get_bot_settings(self) -> dict:
        """
        Reads global configuration from database.
        Creates one with the default values if it doesn't exist.
        """
        result = self.settings_ref.get().to_dict()
        if not result:
            self.settings_ref.set(
                {u"clear_emojis": [u"🧹"]},
                merge=True,
            )
            return self.get_bot_settings()

        return result

    def get_server_settings(self, server_id) -> dict:
        ref: CollectionReference = self.servers_ref.collection(u"%s" % server_id)
        result = ref.document(u"settings").get().to_dict()

        if not result:
            self.create_server()
            return self.get_server_settings()

        return result

    def get_server(self, server_id) -> CollectionReference:
        return self.servers_ref.collection(u"%s" % server_id)

    def create_server(self, server_id) -> None:
        """
        create a new server in the database
        """
        ref: CollectionReference = self.servers_ref.collection(u"%s" % server_id)
        ref.document(u"settings").set({"enabled_cogs": []}, merge=True)
        ref.document(u"vars").set(
            {
                "channels": dict(),
                "messages": dict(),
                "roles": dict(),
            },
            merge=True,
        )

    def read_server(self, server_id) -> dict:
        return {doc.id: doc.to_dict() for doc in self.get_server(server_id).stream()}

    def get_document(self, server_id, document_id) -> dict:
        result = (
            self.get_server(server_id).document(u"%s" % document_id).get().to_dict()
        )
        return result if result else dict()

    def write_data(
        self, collection_id, document_id, data_id, data, merge=True
    ) -> WriteResult:
        if not isinstance(data, list):
            data = u"%s" % data

        return (
            self.db.collection(u"%s" % collection_id)
            .document(u"%s" % document_id)
            .set({u"%s" % data_id: u"%s" % data}, merge=merge)
        )

    def delete_data(self, collection_id, document_id, data_id) -> WriteResult:
        return (
            self.db.collection(u"%s" % collection_id)
            .document(u"%s" % document_id)
            .update({u"%s" % data_id: firebase_admin.firestore.DELETE_FIELD})
        )
