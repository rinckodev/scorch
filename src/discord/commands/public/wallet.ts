import { db, getRegister } from "@/database";
import { Command, Component } from "@/discord/base";
import { getWalletMenu, reply } from "@/functions";
import { settings } from "@/settings";
import { brBuilder, hexToRgb, toNull } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ComponentType, EmbedBuilder, userMention } from "discord.js";

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
        },
        {
            name: "transferir",
            description: "Transfere moedas para um usuário",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "valor",
                    description: "Especifique o valor que deseja transferir",
                    type: ApplicationCommandOptionType.Number,
                    minValue: 1,
                    required
                },
                {
                    name: "usuário",
                    description: "Mencione algum usuário",
                    type: ApplicationCommandOptionType.User,
                    required
                }
            ],
        },
        {
            name: "ranking",
            description: "Exibe uma lista com os top 10 mais ricos",
            type: ApplicationCommandOptionType.Subcommand
        },
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
                const { embed, row } = getWalletMenu(user, userData);
        
                interaction.editReply({ embeds: [embed], components: [row] });
                return;
            }
            case "transferir":{
                const mention = options.getUser("usuário", true);
                const value = options.getNumber("valor", true);
                if (mention.bot){
                    reply.danger({ interaction, update: true,
                        text: "Você não pode transferir moedas para um bot!"
                    });
                    return;
                }
                const { member } = interaction;

                const [memberData, mentionData] = await Promise.all([
                    await getRegister(member.user),
                    await getRegister(mention)
                ]);

                const memberCoins = memberData.wallet?.coins || 0;
                const mentionCoins = mentionData.wallet?.coins || 0;

                if (value > memberCoins){
                    reply.danger({ interaction, update: true, 
                        text: "Você não tem moedas suficientes para essa transferência!"
                    });
                    return;
                }

                await Promise.all([
                    db.update(db.users, member.id, {
                        wallet: { coins: memberCoins - value }
                    }),
                    db.update(db.users, mention.id, {
                        wallet: { coins: mentionCoins + value }
                    })
                ]);
                
                reply.success({ interaction, update: true, 
                    text: `Você transferiu ${value} moedas para ${mention} com sucesso!`
                });
                return;
            }
            case "ranking":{
                const documents = await db.all(db.users);
                const datas = documents.map(({ data, ref }) => ({ data, id: ref.id }));

                const filtered = datas.filter(({ data }) => data.wallet?.coins);
                filtered.sort((a, b) => b.data.wallet!.coins! - a.data.wallet!.coins!);

                const formated = filtered.map(
                    ({ data, id }, index) => `${index+1}°) ${userMention(id)} : **${data.wallet?.coins}** moedas`
                );

                const embed = new EmbedBuilder({
                    color: hexToRgb(settings.colors.theme.info),
                    title: "Ranking de moedas",
                    description: brBuilder(...formated)
                });

                await interaction.editReply({ embeds: [embed] });
                return;
            }
        }
    }
});


new Component({
    customId: "wallet-refresh-button",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        const { message, guild } = interaction;

        const walletMemberId = message.embeds[0].footer?.text || "";
        const walletMember = await guild.members.fetch(walletMemberId).catch(toNull);

        if (!walletMember){
            reply.danger({ interaction, update: true, clear: true,
                text: "Não foi possível localizar o usuário no servidor!" 
            });
            return;
        }

        const walletMemberData = await getRegister(walletMember.user);
        const { embed, row } = getWalletMenu(walletMember.user, walletMemberData);

        interaction.update({ embeds: [embed], components: [row] });
    },
});