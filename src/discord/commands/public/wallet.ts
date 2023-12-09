import { getRegister } from "@/database";
import { Command } from "@/discord/base";
import { reply } from "@/functions";
import { settings } from "@/settings";
import { createEmbedAuthor, hexToRgb } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

new Command({
    name: "carteira",
    description: "Gerencia a carteira do usuário",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "exibir",
            description: "Exibe a carteira do usuário",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "usuário",
                    description: "Mencione algum usuário",
                    type: ApplicationCommandOptionType.User
                }
            ],
        }
    ],
    async run(interaction){
        const { options } = interaction;

        await interaction.deferReply({ ephemeral });
        
        const subCommand = options.getSubcommand(true);

        switch(subCommand){
            case "exibir":{
                const user = options.getUser("usuário") || interaction.user;
                if (user.bot){
                    reply.danger({ interaction, update: true,
                        text: "Bots não tem carteira"
                    });
                    return;
                }
        
                const userData = await getRegister(user);
                const currentCoins = userData.wallet?.coins || 0;
        
                const embed = new EmbedBuilder({
                    author: createEmbedAuthor({ user, prefix: "💰 Carteira de " }),
                    color: hexToRgb(settings.colors.theme.azoxo),
                    description: `${user} tem \`${currentCoins}\` moedas na carteira`,
                });
        
                interaction.editReply({ embeds: [embed] });
                return;
            }
        }
    }
});