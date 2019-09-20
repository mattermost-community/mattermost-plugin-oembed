import providers from './providers.json';
import providerDimensions from './provider-dimensions.json';
import {blacklist, formatRegexp} from './constants';

export function getProviderForUrl(url) {
    let providerFound = null;
    providers.forEach((provider) => {
        const schemes = provider.endpoints[0].schemes || [];
        const match = schemes.some((scheme) => {
            const reg = new RegExp(scheme.replace(/\*/g, '.*'));

            return reg.test(url);
        });

        if (match &&
            providerDimensions.some(({name}) => name === provider.provider_name) &&
            !blacklist.some((name) => name === provider.provider_name)) {
            providerFound = provider;
        }
    });

    return providerFound;
}

export function getDimensionsForProvider(providerName) {
    return providerDimensions.find(({name}) => name === providerName);
}

export function getOEmbedUrl(url) {
    const provider = getProviderForUrl(url);

    let baseUrl = provider.endpoints[0].url;
    let query = `?url=${encodeURIComponent(url)}`;

    if (formatRegexp.test(baseUrl)) {
        baseUrl = baseUrl.replace(formatRegexp, '.json');
    } else {
        query += '&format=json';
    }

    return baseUrl + query;
}
