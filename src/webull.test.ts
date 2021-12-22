import Webull = require('./webull')
import config from '../config.json'

(async() => {
    const webull = new Webull(config.email, config.password, config.tradingPin)
    await webull.login()
})()
