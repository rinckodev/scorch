interface UserWallet {
    coins?: number
}

export interface UserDocument {
    username: string
    wallet?: UserWallet
}