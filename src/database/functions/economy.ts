import { User } from "discord.js";
import { db, getRegister } from "..";

type ManageCoinsAction = "add" | "remove"
export async function manageCoins(user: User, amount: number, action: ManageCoinsAction = "add"){
    const userData = await getRegister(user);
    
    const currentCoins = userData.wallet?.coins || 0;
    const newCoins = action == "add" 
    ? (currentCoins + amount) 
    : (currentCoins - amount);
    
    await db.update(db.users, user.id, {
        wallet: { coins: newCoins }
    });
}