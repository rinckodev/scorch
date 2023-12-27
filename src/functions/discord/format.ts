import { channelMention } from "discord.js";

export function formatedChannelMention(id: string | undefined | null, alt: string = ""){
    return id ? channelMention(id) : alt;
}