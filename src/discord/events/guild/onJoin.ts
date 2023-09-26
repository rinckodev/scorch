import { Event } from "@/discord/base";
import { registerNewMember } from "@/functions";

new Event({
    name: "guildMemberAdd",
    run(member) {
        registerNewMember(member);
    },
});