import { UserDocument, db, getRegister, updateUserData } from "@/database";
import { settings } from "@/settings";
import { createEmbedAuthor, findChannel, hexToRgb, randomNumber } from "@magicyan/discord";
import { EmbedBuilder, GuildMember, Message, spoiler } from "discord.js";

const baseXp = 250;
const increment = 30;

function getLevelling(memberData: UserDocument){
    const { inventory } = memberData;
    const level = inventory?.level ?? 0;
    const xp = inventory?.xp ?? 0;
    return { level, xp };
}

function getRequiredXp(memberData: UserDocument){
    const { level } = getLevelling(memberData);
    const requiredXp = baseXp + (level - 1) * increment;
    return requiredXp;
}

async function giveXp(member: GuildMember, amount: number, seconds: number = 0){
    const memberData = await getRegister(member.user);
    const { level, xp } = getLevelling(memberData);
    const requiredXp = getRequiredXp(memberData);

    const newXp = xp + amount;

    if (newXp >= requiredXp){ // level up
        const newLevel = level + 1;
        await updateUserData(member.id, { inventory: { level: newLevel, xp: 0 } });

        const bonusXp = newXp - requiredXp;
        if (bonusXp > 0) giveXp(member, bonusXp, seconds + 3);

        const { channels } = await db.get(db.guilds, member.guild.id) ?? {};
        const channel = findChannel(member.guild).byId(channels?.audit?.id || "");

        const embed = new EmbedBuilder({
            author: createEmbedAuthor({ user: member.user }),
            color: hexToRgb(settings.colors.theme.success),
            description: `${member} subiu para o nível ${newLevel}`
        });

        setTimeout(() => {
            channel?.send({ content: spoiler(member.toString()), embeds: [embed] });
        }, seconds * 1000);

        // 
        // - Adicionar cargos 
        // - Adicionar outros dados
        // - Alterar apelido
        return;
    }

    await updateUserData(member.id, { inventory: { xp: newXp } });
}

async function removeXp(member: GuildMember, amount: number){
    const memberData = await getRegister(member.user);
    const { level, xp } = getLevelling(memberData);

    const newXp = xp - amount;

    if (newXp < 0){
        const newLevel = level - 1;
        await updateUserData(member.id, { inventory: {
            level: (newLevel < 0) ? 0 : newLevel,
            xp: 0
        }});
        return;
    }

    await updateUserData(member.id, { inventory: { xp: newXp }});
}

async function onMessage(message: Message){
    const { member } = message;
    if (!member || member.user.bot) return;

    const amount = randomNumber(1, 5);
    giveXp(member, amount);
}

export const levelling = {
    getLevelling, getRequiredXp, 
    giveXp, removeXp, onMessage
};