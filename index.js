#!/usr/bin/env node

const fs = require('fs');
const { ungzip } = require('node-gzip');

function mergeChunks (chunks) {
  if (!chunks || chunks.length === 0) { return Buffer.alloc(0) }
  if (!Buffer.isBuffer(chunks[0])) { return chunks.join('') }

  return Buffer.concat(chunks);
}

function getContentEncodingHeader(headers) {
  return headers.filter(h => h.name === 'content-encoding')[0];
}

function getContentEncoding(headers) {
  const header = getContentEncodingHeader(headers);
  return header ? header.value : null;
}

function isUtf8Representable(buffer) {
  return Buffer.from(buffer.toString('utf8'), 'utf8').equals(buffer)
}

function getChunksFromBody(body, headers) {
  if (!body) { return [] }
  if (Buffer.isBuffer(body)) { return [body] }

  if (getContentEncoding(headers)) {
    return JSON.parse(body)
      .map(chunk => Buffer.from(chunk, 'hex'));
  }

  const buffer = Buffer.from(body);

  return [Buffer.from(buffer, isUtf8Representable(buffer) ? 'utf8' : 'hex')];
}

const run = async () => {
  const harPath = process.argv[2];
  const harFile = JSON.parse(fs.readFileSync(harPath, 'utf8'));

  for (const [index, entry] of harFile.log.entries.entries()) {
    const headers = entry.response.headers;
    let content = getChunksFromBody(entry.response.content.text, headers);

    if (getContentEncoding(headers) === 'gzip') {
      content = await ungzip(mergeChunks(content));

      headers.splice(headers.indexOf(getContentEncodingHeader(headers)), 1);
    }

    harFile.log.entries[index].response.content.text = content.toString('utf8');
  }

  fs.writeFileSync(`${harPath}.decoded`, JSON.stringify(harFile, null, 2), 'utf8');

  console.log(`Successfully decoded file to ${harPath}.decoded`);
};

run();
