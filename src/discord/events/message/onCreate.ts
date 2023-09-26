import { Event } from "@/discord/base";
import { registerNewMember } from "@/functions";

new Event({
    name: "messageCreate",
    run(message) {
        const { member } = message;

        if (member) registerNewMember(member);
    },
});