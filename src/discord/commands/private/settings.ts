import { GuildDocument, db } from "@/database";
import { Command, Component } from "@/discord/base";
import { formatedChannelMention } from "@/functions";
import { settings } from "@/settings";
import { brBuilder, createEmbedAsset, createRow, hexToRgb } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ComponentType, EmbedBuilder, Guild, InteractionType, StringSelectMenuBuilder, StringSelectMenuComponentData, StringSelectMenuOptionBuilder, bold } from "discord.js";

new Command({
    name: "configurações",
    description: "Comando de configurações",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        const { guild } = interaction;
        
        const { embed, row } = menus().main(guild);
        interaction.reply({ ephemeral, embeds: [embed], components: [row] });
    }
});

new Component({
    name: "Settings main buttons",
    customId: id => id.startsWith("settings-button-"),
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        const { customId, guild } = interaction;

        const button = customId.replace("settings-button-", "");

        await interaction.deferUpdate();

        const guildData = await db.get(db.guilds, guild.id) ?? {};

        switch(button){
            case "mainmenu": {
                const { embed, row } = menus().main(guild);
                interaction.editReply({ embeds: [embed], components: [row] });
                return;
            }
            case "channels":{
                const { embed, row, menuRow } = menus().channels(guildData);
                interaction.editReply({ embeds: [embed], components: [row, menuRow] });
                return;
            }
        }

        if (button.startsWith("previous-")){
            const previous = button.replace("previous-", "");

            switch(previous){
                case "channels":{
                    const { embed, row, menuRow } = menus().channels(guildData);
                    interaction.editReply({ embeds: [embed], components: [row, menuRow] });
                    return;
                }
            }
        }
    }
});

new Component({
    name: "System settings selects",
    customId: id => id.startsWith("settings-select-"), 
    type: ComponentType.StringSelect, cache: "cached",
    async run(interaction) {
        const { customId, values:[selected], guild } = interaction;
        const select = customId.replace("settings-select-", "");

        switch(select){
            case "channels":{
                const { label, emoji } = data().channels.options.find(c => c.value == selected)!;

                const embed = new EmbedBuilder({
                    color: hexToRgb(settings.colors.theme.primary),
                    description: `Selecione o canal que deseja definir para ${emoji} **${label}**`
                });

                const row = createRow(new ChannelSelectMenuBuilder({
                    customId: "settings-channel-local-select",
                    placeholder: "Selecione o canal",
                    channelTypes: [ChannelType.GuildText]
                }));

                const menuRow = createRow(
                    menus().buttons().previousMenu("channels"),
                    menus().buttons().mainMenu
                );

                const message = await interaction.update({ fetchReply, embeds: [embed], components: [row, menuRow] });

                const collector = message.createMessageComponentCollector();
                collector.on("collect", async subInteraction => {
                    collector.stop();
                    if (subInteraction.componentType !== ComponentType.ChannelSelect) return;
                    
                    await subInteraction.deferUpdate();
                    
                    const selectedChannelId = subInteraction.values[0];
                    const channelName = selected as "audit" | "logs";

                    await db.upset(db.guilds, guild.id, {
                        channels: { [channelName]: { id: selectedChannelId } }
                    });

                    const guildData = await db.get(db.guilds, guild.id) ?? {};

                    const { embed, row, menuRow } = menus().channels(guildData);
                    subInteraction.editReply({ embeds: [embed], components: [row, menuRow] });
                });
                return;
            }
        }
    },
});

function data(){
    return {
        channels: {
            options: [
                { label: "Logs", value: "logs", emoji: "📃" },
                { label: "Auditoria", value: "audit", emoji: "📋" },
                { label: "Global", value: "global", emoji: "🌏" },
            ]
        }
    };
}

function menus(){
    return {
        buttons(){
            return {
                mainMenu: new ButtonBuilder({
                    customId: "settings-button-mainmenu",
                    label: "Menu principal",
                    style: ButtonStyle.Danger,
                }),
                previousMenu: (currentMenu: string) => new ButtonBuilder({
                    customId: `settings-button-previous-${currentMenu}`,
                    label: "Voltar",
                    style: ButtonStyle.Danger,
                })
            };
        },
        main(guild: Guild){
            const embed = new EmbedBuilder({
                color: hexToRgb(settings.colors.theme.primary),
                thumbnail: createEmbedAsset(guild.iconURL()),
                description: brBuilder(
                    "## Painel de configurações",
                    `Servidor: ${guild.name}`,
                    `Canais: ${guild.channels.cache.size}`,
                    `Cargos: ${guild.roles.cache.size}`,
                    `Membros: ${guild.memberCount}`,
                )
            });
    
            const row = createRow(
                new ButtonBuilder({
                    customId: "settings-button-channels",
                    label: "Canais",
                    style: ButtonStyle.Primary
                })
            );

            return { embed, row };
        },
        channels(guildData: GuildDocument){
            const channels = guildData.channels ?? {};
            const displayChannels = data().channels.options.map(
                ({ emoji, label, value }) => {
                    const channelId = channels[value as keyof typeof channels]?.id;
                    const text = formatedChannelMention(channelId, "`Não definido`");
                    return `- ${emoji} ${label} ${text}`;
                }
            );

            const embed = new EmbedBuilder({
                color: hexToRgb(settings.colors.theme.primary),
                description: brBuilder(
                    "## Configurar canais",
                    "",
                    ...displayChannels
                )
            });

            const row = createRow(new StringSelectMenuBuilder({
                customId: "settings-select-channels",
                placeholder: "Selecione qual canal deseja definir",
                options: data().channels.options
            }));

            const menuRow = createRow(
                menus().buttons().mainMenu
            );

            return { embed, row, menuRow };
        }
    };
}