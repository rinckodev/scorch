import { createRow } from "@magicyan/discord";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, ComponentType, EmbedBuilder, Message } from "discord.js";

interface CreatePaginationOptions {
    embeds: EmbedBuilder[];
    render(embed: EmbedBuilder[], components: ActionRowBuilder<ButtonBuilder>[]): Promise<Message>;
    filter?(interaction: ButtonInteraction): boolean;
    onUpdate?(embed: EmbedBuilder, index: number, length: number): void;
    time?: number;
    onTimeout?(collected: Collection<string, ButtonInteraction>): void
    onEnd?(collected: Collection<string, ButtonInteraction>): void
}

export async function createPagination(options: CreatePaginationOptions){
    const { embeds, render, filter, onUpdate, time, onTimeout, onEnd } = options;

    const Actions = {
        Previous: "pagination-previous-button",
        Home: "pagination-home-button",
        Next: "pagination-next-button",
        Close: "pagination-close-button",
    };

    const createButtons = (index=0, total=embeds.length) => {
        return createRow(
            new ButtonBuilder({
                customId: Actions.Previous,
                label: "Voltar", style: ButtonStyle.Secondary,
                disabled: index < 1
            }),
            new ButtonBuilder({
                customId: Actions.Home,
                label: "Início", style: ButtonStyle.Primary,
                disabled: index < 1
            }),
            new ButtonBuilder({
                customId: Actions.Next,
                label: "Avançar", style: ButtonStyle.Success,
                disabled: index >= total-1
            }),
            new ButtonBuilder({
                customId: Actions.Close,
                label: "Fechar", style: ButtonStyle.Danger,
            }),
        );
    };

    const row = createButtons();
    const message = await render([ embeds[0] ], [row]);
    
    let index = 0;

    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button, filter, time
    });

    collector.on("collect", async interaction => {
        const { customId } = interaction;

        switch(customId){
            case Actions.Previous:{
                if (index > 0) index--;
                break;
            }
            case Actions.Home:{
                index = 0;
                break;
            }
            case Actions.Next:{
                if (index < embeds.length-1) index++;
                break;
            }
            case Actions.Close:{
                await interaction.update({ components: [] });
                collector.stop();
                return;
            }
        }

        const embed = embeds[index];
        const components = [createButtons(index, embeds.length)];

        if (onUpdate) onUpdate(embed, index, embeds.length);
        await interaction.update({ embeds: [embed], components });
    });

    collector.on("end", (collected, reason) => {
        if (time && onTimeout && reason === "time") onTimeout(collected);
        if (onEnd && reason === "user") onEnd(collected); 
    });

    return message;
}