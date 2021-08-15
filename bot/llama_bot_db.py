from typing import Literal, Union
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

    # saving server-specific data (ex: admin channel, rules message, verified role)
    # key: discord guild snowflake | value: dictionary: next line
    # key: channels, messages, roles | value: list of key value pair data
    vars: dict[
        int,
        dict[
            Union[Literal["channels"], Literal["messages"], Literal["roles"]],
            dict,
        ],
    ] = dict()

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

        self.get_bot_settings()

    def get_vars(
        self, server_id: int
    ) -> dict[
        Union[Literal["channels"], Literal["messages"], Literal["roles"]], list[dict]
    ]:
        server_id = int(server_id)
        self.vars[server_id] = (
            self.get_server(server_id).document(u"vars").get().to_dict()
        )
        return self.vars[server_id]

    def resolve_var(
        self,
        server_id: int,
        data_type: Union[Literal["channels"], Literal["messages"], Literal["roles"]],
        key,
    ):
        """
        channel -> channel_id string
        message -> channel_id/message_id string
        role -> role id
        """
        if data_type not in ["channels", "messages", "roles"]:
            raise Exception(
                "first argument must be either 'channels', 'messages', or 'roles'"
            )

        server_id = int(server_id)
        if server_id not in self.vars:
            self.get_vars(server_id)

        res = self.vars[server_id][data_type][key]

        return res

    def get_bot_settings(self) -> dict:
        """
        Reads global configuration from database.
        Creates one with the default values if it doesn't exist.
        """
        result = self.settings_ref.get().to_dict()
        if not result:
            self.settings_ref.set(
                {
                    u"clear_emojis": [u"🧹"],
                    u"quotes": [
                        u"Paul: Caaaaarrrrrlllll!!!!",
                        u"Carl: And I... I... stabbed him 37 times in the chest!",
                        u"Carl: Well, I kill people and I eat hands! That's—that's two things!",
                        u"Carl: That is what forgiveness sounds like, screaming and then silence.",
                        u"Carl: Probably because I'm a dangerous sociopath with a long history of violence.",
                        u"Carl: I may have created a crack in space time... through which to collect millions of baby hands.",
                        u"Carl: Whities gotta pay... and the payment is baby hands.",
                        u"Paul: CAAAAAAAAARL! WHAT DID YOU DO?",
                        u"Carl: My stomach was making the rumblies - that only hands could satisfy.",
                        u"Paul: What is wrong with you, Carl?",
                        u"Paul: And then you started making out with the ice sculptures.",
                        u"Carl: I will not apologize for art.",
                        u"Carl: Well, I'm building a meat dragon and not just any meat will do.",
                        u"Carl: What's that? It's hard to hear you over the sound of melting city!",
                        u"Carl: Who's laughing? Clearly not all the people who've just exploded.",
                        u"Paul: All you do is kill people, Carl!\n"
                        + "Carl:That's like saying all Mozart did was write songs.",
                        u"Carl: It's not a meat grinder, it's an orphan stomper.",
                        u"Carl: Let me explain: Efficiency, industry, never before has this many dead bodies been so manageable.",
                        u"Carl: I'm the Henry Ford of human meat!",
                        u"""Paul: It's horrifying, Carl.
Carl: Thank you.""",
                    ],
                },
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

    def get_server_document(self, server_id, document_id) -> dict:
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
