import { UserDocument } from "@/database";
import { settings } from "@/settings";
import { brBuilder, createEmbedAuthor, createRow, hexToRgb } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember } from "discord.js";
import { levelling } from "../systems/levelling";

export function getInventoryMenu(member: GuildMember, memberData: UserDocument){
    const { level, xp } = levelling.getLevelling(memberData);
    const requiredXp = levelling.getRequiredXp(memberData);
    
    const embed = new EmbedBuilder({
        author: createEmbedAuthor({ user: member.user, prefix: "🎒 Inventário de " }),
        color: hexToRgb(settings.colors.theme.warning),
        description: `> ${member.roles.highest} ${member}`,
        fields: [
            {
                name: "\u200b", value: brBuilder(
                    `Nível: \` ${level} \``,
                    `Xp: \` ${xp}/${requiredXp} \``
                )
            }
        ],
        footer: { text: member.id }
    });
    
    const row = createRow(
        new ButtonBuilder({
            customId: "inventory-refresh-button",
            label: "Atualizar",
            style: ButtonStyle.Success,
        })
    );

    return { embed, row };
}