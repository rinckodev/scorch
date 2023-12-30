import { getRegister } from "@/database";
import { Command, Component } from "@/discord/base";
import { getInventoryMenu, reply } from "@/functions";
import { toNull } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ComponentType } from "discord.js";

new Command({
    name: "inventário",
    description: "Comando de inventário",
    dmPermission,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "exibir",
            description: "Exibe o inventário do usuário",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "usuário",
                    description: "Mencione algum usuário",
                    type: ApplicationCommandOptionType.User
                }
            ],
        },
    ],
    async run(interaction){
        const { options } = interaction;

        await interaction.deferReply({ ephemeral });
        
        const subCommand = options.getSubcommand(true);

        switch(subCommand){
            case "exibir":{
                const member = options.getMember("usuário") || interaction.member;
                if (member.user.bot){
                    reply.danger({ interaction, update: true,
                        text: "Bots não tem inventário"
                    });
                    return;
                }
        
                const memberData = await getRegister(member.user);
                const { embed, row } = getInventoryMenu(member, memberData);
        
                interaction.editReply({ embeds: [embed], components: [row] });
                return;
            }
        }
    }
});

new Component({
    customId: "inventory-refresh-button",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        const { message, guild } = interaction;

        const inventoryMemberId = message.embeds[0].footer?.text || "";
        const inventoryMember = await guild.members.fetch(inventoryMemberId).catch(toNull);

        if (!inventoryMember){
            reply.danger({ interaction, update: true, clear: true,
                text: "Não foi possível localizar o usuário no servidor!" 
            });
            return;
        }

        const walletMemberData = await getRegister(inventoryMember.user);
        const { embed, row } = getInventoryMenu(inventoryMember, walletMemberData);

        interaction.update({ embeds: [embed], components: [row] });
    },
});