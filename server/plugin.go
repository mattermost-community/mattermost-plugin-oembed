package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"

	"github.com/mattermost/mattermost-server/v5/plugin"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	urlBytes, _ := ioutil.ReadAll(r.Body)
	url := string(urlBytes)

	if url == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	resp, err := http.Get(url)
	if err != nil {
		fmt.Fprintf(w, "Error getting response from %s\n%s", url, err)
		w.WriteHeader(http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Fprintf(w, "Error reading response from %s\n%s", url, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(respBody)
}
