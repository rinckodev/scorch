import { db, getRegister } from "@/database";
import { Command } from "@/discord/base";
import { reply } from "@/functions";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

new Command({
    name: "admin",
    description: "Super comando para alterar dados",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    options: [
        {
            name: "moedas",
            description: "Alterar moedas de um usuário",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "usuário",
                    description: "Selecione o usuário que deseja alterar as moedas",
                    type: ApplicationCommandOptionType.User,
                    required,
                },
                {
                    name: "ação",
                    description: "Selecione a ação que deseja fazer",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "+ Adicionar", value: "add" },
                        { name: "= Definir", value: "set" },
                        { name: "- Remover", value: "remove" },
                    ],
                    required,
                },
                {
                    name: "quantidade",
                    description: "Especifique a quantidade de moedas",
                    type: ApplicationCommandOptionType.Number,
                    minValue: 1,
                    required,
                }
            ]
        }
    ],
    async run(interaction){
        const { guild, member, options } = interaction;

        if (member.id !== guild.ownerId){
            reply.danger({ interaction,
                text: "Apenas o proprietário do servidor pode utilizar este comando!"
            });
            return;
        }

        const subCommand = options.getSubcommand(true);

        switch(subCommand){
            case "moedas":{
                await interaction.deferReply({ ephemeral });

                const mention = options.getUser("usuário", true);
                const action = options.getString("ação", true) as "add" | "set" | "remove";
                const amount = options.getNumber("quantidade", true);

                if (mention.bot){
                    reply.danger({ interaction, update: true,
                        text: "Não é possível alterar moedas de um usuário bot!"
                    });
                    return;
                }
                
                const mentionData = await getRegister(mention);
                const currentCoins = mentionData.wallet?.coins || 0;
                switch(action){
                    case "add":{
                        await db.update(db.users, mention.id, {
                            wallet: { coins: (amount + currentCoins) }
                        });
                        break;
                    }
                    case "set":{
                        await db.update(db.users, mention.id, {
                            wallet: { coins: amount }
                        });
                        break;
                    }
                    case "remove":{
                        await db.update(db.users, mention.id, {
                            wallet: { coins: (currentCoins - amount) }
                        });
                        break;
                    }
                }

                const texts = {
                    add: ["adicionadas", "para"],
                    set: ["definidas", "para"],
                    remove: ["removidas", "de"],
                };

                reply.success({ interaction, update: true,
                    text: `Foram ${texts[action][0]} ${amount} moedas ${texts[action][1]} ${mention}`
                });
                return;
            }
        }
    }
});