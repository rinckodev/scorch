import { db } from "@/database";
import { settings } from "@/settings";
import { brBuilder, createEmbedAuthor, hexToRgb, textReplacer } from "@magicyan/discord";
import { ChannelType, EmbedBuilder, GuildMember, PartialGuildMember, TimestampStyles, time, userMention } from "discord.js";

interface GlobalMessageJoinProps {
    member: GuildMember,
    action: "join"
}
interface GlobalMessageLeaveProps {
    member: GuildMember | PartialGuildMember,
    action: "leave"
}
type GlobalMessageProps = GlobalMessageJoinProps | GlobalMessageLeaveProps

const defaults = {
    messages: {
        join: "${member} acabou de entrar no servidor!",
        leave: "${member} acabou de sair do servidor!"
    },
    colors: {
        join: settings.colors.theme.success,
        leave: settings.colors.theme.danger,
    }
};

export async function globalMessage({ member, action }: GlobalMessageProps){
    const { guild, user } = member;

    const guildData = await db.get(db.guilds, guild.id);
    if (!guildData) return;

    const channel = guild.channels.cache.get(guildData.global?.channel || "");
    if (channel?.type !== ChannelType.GuildText) return;
    
    const color = guildData.global?.colors?.[action] || defaults.colors[action];
    const text = guildData.global?.messages?.[action] || defaults.messages[action];

    const description = brBuilder(
        textReplacer(text, {
            "${member}": userMention(member.id),
            "${member.displayName}": member.displayName,
            "${member.user.username}": member.user.username,
            "${member.user.globalName}": member.user.globalName,
            "${member.id}": member.id,
            "${guild.name}": guild.name,
            "${guild.id}": guild.id,
            "${guild.membersCount}": guild.memberCount,
        }),
        time(new Date(), TimestampStyles.ShortDateTime)
    );

    const suffix = (action == "join") ? " entrou no servidor!" : " saiu do servidor!";

    const embed = new EmbedBuilder({
        author: createEmbedAuthor({ user, suffix }),
        description, thumbnail: { url: member.displayAvatarURL() },
        color: hexToRgb(color),
    });

    channel.send({ embeds: [embed] });
}