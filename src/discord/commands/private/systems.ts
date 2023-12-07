import { db } from "@/database";
import { Command, Modal } from "@/discord/base";
import { reply } from "@/functions";
import { settings } from "@/settings";
import { brBuilder, createModalInput, createRow, hexToRgb } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType, ChannelType, EmbedBuilder, codeBlock, TextInputStyle, Collection, ButtonBuilder, ButtonStyle } from "discord.js";

const globalActionData: Collection<string, "join" | "leave"> = new Collection();

new Command({
    name: "sistemas",
    description: "Comando de sistemas",
    dmPermission,
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["Administrator"],
    options: [
        {
            name: "global",
            description: "Configurar sistema global",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "canal",
                    description: "Alterar o canal do sistema global",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "canal",
                            description: "Escolha o canal",
                            type: ApplicationCommandOptionType.Channel,
                            channelTypes: [ChannelType.GuildText],
                            required
                        }
                    ],
                },
                {
                    name: "cargo",
                    description: "Alterar o cargo do sistema global",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "cargo",
                            description: "Escolha o cargo",
                            type: ApplicationCommandOptionType.Role,
                            required
                        }
                    ],
                },
                {
                    name: "mensagem",
                    description: "Alterar a mensagem do sistema global",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "ação",
                            description: "Escolha a ação",
                            type: ApplicationCommandOptionType.String,
                            choices: [
                                { name: "Entrar", value: "join" },
                                { name: "Sair", value: "leave" },
                            ],
                            required
                        }
                    ],
                },
                {
                    name: "cor",
                    description: "Alterar a cor da mensagem do sistema global",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "ação",
                            description: "Escolha a ação",
                            type: ApplicationCommandOptionType.String,
                            choices: [
                                { name: "Entrar", value: "join" },
                                { name: "Sair", value: "leave" },
                            ],
                            required
                        },
                        {
                            name: "cor",
                            description: "Digite a cor hexadecimal. Exemplo: #434d88",
                            type: ApplicationCommandOptionType.String,
                            required
                        },
                    ],
                }
            ],
        },
        {
            name: "logs",
            description: "Configurar sistema de logs",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "canal",
                    description: "Alterar o canal do sistema de logs",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "canal",
                            description: "Escolha o canal",
                            type: ApplicationCommandOptionType.Channel,
                            channelTypes: [ChannelType.GuildText],
                            required
                        }
                    ],
                }
            ],
        },
        {
            name: "aplicação-equipe",
            description: "Configurar sistema de aplicação para a equipe",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "canal",
                    description: "Canal onde os formulário serão enviados",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "canal",
                            description: "Selecione o canal",
                            type: ApplicationCommandOptionType.Channel,
                            channelTypes: [ChannelType.GuildText],
                            required
                        }
                    ],
                },
                {
                    name: "setup",
                    description: "Envia o painel de aplicação para a equipe",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "canal",
                            description: "Selecione o canal",
                            type: ApplicationCommandOptionType.Channel,
                            channelTypes: [ChannelType.GuildText],
                            required
                        }
                    ],
                },
            ],
        },
    ],
    async run(interaction){
        const { options, guild, member } = interaction;

        const group = options.getSubcommandGroup(true);
        const subCommand = options.getSubcommand(true);
        
        if (subCommand !== "mensagem"){
            await interaction.deferReply({ ephemeral });
        }
        
        switch(group){
            case "global":{
                switch(subCommand){
                    case "canal":{
                        const channel = options.getChannel("canal", true);

                        await db.upset(db.guilds, guild.id, {
                            global: { channel: channel.id },
                        });

                        reply.success({ interaction, update: true, text: `O canal padrão do sistema global agora é o ${channel}!` });
                        // interaction.editReply({
                        //     content: `O canal padrão do sistema global agora é o ${channel}!`
                        // });
                        return;
                    }
                    case "cargo":{
                        const role = options.getRole("cargo", true);

                        await db.upset(db.guilds, guild.id, {
                            global: { role: role.id }
                        });

                        interaction.editReply({
                            content: `O cargo padrão do sistema global agora é ${role}!`
                        });
                        return;
                    }
                    case "mensagem":{
                        const action = options.getString("ação", true) as "join" | "leave";
                        
                        const current = await db.get(db.guilds, guild.id);

                        globalActionData.set(member.id, action);

                        interaction.showModal({
                            customId: "systems-global-message-modal",
                            title: "Mensagem do sistema global",
                            components: [
                                createModalInput({
                                    customId: "systems-global-message-input",
                                    label: "Mensagem",
                                    placeholder: "Digite a mensagem",
                                    style: TextInputStyle.Paragraph,
                                    value: current?.global?.messages?.[action]
                                })
                            ]
                        });

                        return;
                    }
                    case "cor":{
                        const action = options.getString("ação", true) as "join" | "leave";
                        const color = options.getString("cor", true);

                        const actionDisplay = action == "join" ? "entrar" : "sair";

                        if (isNaN(hexToRgb(color))){
                            interaction.editReply({
                                content: "Você inseriu uma cor inválida! Este comando só aceita cores hexadecimais."
                            });
                            return;
                        }

                        await db.upset(db.guilds, guild.id, {
                            global: { colors: { [action]: color } }
                        });

                        const embed = new EmbedBuilder({
                            color: hexToRgb(color),
                            description: `${hexToRgb(color)}`,
                        });
                        interaction.editReply({
                            content: `Cor da ação de ${actionDisplay} do sistema global foi alterada com sucesso!`,
                            embeds: [embed]
                        });
                        return;
                    }
                }
                return;
            }
            case "logs":{
                switch(subCommand){
                    case "canal":{
                        const channel = options.getChannel("canal", true);

                        await db.upset(db.guilds, guild.id, {
                            logs: { channel: channel.id } 
                        });

                        interaction.editReply({
                            content: `O canal padrão do sistema de logs agora é o ${channel}!`
                        });
                        return;
                    }
                }
                return;
            }
            case "aplicação-equipe":{
                switch(subCommand){
                    case "canal":{
                        const channel = options.getChannel("canal", true);

                        await db.upset(db.guilds, guild.id, {
                            staff: { application: { channel: channel.id } },
                        });

                        interaction.editReply({
                            content: `O canal de formulários de aplicação para a equipe agora é o ${channel}!`
                        });
                        return;
                    }
                    case "setup":{
                        const channel = options.getChannel("canal", true, [ChannelType.GuildText]);

                        const embed = new EmbedBuilder({
                            title: "Aplicação para a equipe",
                            color: hexToRgb(settings.colors.theme.primary),
                            description: brBuilder(
                                "Clique no botão abaixo para iniciar o",
                                "formulário de aplicação para a equipe",
                                "do nosso servidor!",
                                "",
                                "Após isso, nossa equipe estará analizando",
                                "e retornando uma resposta assim que possível!"
                            )
                        });

                        const row = createRow(
                            new ButtonBuilder({
                                customId: "staff-form-start-button",
                                label: "Aplicar",
                                style: ButtonStyle.Primary,
                                emoji: "✋"
                            })
                        );

                        channel.send({embeds: [embed], components: [row]})
                        .then(message => {
                            interaction.editReply({
                                content: `Mensagem enviada com sucesso! ${message.url}`
                            });
                        })
                        .catch(err => {
                            interaction.reply({
                                content: `Não foi possível enviar a mensagem ${codeBlock("bash", err)}`
                            });
                        });
                    }
                }
                return;
            }
        }
    }
});

new Modal({
    customId: "systems-global-message-modal",
    cache: "cached",
    async run(interaction) {
        const { member, fields, guild } = interaction;

        const action = globalActionData.get(member.id);
        if (!action){
            reply.danger({ interaction, text: brBuilder(
                "Não foi possível achar os dados iniciais!",
                "Utilize o comando novamente."
            ) });
            return;
        }
        await interaction.deferReply({ ephemeral });

        const message = fields.getTextInputValue("systems-global-message-input");

        await db.upset(db.guilds, guild.id, {
            global: { messages: { [action]: message } }
        });

        const text = action === "join" ? "entrada" : "saída";

        reply.success({ interaction, update: true, text: `A mensagem de ${text} do sistema global foi alterada!` });
    },
});