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

export interface GuildDocument {
    logs?: GuildLogs,
    global?: GuildGlobal
}