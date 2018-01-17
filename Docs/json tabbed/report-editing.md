

```js
{
	`_id`	:	`aadiaz_2017-07-24_21-08-58_-0600_Mon`	
	`_rev`	:	`1-f057905ddce82b67c340d396520d0b24`	
	`client`	:	`HALLIBURTON`	,	
	`firstName`	:	`Alexis`	,	
	`lastName`	:	`Diaz`	,	
	`loc2nd`	:	`NA`	,	
	`locID`	:	`PMPSHP`	,	
	`location`	:`ARTESIA`,
	"notes":"Q10 cracked pod #3",
	`payrollPeriod`	:42935,
	`payroll_period`	:42935,
	`repairHrs`	:12,
	`rprtDate`	:	`2017-07-24`	
	`shift`	:	`AM`	,	
	`shiftLength`	:12,
	`shiftSerial`	:	`42935_06`	,	
	`shiftStartTime`	:6,
	`shift_serial`	:	`42935_06`	,	
	`technician`	:"Diaz, Alexis",
	`timeEnds`	:	`2017-07-24T18:00:00-06:00`	
	`timeStamp`	:42940.88,
	`timeStampM`	:	`2017-07-24T21:08:58-06:00`	
	`timeStarts`	:	`2017-07-24T06:00:00-06:00`	
	`uNum`	:12468298,
	`username`	:	`aadiaz`	,	
	`wONum`	:	316462257	},
```


```js
/\"(notes)\"(\:)\s*\"(.*?)\"(,\s*\"(?:payroll|repairHrs|rprtDate))/
/`\1`\2`\3\4/

/(	`location`	\s*\:\s*\"[\w ]*\",)\s*(\"payroll)/

/\"(_id|_rev|client|firstName|lastName|loc2nd|locID|location|payrollPeriod|payroll_period|repairHrs|rprtDate|shift|shiftLength|shiftSerial|shiftStartTime|shift_serial|technician|timeEnds|timeStamp|timeStampM|timeStarts|uNum|username|wONum)\"/
/\t`\1`\t/

/(`location`\t\:)\s*\"([\w ]*)\",\s*/
/\1`\2`\t,\t/

/\t*(\:)(\d+\.*\d*),\t/
/\t\1\t\2\t,\t/

/\t*(:)\"([\w\-\:]*)\",\t*/
/\t\1\t`\2`\t,\t/

/\t*(\:)(\d+)(\},\n)/
/\t\1\t\2\t\3/

/\t*(\:)\s*\"([\w ,]*)\"(,|\},)\t*/
/\t\1\t`\2`\t\3\t/

/\:\"([\w\-\+\:]*)\",/
/\:\t`\1`\t/
```
