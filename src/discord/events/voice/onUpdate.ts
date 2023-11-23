import { Event } from "@/discord/base";
import { antiFloodCall } from "@/functions";

new Event({
    name: "voiceStateUpdate",
    run(oldState, newState) {
        antiFloodCall(oldState, newState);
    },
});