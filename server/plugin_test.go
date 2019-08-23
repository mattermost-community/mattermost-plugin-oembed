package main

import (
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestServeHTTP(t *testing.T) {
	assert := assert.New(t)
	plugin := Plugin{}

	mockedServerResponse := `{"message": "oEmbed response"}`

	// start a test server that replies with a mocked response
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(mockedServerResponse))
	}))
	defer server.Close()

	t.Run("If the body is empty, the response should be a 404", func(t *testing.T) {
		w := httptest.NewRecorder()
		r := httptest.NewRequest(http.MethodPost, "/", nil)

		plugin.ServeHTTP(nil, w, r)

		result := w.Result()
		assert.NotNil(result)

		assert.Equal(result.StatusCode, http.StatusNotFound)
	})

	t.Run("If the body contains an URL, the response should be the result of querying the URL", func(t *testing.T) {
		w := httptest.NewRecorder()
		r := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(server.URL))

		plugin.ServeHTTP(nil, w, r)

		result := w.Result()
		assert.NotNil(result)

		assert.Equal(result.StatusCode, http.StatusOK)

		bodyBytes, err := ioutil.ReadAll(result.Body)
		assert.Nil(err)
		bodyString := string(bodyBytes)

		assert.Equal(mockedServerResponse, bodyString)
	})
}
