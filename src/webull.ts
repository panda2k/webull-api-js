import crypto = require('crypto')
import got, { Got } from 'got/dist/source'
import {  LoginResponse, TradeTabResponse, TradeTokenResponse } from './types'
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

        this.client = this.client.extend({headers: {did: this.deviceId, access_token: this.accessToken}})

        this.tradeToken = await this.getTradingToken()
            .catch(async error => {
                if (error.response.body.code == 'auth.token.req') { // need phone code
                    console.log('SMS code needed')
                    await this.getVerificationCode()
                    const code = this.verificationCodePrompt()
                    await this.checkVerificationCode(code)
                }
                return ''
            }) // TODO account for auth tokens
                
        const accounts = await this.getAccounts()
        for (let i = 0; i++; i < accounts.accountList.length) {
            if (accounts.accountList[i].brokerShortName == "INDV") { // only support individual accounts
                this.accountId = accounts.accountList[i].secAccountId.toString()
            }
        }

        console.log('Logged in')
    }

    private async getAccounts(): Promise<TradeTabResponse> {
        const tradeTabResponse = (await this.client.get(
            'https://trade.webullfintech.com/api/trading/v1/global/tradetab/display'
        )).body as unknown as TradeTabResponse

        return tradeTabResponse
    }

    private verificationCodePrompt(): string { // TODO fix prompt
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        let code: string = ''

        rl.question('Input SMS verification code: ', answer => { code = answer; rl.close() })

        return code
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
