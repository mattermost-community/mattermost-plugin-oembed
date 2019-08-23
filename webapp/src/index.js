import {id as pluginId} from './manifest';
import OEmbed from './oEmbed';
import {getProviderForUrl} from './utils';

export default class Plugin {
    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        const matcher = ({url}) => {
            return Boolean(getProviderForUrl(url));
        };

        registry.registerPostWillRenderEmbedComponent(matcher, OEmbed, true);
    }
}

window.registerPlugin(pluginId, new Plugin());
