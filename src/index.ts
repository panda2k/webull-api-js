import md5 from 'crypto-js/md5'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { AccountOverview, LoginResponse, Trade, TradeTabResponse, TradeTokenResponse } from './types'
import uuid = require('uuid')

class Webull {
    email: string
    password: string
    deviceId: string
    client: AxiosInstance
    accessToken: string = ''
    refreshToken: string = ''
    tradingPin: string
    tradeToken: string = ''
    accountId: string = ''
    
    constructor(email: string, password: string, tradingPin: string) {
        this.email = email
        this.password = password
        this.deviceId = uuid.v4().replace(/-/g, "")
        this.client = axios.create({ headers: { did: this.deviceId }, responseType: 'json' })
        this.tradingPin = tradingPin
        axios.create
    }

    async login() {

        const loginResponse: AxiosResponse<LoginResponse> = await this.client.post(
            'https://userapi.webull.com/api/passport/login/v5/account',
            {
                "account": this.email,
                "accountType": "2",
                "pwd": md5('wl_app-a&b@!423^' + this.password).toString(), // password hash
                "deviceId": this.deviceId,
                "regionId": 1
            }
        )
        this.accessToken = loginResponse.data.accessToken
        this.refreshToken = loginResponse.data.refreshToken

        this.client.defaults.headers.common['access_token'] = this.accessToken

        this.tradeToken = await this.getTradingToken()
            .catch(async error => {
                if (error.response.body.code == 'auth.token.req') { // need phone code
                    console.log('SMS code needed')
                    await this.getVerificationCode()
                    // need solution for getting code
                    //await this.checkVerificationCode("")
                }
                return ''
            }) // TODO account for auth tokens

        this.client.defaults.headers.common['t_token'] = this.tradeToken
                
        const accounts = (await this.getAccounts()).accountList

        for (let i = 0; i < accounts.length; i++ ) {
            if (accounts[i].brokerShortName == "INDV") { // only support individual accounts
                this.accountId = accounts[i].secAccountId.toString()
                this.client.defaults.headers.common['lzone'] = accounts[i].rzone
            }
        }

        console.log(typeof this.accessToken)

        console.log('Logged in')
    }

    async getAccountOverview(): Promise<AccountOverview> {
        const accountOverview: AxiosResponse<AccountOverview> = await this.client.get(
            `https://ustrade.webullfinance.com/api/trading/v1/webull/account/accountAssetSummary/v2?secAccountId=${this.accountId}`
        )

        return accountOverview.data
    }

    /*
    Fetches trades
    startDate: date represented as string for earlier date to fetch trades from YYYY-MM-DD
    endDate: date represented as string for latest date to fetch trades from YYYY-MM-DD
    lastCreateTime: a number used for pagination. take this number from the earliest order's createTime0
    pageSize: trades per page
    */

    async getTrades(startDate: string, endDate: string, lastCreateTime: number, pageSize: number): Promise<Array<Trade>> {
        const trades: AxiosResponse<Trade[]> = await this.client.post(
            `https://u1strade.webullfinance.com/api/trading/v1/webull/order/list?secAccountId=${this.accountId}`,
            {
                dateType: "ORDER",
                pageSize: pageSize,
                startTimeStr: startDate,
                endTimeStr: endDate,
                action: null,
                lastCreateTime0: lastCreateTime,
                secAccountId: this.accountId,
                status: "all"
            }
        )

        return trades.data
    }

    private async getAccounts(): Promise<TradeTabResponse> {
        const tradeTabResponse: AxiosResponse<TradeTabResponse> = (await this.client.get(
            'https://trade.webullfintech.com/api/trading/v1/global/tradetab/display'
        ))

        return tradeTabResponse.data
    }

    /*
    Verification code types
    5: email
    */

    private async getVerificationCode(): Promise<void> { 
        const getVerificationCodeResponse = await this.client.post(
            'https://userapi.webullfintech.com/api/passport/v2/verificationCode/send',
            {
                account: this.email,
                accountType: "2",
                codeType: 5
            }
        )
        console.log('Response: ')
        console.log(getVerificationCodeResponse.data)
    }

    private async checkVerificationCode(code: string): Promise<boolean> {
        const verificationResponse = await this.client.post(
            'https://userapi.webullfintech.com/api/passport/v2/verificationCode/checkCode',
            {
                account: this.email,
                accountType: "2",
                code: code,
                codeType: 5
            }
        )

        console.log(verificationResponse.data)
        return true
    }

    private async getTradingToken(): Promise<string> {
        const tokenResponse: AxiosResponse<TradeTokenResponse> = await this.client.post(
            'https://trade.webullfintech.com/api/trading/v1/global/trade/login',
            {
                pwd: md5('wl_app-a&b@!423^' + this.tradingPin).toString()
            }
        )

        return tokenResponse.data.tradeToken
    }
}

export = Webull
