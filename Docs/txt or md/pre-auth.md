# Convert/setup Pre-Auth PDF Data for copy/paste to a template

 1. Use Acrobat Pro to convert files to `.xlsx`
 2. Use ExcelConvert to convert the `.xlsx` files to `.txt` (make sure that you choose tab delimited)
 3. Open Sublime Text and pres the key combination `CTRL+SHIFT+F`
 4. In the `Where:` field: Add the folder containing the text files, and set to select text files only
     1. press the ellipsis button(`...`) inbetween the `Find` and `Replace` button on the left side of the Find/Replace dialog
     2. select `Add Folder` and select the folder contianing the text converted Pre-Auth documents
     3. again(`...`), now select `Add Include Filter`; it will add a default `*.txt` to the `Where:` field.  You don't need to change anything
     4. the `Where:` field should now contain the path and txt filter and look something like `F:\Pre Auths,*.txt` 
 5. Iterate through the three sections below with the appropriate find/replace 
     1. copy everything between the `/` characters at the beginning and end of the search expressions
     2. make sure regular expressions is selected in the options to the left of `Find:` (the `🞻` symbol)
     3. it is not necessary to save or save and close the files during the process...
 6. Finally from the cleaned up text files: copy/paste the pre-auth info into the appropriate Excel invoice template

### Pre-Auth No.
 - Deletes all of the extra stuff and leaves the Auth No.


### Clean

```js
Find:
/\"/
Replace:
//

Find:
/[ \t]*\n/
Replace:
/\n/

Find:
/ +/
Replace:
/ /
```

### Auth No.

```js
Find:
/(ae|am|ap|bd|bn|bp|od|rs) *(\d+\.\d+\.txt)\n(?:[\:\-\/\.\#,\@\+\w\s]*?(Authorization number)\: *(\d{10})\s*[\w \:\n,\(\/\-\.\#\t]*\))/
Replace:
/\1 \2\n◊~~~~~~~~~~~~~~~~~~~~◊\nItem\tTechnician\tUnit No.\tOrder No.\tHrs\tAuth No.\t\4\n◊~~~~~~~~~~~~~~~~~~~~◊\n/
```

### item no. woNum, unit No. Tech, Hrs ...

```js

Find: /\n(\d+) (\d{6,10}|COST CENTER )([A-Z\. éáóñ]*) (\d+\.\d+) *\/ *H \d+\.\d\d USD(?: *550420\/order\/(1014210015|\d{8,10}|\d{4}) (\d+)\(100\.00\%\)| *550420\/Cost center\/(1014210015|\d{8,10}|\d+ \d+) *\(100\.00\%\))/
Replace: /\n\1\t\3\t\2\t\5\6\7\t\4/
```

### Remove table headers and page no. stuff

```js
Find:
/(?:(\s*\"?Item.*\))?(\s*SESA\s*\d*\s*\n?)?(\n*\s*Page\s*\d*\s*OF\s*\d*\s*)(\s*\"?Item\n?#\"?\s*)?(\s*Vendor\s*Service\s*Number\s*)?(\s*Service\s*M.{2,8}\sNumber\s*)?(\s*Description\s*Quantity\s*\/\s*)?(\s*Unit\s*\"?Estimated\s*Total\s*\n*)?(\s*Item\s*Price\"?\s*)?(\s*Cost\s*Object\s*)?(\s*\(?GL\s*\/\s*Category\s*\/\s*Cost\s*Object\)?)?)/
Replace: 
/\n/
```

```js
Find:
/(item\s*.*\n*)+\)/
Replace:
/\n/

Find:
/\n *SESA.*\n/
Replace:
/\n/

Find:
/\nPre-authorization document - \d+\n/
Replace:
/\n/
```

```js
// repeat this to remove all extra lines
Find:
/[ \t]*\n+/
Replace:
/\n/
```

### standardize tech name spacing after the initial

```js
Find:
/(\n\d+\t)(\w+\.) *([a-z]{3,15}[ JR|SR]*\.*\t)/
Replace:
/\1 \2/
```

```js
Find:
/===================================================================/
Replace:
/\n============\n\n/

Find:
/(ae|am|ap|bd|bn|bp|od|rs) *(\d+\.\d+\.txt)\n◊~~~~~~~~~~~~~~~~~~~~◊/
Replace:
/\1 \2\n/

Find:
/◊~~~~~~~~~~~~~~~~~~~~◊/
Replace:
//

Find:
/ *\t */
Replace:
/\t/
```

