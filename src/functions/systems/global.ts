import { db } from "@/database";
import { settings } from "@/settings";
import { brBuilder, createEmbedAuthor, hexToRgb, textReplacer } from "@magicyan/discord";
import { Canvas, loadImage } from "@napi-rs/canvas";
import { AttachmentBuilder, ChannelType, EmbedBuilder, GuildMember, PartialGuildMember, TimestampStyles, time, userMention } from "discord.js";
import { join } from "node:path";

interface GlobalMessageJoinProps {
    member: GuildMember,
    action: "join"
}
interface GlobalMessageLeaveProps {
    member: GuildMember | PartialGuildMember,
    action: "leave"
}
type GlobalMessageProps = GlobalMessageJoinProps | GlobalMessageLeaveProps

export async function globalMessage({ member, action }: GlobalMessageProps){
    const { guild } = member;

    const guildData = await db.get(db.guilds, guild.id);
    if (!guildData) return;

    const channel = guild.channels.cache.get(guildData.global?.channel || "");
    if (channel?.type !== ChannelType.GuildText) return;
    
    const canvas = new Canvas(800, 200);
    const context = canvas.getContext("2d");

    const background = await loadImage(join(__rootname, "assets/images/backgrounds/01.png"));

    context.filter = "blur(4px)";
    context.drawImage(background, 0, 0);
    
    context.filter = "opacity(15%)";
    context.fillStyle = action == "join" ? "#04D600" : "#D60000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.filter = "opacity(30%)";
    context.fillStyle = "#000000";
    context.save();
    context.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 14);
    context.fill();
    context.restore();

    context.filter = "none";

    const avatar = await loadImage(member.displayAvatarURL({ size: 256 }));

    context.save();
    context.beginPath();
    context.arc(39 + 74, 26 + 74, 148/2, 0, Math.PI * 2);
    context.clip();
    context.drawImage(avatar, 39, 26, 148, 148);
    context.restore();

    const actionIconPath = join(__rootname, `assets/icons/${action == "join" ? "plus" : "minus"}.svg`);
    const actionIcon = await loadImage(actionIconPath);
    context.drawImage(actionIcon, 234, 53);

    const actionText = action == "join" ? "Entrou no servidor" : "Saiu do servidor";

    context.fillStyle = "#FFFFFF";
    context.font = "medium 32px Montserrat";
    context.textBaseline = "middle";
    context.fillText(actionText, 237, 116);
    
    const { displayName } = member;
    let fontSize = 60;
    do {
        context.font = `bold ${--fontSize}px Montserrat`;
    } while(context.measureText(displayName).width > canvas.width - 300);

    context.fillText(displayName, 284, 73);


    const buffer = await canvas.encode("png");
    const attachment = new AttachmentBuilder(buffer, { name: "image.png" });

    channel.send({ files: [attachment] });
}