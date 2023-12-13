import { Event } from "@/discord/base";
import { economyChat } from "@/functions";

new Event({
    name: "messageDelete",
    run(message) {
        economyChat.messageDelete(message);
    },
});