const fs = require('fs')
const fetch = require('node-fetch')
const yaml = require('yaml')
const xml = require('fast-xml-parser')
const oembedSpecDir = 'oembed-spec/providers'
const outputFile = 'provider-dimensions.json'

async function parseResponse(res) {
    const rawData = await res.text()
    let data = null

    try {
        data = JSON.parse(rawData)
    } catch (err) { }

    if (data !== null) {
        return data
    }

    try {
        data = xml.parse(rawData)
    } catch (err) { }

    return data
}

function hasDimensions(data) {
    return data.hasOwnProperty("width") && data.hasOwnProperty("height")
}

function getAndParseKey(data, key) {
    if (typeof data[key] === 'number') {
        return data[key]
    } else {
        return parseInt(data[key])
    }
}

function getDimensions(data) {
    let width, height = null

    if (hasDimensions(data)) {
        width = getAndParseKey(data, "width")
        height = getAndParseKey(data, "height")
    } else if (data.hasOwnProperty("oembed")) {
        width = getAndParseKey(data.oembed, "width")
        height = getAndParseKey(data.oembed, "height")
    }

    return { width, height }
}

async function processProviders(providers) {
    const providerDimensions = []

    for (let provider of providers) {
        try {
            const data = await fetch(provider.example_url).then(parseResponse)
            const dimensions = getDimensions(data)

            if ((typeof dimensions.width === 'number' && !isNaN(dimensions.width)) && (typeof dimensions.height === 'number' && !isNaN(dimensions.height))) {
                providerDimensions.push({ name: provider.provider_name, ...dimensions })
                console.log(`++ ${provider.provider_name}: ${dimensions.width}x${dimensions.height}`)
            } else {
                console.warn(`-- Couldn't parse dimensions for provider ${provider.provider_name}`)
            }
        } catch (err) {
            console.error(`-- Couldn't process provider ${provider.provider_name}`)
            console.error(err)
        }
    }

    return providerDimensions
}

const files = fs
      .readdirSync(oembedSpecDir)
      .filter(file => file.endsWith('.yml'))

const providers = files
      .map(file => fs.readFileSync(`${oembedSpecDir}/${file}`, 'utf8'))
      .map(yaml.parse)
      .map(fullProvider => fullProvider[0])
      .map(fullProvider => ({
          provider_name: fullProvider.provider_name,
          example_url: fullProvider.endpoints[0].example_urls[0]
      }))

processProviders(providers)
    .then(providerDimensions => {
        console.log('++ Finished processing providers')
        fs.writeFileSync(outputFile, JSON.stringify(providerDimensions, null, 2))
    })
    .catch(err => {
        console.error('-- Error while processing providers')
        console.error(err)
    })
