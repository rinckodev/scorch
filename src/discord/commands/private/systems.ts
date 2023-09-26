import { db } from "@/database";
import { Command } from "@/discord/base";
import { ApplicationCommandType, ApplicationCommandOptionType, ChannelType } from "discord.js";

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
        }
    ],
    async run(interaction){
        const { options, guild } = interaction;

        await interaction.deferReply({ ephemeral });
        
        switch(options.getSubcommandGroup(true)){
            case "global":{
                switch(options.getSubcommand(true)){
                    case "canal":{
                        const channel = options.getChannel("canal", true);

                        await db.upset(db.guilds, guild.id, {
                            global: { channel: channel.id },
                        });

                        interaction.editReply({
                            content: `O canal padrão do sistema global agora é o ${channel}!`
                        });
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
                }
                return;
            }
            case "logs":{
                switch(options.getSubcommand(true)){
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
        }
    }
});