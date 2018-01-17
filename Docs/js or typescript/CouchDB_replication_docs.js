var rep =
{
   "_id": "replicateCleanup4",
   "source": "http://admin:starmobile@192.168.0.80:5984/bak21_reports_ver101100",
   "target": "http://admin:starmobile@192.168.0.80:5984/aabk21_reports_ver101100",
   "create_target": true,
   "filter": "filters/deletedfilter",
   "owner": "admin",
   "continuous": false
}

var rep2 =
{
   "_id": "reports_ver101100_20171205105835.926",
   "source": "http://admin:starmobile@securedb.sesaonsite.com/reports_ver101100",
   "target": "http://admin:starmobile@securedb.sesaonsite.com/aaa001_reports_ver101100",
   "create_target": true,
   "filter": "filters/deletedfilter",
   "owner": "admin",
   "continuous": false
}

var rep3 =
{
   "_id": "reports_ver101100_20171205132211.170",
   "source": "http://admin:starmobile@securedb.sesaonsite.com/reports_ver101100",
   "target": "http://admin:starmobile@securedb.sesaonsite.com/aaa002_reports_ver101100",
   "create_target": true,
   "filter": "filters/recentfilter",
   "owner": "admin",
   "continuous": false
}

var v3 =
{
_id: "couchdb@127.0.0.1",
_rev: "1-967a00dff5e02add41819138abb3284d"
}

var v4 =
{
_id: "couchdbloa@loa",
_rev: "1-967a00dff5e02add41819138abb3284d"
}

var reportsViewFunction11 =
function(doc) {
  if(doc.rprtDate) {
    let recent = doc.rprtDate > "2017-12-01";
    return recent;
  }
}

var t3 = async () => {
  try {
    let res = await t2();
    return res;
  } catch (err) {
    console.log("Error waiting for t2!");
    console.error(err);
  }
}
var replicationStream = null;
var t2 = () => {
  return new Promise((resolve,reject) => {
    var c = onsiteconsole;
    let db1 = c.db.addDB('test01');
    let db2 = c.server.addRDB('aaa002_reports_ver101100');
    db1.info().then(out => {
      let total = 0, processed = 0;
      if(out.doc_count === 0 && out.update_seq === 0) {
        db2.info().then(out2 => {
          let docs = out2.doc_count;
          let seq  = out2.update_seq;
          // replicationStream = PouchDB.replicate(db1, db2, {live: true, retry: true})
          db1.replicate.from(db2)
          .on('change', (info) => {
            // let updates = info && info.change && info.change.docs && info.change.docs.length ? info.change.docs.length : 0;
            let updates = info.docs_written;
            let newdocs = info && info.docs && info.docs.length ? info.docs.length : 0;
            processed += newdocs;
            console.log(`Change event fired for '${out.db_name}' replication, ${newdocs} docs, ${updates}/${docs} synchronized so far:\n`, info);
          })
          // .on('paused', (err) => {
          //   console.log(`Pause event fired for '${out.db_name}' replication, finished replicating!`);
          //   console.log(err);
          //   console.error(err);
          //   replicationStream.cancel();
          //   resolve(err);
          // });
          .then(res => {
            console.log(`Replication finished for '${out.db_name}' replication!`);
            console.log(res);
            // replicationStream.cancel();
            resolve(res);
          })
        });
      } else {
        console.log(`Database exists, contains ${out.doc_count} documents.`);
        resolve(true);
      }
    }).catch(err => {
      console.log("Error replicating database.");
      console.error(err);
      reject(err);
    });
  });
}
