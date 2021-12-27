import crypto = require('crypto')
import got, { Got } from 'got/dist/source'
import {  AccountOverview, LoginResponse, Trade, TradeTabResponse, TradeTokenResponse } from './types'
import readline = require('readline')

class Webull {
    email: string
    password: string
    deviceId: string
    client: Got
    accessToken: string = ''
    refreshToken: string = ''
    tradingPin: string
    tradeToken: string = ''
    accountId: string = ''
    
    constructor(email: string, password: string, tradingPin: string) {
        this.email = email
        this.password = password
        this.deviceId = crypto.randomBytes(16).toString('hex')
        this.client = got.extend({headers: { did: this.deviceId }, responseType: 'json'})
        this.tradingPin = tradingPin
    }

    async login() {
        const loginResponse = (await this.client.post(
            'https://userapi.webull.com/api/passport/login/v5/account',
            {
                json: {
                    "account": this.email,
                    "accountType": "2",
                    "pwd": crypto.createHash('md5').update('wl_app-a&b@!423^' + this.password).digest('hex'), // password hash
                    "deviceId": this.deviceId,
                    "regionId": 1
                }
            }
        )).body as any as LoginResponse
        this.accessToken = loginResponse.accessToken
        this.refreshToken = loginResponse.refreshToken

        this.client = this.client.extend({headers: {did: this.deviceId, access_token: this.accessToken}, responseType: 'json'})

        this.tradeToken = await this.getTradingToken()
            .catch(async error => {
                if (error.response.body.code == 'auth.token.req') { // need phone code
                    console.log('SMS code needed')
                    await this.getVerificationCode()
                    const code = await this.verificationCodePrompt()
                    await this.checkVerificationCode(code)
                }
                return ''
            }) // TODO account for auth tokens

        this.client = this.client.extend({headers: { did: this.deviceId, access_token: this.accessToken, t_token: this.tradeToken }, responseType: 'json'})
                
        const accounts = (await this.getAccounts()).accountList

        for (let i = 0; i < accounts.length; i++ ) {
            if (accounts[i].brokerShortName == "INDV") { // only support individual accounts
                this.accountId = accounts[i].secAccountId.toString()
                this.client = this.client.extend({headers: { did: this.deviceId, access_token: this.accessToken, t_token: this.tradeToken, lzone: accounts[i].rzone }, responseType: 'json'})
            }
        }

        console.log(typeof this.accessToken)

        console.log('Logged in')
    }

    async getAccountOverview(): Promise<AccountOverview> {
        const accountOverview = (await this.client.get(
            `https://ustrade.webullfinance.com/api/trading/v1/webull/account/accountAssetSummary/v2?secAccountId=${this.accountId}`
        )).body as any as AccountOverview

        return accountOverview
    }

    /*
    Fetches trades
    startDate: date represented as string for earlier date to fetch trades from YYYY-MM-DD
    endDate: date represented as string for latest date to fetch trades from YYYY-MM-DD
    lastCreateTime: a number used for pagination. take this number from the earliest order's createTime0
    pageSize: trades per page
    */

    async getTrades(startDate: string, endDate: string, lastCreateTime: number, pageSize: number): Promise<Array<Trade>> {
        const trades = (await this.client.post(
            `https://u1strade.webullfinance.com/api/trading/v1/webull/order/list?secAccountId=${this.accountId}`,
            {
                json: {
                    dateType: "ORDER",
                    pageSize: pageSize,
                    startTimeStr: startDate,
                    endTimeStr: endDate,
                    action: null,
                    lastCreateTime0: lastCreateTime,
                    secAccountId: this.accountId,
                    status: "all"
                },
                headers: { 'content-type': 'application/json' }
            }
        )).body as any as Trade[]

        return trades
    }

    private async getAccounts(): Promise<TradeTabResponse> {
        const tradeTabResponse = (await this.client.get(
            'https://trade.webullfintech.com/api/trading/v1/global/tradetab/display'
        )).body as unknown as TradeTabResponse

        return tradeTabResponse
    }

    private async verificationCodePrompt(): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        return new Promise((resolve) => {
            rl.question('Input SMS verification code: ', answer => { rl.close(); resolve(answer) })

        })
    }
    /*
    Verification code types
    5: email
    */

    private async getVerificationCode(): Promise<void> { 
        const getVerificationCodeResponse = (await this.client.post(
            'https://userapi.webullfintech.com/api/passport/v2/verificationCode/send',
            {
                json: {
                    account: this.email,
                    accountType: "2",
                    codeType: 5
                }
            }
        )) as any
        console.log('Response: ')
        console.log(getVerificationCodeResponse)
    }

    private async checkVerificationCode(code: string): Promise<boolean> {
        const verificationResponse = (await this.client.post(
            'https://userapi.webullfintech.com/api/passport/v2/verificationCode/checkCode',
            {
                json: {
                    account: this.email,
                    accountType: "2",
                    code: code,
                    codeType: 5
                }
            }
        )) as any

        console.log(verificationResponse.body)
        return true
    }

    private async getTradingToken(): Promise<string> {
        const tokenResponse = (await this.client.post(
            'https://trade.webullfintech.com/api/trading/v1/global/trade/login',
            {
                json: {
                    pwd: crypto.createHash('md5').update('wl_app-a&b@!423^' + this.tradingPin).digest('hex')
                }
            }
        )).body as any as TradeTokenResponse

        return tokenResponse.tradeToken
    }
}

export = Webull
