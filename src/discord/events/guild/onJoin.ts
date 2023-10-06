import { Event } from "@/discord/base";
import { globalMessage, registerNewMember } from "@/functions";

new Event({
    name: "guildMemberAdd",
    run(member) {
        registerNewMember(member);
        globalMessage({ member, action: "join" });
    },
});