import md5 from 'crypto-js/md5'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { AccountOverview, LoginResponse, Trade, TradeTabResponse, TradeTokenResponse } from './types'
import uuid = require('uuid')
import { InvalidTradingPinError, LoginError, TwoStepNeeded } from './errors'

interface ImportOptions {
    deviceId: string,
    accessToken: string,
    refreshToken: string,
    accountId: string,
    lzone: string,
    email: string,
    tradingPin: string
}

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
    twoFactorPin: string = ''
    
    // specifiying import options ignores all other params
    constructor(email: string, password: string, tradingPin: string, options?: ImportOptions) {
        if (options) {
            this.client = axios.create({
                headers: {
                    did: options.deviceId,
                    origin: 'https://app.webull.com',
                    lzone: options.lzone,
                    access_token: options.accessToken
                },
                responseType: 'json'
            })
            this.accessToken = options.accessToken
            this.refreshToken = options.refreshToken
            this.accountId = options.accountId
            this.email = options.email
            this.password = ''
            this.deviceId =  options.deviceId
            this.tradingPin = options.tradingPin
            this.accountId = options.accountId
        } else {
            this.email = email
            this.password = password
            this.deviceId = uuid.v4().replace(/-/g, "")
            this.client = axios.create({ 
                headers: { 
                    did: this.deviceId, 
                    origin: 'https://app.webull.com' 
                }, 
                responseType: 'json' 
            })
            this.tradingPin = tradingPin
        }
    }

    async login() {
        if (this.accessToken == "") { // check if needs login
            const data: any = {
                "account": this.email,
                "accountType": "2",
                "pwd": md5('wl_app-a&b@!423^' + this.password).toString(), // password hash
                "deviceId": this.deviceId,
                "regionId": 1
            }

            if (this.twoFactorPin != "") {
                data['extInfo'] = {
                    'codeAccountType': "2",
                    'verificationCode': this.twoFactorPin
                }
                this.twoFactorPin = ""
            }
            try {
                const loginResponse: AxiosResponse<LoginResponse> = await this.client.post(
                    'https://userapi.webull.com/api/passport/login/v5/account',
                    data
                )
                this.accessToken = loginResponse.data.accessToken
                this.refreshToken = loginResponse.data.refreshToken
            } catch (error: any) {
                if (error.response) {
                    if (error.response.data.code == "account.pwd.mismatch") {
                        throw new LoginError(`Invalid email or password. ${error.response.data.data.allowPwdErrorTime} attempts remaining.`, error.response.data.data.allowPwdErrorTime)
                    } else {
                        throw new Error(error.response.data)
                    }
                } else {
                    throw error
                }
            }
            this.client.defaults.headers.common['access_token'] = this.accessToken
        }

        try {
            this.tradeToken = await this.getTradingToken()
            this.client.defaults.headers.common['t_token'] = this.tradeToken   
        } catch (error: any) {
            if (error.response) {
                if (error.response.data.code == "trade.pwd.invalid") {
                    throw new InvalidTradingPinError(`Invalid trading pin. ${error.response.data.data.retry} attempts remaining`, error.response.data.data.retry)
                } else if (error.response.data.code == 'auth.token.req') { // need phone code
                    console.log('SMS code needed')
                    throw new TwoStepNeeded("Check email for verification code")
                } else {
                    throw new Error(error.response.data)
                }
            } else {
                throw error
            }
        }

        if (this.accountId == "") {
            const accounts = (await this.getAccounts()).accountList

            for (let i = 0; i < accounts.length; i++ ) {
                if (accounts[i].brokerShortName == "INDV") { // only support individual accounts
                    this.accountId = accounts[i].secAccountId.toString()
                    this.client.defaults.headers.common['lzone'] = accounts[i].rzone
                }
            }
        }
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

    async getVerificationCode(): Promise<void> { 
        const getVerificationCodeResponse = await this.client.post(
            'https://userapi.webullfintech.com/api/passport/v2/verificationCode/send',
            {
                account: this.email,
                accountType: "2",
                codeType: 5
            }
        )
        console.log(getVerificationCodeResponse.data)
    }

    async checkVerificationCode(code: string): Promise<boolean> {
        const verificationResponse = await this.client.post(
            'https://userapi.webullfintech.com/api/passport/v2/verificationCode/checkCode',
            {
                account: this.email,
                accountType: "2",
                code: code,
                codeType: 5
            }
        )

        return verificationResponse.data.success
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
