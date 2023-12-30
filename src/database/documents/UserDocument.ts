interface UserWallet {
    coins?: number
}

interface UserRequests {
    staff?: boolean
}

interface Inventory {
    level?: number;
    xp?: number;
}

export interface UserDocument {
    username: string
    wallet?: UserWallet;
    requests?: UserRequests;
    inventory?: Inventory;
}