interface GuildLogs {
    channel?: string
}

interface GuildGlobal {
    channel?: string,
    role?:string
}

export interface GuildDocument {
    logs?: GuildLogs,
    global?: GuildGlobal
}