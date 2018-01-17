# notes

package.json, add:

```json
{
  "devDependencies": {
    "@types/node": "^8.0.53",
    "ts-node": "^3.3.0"
  }
}
```

Files which need node's fs module, add:

```js
  const fs = require('fs');
```
