/// <reference types="electron" />
import { EventEmitter } from 'events';
export interface InPageSearchOptions {
    searchWindowWebview?: Electron.WebviewTag;
    searchWindowParent?: HTMLElement;
    preloadSearchWindow?: boolean;
    customCssPath?: string;
    customSearchWindowHtmlPath?: string;
    openDevToolsOfSearchWindow?: boolean;
}
// export type SearchTarget = Electron.WebContents | Electron.WebviewTag;
export type SearchTarget = any;
export default function searchInPage(searchTarget: SearchTarget, options?: InPageSearchOptions): InPageSearch;
export class InPageSearch extends EventEmitter {
    searcher: Electron.WebviewTag;
    searcherParent: HTMLElement;
    searchTarget: SearchTarget;
    opened: boolean;
    private requestId;
    private prevQuery;
    private activeIdx;
    private initialized;
    constructor(searcher: Electron.WebviewTag, searcherParent: HTMLElement, searchTarget: SearchTarget, preload: boolean);
    openSearchWindow(): void;
    closeSearchWindow(): void;
    isSearching(): boolean;
    startToFind(query: string): void;
    findNext(forward: boolean): void;
    stopFind(): void;
    finalize(): void;
    private initialize();
    private onSearchQuery(text);
    private onFoundInPage(result);
    private registerFoundCallback();
    private setupSearchWindowWebview();
    private focusOnInput();
    private focusOnInputOnBrowserWindow();
    private sendResult(nth, all);
}
