# oEmbed plugin

This plugin renders oEmbed previews for the links that support them.

![oEmbed example](./public/oEmbed-example.png)

## Update provider dimensions file

The plugin needs to know the expected dimensions of the embed
representation for every provider in advance. To fetch them, there is
a script in the `generator` folder that runs an example query per
provider and saves the dimensions for the provider from the response.

To run the script, first go to the `generator` folder and install the
node dependencies:

```sh
cd generator
npm install
```

and with the dependencies installed, run:

```sh
npm run generate
```

the script will write a `provider-dimensions.json` file that you can
use to replace the `webapp/src/provider-dimensions.json` file before
building the plugin.
