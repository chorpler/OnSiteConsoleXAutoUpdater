// I provide an API for updating many documents (encapsulating the fetch and
// subsequent .bulkDocs() call). This method will use either the .allDocs() method
// or the .query() method for fetching, depending on the invocation signature:
// --
// .updateMany( options, operator ) ==> Uses .allDocs()
// .updateMany( viewName, options, operator ) ==> Uses .query()
// --
// In each case, the "options" object is passed to the underlying fetch method.
// Each document in the resultant collection is then passed to the given operator
// function - operator( doc ) - to perform the update transformation.
//
// Plugins are installed by doing the following:
//
// PouchDB.plugin(nameOfPluginObject)
// or
// PouchDB.plugin({pluginname: function() {...}})


/* These are for the recursive function defined below */
declare var primaryResults, primaryDocs, pouch, operator;
declare var PouchDB, db;

/* Functions for creating this specific example */
// I ensure that a new database is created and stored in the given scope.
export const getPristineDatabase = (scope, handle) => {
  let dbName = "javascript-demos-pouchdb-playground";
  let newDB = new PouchDB(dbName);
  let promise = newDB.destroy().then(() => {
    // Store new, pristine database in to the given scope.
    return (scope[handle] = new PouchDB(dbName));
  });
  return (promise);
}

// I use the console.table() method to log the documents in the given results
// collection to the console.
export const renderResultsToConsole = (results) => {
  let docs = results.rows.map((row: any) => {
    return (row.doc)
  });
  console.table(docs);
}

// This is what you would actually call to run this example
export const initializePluginTest = () => {
  getPristineDatabase(window, "db").then(() => {
    // To experiment with the bulk update PLUGIN, we need to have documents
    // on which to experiment. Let's create some food products with names
    // and prices that we'll update with the bulk update plugin.
    var promise = db.bulkDocs([
      {
        _id: "apple:fuji",
        name: "Fuji",
        price: 1.05
      },
      {
        _id: "apple:applecrisp",
        name: "Apple Crisp",
        price: 1.33
      },
      {
        _id: "pear:bosc",
        name: "Bosc",
        price: 1.95
      },
      {
        _id: "apple:goldendelicious",
        name: "Golden Delicious",
        price: 1.27
      },
      {
        _id: "pear:bartlett",
        name: "Bartlett",
        price: 1.02
      }
    ]);
    return (promise);
  }).then(() => {
    // Now that we've inserted the documents, let's fetch all the Apples
    // and output them so we can see the pre-update values.
    let promise = db.allDocs({
      startkey: "apple:",
      endkey: "apple:\uffff",
      include_docs: true
    }).then(renderResultsToConsole);
    return (promise);
  }).then(() => {
    // Now, let's update the Apples, converting the name to uppercase. This
    // will run an .allDocs() and a .bulkDocs() under the hood.
    let promise = db.updateMany({
      startkey: "apple:",
      endkey: "apple:\uffff"
    }, (doc, i) => {
      doc.name += " ( UPDATED )";
      // ... HOWEVER ... since we want to demonstrate the retry ability
      // of the plugin, we are going to delete the _rev key for each
      // document AFTER THE FIRST INDEX. This way, each retry will only
      // be able to process the first document - the rest will result
      // in conflicts. Given 3 apples, we would expect the following
      // retry results:
      // --
      // Pass 1: [ ok, conflict, conflict ]
      // Pass 2: [ ok, conflict ]
      // Pass 3: [ ok ]
      // --
      // ==> results: [ ok, ok, ok ]
      if (i > 0) delete (doc._rev);
    });
    return (promise);
  }).then(() => {
    // Now that we've updated the Apples (with retries under the hood) let's
    // re-fetch the Apples to see how the values have changed.
    let promise = db.allDocs({
      startkey: "apple:",
      endkey: "apple:\uffff",
      include_docs: true
    }).then(renderResultsToConsole);
    return promise;
  }).catch((error) => {
    console.warn("An error occurred:");
    console.error(error);
  });
};


/* Utility functions */

// -- Utility methods for my PouchDB plugin. Thar be hoistin'! -- //
// I determine if any of the results contain a conflict.
export const containsConflicts = (results:any) => {
  for (let i = 0; i < results.length; i++) {
    if (isConflictResult(results[i])) {
      return (true);
    }
  }
  return false;
};

// I ensure that the given search options has the "include_docs" set to
// true. Since we are working on updating documents, it is important
// that we actually fetch the docs being updated. Returns options.
export const ensureIncludeDocs = (options:any) => {
  options.include_docs = true;
  return options;
};

// I return an array of doc._id values for any doc that has a conflict
// in the given results. This assumes that the given results were a
// product of a bulk operation on the given docs.
export const getConflictKeys = (docs:any, results:any) => {
  var keys = [];
  for (let i = 0; i < results.length; i++) {
    if(isConflictResult(results[i])) {
      keys.push(docs[i]._id);
    }
  }
  return keys;
}
// I determine if the given results are free from any conflicts.
export const isConflictFree = (results:any) => {
  return (!containsConflicts(results));
}

// I determine if the given result object is a conflict result.
export const isConflictResult = (result:any) => {
  return ((result.error === true) && (result.status === 409));
}

export var recursivelyProcessResults = (remainingRetries) => {
  // Return the results if we're done processing (either because
  // there are no conflicts or we ran out of retry attempts).
  if (isConflictFree(primaryResults) || !remainingRetries) {
    return (primaryResults);
  }
  console.warn("Retrying primary results (%s).", remainingRetries);
  // If we made it this far, we have Conflict results to try
  // and reprocess.
  //
  // Regardless of how we fetched the documents originally,
  // we now have document _id values to work with. Which
  // means, all retries can be done using .allDocs(keys).
  // --
  // NOTE: We need to re-fetch in order to get the source
  // document's most current revision. If we don't re-fetch,
  // we'll just keep getting conflicts over and over again.
  let retryPromise = pouch.allDocs({
      keys: getConflictKeys(primaryDocs, primaryResults),
      include_docs: true
    }).then((results) => {
      // Pass the RETRY docs through the operator.
      let docsToUpdate = results.rows.map((row, index, rows) => {
        return (operator(row.doc, index, rows) || row.doc);
      });
      return (pouch.bulkDocs(docsToUpdate));
    }).then((results:any) => {
      // Merge the retry results back into primary
      // results collection. This way, any successful
      // operations in the retry will now replace the
      // Conflict operations in the primary results.
      // Since we know that the retry docs and results
      // were processed in the same order as the
      // Conflicts in the primary results, we should be
      // able to zipper the results together, in order.
      for(let i = 0; i < primaryResults.length; i++) {
        // If we've found a conflict result in the
        // primary results, swap it with the NEXT
        // AVAILABLE retry result.
        if (isConflictResult(primaryResults[i])) {
          primaryResults[i] = results.shift();
        }
      }
      // At this point, we may have resolved all of
      // the conflicts; or, we may still have
      // conflicts after the merge. Call retry function
      // recursively (with one less possible retry) so
      // that we can reexamine the results.
      return (recursivelyProcessResults(remainingRetries - 1));
    }).catch((error) => {
      // If anything in the retry-operation fails catastrophically,
      // just bail out and return the primary results in their last
      // know state.
      console.warn("Aborting out of retry to due to critical failure.");
      console.log(error);
      return primaryResults;
    });
  return (retryPromise);
}

/* The actual PouchDB plugin */
export const bulkUpdateWithRetry = {
  updateMany: function (...argumentList:Array<any>) {
     /* arguments are:
        ([ viewName, ] options, operator)
      */
    let pouch = global['PouchDB'] || window['PouchDB'] || this;
    // CAUTION: Top-level errors MAY NOT be caught in a Promise.
    // .allDocs() invocation signature: ( options, operator ).
    let viewName, options, operator, promiseResult;
    if (argumentList.length === 2) {
      options = argumentList[0];
      operator = argumentList[1];
      promiseResult = pouch.allDocs(ensureIncludeDocs(options));
      // .query() invocation signature: ( viewName, options, operator ).
    } else {
      viewName = argumentList[0];
      options = argumentList[1];
      operator = argumentList[2];
      promiseResult = pouch.query(viewName, ensureIncludeDocs(options));
    }
    // This plugin will retry [portions of] the bulk update operation if some
    // of the results come back as 409-Conflicts. Since conflict documents do
    // not report which document ID they are referring to, we have to keep
    // track of the primary documents and results objects so that we can
    // merge subsequent results back into the primary results using the order
    // in which various things are returned.
    let primaryDocs = null;
    let primaryResults = null;

    // Even though the results are potentially coming back from two different
    // search methods - .allDocs() or .query() - the result structure from
    // both methods is the same. As such, we can count on the following keys
    // to exist in the results:
    // --
    // * offset
    // * total_rows
    // * rows : [{ doc }]
    // --
    promiseResult = promiseResult.then((results:any) => {
      // Pass the source docs through the operator.
      let docsToUpdate = results.rows.map((row, index, rows) => {
        return (operator(row.doc, index, rows) || row.doc);
      });
      // Keep track of the primary documents so that we can match
      // results to document IDs using the index order.
      primaryDocs = docsToUpdate;
      return pouch.bulkDocs(docsToUpdate);
    }).then((results:any) => {
      // Keep track of the primary results so that we can check for
      // conflicts and merge subsequent results back into the fold.
      // At this point, ( primaryDocs[ i ] ==> primaryResults[ i ] ).
      primaryResults = results;
      return (3 /* Potential retries */);
    }).then(
      // CAUTION: This portion of the Promise chain is the "retry" portion
      // and will be called recursively. This method assumes access to the
      // primary Docs and Results collection, and will recursively extract
      // conflicts from the primary results, reprocess those documents, and
      // merge them back into the primary results.
      function recursivelyProcessResults(remainingRetries) {
        // Return the results if we're done processing (either because
        // there are no conflicts or we ran out of retry attempts).
        if (isConflictFree(primaryResults) || !remainingRetries) {
          return (primaryResults);
        }
        console.warn("Retrying primary results (%s).", remainingRetries);
        // If we made it this far, we have Conflict results to try
        // and reprocess.
        var retryPromise = pouch
          // Regardless of how we fetched the documents originally,
          // we now have document _id values to work with. Which
          // means, all retries can be done using .allDocs(keys).
          // --
          // NOTE: We need to re-fetch in order to get the source
          // document's most current revision. If we don't re-fetch,
          // we'll just keep getting conflicts over and over again.
          .allDocs({
            keys: getConflictKeys(primaryDocs, primaryResults),
            include_docs: true
          })
          .then(
          function (results) {
            // Pass the RETRY docs through the operator.
            var docsToUpdate = results.rows.map(
              function iterator(row, index, rows) {
                return (operator(row.doc, index, rows) || row.doc);
              }
            );
            return (pouch.bulkDocs(docsToUpdate));
          }).then((results) => {
            // Merge the retry results back into primary
            // results collection. This way, any successful
            // operations in the retry will now replace the
            // Conflict operations in the primary results.
            // Since we know that the retry docs and results
            // were processed in the same order as the
            // Conflicts in the primary results, we should be
            // able to zipper the results together, in order.
            for (let i = 0; i < primaryResults.length; i++) {
              // If we've found a conflict result in the
              // primary results, swap it with the NEXT
              // AVAILABLE retry result.
              if (isConflictResult(primaryResults[i])) {
                primaryResults[i] = results.shift();
              }
            }
            // At this point, we may have resolved all of
            // the conflicts; or, we may still have
            // conflicts after the merge. Call retry function
            // recursively (with one less possible retry) so
            // that we can reexamine the results.
            return (recursivelyProcessResults(remainingRetries - 1));
          }).catch((error) => {
            // If anything in the retry-operation fails catastrophically,
            // just bail out and return the primary results in their last
            // know state.
            console.warn("Aborting out of retry to due to critical failure.");
            console.log(error);
            return (primaryResults);
          });
        return (retryPromise);
      });
    return (promiseResult);
  }
};
