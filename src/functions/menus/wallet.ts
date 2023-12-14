import { UserDocument } from "@/database";
import { settings } from "@/settings";
import { createEmbedAuthor, createRow, hexToRgb } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, User } from "discord.js";

export function getWalletMenu(user: User, userData: UserDocument){
    const currentCoins = userData.wallet?.coins || 0;
    
    const embed = new EmbedBuilder({
        author: createEmbedAuthor({ user, prefix: "💰 Carteira de " }),
        color: hexToRgb(settings.colors.theme.azoxo),
        description: `${user} tem \`${currentCoins}\` moedas na carteira`,
        footer: { text: user.id }
    });
    
    const row = createRow(
        new ButtonBuilder({
            customId: "wallet-refresh-button",
            label: "Atualizar",
            style: ButtonStyle.Success,
            emoji: "🔄"
        })
    );

    return { embed, row };
}