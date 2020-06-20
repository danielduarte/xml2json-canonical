# xml2json-canonical :zap:

An XML to JSON converter that preserves everything from the original XML in a canonical JSON representation easy to work with, modify, and convert back to XML.

## Features

- Conversion from XML to canonical JSON.
- Conversion from canonical JSON to XML.
- Available as a Node.js or Deno module.
- CLI tool from the command line. [:construction_worker:**under dev**]
- Configurable output
- Conversion from strings or files, sync or async

## Quickstart

```JavaScript
const { toJson } = require('xml2json-canonical');

const xml = `
  <?xml version="1.0" encoding="UTF-8"?>
  <project version="1.0.2">
    <component name="example" anotherAttr="some value" />
    <more>text</more>
  </project>
`;

const json = toJson(xml, 'compact');

console.log(json);
```

> Output:
```JavaScript
{
  type: 'xml',
  content: {
    type: 'element',
    name: 'project',
    attrs: { version: '1.0.2' },
    content: [
      {
        type: 'element',
        name: 'component',
        attrs: { name: 'example', anotherAttr: 'some value' },
        selfClosing: true
      },
      {
        type: 'element',
        name: 'more',
        content: 'text',
        selfClosing: false
      }
    ],
    selfClosing: false
  }
}
```

This is a condensed output obtained using the profile `'compact'`. Check [other profiles](#profiles).

## API

| Function                     | Details                                                                                                                                              |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **toJson**(xmlStr)               | Converts an XML string into JSON. See [options](#options) to configure conversions.                                                                              |
| **toJsonFromFile**(filepath)     | Converts an XML file into JSON returning a Promise for async programming. See [options](#options) to configure conversions.                                      |
| **toJsonFromFileSync**(filepath) | Converts an XML file into JSON synchronously. See [options](#options) to configure conversions.                                                                 |
| **toXml**(jsObject)              | Converts a JavaScript object into XML. The object must be in the canonical XML format, which is the returned format by any of the previous functions. |

## Options

You can customize several details of the output, or just [GO TO ACTION](#profiles).

To customize the JSON output, all the functions to convert from XML to JSON (`toJson`, `toJsonFromFile`, `toJsonFromFileSync`) have the same possible set of options as an object in the second parameter. None of them are mandatory and all have a default value.

```JavaScript
const json = toJson(xml, {
  skipEmptyTexts: [boolean],
  textNodesToStr: [boolean],
  extractOnlyChilds: [boolean],
  omitEmptyAttrs: [boolean],
  omitEmptyContent: [boolean],
  reportError: (msg: [string]) => { /* your custom code */ },
});
```

| Option | Default | Details |
|--|--|--|
| **skipEmptyTexts** [_boolean_] | `false` | If `true`, text nodes formed only by whitespace characters (CR, LR, tabs and spaces) are ignored. |
| **textNodesToStr** [_boolean_] | `false` | If `true`, text nodes are returned as strings. If `false`, pure canonical form is preserved. |
| **extractOnlyChilds** [_boolean_] | `false` | If `true`, elements with a single child node have that only child directly in the field `content` without having an array with that only element. If `false`, pure canonical form is preserved. |
| **omitEmptyAttrs** [_boolean_] | `false` | If `true`, elements with no attributes omit the field `attrs`. Otherwise, the field `attrs` is included with an empty object (`attrs: {}`) preserving pure canonical form. |
| **omitEmptyContent** [_boolean_] | `false` | If `true`, elements with no children nodes omit the field `content`. Otherwise the field `content` is included with an empty array (`content: []`) preserving pure canonical form. |
| **reportError** [_function: (msg: string)_=> {}] | Errors are printed out to the standard error output | Callback to receive parsing errors. It is executed on every error passing a descriptive message. To ignore errors set it to `() => {}`. |


## Profiles

Use a profile name as second parameter instead of specifying options:
```JavaScript
toJson(xml, 'simple');
```

### Profile: 'compact'

```JavaScript
const json = toJson(xml, 'compact');
```
The most compact representation in JSON format. Take into account that this profile looses the text nodes that are purely composed by whitespace characters (LR, CR, tabs and spaces), which are in most cases not used. To keep those strings in the result use the default options (omitting the second parameter), or use another profile like `'strict'`. Also you can specify customized options instead of profiles as the second parameter and set `skipEmptyTexts: false`.

> Output:
```JavaScript
{
  type: 'xml',
  content: {
    type: 'element',
    name: 'project',
    attrs: { version: '1.0.2' },
    content: [
      {
        type: 'element',
        name: 'component',
        attrs: { name: 'example', anotherAttr: 'some value' },
        selfClosing: true
      },
      {
        type: 'element',
        name: 'more',
        content: 'text',
        selfClosing: false
      }
    ],
    selfClosing: false
  }
}
```

### Profile: 'simple'

```JavaScript
const json = toJson(xml, 'simple');
```
Similar to `'compact'` but purely canonical, which makes it easier to process.

This profile ensures that all fields are always present, and they are always of the same type:

- Even when an element does not have attributes, the field `attrs` is present as `attrs: {}`.
- Even when an element does not have children nodes, the field `content` is present as `content: [],`.
- Even when an element has a single child, it is returned in the field `content` as an array element. So, instead of `content: { ... the node... }`, the result is `content: [{ ... the node... }]`.
- Text nodes are always returned as canonical nodes like `{ type: 'text', content: 'some text' }` instead of returning a string like `'some text'`.

> Output:
```JavaScript
{
  type: 'xml',
  content: [
    {
      type: 'element',
      name: 'project',
      attrs: { version: '1.0.2' },
      content: [
        {
          type: 'element',
          name: 'component',
          attrs: { name: 'example', anotherAttr: 'some value' },
          content: [],
          selfClosing: true
        },
        {
          type: 'element',
          name: 'more',
          attrs: {},
          content: [ { type: 'text', content: 'text' } ],
          selfClosing: false
        }
      ],
      selfClosing: false
    }
  ]
}
```

### Profile: 'strict' _(default)_

```JavaScript
const json = toJson(xml); // Omitted since it's the default profile
```
Similar to `'simple'` but including the text nodes that are purely formed by whitespace characters.

Useful to preserve XML indentation and values formed by only spaces.

> Output:
```JavaScript
{
  type: 'xml',
  content: [
    { type: 'text', content: '\n  ' },
    {
      type: 'element',
      name: 'project',
      attrs: { version: '1.0.2' },
      content: [
        { type: 'text', content: '\n    ' },
        {
          type: 'element',
          name: 'component',
          attrs: { name: 'example', anotherAttr: 'some value' },
          content: [],
          selfClosing: true
        },
        { type: 'text', content: '\n    ' },
        {
          type: 'element',
          name: 'more',
          attrs: {},
          content: [ { type: 'text', content: 'text' } ],
          selfClosing: false
        },
        { type: 'text', content: '\n  ' }
      ],
      selfClosing: false
    },
    { type: 'text', content: '\n' }
  ]
}
```

## Notes

- Note that the resulting outputs are JavaScript objects for easy manipulation, which means that if you need the actual JSON string representation, you have to call `JSON.stringity(...)`.

- When converting from XML to JSON and back to XML, in most cases the result is exactly the same as the original input, except for some edge cases where it is equivalent but with slight differences:
  - *Case 1*: Only one space between attributes is preserved: <code>&lt;elem&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;attr1="val1"&nbsp;&nbsp;&nbsp;attr2="val2"&nbsp;&nbsp;&nbsp;&gt;</code> is converted to `<elem attr1="val1" attr2="val2">`.
  - *Case 2*: Self-closing elements have always an space before close: `<elem/>` is converted to `<elem />`.

## Future

- Add option to auto-stringify output.
- Convert to XML from JSON strings.
- [Suggest your own idea](https://github.com/danielduarte/xml2json-canonical/issues/new).

## Having issues?

Feel free to report any issues :bug: or feature request :bulb: in [Github repo](https://github.com/danielduarte/xml2json-canonical/issues/new).
