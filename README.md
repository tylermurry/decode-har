# decode-har
This is an ultra-light command line utility that decodes the responses of a HAR file.

Specifically, this was built to make manipulating PollyJS captures easier as it saves the encoded and hex-chunked output which is hard to work with. 

## Installing
`npm install -g decode-har`

## Usage
`decodehar your_har_file.har`

This will create a new file called `your_har_file.har.decoded`
