import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {id as pluginId} from './manifest';
import {getDimensionsForProvider, getOEmbedUrl, getProviderForUrl} from './utils';

export default class OEmbed extends Component {
    static propTypes = {
        embed: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }),
    };

    constructor(props) {
        super(props);

        this.oembedUrl = getOEmbedUrl(this.props.embed.url);
        const provider = getProviderForUrl(this.props.embed.url);
        this.dimensions = getDimensionsForProvider(provider.provider_name);
        this.state = {
            html: null,
            thumbnailUrl: null,
        };
    }

    componentDidMount() {
        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: this.oembedUrl,
        };

        fetch(`/plugins/${pluginId}/`, options).
            then((res) => res.json()).
            then((res) => {
                if (res.html) {
                    this.setState({html: res.html});
                } else {
                    this.setState({thumbnailUrl: res.thumbnail_url});
                }
            }).
            catch((err) => {
                // eslint-disable-next-line no-console
                console.error(err);
            });
    }

    render() {
        const {html, thumbnailUrl} = this.state;

        if (this.dimensions === null) {
            return <p>{'Plugin error: Invalid oEmbed provider dimensions'}</p>;
        }

        const style = {
            width: `${this.dimensions.width}px`,
            height: `${this.dimensions.height}px`,
        };

        const iframeStyle = {
            ...style,
            border: 0,
        };

        let inner;
        if (html) {
            if (html.startsWith('<iframe')) {
                inner = <div dangerouslySetInnerHTML={{__html: html}}/>;
            } else {
                inner = (
                    <iframe
                        style={iframeStyle}
                        src={`data:text/html,${html}`}
                    />
                );
            }
        }

        if (thumbnailUrl) {
            inner = <img src={thumbnailUrl}/>;
        }

        return (
            <div style={style}>{inner}</div>
        );
    }
}
