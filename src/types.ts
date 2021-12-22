export interface LoginResponse {
    extInfo: {
        userPwdFlag: string
    },
    accessToken: string,
    uuid: string,
    refreshToken: string,
    tokenExpireTime: string,
    firstTimeOfThird: boolean,
    registerAddress: number,
    settings: {
        id: number,
        userId: number,
        region: number,
        language: string,
        focusMarketId: string,
        theme: number,
        increDecreColor: number,
        fontSize: string,
        portfolioDisplayMode: number,
        portfolioNameNewline: number,
        portfolioHoldingsDisplay: number,
        portfolioIndexDisplay: number,
        portfolioBulletin: number,
        kdata: number,
        refreshFrequency: number,
        shock: number,
        tickerPriceRemind: number,
        orderDealRemind: number,
        hotNews: number,
        chartOption: number,
        operateTime: string,
        languageUpdateTime: string,
        createTime: string,
        updateTime: string,
        listStyle: number
    }
}

export interface TradeTokenResponse {
    tradeToken: string,
    tradeTokenExpireIn: number // expiry time is four hours
}

interface TickerTypes {
    regionId: number,
    tickerType: number,
    orderTypes: Array<string>
}

interface AccountPermissions {
    type: string,
    hasPermission: boolean
}

interface TimeInForces {
    name: string,
    alias: string
}

interface AccountDetail {
    brokerId: number,
    brokerName: string,
    brokerShortName: string,
    secAccountId: number,
    accountNumber: string,
    rzone: string,
    registerRegionId: number,
    nationality: number,
    status: string,
    openAccountUrl: string,
    tickerTypes: Array<TickerTypes>,
    accountTypes: Array<string>,
    accountPermissions: Array<AccountPermissions>,
    supportOutsideRth: boolean,
    defaultChecked: boolean,
    deposit: boolean,
    depositStatus: boolean,
    transfer: boolean,
    displayfirstInTab: boolean,
    customerType: string,
    allowDeposit: boolean,
    giftStockStatus: number,
    timeInForces: Array<TimeInForces>,
    comboTypes: Array<string>,
    supportIPO: boolean,
    optionOpenStatus: string,
    supportOption: boolean,
    cryptoOpenStatus: string,
    supportCrypto: boolean
}

export interface TradeTabResponse {
    display: boolean,
    accountList: Array<AccountDetail>
}
