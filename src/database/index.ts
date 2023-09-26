import { firebaseAccount } from "@/settings";
import firebase, { credential } from "firebase-admin";
import * as typesaurs from "typesaurus";

import { UserDocument } from "./documents/UserDocument";
import { GuildDocument } from "./documents/GuildDocument";

firebase.initializeApp({ credential: credential.cert(firebaseAccount)});

const db = {
    users: typesaurs.collection<UserDocument>("users"),
    usersKeys: typesaurs.collection<Required<UserDocument>>("users"),
    guilds: typesaurs.collection<GuildDocument>("guilds"),
    guildsKeys: typesaurs.collection<Required<GuildDocument>>("guilds"),
    ...typesaurs,
    async get<Model>(collection: typesaurs.Collection<Model>, id: string){
        return (await typesaurs.get<Model>(collection, id))?.data;
    },
    getFull: typesaurs.get
};

export { db };

export * from "./documents/UserDocument";
export * from "./documents/GuildDocument";

export * from "./functions/register";