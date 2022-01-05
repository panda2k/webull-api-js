import Webull = require('./index')
import config from '../config.json'
import { TwoStepNeeded } from './errors'
import readline = require('readline')

const testClient = async(webull: Webull) => {
    try {
        await webull.login()
    } catch (error) {
        if (error instanceof TwoStepNeeded) {
            console.log('Two step verification needed')
            await webull.getVerificationCode()
            let verifyResult = false
            while (verifyResult == false) {
                const code = await verificationCodePrompt()
                verifyResult = await webull.checkVerificationCode(code)
            }
            await webull.login()
        }
    }

    console.log((await webull.getAccountOverview()).accountSummaryVO.accountType)
    const now = new Date()

    const trades = await webull.getTrades(
        new Date((new Date()).setDate(now.getDate() - 30)).toISOString().split('T')[0], 
        now.toISOString().split('T')[0], 
        0, 
        30
    )

    const trades2 = await webull.getTrades(
        new Date((new Date()).setDate(now.getDate() - 30)).toISOString().split('T')[0], 
        now.toISOString().split('T')[0], 
        trades[29].items[0].createTime0, 
        30
    )

    console.log(trades.length)
    console.log(trades2.length)
    console.log(trades[29].orderId)
    console.log(trades2[29].orderId)
}

const verificationCodePrompt = async(): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) => {
        rl.question('Input SMS verification code: ', answer => { rl.close(); resolve(answer) })

    })
}

(async() => {
    const webull = new Webull(config.email, config.password, config.tradingPin)
    
    await testClient(webull)

    const webull2 = new Webull(
        '', 
        '', 
        '', 
        { 
            deviceId: webull.deviceId, 
            accessToken: webull.accessToken, 
            refreshToken: webull.refreshToken, 
            accountId: webull.accountId, 
            email: webull.email, 
            lzone: webull.client.defaults.headers.common['lzone'],
            tradingPin: webull.tradingPin
        }
    )

    await testClient(webull2)
})()
