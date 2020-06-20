/*!
 * Copyright (c) 2020 Daniel Duarte <danieldd.ar@gmail.com>
 * Licensed under MIT License. See LICENSE file for details.
 */

const fs = require('fs');
const sax = require('sax');

const defaultOptions = {
  skipEmptyTexts: false,
  textNodesToStr: false,
  extractOnlyChilds: false,
  omitEmptyAttrs: false,
  omitEmptyContent: false,
  reportError: msg => {
    console.error('Error:', msg);
  },
};

const optProfiles = {
  compact: {
    skipEmptyTexts: true,
    textNodesToStr: true,
    extractOnlyChilds: true,
    omitEmptyAttrs: true,
    omitEmptyContent: true,
  },
  simple: {
    skipEmptyTexts: true,
  },
  strict: defaultOptions
};

class Stack {
  constructor() {
    this.stack = [];
  }
  top() {
    return this.stack[this.stack.length - 1];
  }
  push(x) {
    this.stack.push(x);
  }
  pop() {
    return this.stack.pop();
  }
}

const toXml = (json) => {

  // Make sure text nodes are in canonical form (see option textNodesToStr)
  if (typeof json === 'string') {
    json = {
      type: 'text',
      content: json,
    };
  }

  // Make sure content field always exists (see option omitEmptyContent)
  json.content = json.content ? json.content : [];

  // Make sure content field is always an array (see option extractOnlyChilds)
  json.content = Array.isArray(json.content) ? json.content : [json.content];

  switch (json.type) {
    case 'xml': {
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
      return xmlHeader + json.content.map(child => toXml(child)).join('');
    }
    case 'text':
      return json.content[0]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    case 'comment':
      return `<!--${json.content[0]}-->`;
    case 'cdata':
      return `<![CDATA[${json.content[0]}]]>`;
    case 'element': {
      const attrsStr = Object.entries(json.attrs || {}).reduce((acc, [k, v]) => {
        return acc + ` ${k}="${v}"`;
      }, '');

      const childrenStr = json.content.map(child => toXml(child)).join('');

      if (json.selfClosing) {
        return `<${json.name}${attrsStr} />`;
      } else {
        return `<${json.name}${attrsStr}>${childrenStr}</${json.name}>`;
      }
    }
    default:
      opts.reportError('Not recognized XML node type: ' + json.type);
  }
};


const toJson = (xmlStr, options) => {
  let userOptions = options;
  if (typeof userOptions === 'string') {
    userOptions = optProfiles[userOptions];
  }

  const opts = { ...defaultOptions, ...userOptions };

  const strict = true; // If false, it parses in HTML mode
  const parser = sax.parser(strict);
  const stack = new Stack();
  let json = null;

  // Event listeners:

  parser.onerror = function (e) {
    opts.reportError(e.message);
  };

  parser.onready = function () {
    const n = {
      type: 'xml',
      content: [],
    };
    stack.push(n);
  };

  parser.ontext = function (t) {

    if (opts.skipEmptyTexts && /^[ \n\r\t]+$/.test(t)) {
      return;
    }

    let n;
    if (opts.textNodesToStr) {
      n = t;
    } else {
      n = {
        type: 'text',
        content: t,
      };
    }

    stack.top().content.push(n);
  };

  parser.oncomment = function (c) {
    const n = {
      type: 'comment',
      content: c,
    };
    stack.top().content.push(n);
  };

  parser.oncdata = function (cd) {
    const n = {
      type: 'cdata',
      content: cd,
    };
    stack.top().content.push(n);
  };

  parser.onopentag = function (node) {
    const n = {
      type: 'element',
      name: node.name,
      attrs: node.attributes,
      content: [],
      selfClosing: node.isSelfClosing,
    };

    if (opts.omitEmptyAttrs && Object.keys(n.attrs).length === 0) {
      delete n.attrs;
    }

    stack.top().content.push(n);
    stack.push(n);
  };

  parser.onclosetag = function () {
    const n = stack.pop();

    if (opts.omitEmptyContent && n.content.length === 0) {
      delete n.content;
    }

    if (opts.extractOnlyChilds && n.content && n.content.length === 1) {
      n.content = n.content[0];
    }
  };

  parser.onend = function () {
    json = stack.pop();

    if (opts.extractOnlyChilds && json.content.length === 1) {
      json.content = json.content[0];
    }
  };

  parser.onready();

  parser.write(xmlStr).close();

  return json;
};

const toJsonFromFile = (filepath, options) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, contents) => {
      if (err) { reject(err); }
      resolve(toJson(contents, options));
    });
  });
};

const toJsonFromFileSync = (filepath, options) => {
  const contents = fs.readFileSync(filepath, 'utf8');
  return toJson(contents, options);
};

module.exports = { toJson, toJsonFromFile, toJsonFromFileSync, toXml };
