#!/usr/bin/env node
/*!
 * Copyright (c) 2020 Daniel Duarte <danieldd.ar@gmail.com>
 * Licensed under MIT License. See LICENSE file for details.
 */

const { toJsonFromFileSync } = require('./index');

const xml2json = opts => {
  opts = Object.assign({
    files: [],
    output: 'print',
    pretty: false,
    profile: 'strict',
  }, opts);

  opts.files.forEach(f => {
    const jsObject = toJsonFromFileSync(f, opts.profile);
    const json = opts.pretty ? JSON.stringify(jsObject, null, 2) : JSON.stringify(jsObject);
    console.log(json);
  });
};

const getArgs = () => {
  const cliArgs = process.argv.slice(2);

  const args = {
    files: [],
  };

  const paramRE =  /^--([a-zA-Z0-9_-]+)=(.*)$/;
  const flagRE =  /^--([a-zA-Z0-9_-]+)$/;

  for (const arg of cliArgs) {
    if (arg.startsWith('--')) {

      let matches = paramRE.exec(arg);
      if (matches !== null) {
        args[matches[1]] = matches[2];
      } else {
        matches = flagRE.exec(arg);
        if (matches !== null) {
          args[matches[1]] = true;
        }
      }

    } else {
      args.files.push(arg);
    }
  }

  return args;
};


const args = getArgs();

xml2json(args);


module.exports = { xml2json };
