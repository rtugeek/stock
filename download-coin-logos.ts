import type { CoinType } from '@/api/CoinApi'
// 创建目录（如果不存在）
import * as fs from 'node:fs'
import * as path from 'node:path'
import axios from 'axios'
import consola from 'consola'

export interface Coin {
  type: CoinType | string
  name: string
  logo: string
}

export const Coins: Coin[] = [
  {
    type: 'BTC-USD',
    name: 'Bitcoin',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
  },
  {
    type: 'ETH-USD',
    name: 'Ethereum',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
  },
  {
    type: 'USDT-USD',
    name: 'Tether',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
  },
  {
    type: 'XRP-USD',
    name: 'XRP',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png',
  },
  {
    type: 'BNB-USD',
    name: 'BNB',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
  },
  {
    type: 'SOL-USD',
    name: 'Solana',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
  },
  {
    type: 'USDC-USD',
    name: 'USD Coin',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
  },
  {
    type: 'TRX-USD',
    name: 'TRON',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',
  },
  {
    type: 'DOGE-USD',
    name: 'Dogecoin',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png',
  },
  {
    type: 'ADA-USD',
    name: 'Cardano',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png',
  },
  {
    type: 'HYPE-USD',
    name: 'Hyperliquid',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png',
  },
  {
    type: 'BCH-USD',
    name: 'Bitcoin Cash',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1831.png',
  },
  {
    type: 'SUI-USD',
    name: 'Sui',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png',
  },
  {
    type: 'LINK-USD',
    name: 'Chainlink',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
  },
  {
    type: 'LEO-USD',
    name: 'UNUS SED LEO',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3957.png',
  },
  {
    type: 'AVAX-USD',
    name: 'Avalanche',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
  },
  {
    type: 'XLM-USD',
    name: 'Stellar',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/512.png',
  },
  {
    type: 'TON-USD',
    name: 'Toncoin',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
  },
  {
    type: 'SHIB-USD',
    name: 'Shiba Inu',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',
  },
  {
    type: 'PI-USD',
    name: 'Pi',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/35697.png',
  },
  {
    type: 'OKB-USD',
    name: 'OKB',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
  },
  {
    type: 'TRUMP-USD',
    name: 'TRUMP',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/35336.png',
  },
]

const outputDir = path.resolve('src/assets')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// 将名字转为小写下划线
function toSnakeCase(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, '_')}.png`
}

async function downloadLogo(coin: Coin) {
  const filename = toSnakeCase(coin.name)
  const filePath = path.join(outputDir, filename)

  try {
    const response = await axios.get(coin.logo, { responseType: 'arraybuffer' })
    fs.writeFileSync(filePath, response.data)
    consola.log(`✅ Downloaded: ${filename}`)
  }
  catch (error) {
    consola.error(`❌ Failed to download ${coin.name}:`, error.message)
  }
}

async function main() {
  for (const coin of Coins) {
    await downloadLogo(coin)
  }
}

main()
