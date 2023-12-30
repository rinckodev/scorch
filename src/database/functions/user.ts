import { db } from "..";
import { UserDocument } from "../documents/UserDocument";

type PartialUserDocument = DeepPartial<UserDocument>

export async function updateUserData(id: string, data: PartialUserDocument){
    await db.upset(db.collection("users"), id, data);
}