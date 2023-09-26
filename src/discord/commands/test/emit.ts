import { Command } from "@/discord/base";
import { ApplicationCommandOptionType, ApplicationCommandType, Events, GuildMember } from "discord.js";

export default new Command({
    name: "emit",
    description: "Emit a discord.js event",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: Events.GuildMemberAdd.toLowerCase(),
            description: `Emit a ${Events.GuildMemberAdd} event`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "member",
                    description: "Select a member",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                }
            ]
        },
        {
            name: Events.GuildMemberRemove.toLowerCase(),
            description: `Emit a ${Events.GuildMemberRemove} event`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "member",
                    description: "Select a member",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                }
            ]
        }
    ],
    async run(interaction){
        const { options, client } = interaction;

        const selectedEvent = options.getSubcommand(true);

        switch(selectedEvent){
            case Events.GuildMemberAdd.toLocaleLowerCase():{
                const mention = options.getMember("member") as GuildMember;

                client.emit("guildMemberAdd", mention);

                interaction.reply({ ephemeral: true,
                    content: "guildMemberAdd event emited"
                });
                return;
            }
            case Events.GuildMemberRemove.toLowerCase():{
                const mention = options.getMember("member") as GuildMember;

                client.emit("guildMemberRemove", mention);

                interaction.reply({ ephemeral: true,
                    content: "$guildMemberRemove event emited"
                });
                return;
            }
        }

    }
});