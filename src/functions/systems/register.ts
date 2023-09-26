import { createRegister, db, hasRegister } from "@/database";
import { GuildMember, bold } from "discord.js";
import { guildLog } from "./logs";
import { brBuilder } from "@magicyan/discord";
import { settings } from "@/settings";

export async function registerNewMember(member: GuildMember){
    const { client, guild, user } = member;
    
    if (user.bot) return;

    db.get(db.guilds, guild.id)
    .then((data) => {
        const roleId = data?.global?.role || "";
        if (
            !guild.roles.cache.has(roleId)
            || member.roles.cache.has(roleId)
        ) return;
        member.roles.add(roleId);
    });

    if (await hasRegister(user.id)) return;
    await createRegister(user);
    
    guildLog({
        guild,
        executor: client.user,
        author: { name: "Sistema de registro", iconURL: user.displayAvatarURL() },
        message: brBuilder(
            "Novo membro registrado",
            `> ${member} ${bold(`@${user.username}`)}`
        ),
        color: settings.colors.theme.success,
    });
}