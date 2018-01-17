/* /reports/_design/ref/lists/reportsHTML */
function(head, req) {
  provides("html", function() {
    var line = 0,
      row = null,
      c = {},
      out = [],
      html = "";
    html += "<html>\n<head>\n<title>Work Order Reports</title>\n</head>\n<body>\n<table>\n";
    while (row = getRow()) {
      var doc = row.value;
      var colNames = Object.keys(doc);
      var colNum = colNames.length;
      var oneLine = "<tr>\n";
      if (line++ == 0) {
        for (var i = 0; i < colNum; i++) {
          var hdr = colNames[i];
          /* if(i == 0) {
            oneLine += hdr;
          } else {
            oneLine += "\t" + hdr;
          } */
          oneLine += "<th>" + hdr + "</th>\n";
        }
      }
      oneLine += "</tr>\n</thead>\n<tbody>\n";
      html += oneLine;
      oneLine = "<tr>\n";
      for (var i = 0; i < colNum; i++) {
        var col = doc[colNames[i]];
        /* if (i == 0) {
          oneLine += JSON.stringify(col);
        } else {
          oneLine += "\t" + JSON.stringify(col);
        } */
        oneLine += "<td>" + JSON.stringify(col) + "</td>\n";
      }
      oneLine += "</tr>\n";
      html += oneLine;
      /* out.push(row.value); */
    }
    c = { 'docs': out };
    /* return JSON.stringify(c); */
    html += "</tbody>\n</table>\n</body>\n</html>\n";
    return html;
  });
}
