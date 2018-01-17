// import * as cDatagrid from './canvas-datagrid';

// declare function canvasDataGrid(params:any):any;

// declare namespace canvasDatagrid {
//   // function canvasDatagrid(params:any):any;
//   interface Rect {
//     top   : number ;
//     bottom: number ;
//     left  : number ;
//     right : number ;
//   }

//   interface Header {
//     name        : string          ;
//     type        : string          ;
//     title       : string          ;
//     width       : number          ;
//     hidden      : boolean         ;
//     filter      : Function        ;
//     formatter   : Function        ;
//     sorter      : Function        ;
//     defaultValue: Function|string ;
//   }

//   interface Text {
//     x    : Object ;
//     y    : Object ;
//     width: Object ;
//     value: Object ;
//   }

//   interface Cell {
//     type               : string         ;
//     style              : string         ;
//     x                  : number         ;
//     y                  : number         ;
//     nodeType           : string         ;
//     offsetTop          : number         ;
//     offsetLeft         : number         ;
//     scrollTop          : number         ;
//     scrollLeft         : number         ;
//     rowOpen            : boolean        ;
//     hovered            : boolean        ;
//     selected           : boolean        ;
//     active             : boolean        ;
//     width              : number         ;
//     height             : number         ;
//     userWidth          : number         ;
//     userHeight         : number         ;
//     data               : object         ;
//     header             : Header         ;
//     columnIndex        : number         ;
//     rowIndex           : number         ;
//     sortColumnIndex    : number         ;
//     sortRowIndex       : number         ;
//     value              : string         ;
//     formattedValue     : string         ;
//     isHeaderCellCap    : boolean        ;
//     parentGrid         : CanvasDatagrid ;
//     gridId             : string         ;
//     isGrid             : boolean        ;
//     isHeader           : boolean        ;
//     isColumnHeader     : boolean        ;
//     isRowHeader        : boolean        ;
//     isCorner           : boolean        ;
//     activeHeader       : boolean        ;
//     horizontalAlignment: string         ;
//     verticalAlignment  : string         ;
//     innerHTML          : string         ;
//     text               : Text           ;
//   }

//   interface Style {
//     activeCellBackgroundColor           : string ;
//     activeCellBorderColor               : string ;
//     activeCellBorderWidth               : number ;
//     activeCellColor                     : string ;
//     activeCellFont                      : string ;
//     activeCellHoverBackgroundColor      : string ;
//     activeCellHoverColor                : string ;
//     activeCellOverlayBorderColor        : string ;
//     activeCellOverlayBorderWidth        : number ;
//     activeCellPaddingBottom             : number ;
//     activeCellPaddingLeft               : number ;
//     activeCellPaddingRight              : number ;
//     activeCellPaddingTop                : number ;
//     activeCellSelectedBackgroundColor   : string ;
//     activeCellSelectedColor             : string ;
//     activeHeaderCellBackgroundColor     : string ;
//     activeHeaderCellColor               : string ;
//     activeRowHeaderCellBackgroundColor  : string ;
//     activeRowHeaderCellColor            : string ;
//     autocompleteBottomMargin            : number ;
//     autosizeHeaderCellPadding           : number ;
//     autosizePadding                     : number ;
//     backgroundColor                     : string ;
//     cellAutoResizePadding               : number ;
//     cellBackgroundColor                 : string ;
//     cellBorderColor                     : string ;
//     cellBorderWidth                     : number ;
//     cellColor                           : string ;
//     cellFont                            : string ;
//     cellGridHeight                      : number ;
//     cellHeight                          : number ;
//     cellHeightWithChildGrid             : number ;
//     cellHorizontalAlignment             : string ;
//     cellHoverBackgroundColor            : string ;
//     cellHoverColor                      : string ;
//     cellPaddingBottom                   : number ;
//     cellPaddingLeft                     : number ;
//     cellPaddingRight                    : number ;
//     cellPaddingTop                      : number ;
//     cellSelectedBackgroundColor         : string ;
//     cellSelectedColor                   : string ;
//     cellVerticalAlignment               : string ;
//     cellWidthWithChildGrid              : number ;
//     childContextMenuMarginLeft          : number ;
//     childContextMenuMarginTop           : number ;
//     childContextMenuArrowHTML           : string ;
//     childContextMenuArrowColor          : string ;
//     contextMenuChildArrowFontSize       : string ;
//     columnWidth                         : number ;
//     contextMenuBackground               : string ;
//     contextMenuBorder                   : string ;
//     contextMenuBorderRadius             : string ;
//     contextMenuColor                    : string ;
//     contextMenuFilterInvalidExpresion   : string ;
//     contextMenuFontFamily               : string ;
//     contextMenuFontSize                 : string ;
//     contextMenuHoverBackground          : string ;
//     contextMenuHoverColor               : string ;
//     contextMenuItemBorderRadius         : string ;
//     contextMenuItemMargin               : string ;
//     contextMenuLabelDisplay             : string ;
//     contextMenuLabelMargin              : string ;
//     contextMenuLabelMaxWidth            : string ;
//     contextMenuLabelMinWidth            : string ;
//     contextMenuMarginLeft               : number ;
//     contextMenuMarginTop                : number ;
//     contextMenuWindowMargin             : number ;
//     contextMenuOpacity                  : string ;
//     contextMenuPadding                  : string ;
//     contextMenuArrowUpHTML              : string ;
//     contextMenuArrowDownHTML            : string ;
//     contextMenuArrowColor               : string ;
//     contextFilterButtonHTML             : string ;
//     contextFilterButtonBorder           : string ;
//     contextFilterButtonBorderRadius     : string ;
//     cornerCellBackgroundColor           : string ;
//     cornerCellBorderColor               : string ;
//     editCellBorder                      : string ;
//     editCellBoxShadow                   : string ;
//     editCellFontFamily                  : string ;
//     editCellFontSize                    : string ;
//     editCellPaddingLeft                 : number ;
//     editCellColor                       : string ;
//     editCellBackgroundColor             : string ;
//     gridBorderColor                     : string ;
//     gridBorderWidth                     : number ;
//     columnHeaderCellBackgroundColor     : string ;
//     columnHeaderCellBorderColor         : string ;
//     columnHeaderCellBorderWidth         : number ;
//     columnHeaderCellColor               : string ;
//     columnHeaderCellFont                : string ;
//     columnHeaderCellHeight              : number ;
//     columnHeaderCellHorizontalAlignment : string ;
//     columnHeaderCellHoverBackgroundColor: string ;
//     columnHeaderCellHoverColor          : string ;
//     columnHeaderCellPaddingBottom       : number ;
//     columnHeaderCellPaddingLeft         : number ;
//     columnHeaderCellPaddingRight        : number ;
//     columnHeaderCellPaddingTop          : number ;
//     columnHeaderCellVerticalAlignment   : string ;
//     columnHeaderOrderByArrowBorderColor : string ;
//     columnHeaderOrderByArrowBorderWidth : number ;
//     columnHeaderOrderByArrowColor       : string ;
//     columnHeaderOrderByArrowHeight      : number ;
//     columnHeaderOrderByArrowMarginLeft  : number ;
//     columnHeaderOrderByArrowMarginRight : number ;
//     columnHeaderOrderByArrowMarginTop   : number ;
//     columnHeaderOrderByArrowWidth       : number ;
//     rowHeaderCellWidth                  : number ;
//     minColumnWidth                      : number ;
//     minHeight                           : number ;
//     minRowHeight                        : number ;
//     name                                : string ;
//     reorderMarkerBackgroundColor        : string ;
//     reorderMarkerBorderColor            : string ;
//     reorderMarkerBorderWidth            : number ;
//     reorderMarkerIndexBorderColor       : string ;
//     reorderMarkerIndexBorderWidth       : number ;
//     rowHeaderCellBackgroundColor        : string ;
//     rowHeaderCellBorderColor            : string ;
//     rowHeaderCellBorderWidth            : number ;
//     rowHeaderCellColor                  : string ;
//     rowHeaderCellFont                   : string ;
//     rowHeaderCellHeight                 : number ;
//     rowHeaderCellHorizontalAlignment    : string ;
//     rowHeaderCellHoverBackgroundColor   : string ;
//     rowHeaderCellHoverColor             : string ;
//     rowHeaderCellPaddingBottom          : number ;
//     rowHeaderCellPaddingLeft            : number ;
//     rowHeaderCellPaddingRight           : number ;
//     rowHeaderCellPaddingTop             : number ;
//     rowHeaderCellSelectedBackgroundColor: string ;
//     rowHeaderCellSelectedColor          : string ;
//     rowHeaderCellVerticalAlignment      : string ;
//     scrollBarActiveColor                : string ;
//     scrollBarBackgroundColor            : string ;
//     scrollBarBorderColor                : string ;
//     scrollBarBorderWidth                : number ;
//     scrollBarBoxBorderRadius            : number ;
//     scrollBarBoxColor                   : string ;
//     scrollBarBoxMargin                  : number ;
//     scrollBarBoxMinSize                 : number ;
//     scrollBarBoxWidth                   : number ;
//     scrollBarCornerBackgroundColor      : string ;
//     scrollBarCornerBorderColor          : string ;
//     scrollBarWidth                      : number ;
//     selectionOverlayBorderColor         : string ;
//     selectionOverlayBorderWidth         : number ;
//     treeArrowBorderColor                : string ;
//     treeArrowBorderWidth                : number ;
//     treeArrowClickRadius                : number ;
//     treeArrowColor                      : string ;
//     treeArrowHeight                     : number ;
//     treeArrowMarginLeft                 : number ;
//     treeArrowMarginRight                : number ;
//     treeArrowMarginTop                  : number ;
//     treeArrowWidth                      : number ;
//     treeGridHeight                      : number ;
//     selectionHandleColor                : number ;
//     selectionHandleBorderColor          : number ;
//     selectionHandleSize                 : number ;
//     selectionHandleBorderWidth          : number ;
//     selectionHandleType                 : number ;
//     moveOverlayBorderWidth              : number ;
//     moveOverlayBorderColor              : number ;
//     moveOverlayBorderSegments           : number ;
//   }

//   interface ContextMenuItem {
//     title: Object;
//     click: Object;
//   }

//   interface Formatter {
//     e: {cell: Cell};
//   }

//   interface Filter {
//     value    : string ;
//     filterFor: string ;

//   }

//   interface Sorter {
//     columnName: string       ;
//     direction : "asc"|"desc" ;
//   }

//   interface CanvasDatagrid {
//     selectedRows   : Array<any>     ;
//     selectedCells  : Array<any>     ;
//     changes        : Array<any>     ;
//     input          : object         ;
//     controlInput   : object         ;
//     currentCell    : Cell ;
//     height         : number         ;
//     width          : number         ;
//     visibleCells   : Array<any>     ;
//     visibleRows    : Array<any>     ;
//     selections     : Array<any>     ;
//     selectionBounds: Rect           ;
//     attributes     : object         ;
//     sizes          : object         ;
//     style          : Style          ;
//     dragMode       : string         ;
//     formatters     : Formatter      ;
//     sorters        : Sorter         ;
//     filters        : Filter         ;
//     data           : Array<any>     ;
//     schema         : Array<Header>  ;
//     scrollHeight   : number         ;
//     scrollWidth    : number         ;
//     scrollTop      : number         ;
//     scrollLeft     : number         ;
//     offsetTop      : number         ;
//     offsetLeft     : number         ;
//     parentNode     : object         ;
//     isChildGrid    : boolean        ;
//     openChildren   : boolean        ;
//     childGrids     : boolean        ;
//     parentGrid     : CanvasDatagrid ;
//     canvas         : object         ;
//   }
//   // function canvasDatagrid(dataGridOptions:canvasDatagrid.CanvasDatagrid);
// }
// //
// export = canvasDatagrid;
