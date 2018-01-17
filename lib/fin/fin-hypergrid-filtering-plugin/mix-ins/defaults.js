'use strict';

/********** SECTION: FILTER ROW COLORS **********/

/**
 * This is used only by FilterBox cell editor.
 * One of:
 * * **`'onCommit'`** - Column filter state not set until keyup === `\r` (return/enter key)
 * * **`'immediate'`** - Column filter state set on each key press
 * @default
 * @type {boolean}
 * @memberOf module:defaults
 */
exports.filteringMode = 'onCommit';

