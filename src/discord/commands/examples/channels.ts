import { Command, Component } from "@/discord/base";
import { createPagination } from "@/functions";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { ApplicationCommandType, ChannelSelectMenuBuilder, ComponentType, GuildBasedChannel, time } from "discord.js";

new Command({
    name: "canais",
    description: "Lista todos os canais selecionados",
    dmPermission,
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        const row = createRow(
            new ChannelSelectMenuBuilder({
                customId: "example-channel-select",
                placeholder: "Selecione os canais que deseja",
                maxValues: 25,
            })
        );

        interaction.reply({ ephemeral, components: [row] });
    }
});

new Component({
    customId: "example-channel-select",
    type: ComponentType.ChannelSelect, cache: "cached",
    async run(interaction) {
        const { member, guild, values } = interaction;

        const channels = values.map(id => guild.channels.cache.get(id)) as GuildBasedChannel[];

        createPagination({
            embeds: channels.map(channel => createEmbed({
                title: channel.name,
                color: "Random",
                description: brBuilder(
                    `> ${channel} **${channel.name}**`,
                    `> Categoria ${channel.parent?.name?? "`Nenhuma`"}`,
                    `> Canal criado em ${time(channel.createdAt??new Date(), "F")}`
                )
            })),
            render: (embeds, components) => interaction.update({
                fetchReply, embeds, components
            }),
            filter(interaction) {
                const isExecutor = interaction.user.id === member.id;
                if (!isExecutor) interaction.deferUpdate();
                return isExecutor;
            },
            onUpdate(embed, index, length) {
                embed.setFooter({ text: `Página ${index+1}/${length}` });
            }
        });
        
    },
});