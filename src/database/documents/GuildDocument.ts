interface GuildLogs {
    channel?: string
}

interface GuildGlobal {
    channel?: string,
    role?:string,
    messages?: {
        join?: string;
        leave?: string;
    },
    colors?: {
        join?: string;
        leave?: string;
    },
}

interface GuildStaff {
    application: {
        channel: string;
    }
}

interface GuildChannels {
    logs?: { id: string };
    audit?: { id: string };
    global?: { id: string }
}

export interface GuildDocument {
    logs?: GuildLogs,
    global?: GuildGlobal
    staff?: GuildStaff;
    channels?: GuildChannels;
}