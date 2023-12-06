import { Command } from "@/discord/base";
import { fetchMinecraftServerStatus, reply } from "@/functions";
import { settings } from "@/settings";
import { brBuilder, createRow, hexToRgb } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock, inlineCode } from "discord.js";
import { RenderCrops, RenderTypes, fetchSkinInfo, fetchSkinRender } from "starlightskinapi";

new Command({
    name: "minecraft",
    description: "Comando de minecraft",
    dmPermission,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "servidores",
            description: "Comando de servidores de minecraft",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "status",
                    description: "Verificar status de um servidor",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "ip",
                            description: "Ip do servidor",
                            type: ApplicationCommandOptionType.String,
                            required
                        }
                    ]
                }
            ]
        },
        {
            name: "skins",
            description: "Comando de skins de minecraft",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "buscar",
                    description: "Busca e exibe a skin de um jogador",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "nick",
                            description: "Nick ou UUID do jogador",
                            type: ApplicationCommandOptionType.String,
                            required
                        }
                    ]
                }
            ]
        },
    ],
    async run(interaction){
        const { options } = interaction;

        const group = options.getSubcommandGroup(true);
        const subCommand = options.getSubcommand(true);

        switch(group){
            case "servidores":{
                switch(subCommand){
                    case "status":{
                        const serverIp = options.getString("ip", true);

                        await interaction.deferReply({ ephemeral });
        
                        const response = await fetchMinecraftServerStatus(serverIp);
                        if (!response.success || !response.data.hostname){
                            interaction.editReply({
                                content: `Não foram encontrados dados para o servidor com o ip: \`${serverIp}\``
                            });
                            return;
                        }
        
                        const { data } = response;
        
                        const ip = inlineCode(data.hostname || "Indisponível");
                        const numericIp = inlineCode(data.ip || "Indisponível");
                        const onlineStatus = data.online ? "👍" : "👎";
                        const players = data.players?.max
                        ? inlineCode(`${data.players?.online}/${data.players?.max}`)
                        : "Indisponível";
                        const version = data.version || "Indisponível";
        
                        const embed = new EmbedBuilder({
                            title: serverIp,
                            color: hexToRgb(data.online 
                                ? settings.colors.theme.success
                                : settings.colors.theme.danger
                            ),
                            thumbnail: { url: "attachment://thumb.png" },
                            description: brBuilder(
                                `Online: ${onlineStatus}`,
                                `IP: ${ip}`,
                                `IP numérico: ${numericIp}`,
                                `Jogadores: ${players}`,
                                `Versão: ${version}`,
                            )
                        });
        
                        const files: AttachmentBuilder[] = [];
        
                        if (data.icon){
                            const base64string = data.icon.replace("data:image\/png;base64,", "");
                            const buffer = Buffer.from(base64string, "base64");
                            files.push(new AttachmentBuilder(buffer, { name: "thumb.png" }));
                        }
        
                        interaction.editReply({ embeds: [embed], files });
                        return;
                    }
                }
                return;
            }
            case "skins":{
                switch(subCommand){
                    case "buscar":{
                        await interaction.deferReply({ ephemeral });

                        const nickOrUiid = options.getString("nick", true);
                        
                        const results = await Promise.all([
                            fetchSkinInfo(nickOrUiid),
                            fetchSkinRender(nickOrUiid, { type: RenderTypes.Head, crop: RenderCrops.Full }),
                            fetchSkinRender(nickOrUiid, { type: RenderTypes.Dungeons, crop: RenderCrops.Full }),
                            fetchSkinRender(nickOrUiid, { type: RenderTypes.Skin, crop: RenderCrops.Default }),
                        ]);

                        const [ info, head, fullBody, skin ] = results;

                        if (!info.success || !head.success || !fullBody.success || !skin.success){
                            reply.danger({ interaction, update: true, text: brBuilder(
                                `Não foi possível obter skin de \`${nickOrUiid}\``,
                            )});
                            return;
                        }

                        const embed = new EmbedBuilder({
                            color: hexToRgb(settings.colors.theme.magic),
                            description: brBuilder(
                                `# Skin de ${nickOrUiid}`,
                                `Tamanho: **${info.skinTextureWidth}x${info.skinTextureHeight}**`,
                            ),
                            author: { name: nickOrUiid, iconURL: head.url },
                            thumbnail: { url: head.url },
                            image: { url: fullBody.url },
                        });

                        const row = createRow(
                            new ButtonBuilder({
                                url: "https://namemc.com/profile/"+nickOrUiid,
                                label: "NameMC",
                                emoji: "🪪",
                                style: ButtonStyle.Link
                            }),
                            new ButtonBuilder({
                                url: skin.url,
                                label: "Baixar skin",
                                emoji: "🌌",
                                style: ButtonStyle.Link
                            })
                        );

                        if (info.userCape){
                            row.addComponents(
                                new ButtonBuilder({
                                    url: info.userCape,
                                    label: "Baixar capa",
                                    style: ButtonStyle.Link
                                })
                            );
                        }

                        interaction.editReply({ embeds: [embed], components: [row] });
                        return;
                    }
                }
                return;
            }
        }
    }
});