import Webull = require('./webull')
import config from '../config.json'

(async() => {
    const webull = new Webull(config.email, config.password, config.tradingPin)
    await webull.login()
    console.log(await webull.getAccountOverview())
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
})()
