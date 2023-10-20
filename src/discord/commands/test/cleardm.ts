import { Command } from "@/discord/base";
import { toNull } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

new Command({
    name: "cleardm",
    description: "Clear dm",
    dmPermission: true,
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        const { user } = interaction;

        interaction.reply({ ephemeral, content: "Dm cleared!"});

        if (user.dmChannel){
            const messages = await user.dmChannel.messages.fetch();
            for(const message of messages.values()){
                message.delete().catch(toNull);
            }
        }
    }
});