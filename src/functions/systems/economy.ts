import { manageCoins } from "@/database";
import { randomNumber } from "@magicyan/discord";
import { Message, PartialMessage } from "discord.js";

const usersInCooldown: Set<string> = new Set();

export const economyChat = {
    messageCreate(message: Message){
        const { author: user } = message;

        if (user.bot) return;

        if (usersInCooldown.has(user.id)) return;

        const randomCoins = randomNumber(2, 10);
        manageCoins(user, randomCoins);
        
        usersInCooldown.add(user.id);
        setTimeout(() => usersInCooldown.delete(user.id), 5000);
    },
    messageDelete(message: Message | PartialMessage){
        const { author: user } = message;

        if (!user || user.bot) return;
    
        manageCoins(user, 10, "remove");
    }
};

