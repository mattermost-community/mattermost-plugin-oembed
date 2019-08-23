import React, {Component} from 'react';

import {id as pluginId} from './manifest';
import {getOEmbedUrl} from './utils';

export default class OEmbed extends Component {
    constructor(props) {
        super(props);

        // eslint-disable-next-line react/prop-types
        this.oembedUrl = getOEmbedUrl(this.props.embed.url);
        this.state = {
            html: null,
            thumbnailUrl: null,
        };
    }

    async componentWillMount() {
        try {
            const res = await (await fetch(`/plugins/${pluginId}/`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: this.oembedUrl,
            })).json();

            if (res.html) {
                this.setState({html: res.html});
            } else {
                this.setState({thumbnailUrl: res.thumbnail_url});
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
    }

    render() {
        const {html, thumbnailUrl} = this.state;

        if (html) {
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }

        if (thumbnailUrl) {
            return <img src={thumbnailUrl}/>;
        }

        return null;
    }
}
