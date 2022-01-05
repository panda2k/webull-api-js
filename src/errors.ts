export class LoginError extends Error {
    remainingAttempts: number
    constructor(msg: string, remainingLoginAttempts: number) {
        super(msg)
        this.remainingAttempts = remainingLoginAttempts
    }
}

export class InvalidTradingPinError extends Error {
    remainingAttempts: number
    constructor(msg: string, remainingAttempts: number) {
        super(msg)
        this.remainingAttempts = remainingAttempts
    }
}

export class TwoStepNeeded extends Error {
    constructor(msg: string) {
        super(msg)
    }
}
