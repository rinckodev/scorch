import { Event } from "@/discord/base";
import { registerNewMember, economyChat, levelling } from "@/functions";

new Event({
    name: "messageCreate",
    run(message) {
        const { member } = message;

        if (member) registerNewMember(member);

        levelling.onMessage(message);
        economyChat.messageCreate(message);
    },
});