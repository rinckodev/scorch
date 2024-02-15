import { Command } from "@/discord/base";
import { createPagination } from "@/functions";
import { brBuilder, createEmbed, createEmbedAsset } from "@magicyan/discord";
import { ApplicationCommandType, embedLength } from "discord.js";

new Command({
    name: "membros",
    description: "Listar todos os membros do servidor",
    dmPermission,
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        const { member, guild } = interaction;

        createPagination({
            embeds: guild.members.cache.map(member => createEmbed({
                title: member.displayName,
                color: member.displayColor,
                description: brBuilder(
                    `> ${member} **@${member.user.username}**`,
                    `> Cargo ${member.roles.highest}`
                ),
                thumbnail: createEmbedAsset(member.displayAvatarURL())
            })),
            render: (embeds, components) => interaction.reply({
                fetchReply, ephemeral, embeds, components
            }),
            filter(interaction) {
                const isExecutor = interaction.user.id === member.id;
                if (!isExecutor) interaction.deferUpdate();
                return isExecutor;
            },
            onUpdate(embed, index, length) {
                embed.setFooter({ text: `Página ${index+1}/${length}` });
            },
            onEnd: () => interaction.deleteReply(),
            time: 10_000,
            onTimeout: () => interaction.editReply({ content: "Tempo esgotado", embeds: [], components: [] })
        });
    }
});