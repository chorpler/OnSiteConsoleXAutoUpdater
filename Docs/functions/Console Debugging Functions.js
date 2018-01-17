/* generate a random integer between min and max (inclusive) and optionally round it to the nearest ... anything */
var rando = function (min, max, roundToNearest) { let umin = min || 0; let umax = max || 10; let randInt = Math.trunc(Math.random() * (umax - umin)) + umin; let RTN = Number(roundToNearest); if (RTN !== undefined && RTN > 0 && RTN <= (max - min)) { randInt = Math.ceil(randInt / RTN) * RTN; if (randInt > max) { randInt = max; } else if (randInt < min) { randInt = min; } } return randInt; }

var hdr1 = new onsitehttpheaders().set("Authorization", "Basic YWRtaW46c3Rhcm1vYmlsZQ==").append("Content-Type", "application/json"); var headers = {"headers": hdr1}; onsitehttpclient.get('https://pico.sesa.us/sesa-config/keane_invoice_numbers?include_docs=true', headers).toPromise().then(t1).catch(c1)


var hdr1 = new onsitehttpheaders().set("Authorization", "Basic YWRtaW46c3Rhcm1vYmlsZQ==").append("Content-Type", "application/json"); var headers = {"headers": hdr1}; onsitehttpclient.get('https://pico.sesa.us/sesa-config/keane_invoice_numbers?include_docs=true', headers).toPromise().then(res => {console.log("Success!\n",res); window['kdoc1'] = res;}).catch(c1)

var kdoc = {_id: "keane_invoice_numbers", _rev: "18-9b97a3ec1385a26b267a13f945be6f21", type: "keane_invoice_numbers", invoice: 18500}

var hdr1 = new onsitehttpheaders().set("Authorization", "Basic YWRtaW46c3Rhcm1vYmlsZQ==").append("Content-Type", "application/json"); var headers = {"headers": hdr1}; onsitehttpclient.put('https://pico.sesa.us./sesa-config/keane_invoice_numbers', headers).toPromise().then(t1).catch(c1)


var reqbody = { count: 10 }; var hdr1 = new onsitehttpheaders().set("Authorization", "Basic YWRtaW46c3Rhcm1vYmlsZQ==").append("Content-Type", "x-www-form-urlencoded"); var headers = { "headers": hdr1 }; onsitehttpclient.post('https://pico.sesa.us/sesa-config/_design/ref/_update/counter/keane_invoice_numbers', reqbody, headers).toPromise().then(res => { console.log("Success!\n", res); window['kdoc1'] = res; }).catch(c1)



var hdr1 = new onsitehttpheaders().set("Authorization", "Basic YWRtaW46c3Rhcm1vYmlsZQ=="); var params = new onsitehttpparams().set("count", "10"); var options = { headers: hdr1, params: params }; onsitehttpclient.post('https://pico.sesa.us/sesa-config/_design/ref/_update/counter/keane_invoice_numbers', {}, options).toPromise().then(res => { console.log("Success!\n", res); window['kdoc1'] = res; }).catch(c1);


var hdr1 = new onsitehttpheaders().set("Authorization", "Basic YWRtaW46c3Rhcm1vYmlsZQ==").append("Content-Type", "x-www-url-encoded"); var params = new onsitehttpparams().set("count", "10"); var options = { headers: hdr1, params: params }; onsitehttpclient.post('https://pico.sesa.us/sesa-config/_design/ref/_update/counter/keane_invoice_numbers', { count: 10 }, options).toPromise().then(res => { console.log("Success!\n", res); window['kdoc1'] = res; }).catch(c1);

var hdr1 = new onsitehttpheaders().set("Authorization", "Basic YWRtaW46c3Rhcm1vYmlsZQ==").append("Content-Type", "x-www-url-encoded"); var params = new onsitehttpparams().set("count", "10"); var options = { headers: hdr1, params: params }; onsitehttpclient.post('https://pico.sesa.us/sesa-config/_design/ref/_update/counter/keane_invoice_numbers', { count: 10 }, options).toPromise().then(res => { console.log("Success!\n", res); window['kdoc1'] = res; }).catch(c1);

// This one may actually work for getting multiple Keane invoice numbers!
var reqbody = new onsiteurlsearchparams(); reqbody.set("count", "10"); hdr1 = new onsitehttpheaders().set("Authorization", "Basic YWRtaW46c3Rhcm1vYmlsZQ==").append("Content-Type", "application/x-www-form-urlencoded"); var options = { headers: hdr1 }; onsitehttpclient.post('https://pico.sesa.us/sesa-config/_design/ref/_update/counter/keane_invoice_numbers', reqbody.toString(), options).toPromise().then(res => { console.log("Success!\n", res); window['kdoc1'] = res; }).catch(c1);
