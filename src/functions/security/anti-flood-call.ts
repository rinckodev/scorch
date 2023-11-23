import { settings } from "@/settings";
import { brBuilder, hexToRgb, sleep, toNull } from "@magicyan/discord";
import { Collection, EmbedBuilder, VoiceState, time, ChannelType } from "discord.js";
import { guildLog } from "../systems/logs";

const members: Collection<string, number> = new Collection();

export async function antiFloodCall(oldState: VoiceState, newState: VoiceState){
    if (oldState.channelId === newState.channelId) return;
    if (!newState.member) return;
    const { member, guild } = newState;

    const getCurrent = () =>  members.get(member.id) || 0;

    const current = getCurrent();
    if (current > 3){
        members.delete(member.id);

        if (member.id !== guild.ownerId) member.timeout(60000).catch(toNull);

        const future = new Date();
        future.setSeconds(future.getSeconds() + 60);

        const color = settings.colors.theme.danger;

        guildLog({
            color, guild: guild,
            executor: newState.client.user,
            message: brBuilder(
                `> ${member} **@${member.user.username}**`,
                "Castigo aplicado por flood em call",
                `Expiração ${time(future, "f")}`
            ),
        });

        const embed = new EmbedBuilder({
            color: hexToRgb(color),
            description: brBuilder(
                "Você recebeu um castigo por entrar e sair de um canal",
                "de voz, repetidamente em um curto período de tempo!",
                "Leia as regras do nosso servidor e evite futuras punições!",
                `O castigo expira ${time(future, "R")}`
            )
        });

        const success = await member.send({ embeds: [embed] }).catch(toNull);
        if (success) {
            await sleep(60_000);
            success.delete().catch(toNull);
            return;
        }

        const channel = guild.channels.cache.find(c => c.name === "geral");
        if (channel?.type !== ChannelType.GuildText) return;

        const message = await channel.send({ content: member.toString(), embeds: [embed] });
        await sleep(60_000);
        message.delete().catch(toNull);
        return;
    }

    members.set(member.id, current + 1);

    setTimeout(() => {
        const current = getCurrent();
        if (current) members.set(member.id, current - 1);
    }, 7000);
}