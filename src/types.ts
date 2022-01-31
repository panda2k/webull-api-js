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

export interface AccountOverview {
    accountSummaryVO: {
        secAccountId: number,
        brokerId: number,
        accountType: string,
        accountTypeName: string,
        accountNumber: string,
        currency: string,
        netLiquidationValue: string,
        totalMarketValue: string,
        totalCashValue: string,
        dayBuyingPower: string,
        overnightBuyingPower: string,
        dayTradeCounts: DayTradeCount[],
        unrealizedProfitLoss: string,
        unrealizedProfitLossRate: string,
        profitLoss: string,
        profitLossRate: string,
        assetRatioList: AssetRatioList[],
        settledFunds: string,
        unsettledFunds: string,
        availableWithdraw: string,
        incomingFunds: string,
        maintMargin: string,
        initMargin: string,
        riskInfo: RiskInfo,
        isPdt: boolean,
        optionTradeLevel: string,
        allowChange: boolean,
        typeChangeStatus: string,
        dayTradesRemaining: number,
        accruedInterest: string,
        accruedDividend: string,
        accruedTotal: string,
        toReceiveInterest: string,
        toReceiveDividend: string,
        toReceiveTotal: string,
        longMarketValue: string,
        shortMarketValue: string,
    },
    assetSummaryVO: {
        capital: {
            accountType: string,
            currency: string,
            netLiquidationValue: string,
            unrealizedProfitLoss: string,
            unrealizedProfitLossRate: string,
            unrealizedProfitLossBase: string,
            dayBuyingPower: string,
            overnightBuyingPower: string,
            settledFunds: string,
            unsettleFunds: string,
            cryptoBuyingPower: string,
            optionBuyingPower: string,
            totalCashValue: string,
            totalCost: string,
            remainTradeTimes: string,
            totalMarketValue: string,
            pendingFunds: string,
            availableBuyingPower: string,
            unAvailableBuyingPower: string,
            creditDiffBp: string,
            creditBp: string,
            frozenBp: string,
            unRecoveredBp: string,
            cryptoBp: string,
        },
        positions: any[], // TODO find exact type
        riskInfo: RiskInfo,
        openOrderQty: number,
        openIPOQty: number,
        edocDeliveryTips: {
            display: boolean
        },
    }
}

interface AssetRatioList {
    name: string,
    value: string,
    icon?: string,
}

interface DayTradeCount {
    tradeDate: string,
    weekDayName: string,
    quantity: string,
}

interface RiskInfo {
    level: string,
    levelName: string,
    riskUrl: string,
    marginCalls: any[], // TODO find exact type
    remainTradeTimesUrl: string,
}

export interface Trade {
    orderId: string,
    comboId: string,
    comboType: string,
    comboTickerType: string,
    optionStrategy: string,
    outsideRegularTradingHour: boolean,
    quantity: string,
    filledQuantity: string,
    action: string,
    status: string,
    statusName: string,
    timeInForce: string,
    orderType: string,
    lmtPrice: string,
    canModify: boolean,
    canCancel: boolean,
    items: Item[],
}

interface Item {
    brokerId: number,
        orderId: string,
        brokerOrderId: string,
        comboId: string,
        comboType: string,
        tickerType: string,
        ticker: {
            tickerId: number,
            exchangeId: number,
            type: number,
            secType: number[],
            regionId: number,
            regionCode: string,
            currencyId: number,
            currencyCode: string,
            name: string,
            symbol: string,
            disSymbol: string,
            disExchangeCode: string,
            exchangeCode: string,
            listStatus: number,
            template: string,
            exchangeTrade: boolean,
            derivativeSupport: number,
            tinyName: string,
        },
        action: string,
        orderType: string,
        lmtPrice: string,
        totalQuantity: string,
        tickerId: number,
        timeInForce: string,
        optionType: string,
        optionExpireDate: string,
        optionExercisePrice: string,
        filledQuantity: string,
        statusCode: string,
        statusName: string,
        symbol: string,
        optionCategory: string,
        optionContractMultiplier: string,
        optionContractDeliverable: string,
        createTime0: number,
        createTime: string,
        filledTime0: number,
        filledTime: string,
        updateTime: string,
        updateTime0: number,
        avgFilledPrice: string,
        canModify: boolean,
        canCancel: boolean,
        assetType: string,
        remainQuantity: string,
        optionCycle: number,
        entrustType: string,
        placeAmount: string,
        filledAmount: string,
        outsideRegularTradingHour: boolean,
        amOrPm: string,
        expirationType: number,
}

export interface Ticker {
    tickerId: number,
    exchangeId: number,
    type: number,
    secType: number[]
    regionId: number,
    regionCode: string,
    currencyId: number,
    currencyCode: string,
    name: string,
    symbol: string,
    disSymbol: string,
    disExchangeCode: string,
    exchangeCode: string,
    listStatus: number,
    template: string,
    derivativeSupport: number,
    tinyName: string
}

export interface TickerQueryResponse {
    data: Ticker[],
    hasMore: boolean
}

export type Status = "Working" | "Filled" | "Cancelled" | "Pending" | "Partial filled" | "Failed" | "All"

