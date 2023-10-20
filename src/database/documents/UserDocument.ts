interface UserWallet {
    coins?: number
}

interface UserRequests {
    staff?: boolean
}

export interface UserDocument {
    username: string
    wallet?: UserWallet;
    requests?: UserRequests
}