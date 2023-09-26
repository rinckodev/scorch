import { User } from "discord.js";
import { UserDocument, db } from "..";

export async function hasRegister(id: string){
    const data = await db.get(db.users, id);
    return !!data;
}
export async function createRegister({ username, id }: User){
    await db.set(db.users, id, { username });
    return await db.get(db.users, id) as UserDocument;
}
export async function getRegister(user: User){
    const data = await db.get(db.users, user.id);
    if (data) return data;
    return createRegister(user);
}