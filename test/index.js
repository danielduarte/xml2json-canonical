const { toJson, toXml } = require('../index');
const expect = require('expect');
const util = require('util');
const fs = require('fs');


function consolelog(...args) {
  console.log(util.inspect(...args, false, null, true));
}

const files = fs.readdirSync('./test/cases')
  .filter(f => f.toLowerCase().endsWith('.xml'));

describe('Test cases', function() {
  for (const f of files) {

    describe(`Case '${f}'`, function() {

      let fileContents = null;
      let json = null;
      let xml = null;

      before(function () {
        fileContents = fs.readFileSync(`./test/cases/${f}`, 'utf8');
      });

      it('Convert to JSON without error', function() {
        json = toJson(fileContents, {
          reportError: () => {},
        });
      });

      it('Convert back to XML without error', function() {
        xml = toXml(json);
      });

      it('Check XML against original', function() {
        expect(xml).toEqual(fileContents);
      });

    });

  }
});
