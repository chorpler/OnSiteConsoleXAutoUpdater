# Update function for generating sequential invoice numbers
- Sample URL to POST to for new number: https://securedb.sesaonsite.com/sesa-config/_design/ref/_update/counter
- Create a document in sesa-config (or wherever) as:
  ```json
  {
    "_id": "keane_invoice_numbers",
    "type": "keane_invoice_numbers",
    "invoice": 10000
  }
  ```
- Create design document _design/ref (or something other than 'ref')
- Create "updates" key with value:
  ```json
  { "counter": "" }
  ```
- Insert the following function in for the value. (Fauxton will let you do this neatly if you click in the string and then on the pencil icon in the left margin.)
  ```javascript
function(doc, req) {
  if(doc.type === 'keane_invoice_numbers') {
    var count = 1;
    if(req && req.form && req.form.count) {
      count = Number(req.form.count);
    }
    if(!doc.invoice) {
      doc.invoice = 18500;
    }
    var out = [];
    var val = doc.invoice;
    for(var i = 0; i < count; i++) {
      out.push(val + i);
    }
    doc.invoice += count;
    return [doc, toJSON(out)];
  }
}
  ```

##Example of original sesa-config/keane_invoice_numbers document
```json
{
  "_id": "keane_invoice_numbers",
  "_rev": "86-4a5d0189279b57aa97c6aeac1f2822ef",
  "type": "keane_invoice_numbers",
  "invoice": 18500
}
```
