import { db, getRegister } from "@/database";
import { Component, Modal } from "@/discord/base";
import { settings } from "@/settings";
import { brBuilder, createModalInput, createRow, hexToRgb, toNull } from "@magicyan/discord";
import { ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, ComponentType, EmbedBuilder, TextInputStyle, User, codeBlock, time } from "discord.js";

new Component({
    customId: "staff-form-start-button",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        const { guild, user } = interaction;


        const userData = await getRegister(user);
        if (userData.requests?.staff){
            interaction.reply({ ephemeral,
                content: "Você já tem uma aplicação para a equipe pendente!"
            });
            return;
        }

        const guildData = await db.get(db.guilds, guild.id);
        const channel = guild.channels.cache.get(guildData?.staff?.application.channel || "");
        if (channel?.type !== ChannelType.GuildText){
            interaction.reply({ ephemeral,
                content: "O canal dos formulários deste sistema não está configurado!"
            });
            return;
        }

        interaction.showModal({
            customId: "staff-form-modal",
            title: "Formulário de aplicação para a equipe",
            components: [
                createModalInput({
                    customId: "staff-form-name-input",
                    label: "Nome",
                    placeholder: "Qual é o seu nome?",
                    style: TextInputStyle.Short
                }),
                createModalInput({
                    customId: "staff-form-age-input",
                    label: "Idade",
                    placeholder: "Quantos anos você tem?",
                    style: TextInputStyle.Short,
                }),
                createModalInput({
                    customId: "staff-form-availability-input",
                    label: "Disponibilidade",
                    placeholder: "Quais dias e horários você está disponível?",
                    style: TextInputStyle.Short,
                }),
                createModalInput({
                    customId: "staff-form-reason-input",
                    label: "Motivo",
                    placeholder: "Por que você quer entrar na equipe?",
                    style: TextInputStyle.Paragraph,
                    minLength: 40,
                    maxLength: 3000
                }),
            ]
        });   
    },
});

new Modal({
    customId: "staff-form-modal",
    cache: "cached",
    async run(interaction) {
        const { member, fields, guild } = interaction;

        await interaction.deferReply({ ephemeral });

        const guildData = await db.get(db.guilds, guild.id);
        const channelId = guildData?.staff?.application.channel || "";
        const channel = guild.channels.cache.get(channelId);
        if (channel?.type !== ChannelType.GuildText){
            interaction.editReply({
                content: "O canal dos formulários deste sistema não está configurado!"
            });
            return;
        }

        const userData = await getRegister(member.user);

        const name = fields.getTextInputValue("staff-form-name-input");
        const age = fields.getTextInputValue("staff-form-age-input");
        const availability = fields.getTextInputValue("staff-form-availability-input");
        const reason = fields.getTextInputValue("staff-form-reason-input");

        interaction.editReply({
            content: "Formulário enviado com sucesso!"
        });

        channel.send({
            embeds: [
                new EmbedBuilder({
                    title: "Aplicação para a equipe",
                    color: hexToRgb(settings.colors.theme.primary),
                    description: brBuilder(
                        `Formulário de ${member} **@${member.user.username}**`,
                        `Enviado em ${time(new Date(), "D")}`
                    ),
                    fields: [
                        { name: "Nome", value: codeBlock(name), inline: true },
                        { name: "Idade", value: codeBlock(age), inline: true },
                        { name: "Disponibilidade", value: codeBlock(availability) },
                        { name: "Motivo", value: codeBlock(reason) },
                    ],
                    footer: { text: member.id }
                })
            ],
            components: [
                createRow(
                    new ButtonBuilder({
                        customId: "staff-application-approve", 
                        label: "Aprovar", 
                        style: ButtonStyle.Success
                    }),
                    new ButtonBuilder({
                        customId: "staff-application-reject", 
                        label: "Recusar", 
                        style: ButtonStyle.Danger
                    })
                )
            ]
        });

        await db.upset(db.users, member.id, {
            ...userData,
            requests: {
                ...userData.requests,
                staff: true
            }
        });
    },
});

new Component({
    customId: "staff-application-approve",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        handleStaffApplication({ interaction, action: "approve" });
    },
});

new Component({
    customId: "staff-application-reject",
    type: ComponentType.Button, cache: "cached",
    async run(interaction) {
        handleStaffApplication({ interaction, action: "reject" });
    },
});

interface HandleStaffApplicationProps {
    interaction: ButtonInteraction<"cached">,
    action: "approve" | "reject"
}
async function handleStaffApplication({ interaction, action }: HandleStaffApplicationProps){
    const { message, guild } = interaction;

    const memberId = message.embeds[0].data.footer?.text;
    const member = guild.members.cache.get(memberId || "");
    if (!member){
        interaction.update({ embeds, components,
            content: "Membro não encontrado no servidor!"
        });
        return;
    }

    await db.update(db.users, member.id, {
        requests: { staff: false }
    });

    await interaction.update({ embeds, components,
        content: action == "approve" 
        ? `Você aprovou ${member} para entrar na equipe` 
        : `Você rejeitou ${member} para entrar na equipe`
    });

    if (action == "reject"){
        const embed = new EmbedBuilder({
            color: hexToRgb(settings.colors.theme.danger),
            title: "💔 Aplicação rejeitada",
            description: brBuilder(
                "Sua aplicação para a equipe foi rejeitada!",
                "Abaixo estão alguns motivos pra isso!",
                "- Motivo 01",
                "- Motivo 02",
                "- Motivo 03"
            )
        });
        member.send({ embeds: [embed] })
        .catch(toNull);
        return;
    }

    const embed = new EmbedBuilder({
        color: hexToRgb(settings.colors.theme.success),
        title: "💚 Aplicação aprovada!",
        description: brBuilder(
            "Sua aplicação para a equipe foi aprovada!",
            `Parabéns ${member}! Agora você faz parte da`,
            "equipe do nosso servidor!"
        )
    });
    member.send({ embeds: [embed] }).catch(toNull);

    // Adicionar cargos
    // Enviar mensagens nos chats do servidor
    // Adicionar outros dados
}