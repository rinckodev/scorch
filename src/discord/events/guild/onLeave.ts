import { Event } from "@/discord/base";
import { globalMessage } from "@/functions";

new Event({
    name: "guildMemberRemove",
    run(member) {
        globalMessage({ member, action: "leave" });
    },
});