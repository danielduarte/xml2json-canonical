# xml2json-canonical :zap:

XML to JSON converter preserving everything from the original XML in a canonical JSON representation easy to work with, modify, and convert back to XML.

## Features

- Converts XML to canonical JSON.
- Converts back from canonical JSON to XML.
- Can be used as a Node.js or Deno module.
- Can be used as a CLI tool from your command line. [:construction_worker:**under dev**]
- Configurable output
- Convert directly from strings or files, sync or async

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

This is a condensed output obtained using the profile `'compact'`. Check [the other profiles](#profiles).

## API

| Function                     | Details                                                                                                                                              |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **toJson**(xmlStr)               | Converts an XML string into JSON. See options to configure conversions.                                                                              |
| **toJsonFromFile**(filepath)     | Converts an XML file into JSON returning a Promise for async programming. See options to configure conversions.                                      |
| **toJsonFromFileSync**(filepath) | Converts an XML file into JSON synchronously. See options to configure conversions.                                                                 |
| **toXml**(jsObject)              | Converts a JavaScript object into XML. The object must be in the canonical XML format, that is the format returned by any of the previous functions. |

## Options

You can customize several details of the output (continue reading here), or just [GO TO ACTION](#profiles).

To customize the JSON output, all the function to convert from XML to JSON (`toJson`, `toJsonFromFile`, `toJsonFromFileSync`) have the same possible set of options as an object in the second parameter. None of them are mandatory and all have a default value.

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

| Option | Details |
|--|--|
| **skipEmptyTexts** [_boolean_] | If `true` ignores text nodes formed only by whitespace characters (CR, LR, tabs and spaces). Defaults to `false`. |
| **textNodesToStr** [_boolean_] | If `true` text nodes are returned simply as strings for easy manipulation. For purely canonical form, set it to `false`. Defaults to `false`. |
| **extractOnlyChilds** [_boolean_] | If `true` elements with only one child node has that only child directly in the field `content` without having an array with that only element. For purely canonical form, set it to `false`. Defaults to `false`. |
| **omitEmptyAttrs** [_boolean_] | If `true` elements with no attributes does not have the field `attrs`. If `false` the field `attrs` is included with an empty object (`attrs: {}`). For purely canonical form, set it to `false`. Defaults to `false`. |
| **omitEmptyContent** [_boolean_] | If `true` elements with no children nodes does not have the field `content`. If `false` the field `content` is included with an empty array (`content: []`). For purely canonical form, set it to `false`. Defaults to `false`. |
| **reportError** [_function: (msg: string)_=> {}] | Callback to receive parsing errors. If is executedon every error thrown passing an error message with the details. By default errors are printed out to the standard error output. To ignore errors set it to `() => {}`. |


## Profiles

Use a profile name as second parameter instead of specifying options:
```JavaScript
toJson(xml, 'simple');
```

### Profile: 'compact'

```JavaScript
const json = toJson(xml, 'compact');
```
The most compact representation in JSON format. Take into account that this profile looses the text nodes that are purely composed by whitespace characters (LR, CR, tabs and spaces), which are in most cases not used. To keep those strings in the result, please use the default options (omitting the second parameter), or use another profile like `'strict'`. Also you can specify customized options instead of profiles as the second parameter and set `skipEmptyTexts: false`.

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
Similar to 'compact' but purely canonical, which makes easier to process, being sure that all fields are always present, and they are always of the same type.

Here're some details:

- If an element does not have attributes, the field `attrs` is included anyways as `attrs: {}`.
- If an element does not have children nodes, the field `content` is included anyways as `content: [],`.
- If an element has only one child, it is returned in the field `contect` in an array (the same as if it would have many). So, instead of `content: { ... the node ... }`, it returns `content: [{ ... the node ... }]`.
- Text nodes are not returned simple as a string like `'some text'`, but they are returned as a canonical node like `{ type: 'text', content: 'some text' }`.

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

### Profile: 'strict' _(same as default)_

```JavaScript
const json = toJson(xml); // Omitted since it's the default profile
```
Similar to 'simple' but includes also the text nodes that are purely whitespace characters.
Useful if it's important for you to preserve XML indentation and values formed by spaces.

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

- Note that the outputs got are JavaScript objects for easy manipulation, which means that if you need actual JSON output, you have to call `JSON.stringity(...)` with the result.

- When converting from XML to JSON **and back to XML**, in most of the cases the result is the original, except for some edge cases where the result is equivalent with slight differences:
  - *Case 1*: Only one space between attributes is preserved: <code>&lt;elem&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;attr1="val1"&nbsp;&nbsp;&nbsp;attr2="val2"&nbsp;&nbsp;&nbsp;&gt;</code> is converted to `<elem attr1="val1" attr2="val2">`.
  - *Case 2*: Self-closing elements have always an space before close: `<elem/>` is converted to `<elem />`.

## Future

- Add option to auto-stringify output.
- Convert to XML from JSON strings.
- [Suggest your own idea](https://github.com/danielduarte/xml2json-canonical/issues/new).

## Having issues?

Feel free to report any issues :bug: or feature request :bulb: in [Github repo](https://github.com/danielduarte/xml2json-canonical/issues/new).
