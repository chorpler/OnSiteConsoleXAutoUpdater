function(doc) {
  if(doc.username === 'ricomireles') {
    emit(doc._id, {
      'client': doc.client,
      'location': doc.location,
      'locID': doc.locID,
      'firstName': doc.firstName,
      'lastName': doc.lastName,
      'rprtDate': doc.rprtDate,
      'wONum': doc.wONum,
      'uNum': doc.uNum,
      'timeStarts': doc.timeStarts,
      'timeEnds': doc.timeEnds,
      'repairHrs': doc.repairHrs,
      'notes': doc.notes
      });
  }
}
