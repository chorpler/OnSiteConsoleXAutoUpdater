// import { sprintf                                                                           } from 'sprintf-js'                        ;
// import { Injectable                                                                        } from '@angular/core'                     ;
// import { Log, moment, Moment, isMoment, dec, Decimal, _matchCLL, _matchSite                } from '../config/config.functions'        ;

// export const binarySearch = (arr, docId) => {
//   var low = 0, high = arr.length, mid;
//   while (low < high) {
//     mid = (low + high) >>> 1; // faster version of Math.floor((low + high) / 2)
//     arr[mid]._id < docId ? low = mid + 1 : high = mid
//   }
//   return low;
// };

// @Injectable()
// export class DBMemSync {
//   public
//   public onDeleted(id) {
//     var index = binarySearch(docs, id);
//     var doc = docs[index];
//     if (doc && doc._id === id) {
//       docs.splice(index, 1);
//     }
//   }

//   function onUpdatedOrInserted(newDoc) {
//     var index = binarySearch(docs, newDoc._id);
//     var doc = docs[index];
//     if (doc && doc._id === newDoc._id) { // update
//       docs[index] = newDoc;
//     } else { // insert
//       docs.splice(index, 0, newDoc);
//     }
//   }

//   function fetchInitialDocs() {
//     return db.allDocs({include_docs: true}).then(function (res) {
//       docs = res.rows.map(function (row) { return row.doc; });
//       renderDocs();
//     });
//   }

//   function reactToChanges() {
//     db.changes({live: true, since: 'now', include_docs: true}).on('change', function (change) {
//       if (change.deleted) {
//         // change.id holds the deleted id
//         onDeleted(change.id);
//       } else { // updated/inserted
//         // change.doc holds the new doc
//         onUpdatedOrInserted(change.doc);
//       }
//       renderDocs();
//     }).on('error', console.log.bind(console));
//   }

//   function renderDocs() {
//     // this is a naive way to render documents. presumably
//     // your framework of choice (React, Angular, etc.) would have
//     // a more efficient way of doing this.
//     var ul = document.getElementById('the-list');
//     ul.innerHTML = docs.map(function (doc) {
//       return '<li><pre>' + JSON.stringify(doc, undefined, '  ') + '</pre></li>'
//     }).join('');
//   }

//   function insertRandomDoc() {
//     db.put({_id: Date.now().toString()}).catch(console.log.bind(console));
//   }

//   function updateRandomDoc() {
//     if (!docs.length) {
//       return;
//     }
//     var randomDoc = docs[Math.floor(Math.random() * docs.length)];
//     db.get(randomDoc._id).then(function (doc) {
//       if (!doc.updatedCount) {
//         doc.updatedCount = 0;
//       }
//       doc.updatedCount++;
//       return db.put(doc);
//     }).catch(console.log.bind(console));
//   }

//   function deleteRandomDoc() {
//     if (!docs.length) {
//       return;
//     }
//     var randomDoc = docs[Math.floor(Math.random() * docs.length)];
//     db.get(randomDoc._id).then(function (doc) {
//       return db.remove(doc);
//     }).catch(console.log.bind(console));
//   }

// }
