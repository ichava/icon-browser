import * as e from "react";
import { Children as t, Fragment as n, StrictMode as r, createContext as i, isValidElement as a, useCallback as o, useContext as s, useEffect as c, useId as l, useLayoutEffect as u, useMemo as d, useRef as f, useState as p, useSyncExternalStore as m } from "react";
import { createPortal as h, flushSync as g } from "react-dom";
import { UNSAFE_PortalProvider as _, useUNSAFE_PortalContext as v } from "react-aria";
import { create as y } from "zustand";
import { createJSONStorage as b, persist as x } from "zustand/middleware";
import { Fragment as S, jsx as C, jsxs as w } from "react/jsx-runtime";
import { Autocomplete as T, Button as E, Checkbox as D, CheckboxGroup as O, Collection as ee, ComboBox as te, ComboBoxStateContext as k, Dialog as A, DialogTrigger as j, DropIndicator as M, Focusable as N, Form as P, Group as F, Header as I, Heading as ne, I18nProvider as re, Input as L, Label as R, Link as z, ListBox as ie, ListBoxItem as B, ListBoxSection as ae, Menu as oe, MenuItem as se, MenuSection as ce, MenuTrigger as le, Modal as ue, ModalOverlay as V, OverlayArrow as de, Popover as H, Pressable as fe, Radio as U, RadioGroup as pe, SearchField as me, Select as he, SelectValue as ge, Separator as _e, Slider as ve, SliderOutput as ye, SliderThumb as be, SliderTrack as xe, Switch as Se, Tab as Ce, TabList as we, TabPanel as Te, Tabs as Ee, TabsContext as De, Text as Oe, TextField as ke, ToggleButton as Ae, ToggleButtonGroup as je, Tooltip as Me, TooltipTrigger as Ne, Tree as Pe, TreeItem as Fe, TreeItemContent as Ie, useDragAndDrop as Le, useFilter as Re, useSlottedContext as ze } from "react-aria-components";
import { createRoot as Be } from "react-dom/client";
// src/hooks/useIconCatalogClient.ts
var Ve = i(null), He = Ve.Provider;
function Ue() {
	return s(Ve);
}
// node_modules/@ichava/js-ui-kernel/dist/catalog-model.js
function We(e) {
	return e ? /(?:fill|stroke|stop-color)\s*=\s*"(?!(?:none|currentColor|transparent)\b)#?[0-9a-zA-Z(),.%\s]+"/.test(e) : !1;
}
function Ge(e) {
	return {
		id: e.id,
		package: e.package,
		name: e.name,
		category: e.category,
		sub: e.sub,
		variant: e.variant ?? "outline",
		kind: e.kind ?? "icon",
		svgContent: e.svg_content ?? null,
		svgUrl: e.svg_url ?? null,
		viewBox: e.viewbox ?? "0 0 24 24",
		bladeClean: e.blade_clean ?? "",
		bladeGeneric: e.blade_generic ?? "",
		helper: e.helper ?? "",
		...e.icon_path || e.path ? { path: e.icon_path || e.path } : {},
		...e.snippets ? { snippets: e.snippets } : {},
		tags: e.tags ?? [],
		keywords: e.keywords ?? [],
		ownColor: We(e.svg_content)
	};
}
// node_modules/@ichava/js-ui-kernel/dist/color.js
function Ke(e) {
	return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(e.trim());
}
function qe(e, t) {
	return /^#[0-9a-f]{6}$/i.test(e) ? `${e}${Math.round(Math.max(0, Math.min(100, t)) / 100 * 255).toString(16).padStart(2, "0")}` : e;
}
var Je = "124,58,237";
function Ye(e, t) {
	let n = /^#([0-9a-f]{6})$/i.exec(e.trim());
	if (!n) return `rgba(${Je},${t})`;
	let r = parseInt(n[1], 16);
	return `rgba(${r >> 16 & 255},${r >> 8 & 255},${r & 255},${t})`;
}
function Xe(e) {
	let t = /^#([0-9a-f]{6})$/i.exec(e.trim());
	if (!t) return null;
	let n = parseInt(t[1], 16);
	return {
		r: n >> 16 & 255,
		g: n >> 8 & 255,
		b: n & 255
	};
}
var Ze = ({ r: e, g: t, b: n }) => `#${[
	e,
	t,
	n
].map((e) => Math.round(Math.max(0, Math.min(255, e))).toString(16).padStart(2, "0")).join("")}`;
function Qe({ r: e, g: t, b: n }) {
	let r = (e) => {
		let t = e / 255;
		return t <= .04045 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
	};
	return .2126 * r(e) + .7152 * r(t) + .0722 * r(n);
}
function $e(e, t) {
	let [n, r] = [Xe(e), Xe(t)];
	if (!n || !r) return 1;
	let [i, a] = [Qe(n), Qe(r)].sort((e, t) => t - e);
	return (i + .05) / (a + .05);
}
function et({ r: e, g: t, b: n }, r) {
	let i = r > 0 ? 255 : 0, a = Math.abs(r);
	return {
		r: e + (i - e) * a,
		g: t + (i - t) * a,
		b: n + (i - n) * a
	};
}
function tt(e, t) {
	let n = Xe(e);
	return !n || t === 0 ? e : Ze(et(n, Math.max(-1, Math.min(1, t))));
}
function nt(e, t, n) {
	let r = Xe(e), i = Xe(n);
	if (!r || !i) return n;
	let a = Math.max(0, Math.min(1, t));
	return Ze({
		r: r.r * a + i.r * (1 - a),
		g: r.g * a + i.g * (1 - a),
		b: r.b * a + i.b * (1 - a)
	});
}
function rt(e, t, n = 4.5) {
	let r = Xe(e), i = Xe(t);
	if (!r || !i || $e(e, t) >= n) return e;
	let a = Qe(i) < .5 ? 1 : -1, o = e, s = $e(e, t);
	for (let e = .02; e <= 1; e += .02) {
		let i = Ze(et(r, a * e)), c = $e(i, t);
		if (c > s && (o = i, s = c), c >= n) return i;
	}
	return o;
}
// node_modules/@ichava/js-ui-kernel/dist/theme.js
var it = "#7c3aed";
function at() {
	try {
		return typeof window < "u" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	} catch {
		return "light";
	}
}
function ot(e) {
	return e === "light" || e === "dark" ? e : at();
}
var st = {
	50: .92,
	100: .84,
	200: .68,
	300: .48,
	400: .28,
	500: .12,
	600: 0,
	700: -.16,
	800: -.32,
	900: -.46,
	950: -.62
};
function ct(e) {
	if (!Ke(e) || e.length !== 7) return {};
	let t = {};
	for (let [n, r] of Object.entries(st)) t[`--color-brand-${n}`] = tt(e, r);
	return t;
}
var lt = {
	xs: .25,
	sm: .5,
	DEFAULT: .5,
	md: .75,
	lg: 1,
	xl: 1.5,
	"2xl": 2,
	"3xl": 3
};
function ut(e) {
	let t = Number.isFinite(e) && e > 0 ? e : 0, n = {};
	for (let [e, r] of Object.entries(lt)) n[`--radius-${e}`] = `${+(t * r).toFixed(2)}px`;
	return n;
}
var dt = {
	light: "#f5f5f5",
	dark: "#262626"
}, ft = {
	light: .1,
	dark: .16
};
function pt(e, t, n = {}) {
	if (!n.surfaces) return rt(e, nt(e, ft[t], dt[t]));
	let r = /^#[0-9a-f]{6}$/i.test(e.trim()) ? e.trim() : it, i = r;
	for (let e of n.surfaces) i = rt(i, e), i = rt(i, nt(r, ft[t], e));
	return i;
}
function mt(e, t, n, r) {
	let i = pt(e, n);
	return {
		"--accent": e,
		"--accent-text": t,
		"--accent-soft": Ye(e, n === "dark" ? .16 : .1),
		"--ring": Ye(e, .35),
		"--radius": `${r}px`,
		...ct(e),
		...ut(r),
		"--color-bg-brand-solid": e,
		"--color-bg-brand-solid_hover": Ye(e, .88),
		"--color-bg-brand-primary": Ye(e, n === "dark" ? .16 : .1),
		"--color-border-brand": Ye(e, .5),
		"--color-fg-brand-primary": i,
		"--color-text-brand-secondary": i,
		"--color-text-brand-tertiary": i
	};
}
var ht = Object.keys(mt("#000000", "#000000", "light", 8)), gt = [
	{
		code: "en",
		label: "English",
		dir: "ltr"
	},
	{
		code: "es",
		label: "Español",
		dir: "ltr"
	},
	{
		code: "fr",
		label: "Français",
		dir: "ltr"
	},
	{
		code: "de",
		label: "Deutsch",
		dir: "ltr"
	},
	{
		code: "pt",
		label: "Português",
		dir: "ltr"
	},
	{
		code: "sw",
		label: "Kiswahili",
		dir: "ltr"
	},
	{
		code: "ar",
		label: "العربية",
		dir: "rtl"
	}
];
function _t(e) {
	return typeof e == "string" && gt.some((t) => t.code === e);
}
function vt(e) {
	return gt.find((t) => t.code === e)?.dir ?? "ltr";
}
function yt(e, t) {
	return t ? e.replace(/\{(\w+)\}/g, (e, n) => String(t[n] ?? `{${n}}`)) : e;
}
var bt = class e {
	#e;
	#t;
	#n;
	constructor(e, t, n) {
		this.#e = e, this.#t = t, this.#n = n, Object.freeze(this);
	}
	static of(t, n = "en") {
		return new e(t, [], n);
	}
	locale(t) {
		return new e(this.#e, this.#t, t);
	}
	withOverrides(t) {
		return new e(this.#e, [...this.#t, t], this.#n);
	}
	withMessages(e, t) {
		return this.withOverrides({ [e]: t });
	}
	get currentLocale() {
		return this.#n;
	}
	get dir() {
		return vt(this.#n);
	}
	lookup(e, t = this.#n) {
		for (let n of t === "en" ? ["en"] : [t, "en"]) {
			for (let t = this.#t.length - 1; t >= 0; --t) {
				let r = this.#t[t]?.[n]?.[e];
				if (r !== void 0) return r;
			}
			let t = this.#e[n]?.[e];
			if (t !== void 0) return t;
		}
	}
	t(e, t) {
		return yt(this.lookup(e) ?? e, t);
	}
}, xt = "ichava.locale", St = /* @__PURE__ */ new Set();
function Ct() {
	try {
		let e = globalThis.localStorage?.getItem(xt);
		if (_t(e)) return e;
	} catch {}
	return "en";
}
function wt(e) {
	try {
		globalThis.localStorage?.setItem(xt, e);
	} catch {}
	for (let t of St) t(e);
}
// node_modules/@ichava/js-ui-kernel/dist/consent.js
var Tt = "ichava.consent";
function Et(e) {
	return e === "essential" || e === "all";
}
var Dt = /* @__PURE__ */ new Set();
function Ot() {
	try {
		let e = globalThis.localStorage?.getItem(Tt);
		return Et(e) ? e : null;
	} catch {
		return null;
	}
}
function kt(e) {
	try {
		e === null ? globalThis.localStorage?.removeItem(Tt) : globalThis.localStorage?.setItem(Tt, e);
	} catch {}
	for (let t of Dt) t(e);
}
function At(e) {
	return Dt.add(e), () => {
		Dt.delete(e);
	};
}
function jt(e) {
	let t = Ot();
	return t === null ? Et(e) ? (kt(e), e) : null : t;
}
var Mt = [], Nt = /* @__PURE__ */ new Set();
function Pt() {
	for (let e of Nt) e();
}
function Ft(e) {
	return Mt.includes(e) || (Mt.push(e), Pt()), () => {
		let t = Mt.indexOf(e);
		t !== -1 && (Mt.splice(t, 1), Pt());
	};
}
function It(e) {
	return Mt[0] === e;
}
function Lt(e) {
	return Nt.add(e), () => {
		Nt.delete(e);
	};
}
// src/core/i18n.ts
var Rt = [
	{
		code: "en",
		label: "English",
		dir: "ltr"
	},
	{
		code: "es",
		label: "Español",
		dir: "ltr"
	},
	{
		code: "fr",
		label: "Français",
		dir: "ltr"
	},
	{
		code: "de",
		label: "Deutsch",
		dir: "ltr"
	},
	{
		code: "pt",
		label: "Português",
		dir: "ltr"
	},
	{
		code: "sw",
		label: "Kiswahili",
		dir: "ltr"
	},
	{
		code: "ar",
		label: "العربية",
		dir: "rtl"
	}
];
function zt(e) {
	return Rt.find((t) => t.code === e)?.dir ?? "ltr";
}
var Bt = {
	en: {
		"detail.snippetFormat": "Snippet format",
		"console.code": "Code",
		"palette.results": "Results",
		"appearance.adaptMono": "Adapt black icons in dark mode",
		"common.cancel": "Cancel",
		"common.create": "Create",
		"common.clear": "Clear",
		"common.all": "All",
		"common.none": "None",
		"common.copy": "Copy",
		"common.download": "Download",
		"common.favorite": "Favorite",
		"common.favorited": "Favorited",
		"common.close": "Close",
		"common.signIn": "Sign in",
		"common.signOut": "Sign out",
		"common.search": "Search icons, actions…",
		"header.favorites": "Favorites",
		"header.history": "History",
		"header.collections": "Collections",
		"header.notifications": "Notifications",
		"header.toggleTheme": "Toggle theme",
		"header.settings": "Settings",
		"header.fullscreen": "Full screen",
		"header.exitFullscreen": "Exit full screen",
		"header.commandPalette": "Command palette",
		"header.gridView": "Grid view",
		"header.listView": "List view",
		"sidebar.packages": "Packages",
		"sidebar.categories": "Categories",
		"sidebar.filterCategories": "Filter categories…",
		"sidebar.filterIcons": "Filter icons…",
		"sidebar.expandAll": "Expand all",
		"sidebar.collapseAll": "Collapse all",
		"variant.all": "All",
		"variant.outline": "Outline",
		"variant.filled": "Filled",
		"variant.color": "Color",
		"toolbar.sort": "Sort",
		"toolbar.size": "Size",
		"toolbar.stroke": "Stroke",
		"toolbar.color": "Color",
		"toolbar.treatment": "Icon treatment",
		"toolbar.export": "Export",
		"toolbar.copyNames": "Copy names",
		"toolbar.selected": "{n} selected",
		"appearance.title": "Appearance",
		"appearance.subtitle": "theme · brand · zoom",
		"appearance.theme": "Theme",
		"appearance.light": "Light",
		"appearance.dark": "Dark",
		"appearance.brandAccent": "Brand accent",
		"appearance.customHex": "Custom hex",
		"appearance.radius": "Radius",
		"appearance.size": "UI Zoom",
		"appearance.density": "UI Density",
		"appearance.compact": "Compact",
		"appearance.comfy": "Comfy",
		"appearance.reduceMotion": "Reduce motion",
		"appearance.iconLabels": "Icon labels",
		"appearance.language": "Language",
		"appearance.footer": "Applies to the application only. Persists in your selected storage driver.",
		"account.workspace": "Workspace",
		"account.account": "Account",
		"account.profile": "Profile & preferences",
		"account.sharedCollections": "Shared collections",
		"profile.title": "Profile",
		"profile.account": "Account",
		"profile.appSettings": "App settings & configuration",
		"profile.signOutTitle": "Sign out?",
		"profile.signOutBody": "You will keep local favorites and filters, but shared collections and team features require signing in again.",
		"profile.signedOut": "Signed out",
		"profile.switched": "Switched to {name}",
		"shared.title": "Shared collections",
		"shared.count": "{n} shared",
		"shared.empty": "No collections shared yet.",
		"shared.manageAccess": "Manage access",
		"empty.noResults": "No icons match your filters.",
		"empty.noFavorites": "No favorites yet.",
		"empty.onboardTitle": "Select packages to browse",
		"empty.onboardDesc": "Icons appear once at least one installed package is selected.",
		"empty.selectAllPackages": "Select all packages",
		"empty.noMatchSearch": "No icons match “{q}”",
		"empty.noMatchFilters": "No icons match these filters",
		"empty.tryDifferent": "Try a different term, another variant, or clear the active filters.",
		"empty.clearFilters": "Clear filters",
		"toolbar.iconOne": "icon",
		"toolbar.iconMany": "icons",
		"toolbar.removeFilter": "Remove filter",
		"toolbar.namesCopied": "{n} names copied",
		"toolbar.exportedToast": "Exported {n} icons — {label}",
		"toolbar.treatmentEngine": "Treatment engine",
		"toolbar.toggleSortOrder": "Toggle sort order",
		"toolbar.gridIconSize": "Grid icon size",
		"toolbar.sizeUnit": "Size unit",
		"toolbar.strokeTitle": "Stroke width — rewrites stroke across grid, detail & export",
		"toolbar.previewColor": "Preview color",
		"toolbar.resetFilters": "Reset filters",
		"toolbar.resetTitle": "Reset all filters?",
		"toolbar.resetBody": "Search, categories, variants, sort, page, selection and preview color return to defaults. Favorites, collections and appearance are untouched.",
		"toolbar.resetConfirm": "Reset filters",
		"toolbar.resetToast": "Filters reset",
		"footer.noResults": "No results",
		"footer.range": "{start}–{end} of {total}",
		"footer.perPage": "{n} / page",
		"footer.perPageLabel": "Results per page",
		"footer.prevPage": "Previous page",
		"footer.nextPage": "Next page",
		"list.copiedToast": "Copied {name}",
		"sidebar.scopeIcons": "Icons",
		"sidebar.scopePackages": "Packages",
		"sidebar.scopeCategories": "Categories",
		"sidebar.scopeAll": "All",
		"sidebar.notInstalled": "not installed",
		"sidebar.inView": "In view",
		"sidebar.selected": "Selected",
		"sidebar.loadedIcons": "In this catalog",
		"sidebar.ecosystemTotal": "Ecosystem total",
		"sidebar.favorites": "Favorites",
		"sidebar.filterPackages": "Filter packages…",
		"sidebar.searchEverything": "Search everything…",
		"sidebar.searchScope": "Search scope",
		"header.filtersPackages": "Filters & packages",
		"header.toggleSidebar": "Toggle sidebar",
		"header.devtools": "Ichava DevTools",
		"palette.placeholder": "Type a command or search icons…",
		"palette.recent": "Recent",
		"palette.actions": "Actions",
		"palette.icons": "Icons",
		"palette.openHint": "open",
		"palette.noMatches": "No matches for “{q}”",
		"palette.navigate": "navigate",
		"palette.select": "select",
		"palette.close": "close",
		"palette.toggleTheme": "Toggle theme",
		"palette.openSettings": "Open settings",
		"palette.openFavorites": "Open favorites",
		"palette.openHistory": "Open history",
		"palette.openCollections": "Open collections",
		"palette.switchListView": "Switch to list view",
		"palette.switchGridView": "Switch to grid view",
		"palette.resetFilters": "Reset all filters",
		"palette.selectAll": "Select all matching",
		"selectAll.confirmTitle": "Select all {n} icons?",
		"selectAll.confirmBody": "No search or filter is active, so every icon in the catalog will be selected.",
		"selectAll.confirmLabel": "Select all",
		"palette.openDevtools": "Open Ichava DevTools",
		"common.remove": "Remove",
		"settings.appearanceHintPre": "Theme, accent, radius, size, density, motion and labels live in the ",
		"settings.appearanceHintPost": " menu in the header.",
		"settings.behavior": "Behavior",
		"settings.perPageTitle": "Icons per page",
		"settings.perPageDesc": "Grid pagination size.",
		"settings.copyFormatTitle": "Default copy format",
		"settings.copyFormatDesc": "Used by click-to-copy on tiles.",
		"settings.storageTitle": "Storage driver",
		"settings.storageDesc": "Where preferences & state persist.",
		"settings.storageLocal": "local",
		"settings.storageSession": "session",
		"settings.tourTitle": "Product tour",
		"settings.tourDesc": "Replay the first-run walkthrough.",
		"settings.replayTour": "Replay tour",
		"settings.factoryTitle": "Factory reset",
		"settings.factoryDesc": "Restore every setting, filter, favorite and collection to defaults.",
		"settings.factoryConfirmTitle": "Reset everything to factory settings?",
		"settings.factoryConfirmBody": "All preferences, filters, favorites, history, collections, brand customization, consent and stored snapshots will be restored to defaults. This cannot be undone.",
		"settings.factoryConfirmLabel": "Reset everything",
		"settings.factoryToast": "Everything reset to defaults",
		"settings.resetEverything": "Reset everything…",
		"settings.account": "Account",
		"settings.syncNote": "favorites & collections sync across devices",
		"settings.guestNote": "You're browsing as a guest — preferences persist in this browser only. Sign in to sync favorites, collections and history across devices.",
		"settings.aboutLink": "About Ichava →",
		"consent.ariaLabel": "Cookies and storage",
		"consent.title": "Cookies & storage",
		"consent.body": "Ichava stores your preferences and favorites in your chosen storage driver, plus anonymous usage events. No third-party trackers.",
		"consent.essentialOnly": "Essential only",
		"consent.acceptAll": "Accept all",
		"about.browser": "Browser",
		"about.craftedBy": "Crafted by",
		"about.statIcons": "icons indexed",
		"about.statSets": "icon sets",
		"about.statLicense": "license",
		"library.favorites": "Favorites",
		"library.history": "History",
		"library.collections": "Collections",
		"library.emptyFavorites": "No favorites yet — hover an icon and tap the heart.",
		"library.emptyHistory": "No activity yet — views, copies and downloads show up here.",
		"library.emptyCollections": "No collections yet — name one above.",
		"library.clearHistory": "Clear history",
		"library.newCollectionPlaceholder": "New collection name…",
		"library.iconCount": "{n} icons",
		"library.teamBadge": "team",
		"library.viewerBadge": "viewer",
		"library.copyNamesTitle": "Copy icon names",
		"library.deleteCollection": "Delete collection",
		"tile.openDetail": "Open detail",
		"tile.copyFormat": "Copy {format}",
		"tile.copyName": "Copy name",
		"tile.copiedName": "Copied name",
		"tile.copyPermalink": "Copy permalink",
		"tile.permalinkCopied": "Permalink copied",
		"tile.select": "Select",
		"tile.deselect": "Deselect",
		"tile.addFavorite": "Add favorite",
		"tile.removeFavorite": "Remove favorite",
		"tile.favoritedAria": "favorited",
		"tile.selectedAria": "selected",
		"detail.previewOnly": "Preview only — grid is unaffected",
		"detail.scaledToFit": "scaled to fit",
		"detail.actual": "actual",
		"detail.size": "Size",
		"detail.previewSize": "Preview size",
		"detail.unit": "Unit",
		"detail.color": "Color",
		"detail.stroke": "Stroke",
		"detail.motion": "Motion",
		"detail.searchPresets": "Search {n} presets…",
		"detail.noPresets": "No presets found.",
		"detail.easing": "Easing",
		"detail.play": "Play",
		"detail.pause": "Pause",
		"detail.speed": "Speed",
		"detail.copied": "Copied {label}",
		"detail.download": "Download",
		"detail.keyframesAria": "Custom keyframes JSON",
		"detail.keyframesValid": "{n} keyframes — paste a Keyframe[] or { keyframes: […] } spec",
		"detail.keyframesInvalid": "Invalid JSON — expects an array of plain keyframe objects",
		"detail.related": "Related icons",
		"detail.addToCollection": "Add to collection",
		"detail.newCollection": "+ New",
		"detail.noSvg": "No SVG available for this icon",
		"detail.pngNoSvg": "PNG export failed — no SVG",
		"detail.pngFailed": "PNG export failed",
		"detail.addedTo": "Added to {name}",
		"detail.removedFrom": "Removed from {name}",
		"detail.motionDefault": "Default",
		"console.copyCode": "Copy code",
		"console.copy": "Copy",
		"console.copied": "Copied",
		"help.title": "Help & about",
		"help.about": "About Ichava",
		"help.docs": "Documentation",
		"help.replayTour": "Replay product tour",
		"help.shortcuts": "Keyboard shortcuts",
		"notifications.clearAll": "Clear all",
		"notifications.empty": "You're all caught up.",
		"team.title": "Team",
		"team.online": "{n} online",
		"team.onlineNow": "Online now",
		"team.away": "Away",
		"team.offline": "Offline",
		"team.invite": "Invite…",
		"color.previewColor": "Preview color",
		"color.resetToTheme": "Reset to theme",
		"color.opacity": "Opacity — 0–100%",
		"contextMenu.actions": "Actions",
		"boot.loadingCatalog": "Loading catalog",
		"boot.ready": "Ready",
		"sidebar.iconVariant": "Icon variant",
		"auth.signInTo": "Sign in to {brand}",
		"auth.needsAccount": "needs an account.",
		"auth.emailCode": "We'll email you a one-time code — no password.",
		"auth.emailPlaceholder": "you@company.com",
		"auth.sendCode": "Send code",
		"auth.newHere": "New here?",
		"auth.createAccount": "Create account",
		"auth.enterCode": "Enter your code",
		"auth.sentTo": "Sent to",
		"auth.demoHint": "Demo: any code signs in — try 000000 to see the failure state.",
		"auth.digit": "Digit {n}",
		"auth.codeFailed": "That code didn't work. Try again.",
		"auth.verify": "Verify & sign in",
		"auth.changeEmail": "← Change email",
		"auth.resendIn": "Resend in {n}s",
		"auth.resendCode": "Resend code",
		"auth.createTitle": "Create your account",
		"auth.createBlurb": "Join to unlock collections, sharing and team features. We'll verify your email with a one-time code.",
		"auth.firstName": "First name",
		"auth.lastName": "Last name",
		"auth.passwordPlaceholder": "At least 8 characters",
		"auth.togglePassword": "Toggle password visibility",
		"auth.haveAccount": "Already have an account?",
		"invite.title": "Invite to workspace",
		"invite.workspace": "workspace",
		"invite.emailPlaceholder": "teammate@company.com",
		"invite.roleEditor": "Editor — can add & share",
		"invite.roleViewer": "Viewer — read only",
		"invite.role": "Role",
		"invite.linkExpires": "Link expires",
		"invite.exp24h": "24h",
		"invite.exp7d": "7 days",
		"invite.exp30d": "30 days",
		"invite.expNever": "Never",
		"invite.blurb": "Invitees get access to shared collections in this workspace. Roles can be changed later by the owner; links can be revoked in Settings.",
		"invite.generateLink": "Generate link",
		"invite.linkCopied": "Invite link copied",
		"invite.yourTeammate": "your teammate",
		"invite.sentNotification": "Invite sent to {to} ({role})",
		"invite.sent": "Invite sent",
		"invite.sendInvite": "Send invite",
		"access.addPeople": "Add people or your team",
		"access.searchTeammates": "Search teammates by name or email…",
		"access.onlyYou": "Only you have access. Add teammates above, or share the whole team.",
		"access.saveAccess": "Save access",
		"access.shareEntireTeam": "Sharing with entire team",
		"access.shareLinkCopied": "Share link copied",
		"access.copyLinkInstead": "Copy link instead",
		"shared.inviteTeam": "Invite the team…",
		"shared.viewer": "viewer",
		"shared.editor": "editor",
		"tour.skip": "Skip",
		"tour.back": "Back",
		"tour.stepOf": "Step {n} of {total}",
		"tour.next": "Next",
		"tour.getStarted": "Get started",
		"tour.s1Title": "Welcome to Ichava Browser",
		"tour.s1Body": "Every icon in your Laravel app — searchable, previewable, copy-ready. This 30-second tour shows you around. You can replay it anytime from Settings.",
		"tour.s2Title": "Find any icon fast",
		"tour.s2Body": "Search by name or tag, filter by package, category and variant in the sidebar, or hit ⌘K for the command palette.",
		"tour.s3Title": "Restyle live",
		"tour.s3Body": "Treatments, size, stroke, color and motion presets restyle every icon in place — the grid updates as you tweak.",
		"tour.s4Title": "Copy for your stack",
		"tour.s4Body": "Open any icon for Blade, Livewire, Vue, React, Svelte, Web Component, raw SVG and more — one click to copy.",
		"tour.s5Title": "Save & share",
		"tour.s5Body": "Favorite icons, group them into collections, and export a sprite, manifest or ZIP. Sign in to sync across devices.",
		"app.documentTitle": "Ichava Browser — every icon your Laravel app needs",
		"sort.name": "Name",
		"sort.package": "Package",
		"sort.category": "Category",
		"treatment.default": "Stroke",
		"treatment.defaultDesc": "Original pack strokes",
		"treatment.solid": "Solid",
		"treatment.solidDesc": "Bolder, filled weight",
		"treatment.duotone": "Dual tone",
		"treatment.duotoneDesc": "Accent shadow layer",
		"treatment.midtone": "Midtone",
		"treatment.midtoneDesc": "Softened 50% ink",
		"treatment.halftone": "Halftone",
		"treatment.halftoneDesc": "Retro dot-matrix fill",
		"unit.pxValue": "{n}px",
		"export.files": "SVG files",
		"export.filesDesc": "Individual .svg downloads",
		"export.sprite": "SVG sprite",
		"export.spriteDesc": "One <symbol> sheet",
		"export.manifest": "JSON manifest",
		"export.manifestDesc": "ids, packs & categories",
		"export.zip": "ZIP bundle",
		"export.zipDesc": "Sprite + manifest + files",
		"copyFormat.svg": "Raw SVG",
		"copyFormat.blade": "Blade tag",
		"copyFormat.vue": "Vue snippet",
		"copyFormat.name": "Icon name",
		"snippetTab.motion": "Motion",
		"snippetTab.helper": "Helper",
		"snippetTab.bladeGeneric": "Blade (generic)",
		"snippetTab.webcomponent": "Web Component",
		"snippetTab.name": "Name",
		"clipboard.copyFailed": "Copy failed — select and copy manually",
		"clipboard.copied": "Copied to clipboard",
		"task.working": "Working…",
		"task.export": "Exporting {n} icons…",
		"task.copyNames": "Collecting {n} icon names…",
		"task.png": "Rendering the PNG…",
		"task.selectAll": "Selecting every matching icon…"
	},
	es: {
		"detail.snippetFormat": "Formato del fragmento",
		"console.code": "Código",
		"palette.results": "Resultados",
		"appearance.adaptMono": "Adaptar iconos negros en modo oscuro",
		"app.documentTitle": "Ichava Browser — todos los iconos que necesita tu app Laravel",
		"sort.name": "Nombre",
		"sort.package": "Paquete",
		"sort.category": "Categoría",
		"treatment.default": "Trazo",
		"treatment.defaultDesc": "Trazos originales del paquete",
		"treatment.solid": "Sólido",
		"treatment.solidDesc": "Peso más grueso y relleno",
		"treatment.duotone": "Dos tonos",
		"treatment.duotoneDesc": "Capa de sombra con el acento",
		"treatment.midtone": "Medio tono",
		"treatment.midtoneDesc": "Tinta suavizada al 50 %",
		"treatment.halftone": "Semitono",
		"treatment.halftoneDesc": "Relleno retro de puntos",
		"unit.pxValue": "{n} px",
		"common.cancel": "Cancelar",
		"common.create": "Crear",
		"common.clear": "Limpiar",
		"common.all": "Todos",
		"common.none": "Ninguno",
		"common.copy": "Copiar",
		"common.download": "Descargar",
		"common.favorite": "Favorito",
		"common.favorited": "Favorito",
		"common.close": "Cerrar",
		"common.signIn": "Iniciar sesión",
		"common.signOut": "Cerrar sesión",
		"common.search": "Buscar iconos, acciones…",
		"header.favorites": "Favoritos",
		"header.history": "Historial",
		"header.collections": "Colecciones",
		"header.notifications": "Notificaciones",
		"header.toggleTheme": "Cambiar tema",
		"header.settings": "Ajustes",
		"header.fullscreen": "Pantalla completa",
		"header.exitFullscreen": "Salir de pantalla completa",
		"header.commandPalette": "Paleta de comandos",
		"header.gridView": "Vista de cuadrícula",
		"header.listView": "Vista de lista",
		"sidebar.packages": "Paquetes",
		"sidebar.categories": "Categorías",
		"sidebar.filterCategories": "Filtrar categorías…",
		"sidebar.filterIcons": "Filtrar iconos…",
		"sidebar.expandAll": "Expandir todo",
		"sidebar.collapseAll": "Contraer todo",
		"variant.all": "Todos",
		"variant.outline": "Contorno",
		"variant.filled": "Relleno",
		"variant.color": "Color",
		"toolbar.sort": "Ordenar",
		"toolbar.size": "Tamaño",
		"toolbar.stroke": "Trazo",
		"toolbar.color": "Color",
		"toolbar.treatment": "Tratamiento del icono",
		"toolbar.export": "Exportar",
		"toolbar.copyNames": "Copiar nombres",
		"toolbar.selected": "{n} seleccionados",
		"appearance.title": "Apariencia",
		"appearance.subtitle": "tema · marca · zoom",
		"appearance.theme": "Tema",
		"appearance.light": "Claro",
		"appearance.dark": "Oscuro",
		"appearance.brandAccent": "Color de marca",
		"appearance.customHex": "Hex personalizado",
		"appearance.radius": "Radio",
		"appearance.size": "Zoom de interfaz",
		"appearance.density": "Densidad de interfaz",
		"appearance.compact": "Compacto",
		"appearance.comfy": "Cómodo",
		"appearance.reduceMotion": "Reducir movimiento",
		"appearance.iconLabels": "Etiquetas de iconos",
		"appearance.language": "Idioma",
		"appearance.footer": "Se aplica solo a la aplicación. Se guarda en tu almacenamiento seleccionado.",
		"account.workspace": "Espacio de trabajo",
		"account.account": "Cuenta",
		"account.profile": "Perfil y preferencias",
		"account.sharedCollections": "Colecciones compartidas",
		"profile.signOutTitle": "¿Cerrar sesión?",
		"profile.signOutBody": "Conservarás los favoritos y filtros locales, pero las colecciones compartidas y las funciones de equipo requieren iniciar sesión de nuevo.",
		"profile.signedOut": "Sesión cerrada",
		"profile.switched": "Cambiado a {name}",
		"profile.title": "Perfil",
		"profile.account": "Cuenta",
		"profile.appSettings": "Ajustes y configuración de la app",
		"shared.title": "Colecciones compartidas",
		"shared.count": "{n} compartidas",
		"shared.empty": "Aún no hay colecciones compartidas.",
		"shared.manageAccess": "Gestionar acceso",
		"empty.noResults": "Ningún icono coincide con tus filtros.",
		"empty.noFavorites": "Aún no hay favoritos.",
		"empty.onboardTitle": "Selecciona paquetes para explorar",
		"empty.onboardDesc": "Los iconos aparecen cuando seleccionas al menos un paquete instalado.",
		"empty.selectAllPackages": "Seleccionar todos los paquetes",
		"empty.noMatchSearch": "Ningún icono coincide con «{q}»",
		"empty.noMatchFilters": "Ningún icono coincide con estos filtros",
		"empty.tryDifferent": "Prueba otro término, otra variante o borra los filtros activos.",
		"empty.clearFilters": "Borrar filtros",
		"toolbar.iconOne": "icono",
		"toolbar.iconMany": "iconos",
		"toolbar.removeFilter": "Quitar filtro",
		"toolbar.namesCopied": "{n} nombres copiados",
		"toolbar.exportedToast": "{n} iconos exportados — {label}",
		"toolbar.treatmentEngine": "Motor de tratamientos",
		"toolbar.toggleSortOrder": "Cambiar orden",
		"toolbar.gridIconSize": "Tamaño del icono en la cuadrícula",
		"toolbar.sizeUnit": "Unidad de tamaño",
		"toolbar.strokeTitle": "Grosor del trazo — reescribe el trazo en cuadrícula, detalle y exportación",
		"toolbar.previewColor": "Color de vista previa",
		"toolbar.resetFilters": "Restablecer filtros",
		"toolbar.resetTitle": "¿Restablecer todos los filtros?",
		"toolbar.resetBody": "La búsqueda, categorías, variantes, orden, página, selección y color de vista previa vuelven a sus valores predeterminados. Favoritos, colecciones y apariencia no se tocan.",
		"toolbar.resetConfirm": "Restablecer filtros",
		"toolbar.resetToast": "Filtros restablecidos",
		"footer.noResults": "Sin resultados",
		"footer.range": "{start}–{end} de {total}",
		"footer.perPageLabel": "Resultados por página",
		"footer.perPage": "{n} / página",
		"footer.prevPage": "Página anterior",
		"footer.nextPage": "Página siguiente",
		"list.copiedToast": "{name} copiado",
		"sidebar.scopeIcons": "Iconos",
		"sidebar.scopePackages": "Paquetes",
		"sidebar.scopeCategories": "Categorías",
		"sidebar.scopeAll": "Todo",
		"sidebar.notInstalled": "no instalado",
		"sidebar.inView": "En vista",
		"sidebar.selected": "Seleccionados",
		"sidebar.loadedIcons": "En este catálogo",
		"sidebar.ecosystemTotal": "Total del ecosistema",
		"sidebar.favorites": "Favoritos",
		"sidebar.filterPackages": "Filtrar paquetes…",
		"sidebar.searchEverything": "Buscar en todo…",
		"sidebar.searchScope": "Ámbito de búsqueda",
		"header.filtersPackages": "Filtros y paquetes",
		"header.toggleSidebar": "Alternar barra lateral",
		"header.devtools": "Ichava DevTools",
		"palette.placeholder": "Escribe un comando o busca iconos…",
		"palette.recent": "Recientes",
		"palette.actions": "Acciones",
		"palette.icons": "Iconos",
		"palette.openHint": "abrir",
		"palette.noMatches": "Sin coincidencias para «{q}»",
		"palette.navigate": "navegar",
		"palette.select": "seleccionar",
		"palette.close": "cerrar",
		"palette.toggleTheme": "Cambiar tema",
		"palette.openSettings": "Abrir ajustes",
		"palette.openFavorites": "Abrir favoritos",
		"palette.openHistory": "Abrir historial",
		"palette.openCollections": "Abrir colecciones",
		"palette.switchListView": "Cambiar a vista de lista",
		"palette.switchGridView": "Cambiar a vista de cuadrícula",
		"palette.resetFilters": "Restablecer todos los filtros",
		"palette.selectAll": "Seleccionar todos los coincidentes",
		"selectAll.confirmTitle": "¿Seleccionar los {n} iconos?",
		"selectAll.confirmBody": "No hay búsqueda ni filtros activos, así que se seleccionarán todos los iconos del catálogo.",
		"selectAll.confirmLabel": "Seleccionar todo",
		"palette.openDevtools": "Abrir Ichava DevTools",
		"common.remove": "Quitar",
		"settings.appearanceHintPre": "El tema, acento, radio, tamaño, densidad, movimiento y etiquetas están en el menú ",
		"settings.appearanceHintPost": " de la cabecera.",
		"settings.behavior": "Comportamiento",
		"settings.perPageTitle": "Iconos por página",
		"settings.perPageDesc": "Tamaño de paginación de la cuadrícula.",
		"settings.copyFormatTitle": "Formato de copia predeterminado",
		"settings.copyFormatDesc": "Usado al hacer clic para copiar en las fichas.",
		"settings.storageTitle": "Controlador de almacenamiento",
		"settings.storageDesc": "Dónde se guardan las preferencias y el estado.",
		"settings.storageLocal": "local",
		"settings.storageSession": "sesión",
		"settings.tourTitle": "Recorrido del producto",
		"settings.tourDesc": "Repetir el tutorial inicial.",
		"settings.replayTour": "Repetir recorrido",
		"settings.factoryTitle": "Restablecimiento de fábrica",
		"settings.factoryDesc": "Restaura todos los ajustes, filtros, favoritos y colecciones a sus valores predeterminados.",
		"settings.factoryConfirmTitle": "¿Restablecer todo a los valores de fábrica?",
		"settings.factoryConfirmBody": "Todas las preferencias, filtros, favoritos, historial, colecciones, personalización de marca, consentimiento e instantáneas guardadas volverán a sus valores predeterminados. Esto no se puede deshacer.",
		"settings.factoryConfirmLabel": "Restablecer todo",
		"settings.factoryToast": "Todo restablecido a los valores predeterminados",
		"settings.resetEverything": "Restablecer todo…",
		"settings.account": "Cuenta",
		"settings.syncNote": "favoritos y colecciones se sincronizan entre dispositivos",
		"settings.guestNote": "Estás navegando como invitado — las preferencias se guardan solo en este navegador. Inicia sesión para sincronizar favoritos, colecciones e historial entre dispositivos.",
		"settings.aboutLink": "Acerca de Ichava →",
		"consent.ariaLabel": "Cookies y almacenamiento",
		"consent.title": "Cookies y almacenamiento",
		"consent.body": "Ichava guarda tus preferencias y favoritos en el controlador de almacenamiento elegido, además de eventos de uso anónimos. Sin rastreadores de terceros.",
		"consent.essentialOnly": "Solo esenciales",
		"consent.acceptAll": "Aceptar todo",
		"about.browser": "Browser",
		"about.craftedBy": "Creado por",
		"about.statIcons": "iconos indexados",
		"about.statSets": "conjuntos de iconos",
		"about.statLicense": "licencia",
		"library.favorites": "Favoritos",
		"library.history": "Historial",
		"library.collections": "Colecciones",
		"library.emptyFavorites": "Aún no hay favoritos — pasa el ratón sobre un icono y toca el corazón.",
		"library.emptyHistory": "Aún no hay actividad — las vistas, copias y descargas aparecen aquí.",
		"library.emptyCollections": "Aún no hay colecciones — crea una arriba.",
		"library.clearHistory": "Borrar historial",
		"library.newCollectionPlaceholder": "Nombre de la colección…",
		"library.iconCount": "{n} iconos",
		"library.teamBadge": "equipo",
		"library.viewerBadge": "lector",
		"library.copyNamesTitle": "Copiar nombres de iconos",
		"library.deleteCollection": "Eliminar colección",
		"tile.openDetail": "Abrir detalle",
		"tile.copyFormat": "Copiar {format}",
		"tile.copyName": "Copiar nombre",
		"tile.copiedName": "Nombre copiado",
		"tile.copyPermalink": "Copiar enlace permanente",
		"tile.permalinkCopied": "Enlace permanente copiado",
		"tile.select": "Seleccionar",
		"tile.deselect": "Deseleccionar",
		"tile.addFavorite": "Añadir a favoritos",
		"tile.removeFavorite": "Quitar de favoritos",
		"tile.favoritedAria": "en favoritos",
		"tile.selectedAria": "seleccionado",
		"detail.previewOnly": "Solo vista previa — la cuadrícula no cambia",
		"detail.scaledToFit": "ajustado",
		"detail.actual": "real",
		"detail.size": "Tamaño",
		"detail.previewSize": "Tamaño de vista previa",
		"detail.unit": "Unidad",
		"detail.color": "Color",
		"detail.stroke": "Trazo",
		"detail.motion": "Movimiento",
		"detail.searchPresets": "Buscar {n} preajustes…",
		"detail.noPresets": "No se encontraron preajustes.",
		"detail.easing": "Suavizado",
		"detail.play": "Reproducir",
		"detail.pause": "Pausar",
		"detail.speed": "Velocidad",
		"detail.copied": "{label} copiado",
		"detail.download": "Descargar",
		"detail.keyframesAria": "JSON de fotogramas clave",
		"detail.keyframesValid": "{n} fotogramas — pega un Keyframe[] o { keyframes: […] }",
		"detail.keyframesInvalid": "JSON no válido — se espera un array de objetos de fotograma",
		"detail.related": "Iconos relacionados",
		"detail.addToCollection": "Añadir a colección",
		"detail.newCollection": "+ Nueva",
		"detail.noSvg": "No hay SVG disponible para este icono",
		"detail.pngNoSvg": "Error al exportar PNG — sin SVG",
		"detail.pngFailed": "Error al exportar PNG",
		"detail.addedTo": "Añadido a {name}",
		"detail.removedFrom": "Quitado de {name}",
		"detail.motionDefault": "Predeterminado",
		"console.copyCode": "Copiar código",
		"console.copy": "Copiar",
		"console.copied": "Copiado",
		"help.title": "Ayuda y acerca de",
		"help.about": "Acerca de Ichava",
		"help.docs": "Documentación",
		"help.replayTour": "Repetir recorrido del producto",
		"help.shortcuts": "Atajos de teclado",
		"notifications.clearAll": "Borrar todo",
		"notifications.empty": "Estás al día.",
		"team.title": "Equipo",
		"team.online": "{n} en línea",
		"team.onlineNow": "En línea",
		"team.away": "Ausente",
		"team.offline": "Desconectado",
		"team.invite": "Invitar…",
		"color.previewColor": "Color de vista previa",
		"color.resetToTheme": "Restablecer al tema",
		"color.opacity": "Opacidad — 0–100 %",
		"contextMenu.actions": "Acciones",
		"boot.loadingCatalog": "Cargando catálogo",
		"boot.ready": "Listo",
		"sidebar.iconVariant": "Variante del icono",
		"auth.signInTo": "Inicia sesión en {brand}",
		"auth.needsAccount": "necesita una cuenta.",
		"auth.emailCode": "Te enviaremos un código de un solo uso por correo — sin contraseña.",
		"auth.emailPlaceholder": "tu@empresa.com",
		"auth.sendCode": "Enviar código",
		"auth.newHere": "¿Nuevo por aquí?",
		"auth.createAccount": "Crear cuenta",
		"auth.enterCode": "Introduce tu código",
		"auth.sentTo": "Enviado a",
		"auth.demoHint": "Demo: cualquier código inicia sesión — prueba 000000 para ver el estado de error.",
		"auth.digit": "Dígito {n}",
		"auth.codeFailed": "Ese código no funcionó. Inténtalo de nuevo.",
		"auth.verify": "Verificar e iniciar sesión",
		"auth.changeEmail": "← Cambiar correo",
		"auth.resendIn": "Reenviar en {n}s",
		"auth.resendCode": "Reenviar código",
		"auth.createTitle": "Crea tu cuenta",
		"auth.createBlurb": "Únete para desbloquear colecciones, uso compartido y funciones de equipo. Verificaremos tu correo con un código de un solo uso.",
		"auth.firstName": "Nombre",
		"auth.lastName": "Apellidos",
		"auth.passwordPlaceholder": "Al menos 8 caracteres",
		"auth.togglePassword": "Mostrar u ocultar la contraseña",
		"auth.haveAccount": "¿Ya tienes una cuenta?",
		"invite.title": "Invitar al espacio de trabajo",
		"invite.workspace": "espacio de trabajo",
		"invite.emailPlaceholder": "companero@empresa.com",
		"invite.roleEditor": "Editor — puede añadir y compartir",
		"invite.roleViewer": "Lector — solo lectura",
		"invite.role": "Rol",
		"invite.linkExpires": "El enlace caduca",
		"invite.exp24h": "24 h",
		"invite.exp7d": "7 días",
		"invite.exp30d": "30 días",
		"invite.expNever": "Nunca",
		"invite.blurb": "Los invitados obtienen acceso a las colecciones compartidas de este espacio. El propietario puede cambiar los roles más tarde; los enlaces se pueden revocar en Ajustes.",
		"invite.generateLink": "Generar enlace",
		"invite.linkCopied": "Enlace de invitación copiado",
		"invite.yourTeammate": "tu compañero",
		"invite.sentNotification": "Invitación enviada a {to} ({role})",
		"invite.sent": "Invitación enviada",
		"invite.sendInvite": "Enviar invitación",
		"access.addPeople": "Añade personas o tu equipo",
		"access.searchTeammates": "Busca compañeros por nombre o correo…",
		"access.onlyYou": "Solo tú tienes acceso. Añade compañeros arriba o comparte con todo el equipo.",
		"access.saveAccess": "Guardar acceso",
		"access.shareEntireTeam": "Compartir con todo el equipo",
		"access.shareLinkCopied": "Enlace de uso compartido copiado",
		"access.copyLinkInstead": "Copiar enlace en su lugar",
		"shared.inviteTeam": "Invitar al equipo…",
		"shared.viewer": "lector",
		"shared.editor": "editor",
		"tour.skip": "Omitir",
		"tour.back": "Atrás",
		"tour.stepOf": "Paso {n} de {total}",
		"tour.next": "Siguiente",
		"tour.getStarted": "Empezar",
		"tour.s1Title": "Bienvenido a Ichava Browser",
		"tour.s1Body": "Cada icono de tu app Laravel — con búsqueda, vista previa y listo para copiar. Este recorrido de 30 segundos te muestra lo básico. Puedes repetirlo cuando quieras desde Ajustes.",
		"tour.s2Title": "Encuentra cualquier icono rápido",
		"tour.s2Body": "Busca por nombre o etiqueta, filtra por paquete, categoría y variante en la barra lateral, o pulsa ⌘K para la paleta de comandos.",
		"tour.s3Title": "Reestiliza en vivo",
		"tour.s3Body": "Tratamientos, tamaño, trazo, color y preajustes de movimiento reestilizan cada icono en el momento — la cuadrícula se actualiza mientras ajustas.",
		"tour.s4Title": "Copia para tu stack",
		"tour.s4Body": "Abre cualquier icono para Blade, Livewire, Vue, React, Svelte, Web Component, SVG en bruto y más — un clic para copiar.",
		"tour.s5Title": "Guarda y comparte",
		"tour.s5Body": "Marca iconos como favoritos, agrúpalos en colecciones y exporta un sprite, manifiesto o ZIP. Inicia sesión para sincronizar entre dispositivos.",
		"task.working": "Trabajando…",
		"task.export": "Exportando {n} iconos…",
		"task.copyNames": "Reuniendo {n} nombres de iconos…",
		"task.png": "Generando el PNG…",
		"task.selectAll": "Seleccionando todos los iconos coincidentes…",
		"export.files": "Archivos SVG",
		"export.filesDesc": "Descargas .svg individuales",
		"export.sprite": "Sprite SVG",
		"export.spriteDesc": "Una hoja de <symbol>",
		"export.manifest": "Manifiesto JSON",
		"export.manifestDesc": "ids, paquetes y categorías",
		"export.zip": "Paquete ZIP",
		"export.zipDesc": "Sprite + manifiesto + archivos",
		"copyFormat.svg": "SVG sin procesar",
		"copyFormat.blade": "Etiqueta Blade",
		"copyFormat.vue": "Fragmento Vue",
		"copyFormat.name": "Nombre del icono",
		"snippetTab.motion": "Movimiento",
		"snippetTab.helper": "Función helper",
		"snippetTab.bladeGeneric": "Blade (genérico)",
		"snippetTab.webcomponent": "Componente web",
		"snippetTab.name": "Nombre",
		"clipboard.copyFailed": "No se pudo copiar — selecciona y copia manualmente",
		"clipboard.copied": "Copiado al portapapeles"
	},
	fr: {
		"detail.snippetFormat": "Format de l’extrait",
		"console.code": "Code",
		"palette.results": "Résultats",
		"appearance.adaptMono": "Adapter les icônes noires en mode sombre",
		"app.documentTitle": "Ichava Browser — toutes les icônes dont votre app Laravel a besoin",
		"sort.name": "Nom",
		"sort.package": "Paquet",
		"sort.category": "Catégorie",
		"treatment.default": "Trait",
		"treatment.defaultDesc": "Traits d’origine du paquet",
		"treatment.solid": "Plein",
		"treatment.solidDesc": "Graisse plus forte, remplie",
		"treatment.duotone": "Bicolore",
		"treatment.duotoneDesc": "Couche d’ombre d’accent",
		"treatment.midtone": "Demi-teinte",
		"treatment.midtoneDesc": "Encre adoucie à 50 %",
		"treatment.halftone": "Trame",
		"treatment.halftoneDesc": "Remplissage rétro en points",
		"unit.pxValue": "{n} px",
		"common.cancel": "Annuler",
		"common.create": "Créer",
		"common.clear": "Effacer",
		"common.all": "Tous",
		"common.none": "Aucun",
		"common.copy": "Copier",
		"common.download": "Télécharger",
		"common.favorite": "Favori",
		"common.favorited": "Favori",
		"common.close": "Fermer",
		"common.signIn": "Se connecter",
		"common.signOut": "Se déconnecter",
		"common.search": "Rechercher des icônes, actions…",
		"header.favorites": "Favoris",
		"header.history": "Historique",
		"header.collections": "Collections",
		"header.notifications": "Notifications",
		"header.toggleTheme": "Changer de thème",
		"header.settings": "Paramètres",
		"header.fullscreen": "Plein écran",
		"header.exitFullscreen": "Quitter le plein écran",
		"header.commandPalette": "Palette de commandes",
		"header.gridView": "Vue grille",
		"header.listView": "Vue liste",
		"sidebar.packages": "Paquets",
		"sidebar.categories": "Catégories",
		"sidebar.filterCategories": "Filtrer les catégories…",
		"sidebar.filterIcons": "Filtrer les icônes…",
		"sidebar.expandAll": "Tout déplier",
		"sidebar.collapseAll": "Tout replier",
		"variant.all": "Tous",
		"variant.outline": "Contour",
		"variant.filled": "Plein",
		"variant.color": "Couleur",
		"toolbar.sort": "Trier",
		"toolbar.size": "Taille",
		"toolbar.stroke": "Trait",
		"toolbar.color": "Couleur",
		"toolbar.treatment": "Traitement de l’icône",
		"toolbar.export": "Exporter",
		"toolbar.copyNames": "Copier les noms",
		"toolbar.selected": "{n} sélectionnés",
		"appearance.title": "Apparence",
		"appearance.subtitle": "thème · marque · zoom",
		"appearance.theme": "Thème",
		"appearance.light": "Clair",
		"appearance.dark": "Sombre",
		"appearance.brandAccent": "Couleur de marque",
		"appearance.customHex": "Hex personnalisé",
		"appearance.radius": "Rayon",
		"appearance.size": "Zoom UI",
		"appearance.density": "Densité UI",
		"appearance.compact": "Compact",
		"appearance.comfy": "Confort",
		"appearance.reduceMotion": "Réduire les animations",
		"appearance.iconLabels": "Étiquettes d’icônes",
		"appearance.language": "Langue",
		"appearance.footer": "S’applique uniquement à l’application. Enregistré dans votre stockage sélectionné.",
		"account.workspace": "Espace de travail",
		"account.account": "Compte",
		"account.profile": "Profil et préférences",
		"account.sharedCollections": "Collections partagées",
		"profile.signOutTitle": "Se déconnecter ?",
		"profile.signOutBody": "Vous conserverez les favoris et filtres locaux, mais les collections partagées et les fonctions d’équipe nécessitent une reconnexion.",
		"profile.signedOut": "Déconnecté",
		"profile.switched": "Basculé vers {name}",
		"profile.title": "Profil",
		"profile.account": "Compte",
		"profile.appSettings": "Paramètres et configuration de l’app",
		"shared.title": "Collections partagées",
		"shared.count": "{n} partagées",
		"shared.empty": "Aucune collection partagée pour l’instant.",
		"shared.manageAccess": "Gérer l’accès",
		"empty.noResults": "Aucune icône ne correspond à vos filtres.",
		"empty.noFavorites": "Aucun favori pour l’instant.",
		"empty.onboardTitle": "Sélectionnez des jeux à parcourir",
		"empty.onboardDesc": "Les icônes apparaissent dès qu’au moins un jeu installé est sélectionné.",
		"empty.selectAllPackages": "Tout sélectionner",
		"empty.noMatchSearch": "Aucune icône ne correspond à « {q} »",
		"empty.noMatchFilters": "Aucune icône ne correspond à ces filtres",
		"empty.tryDifferent": "Essayez un autre terme, une autre variante, ou effacez les filtres actifs.",
		"empty.clearFilters": "Effacer les filtres",
		"toolbar.iconOne": "icône",
		"toolbar.iconMany": "icônes",
		"toolbar.removeFilter": "Retirer le filtre",
		"toolbar.namesCopied": "{n} noms copiés",
		"toolbar.exportedToast": "{n} icônes exportées — {label}",
		"toolbar.treatmentEngine": "Moteur de traitements",
		"toolbar.toggleSortOrder": "Inverser l’ordre",
		"toolbar.gridIconSize": "Taille des icônes de la grille",
		"toolbar.sizeUnit": "Unité de taille",
		"toolbar.strokeTitle": "Épaisseur du trait — réécrit le trait dans la grille, le détail et l’export",
		"toolbar.previewColor": "Couleur d’aperçu",
		"toolbar.resetFilters": "Réinitialiser les filtres",
		"toolbar.resetTitle": "Réinitialiser tous les filtres ?",
		"toolbar.resetBody": "La recherche, les catégories, variantes, le tri, la page, la sélection et la couleur d’aperçu reviennent aux valeurs par défaut. Les favoris, collections et l’apparence sont préservés.",
		"toolbar.resetConfirm": "Réinitialiser les filtres",
		"toolbar.resetToast": "Filtres réinitialisés",
		"footer.noResults": "Aucun résultat",
		"footer.range": "{start}–{end} sur {total}",
		"footer.perPageLabel": "Résultats par page",
		"footer.perPage": "{n} / page",
		"footer.prevPage": "Page précédente",
		"footer.nextPage": "Page suivante",
		"list.copiedToast": "{name} copié",
		"sidebar.scopeIcons": "Icônes",
		"sidebar.scopePackages": "Jeux",
		"sidebar.scopeCategories": "Catégories",
		"sidebar.scopeAll": "Tout",
		"sidebar.notInstalled": "non installé",
		"sidebar.inView": "Affichées",
		"sidebar.selected": "Sélectionnées",
		"sidebar.loadedIcons": "Dans ce catalogue",
		"sidebar.ecosystemTotal": "Total de l’écosystème",
		"sidebar.favorites": "Favoris",
		"sidebar.filterPackages": "Filtrer les jeux…",
		"sidebar.searchEverything": "Tout rechercher…",
		"sidebar.searchScope": "Portée de recherche",
		"header.filtersPackages": "Filtres et jeux",
		"header.toggleSidebar": "Afficher/masquer la barre latérale",
		"header.devtools": "Ichava DevTools",
		"palette.placeholder": "Tapez une commande ou recherchez des icônes…",
		"palette.recent": "Récents",
		"palette.actions": "Actions",
		"palette.icons": "Icônes",
		"palette.openHint": "ouvrir",
		"palette.noMatches": "Aucun résultat pour « {q} »",
		"palette.navigate": "naviguer",
		"palette.select": "sélectionner",
		"palette.close": "fermer",
		"palette.toggleTheme": "Changer de thème",
		"palette.openSettings": "Ouvrir les paramètres",
		"palette.openFavorites": "Ouvrir les favoris",
		"palette.openHistory": "Ouvrir l’historique",
		"palette.openCollections": "Ouvrir les collections",
		"palette.switchListView": "Passer en vue liste",
		"palette.switchGridView": "Passer en vue grille",
		"palette.resetFilters": "Réinitialiser tous les filtres",
		"palette.selectAll": "Sélectionner toutes les correspondances",
		"selectAll.confirmTitle": "Sélectionner les {n} icônes ?",
		"selectAll.confirmBody": "Aucune recherche ni aucun filtre n’est actif : toutes les icônes du catalogue seront sélectionnées.",
		"selectAll.confirmLabel": "Tout sélectionner",
		"palette.openDevtools": "Ouvrir Ichava DevTools",
		"common.remove": "Retirer",
		"settings.appearanceHintPre": "Le thème, l’accent, le rayon, la taille, la densité, le mouvement et les libellés sont dans le menu ",
		"settings.appearanceHintPost": " de l’en-tête.",
		"settings.behavior": "Comportement",
		"settings.perPageTitle": "Icônes par page",
		"settings.perPageDesc": "Taille de la pagination de la grille.",
		"settings.copyFormatTitle": "Format de copie par défaut",
		"settings.copyFormatDesc": "Utilisé par le clic-pour-copier sur les tuiles.",
		"settings.storageTitle": "Pilote de stockage",
		"settings.storageDesc": "Où les préférences et l’état sont conservés.",
		"settings.storageLocal": "local",
		"settings.storageSession": "session",
		"settings.tourTitle": "Visite guidée",
		"settings.tourDesc": "Rejouer la visite de première utilisation.",
		"settings.replayTour": "Rejouer la visite",
		"settings.factoryTitle": "Réinitialisation d’usine",
		"settings.factoryDesc": "Restaure tous les réglages, filtres, favoris et collections aux valeurs par défaut.",
		"settings.factoryConfirmTitle": "Tout réinitialiser aux réglages d’usine ?",
		"settings.factoryConfirmBody": "Toutes les préférences, filtres, favoris, historique, collections, personnalisation de marque, consentement et instantanés enregistrés reviendront aux valeurs par défaut. Cette action est irréversible.",
		"settings.factoryConfirmLabel": "Tout réinitialiser",
		"settings.factoryToast": "Tout réinitialisé aux valeurs par défaut",
		"settings.resetEverything": "Tout réinitialiser…",
		"settings.account": "Compte",
		"settings.syncNote": "les favoris et collections se synchronisent entre appareils",
		"settings.guestNote": "Vous naviguez en tant qu’invité — les préférences sont conservées uniquement dans ce navigateur. Connectez-vous pour synchroniser favoris, collections et historique entre appareils.",
		"settings.aboutLink": "À propos d’Ichava →",
		"consent.ariaLabel": "Cookies et stockage",
		"consent.title": "Cookies et stockage",
		"consent.body": "Ichava conserve vos préférences et favoris dans le pilote de stockage choisi, ainsi que des événements d’usage anonymes. Aucun traceur tiers.",
		"consent.essentialOnly": "Essentiels uniquement",
		"consent.acceptAll": "Tout accepter",
		"about.browser": "Browser",
		"about.craftedBy": "Conçu par",
		"about.statIcons": "icônes indexées",
		"about.statSets": "jeux d’icônes",
		"about.statLicense": "licence",
		"library.favorites": "Favoris",
		"library.history": "Historique",
		"library.collections": "Collections",
		"library.emptyFavorites": "Aucun favori pour l’instant — survolez une icône et touchez le cœur.",
		"library.emptyHistory": "Aucune activité pour l’instant — vues, copies et téléchargements apparaissent ici.",
		"library.emptyCollections": "Aucune collection pour l’instant — nommez-en une ci-dessus.",
		"library.clearHistory": "Effacer l’historique",
		"library.newCollectionPlaceholder": "Nom de la collection…",
		"library.iconCount": "{n} icônes",
		"library.teamBadge": "équipe",
		"library.viewerBadge": "lecteur",
		"library.copyNamesTitle": "Copier les noms d’icônes",
		"library.deleteCollection": "Supprimer la collection",
		"tile.openDetail": "Ouvrir le détail",
		"tile.copyFormat": "Copier {format}",
		"tile.copyName": "Copier le nom",
		"tile.copiedName": "Nom copié",
		"tile.copyPermalink": "Copier le lien permanent",
		"tile.permalinkCopied": "Lien permanent copié",
		"tile.select": "Sélectionner",
		"tile.deselect": "Désélectionner",
		"tile.addFavorite": "Ajouter aux favoris",
		"tile.removeFavorite": "Retirer des favoris",
		"tile.favoritedAria": "en favori",
		"tile.selectedAria": "sélectionné",
		"detail.previewOnly": "Aperçu seulement — la grille est inchangée",
		"detail.scaledToFit": "ajusté",
		"detail.actual": "réel",
		"detail.size": "Taille",
		"detail.previewSize": "Taille de l’aperçu",
		"detail.unit": "Unité",
		"detail.color": "Couleur",
		"detail.stroke": "Trait",
		"detail.motion": "Mouvement",
		"detail.searchPresets": "Rechercher {n} préréglages…",
		"detail.noPresets": "Aucun préréglage trouvé.",
		"detail.easing": "Accélération",
		"detail.play": "Lecture",
		"detail.pause": "Pause",
		"detail.speed": "Vitesse",
		"detail.copied": "{label} copié",
		"detail.download": "Télécharger",
		"detail.keyframesAria": "JSON des images clés",
		"detail.keyframesValid": "{n} images clés — collez un Keyframe[] ou { keyframes: […] }",
		"detail.keyframesInvalid": "JSON invalide — un tableau d’objets d’image clé est attendu",
		"detail.related": "Icônes associées",
		"detail.addToCollection": "Ajouter à la collection",
		"detail.newCollection": "+ Nouvelle",
		"detail.noSvg": "Aucun SVG disponible pour cette icône",
		"detail.pngNoSvg": "Échec de l’export PNG — pas de SVG",
		"detail.pngFailed": "Échec de l’export PNG",
		"detail.addedTo": "Ajouté à {name}",
		"detail.removedFrom": "Retiré de {name}",
		"detail.motionDefault": "Par défaut",
		"console.copyCode": "Copier le code",
		"console.copy": "Copier",
		"console.copied": "Copié",
		"help.title": "Aide et à propos",
		"help.about": "À propos d’Ichava",
		"help.docs": "Documentation",
		"help.replayTour": "Rejouer la visite du produit",
		"help.shortcuts": "Raccourcis clavier",
		"notifications.clearAll": "Tout effacer",
		"notifications.empty": "Vous êtes à jour.",
		"team.title": "Équipe",
		"team.online": "{n} en ligne",
		"team.onlineNow": "En ligne",
		"team.away": "Absent",
		"team.offline": "Hors ligne",
		"team.invite": "Inviter…",
		"color.previewColor": "Couleur d’aperçu",
		"color.resetToTheme": "Réinitialiser au thème",
		"color.opacity": "Opacité — 0–100 %",
		"contextMenu.actions": "Actions",
		"boot.loadingCatalog": "Chargement du catalogue",
		"boot.ready": "Prêt",
		"sidebar.iconVariant": "Variante d’icône",
		"auth.signInTo": "Connectez-vous à {brand}",
		"auth.needsAccount": "nécessite un compte.",
		"auth.emailCode": "Nous vous enverrons un code à usage unique par e-mail — sans mot de passe.",
		"auth.emailPlaceholder": "vous@entreprise.com",
		"auth.sendCode": "Envoyer le code",
		"auth.newHere": "Nouveau ici ?",
		"auth.createAccount": "Créer un compte",
		"auth.enterCode": "Saisissez votre code",
		"auth.sentTo": "Envoyé à",
		"auth.demoHint": "Démo : n’importe quel code connecte — essayez 000000 pour voir l’état d’échec.",
		"auth.digit": "Chiffre {n}",
		"auth.codeFailed": "Ce code n’a pas fonctionné. Réessayez.",
		"auth.verify": "Vérifier et se connecter",
		"auth.changeEmail": "← Changer d’e-mail",
		"auth.resendIn": "Renvoyer dans {n}s",
		"auth.resendCode": "Renvoyer le code",
		"auth.createTitle": "Créez votre compte",
		"auth.createBlurb": "Rejoignez-nous pour débloquer les collections, le partage et les fonctions d’équipe. Nous vérifierons votre e-mail avec un code à usage unique.",
		"auth.firstName": "Prénom",
		"auth.lastName": "Nom",
		"auth.passwordPlaceholder": "Au moins 8 caractères",
		"auth.togglePassword": "Afficher ou masquer le mot de passe",
		"auth.haveAccount": "Vous avez déjà un compte ?",
		"invite.title": "Inviter dans l’espace de travail",
		"invite.workspace": "espace de travail",
		"invite.emailPlaceholder": "collegue@entreprise.com",
		"invite.roleEditor": "Éditeur — peut ajouter et partager",
		"invite.roleViewer": "Lecteur — lecture seule",
		"invite.role": "Rôle",
		"invite.linkExpires": "Le lien expire",
		"invite.exp24h": "24 h",
		"invite.exp7d": "7 jours",
		"invite.exp30d": "30 jours",
		"invite.expNever": "Jamais",
		"invite.blurb": "Les invités accèdent aux collections partagées de cet espace. Le propriétaire peut changer les rôles plus tard ; les liens peuvent être révoqués dans les Paramètres.",
		"invite.generateLink": "Générer un lien",
		"invite.linkCopied": "Lien d’invitation copié",
		"invite.yourTeammate": "votre collègue",
		"invite.sentNotification": "Invitation envoyée à {to} ({role})",
		"invite.sent": "Invitation envoyée",
		"invite.sendInvite": "Envoyer l’invitation",
		"access.addPeople": "Ajoutez des personnes ou votre équipe",
		"access.searchTeammates": "Rechercher des collègues par nom ou e-mail…",
		"access.onlyYou": "Vous seul avez accès. Ajoutez des collègues ci-dessus ou partagez avec toute l’équipe.",
		"access.saveAccess": "Enregistrer l’accès",
		"access.shareEntireTeam": "Partager avec toute l’équipe",
		"access.shareLinkCopied": "Lien de partage copié",
		"access.copyLinkInstead": "Copier le lien à la place",
		"shared.inviteTeam": "Inviter l’équipe…",
		"shared.viewer": "lecteur",
		"shared.editor": "éditeur",
		"tour.skip": "Passer",
		"tour.back": "Retour",
		"tour.stepOf": "Étape {n} sur {total}",
		"tour.next": "Suivant",
		"tour.getStarted": "Commencer",
		"tour.s1Title": "Bienvenue dans Ichava Browser",
		"tour.s1Body": "Chaque icône de votre app Laravel — recherchable, prévisualisable, prête à copier. Cette visite de 30 secondes vous fait le tour. Vous pouvez la rejouer à tout moment depuis les Paramètres.",
		"tour.s2Title": "Trouvez n’importe quelle icône vite",
		"tour.s2Body": "Recherchez par nom ou tag, filtrez par jeu, catégorie et variante dans la barre latérale, ou appuyez sur ⌘K pour la palette de commandes.",
		"tour.s3Title": "Restylez en direct",
		"tour.s3Body": "Traitements, taille, trait, couleur et préréglages de mouvement restylent chaque icône sur place — la grille se met à jour à mesure que vous ajustez.",
		"tour.s4Title": "Copiez pour votre stack",
		"tour.s4Body": "Ouvrez n’importe quelle icône pour Blade, Livewire, Vue, React, Svelte, Web Component, SVG brut et plus — un clic pour copier.",
		"tour.s5Title": "Enregistrez et partagez",
		"tour.s5Body": "Ajoutez des icônes aux favoris, regroupez-les en collections et exportez un sprite, un manifeste ou un ZIP. Connectez-vous pour synchroniser entre appareils.",
		"task.working": "Traitement…",
		"task.export": "Export de {n} icônes…",
		"task.copyNames": "Collecte de {n} noms d’icônes…",
		"task.png": "Rendu du PNG…",
		"task.selectAll": "Sélection de toutes les icônes correspondantes…",
		"export.files": "Fichiers SVG",
		"export.filesDesc": "Téléchargements .svg individuels",
		"export.sprite": "Sprite SVG",
		"export.spriteDesc": "Une feuille de <symbol>",
		"export.manifest": "Manifeste JSON",
		"export.manifestDesc": "ids, paquets et catégories",
		"export.zip": "Archive ZIP",
		"export.zipDesc": "Sprite + manifeste + fichiers",
		"copyFormat.svg": "SVG brut",
		"copyFormat.blade": "Balise Blade",
		"copyFormat.vue": "Extrait Vue",
		"copyFormat.name": "Nom de l’icône",
		"snippetTab.motion": "Animation",
		"snippetTab.helper": "Fonction helper",
		"snippetTab.bladeGeneric": "Blade (générique)",
		"snippetTab.webcomponent": "Composant web",
		"snippetTab.name": "Nom",
		"clipboard.copyFailed": "Échec de la copie — sélectionnez et copiez manuellement",
		"clipboard.copied": "Copié dans le presse-papiers"
	},
	de: {
		"detail.snippetFormat": "Snippet-Format",
		"console.code": "Code",
		"palette.results": "Ergebnisse",
		"appearance.adaptMono": "Schwarze Symbole im Dunkelmodus anpassen",
		"app.documentTitle": "Ichava Browser — jedes Symbol, das Ihre Laravel-App braucht",
		"sort.name": "Name",
		"sort.package": "Paket",
		"sort.category": "Kategorie",
		"treatment.default": "Strich",
		"treatment.defaultDesc": "Originale Striche des Pakets",
		"treatment.solid": "Gefüllt",
		"treatment.solidDesc": "Kräftiger, gefüllt",
		"treatment.duotone": "Zweifarbig",
		"treatment.duotoneDesc": "Akzent-Schattenebene",
		"treatment.midtone": "Mittelton",
		"treatment.midtoneDesc": "Auf 50 % abgeschwächte Farbe",
		"treatment.halftone": "Raster",
		"treatment.halftoneDesc": "Retro-Punktraster",
		"unit.pxValue": "{n} px",
		"common.cancel": "Abbrechen",
		"common.create": "Erstellen",
		"common.clear": "Löschen",
		"common.all": "Alle",
		"common.none": "Keine",
		"common.copy": "Kopieren",
		"common.download": "Herunterladen",
		"common.favorite": "Favorit",
		"common.favorited": "Favorisiert",
		"common.close": "Schließen",
		"common.signIn": "Anmelden",
		"common.signOut": "Abmelden",
		"common.search": "Symbole, Aktionen suchen…",
		"header.favorites": "Favoriten",
		"header.history": "Verlauf",
		"header.collections": "Sammlungen",
		"header.notifications": "Benachrichtigungen",
		"header.toggleTheme": "Design wechseln",
		"header.settings": "Einstellungen",
		"header.fullscreen": "Vollbild",
		"header.exitFullscreen": "Vollbild beenden",
		"header.commandPalette": "Befehlspalette",
		"header.gridView": "Rasteransicht",
		"header.listView": "Listenansicht",
		"sidebar.packages": "Pakete",
		"sidebar.categories": "Kategorien",
		"sidebar.filterCategories": "Kategorien filtern…",
		"sidebar.filterIcons": "Symbole filtern…",
		"sidebar.expandAll": "Alle ausklappen",
		"sidebar.collapseAll": "Alle einklappen",
		"variant.all": "Alle",
		"variant.outline": "Umriss",
		"variant.filled": "Gefüllt",
		"variant.color": "Farbe",
		"toolbar.sort": "Sortieren",
		"toolbar.size": "Größe",
		"toolbar.stroke": "Strich",
		"toolbar.color": "Farbe",
		"toolbar.treatment": "Symbolstil",
		"toolbar.export": "Exportieren",
		"toolbar.copyNames": "Namen kopieren",
		"toolbar.selected": "{n} ausgewählt",
		"appearance.title": "Darstellung",
		"appearance.subtitle": "Design · Marke · Zoom",
		"appearance.theme": "Design",
		"appearance.light": "Hell",
		"appearance.dark": "Dunkel",
		"appearance.brandAccent": "Markenfarbe",
		"appearance.customHex": "Eigener Hex",
		"appearance.radius": "Radius",
		"appearance.size": "UI-Zoom",
		"appearance.density": "UI-Dichte",
		"appearance.compact": "Kompakt",
		"appearance.comfy": "Komfortabel",
		"appearance.reduceMotion": "Bewegung reduzieren",
		"appearance.iconLabels": "Symbolbeschriftungen",
		"appearance.language": "Sprache",
		"appearance.footer": "Gilt nur für die Anwendung. Wird in Ihrem gewählten Speicher gespeichert.",
		"account.workspace": "Arbeitsbereich",
		"account.account": "Konto",
		"account.profile": "Profil & Einstellungen",
		"account.sharedCollections": "Geteilte Sammlungen",
		"profile.signOutTitle": "Abmelden?",
		"profile.signOutBody": "Lokale Favoriten und Filter bleiben erhalten, aber geteilte Sammlungen und Team-Funktionen erfordern eine erneute Anmeldung.",
		"profile.signedOut": "Abgemeldet",
		"profile.switched": "Zu {name} gewechselt",
		"profile.title": "Profil",
		"profile.account": "Konto",
		"profile.appSettings": "App-Einstellungen & Konfiguration",
		"shared.title": "Geteilte Sammlungen",
		"shared.count": "{n} geteilt",
		"shared.empty": "Noch keine Sammlungen geteilt.",
		"shared.manageAccess": "Zugriff verwalten",
		"empty.noResults": "Keine Symbole entsprechen deinen Filtern.",
		"empty.noFavorites": "Noch keine Favoriten.",
		"empty.onboardTitle": "Sätze zum Durchsuchen wählen",
		"empty.onboardDesc": "Symbole erscheinen, sobald mindestens ein installierter Satz ausgewählt ist.",
		"empty.selectAllPackages": "Alle Sätze auswählen",
		"empty.noMatchSearch": "Keine Symbole für „{q}“",
		"empty.noMatchFilters": "Keine Symbole entsprechen diesen Filtern",
		"empty.tryDifferent": "Versuche einen anderen Begriff, eine andere Variante, oder lösche die aktiven Filter.",
		"empty.clearFilters": "Filter löschen",
		"toolbar.iconOne": "Symbol",
		"toolbar.iconMany": "Symbole",
		"toolbar.removeFilter": "Filter entfernen",
		"toolbar.namesCopied": "{n} Namen kopiert",
		"toolbar.exportedToast": "{n} Symbole exportiert — {label}",
		"toolbar.treatmentEngine": "Stil-Engine",
		"toolbar.toggleSortOrder": "Sortierreihenfolge umkehren",
		"toolbar.gridIconSize": "Symbolgröße im Raster",
		"toolbar.sizeUnit": "Größeneinheit",
		"toolbar.strokeTitle": "Strichstärke — überschreibt den Strich in Raster, Detail & Export",
		"toolbar.previewColor": "Vorschaufarbe",
		"toolbar.resetFilters": "Filter zurücksetzen",
		"toolbar.resetTitle": "Alle Filter zurücksetzen?",
		"toolbar.resetBody": "Suche, Kategorien, Varianten, Sortierung, Seite, Auswahl und Vorschaufarbe kehren zu den Standardwerten zurück. Favoriten, Sammlungen und Darstellung bleiben unberührt.",
		"toolbar.resetConfirm": "Filter zurücksetzen",
		"toolbar.resetToast": "Filter zurückgesetzt",
		"footer.noResults": "Keine Ergebnisse",
		"footer.range": "{start}–{end} von {total}",
		"footer.perPageLabel": "Ergebnisse pro Seite",
		"footer.perPage": "{n} / Seite",
		"footer.prevPage": "Vorherige Seite",
		"footer.nextPage": "Nächste Seite",
		"list.copiedToast": "{name} kopiert",
		"sidebar.scopeIcons": "Symbole",
		"sidebar.scopePackages": "Sätze",
		"sidebar.scopeCategories": "Kategorien",
		"sidebar.scopeAll": "Alle",
		"sidebar.notInstalled": "nicht installiert",
		"sidebar.inView": "Sichtbar",
		"sidebar.selected": "Ausgewählt",
		"sidebar.loadedIcons": "In diesem Katalog",
		"sidebar.ecosystemTotal": "Ökosystem gesamt",
		"sidebar.favorites": "Favoriten",
		"sidebar.filterPackages": "Sätze filtern…",
		"sidebar.searchEverything": "Alles durchsuchen…",
		"sidebar.searchScope": "Suchbereich",
		"header.filtersPackages": "Filter & Sätze",
		"header.toggleSidebar": "Seitenleiste umschalten",
		"header.devtools": "Ichava DevTools",
		"palette.placeholder": "Befehl eingeben oder Symbole suchen…",
		"palette.recent": "Zuletzt",
		"palette.actions": "Aktionen",
		"palette.icons": "Symbole",
		"palette.openHint": "öffnen",
		"palette.noMatches": "Keine Treffer für „{q}“",
		"palette.navigate": "navigieren",
		"palette.select": "auswählen",
		"palette.close": "schließen",
		"palette.toggleTheme": "Design wechseln",
		"palette.openSettings": "Einstellungen öffnen",
		"palette.openFavorites": "Favoriten öffnen",
		"palette.openHistory": "Verlauf öffnen",
		"palette.openCollections": "Sammlungen öffnen",
		"palette.switchListView": "Zur Listenansicht wechseln",
		"palette.switchGridView": "Zur Rasteransicht wechseln",
		"palette.resetFilters": "Alle Filter zurücksetzen",
		"palette.selectAll": "Alle Treffer auswählen",
		"selectAll.confirmTitle": "Alle {n} Symbole auswählen?",
		"selectAll.confirmBody": "Keine Suche und kein Filter ist aktiv, daher werden alle Symbole im Katalog ausgewählt.",
		"selectAll.confirmLabel": "Alle auswählen",
		"palette.openDevtools": "Ichava DevTools öffnen",
		"common.remove": "Entfernen",
		"settings.appearanceHintPre": "Design, Akzent, Radius, Größe, Dichte, Bewegung und Beschriftungen findest du im Menü ",
		"settings.appearanceHintPost": " in der Kopfzeile.",
		"settings.behavior": "Verhalten",
		"settings.perPageTitle": "Symbole pro Seite",
		"settings.perPageDesc": "Größe der Raster-Paginierung.",
		"settings.copyFormatTitle": "Standard-Kopierformat",
		"settings.copyFormatDesc": "Wird beim Klick-zum-Kopieren auf Kacheln verwendet.",
		"settings.storageTitle": "Speichertreiber",
		"settings.storageDesc": "Wo Einstellungen & Zustand gespeichert werden.",
		"settings.storageLocal": "lokal",
		"settings.storageSession": "Sitzung",
		"settings.tourTitle": "Produkttour",
		"settings.tourDesc": "Die Einführung erneut abspielen.",
		"settings.replayTour": "Tour erneut abspielen",
		"settings.factoryTitle": "Werkseinstellungen",
		"settings.factoryDesc": "Setzt alle Einstellungen, Filter, Favoriten und Sammlungen auf die Standardwerte zurück.",
		"settings.factoryConfirmTitle": "Alles auf Werkseinstellungen zurücksetzen?",
		"settings.factoryConfirmBody": "Alle Einstellungen, Filter, Favoriten, Verlauf, Sammlungen, Markenanpassungen, Einwilligung und gespeicherte Snapshots werden auf die Standardwerte zurückgesetzt. Dies kann nicht rückgängig gemacht werden.",
		"settings.factoryConfirmLabel": "Alles zurücksetzen",
		"settings.factoryToast": "Alles auf Standard zurückgesetzt",
		"settings.resetEverything": "Alles zurücksetzen…",
		"settings.account": "Konto",
		"settings.syncNote": "Favoriten & Sammlungen werden geräteübergreifend synchronisiert",
		"settings.guestNote": "Du surfst als Gast — Einstellungen bleiben nur in diesem Browser erhalten. Melde dich an, um Favoriten, Sammlungen und Verlauf geräteübergreifend zu synchronisieren.",
		"settings.aboutLink": "Über Ichava →",
		"consent.ariaLabel": "Cookies und Speicher",
		"consent.title": "Cookies & Speicher",
		"consent.body": "Ichava speichert deine Einstellungen und Favoriten im gewählten Speichertreiber sowie anonyme Nutzungsereignisse. Keine Tracker von Drittanbietern.",
		"consent.essentialOnly": "Nur essenzielle",
		"consent.acceptAll": "Alle akzeptieren",
		"about.browser": "Browser",
		"about.craftedBy": "Erstellt von",
		"about.statIcons": "indizierte Symbole",
		"about.statSets": "Symbolsätze",
		"about.statLicense": "Lizenz",
		"library.favorites": "Favoriten",
		"library.history": "Verlauf",
		"library.collections": "Sammlungen",
		"library.emptyFavorites": "Noch keine Favoriten — fahre über ein Symbol und tippe auf das Herz.",
		"library.emptyHistory": "Noch keine Aktivität — Ansichten, Kopien und Downloads erscheinen hier.",
		"library.emptyCollections": "Noch keine Sammlungen — erstelle oben eine.",
		"library.clearHistory": "Verlauf löschen",
		"library.newCollectionPlaceholder": "Name der Sammlung…",
		"library.iconCount": "{n} Symbole",
		"library.teamBadge": "Team",
		"library.viewerBadge": "Betrachter",
		"library.copyNamesTitle": "Symbolnamen kopieren",
		"library.deleteCollection": "Sammlung löschen",
		"tile.openDetail": "Details öffnen",
		"tile.copyFormat": "{format} kopieren",
		"tile.copyName": "Namen kopieren",
		"tile.copiedName": "Name kopiert",
		"tile.copyPermalink": "Permalink kopieren",
		"tile.permalinkCopied": "Permalink kopiert",
		"tile.select": "Auswählen",
		"tile.deselect": "Abwählen",
		"tile.addFavorite": "Zu Favoriten",
		"tile.removeFavorite": "Aus Favoriten entfernen",
		"tile.favoritedAria": "favorisiert",
		"tile.selectedAria": "ausgewählt",
		"detail.previewOnly": "Nur Vorschau — das Raster bleibt unberührt",
		"detail.scaledToFit": "eingepasst",
		"detail.actual": "tatsächlich",
		"detail.size": "Größe",
		"detail.previewSize": "Vorschaugröße",
		"detail.unit": "Einheit",
		"detail.color": "Farbe",
		"detail.stroke": "Strich",
		"detail.motion": "Bewegung",
		"detail.searchPresets": "{n} Presets durchsuchen…",
		"detail.noPresets": "Keine Presets gefunden.",
		"detail.easing": "Beschleunigung",
		"detail.play": "Abspielen",
		"detail.pause": "Pause",
		"detail.speed": "Geschwindigkeit",
		"detail.copied": "{label} kopiert",
		"detail.download": "Herunterladen",
		"detail.keyframesAria": "Keyframes-JSON",
		"detail.keyframesValid": "{n} Keyframes — füge ein Keyframe[] oder { keyframes: […] } ein",
		"detail.keyframesInvalid": "Ungültiges JSON — ein Array einfacher Keyframe-Objekte wird erwartet",
		"detail.related": "Verwandte Symbole",
		"detail.addToCollection": "Zur Sammlung hinzufügen",
		"detail.newCollection": "+ Neu",
		"detail.noSvg": "Kein SVG für dieses Symbol verfügbar",
		"detail.pngNoSvg": "PNG-Export fehlgeschlagen — kein SVG",
		"detail.pngFailed": "PNG-Export fehlgeschlagen",
		"detail.addedTo": "Zu {name} hinzugefügt",
		"detail.removedFrom": "Aus {name} entfernt",
		"detail.motionDefault": "Standard",
		"console.copyCode": "Code kopieren",
		"console.copy": "Kopieren",
		"console.copied": "Kopiert",
		"help.title": "Hilfe & Info",
		"help.about": "Über Ichava",
		"help.docs": "Dokumentation",
		"help.replayTour": "Produkttour erneut abspielen",
		"help.shortcuts": "Tastenkürzel",
		"notifications.clearAll": "Alle löschen",
		"notifications.empty": "Alles erledigt.",
		"team.title": "Team",
		"team.online": "{n} online",
		"team.onlineNow": "Jetzt online",
		"team.away": "Abwesend",
		"team.offline": "Offline",
		"team.invite": "Einladen…",
		"color.previewColor": "Vorschaufarbe",
		"color.resetToTheme": "Auf Design zurücksetzen",
		"color.opacity": "Deckkraft — 0–100 %",
		"contextMenu.actions": "Aktionen",
		"boot.loadingCatalog": "Katalog wird geladen",
		"boot.ready": "Bereit",
		"sidebar.iconVariant": "Symbolvariante",
		"auth.signInTo": "Bei {brand} anmelden",
		"auth.needsAccount": "benötigt ein Konto.",
		"auth.emailCode": "Wir senden dir einen Einmalcode per E-Mail — ohne Passwort.",
		"auth.emailPlaceholder": "du@firma.com",
		"auth.sendCode": "Code senden",
		"auth.newHere": "Neu hier?",
		"auth.createAccount": "Konto erstellen",
		"auth.enterCode": "Gib deinen Code ein",
		"auth.sentTo": "Gesendet an",
		"auth.demoHint": "Demo: jeder Code meldet an — probiere 000000 für den Fehlerzustand.",
		"auth.digit": "Ziffer {n}",
		"auth.codeFailed": "Dieser Code hat nicht funktioniert. Versuche es erneut.",
		"auth.verify": "Verifizieren & anmelden",
		"auth.changeEmail": "← E-Mail ändern",
		"auth.resendIn": "Erneut senden in {n}s",
		"auth.resendCode": "Code erneut senden",
		"auth.createTitle": "Erstelle dein Konto",
		"auth.createBlurb": "Registriere dich, um Sammlungen, Freigabe und Team-Funktionen freizuschalten. Wir bestätigen deine E-Mail mit einem Einmalcode.",
		"auth.firstName": "Vorname",
		"auth.lastName": "Nachname",
		"auth.passwordPlaceholder": "Mindestens 8 Zeichen",
		"auth.togglePassword": "Passwort ein- oder ausblenden",
		"auth.haveAccount": "Hast du schon ein Konto?",
		"invite.title": "In Arbeitsbereich einladen",
		"invite.workspace": "Arbeitsbereich",
		"invite.emailPlaceholder": "kollege@firma.com",
		"invite.roleEditor": "Bearbeiter — kann hinzufügen & teilen",
		"invite.roleViewer": "Betrachter — nur lesen",
		"invite.role": "Rolle",
		"invite.linkExpires": "Link läuft ab",
		"invite.exp24h": "24 Std",
		"invite.exp7d": "7 Tage",
		"invite.exp30d": "30 Tage",
		"invite.expNever": "Nie",
		"invite.blurb": "Eingeladene erhalten Zugriff auf die geteilten Sammlungen dieses Arbeitsbereichs. Rollen kann der Eigentümer später ändern; Links lassen sich in den Einstellungen widerrufen.",
		"invite.generateLink": "Link erzeugen",
		"invite.linkCopied": "Einladungslink kopiert",
		"invite.yourTeammate": "dein Teammitglied",
		"invite.sentNotification": "Einladung an {to} gesendet ({role})",
		"invite.sent": "Einladung gesendet",
		"invite.sendInvite": "Einladung senden",
		"access.addPeople": "Personen oder dein Team hinzufügen",
		"access.searchTeammates": "Teammitglieder nach Name oder E-Mail suchen…",
		"access.onlyYou": "Nur du hast Zugriff. Füge oben Teammitglieder hinzu oder teile mit dem ganzen Team.",
		"access.saveAccess": "Zugriff speichern",
		"access.shareEntireTeam": "Mit gesamtem Team teilen",
		"access.shareLinkCopied": "Freigabelink kopiert",
		"access.copyLinkInstead": "Stattdessen Link kopieren",
		"shared.inviteTeam": "Team einladen…",
		"shared.viewer": "Betrachter",
		"shared.editor": "Bearbeiter",
		"tour.skip": "Überspringen",
		"tour.back": "Zurück",
		"tour.stepOf": "Schritt {n} von {total}",
		"tour.next": "Weiter",
		"tour.getStarted": "Loslegen",
		"tour.s1Title": "Willkommen bei Ichava Browser",
		"tour.s1Body": "Jedes Symbol in deiner Laravel-App — durchsuchbar, vorschaubar, kopierbereit. Diese 30-Sekunden-Tour zeigt dir alles. Du kannst sie jederzeit über die Einstellungen erneut abspielen.",
		"tour.s2Title": "Finde jedes Symbol schnell",
		"tour.s2Body": "Suche nach Name oder Tag, filtere nach Satz, Kategorie und Variante in der Seitenleiste, oder drücke ⌘K für die Befehlspalette.",
		"tour.s3Title": "Style live um",
		"tour.s3Body": "Stile, Größe, Strich, Farbe und Bewegungs-Presets stylen jedes Symbol direkt um — das Raster aktualisiert sich beim Anpassen.",
		"tour.s4Title": "Kopiere für deinen Stack",
		"tour.s4Body": "Öffne ein Symbol für Blade, Livewire, Vue, React, Svelte, Web Component, rohes SVG und mehr — ein Klick zum Kopieren.",
		"tour.s5Title": "Speichern & teilen",
		"tour.s5Body": "Favorisiere Symbole, gruppiere sie in Sammlungen und exportiere ein Sprite, Manifest oder ZIP. Melde dich an, um geräteübergreifend zu synchronisieren.",
		"task.working": "Wird bearbeitet…",
		"task.export": "{n} Symbole werden exportiert…",
		"task.copyNames": "{n} Symbolnamen werden gesammelt…",
		"task.png": "PNG wird erstellt…",
		"task.selectAll": "Alle passenden Symbole werden ausgewählt…",
		"export.files": "SVG-Dateien",
		"export.filesDesc": "Einzelne .svg-Downloads",
		"export.sprite": "SVG-Sprite",
		"export.spriteDesc": "Ein <symbol>-Sheet",
		"export.manifest": "JSON-Manifest",
		"export.manifestDesc": "IDs, Pakete & Kategorien",
		"export.zip": "ZIP-Bundle",
		"export.zipDesc": "Sprite + Manifest + Dateien",
		"copyFormat.svg": "Rohes SVG",
		"copyFormat.blade": "Blade-Tag",
		"copyFormat.vue": "Vue-Snippet",
		"copyFormat.name": "Symbolname",
		"snippetTab.motion": "Bewegung",
		"snippetTab.helper": "Helper-Funktion",
		"snippetTab.bladeGeneric": "Blade (generisch)",
		"snippetTab.webcomponent": "Web-Komponente",
		"snippetTab.name": "Name",
		"clipboard.copyFailed": "Kopieren fehlgeschlagen — markieren und manuell kopieren",
		"clipboard.copied": "In die Zwischenablage kopiert"
	},
	pt: {
		"detail.snippetFormat": "Formato do trecho",
		"console.code": "Código",
		"palette.results": "Resultados",
		"appearance.adaptMono": "Adaptar ícones pretos no modo escuro",
		"app.documentTitle": "Ichava Browser — todos os ícones de que sua app Laravel precisa",
		"sort.name": "Nome",
		"sort.package": "Pacote",
		"sort.category": "Categoria",
		"treatment.default": "Traço",
		"treatment.defaultDesc": "Traços originais do pacote",
		"treatment.solid": "Sólido",
		"treatment.solidDesc": "Peso mais forte e preenchido",
		"treatment.duotone": "Dois tons",
		"treatment.duotoneDesc": "Camada de sombra de destaque",
		"treatment.midtone": "Meio-tom",
		"treatment.midtoneDesc": "Tinta suavizada a 50%",
		"treatment.halftone": "Retícula",
		"treatment.halftoneDesc": "Preenchimento retrô de pontos",
		"unit.pxValue": "{n} px",
		"common.cancel": "Cancelar",
		"common.create": "Criar",
		"common.clear": "Limpar",
		"common.all": "Todos",
		"common.none": "Nenhum",
		"common.copy": "Copiar",
		"common.download": "Baixar",
		"common.favorite": "Favorito",
		"common.favorited": "Favoritado",
		"common.close": "Fechar",
		"common.signIn": "Entrar",
		"common.signOut": "Sair",
		"common.search": "Pesquisar ícones, ações…",
		"header.favorites": "Favoritos",
		"header.history": "Histórico",
		"header.collections": "Coleções",
		"header.notifications": "Notificações",
		"header.toggleTheme": "Alternar tema",
		"header.settings": "Configurações",
		"header.fullscreen": "Tela cheia",
		"header.exitFullscreen": "Sair da tela cheia",
		"header.commandPalette": "Paleta de comandos",
		"header.gridView": "Visualização em grade",
		"header.listView": "Visualização em lista",
		"sidebar.packages": "Pacotes",
		"sidebar.categories": "Categorias",
		"sidebar.filterCategories": "Filtrar categorias…",
		"sidebar.filterIcons": "Filtrar ícones…",
		"sidebar.expandAll": "Expandir tudo",
		"sidebar.collapseAll": "Recolher tudo",
		"variant.all": "Todos",
		"variant.outline": "Contorno",
		"variant.filled": "Preenchido",
		"variant.color": "Cor",
		"toolbar.sort": "Ordenar",
		"toolbar.size": "Tamanho",
		"toolbar.stroke": "Traço",
		"toolbar.color": "Cor",
		"toolbar.treatment": "Tratamento do ícone",
		"toolbar.export": "Exportar",
		"toolbar.copyNames": "Copiar nomes",
		"toolbar.selected": "{n} selecionados",
		"appearance.title": "Aparência",
		"appearance.subtitle": "tema · marca · zoom",
		"appearance.theme": "Tema",
		"appearance.light": "Claro",
		"appearance.dark": "Escuro",
		"appearance.brandAccent": "Cor da marca",
		"appearance.customHex": "Hex personalizado",
		"appearance.radius": "Raio",
		"appearance.size": "Zoom da interface",
		"appearance.density": "Densidade da interface",
		"appearance.compact": "Compacto",
		"appearance.comfy": "Confortável",
		"appearance.reduceMotion": "Reduzir movimento",
		"appearance.iconLabels": "Rótulos de ícones",
		"appearance.language": "Idioma",
		"appearance.footer": "Aplica-se apenas ao aplicativo. Salvo no armazenamento selecionado.",
		"account.workspace": "Espaço de trabalho",
		"account.account": "Conta",
		"account.profile": "Perfil e preferências",
		"account.sharedCollections": "Coleções compartilhadas",
		"profile.signOutTitle": "Terminar sessão?",
		"profile.signOutBody": "Manterá os favoritos e filtros locais, mas as coleções partilhadas e as funções de equipa exigem iniciar sessão novamente.",
		"profile.signedOut": "Sessão terminada",
		"profile.switched": "Mudou para {name}",
		"profile.title": "Perfil",
		"profile.account": "Conta",
		"profile.appSettings": "Configurações do aplicativo",
		"shared.title": "Coleções compartilhadas",
		"shared.count": "{n} compartilhadas",
		"shared.empty": "Nenhuma coleção compartilhada ainda.",
		"shared.manageAccess": "Gerenciar acesso",
		"empty.noResults": "Nenhum ícone corresponde aos seus filtros.",
		"empty.noFavorites": "Nenhum favorito ainda.",
		"empty.onboardTitle": "Selecione pacotes para explorar",
		"empty.onboardDesc": "Os ícones aparecem quando pelo menos um pacote instalado é selecionado.",
		"empty.selectAllPackages": "Selecionar todos os pacotes",
		"empty.noMatchSearch": "Nenhum ícone corresponde a «{q}»",
		"empty.noMatchFilters": "Nenhum ícone corresponde a estes filtros",
		"empty.tryDifferent": "Tente outro termo, outra variante, ou limpe os filtros ativos.",
		"empty.clearFilters": "Limpar filtros",
		"toolbar.iconOne": "ícone",
		"toolbar.iconMany": "ícones",
		"toolbar.removeFilter": "Remover filtro",
		"toolbar.namesCopied": "{n} nomes copiados",
		"toolbar.exportedToast": "{n} ícones exportados — {label}",
		"toolbar.treatmentEngine": "Motor de tratamentos",
		"toolbar.toggleSortOrder": "Alternar ordem",
		"toolbar.gridIconSize": "Tamanho do ícone na grade",
		"toolbar.sizeUnit": "Unidade de tamanho",
		"toolbar.strokeTitle": "Espessura do traço — reescreve o traço na grade, detalhe e exportação",
		"toolbar.previewColor": "Cor de pré-visualização",
		"toolbar.resetFilters": "Redefinir filtros",
		"toolbar.resetTitle": "Redefinir todos os filtros?",
		"toolbar.resetBody": "Pesquisa, categorias, variantes, ordenação, página, seleção e cor de pré-visualização voltam aos padrões. Favoritos, coleções e aparência não são alterados.",
		"toolbar.resetConfirm": "Redefinir filtros",
		"toolbar.resetToast": "Filtros redefinidos",
		"footer.noResults": "Sem resultados",
		"footer.range": "{start}–{end} de {total}",
		"footer.perPageLabel": "Resultados por página",
		"footer.perPage": "{n} / página",
		"footer.prevPage": "Página anterior",
		"footer.nextPage": "Próxima página",
		"list.copiedToast": "{name} copiado",
		"sidebar.scopeIcons": "Ícones",
		"sidebar.scopePackages": "Pacotes",
		"sidebar.scopeCategories": "Categorias",
		"sidebar.scopeAll": "Tudo",
		"sidebar.notInstalled": "não instalado",
		"sidebar.inView": "Em vista",
		"sidebar.selected": "Selecionados",
		"sidebar.loadedIcons": "Neste catálogo",
		"sidebar.ecosystemTotal": "Total do ecossistema",
		"sidebar.favorites": "Favoritos",
		"sidebar.filterPackages": "Filtrar pacotes…",
		"sidebar.searchEverything": "Pesquisar tudo…",
		"sidebar.searchScope": "Âmbito da pesquisa",
		"header.filtersPackages": "Filtros e pacotes",
		"header.toggleSidebar": "Alternar barra lateral",
		"header.devtools": "Ichava DevTools",
		"palette.placeholder": "Digite um comando ou pesquise ícones…",
		"palette.recent": "Recentes",
		"palette.actions": "Ações",
		"palette.icons": "Ícones",
		"palette.openHint": "abrir",
		"palette.noMatches": "Nenhum resultado para «{q}»",
		"palette.navigate": "navegar",
		"palette.select": "selecionar",
		"palette.close": "fechar",
		"palette.toggleTheme": "Alternar tema",
		"palette.openSettings": "Abrir configurações",
		"palette.openFavorites": "Abrir favoritos",
		"palette.openHistory": "Abrir histórico",
		"palette.openCollections": "Abrir coleções",
		"palette.switchListView": "Mudar para vista de lista",
		"palette.switchGridView": "Mudar para vista de grade",
		"palette.resetFilters": "Redefinir todos os filtros",
		"palette.selectAll": "Selecionar todos os correspondentes",
		"selectAll.confirmTitle": "Selecionar todos os {n} ícones?",
		"selectAll.confirmBody": "Nenhuma pesquisa ou filtro está ativo, por isso todos os ícones do catálogo serão selecionados.",
		"selectAll.confirmLabel": "Selecionar tudo",
		"palette.openDevtools": "Abrir Ichava DevTools",
		"common.remove": "Remover",
		"settings.appearanceHintPre": "Tema, acento, raio, tamanho, densidade, movimento e rótulos estão no menu ",
		"settings.appearanceHintPost": " no cabeçalho.",
		"settings.behavior": "Comportamento",
		"settings.perPageTitle": "Ícones por página",
		"settings.perPageDesc": "Tamanho da paginação da grade.",
		"settings.copyFormatTitle": "Formato de cópia padrão",
		"settings.copyFormatDesc": "Usado ao clicar para copiar nas fichas.",
		"settings.storageTitle": "Driver de armazenamento",
		"settings.storageDesc": "Onde as preferências e o estado são guardados.",
		"settings.storageLocal": "local",
		"settings.storageSession": "sessão",
		"settings.tourTitle": "Tour do produto",
		"settings.tourDesc": "Repetir o tutorial inicial.",
		"settings.replayTour": "Repetir tour",
		"settings.factoryTitle": "Redefinição de fábrica",
		"settings.factoryDesc": "Restaura todas as configurações, filtros, favoritos e coleções aos padrões.",
		"settings.factoryConfirmTitle": "Redefinir tudo para as configurações de fábrica?",
		"settings.factoryConfirmBody": "Todas as preferências, filtros, favoritos, histórico, coleções, personalização de marca, consentimento e instantâneos guardados voltarão aos padrões. Isto não pode ser desfeito.",
		"settings.factoryConfirmLabel": "Redefinir tudo",
		"settings.factoryToast": "Tudo redefinido para os padrões",
		"settings.resetEverything": "Redefinir tudo…",
		"settings.account": "Conta",
		"settings.syncNote": "favoritos e coleções sincronizam entre dispositivos",
		"settings.guestNote": "Está a navegar como convidado — as preferências são guardadas apenas neste navegador. Inicie sessão para sincronizar favoritos, coleções e histórico entre dispositivos.",
		"settings.aboutLink": "Sobre o Ichava →",
		"consent.ariaLabel": "Cookies e armazenamento",
		"consent.title": "Cookies e armazenamento",
		"consent.body": "O Ichava guarda as suas preferências e favoritos no driver de armazenamento escolhido, além de eventos de uso anónimos. Sem rastreadores de terceiros.",
		"consent.essentialOnly": "Apenas essenciais",
		"consent.acceptAll": "Aceitar tudo",
		"about.browser": "Browser",
		"about.craftedBy": "Criado por",
		"about.statIcons": "ícones indexados",
		"about.statSets": "conjuntos de ícones",
		"about.statLicense": "licença",
		"library.favorites": "Favoritos",
		"library.history": "Histórico",
		"library.collections": "Coleções",
		"library.emptyFavorites": "Nenhum favorito ainda — passe o rato sobre um ícone e toque no coração.",
		"library.emptyHistory": "Nenhuma atividade ainda — visualizações, cópias e transferências aparecem aqui.",
		"library.emptyCollections": "Nenhuma coleção ainda — crie uma acima.",
		"library.clearHistory": "Limpar histórico",
		"library.newCollectionPlaceholder": "Nome da coleção…",
		"library.iconCount": "{n} ícones",
		"library.teamBadge": "equipa",
		"library.viewerBadge": "leitor",
		"library.copyNamesTitle": "Copiar nomes dos ícones",
		"library.deleteCollection": "Eliminar coleção",
		"tile.openDetail": "Abrir detalhe",
		"tile.copyFormat": "Copiar {format}",
		"tile.copyName": "Copiar nome",
		"tile.copiedName": "Nome copiado",
		"tile.copyPermalink": "Copiar link permanente",
		"tile.permalinkCopied": "Link permanente copiado",
		"tile.select": "Selecionar",
		"tile.deselect": "Desmarcar",
		"tile.addFavorite": "Adicionar aos favoritos",
		"tile.removeFavorite": "Remover dos favoritos",
		"tile.favoritedAria": "nos favoritos",
		"tile.selectedAria": "selecionado",
		"detail.previewOnly": "Apenas pré-visualização — a grade não muda",
		"detail.scaledToFit": "ajustado",
		"detail.actual": "real",
		"detail.size": "Tamanho",
		"detail.previewSize": "Tamanho da pré-visualização",
		"detail.unit": "Unidade",
		"detail.color": "Cor",
		"detail.stroke": "Traço",
		"detail.motion": "Movimento",
		"detail.searchPresets": "Pesquisar {n} predefinições…",
		"detail.noPresets": "Nenhuma predefinição encontrada.",
		"detail.easing": "Suavização",
		"detail.play": "Reproduzir",
		"detail.pause": "Pausar",
		"detail.speed": "Velocidade",
		"detail.copied": "{label} copiado",
		"detail.download": "Transferir",
		"detail.keyframesAria": "JSON dos fotogramas-chave",
		"detail.keyframesValid": "{n} fotogramas — cole um Keyframe[] ou { keyframes: […] }",
		"detail.keyframesInvalid": "JSON inválido — espera-se um array de objetos de fotograma",
		"detail.related": "Ícones relacionados",
		"detail.addToCollection": "Adicionar à coleção",
		"detail.newCollection": "+ Nova",
		"detail.noSvg": "Nenhum SVG disponível para este ícone",
		"detail.pngNoSvg": "Falha na exportação PNG — sem SVG",
		"detail.pngFailed": "Falha na exportação PNG",
		"detail.addedTo": "Adicionado a {name}",
		"detail.removedFrom": "Removido de {name}",
		"detail.motionDefault": "Padrão",
		"console.copyCode": "Copiar código",
		"console.copy": "Copiar",
		"console.copied": "Copiado",
		"help.title": "Ajuda e sobre",
		"help.about": "Sobre o Ichava",
		"help.docs": "Documentação",
		"help.replayTour": "Repetir tour do produto",
		"help.shortcuts": "Atalhos de teclado",
		"notifications.clearAll": "Limpar tudo",
		"notifications.empty": "Está tudo em dia.",
		"team.title": "Equipa",
		"team.online": "{n} online",
		"team.onlineNow": "Online agora",
		"team.away": "Ausente",
		"team.offline": "Offline",
		"team.invite": "Convidar…",
		"color.previewColor": "Cor de pré-visualização",
		"color.resetToTheme": "Repor para o tema",
		"color.opacity": "Opacidade — 0–100 %",
		"contextMenu.actions": "Ações",
		"boot.loadingCatalog": "A carregar catálogo",
		"boot.ready": "Pronto",
		"sidebar.iconVariant": "Variante do ícone",
		"auth.signInTo": "Inicie sessão no {brand}",
		"auth.needsAccount": "precisa de uma conta.",
		"auth.emailCode": "Enviaremos um código de uso único por e-mail — sem palavra-passe.",
		"auth.emailPlaceholder": "voce@empresa.com",
		"auth.sendCode": "Enviar código",
		"auth.newHere": "Novo por aqui?",
		"auth.createAccount": "Criar conta",
		"auth.enterCode": "Introduza o seu código",
		"auth.sentTo": "Enviado para",
		"auth.demoHint": "Demo: qualquer código inicia sessão — experimente 000000 para ver o estado de erro.",
		"auth.digit": "Dígito {n}",
		"auth.codeFailed": "Esse código não funcionou. Tente novamente.",
		"auth.verify": "Verificar e iniciar sessão",
		"auth.changeEmail": "← Mudar e-mail",
		"auth.resendIn": "Reenviar em {n}s",
		"auth.resendCode": "Reenviar código",
		"auth.createTitle": "Crie a sua conta",
		"auth.createBlurb": "Junte-se para desbloquear coleções, partilha e funcionalidades de equipa. Verificaremos o seu e-mail com um código de uso único.",
		"auth.firstName": "Nome",
		"auth.lastName": "Apelido",
		"auth.passwordPlaceholder": "Pelo menos 8 caracteres",
		"auth.togglePassword": "Mostrar ou ocultar a palavra-passe",
		"auth.haveAccount": "Já tem uma conta?",
		"invite.title": "Convidar para o espaço de trabalho",
		"invite.workspace": "espaço de trabalho",
		"invite.emailPlaceholder": "colega@empresa.com",
		"invite.roleEditor": "Editor — pode adicionar e partilhar",
		"invite.roleViewer": "Leitor — apenas leitura",
		"invite.role": "Papel",
		"invite.linkExpires": "O link expira",
		"invite.exp24h": "24 h",
		"invite.exp7d": "7 dias",
		"invite.exp30d": "30 dias",
		"invite.expNever": "Nunca",
		"invite.blurb": "Os convidados obtêm acesso às coleções partilhadas deste espaço. O proprietário pode alterar os papéis mais tarde; os links podem ser revogados nas Definições.",
		"invite.generateLink": "Gerar link",
		"invite.linkCopied": "Link de convite copiado",
		"invite.yourTeammate": "o seu colega",
		"invite.sentNotification": "Convite enviado para {to} ({role})",
		"invite.sent": "Convite enviado",
		"invite.sendInvite": "Enviar convite",
		"access.addPeople": "Adicione pessoas ou a sua equipa",
		"access.searchTeammates": "Pesquisar colegas por nome ou e-mail…",
		"access.onlyYou": "Apenas você tem acesso. Adicione colegas acima ou partilhe com toda a equipa.",
		"access.saveAccess": "Guardar acesso",
		"access.shareEntireTeam": "Partilhar com toda a equipa",
		"access.shareLinkCopied": "Link de partilha copiado",
		"access.copyLinkInstead": "Copiar link em vez disso",
		"shared.inviteTeam": "Convidar a equipa…",
		"shared.viewer": "leitor",
		"shared.editor": "editor",
		"tour.skip": "Ignorar",
		"tour.back": "Voltar",
		"tour.stepOf": "Passo {n} de {total}",
		"tour.next": "Seguinte",
		"tour.getStarted": "Começar",
		"tour.s1Title": "Bem-vindo ao Ichava Browser",
		"tour.s1Body": "Cada ícone da sua app Laravel — pesquisável, pré-visualizável, pronto a copiar. Este tour de 30 segundos mostra-lhe o essencial. Pode repeti-lo a qualquer momento nas Definições.",
		"tour.s2Title": "Encontre qualquer ícone rápido",
		"tour.s2Body": "Pesquise por nome ou etiqueta, filtre por pacote, categoria e variante na barra lateral, ou prima ⌘K para a paleta de comandos.",
		"tour.s3Title": "Reestilize ao vivo",
		"tour.s3Body": "Tratamentos, tamanho, traço, cor e predefinições de movimento reestilizam cada ícone no lugar — a grade atualiza-se enquanto ajusta.",
		"tour.s4Title": "Copie para o seu stack",
		"tour.s4Body": "Abra qualquer ícone para Blade, Livewire, Vue, React, Svelte, Web Component, SVG bruto e mais — um clique para copiar.",
		"tour.s5Title": "Guarde e partilhe",
		"tour.s5Body": "Marque ícones como favoritos, agrupe-os em coleções e exporte um sprite, manifesto ou ZIP. Inicie sessão para sincronizar entre dispositivos.",
		"task.working": "A processar…",
		"task.export": "A exportar {n} ícones…",
		"task.copyNames": "A reunir {n} nomes de ícones…",
		"task.png": "A gerar o PNG…",
		"task.selectAll": "A selecionar todos os ícones correspondentes…",
		"export.files": "Arquivos SVG",
		"export.filesDesc": "Downloads .svg individuais",
		"export.sprite": "Sprite SVG",
		"export.spriteDesc": "Uma folha de <symbol>",
		"export.manifest": "Manifesto JSON",
		"export.manifestDesc": "ids, pacotes e categorias",
		"export.zip": "Pacote ZIP",
		"export.zipDesc": "Sprite + manifesto + arquivos",
		"copyFormat.svg": "SVG bruto",
		"copyFormat.blade": "Tag Blade",
		"copyFormat.vue": "Trecho Vue",
		"copyFormat.name": "Nome do ícone",
		"snippetTab.motion": "Movimento",
		"snippetTab.helper": "Função helper",
		"snippetTab.bladeGeneric": "Blade (genérico)",
		"snippetTab.webcomponent": "Componente web",
		"snippetTab.name": "Nome",
		"clipboard.copyFailed": "Falha ao copiar — selecione e copie manualmente",
		"clipboard.copied": "Copiado para a área de transferência"
	},
	sw: {
		"detail.snippetFormat": "Muundo wa kipande",
		"console.code": "Msimbo",
		"palette.results": "Matokeo",
		"appearance.adaptMono": "Rekebisha aikoni nyeusi katika hali ya giza",
		"app.documentTitle": "Ichava Browser — kila aikoni ambayo programu yako ya Laravel inahitaji",
		"sort.name": "Jina",
		"sort.package": "Kifurushi",
		"sort.category": "Kategoria",
		"treatment.default": "Mstari",
		"treatment.defaultDesc": "Mistari asili ya kifurushi",
		"treatment.solid": "Imara",
		"treatment.solidDesc": "Uzito mzito uliojazwa",
		"treatment.duotone": "Rangi mbili",
		"treatment.duotoneDesc": "Tabaka la kivuli la rangi kuu",
		"treatment.midtone": "Rangi ya kati",
		"treatment.midtoneDesc": "Wino uliolainishwa 50%",
		"treatment.halftone": "Nukta",
		"treatment.halftoneDesc": "Ujazo wa nukta wa kizamani",
		"unit.pxValue": "{n} px",
		"common.cancel": "Ghairi",
		"common.create": "Unda",
		"common.clear": "Futa",
		"common.all": "Zote",
		"common.none": "Hakuna",
		"common.copy": "Nakili",
		"common.download": "Pakua",
		"common.favorite": "Kipendwa",
		"common.favorited": "Umependa",
		"common.close": "Funga",
		"common.signIn": "Ingia",
		"common.signOut": "Toka",
		"common.search": "Tafuta aikoni, vitendo…",
		"header.favorites": "Vipendwa",
		"header.history": "Historia",
		"header.collections": "Makusanyo",
		"header.notifications": "Arifa",
		"header.toggleTheme": "Badili mandhari",
		"header.settings": "Mipangilio",
		"header.fullscreen": "Skrini nzima",
		"header.exitFullscreen": "Toka skrini nzima",
		"header.commandPalette": "Paleti ya amri",
		"header.gridView": "Mwonekano wa gridi",
		"header.listView": "Mwonekano wa orodha",
		"sidebar.packages": "Vifurushi",
		"sidebar.categories": "Kategoria",
		"sidebar.filterCategories": "Chuja kategoria…",
		"sidebar.filterIcons": "Chuja aikoni…",
		"sidebar.expandAll": "Panua zote",
		"sidebar.collapseAll": "Kunja zote",
		"variant.all": "Zote",
		"variant.outline": "Mstari",
		"variant.filled": "Iliyojaa",
		"variant.color": "Rangi",
		"toolbar.sort": "Panga",
		"toolbar.size": "Ukubwa",
		"toolbar.stroke": "Mstari",
		"toolbar.color": "Rangi",
		"toolbar.treatment": "Mtindo wa aikoni",
		"toolbar.export": "Hamisha",
		"toolbar.copyNames": "Nakili majina",
		"toolbar.selected": "{n} zimechaguliwa",
		"appearance.title": "Muonekano",
		"appearance.subtitle": "mandhari · chapa · ukuzaji",
		"appearance.theme": "Mandhari",
		"appearance.light": "Nyepesi",
		"appearance.dark": "Nyeusi",
		"appearance.brandAccent": "Rangi ya chapa",
		"appearance.customHex": "Hex maalum",
		"appearance.radius": "Radi",
		"appearance.size": "Ukuzaji wa UI",
		"appearance.density": "Msongamano wa UI",
		"appearance.compact": "Finyu",
		"appearance.comfy": "Rahisi",
		"appearance.reduceMotion": "Punguza mwendo",
		"appearance.iconLabels": "Lebo za aikoni",
		"appearance.language": "Lugha",
		"appearance.footer": "Inatumika kwa programu pekee. Imehifadhiwa kwenye hifadhi uliyochagua.",
		"account.workspace": "Nafasi ya kazi",
		"account.account": "Akaunti",
		"account.profile": "Wasifu na mapendeleo",
		"account.sharedCollections": "Makusanyo yaliyoshirikiwa",
		"profile.signOutTitle": "Kutoka?",
		"profile.signOutBody": "Utabaki na vipendwa na vichujio vya ndani, lakini makusanyo yaliyoshirikiwa na vipengele vya timu vinahitaji kuingia tena.",
		"profile.signedOut": "Umetoka",
		"profile.switched": "Umebadilisha hadi {name}",
		"profile.title": "Wasifu",
		"profile.account": "Akaunti",
		"profile.appSettings": "Mipangilio ya programu",
		"shared.title": "Makusanyo yaliyoshirikiwa",
		"shared.count": "{n} yameshirikiwa",
		"shared.empty": "Hakuna makusanyo yaliyoshirikiwa bado.",
		"shared.manageAccess": "Dhibiti ufikiaji",
		"empty.noResults": "Hakuna aikoni zinazolingana na vichujio vyako.",
		"empty.noFavorites": "Hakuna vipendwa bado.",
		"empty.onboardTitle": "Chagua vifurushi ili kuvinjari",
		"empty.onboardDesc": "Aikoni huonekana mara kifurushi kimoja kilichosakinishwa kinapochaguliwa.",
		"empty.selectAllPackages": "Chagua vifurushi vyote",
		"empty.noMatchSearch": "Hakuna aikoni inayolingana na «{q}»",
		"empty.noMatchFilters": "Hakuna aikoni inayolingana na vichujio hivi",
		"empty.tryDifferent": "Jaribu neno tofauti, lahaja nyingine, au futa vichujio vinavyotumika.",
		"empty.clearFilters": "Futa vichujio",
		"toolbar.iconOne": "aikoni",
		"toolbar.iconMany": "aikoni",
		"toolbar.removeFilter": "Ondoa kichujio",
		"toolbar.namesCopied": "Majina {n} yamenakiliwa",
		"toolbar.exportedToast": "Aikoni {n} zimehamishwa — {label}",
		"toolbar.treatmentEngine": "Injini ya matibabu",
		"toolbar.toggleSortOrder": "Badili mpangilio",
		"toolbar.gridIconSize": "Ukubwa wa aikoni kwenye gridi",
		"toolbar.sizeUnit": "Kipimo cha ukubwa",
		"toolbar.strokeTitle": "Unene wa mstari — huandika upya mstari kwenye gridi, maelezo na uhamishaji",
		"toolbar.previewColor": "Rangi ya onyesho",
		"toolbar.resetFilters": "Weka upya vichujio",
		"toolbar.resetTitle": "Weka upya vichujio vyote?",
		"toolbar.resetBody": "Utafutaji, kategoria, lahaja, mpangilio, ukurasa, uteuzi na rangi ya onyesho hurudi katika hali ya awali. Vipendwa, makusanyo na muonekano havibadilishwi.",
		"toolbar.resetConfirm": "Weka upya vichujio",
		"toolbar.resetToast": "Vichujio vimewekwa upya",
		"footer.noResults": "Hakuna matokeo",
		"footer.range": "{start}–{end} kati ya {total}",
		"footer.perPageLabel": "Matokeo kwa ukurasa",
		"footer.perPage": "{n} / ukurasa",
		"footer.prevPage": "Ukurasa uliopita",
		"footer.nextPage": "Ukurasa unaofuata",
		"list.copiedToast": "{name} imenakiliwa",
		"sidebar.scopeIcons": "Aikoni",
		"sidebar.scopePackages": "Vifurushi",
		"sidebar.scopeCategories": "Kategoria",
		"sidebar.scopeAll": "Yote",
		"sidebar.notInstalled": "haijasakinishwa",
		"sidebar.inView": "Zinazoonekana",
		"sidebar.selected": "Zilizochaguliwa",
		"sidebar.loadedIcons": "Katika katalogi hii",
		"sidebar.ecosystemTotal": "Jumla ya mfumo",
		"sidebar.favorites": "Vipendwa",
		"sidebar.filterPackages": "Chuja vifurushi…",
		"sidebar.searchEverything": "Tafuta kila kitu…",
		"sidebar.searchScope": "Wigo wa utafutaji",
		"header.filtersPackages": "Vichujio na vifurushi",
		"header.toggleSidebar": "Geuza upau wa kando",
		"header.devtools": "Ichava DevTools",
		"palette.placeholder": "Andika amri au tafuta aikoni…",
		"palette.recent": "Za hivi karibuni",
		"palette.actions": "Vitendo",
		"palette.icons": "Aikoni",
		"palette.openHint": "fungua",
		"palette.noMatches": "Hakuna zinazolingana na «{q}»",
		"palette.navigate": "sogeza",
		"palette.select": "chagua",
		"palette.close": "funga",
		"palette.toggleTheme": "Badili mandhari",
		"palette.openSettings": "Fungua mipangilio",
		"palette.openFavorites": "Fungua vipendwa",
		"palette.openHistory": "Fungua historia",
		"palette.openCollections": "Fungua makusanyo",
		"palette.switchListView": "Badilisha kwa mwonekano wa orodha",
		"palette.switchGridView": "Badilisha kwa mwonekano wa gridi",
		"palette.resetFilters": "Weka upya vichujio vyote",
		"palette.selectAll": "Chagua zote zinazolingana",
		"selectAll.confirmTitle": "Chagua aikoni zote {n}?",
		"selectAll.confirmBody": "Hakuna utafutaji wala kichujio kinachotumika, kwa hivyo aikoni zote kwenye katalogi zitachaguliwa.",
		"selectAll.confirmLabel": "Chagua zote",
		"palette.openDevtools": "Fungua Ichava DevTools",
		"common.remove": "Ondoa",
		"settings.appearanceHintPre": "Mandhari, rangi, radi, ukubwa, msongamano, mwendo na lebo viko kwenye menyu ya ",
		"settings.appearanceHintPost": " kwenye kichwa.",
		"settings.behavior": "Tabia",
		"settings.perPageTitle": "Aikoni kwa ukurasa",
		"settings.perPageDesc": "Ukubwa wa ugawaji wa gridi.",
		"settings.copyFormatTitle": "Muundo chaguo-msingi wa kunakili",
		"settings.copyFormatDesc": "Hutumiwa na bofya-kunakili kwenye vigae.",
		"settings.storageTitle": "Kiendeshi cha hifadhi",
		"settings.storageDesc": "Mahali mapendeleo na hali huhifadhiwa.",
		"settings.storageLocal": "ndani",
		"settings.storageSession": "kipindi",
		"settings.tourTitle": "Ziara ya bidhaa",
		"settings.tourDesc": "Rudia mwongozo wa mwanzo.",
		"settings.replayTour": "Rudia ziara",
		"settings.factoryTitle": "Kurejesha kiwandani",
		"settings.factoryDesc": "Hurejesha kila mpangilio, kichujio, kipendwa na kusanyiko kwa hali ya awali.",
		"settings.factoryConfirmTitle": "Kurejesha kila kitu kwa mipangilio ya kiwandani?",
		"settings.factoryConfirmBody": "Mapendeleo yote, vichujio, vipendwa, historia, makusanyo, ubinafsishaji wa chapa, idhini na picha zilizohifadhiwa vitarejeshwa hali ya awali. Hili haliwezi kutenduliwa.",
		"settings.factoryConfirmLabel": "Rejesha kila kitu",
		"settings.factoryToast": "Kila kitu kimerejeshwa hali ya awali",
		"settings.resetEverything": "Rejesha kila kitu…",
		"settings.account": "Akaunti",
		"settings.syncNote": "vipendwa na makusanyo husawazishwa kati ya vifaa",
		"settings.guestNote": "Unavinjari kama mgeni — mapendeleo huhifadhiwa katika kivinjari hiki tu. Ingia ili kusawazisha vipendwa, makusanyo na historia kati ya vifaa.",
		"settings.aboutLink": "Kuhusu Ichava →",
		"consent.ariaLabel": "Vidakuzi na hifadhi",
		"consent.title": "Vidakuzi na hifadhi",
		"consent.body": "Ichava huhifadhi mapendeleo na vipendwa vyako katika kiendeshi cha hifadhi ulichochagua, pamoja na matukio ya matumizi yasiyojulikana. Hakuna vifuatiliaji vya wahusika wengine.",
		"consent.essentialOnly": "Muhimu pekee",
		"consent.acceptAll": "Kubali vyote",
		"about.browser": "Browser",
		"about.craftedBy": "Imetengenezwa na",
		"about.statIcons": "aikoni zilizoorodheshwa",
		"about.statSets": "seti za aikoni",
		"about.statLicense": "leseni",
		"library.favorites": "Vipendwa",
		"library.history": "Historia",
		"library.collections": "Makusanyo",
		"library.emptyFavorites": "Hakuna vipendwa bado — elea juu ya aikoni na uguse moyo.",
		"library.emptyHistory": "Hakuna shughuli bado — mionekano, nakala na upakuaji vinaonekana hapa.",
		"library.emptyCollections": "Hakuna makusanyo bado — taja moja hapo juu.",
		"library.clearHistory": "Futa historia",
		"library.newCollectionPlaceholder": "Jina la kusanyiko…",
		"library.iconCount": "aikoni {n}",
		"library.teamBadge": "timu",
		"library.viewerBadge": "msomaji",
		"library.copyNamesTitle": "Nakili majina ya aikoni",
		"library.deleteCollection": "Futa kusanyiko",
		"tile.openDetail": "Fungua maelezo",
		"tile.copyFormat": "Nakili {format}",
		"tile.copyName": "Nakili jina",
		"tile.copiedName": "Jina limenakiliwa",
		"tile.copyPermalink": "Nakili kiungo cha kudumu",
		"tile.permalinkCopied": "Kiungo cha kudumu kimenakiliwa",
		"tile.select": "Chagua",
		"tile.deselect": "Ondoa uteuzi",
		"tile.addFavorite": "Ongeza kwenye vipendwa",
		"tile.removeFavorite": "Ondoa kwenye vipendwa",
		"tile.favoritedAria": "kwenye vipendwa",
		"tile.selectedAria": "imechaguliwa",
		"detail.previewOnly": "Onyesho la awali tu — gridi haibadiliki",
		"detail.scaledToFit": "imepunguzwa",
		"detail.actual": "halisi",
		"detail.size": "Ukubwa",
		"detail.previewSize": "Ukubwa wa onyesho",
		"detail.unit": "Kipimo",
		"detail.color": "Rangi",
		"detail.stroke": "Mstari",
		"detail.motion": "Mwendo",
		"detail.searchPresets": "Tafuta mipangilio {n}…",
		"detail.noPresets": "Hakuna mipangilio iliyopatikana.",
		"detail.easing": "Ulaini",
		"detail.play": "Cheza",
		"detail.pause": "Simamisha",
		"detail.speed": "Kasi",
		"detail.copied": "{label} imenakiliwa",
		"detail.download": "Pakua",
		"detail.keyframesAria": "JSON ya fremu muhimu",
		"detail.keyframesValid": "Fremu {n} — bandika Keyframe[] au { keyframes: […] }",
		"detail.keyframesInvalid": "JSON batili — inatarajia safu ya vitu vya fremu",
		"detail.related": "Aikoni zinazohusiana",
		"detail.addToCollection": "Ongeza kwenye kusanyiko",
		"detail.newCollection": "+ Mpya",
		"detail.noSvg": "Hakuna SVG inayopatikana kwa aikoni hii",
		"detail.pngNoSvg": "Uhamishaji wa PNG umeshindwa — hakuna SVG",
		"detail.pngFailed": "Uhamishaji wa PNG umeshindwa",
		"detail.addedTo": "Imeongezwa kwa {name}",
		"detail.removedFrom": "Imeondolewa kwenye {name}",
		"detail.motionDefault": "Chaguo-msingi",
		"console.copyCode": "Nakili msimbo",
		"console.copy": "Nakili",
		"console.copied": "Imenakiliwa",
		"help.title": "Msaada na kuhusu",
		"help.about": "Kuhusu Ichava",
		"help.docs": "Nyaraka",
		"help.replayTour": "Rudia ziara ya bidhaa",
		"help.shortcuts": "Njia za mkato za kibodi",
		"notifications.clearAll": "Futa zote",
		"notifications.empty": "Umeshughulikia yote.",
		"team.title": "Timu",
		"team.online": "{n} mtandaoni",
		"team.onlineNow": "Mtandaoni sasa",
		"team.away": "Hayupo",
		"team.offline": "Nje ya mtandao",
		"team.invite": "Alika…",
		"color.previewColor": "Rangi ya onyesho",
		"color.resetToTheme": "Rejesha kwenye mandhari",
		"color.opacity": "Uwazi — 0–100 %",
		"contextMenu.actions": "Vitendo",
		"boot.loadingCatalog": "Inapakia katalogi",
		"boot.ready": "Tayari",
		"sidebar.iconVariant": "Lahaja ya aikoni",
		"auth.signInTo": "Ingia kwenye {brand}",
		"auth.needsAccount": "inahitaji akaunti.",
		"auth.emailCode": "Tutakutumia msimbo wa mara moja kwa barua pepe — bila nywila.",
		"auth.emailPlaceholder": "wewe@kampuni.com",
		"auth.sendCode": "Tuma msimbo",
		"auth.newHere": "Mgeni hapa?",
		"auth.createAccount": "Fungua akaunti",
		"auth.enterCode": "Weka msimbo wako",
		"auth.sentTo": "Imetumwa kwa",
		"auth.demoHint": "Onyesho: msimbo wowote unaingia — jaribu 000000 kuona hali ya hitilafu.",
		"auth.digit": "Tarakimu {n}",
		"auth.codeFailed": "Msimbo huo haukufanya kazi. Jaribu tena.",
		"auth.verify": "Thibitisha na uingie",
		"auth.changeEmail": "← Badilisha barua pepe",
		"auth.resendIn": "Tuma tena baada ya {n}s",
		"auth.resendCode": "Tuma msimbo tena",
		"auth.createTitle": "Fungua akaunti yako",
		"auth.createBlurb": "Jiunge ili kufungua makusanyo, ushirikiano na vipengele vya timu. Tutathibitisha barua pepe yako kwa msimbo wa mara moja.",
		"auth.firstName": "Jina la kwanza",
		"auth.lastName": "Jina la ukoo",
		"auth.passwordPlaceholder": "Angalau herufi 8",
		"auth.togglePassword": "Onyesha au ficha nywila",
		"auth.haveAccount": "Tayari una akaunti?",
		"invite.title": "Alika kwenye nafasi ya kazi",
		"invite.workspace": "nafasi ya kazi",
		"invite.emailPlaceholder": "mwenzako@kampuni.com",
		"invite.roleEditor": "Mhariri — anaweza kuongeza na kushiriki",
		"invite.roleViewer": "Msomaji — kusoma tu",
		"invite.role": "Jukumu",
		"invite.linkExpires": "Kiungo kinaisha",
		"invite.exp24h": "saa 24",
		"invite.exp7d": "siku 7",
		"invite.exp30d": "siku 30",
		"invite.expNever": "Kamwe",
		"invite.blurb": "Walioalikwa hupata ufikiaji wa makusanyo yaliyoshirikiwa katika nafasi hii. Mmiliki anaweza kubadilisha majukumu baadaye; viungo vinaweza kubatilishwa katika Mipangilio.",
		"invite.generateLink": "Tengeneza kiungo",
		"invite.linkCopied": "Kiungo cha mwaliko kimenakiliwa",
		"invite.yourTeammate": "mwenzako",
		"invite.sentNotification": "Mwaliko umetumwa kwa {to} ({role})",
		"invite.sent": "Mwaliko umetumwa",
		"invite.sendInvite": "Tuma mwaliko",
		"access.addPeople": "Ongeza watu au timu yako",
		"access.searchTeammates": "Tafuta wenzako kwa jina au barua pepe…",
		"access.onlyYou": "Ni wewe tu una ufikiaji. Ongeza wenzako hapo juu, au shiriki na timu nzima.",
		"access.saveAccess": "Hifadhi ufikiaji",
		"access.shareEntireTeam": "Shiriki na timu nzima",
		"access.shareLinkCopied": "Kiungo cha kushiriki kimenakiliwa",
		"access.copyLinkInstead": "Nakili kiungo badala yake",
		"shared.inviteTeam": "Alika timu…",
		"shared.viewer": "msomaji",
		"shared.editor": "mhariri",
		"tour.skip": "Ruka",
		"tour.back": "Rudi",
		"tour.stepOf": "Hatua {n} kati ya {total}",
		"tour.next": "Ifuatayo",
		"tour.getStarted": "Anza",
		"tour.s1Title": "Karibu Ichava Browser",
		"tour.s1Body": "Kila aikoni katika app yako ya Laravel — inayotafutika, inayohakikiwa, tayari kunakiliwa. Ziara hii ya sekunde 30 inakuonyesha mambo. Unaweza kuirudia wakati wowote kutoka Mipangilio.",
		"tour.s2Title": "Pata aikoni yoyote haraka",
		"tour.s2Body": "Tafuta kwa jina au lebo, chuja kwa kifurushi, kategoria na lahaja kwenye upau wa kando, au bonyeza ⌘K kwa paleti ya amri.",
		"tour.s3Title": "Rembua moja kwa moja",
		"tour.s3Body": "Matibabu, ukubwa, mstari, rangi na mipangilio ya mwendo hurembua kila aikoni papo hapo — gridi husasishwa unaporekebisha.",
		"tour.s4Title": "Nakili kwa stack yako",
		"tour.s4Body": "Fungua aikoni yoyote kwa Blade, Livewire, Vue, React, Svelte, Web Component, SVG ghafi na zaidi — bofya moja kunakili.",
		"tour.s5Title": "Hifadhi na ushiriki",
		"tour.s5Body": "Pendelea aikoni, ziweke katika makusanyo, na uhamishe sprite, manifesti au ZIP. Ingia ili kusawazisha kati ya vifaa.",
		"task.working": "Inafanya kazi…",
		"task.export": "Inahamisha aikoni {n}…",
		"task.copyNames": "Inakusanya majina {n} ya aikoni…",
		"task.png": "Inatengeneza PNG…",
		"task.selectAll": "Inachagua aikoni zote zinazolingana…",
		"export.files": "Faili za SVG",
		"export.filesDesc": "Upakuaji wa .svg mmoja mmoja",
		"export.sprite": "Sprite ya SVG",
		"export.spriteDesc": "Karatasi moja ya <symbol>",
		"export.manifest": "Manifest ya JSON",
		"export.manifestDesc": "vitambulisho, vifurushi na kategoria",
		"export.zip": "Kifurushi cha ZIP",
		"export.zipDesc": "Sprite + manifest + faili",
		"copyFormat.svg": "SVG ghafi",
		"copyFormat.blade": "Lebo ya Blade",
		"copyFormat.vue": "Kipande cha Vue",
		"copyFormat.name": "Jina la ikoni",
		"snippetTab.motion": "Mwendo",
		"snippetTab.helper": "Kitendakazi saidizi",
		"snippetTab.bladeGeneric": "Blade (ya jumla)",
		"snippetTab.webcomponent": "Kijenzi cha wavuti",
		"snippetTab.name": "Jina",
		"clipboard.copyFailed": "Kunakili kumeshindwa — chagua na unakili mwenyewe",
		"clipboard.copied": "Imenakiliwa kwenye ubao wa kunakili"
	},
	ar: {
		"detail.snippetFormat": "تنسيق المقتطف",
		"console.code": "الكود",
		"palette.results": "النتائج",
		"appearance.adaptMono": "تكييف الأيقونات السوداء في الوضع الداكن",
		"app.documentTitle": "Ichava Browser — كل أيقونة يحتاجها تطبيق Laravel الخاص بك",
		"sort.name": "الاسم",
		"sort.package": "الحزمة",
		"sort.category": "الفئة",
		"treatment.default": "خطّي",
		"treatment.defaultDesc": "الخطوط الأصلية للحزمة",
		"treatment.solid": "مُصمت",
		"treatment.solidDesc": "وزن أثقل ومملوء",
		"treatment.duotone": "ثنائي اللون",
		"treatment.duotoneDesc": "طبقة ظل بلون التمييز",
		"treatment.midtone": "نصف درجة",
		"treatment.midtoneDesc": "حبر مخفّف بنسبة 50%",
		"treatment.halftone": "نقطي",
		"treatment.halftoneDesc": "تعبئة نقطية بطابع قديم",
		"unit.pxValue": "{n} بكسل",
		"common.cancel": "إلغاء",
		"common.create": "إنشاء",
		"common.clear": "مسح",
		"common.all": "الكل",
		"common.none": "لا شيء",
		"common.copy": "نسخ",
		"common.download": "تنزيل",
		"common.favorite": "مفضّل",
		"common.favorited": "في المفضلة",
		"common.close": "إغلاق",
		"common.signIn": "تسجيل الدخول",
		"common.signOut": "تسجيل الخروج",
		"common.search": "ابحث عن أيقونات، إجراءات…",
		"header.favorites": "المفضّلة",
		"header.history": "السجل",
		"header.collections": "المجموعات",
		"header.notifications": "الإشعارات",
		"header.toggleTheme": "تبديل المظهر",
		"header.settings": "الإعدادات",
		"header.fullscreen": "ملء الشاشة",
		"header.exitFullscreen": "إنهاء ملء الشاشة",
		"header.commandPalette": "لوحة الأوامر",
		"header.gridView": "عرض شبكي",
		"header.listView": "عرض قائمة",
		"sidebar.packages": "الحزم",
		"sidebar.categories": "الفئات",
		"sidebar.filterCategories": "تصفية الفئات…",
		"sidebar.filterIcons": "تصفية الأيقونات…",
		"sidebar.expandAll": "توسيع الكل",
		"sidebar.collapseAll": "طي الكل",
		"variant.all": "الكل",
		"variant.outline": "مُحدّد",
		"variant.filled": "مملوء",
		"variant.color": "ملوّن",
		"toolbar.sort": "ترتيب",
		"toolbar.size": "الحجم",
		"toolbar.stroke": "السُّمك",
		"toolbar.color": "اللون",
		"toolbar.treatment": "نمط الأيقونة",
		"toolbar.export": "تصدير",
		"toolbar.copyNames": "نسخ الأسماء",
		"toolbar.selected": "تم تحديد {n}",
		"appearance.title": "المظهر",
		"appearance.subtitle": "السمة · العلامة · التكبير",
		"appearance.theme": "السمة",
		"appearance.light": "فاتح",
		"appearance.dark": "داكن",
		"appearance.brandAccent": "لون العلامة",
		"appearance.customHex": "لون مخصّص",
		"appearance.radius": "الاستدارة",
		"appearance.size": "تكبير الواجهة",
		"appearance.density": "كثافة الواجهة",
		"appearance.compact": "مضغوط",
		"appearance.comfy": "مريح",
		"appearance.reduceMotion": "تقليل الحركة",
		"appearance.iconLabels": "تسميات الأيقونات",
		"appearance.language": "اللغة",
		"appearance.footer": "ينطبق على التطبيق فقط. يُحفظ في وحدة التخزين المختارة.",
		"account.workspace": "مساحة العمل",
		"account.account": "الحساب",
		"account.profile": "الملف الشخصي والتفضيلات",
		"account.sharedCollections": "المجموعات المشتركة",
		"profile.signOutTitle": "تسجيل الخروج؟",
		"profile.signOutBody": "ستحتفظ بالمفضّلة والعوامل المحلية، لكن المجموعات المشتركة وميزات الفريق تتطلب تسجيل الدخول مرة أخرى.",
		"profile.signedOut": "تم تسجيل الخروج",
		"profile.switched": "تم التبديل إلى {name}",
		"profile.title": "الملف الشخصي",
		"profile.account": "الحساب",
		"profile.appSettings": "إعدادات التطبيق",
		"shared.title": "المجموعات المشتركة",
		"shared.count": "{n} مشتركة",
		"shared.empty": "لا توجد مجموعات مشتركة بعد.",
		"shared.manageAccess": "إدارة الوصول",
		"empty.noResults": "لا توجد أيقونات تطابق عوامل التصفية.",
		"empty.noFavorites": "لا مفضّلات بعد.",
		"empty.onboardTitle": "اختر حزمًا للتصفّح",
		"empty.onboardDesc": "تظهر الأيقونات بمجرد اختيار حزمة مثبّتة واحدة على الأقل.",
		"empty.selectAllPackages": "اختيار كل الحزم",
		"empty.noMatchSearch": "لا توجد أيقونات تطابق «{q}»",
		"empty.noMatchFilters": "لا توجد أيقونات تطابق هذه العوامل",
		"empty.tryDifferent": "جرّب مصطلحًا آخر أو نمطًا آخر، أو امسح عوامل التصفية النشطة.",
		"empty.clearFilters": "مسح العوامل",
		"toolbar.iconOne": "أيقونة",
		"toolbar.iconMany": "أيقونات",
		"toolbar.removeFilter": "إزالة العامل",
		"toolbar.namesCopied": "تم نسخ {n} من الأسماء",
		"toolbar.exportedToast": "تم تصدير {n} أيقونة — {label}",
		"toolbar.treatmentEngine": "محرّك المعالجات",
		"toolbar.toggleSortOrder": "تبديل ترتيب الفرز",
		"toolbar.gridIconSize": "حجم الأيقونة في الشبكة",
		"toolbar.sizeUnit": "وحدة الحجم",
		"toolbar.strokeTitle": "سُمك الخط — يعيد كتابة الخط في الشبكة والتفاصيل والتصدير",
		"toolbar.previewColor": "لون المعاينة",
		"toolbar.resetFilters": "إعادة ضبط العوامل",
		"toolbar.resetTitle": "إعادة ضبط جميع العوامل؟",
		"toolbar.resetBody": "يعود البحث والفئات والأنماط والفرز والصفحة والتحديد ولون المعاينة إلى الإعدادات الافتراضية. المفضّلة والمجموعات والمظهر تبقى دون تغيير.",
		"toolbar.resetConfirm": "إعادة ضبط العوامل",
		"toolbar.resetToast": "تمت إعادة ضبط العوامل",
		"footer.noResults": "لا نتائج",
		"footer.range": "{start}–{end} من {total}",
		"footer.perPageLabel": "النتائج لكل صفحة",
		"footer.perPage": "{n} / صفحة",
		"footer.prevPage": "الصفحة السابقة",
		"footer.nextPage": "الصفحة التالية",
		"list.copiedToast": "تم نسخ {name}",
		"sidebar.scopeIcons": "الأيقونات",
		"sidebar.scopePackages": "الحزم",
		"sidebar.scopeCategories": "الفئات",
		"sidebar.scopeAll": "الكل",
		"sidebar.notInstalled": "غير مثبّتة",
		"sidebar.inView": "المعروضة",
		"sidebar.selected": "المحدّدة",
		"sidebar.loadedIcons": "في هذا الفهرس",
		"sidebar.ecosystemTotal": "إجمالي المنظومة",
		"sidebar.favorites": "المفضّلة",
		"sidebar.filterPackages": "تصفية الحزم…",
		"sidebar.searchEverything": "ابحث في كل شيء…",
		"sidebar.searchScope": "نطاق البحث",
		"header.filtersPackages": "العوامل والحزم",
		"header.toggleSidebar": "تبديل الشريط الجانبي",
		"header.devtools": "Ichava DevTools",
		"palette.placeholder": "اكتب أمرًا أو ابحث عن الأيقونات…",
		"palette.recent": "الأخيرة",
		"palette.actions": "الإجراءات",
		"palette.icons": "الأيقونات",
		"palette.openHint": "فتح",
		"palette.noMatches": "لا توجد نتائج لـ «{q}»",
		"palette.navigate": "تنقّل",
		"palette.select": "تحديد",
		"palette.close": "إغلاق",
		"palette.toggleTheme": "تبديل السمة",
		"palette.openSettings": "فتح الإعدادات",
		"palette.openFavorites": "فتح المفضّلة",
		"palette.openHistory": "فتح السجل",
		"palette.openCollections": "فتح المجموعات",
		"palette.switchListView": "التبديل إلى عرض القائمة",
		"palette.switchGridView": "التبديل إلى عرض الشبكة",
		"palette.resetFilters": "إعادة ضبط جميع العوامل",
		"palette.selectAll": "تحديد كل النتائج المطابقة",
		"selectAll.confirmTitle": "تحديد كل الأيقونات البالغ عددها {n}؟",
		"selectAll.confirmBody": "لا يوجد بحث أو عامل تصفية نشط، لذا سيتم تحديد كل الأيقونات في الكتالوج.",
		"selectAll.confirmLabel": "تحديد الكل",
		"palette.openDevtools": "فتح Ichava DevTools",
		"common.remove": "إزالة",
		"settings.appearanceHintPre": "السمة واللون والاستدارة والحجم والكثافة والحركة والتسميات موجودة في قائمة ",
		"settings.appearanceHintPost": " في الرأس.",
		"settings.behavior": "السلوك",
		"settings.perPageTitle": "الأيقونات لكل صفحة",
		"settings.perPageDesc": "حجم ترقيم صفحات الشبكة.",
		"settings.copyFormatTitle": "صيغة النسخ الافتراضية",
		"settings.copyFormatDesc": "تُستخدم عند النقر للنسخ على البطاقات.",
		"settings.storageTitle": "مُشغّل التخزين",
		"settings.storageDesc": "مكان حفظ التفضيلات والحالة.",
		"settings.storageLocal": "محلي",
		"settings.storageSession": "جلسة",
		"settings.tourTitle": "جولة المنتج",
		"settings.tourDesc": "إعادة تشغيل الجولة التعريفية.",
		"settings.replayTour": "إعادة الجولة",
		"settings.factoryTitle": "إعادة ضبط المصنع",
		"settings.factoryDesc": "يعيد كل إعداد وعامل تصفية ومفضّلة ومجموعة إلى الإعدادات الافتراضية.",
		"settings.factoryConfirmTitle": "إعادة ضبط كل شيء إلى إعدادات المصنع؟",
		"settings.factoryConfirmBody": "ستُعاد جميع التفضيلات وعوامل التصفية والمفضّلة والسجل والمجموعات وتخصيص العلامة والموافقة واللقطات المحفوظة إلى الإعدادات الافتراضية. لا يمكن التراجع عن هذا.",
		"settings.factoryConfirmLabel": "إعادة ضبط كل شيء",
		"settings.factoryToast": "تمت إعادة ضبط كل شيء إلى الإعدادات الافتراضية",
		"settings.resetEverything": "إعادة ضبط كل شيء…",
		"settings.account": "الحساب",
		"settings.syncNote": "تتزامن المفضّلة والمجموعات عبر الأجهزة",
		"settings.guestNote": "أنت تتصفّح كضيف — تُحفظ التفضيلات في هذا المتصفّح فقط. سجّل الدخول لمزامنة المفضّلة والمجموعات والسجل عبر الأجهزة.",
		"settings.aboutLink": "حول Ichava →",
		"consent.ariaLabel": "ملفات تعريف الارتباط والتخزين",
		"consent.title": "ملفات تعريف الارتباط والتخزين",
		"consent.body": "يحفظ Ichava تفضيلاتك ومفضّلاتك في مُشغّل التخزين الذي اخترته، بالإضافة إلى أحداث استخدام مجهولة. لا مُتتبّعات من جهات خارجية.",
		"consent.essentialOnly": "الأساسية فقط",
		"consent.acceptAll": "قبول الكل",
		"about.browser": "Browser",
		"about.craftedBy": "من صنع",
		"about.statIcons": "أيقونات مفهرسة",
		"about.statSets": "مجموعات أيقونات",
		"about.statLicense": "الترخيص",
		"library.favorites": "المفضّلة",
		"library.history": "السجل",
		"library.collections": "المجموعات",
		"library.emptyFavorites": "لا مفضّلات بعد — مرّر فوق أيقونة وانقر على القلب.",
		"library.emptyHistory": "لا نشاط بعد — تظهر هنا المشاهدات والنسخ والتنزيلات.",
		"library.emptyCollections": "لا مجموعات بعد — أنشئ واحدة بالأعلى.",
		"library.clearHistory": "مسح السجل",
		"library.newCollectionPlaceholder": "اسم المجموعة…",
		"library.iconCount": "{n} أيقونة",
		"library.teamBadge": "فريق",
		"library.viewerBadge": "قارئ",
		"library.copyNamesTitle": "نسخ أسماء الأيقونات",
		"library.deleteCollection": "حذف المجموعة",
		"tile.openDetail": "فتح التفاصيل",
		"tile.copyFormat": "نسخ {format}",
		"tile.copyName": "نسخ الاسم",
		"tile.copiedName": "تم نسخ الاسم",
		"tile.copyPermalink": "نسخ الرابط الدائم",
		"tile.permalinkCopied": "تم نسخ الرابط الدائم",
		"tile.select": "تحديد",
		"tile.deselect": "إلغاء التحديد",
		"tile.addFavorite": "إضافة إلى المفضّلة",
		"tile.removeFavorite": "إزالة من المفضّلة",
		"tile.favoritedAria": "في المفضّلة",
		"tile.selectedAria": "محدّد",
		"detail.previewOnly": "معاينة فقط — الشبكة لا تتأثّر",
		"detail.scaledToFit": "مُحجَّم",
		"detail.actual": "الفعلي",
		"detail.size": "الحجم",
		"detail.previewSize": "حجم المعاينة",
		"detail.unit": "الوحدة",
		"detail.color": "اللون",
		"detail.stroke": "السُّمك",
		"detail.motion": "الحركة",
		"detail.searchPresets": "ابحث في {n} إعدادًا مسبقًا…",
		"detail.noPresets": "لا توجد إعدادات مسبقة.",
		"detail.easing": "التخفيف",
		"detail.play": "تشغيل",
		"detail.pause": "إيقاف مؤقت",
		"detail.speed": "السرعة",
		"detail.copied": "تم نسخ {label}",
		"detail.download": "تنزيل",
		"detail.keyframesAria": "JSON للإطارات المفتاحية",
		"detail.keyframesValid": "{n} إطارات — الصق Keyframe[] أو { keyframes: […] }",
		"detail.keyframesInvalid": "JSON غير صالح — يتوقّع مصفوفة من كائنات الإطارات",
		"detail.related": "أيقونات ذات صلة",
		"detail.addToCollection": "أضف إلى مجموعة",
		"detail.newCollection": "+ جديدة",
		"detail.noSvg": "لا يتوفّر SVG لهذه الأيقونة",
		"detail.pngNoSvg": "فشل تصدير PNG — لا يوجد SVG",
		"detail.pngFailed": "فشل تصدير PNG",
		"detail.addedTo": "تمت الإضافة إلى {name}",
		"detail.removedFrom": "تمت الإزالة من {name}",
		"detail.motionDefault": "افتراضي",
		"console.copyCode": "نسخ الكود",
		"console.copy": "نسخ",
		"console.copied": "تم النسخ",
		"help.title": "المساعدة وحول",
		"help.about": "حول Ichava",
		"help.docs": "الوثائق",
		"help.replayTour": "إعادة جولة المنتج",
		"help.shortcuts": "اختصارات لوحة المفاتيح",
		"notifications.clearAll": "مسح الكل",
		"notifications.empty": "أنت على اطّلاع بكل شيء.",
		"team.title": "الفريق",
		"team.online": "{n} متصل",
		"team.onlineNow": "متصل الآن",
		"team.away": "غير متواجد",
		"team.offline": "غير متصل",
		"team.invite": "دعوة…",
		"color.previewColor": "لون المعاينة",
		"color.resetToTheme": "إعادة الضبط إلى السمة",
		"color.opacity": "العتامة — 0–100 %",
		"contextMenu.actions": "إجراءات",
		"boot.loadingCatalog": "جارٍ تحميل الكتالوج",
		"boot.ready": "جاهز",
		"sidebar.iconVariant": "نمط الأيقونة",
		"auth.signInTo": "سجّل الدخول إلى {brand}",
		"auth.needsAccount": "يحتاج إلى حساب.",
		"auth.emailCode": "سنرسل إليك رمزًا لمرة واحدة عبر البريد — بدون كلمة مرور.",
		"auth.emailPlaceholder": "you@company.com",
		"auth.sendCode": "إرسال الرمز",
		"auth.newHere": "جديد هنا؟",
		"auth.createAccount": "إنشاء حساب",
		"auth.enterCode": "أدخل رمزك",
		"auth.sentTo": "أُرسل إلى",
		"auth.demoHint": "تجريبي: أي رمز يسجّل الدخول — جرّب 000000 لرؤية حالة الفشل.",
		"auth.digit": "الرقم {n}",
		"auth.codeFailed": "لم ينجح هذا الرمز. حاول مجددًا.",
		"auth.verify": "تحقّق وسجّل الدخول",
		"auth.changeEmail": "→ تغيير البريد",
		"auth.resendIn": "إعادة الإرسال خلال {n}ث",
		"auth.resendCode": "إعادة إرسال الرمز",
		"auth.createTitle": "أنشئ حسابك",
		"auth.createBlurb": "انضم لفتح المجموعات والمشاركة وميزات الفريق. سنؤكّد بريدك برمز لمرة واحدة.",
		"auth.firstName": "الاسم الأول",
		"auth.lastName": "اسم العائلة",
		"auth.passwordPlaceholder": "8 أحرف على الأقل",
		"auth.togglePassword": "إظهار أو إخفاء كلمة المرور",
		"auth.haveAccount": "لديك حساب بالفعل؟",
		"invite.title": "الدعوة إلى مساحة العمل",
		"invite.workspace": "مساحة العمل",
		"invite.emailPlaceholder": "teammate@company.com",
		"invite.roleEditor": "محرّر — يمكنه الإضافة والمشاركة",
		"invite.roleViewer": "قارئ — قراءة فقط",
		"invite.role": "الدور",
		"invite.linkExpires": "ينتهي الرابط",
		"invite.exp24h": "24 س",
		"invite.exp7d": "7 أيام",
		"invite.exp30d": "30 يومًا",
		"invite.expNever": "أبدًا",
		"invite.blurb": "يحصل المدعوّون على الوصول إلى المجموعات المشتركة في مساحة العمل هذه. يمكن للمالك تغيير الأدوار لاحقًا؛ ويمكن إبطال الروابط من الإعدادات.",
		"invite.generateLink": "إنشاء رابط",
		"invite.linkCopied": "تم نسخ رابط الدعوة",
		"invite.yourTeammate": "زميلك",
		"invite.sentNotification": "أُرسلت الدعوة إلى {to} ({role})",
		"invite.sent": "تم إرسال الدعوة",
		"invite.sendInvite": "إرسال الدعوة",
		"access.addPeople": "أضف أشخاصًا أو فريقك",
		"access.searchTeammates": "ابحث عن الزملاء بالاسم أو البريد…",
		"access.onlyYou": "أنت وحدك من لديه وصول. أضف زملاء أعلاه، أو شارك مع الفريق بأكمله.",
		"access.saveAccess": "حفظ الوصول",
		"access.shareEntireTeam": "المشاركة مع الفريق بأكمله",
		"access.shareLinkCopied": "تم نسخ رابط المشاركة",
		"access.copyLinkInstead": "نسخ الرابط بدلاً من ذلك",
		"shared.inviteTeam": "دعوة الفريق…",
		"shared.viewer": "قارئ",
		"shared.editor": "محرّر",
		"tour.skip": "تخطّي",
		"tour.back": "رجوع",
		"tour.stepOf": "الخطوة {n} من {total}",
		"tour.next": "التالي",
		"tour.getStarted": "ابدأ",
		"tour.s1Title": "مرحبًا بك في Ichava Browser",
		"tour.s1Body": "كل أيقونة في تطبيق Laravel لديك — قابلة للبحث والمعاينة وجاهزة للنسخ. هذه الجولة التي تستغرق 30 ثانية تعرّفك بكل شيء. يمكنك إعادتها في أي وقت من الإعدادات.",
		"tour.s2Title": "اعثر على أي أيقونة بسرعة",
		"tour.s2Body": "ابحث بالاسم أو الوسم، وصفِّ حسب الحزمة والفئة والنمط في الشريط الجانبي، أو اضغط ⌘K للوحة الأوامر.",
		"tour.s3Title": "أعِد التنسيق حيًّا",
		"tour.s3Body": "المعالجات والحجم والسُّمك واللون وإعدادات الحركة تعيد تنسيق كل أيقونة في مكانها — تتحدّث الشبكة أثناء الضبط.",
		"tour.s4Title": "انسخ لمنظومتك",
		"tour.s4Body": "افتح أي أيقونة لـ Blade وLivewire وVue وReact وSvelte وWeb Component وSVG الخام والمزيد — نقرة واحدة للنسخ.",
		"tour.s5Title": "احفظ وشارك",
		"tour.s5Body": "أضِف الأيقونات إلى المفضّلة، وجمّعها في مجموعات، وصدّر sprite أو manifest أو ZIP. سجّل الدخول للمزامنة عبر الأجهزة.",
		"task.working": "جارٍ العمل…",
		"task.export": "جارٍ تصدير {n} أيقونة…",
		"task.copyNames": "جارٍ جمع {n} من أسماء الأيقونات…",
		"task.png": "جارٍ إنشاء PNG…",
		"task.selectAll": "جارٍ تحديد كل الأيقونات المطابقة…",
		"export.files": "ملفات SVG",
		"export.filesDesc": "تنزيلات ‎.svg فردية",
		"export.sprite": "ملف sprite لـ SVG",
		"export.spriteDesc": "ورقة <symbol> واحدة",
		"export.manifest": "بيان JSON",
		"export.manifestDesc": "المعرّفات والحزم والفئات",
		"export.zip": "حزمة ZIP",
		"export.zipDesc": "Sprite + البيان + الملفات",
		"copyFormat.svg": "SVG خام",
		"copyFormat.blade": "وسم Blade",
		"copyFormat.vue": "مقتطف Vue",
		"copyFormat.name": "اسم الأيقونة",
		"snippetTab.motion": "الحركة",
		"snippetTab.helper": "دالة مساعدة",
		"snippetTab.bladeGeneric": "Blade (عام)",
		"snippetTab.webcomponent": "مكوّن ويب",
		"snippetTab.name": "الاسم",
		"clipboard.copyFailed": "فشل النسخ — حدّد وانسخ يدويًا",
		"clipboard.copied": "تم النسخ إلى الحافظة"
	}
};
function Vt(e) {
	return e;
}
var Ht = {};
function Ut(e, t = Ht) {
	return bt.of(Bt).withOverrides(t).locale(e);
}
function Wt(e, t, n) {
	return Ut(e.locale, e.translationOverrides).t(t, n);
}
// src/modules/catalog/domain/packShort.ts
function Gt(e) {
	return e.package.replace(/^ichava\//, "").replace(/^icon-sets-/, "").replace(/-icons$/, "");
}
// src/modules/catalog/domain/iconRef.ts
function Kt(e) {
	return `${Gt(e)}:${e.name}`;
}
// src/modules/catalog/domain/CatalogIndex.ts
var qt = class {
	#e;
	constructor(e) {
		this.#e = e;
	}
	matches(e, t, n = {}) {
		if (!n.packages && t.packages?.length && !t.packages.includes(e.package)) return !1;
		if (!n.categories) {
			let n = t.categories?.length ?? 0, r = t.subs?.length ?? 0;
			if (n || r) {
				let n = !!t.categories?.includes(e.category), r = !!(e.sub && t.subs?.includes(`${e.category}/${e.sub}`));
				if (!n && !r) return !1;
			}
		}
		if (!n.variants && t.variants?.length && !t.variants.includes(e.variant)) return !1;
		let r = (t.search ?? "").trim().toLowerCase();
		if (r.length >= 2) {
			let t = Kt(e), n = `${e.name} ${t} ${e.package} ${e.tags.join(" ")} ${e.keywords.join(" ")}`.toLowerCase();
			if (!r.split(/\s+/).every((e) => n.includes(e))) return !1;
		}
		return !0;
	}
	filtered(e) {
		let t = e.sortBy ?? "name", n = e.sortDirection === "desc" ? -1 : 1, r = t === "name" ? "name" : t === "package" ? "package" : "category";
		return this.#e.icons.filter((t) => this.matches(t, e)).sort((e, t) => n * String(e[r]).localeCompare(String(t[r])));
	}
	page(e) {
		let t = this.filtered(e), n = t.length, r = e.perPage ?? 60, i = Math.max(1, Math.ceil(n / r)), a = Math.min(Math.max(1, e.page ?? 1), i), o = (a - 1) * r;
		return {
			items: t.slice(o, o + r),
			total: n,
			page: a,
			perPage: r,
			lastPage: i,
			rangeStart: n ? o + 1 : 0,
			rangeEnd: Math.min(o + r, n)
		};
	}
	byId(e) {
		return this.#e.icons.find((t) => t.id === e);
	}
	related(e, t = 6) {
		return this.#e.icons.filter((t) => t.id !== e.id && t.category === e.category).slice(0, t);
	}
	filters() {
		let e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
		for (let n of this.#e.icons) e.set(n.category, (e.get(n.category) ?? 0) + 1), t.set(n.variant, (t.get(n.variant) ?? 0) + 1);
		let n = [...e.entries()].map(([e, t]) => ({
			id: e,
			name: e,
			label: Jt(e),
			count: t
		})).sort((e, t) => e.name.localeCompare(t.name)), r = [...t.entries()].map(([e, t]) => ({
			id: e,
			name: e,
			label: Jt(e),
			count: t
		})).sort((e, t) => e.name.localeCompare(t.name));
		return {
			packages: this.#e.packages,
			categories: n,
			variants: r
		};
	}
	variantCounts(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n of this.#e.icons) this.matches(n, e, {
			variants: !0,
			categories: !0
		}) && t.set(n.variant, (t.get(n.variant) ?? 0) + 1);
		return t;
	}
	categoryTree(e) {
		let t = this.#e.icons.filter((t) => this.matches(t, e, { categories: !0 })), n = /* @__PURE__ */ new Map();
		for (let e of t) {
			let t = n.get(e.package) ?? /* @__PURE__ */ new Map(), r = t.get(e.category) ?? {
				total: 0,
				subs: /* @__PURE__ */ new Map()
			};
			r.total += 1, e.sub && r.subs.set(e.sub, (r.subs.get(e.sub) ?? 0) + 1), t.set(e.category, r), n.set(e.package, t);
		}
		let r = new Map(this.#e.packages.map((e) => [e.id, e.label])), i = [];
		for (let [e, t] of n) {
			let n = [...t.entries()].map(([e, t]) => ({
				name: e,
				count: t.total,
				sub: t.subs.size ? [...t.subs.entries()].map(([e, t]) => ({
					slug: e,
					name: Jt(e),
					count: t
				})).sort((e, t) => e.name.localeCompare(t.name)) : void 0
			})).sort((e, t) => e.name.localeCompare(t.name));
			i.push({
				pack: e,
				label: r.get(e) ?? e,
				count: n.length,
				cats: n
			});
		}
		return i.sort((e, t) => e.label.localeCompare(t.label));
	}
};
function Jt(e) {
	return e.replace(/(^|[-_\s])(\w)/g, (e, t, n) => (t ? " " : "") + n.toUpperCase());
}
// src/modules/catalog/domain/IconQuery.ts
var Yt = (e, t) => e.includes(t) ? e.filter((e) => e !== t) : [...e, t], Xt = class e {
	#e;
	constructor(e) {
		this.#e = e, Object.freeze(this);
	}
	static from(t) {
		return new e({ ...t });
	}
	#t(t) {
		return new e({
			...this.#e,
			...t
		});
	}
	search(e) {
		return this.#t({
			search: e,
			page: 1
		});
	}
	clearSearch() {
		return this.#t({
			search: "",
			page: 1
		});
	}
	togglePackage(e) {
		return this.#t({
			packages: Yt(this.#e.packages, e),
			page: 1
		});
	}
	selectAllPacks(e) {
		return this.#t({
			packages: e,
			page: 1
		});
	}
	clearPacks() {
		return this.#t({
			packages: [],
			page: 1
		});
	}
	toggleCategory(e) {
		return this.#t({
			categories: Yt(this.#e.categories, e),
			page: 1
		});
	}
	toggleSub(e, t) {
		return this.#t({
			subs: Yt(this.#e.subs, `${e}/${t}`),
			page: 1
		});
	}
	clearCategories() {
		return this.#t({
			categories: [],
			subs: [],
			page: 1
		});
	}
	toggleVariant(e) {
		return this.#t({
			variant: this.#e.variant === e ? null : e,
			page: 1
		});
	}
	sortBy(e) {
		return this.#t({ sortBy: e });
	}
	toggleOrder() {
		return this.#t({ sortOrder: this.#e.sortOrder === "asc" ? "desc" : "asc" });
	}
	page(e) {
		return this.#t({ page: e });
	}
	nextPage(e) {
		return this.#t({ page: Math.min(e, this.#e.page + 1) });
	}
	prevPage() {
		return this.#t({ page: Math.max(1, this.#e.page - 1) });
	}
	perPage(e) {
		return this.#t({
			perPage: e,
			page: 1
		});
	}
	reset(t) {
		return new e({
			...t,
			packages: this.#e.packages
		});
	}
	toFilters() {
		return { ...this.#e };
	}
	toListParams() {
		let e = this.#e;
		return {
			search: e.search,
			packages: e.packages,
			categories: e.categories,
			subs: e.subs,
			variants: e.variant ? [e.variant] : [],
			page: e.page,
			perPage: e.perPage,
			sortBy: e.sortBy,
			sortDirection: e.sortOrder
		};
	}
}, Zt = null;
function Qt() {
	if (Zt) return Zt;
	if (typeof navigator > "u" || typeof screen > "u") return "ichava_00000000_0";
	let e = [
		navigator.userAgent,
		navigator.language,
		screen.colorDepth,
		`${screen.width}x${screen.height}`,
		(/* @__PURE__ */ new Date()).getTimezoneOffset(),
		navigator.hardwareConcurrency || 0,
		navigator.platform || ""
	].join("|"), t = 0;
	for (let n = 0; n < e.length; n++) t = Math.imul(t, 31) + e.charCodeAt(n) | 0;
	return Zt = `ichava_${Math.abs(t).toString(16).padStart(8, "0")}_${Math.floor(Date.now() / 864e5).toString(16)}`, Zt;
}
// src/modules/catalog/infrastructure/HttpTransport.ts
var $t = {
	baseUrl: "/ichava/api",
	credentials: "include",
	timeoutMs: 15e3,
	csrf: {
		strategy: "sanctum",
		metaName: "csrf-token",
		cookieName: "XSRF-TOKEN",
		headerName: "X-CSRF-TOKEN",
		endpoint: "/sanctum/csrf-cookie"
	}
}, en = class extends Error {
	status;
	detail;
	constructor(e, t) {
		super(`HTTP ${e}: ${t}`), this.status = e, this.detail = t, this.name = "HttpError";
	}
}, tn = class extends Error {
	reason;
	constructor(e) {
		super(e === "timeout" ? "Request timed out" : "Request aborted by caller"), this.reason = e, this.name = "RequestAbortedError";
	}
};
function nn(e) {
	if (typeof document > "u") return "";
	for (let t of document.cookie.split("; ")) {
		let n = t.indexOf("=");
		if (n > 0 && t.slice(0, n) === e) return decodeURIComponent(t.slice(n + 1));
	}
	return "";
}
var rn = class e {
	#e;
	#t = !1;
	constructor(e = $t) {
		this.#e = {
			...e,
			csrf: { ...e.csrf }
		};
	}
	get config() {
		return this.#e;
	}
	with(t) {
		return new e({
			...this.#e,
			...t,
			csrf: {
				...this.#e.csrf,
				...t.csrf ?? {}
			}
		});
	}
	#n() {
		let { strategy: e, metaName: t, cookieName: n } = this.#e.csrf;
		return e === "none" || typeof document > "u" ? "" : e === "cookie" ? nn(n) : document.querySelector(`meta[name="${t}"]`)?.content ?? "";
	}
	async initCsrf() {
		if (this.#e.csrf.strategy === "sanctum" && !(this.#t || typeof fetch > "u")) {
			this.#t = !0;
			try {
				await fetch(this.#e.csrf.endpoint, { credentials: this.#e.credentials });
			} catch {}
		}
	}
	async request(e, t = {}) {
		let n = this.#e, { method: r = "GET", body: i, signal: a, raw: o = !1, baseUrl: s = n.baseUrl } = t, c = i != null, l = new AbortController(), u = !1, d = setTimeout(() => {
			u = !0, l.abort();
		}, n.timeoutMs), f = () => l.abort();
		a?.addEventListener("abort", f, { once: !0 });
		let p = {
			Accept: o ? "image/svg+xml" : "application/json",
			"X-Requested-With": "XMLHttpRequest",
			"X-Browser-Id": Qt()
		};
		c && (p["Content-Type"] = "application/json");
		let m = this.#n();
		m && (p[n.csrf.headerName] = m);
		try {
			let t = await fetch(`${s}${e}`, {
				method: r,
				credentials: n.credentials,
				signal: l.signal,
				headers: p,
				body: c ? JSON.stringify(an(i)) : void 0
			});
			if (!t.ok) throw new en(t.status, await on(t));
			return o ? await t.text() : await t.json();
		} catch (e) {
			throw e instanceof DOMException && e.name === "AbortError" ? new tn(u ? "timeout" : "caller") : e;
		} finally {
			clearTimeout(d), a?.removeEventListener("abort", f);
		}
	}
};
function an(e) {
	if (e instanceof Set) return [...e];
	if (Array.isArray(e)) return e.map(an);
	if (e && typeof e == "object") {
		let t = {};
		for (let [n, r] of Object.entries(e)) r != null && (t[n] = an(r));
		return t;
	}
	return e;
}
async function on(e) {
	try {
		return await e.text();
	} catch {
		return e.statusText;
	}
}
// src/modules/catalog/application/matchingIconIds.ts
async function sn(e, t, n = 500) {
	let r = [];
	for (let i = 1;; i += 1) {
		let a = await e.listIcons({
			...t,
			page: i,
			perPage: n
		});
		for (let e of a.items) r.push(e.id);
		if (a.items.length === 0 || i >= a.lastPage) return r;
	}
}
// src/core/api/httpClient.ts
var cn = new rn();
function ln() {
	return cn;
}
// src/core/api/ApiClient.ts
var un = class {
	repo;
	#e;
	constructor(e) {
		this.#e = e, this.repo = new qt(e);
	}
	async listIcons(e) {
		return this.repo.page(e);
	}
	async getIcon(e) {
		return this.repo.byId(e) ?? null;
	}
	async getSvg(e, t) {
		return e.svgContent ? e.svgContent : e.svgUrl ? ln().request(e.svgUrl, {
			raw: !0,
			baseUrl: "",
			signal: t
		}) : "";
	}
	async getFilters() {
		return this.repo.filters();
	}
	async getStatistics() {
		return this.#e.meta;
	}
	async getTree() {
		return this.repo.categoryTree({
			search: "",
			packages: [],
			categories: [],
			variants: [],
			page: 1,
			perPage: 0,
			sortBy: "name",
			sortDirection: "asc"
		});
	}
	async getRelated(e, t = 6) {
		return this.repo.related(e, t);
	}
	async getVariantCounts(e) {
		return this.repo.variantCounts(e);
	}
}, dn = class e {
	#e;
	#t = null;
	constructor(e = ln().config.baseUrl) {
		this.#e = e;
	}
	static at(t) {
		return new e(t).withTransport(ln().with({ baseUrl: t }));
	}
	get transport() {
		return this.#t ?? ln();
	}
	withTransport(t) {
		let n = new e(this.#e);
		return n.#t = t, n;
	}
	csrf(e) {
		return this.withTransport(this.transport.with({ csrf: { strategy: e } }));
	}
	timeout(e) {
		return this.withTransport(this.transport.with({ timeoutMs: e }));
	}
	credentials(e) {
		return this.withTransport(this.transport.with({ credentials: e }));
	}
	#n(e, t = {}) {
		return this.transport.request(e, {
			...t,
			baseUrl: this.#e
		});
	}
	async listIcons(e, t) {
		return mn(await this.#n(`/icons${_n(gn(e))}`, { signal: t }), e);
	}
	async getIcon(e, t) {
		let n = await this.#n(`/icons/${e}`, { signal: t });
		return n?.data ? Ge(n.data) : null;
	}
	async getSvg(e, t) {
		return this.#n(`/icons/${e.id}/svg`, {
			raw: !0,
			signal: t
		});
	}
	async getFilters(e) {
		let t = await this.#n("/icons/filters", { signal: e }), n = t.data ?? t;
		return {
			packages: n.packages ?? [],
			categories: n.categories ?? [],
			variants: n.variants ?? []
		};
	}
	async getStatistics(e) {
		let t = await this.#n("/icons/statistics", { signal: e });
		return t.data ?? t;
	}
	async getTree(e) {
		let t = await this.#n("/icons/tree", { signal: e });
		return (Array.isArray(t) ? t : t.data ?? []).map(fn);
	}
	async getRelated(e, t = 6, n) {
		let { items: r } = await this.listIcons({
			categories: [e.category],
			page: 1,
			perPage: t + 1
		}, n);
		return r.filter((t) => t.id !== e.id).slice(0, t);
	}
	async getVariantCounts(e, t) {
		let n = await this.getFilters(t);
		return new Map(n.variants.map((e) => [e.name, e.count]));
	}
};
function fn(e) {
	let t = (e.children ?? []).map(pn);
	return {
		pack: e.id,
		label: e.title ?? e.name,
		count: t.length,
		cats: t
	};
}
function pn(e) {
	let t = (e.children ?? []).map((e) => ({
		slug: e.name,
		name: e.label ?? e.name,
		count: e.icon_count
	}));
	return {
		name: e.name,
		count: e.icon_count,
		sub: t.length ? t : void 0
	};
}
function mn(e, t) {
	let n = e ?? {}, r = n.data ?? n, i;
	i = Array.isArray(r) ? r : r && typeof r == "object" ? Object.entries(r).filter(([e]) => e !== "grouped" && /^\d+$/.test(e)).map(([, e]) => e) : [];
	let a = n.meta ?? {}, o = hn(a.per_page, t.perPage ?? i.length), s = hn(a.total, i.length), c = hn(a.current_page, t.page ?? 1), l = hn(a.last_page, Math.max(1, Math.ceil(s / Math.max(1, o)))), u = hn(a.from, s ? (c - 1) * o + 1 : 0), d = hn(a.to, Math.min(c * o, s));
	return {
		items: i.map(Ge),
		total: s,
		page: c,
		perPage: o,
		lastPage: l,
		rangeStart: u,
		rangeEnd: d
	};
}
function hn(e, t) {
	Array.isArray(e) && (e = e[0]);
	let n = typeof e == "string" ? parseInt(e, 10) : e;
	return Number.isFinite(n) ? n : t;
}
function gn(e) {
	return {
		search: e.search,
		packages: e.packages,
		categories: e.categories,
		subs: e.subs,
		variants: e.variants,
		page: e.page,
		per_page: e.perPage,
		sort_by: e.sortBy,
		sort_direction: e.sortDirection
	};
}
function _n(e) {
	let t = new URLSearchParams();
	for (let [n, r] of Object.entries(e)) r == null || r === "" || Array.isArray(r) && r.length === 0 || (Array.isArray(r) ? r.forEach((e) => t.append(`${n}[]`, String(e))) : t.append(n, String(r)));
	let n = t.toString();
	return n ? `?${n}` : "";
}
function vn(e, t) {
	if (e === "rest") return new dn(t.base);
	if (!t.catalog) throw Error("StaticCatalog requires a bundled catalog");
	return new un(t.catalog);
}
// src/core/env.ts
var yn = "ichava.debug";
function bn() {
	try {
		return !0;
	} catch {
		return !1;
	}
}
function xn() {
	try {
		let e = new URLSearchParams(window.location.search);
		if (e.has("debug")) {
			let t = e.get("debug");
			return t === "" || t === "1" || t === "true" || t === "boot";
		}
	} catch {}
	return null;
}
function Sn() {
	try {
		let e = window.localStorage.getItem(yn);
		return e == null ? null : e === "1" || e === "true";
	} catch {
		return null;
	}
}
function Cn(e) {
	return e?.env ?? (bn() ? "production" : "development");
}
function wn(e) {
	let t = xn();
	if (t !== null) return t;
	let n = Sn();
	return n === null ? e?.debug?.enabled == null ? Cn(e) !== "production" : e.debug.enabled : n;
}
function Tn(e) {
	return wn(e) && e?.features?.devtools !== !1;
}
// src/modules/telemetry/infrastructure/Logger.ts
var En = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
	silent: 100
}, Dn = /* @__PURE__ */ new WeakMap(), On = 0, kn = "page", An = new class e {
	level = "debug";
	cap = 300;
	buf = [];
	subs = /* @__PURE__ */ new Set();
	#e;
	#t;
	#n = 0;
	constructor(e = kn, t = null) {
		this.#e = e, this.#t = t;
	}
	get source() {
		return this.#e;
	}
	child(t) {
		return new e(t, this);
	}
	configure(e) {
		e?.limits?.logBuffer && (this.cap = e.limits.logBuffer);
		let t = e?.debug?.logLevel;
		this.level = t || (wn(e) ? "debug" : Cn(e) === "production" ? "warn" : "debug");
	}
	setLevel(e) {
		this.level = e;
	}
	getLevel() {
		return this.level;
	}
	subscribe(e) {
		this.subs.add(e);
		let t = this.#t?.subscribe(e);
		return () => {
			this.subs.delete(e), t?.();
		};
	}
	buffer() {
		if (!this.#t) return this.buf;
		let e = this.#t.buffer().filter((e) => Dn.get(e) > this.#n);
		return e.length ? [...e, ...this.buf].sort((e, t) => Dn.get(e) - Dn.get(t)) : this.buf;
	}
	clear() {
		this.buf = [], this.#n = On;
	}
	write(e, t, n, r) {
		let i = {
			ts: Date.now(),
			level: e,
			channel: t,
			message: n,
			data: r,
			source: this.#e
		};
		if (Dn.set(i, ++On), this.buf.push(i), this.buf.length > this.cap && this.buf.splice(0, this.buf.length - this.cap), this.subs.forEach((e) => {
			try {
				e(i);
			} catch {}
		}), En[e] >= En[this.level] && this.level !== "silent") {
			let i = `[ichava:${t}]`, a = e === "error" ? console.error : e === "warn" ? console.warn : e === "info" ? console.info : console.debug;
			r === void 0 ? a(i, n) : a(i, n, r);
		}
	}
	debug(e, t, n) {
		this.write("debug", e, t, n);
	}
	info(e, t, n) {
		this.write("info", e, t, n);
	}
	warn(e, t, n) {
		this.write("warn", e, t, n);
	}
	error(e, t, n) {
		this.write("error", e, t, n);
	}
}(), jn = "page", Mn = new class e {
	#e = /* @__PURE__ */ new Set();
	#t;
	#n;
	constructor(e = jn, t = null) {
		this.#t = e, this.#n = t;
	}
	get source() {
		return this.#t;
	}
	child(t) {
		return new e(t, this);
	}
	emit(e, t, n) {
		let r = {
			kind: e,
			label: t,
			payload: n,
			ts: Date.now(),
			source: this.#t
		};
		this.#e.forEach((e) => {
			try {
				e(r);
			} catch {}
		});
	}
	on(e) {
		this.#e.add(e);
		let t = this.#n?.on(e);
		return () => {
			this.#e.delete(e), t?.();
		};
	}
}(), Nn = (e, t) => ((e?.[0] ?? "") + (t?.[0] ?? e?.[1] ?? "")).toUpperCase() || "??", Pn = class {
	signIn(e, t, n) {
		return t === "000000" ? null : {
			name: n?.user?.name ?? e.split("@")[0],
			initials: n?.user?.initials ?? Nn(e),
			email: e,
			plan: n?.user?.plan ?? "PRO"
		};
	}
	createAccount(e) {
		return {
			name: `${e.first} ${e.last}`.trim(),
			initials: Nn(e.first, e.last),
			email: e.email,
			plan: "FREE"
		};
	}
	signOut() {}
}, W = {
	meta: {
		version: "0.1.1",
		author: "Imani Manyara",
		sets: 70,
		license: "Proprietary",
		url: "https://simtabi.com"
	},
	seo: {
		title: "Ichava Browser — every icon your Laravel app needs",
		description: "139,000+ SVG icons from 70+ open-source sets. Search, restyle, animate and copy — visual browser, REST API and Blade components for Laravel."
	},
	env: null,
	debug: {
		enabled: null,
		logLevel: "debug"
	},
	features: {
		devtools: !0,
		collections: !0,
		history: !0,
		motion: !0,
		treatments: !0,
		multiSelect: !0,
		presence: !0,
		demo: !1
	},
	brand: {
		name: "Ichava",
		suffix: "Browser",
		tagline: ""
	},
	user: {
		mode: "guest",
		name: "",
		email: "",
		initials: "",
		plan: "",
		workspaces: []
	},
	team: [],
	ui: {
		defaultTheme: "light",
		scale: "m",
		density: "compact",
		accentOptions: [
			"#7c3aed",
			"#2563eb",
			"#059669",
			"#e11d48",
			"#ea580c"
		],
		perPageOptions: [
			30,
			60,
			120,
			240
		],
		scaleOptions: [
			{
				id: "xs",
				label: "XS"
			},
			{
				id: "s",
				label: "S"
			},
			{
				id: "m",
				label: "M"
			},
			{
				id: "l",
				label: "L"
			}
		],
		baseFontSize: 13.5,
		avatarPalette: [
			"#7c3aed",
			"#0891b2",
			"#059669",
			"#e11d48",
			"#ea580c"
		]
	},
	defaults: {
		packages: [
			"ichava/icon-sets-tabler",
			"ichava/icon-sets-bundled",
			"ichava/icon-sets-flag",
			"ichava/icon-sets-metronic",
			"ichava/icon-sets-emoji"
		],
		perPage: 60,
		sortBy: "name",
		sortOrder: "asc",
		appearance: {
			theme: "system",
			accent: "#7c3aed",
			radius: 8,
			scale: "m",
			density: "compact",
			reduceMotion: !1,
			showLabels: !0,
			adaptMonochrome: !0
		},
		render: {
			size: 48,
			sizeUnit: "px",
			gridStroke: 1.5,
			color: null,
			treatment: "default",
			copyFormat: "svg"
		},
		collections: []
	},
	ranges: {
		size: {
			min: 16,
			max: 1024,
			step: 16
		},
		stroke: {
			min: .5,
			max: 3,
			step: .25
		},
		radius: {
			min: 0,
			max: 14
		}
	},
	limits: {
		historyCap: 40,
		recentCommandsCap: 5,
		paletteIconResults: 6,
		logBuffer: 300
	},
	toolbar: {
		sortOptions: [
			{
				id: "name",
				label: "Name"
			},
			{
				id: "package",
				label: "Package"
			},
			{
				id: "category",
				label: "Category"
			}
		],
		treatments: [
			{
				id: "default",
				label: "Stroke",
				desc: "Original pack strokes"
			},
			{
				id: "solid",
				label: "Solid",
				desc: "Bolder, filled weight"
			},
			{
				id: "duotone",
				label: "Dual tone",
				desc: "Accent shadow layer"
			},
			{
				id: "midtone",
				label: "Midtone",
				desc: "Softened 50% ink"
			},
			{
				id: "halftone",
				label: "Halftone",
				desc: "Retro dot-matrix fill"
			}
		],
		sizeUnits: [
			"px",
			"rem",
			"em"
		],
		copyFormats: [
			{
				id: "svg",
				label: "Raw SVG"
			},
			{
				id: "blade",
				label: "Blade tag"
			},
			{
				id: "vue",
				label: "Vue snippet"
			},
			{
				id: "name",
				label: "Icon name"
			}
		],
		exportFormats: [
			{
				id: "files",
				label: "SVG files",
				desc: "Individual .svg downloads",
				icon: "cube"
			},
			{
				id: "sprite",
				label: "SVG sprite",
				desc: "One <symbol> sheet",
				icon: "stats"
			},
			{
				id: "manifest",
				label: "JSON manifest",
				desc: "ids, packs & categories",
				icon: "text"
			},
			{
				id: "zip",
				label: "ZIP bundle",
				desc: "Sprite + manifest + files",
				icon: "download"
			}
		]
	},
	about: {
		description: "An icon engine for Laravel: 139,000+ SVG icons with a visual browser, REST API and Blade components.",
		creditsTitle: "OPEN SOURCE CREDITS",
		copyright: "© 2026 Simtabi LLC",
		creditsMarqueeSec: 22,
		credits: [
			{
				name: "Tabler Icons",
				author: "Paweł Kuna",
				license: "MIT"
			},
			{
				name: "Lucide",
				author: "Lucide Contributors",
				license: "ISC"
			},
			{
				name: "Heroicons",
				author: "Tailwind Labs",
				license: "MIT"
			},
			{
				name: "Feather",
				author: "Cole Bemis",
				license: "MIT"
			},
			{
				name: "Bootstrap Icons",
				author: "The Bootstrap Authors",
				license: "MIT"
			},
			{
				name: "Font Awesome",
				author: "Fonticons, Inc.",
				license: "CC BY 4.0"
			},
			{
				name: "Boxicons",
				author: "Aniket Suvarna",
				license: "MIT"
			},
			{
				name: "Phosphor Icons",
				author: "Helena Zhang & Tobias Fried",
				license: "MIT"
			},
			{
				name: "Remix Icon",
				author: "Remix Design",
				license: "Apache-2.0"
			},
			{
				name: "Material Symbols",
				author: "Google",
				license: "Apache-2.0"
			},
			{
				name: "Metronic Icons",
				author: "Keenthemes",
				license: "Commercial"
			},
			{
				name: "Flag Icons",
				author: "Panayiotis Lipiridis",
				license: "MIT"
			},
			{
				name: "Twemoji",
				author: "Twitter, Inc.",
				license: "CC BY 4.0"
			}
		],
		links: [
			{
				label: "simtabi.com",
				href: "https://simtabi.com"
			},
			{
				label: "Docs",
				href: "https://github.com/ichava/icon-browser/tree/main/docs"
			},
			{
				label: "Icon packs",
				href: "https://github.com/ichava/icon-browser/tree/main/docs"
			},
			{
				label: "GitHub",
				href: "https://github.com/ichava/icon-browser"
			}
		],
		stats: [
			{
				key: "indexed",
				label: "icons indexed"
			},
			{
				key: "sets",
				label: "icon sets"
			},
			{
				key: "license",
				label: "license"
			}
		]
	},
	i18n: {
		locale: "en",
		available: [
			"en",
			"es",
			"fr",
			"de",
			"pt",
			"sw",
			"ar"
		]
	},
	storageKeys: {
		persist: "ichava.browser.v2",
		driver: "ichava.browser.driver",
		paletteRecent: "ichava.palette.recent",
		locale: "ichava.locale",
		consent: "ichava.consent"
	},
	boot: {},
	snippets: {
		tabs: [
			"svg",
			"motion",
			"helper",
			"blade",
			"bladeGeneric",
			"livewire",
			"alpine",
			"vue",
			"react",
			"svelte",
			"webcomponent",
			"api",
			"name"
		],
		labels: {},
		templates: {},
		className: "w-6 h-6",
		apiOrigin: ""
	},
	storage: {
		frontendDriver: "local",
		laravelDriver: "session"
	}
};
function Fn(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function In(e, t) {
	if (t === void 0) return e;
	if (Array.isArray(t)) return t;
	if (Fn(t) && Fn(e)) {
		let n = { ...e };
		for (let r of Object.keys(t)) n[r] = In(e[r], t[r]);
		return n;
	}
	return t ?? e;
}
function Ln(e) {
	return In(W, e ?? {});
}
// src/core/storage.ts
var Rn = W.storageKeys.driver, zn = W.storageKeys.persist;
function Bn() {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function Vn() {
	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
}
var Hn = (() => {
	let e = Bn()?.getItem(Rn);
	return e === "session" || e === "local" ? e : W.storage.frontendDriver === "session" ? "session" : "local";
})();
function Un() {
	return Hn === "session" ? Vn() : Bn();
}
var Wn = /* @__PURE__ */ new Set();
function Gn(e) {
	Wn.add(e);
}
function Kn() {
	return Un();
}
function qn() {
	return Bn();
}
function Jn(e) {
	try {
		return Un()?.getItem(e) != null;
	} catch {
		return !1;
	}
}
function Yn() {
	return Hn;
}
function Xn(e) {
	if (e === Hn) return;
	let t = Hn === "session" ? Vn() : Bn(), n = e === "session" ? Vn() : Bn();
	for (let e of [zn, ...Wn]) try {
		let r = t?.getItem(e);
		r != null && n && (n.setItem(e, r), t?.removeItem(e));
	} catch {}
	Hn = e;
	try {
		Bn()?.setItem(Rn, e);
	} catch {}
}
function Zn() {
	try {
		Un()?.removeItem(zn);
	} catch {}
}
var Qn = {
	getItem: (e) => Un()?.getItem(e) ?? null,
	setItem: (e, t) => {
		try {
			Un()?.setItem(e, t);
		} catch {}
	},
	removeItem: (e) => {
		try {
			Un()?.removeItem(e);
		} catch {}
	}
}, $n = b(() => Qn), er = W.defaults, tr = {
	search: "",
	packages: [...er.packages],
	categories: [],
	subs: [],
	variant: null,
	sortBy: er.sortBy,
	sortOrder: er.sortOrder,
	page: 1,
	perPage: er.perPage
}, nr = {
	...er.appearance,
	adaptMonochrome: er.appearance.adaptMonochrome ?? !0,
	get theme() {
		return ot(er.appearance.theme);
	}
}, rr = {
	...er.render,
	treatment: er.render.treatment
}, ir = er.collections.map((e) => ({
	...e,
	icons: [...e.icons]
})), ar = W.limits.historyCap, or = class {
	#e;
	constructor(e) {
		this.#e = e, Gn(e), Object.freeze(this);
	}
	get key() {
		return this.#e;
	}
	read() {
		for (let e of [Kn(), qn()]) try {
			let t = e?.getItem(this.#e);
			if (t != null) return JSON.parse(t);
		} catch {}
	}
	write(e) {
		try {
			Kn()?.setItem(this.#e, JSON.stringify(e));
		} catch {}
	}
};
// src/modules/preferences/domain/withDefaults.ts
function sr(e, t) {
	let n = { ...e };
	if (!t) return n;
	for (let r of Object.keys(e)) {
		let e = t[r];
		e != null && (n[r] = e);
	}
	return n;
}
// src/state/preferences.ts
function cr() {
	return { ...nr };
}
function lr(e) {
	return {
		...sr(cr(), {
			...e,
			theme: void 0
		}),
		theme: e.theme ? ot(e.theme) : nr.theme
	};
}
function ur() {
	return { ...rr };
}
function dr(e) {
	return sr(ur(), e);
}
// src/state/slices/data.ts
function fr(e, t) {
	if (t) return {};
	let n = e.defaults;
	if (!n) return {};
	let r = n.appearance, i = n.render;
	return {
		filters: {
			...tr,
			packages: n.packages ?? tr.packages,
			perPage: n.perPage ?? tr.perPage,
			sortBy: n.sortBy ?? tr.sortBy,
			sortOrder: n.sortOrder ?? tr.sortOrder
		},
		...r && lr(r),
		...i && dr(i),
		...n.collections?.length ? { collections: n.collections } : {}
	};
}
function pr(e, t, n) {
	return {
		catalog: null,
		filtersData: null,
		config: null,
		loading: !0,
		activeWorkspaceId: null,
		setCatalog: (t) => e({
			catalog: t,
			loading: !1
		}),
		setFiltersData: (t) => e({ filtersData: t }),
		setConfig: (t) => e((e) => {
			let r = !e.authInitialized && t.user.mode === "authenticated" ? {
				auth: {
					status: "authed",
					user: {
						name: t.user.name,
						initials: t.user.initials,
						email: t.user.email,
						plan: t.user.plan
					}
				},
				authInitialized: !0
			} : {};
			return {
				config: t,
				activeWorkspaceId: (e.activeWorkspaceId && t.user.workspaces.some((t) => t.id === e.activeWorkspaceId) ? e.activeWorkspaceId : null) ?? t.user.workspaces.find((e) => e.active)?.id ?? t.user.workspaces[0]?.id ?? null,
				...r,
				...fr(t, n)
			};
		}),
		setActiveWorkspace: (t) => e({ activeWorkspaceId: t })
	};
}
// src/state/slices/appearance.ts
function mr(e, t) {
	return {
		...cr(),
		locale: Ct(),
		setLocale: (t) => {
			wt(t), e({ locale: t });
		},
		translationOverrides: {},
		addTranslations: (t) => e((e) => {
			let n = { ...e.translationOverrides };
			for (let [e, r] of Object.entries(t)) n[e] = {
				...n[e] ?? {},
				...r
			};
			return { translationOverrides: n };
		}),
		setTheme: (t) => e({ theme: t }),
		toggleTheme: () => e((e) => ({ theme: e.theme === "dark" ? "light" : "dark" })),
		setAccent: (t) => e({ accent: t }),
		setRadius: (t) => e({ radius: t }),
		setScale: (t) => e({ scale: t }),
		setDensity: (t) => e({ density: t }),
		toggleReduceMotion: () => e((e) => ({ reduceMotion: !e.reduceMotion })),
		toggleLabels: () => e((e) => ({ showLabels: !e.showLabels })),
		toggleAdaptMonochrome: () => e((e) => ({ adaptMonochrome: !e.adaptMonochrome }))
	};
}
// src/state/slices/browse.ts
function hr(e, t) {
	return {
		filters: tr,
		view: "grid",
		catQ: "",
		collapsedGroups: [],
		expandedCats: [],
		searchScope: "icons",
		packageQuery: "",
		sidebarOpen: !1,
		setSearchScope: (t) => e({ searchScope: t }),
		setPackageQuery: (t) => e({ packageQuery: t }),
		toggleSidebar: () => e((e) => ({ sidebarOpen: !e.sidebarOpen })),
		setSidebarOpen: (t) => e({ sidebarOpen: t }),
		setSearch: (t) => e((e) => ({ filters: Xt.from(e.filters).search(t).toFilters() })),
		clearSearch: () => e((e) => ({ filters: Xt.from(e.filters).clearSearch().toFilters() })),
		togglePackage: (t) => e((e) => ({ filters: Xt.from(e.filters).togglePackage(t).toFilters() })),
		selectAllPacks: (t) => e((e) => ({ filters: Xt.from(e.filters).selectAllPacks(t).toFilters() })),
		clearPacks: () => e((e) => ({ filters: Xt.from(e.filters).clearPacks().toFilters() })),
		toggleCat: (t) => e((e) => ({ filters: Xt.from(e.filters).toggleCategory(t).toFilters() })),
		toggleSub: (t, n) => e((e) => ({ filters: Xt.from(e.filters).toggleSub(t, n).toFilters() })),
		clearCats: () => e((e) => ({ filters: Xt.from(e.filters).clearCategories().toFilters() })),
		setVariant: (t) => e((e) => ({ filters: Xt.from(e.filters).toggleVariant(t).toFilters() })),
		setSort: (t) => e((e) => ({ filters: Xt.from(e.filters).sortBy(t).toFilters() })),
		toggleOrder: () => e((e) => ({ filters: Xt.from(e.filters).toggleOrder().toFilters() })),
		setPage: (t) => e((e) => ({ filters: Xt.from(e.filters).page(t).toFilters() })),
		nextPage: (t) => e((e) => ({ filters: Xt.from(e.filters).nextPage(t).toFilters() })),
		prevPage: () => e((e) => ({ filters: Xt.from(e.filters).prevPage().toFilters() })),
		setPerPage: (t) => e((e) => ({ filters: Xt.from(e.filters).perPage(t).toFilters() })),
		setView: (t) => e({ view: t }),
		setCatQ: (t) => e({ catQ: t }),
		toggleGroup: (t) => e((e) => ({ collapsedGroups: e.collapsedGroups.includes(t) ? e.collapsedGroups.filter((e) => e !== t) : [...e.collapsedGroups, t] })),
		toggleCatExpand: (t) => e((e) => ({ expandedCats: e.expandedCats.includes(t) ? e.expandedCats.filter((e) => e !== t) : [...e.expandedCats, t] })),
		toggleExpandAll: (t, n) => e((e) => e.collapsedGroups.length === 0 && n.every((t) => e.expandedCats.includes(t)) ? {
			collapsedGroups: [...t],
			expandedCats: []
		} : {
			collapsedGroups: [],
			expandedCats: [...n]
		}),
		resetFilters: () => e((e) => ({
			filters: Xt.from(e.filters).reset(tr).toFilters(),
			catQ: "",
			color: null,
			treatment: "default",
			selection: []
		}))
	};
}
// src/state/slices/render.ts
function gr(e, t) {
	return {
		...ur(),
		setSize: (t) => e({ size: t }),
		setSizeUnit: (t) => e({ sizeUnit: t }),
		setGridStroke: (t) => e({ gridStroke: t }),
		setColor: (t) => e({ color: t }),
		setTreatment: (t) => e({ treatment: t }),
		setCopyFormat: (t) => e({ copyFormat: t })
	};
}
// src/state/slices/selection.ts
function _r(e, t) {
	return {
		selection: [],
		toggleSelect: (t) => e((e) => ({ selection: e.selection.includes(t) ? e.selection.filter((e) => e !== t) : [...e.selection, t] })),
		clearSelection: () => e({ selection: [] }),
		setSelection: (t) => e({ selection: [...t] })
	};
}
// src/modules/library/domain/Library.ts
var vr = class e {
	#e;
	#t;
	constructor(e, t) {
		this.#e = e, this.#t = t, Object.freeze(this);
	}
	static from(t, n) {
		return new e({
			favorites: t.favorites,
			history: t.history,
			collections: t.collections
		}, n.historyCap);
	}
	get favorites() {
		return this.#e.favorites;
	}
	get history() {
		return this.#e.history;
	}
	get collections() {
		return this.#e.collections;
	}
	#n(t) {
		return new e({
			...this.#e,
			...t
		}, this.#t);
	}
	#r(e) {
		return this.#n({ collections: this.#e.collections.map(e) });
	}
	toggleFavorite(e) {
		let t = this.#e.favorites;
		return this.#n({ favorites: t.includes(e) ? t.filter((t) => t !== e) : [e, ...t] });
	}
	record(e, t, n) {
		let r = this.#e.history.filter((n) => n.id !== e || n.action !== t);
		return this.#n({ history: [{
			id: e,
			action: t,
			ts: n
		}, ...r].slice(0, this.#t) });
	}
	clearHistory() {
		return this.#n({ history: [] });
	}
	createCollection(e, t) {
		let n = e.trim();
		return n ? this.#n({ collections: [...this.#e.collections, {
			id: t(),
			name: n,
			icons: []
		}] }) : this;
	}
	renameCollection(e, t) {
		return this.#r((n) => n.id === e ? {
			...n,
			name: t.trim() || n.name
		} : n);
	}
	removeCollection(e) {
		return this.#n({ collections: this.#e.collections.filter((t) => t.id !== e) });
	}
	addTo(e, t) {
		return this.#r((n) => n.id === e && !n.icons.includes(t) ? {
			...n,
			icons: [...n.icons, t]
		} : n);
	}
	removeFrom(e, t) {
		return this.#r((n) => n.id === e ? {
			...n,
			icons: n.icons.filter((e) => e !== t)
		} : n);
	}
	share(e, t) {
		return this.#r((n) => n.id === e ? {
			...n,
			shared: !0,
			role: t.role,
			sharedWith: t.sharedWith
		} : n);
	}
}, yr = 0, br = (e) => vr.from(e, { historyCap: ar });
function xr(e, t) {
	return {
		favorites: [],
		history: [],
		collections: ir.map((e) => ({
			...e,
			icons: [...e.icons]
		})),
		toggleFavorite: (t) => e((e) => ({ favorites: br(e).toggleFavorite(t).favorites })),
		pushHistory: (t, n) => e((e) => ({ history: br(e).record(t, n, Date.now()).history })),
		clearHistory: () => e((e) => ({ history: br(e).clearHistory().history })),
		createCollection: (t) => e((e) => {
			let n = br(e), r = n.createCollection(t, () => `c-${Date.now().toString(36)}${(++yr).toString(36)}`);
			return r === n ? {} : { collections: r.collections };
		}),
		renameCollection: (t, n) => e((e) => ({ collections: br(e).renameCollection(t, n).collections })),
		removeCollection: (t) => e((e) => ({ collections: br(e).removeCollection(t).collections })),
		addToCollection: (t, n) => e((e) => ({ collections: br(e).addTo(t, n).collections })),
		removeFromCollection: (t, n) => e((e) => ({ collections: br(e).removeFrom(t, n).collections }))
	};
}
// src/state/slices/ui.ts
var Sr = 2e3, Cr = 0, wr = 0;
function Tr(e, t) {
	return {
		layer: null,
		detailId: null,
		libTab: "favorites",
		openLayer: (t) => e({ layer: t }),
		closeLayer: () => e({
			layer: null,
			detailId: null
		}),
		openDetail: (n) => {
			e({
				layer: "detail",
				detailId: n
			}), t().pushHistory(n, "viewed");
		},
		openLibrary: (t) => e({
			layer: "library",
			libTab: t
		}),
		showToast: (t, n = "check") => e((e) => ({ toasts: [...e.toasts, {
			id: ++wr,
			msg: t,
			icon: n
		}] })),
		dismissToast: (t) => e((e) => ({ toasts: e.toasts.filter((e) => e.id !== t) })),
		toasts: [],
		tasks: [],
		runTask: async (t, n, r) => {
			let i = ++Cr, a = setTimeout(() => e((e) => ({ tasks: [...e.tasks, {
				id: i,
				label: t
			}] })), r?.delayMs ?? 2e3);
			try {
				return await n();
			} finally {
				clearTimeout(a), e((e) => e.tasks.some((e) => e.id === i) ? { tasks: e.tasks.filter((e) => e.id !== i) } : {});
			}
		},
		ctx: null,
		openCtx: (t, n, r, i) => e({ ctx: {
			x: t,
			y: n,
			items: r,
			title: i
		} }),
		closeCtx: () => e({ ctx: null }),
		confirm: null,
		openConfirm: (t) => e({ confirm: t }),
		closeConfirm: () => e({ confirm: null })
	};
}
// src/state/slices/identity.ts
function Er(e, t, n, r) {
	return {
		auth: {
			status: "guest",
			user: null
		},
		authView: null,
		authReason: null,
		authInitialized: !1,
		openAuth: (t, n) => e({
			authView: t,
			authReason: n ?? null
		}),
		closeAuth: () => e({
			authView: null,
			authReason: null
		}),
		signIn: (i, a) => {
			let o = r.signIn(i, a, t().config);
			return o ? (e({
				auth: {
					status: "authed",
					user: o
				},
				authView: null,
				authInitialized: !0
			}), n.emit("auth", "auth.signin", { email: i }), t().pushNotification({
				icon: "check",
				text: "Signed in — collections and sharing unlocked"
			}), !0) : !1;
		},
		createAccount: (i) => {
			e({
				auth: {
					status: "authed",
					user: r.createAccount(i)
				},
				authView: null,
				authInitialized: !0
			}), n.emit("auth", "auth.create", { email: i.email }), t().pushNotification({
				icon: "check",
				text: "Account created — welcome to Ichava"
			});
		},
		signOut: () => {
			e({
				auth: {
					status: "guest",
					user: null
				},
				authView: null,
				authInitialized: !0
			}), r.signOut(), n.emit("auth", "auth.signout");
		}
	};
}
// src/core/notifications.ts
var Dr = [
	{
		icon: "info",
		text: "Share link created for \"Dashboard set\"",
		ageMin: 0
	},
	{
		icon: "check",
		text: "Signed in — collections and sharing unlocked",
		ageMin: 1
	},
	{
		icon: "info",
		text: "Jonas D. added 3 icons to \"Dashboard set\"",
		ageMin: 8
	},
	{
		icon: "info",
		text: "Preferences restored from local storage",
		ageMin: 20,
		read: !0
	}
], Or = 0;
function kr(e, t) {
	return {
		notifications: [],
		seedDemoNotifications: () => e((e) => e.notifications.length ? {} : { notifications: Dr.map((e, t) => ({
			id: `seed-${t}`,
			icon: e.icon,
			text: e.text,
			ts: Date.now() - e.ageMin * 6e4,
			read: e.read ?? !1
		})) }),
		pushNotification: (t) => e((e) => ({ notifications: [{
			id: `n-${++Or}`,
			icon: t.icon,
			text: t.text,
			ts: Date.now(),
			read: !1
		}, ...e.notifications].slice(0, 50) })),
		markNotificationsRead: () => e((e) => ({ notifications: e.notifications.map((e) => ({
			...e,
			read: !0
		})) })),
		clearNotifications: () => e({ notifications: [] })
	};
}
// src/state/slices/devtools.ts
var Ar = {
	min: 120,
	max: 1600,
	default: 260
};
function jr(e, t, n) {
	return {
		devtools: {
			open: !1,
			tab: "events",
			events: [],
			capturing: !0
		},
		toggleDevtools: () => e((e) => {
			let t = !e.devtools.open;
			return n.emit("devtools", "devtools.toggle", { open: t }), { devtools: {
				...e.devtools,
				open: t
			} };
		}),
		setDevToolsTab: (t) => e((e) => ({ devtools: {
			...e.devtools,
			tab: t
		} })),
		pushDevEvent: (t) => e((e) => e.devtools.capturing ? { devtools: {
			...e.devtools,
			events: [t, ...e.devtools.events].slice(0, 200)
		} } : {}),
		clearDevEvents: () => e((e) => ({ devtools: {
			...e.devtools,
			events: []
		} })),
		setCapturing: (t) => e((e) => ({ devtools: {
			...e.devtools,
			capturing: t
		} })),
		devtoolsLayout: {
			dock: "bottom",
			size: Ar.default
		},
		setDevtoolsDock: (t) => e((e) => ({ devtoolsLayout: {
			...e.devtoolsLayout,
			dock: t
		} })),
		setDevtoolsSize: (t) => e((e) => ({ devtoolsLayout: {
			...e.devtoolsLayout,
			size: Math.round(Math.min(Ar.max, Math.max(Ar.min, t)))
		} }))
	};
}
// src/state/slices/collaboration.ts
var Mr = (e) => vr.from(e, { historyCap: ar });
function Nr(e, t, n) {
	return {
		inviteOpen: !1,
		accessCollectionId: null,
		sharedOpen: !1,
		openShared: () => e({ sharedOpen: !0 }),
		closeShared: () => e({ sharedOpen: !1 }),
		openInvite: () => e({ inviteOpen: !0 }),
		closeInvite: () => e({ inviteOpen: !1 }),
		openAccess: (t) => e({ accessCollectionId: t }),
		closeAccess: () => e({ accessCollectionId: null }),
		shareCollection: (r, i) => {
			e((e) => ({ collections: Mr(e).share(r, i).collections }));
			let a = t().collections.find((e) => e.id === r);
			n.emit("share", "collection.shareLink", { id: r }), t().pushNotification({
				icon: "info",
				text: `Share link created for "${a?.name ?? "collection"}"`
			});
		}
	};
}
// src/state/slices/storage.ts
function Pr(e, t, n) {
	return {
		storageDriver: Yn(),
		setStorageDriver: (t) => {
			Xn(t), e({ storageDriver: t }), n.emit("storage", "storage.driver", { driver: t });
		}
	};
}
// src/state/slices/onboarding.ts
function Fr(e, t) {
	return {
		tour: {
			active: !1,
			step: 0
		},
		tourSeen: !1,
		startTour: () => e({ tour: {
			active: !0,
			step: 0
		} }),
		nextTourStep: () => e((e) => ({ tour: {
			...e.tour,
			step: e.tour.step + 1
		} })),
		prevTourStep: () => e((e) => ({ tour: {
			...e.tour,
			step: Math.max(0, e.tour.step - 1)
		} })),
		skipTour: () => e({
			tour: {
				active: !1,
				step: 0
			},
			tourSeen: !0
		}),
		endTour: () => e({
			tour: {
				active: !1,
				step: 0
			},
			tourSeen: !0
		}),
		consent: Ot(),
		setConsent: (t) => {
			e({ consent: t }), kt(t);
		}
	};
}
// src/state/slices/boot.ts
function Ir(e, t) {
	return {
		boot: {
			phase: "idle",
			progress: 0,
			label: "",
			done: !1
		},
		setBoot: (t) => e((e) => ({ boot: {
			...e.boot,
			...t
		} }))
	};
}
// src/state/slices/reset.ts
function Lr(e, t) {
	return { factoryReset: () => {
		e({
			filters: { ...tr },
			view: "grid",
			catQ: "",
			collapsedGroups: [],
			...ur(),
			searchScope: "icons",
			selection: [],
			favorites: [],
			history: [],
			collections: [],
			...cr(),
			layer: null,
			detailId: null,
			notifications: [],
			consent: null,
			tourSeen: !1
		}), kt(null);
	} };
}
// src/store.ts
function Rr(e) {
	return Xt.from(e).toListParams();
}
var zr = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {}
}, Br = 0, Vr = /* @__PURE__ */ new WeakMap();
function Hr(e) {
	return Vr.get(e);
}
function Ur({ persistKey: e = W.storageKeys.persist, devBus: t, identity: n = new Pn() } = {}) {
	let r = t ?? Mn.child(`store-${++Br}`), i = e !== null && Jn(e), a = y()(x((e, t) => ({
		...pr(e, t, i),
		...mr(e, t),
		...hr(e, t),
		...gr(e, t),
		..._r(e, t),
		...xr(e, t),
		...Tr(e, t),
		...Er(e, t, r, n),
		...kr(e, t),
		...jr(e, t, r),
		...Nr(e, t, r),
		...Pr(e, t, r),
		...Fr(e, t),
		...Ir(e, t),
		...Lr(e, t)
	}), {
		name: e ?? "ichava.browser.ephemeral",
		version: 3,
		storage: e === null ? zr : $n,
		migrate: (e) => {
			let t = e ?? {}, n = t.filters;
			return n && (!Array.isArray(n.categories) || !("sortBy" in n)) ? delete t.filters : n && !Array.isArray(n.subs) && (n.subs = []), Array.isArray(t.favorites) && t.favorites.some((e) => typeof e != "number") && (t.favorites = []), delete t.locale, t;
		},
		merge: (e, t) => ({
			...t,
			...e,
			locale: Ct(),
			consent: jt(e?.consent)
		}),
		partialize: (e) => ({
			theme: e.theme,
			accent: e.accent,
			radius: e.radius,
			scale: e.scale,
			density: e.density,
			reduceMotion: e.reduceMotion,
			showLabels: e.showLabels,
			adaptMonochrome: e.adaptMonochrome,
			filters: e.filters,
			view: e.view,
			searchScope: e.searchScope,
			size: e.size,
			sizeUnit: e.sizeUnit,
			gridStroke: e.gridStroke,
			color: e.color,
			treatment: e.treatment,
			copyFormat: e.copyFormat,
			favorites: e.favorites,
			history: e.history,
			collections: e.collections,
			auth: e.auth,
			authInitialized: e.authInitialized,
			activeWorkspaceId: e.activeWorkspaceId,
			notifications: e.notifications,
			storageDriver: e.storageDriver,
			tourSeen: e.tourSeen,
			consent: e.consent,
			devtoolsLayout: e.devtoolsLayout
		}),
		onRehydrateStorage: () => (e) => {
			if (!e) return;
			let t = Object.keys(e).length;
			r.emit("storage", "state.restore", {
				driver: Yn(),
				keys: t
			});
		}
	}));
	return Vr.set(a, r), a;
}
var Wr = Ur();
// src/hooks/selectAllMatching.ts
function Gr(e) {
	return e.search.trim() === "" && e.categories.length === 0 && e.subs.length === 0 && e.variant === null;
}
function Kr(e, t) {
	let n = e.getState(), r = t ?? (n.catalog ? new un(n.catalog) : null);
	if (!r) return;
	let i = Rr(n.filters), a = () => void e.getState().runTask(Wt(e.getState(), "task.selectAll"), () => sn(r, i)).then((t) => e.getState().setSelection(t)).catch(() => {});
	!t || !Gr(n.filters) ? a() : r.listIcons({
		...i,
		page: 1,
		perPage: 1
	}).then(({ total: t }) => {
		let n = e.getState(), r = n.locale, i = (e, t) => Wt(n, e, t);
		e.getState().openConfirm({
			title: i("selectAll.confirmTitle", { n: new Intl.NumberFormat(r).format(t) }),
			body: i("selectAll.confirmBody"),
			confirmLabel: i("selectAll.confirmLabel"),
			onConfirm: a
		});
	}).catch(() => {});
}
// src/hooks/useStoreApi.ts
var qr = i(null), Jr = qr.Provider;
function Yr() {
	return s(qr) ?? Wr;
}
function G(e) {
	return Yr()(e);
}
// src/hooks/useShortcuts.ts
function Xr(e) {
	let t = Yr(), n = Ue(), r = !!e, i = !!e?.manageDocument, a = e?.rootRef, o = e?.overlayRef;
	c(() => {
		let e = (e) => {
			if (!r) return !0;
			let t = e instanceof Node ? e : null, n = (e) => !!(t && e?.current?.contains(t));
			if (n(a) || n(o)) return !0;
			let s = !t || t === document.body || t === document.documentElement;
			return i && s;
		}, s = (r) => {
			if (!e(r.target)) return;
			let i = r.metaKey || r.ctrlKey, a = t.getState(), o = r.target, s = o?.tagName === "INPUT" || o?.tagName === "TEXTAREA" || o?.tagName === "SELECT" || !!o?.isContentEditable, c = (e) => Wt(a, e);
			if (r.key === "Escape") {
				if (a.devtools.open) {
					a.toggleDevtools(), r.preventDefault();
					return;
				}
				a.layer && (a.closeLayer(), r.preventDefault());
			} else if (r.key === "/" && !i && !s) {
				let e = document.querySelector("input[data-role=\"icon-filter\"]");
				e && (r.preventDefault(), e.focus());
			} else if (i) switch (r.key.toLowerCase()) {
				case "k":
					r.preventDefault(), a.openLayer(a.layer === "palette" ? null : "palette");
					break;
				case "t":
					if (s) return;
					r.preventDefault(), a.toggleTheme();
					break;
				case ",":
					r.preventDefault(), a.openLayer("settings");
					break;
				case "1":
					r.preventDefault(), a.openLibrary("favorites");
					break;
				case "2":
					r.preventDefault(), a.openLibrary("history");
					break;
				case "3":
					r.preventDefault(), a.openLibrary("collections");
					break;
				case "backspace":
					if (s || !r.shiftKey) return;
					r.preventDefault(), a.openConfirm({
						title: c("toolbar.resetTitle"),
						body: c("toolbar.resetBody"),
						confirmLabel: c("toolbar.resetConfirm"),
						danger: !0,
						onConfirm: () => {
							a.resetFilters(), a.showToast(c("toolbar.resetToast"), "refresh");
						}
					});
					break;
				case "d":
					if (s || !a.config || a.config.features.devtools === !1) return;
					r.preventDefault(), a.toggleDevtools();
					break;
				case "a":
					if (s || !n && !a.catalog) return;
					r.preventDefault(), Kr(t, n);
			}
		};
		return document.addEventListener("keydown", s), () => document.removeEventListener("keydown", s);
	}, [
		t,
		n,
		r,
		i,
		a,
		o
	]);
}
// src/hooks/useUrlSync.ts
function Zr(e, t, n = "") {
	let r = new URL(e);
	return r.searchParams.set(`${n}icon`, String(t)), r.toString();
}
var Qr = i({
	enabled: !1,
	prefix: ""
});
function $r() {
	let { enabled: e, prefix: t } = s(Qr);
	return e ? (e) => Zr(window.location.href, e, t) : null;
}
var ei = [
	"q",
	"packages",
	"cats",
	"variant",
	"sort",
	"order",
	"page",
	"per",
	"icon"
];
function ti({ enabled: e = !1, prefix: t = "" } = {}) {
	let n = Yr(), r = f(!1);
	c(() => {
		if (!e || r.current) return;
		r.current = !0;
		let i = (e) => `${t}${e}`, a = new URLSearchParams(window.location.search), o = n.getState(), s = (e, t) => e && Number.isFinite(+e) ? +e : t, c = { ...o.filters };
		a.has(i("q")) && (c.search = a.get(i("q")) ?? ""), a.has(i("packages")) && (c.packages = ni(a.get(i("packages")))), a.has(i("cats")) && (c.categories = ni(a.get(i("cats")))), a.has(i("variant")) && (c.variant = a.get(i("variant")) || null), a.has(i("sort")) && (c.sortBy = a.get(i("sort")) || "name"), a.has(i("order")) && (c.sortOrder = a.get(i("order")) || "asc"), a.has(i("page")) && (c.page = s(a.get(i("page")), 1)), a.has(i("per")) && (c.perPage = s(a.get(i("per")), 60)), n.setState({ filters: c });
		let l = a.get(i("icon"));
		l && Number.isFinite(+l) && o.openDetail(+l);
	}, []);
	let i = G((e) => e.filters), a = G((e) => e.detailId);
	c(() => {
		if (!e || !r.current) return;
		let n = (e) => `${t}${e}`, o = new URLSearchParams(window.location.search);
		for (let e of ei) o.delete(n(e));
		i.search && o.set(n("q"), i.search), i.packages.length && o.set(n("packages"), i.packages.join(",")), i.categories.length && o.set(n("cats"), i.categories.join(",")), i.variant && o.set(n("variant"), i.variant), i.sortBy !== "name" && o.set(n("sort"), i.sortBy), i.sortOrder !== "asc" && o.set(n("order"), i.sortOrder), i.page > 1 && o.set(n("page"), String(i.page)), i.perPage !== 60 && o.set(n("per"), String(i.perPage)), a != null && o.set(n("icon"), String(a));
		let s = o.toString(), c = `${window.location.pathname}${s ? `?${s}` : ""}${window.location.hash}`;
		window.history.replaceState(null, "", c);
	}, [
		i,
		a,
		e,
		t
	]);
}
function ni(e) {
	return e ? e.split(",").filter(Boolean) : [];
}
// src/hooks/useMountRoot.ts
var ri = i(null);
function ii() {
	return s(ri);
}
function ai(e, t) {
	typeof window < "u" && e && requestAnimationFrame(() => {
		let n = document.activeElement;
		n && n !== document.body && n.isConnected || ((t == null ? null : e.querySelector(`[data-icon-id="${t}"]`)) ?? e.querySelector("[role=\"gridcell\"][tabindex=\"0\"]") ?? e.querySelector("input[data-role=\"icon-filter\"]"))?.focus();
	});
}
// node_modules/@untitledui/icons/dist/AlertCircle.mjs
var oi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z" }));
oi.displayName = "AlertCircle";
// node_modules/@untitledui/icons/dist/ArrowDown.mjs
var si = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 5v14m0 0 7-7m-7 7-7-7" }));
si.displayName = "ArrowDown";
// node_modules/@untitledui/icons/dist/ArrowLeft.mjs
var ci = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M19 12H5m0 0 7 7m-7-7 7-7" }));
ci.displayName = "ArrowLeft";
// node_modules/@untitledui/icons/dist/ArrowRight.mjs
var li = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M5 12h14m0 0-7-7m7 7-7 7" }));
li.displayName = "ArrowRight";
// node_modules/@untitledui/icons/dist/ArrowUp.mjs
var ui = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 19V5m0 0-7 7m7-7 7 7" }));
ui.displayName = "ArrowUp";
// node_modules/@untitledui/icons/dist/BarChart01.mjs
var di = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M18 20V10m-6 10V4M6 20v-6" }));
di.displayName = "BarChart01";
// node_modules/@untitledui/icons/dist/Bell01.mjs
var fi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M9.354 21c.705.622 1.632 1 2.646 1s1.94-.378 2.646-1M18 8A6 6 0 1 0 6 8c0 3.09-.78 5.206-1.65 6.605-.735 1.18-1.102 1.771-1.089 1.936.015.182.054.252.2.36.133.099.732.099 1.928.099H18.61c1.196 0 1.795 0 1.927-.098.147-.11.186-.179.2-.361.014-.165-.353-.755-1.088-1.936C18.78 13.206 18 11.09 18 8Z" }));
fi.displayName = "Bell01";
// node_modules/@untitledui/icons/dist/CheckVerified02.mjs
var pi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m9 12 2 2 4.5-4.5m2.401-4.501a2.03 2.03 0 0 0 1.1 1.1l1.744.723a2.033 2.033 0 0 1 1.1 2.656l-.722 1.744a2.03 2.03 0 0 0 0 1.556l.722 1.744a2.033 2.033 0 0 1-1.1 2.656L19 17.901A2.033 2.033 0 0 0 17.9 19l-.723 1.745a2.032 2.032 0 0 1-2.656 1.1l-1.744-.722a2.032 2.032 0 0 0-1.555 0l-1.745.723a2.033 2.033 0 0 1-2.654-1.1L6.1 19.001A2.033 2.033 0 0 0 5 17.9l-1.744-.723a2.033 2.033 0 0 1-1.1-2.654l.721-1.744a2.033 2.033 0 0 0 0-1.556l-.722-1.746a2.033 2.033 0 0 1 1.1-2.657L5 6.098A2.03 2.03 0 0 0 6.1 5l.723-1.745a2.033 2.033 0 0 1 2.656-1.1l1.744.722a2.033 2.033 0 0 0 1.555-.001l1.746-.72a2.032 2.032 0 0 1 2.655 1.1l.723 1.746v-.003Z" }));
pi.displayName = "CheckVerified02";
// node_modules/@untitledui/icons/dist/Check.mjs
var mi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M20 6 9 17l-5-5" }));
mi.displayName = "Check";
// node_modules/@untitledui/icons/dist/ChevronDown.mjs
var hi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m6 9 6 6 6-6" }));
hi.displayName = "ChevronDown";
// node_modules/@untitledui/icons/dist/ChevronLeft.mjs
var gi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m15 18-6-6 6-6" }));
gi.displayName = "ChevronLeft";
// node_modules/@untitledui/icons/dist/ChevronRight.mjs
var _i = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m9 18 6-6-6-6" }));
_i.displayName = "ChevronRight";
// node_modules/@untitledui/icons/dist/ChevronUp.mjs
var vi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m18 15-6-6-6 6" }));
vi.displayName = "ChevronUp";
// node_modules/@untitledui/icons/dist/Clock.mjs
var yi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 6v6l4 2m6-2c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z" }));
yi.displayName = "Clock";
// node_modules/@untitledui/icons/dist/Command.mjs
var bi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M9 9V6a3 3 0 1 0-3 3h3Zm0 0v6m0-6h6m-6 6v3a3 3 0 1 1-3-3h3Zm0 0h6m0 0h3a3 3 0 1 1-3 3v-3Zm0 0V9m0 0V6a3 3 0 1 1 3 3h-3Z" }));
bi.displayName = "Command";
// node_modules/@untitledui/icons/dist/Copy01.mjs
var xi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M5 15c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C2 13.398 2 12.932 2 12V5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 2 4.08 2 5.2 2H12c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C15 3.602 15 4.068 15 5m-2.8 17h6.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C22 20.48 22 19.92 22 18.8v-6.6c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C20.48 9 19.92 9 18.8 9h-6.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C9 10.52 9 11.08 9 12.2v6.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C10.52 22 11.08 22 12.2 22Z" }));
xi.displayName = "Copy01";
// node_modules/@untitledui/icons/dist/CornerDownLeft.mjs
var Si = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M20 4v1.4c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C15.44 15 13.76 15 10.4 15H4m0 0 5-5m-5 5 5 5" }));
Si.displayName = "CornerDownLeft";
// node_modules/@untitledui/icons/dist/Cube01.mjs
var Ci = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M20.5 7.278 12 12m0 0L3.5 7.278M12 12v9.5m9-5.441V7.942c0-.343 0-.514-.05-.667a1 1 0 0 0-.215-.364c-.109-.119-.258-.202-.558-.368l-7.4-4.111c-.284-.158-.425-.237-.575-.267a1 1 0 0 0-.403 0c-.15.03-.292.11-.576.267l-7.4 4.11c-.3.167-.45.25-.558.369a1 1 0 0 0-.215.364C3 7.428 3 7.599 3 7.942v8.117c0 .342 0 .514.05.666a1 1 0 0 0 .215.364c.109.119.258.202.558.368l7.4 4.111c.284.158.425.237.576.268.133.027.27.027.402 0 .15-.031.292-.11.576-.268l7.4-4.11c.3-.167.45-.25.558-.369a.999.999 0 0 0 .215-.364c.05-.152.05-.324.05-.666Z" }));
Ci.displayName = "Cube01";
// node_modules/@untitledui/icons/dist/DotsGrid.mjs
var wi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7-14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" }));
wi.displayName = "DotsGrid";
// node_modules/@untitledui/icons/dist/DotsVertical.mjs
var Ti = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0-7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" }));
Ti.displayName = "DotsVertical";
// node_modules/@untitledui/icons/dist/Download01.mjs
var Ei = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M21 15v1.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V15m14-5-5 5m0 0-5-5m5 5V3" }));
Ei.displayName = "Download01";
// node_modules/@untitledui/icons/dist/EyeOff.mjs
var Di = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M10.743 5.092C11.149 5.032 11.569 5 12 5c5.105 0 8.455 4.505 9.58 6.287.137.215.205.323.243.49a1.16 1.16 0 0 1 0 .447c-.038.166-.107.274-.244.492-.3.474-.757 1.141-1.363 1.865M6.724 6.715c-2.162 1.467-3.63 3.504-4.303 4.57-.137.217-.205.325-.243.492a1.173 1.173 0 0 0 0 .446c.038.167.106.274.242.49C3.546 14.495 6.895 19 12 19c2.059 0 3.832-.732 5.289-1.723M3 3l18 18M9.88 9.879a3 3 0 1 0 4.243 4.243" }));
Di.displayName = "EyeOff";
// node_modules/@untitledui/icons/dist/Eye.mjs
var Oi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M2.42 12.713c-.136-.215-.204-.323-.242-.49a1.173 1.173 0 0 1 0-.446c.038-.167.106-.274.242-.49C3.546 9.505 6.895 5 12 5s8.455 4.505 9.58 6.287c.137.215.205.323.243.49.029.125.029.322 0 .446-.038.167-.106.274-.242.49C20.455 14.495 17.105 19 12 19c-5.106 0-8.455-4.505-9.58-6.287Z" }), e.createElement("path", { d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" }));
Oi.displayName = "Eye";
// node_modules/@untitledui/icons/dist/Folder.mjs
var ki = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m13 7-1.116-2.231c-.32-.642-.481-.963-.72-1.198a2 2 0 0 0-.748-.462C10.1 3 9.74 3 9.022 3H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 4.52 2 5.08 2 6.2V7m0 0h15.2c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C22 9.28 22 10.12 22 11.8v4.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C19.72 21 18.88 21 17.2 21H6.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C2 18.72 2 17.88 2 16.2V7Z" }));
ki.displayName = "Folder";
// node_modules/@untitledui/icons/dist/Globe01.mjs
var Ai = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M2 12h20M2 12c0 5.523 4.477 10 10 10M2 12C2 6.477 6.477 2 12 2m10 10c0 5.523-4.477 10-10 10m10-10c0-5.523-4.477-10-10-10m0 0a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10m0-20a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" }));
Ai.displayName = "Globe01";
// node_modules/@untitledui/icons/dist/Grid01.mjs
var ji = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M8.4 3H4.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C3 3.76 3 4.04 3 4.6v3.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C3.76 10 4.04 10 4.6 10h3.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C10 9.24 10 8.96 10 8.4V4.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C9.24 3 8.96 3 8.4 3Zm11 0h-3.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C14 3.76 14 4.04 14 4.6v3.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C14.76 10 15.04 10 15.6 10h3.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C21 9.24 21 8.96 21 8.4V4.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C20.24 3 19.96 3 19.4 3Zm0 11h-3.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C14 14.76 14 15.04 14 15.6v3.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C14.76 21 15.04 21 15.6 21h3.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C21 20.24 21 19.96 21 19.4v-3.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C20.24 14 19.96 14 19.4 14Zm-11 0H4.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C3 14.76 3 15.04 3 15.6v3.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C3.76 21 4.04 21 4.6 21h3.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C10 20.24 10 19.96 10 19.4v-3.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C9.24 14 8.96 14 8.4 14Z" }));
ji.displayName = "Grid01";
// node_modules/@untitledui/icons/dist/Heart.mjs
var Mi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", {
	clipRule: "evenodd",
	d: "M11.993 5.136c-2-2.338-5.333-2.966-7.838-.826s-2.858 5.719-.89 8.25c1.635 2.105 6.585 6.544 8.207 7.98.182.162.272.242.378.274a.504.504 0 0 0 .286 0c.106-.032.197-.112.378-.273 1.623-1.437 6.573-5.876 8.208-7.98 1.967-2.532 1.658-6.133-.89-8.251-2.549-2.118-5.84-1.512-7.839.826Z"
}));
Mi.displayName = "Heart";
// node_modules/@untitledui/icons/dist/HelpCircle.mjs
var Ni = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z" }));
Ni.displayName = "HelpCircle";
// node_modules/@untitledui/icons/dist/InfoCircle.mjs
var Pi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 16v-4m0-4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z" }));
Pi.displayName = "InfoCircle";
// node_modules/@untitledui/icons/dist/LayersThree01.mjs
var Fi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m2 12 9.642 4.821c.131.066.197.099.266.111.06.012.123.012.184 0 .069-.012.135-.045.266-.11L22 12M2 17l9.642 4.821c.131.066.197.099.266.111.06.012.123.012.184 0 .069-.012.135-.045.266-.11L22 17M2 7l9.642-4.821c.131-.066.197-.098.266-.111a.5.5 0 0 1 .184 0c.069.013.135.045.266.11L22 7l-9.642 4.821a1.028 1.028 0 0 1-.266.111.501.501 0 0 1-.184 0c-.069-.012-.135-.045-.266-.11L2 7Z" }));
Fi.displayName = "LayersThree01";
// node_modules/@untitledui/icons/dist/LayoutBottom.mjs
var Ii = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M3 15h18M7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3Z" }));
Ii.displayName = "LayoutBottom";
// node_modules/@untitledui/icons/dist/LayoutLeft.mjs
var Li = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M9 3v18M7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3Z" }));
Li.displayName = "LayoutLeft";
// node_modules/@untitledui/icons/dist/LayoutRight.mjs
var Ri = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M15 3v18M7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3Z" }));
Ri.displayName = "LayoutRight";
// node_modules/@untitledui/icons/dist/LayoutTop.mjs
var zi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M3 9h18M7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3Z" }));
zi.displayName = "LayoutTop";
// node_modules/@untitledui/icons/dist/Link01.mjs
var Bi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m12.708 18.364-1.415 1.414a5 5 0 1 1-7.07-7.07l1.413-1.415m12.728 1.414 1.415-1.414a5 5 0 0 0-7.071-7.071l-1.415 1.414M8.5 15.5l7-7" }));
Bi.displayName = "Link01";
// node_modules/@untitledui/icons/dist/List.mjs
var Vi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M21 12H9m12-6H9m12 12H9m-4-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" }));
Vi.displayName = "List";
// node_modules/@untitledui/icons/dist/Maximize01.mjs
var Hi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m14 10 7-7m0 0h-6m6 0v6m-11 5-7 7m0 0h6m-6 0v-6" }));
Hi.displayName = "Maximize01";
// node_modules/@untitledui/icons/dist/Minimize01.mjs
var Ui = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M4 14h6m0 0v6m0-6-7 7m17-11h-6m0 0V4m0 6 7-7" }));
Ui.displayName = "Minimize01";
// node_modules/@untitledui/icons/dist/Moon01.mjs
var Wi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M22 15.844a10.424 10.424 0 0 1-4.306.925c-5.779 0-10.463-4.684-10.463-10.462 0-1.536.33-2.994.925-4.307A10.464 10.464 0 0 0 2 11.538C2 17.316 6.684 22 12.462 22c4.243 0 7.896-2.526 9.538-6.156Z" }));
Wi.displayName = "Moon01";
// node_modules/@untitledui/icons/dist/Package.mjs
var Gi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M20.5 7.278 12 12m0 0L3.5 7.278M12 12v9.5m9-5.441V7.942c0-.343 0-.514-.05-.667a1 1 0 0 0-.215-.364c-.109-.119-.258-.202-.558-.368l-7.4-4.111c-.284-.158-.425-.237-.575-.267a1 1 0 0 0-.403 0c-.15.03-.292.11-.576.267l-7.4 4.11c-.3.167-.45.25-.558.369a1 1 0 0 0-.215.364C3 7.428 3 7.599 3 7.942v8.117c0 .342 0 .514.05.666a1 1 0 0 0 .215.364c.109.119.258.202.558.368l7.4 4.111c.284.158.425.237.576.268.133.027.27.027.402 0 .15-.031.292-.11.576-.268l7.4-4.11c.3-.167.45-.25.558-.369a.999.999 0 0 0 .215-.364c.05-.152.05-.324.05-.666ZM16.5 9.5l-9-5" }));
Gi.displayName = "Package";
// node_modules/@untitledui/icons/dist/Palette.mjs
var Ki = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M2 12c0 5.523 4.477 10 10 10a3 3 0 0 0 3-3v-.5c0-.464 0-.697.026-.892a3 3 0 0 1 2.582-2.582c.195-.026.428-.026.892-.026h.5a3 3 0 0 0 3-3c0-5.523-4.477-10-10-10S2 6.477 2 12Z" }), e.createElement("path", { d: "M7 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-6-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" }));
Ki.displayName = "Palette";
// node_modules/@untitledui/icons/dist/PauseCircle.mjs
var qi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M9.5 15V9m5 6V9m7.5 3c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z" }));
qi.displayName = "PauseCircle";
// node_modules/@untitledui/icons/dist/PlayCircle.mjs
var Ji = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" }), e.createElement("path", { d: "M9.5 8.965c0-.477 0-.716.1-.849a.5.5 0 0 1 .364-.199c.166-.012.367.117.769.375l4.72 3.035c.349.224.523.336.583.478a.5.5 0 0 1 0 .39c-.06.142-.234.254-.583.478l-4.72 3.035c-.402.258-.603.387-.769.375a.5.5 0 0 1-.364-.2c-.1-.132-.1-.371-.1-.848v-6.07Z" }));
Ji.displayName = "PlayCircle";
// node_modules/@untitledui/icons/dist/Plus.mjs
var Yi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 5v14m-7-7h14" }));
Yi.displayName = "Plus";
// node_modules/@untitledui/icons/dist/RefreshCw01.mjs
var Xi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M21 10s-2.005-2.732-3.634-4.362a9 9 0 1 0 2.282 8.862M21 10V4m0 6h-6" }));
Xi.displayName = "RefreshCw01";
// node_modules/@untitledui/icons/dist/SearchLg.mjs
var Zi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m21 21-3.5-3.5m2.5-6a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" }));
Zi.displayName = "SearchLg";
// node_modules/@untitledui/icons/dist/SearchMd.mjs
var Qi = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" }));
Qi.displayName = "SearchMd";
// node_modules/@untitledui/icons/dist/Settings01.mjs
var $i = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" }), e.createElement("path", { d: "M18.727 14.727a1.5 1.5 0 0 0 .3 1.655l.055.054a1.816 1.816 0 0 1 0 2.573 1.818 1.818 0 0 1-2.573 0l-.055-.055a1.5 1.5 0 0 0-1.654-.3 1.5 1.5 0 0 0-.91 1.373v.155a1.818 1.818 0 1 1-3.636 0V20.1a1.5 1.5 0 0 0-.981-1.373 1.5 1.5 0 0 0-1.655.3l-.054.055a1.818 1.818 0 0 1-3.106-1.287 1.818 1.818 0 0 1 .533-1.286l.054-.055a1.5 1.5 0 0 0 .3-1.654 1.5 1.5 0 0 0-1.372-.91h-.155a1.818 1.818 0 1 1 0-3.636H3.9a1.5 1.5 0 0 0 1.373-.981 1.5 1.5 0 0 0-.3-1.655l-.055-.054A1.818 1.818 0 1 1 7.491 4.99l.054.054a1.5 1.5 0 0 0 1.655.3h.073a1.5 1.5 0 0 0 .909-1.372v-.155a1.818 1.818 0 0 1 3.636 0V3.9a1.499 1.499 0 0 0 .91 1.373 1.5 1.5 0 0 0 1.654-.3l.054-.055a1.817 1.817 0 0 1 2.573 0 1.819 1.819 0 0 1 0 2.573l-.055.054a1.5 1.5 0 0 0-.3 1.655v.073a1.5 1.5 0 0 0 1.373.909h.155a1.818 1.818 0 0 1 0 3.636H20.1a1.499 1.499 0 0 0-1.373.91Z" }));
$i.displayName = "Settings01";
// node_modules/@untitledui/icons/dist/Sliders01.mjs
var ea = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M5 21v-7m0-4V3m7 18v-9m0-4V3m7 18v-5m0-4V3M2 14h6m1-6h6m1 8h6" }));
ea.displayName = "Sliders01";
// node_modules/@untitledui/icons/dist/Stars01.mjs
var ta = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "m6.5 13 .784 1.569c.266.53.399.796.576 1.026a3 3 0 0 0 .545.545c.23.177.495.31 1.026.575L11 17.5l-1.569.785c-.53.265-.796.398-1.026.575a3 3 0 0 0-.545.545c-.177.23-.31.495-.576 1.026L6.5 22l-.784-1.569c-.266-.53-.399-.796-.576-1.026a3 3 0 0 0-.545-.545c-.23-.177-.495-.31-1.026-.575L2 17.5l1.569-.785c.53-.265.796-.398 1.026-.575a3 3 0 0 0 .545-.545c.177-.23.31-.495.576-1.026L6.5 13ZM15 2l1.179 3.064c.282.734.423 1.1.642 1.409a3 3 0 0 0 .706.706c.309.22.675.36 1.409.642L22 9l-3.064 1.179c-.734.282-1.1.423-1.409.642a3 3 0 0 0-.706.706c-.22.309-.36.675-.642 1.409L15 16l-1.179-3.064c-.282-.734-.423-1.1-.642-1.409a3 3 0 0 0-.706-.706c-.309-.22-.675-.36-1.409-.642L8 9l3.064-1.179c.734-.282 1.1-.423 1.409-.642a3 3 0 0 0 .706-.706c.22-.309.36-.675.642-1.409L15 2Z" }));
ta.displayName = "Stars01";
// node_modules/@untitledui/icons/dist/Sun.mjs
var na = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M12 2v2m0 16v2M4 12H2m4.314-5.686L4.9 4.9m12.786 1.414L19.1 4.9M6.314 17.69 4.9 19.104m12.786-1.414 1.414 1.414M22 12h-2m-3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z" }));
na.displayName = "Sun";
// node_modules/@untitledui/icons/dist/Trash01.mjs
var ra = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M16 6v-.8c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C14.48 2 13.92 2 12.8 2h-1.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C8 3.52 8 4.08 8 5.2V6m2 5.5v5m4-5v5M3 6h18m-2 0v11.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C16.72 22 15.88 22 14.2 22H9.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C5 19.72 5 18.88 5 17.2V6" }));
ra.displayName = "Trash01";
// node_modules/@untitledui/icons/dist/Type01.mjs
var ia = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M4 7c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C5.602 4 6.068 4 7 4h10c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C20 5.602 20 6.068 20 7M9 20h6M12 4v16" }));
ia.displayName = "Type01";
// node_modules/@untitledui/icons/dist/User01.mjs
var aa = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M20 21c0-1.396 0-2.093-.172-2.661a4 4 0 0 0-2.667-2.667c-.568-.172-1.265-.172-2.661-.172h-5c-1.396 0-2.093 0-2.661.172a4 4 0 0 0-2.667 2.667C4 18.907 4 19.604 4 21M16.5 7.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" }));
aa.displayName = "User01";
// node_modules/@untitledui/icons/dist/X.mjs
var oa = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M17 7 7 17M7 7l10 10" }));
oa.displayName = "X";
// node_modules/@untitledui/icons/dist/Zap.mjs
var sa = ({ size: t = 24, color: n = "currentColor", ...r }) => e.createElement("svg", {
	viewBox: "0 0 24 24",
	width: t,
	height: t,
	stroke: n,
	strokeWidth: "2",
	fill: "none",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true",
	...r
}, e.createElement("path", { d: "M13 2 4.093 12.688c-.348.418-.523.628-.525.804a.5.5 0 0 0 .185.397c.138.111.41.111.955.111H12l-1 8 8.907-10.688c.348-.418.523-.628.525-.804a.5.5 0 0 0-.185-.397c-.138-.111-.41-.111-.955-.111H12l1-8Z" }));
sa.displayName = "Zap";
// src/core/SvgFidelity.ts
function ca(e) {
	return e ? /^(https?:)?\//.test(e) ? e : `${"/".replace(/\/$/, "")}/${e.replace(/^\//, "")}` : "";
}
function la(e) {
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`;
}
var ua = class {
	url(e) {
		return e.svgUrl ? ca(e.svgUrl) : e.svgContent ? la(e.svgContent) : "";
	}
	resolve(e, t) {
		let n = this.url(e);
		return e.ownColor ? {
			kind: "image",
			url: n
		} : {
			kind: "mask",
			url: n,
			color: t ?? "currentColor"
		};
	}
	toStyle(e, t) {
		let n = {
			width: `${t}px`,
			height: `${t}px`
		};
		return e.kind === "image" ? {
			...n,
			backgroundImage: `url("${e.url}")`,
			backgroundSize: "contain",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center"
		} : {
			...n,
			backgroundColor: e.color,
			maskImage: `url("${e.url}")`,
			maskSize: "contain",
			maskRepeat: "no-repeat",
			maskPosition: "center",
			WebkitMaskImage: `url("${e.url}")`,
			WebkitMaskSize: "contain",
			WebkitMaskRepeat: "no-repeat",
			WebkitMaskPosition: "center"
		};
	}
}, da = new ua(), fa = {
	"alert-circle": oi,
	"bell-filled": fi,
	check: mi,
	"chevron-down": hi,
	"chevron-left": gi,
	"chevron-right": _i,
	"chevron-up": vi,
	clock: yi,
	close: oa,
	command: bi,
	copy: xi,
	cube: Ci,
	download: Ei,
	eye: Oi,
	folder: ki,
	globe: Ai,
	grid: ji,
	heart: Mi,
	"heart-filled": Mi,
	info: Pi,
	layers: Fi,
	link: Bi,
	list: Vi,
	minimize: Ui,
	moon: Wi,
	package: Gi,
	palette: Ki,
	pause: qi,
	play: Ji,
	plus: Yi,
	refresh: Xi,
	resize: Hi,
	search: Qi,
	settings: $i,
	sliders: ea,
	"sort-asc": ui,
	"sort-desc": si,
	sparkles: ta,
	stats: di,
	sun: na,
	text: ia,
	trash: ra,
	zap: sa
}, pa = /* @__PURE__ */ new Set(["bell-filled", "heart-filled"]);
function K({ name: e, size: t = 14, color: n, style: r, className: i }) {
	let a = fa[e];
	return a ? /* @__PURE__ */ C(a, {
		"aria-hidden": !0,
		size: t,
		color: n ?? "currentColor",
		...pa.has(e) ? { fill: "currentColor" } : null,
		className: i,
		style: {
			flex: "none",
			...r
		}
	}) : /* @__PURE__ */ C("span", {
		"aria-hidden": !0,
		style: {
			display: "inline-block",
			width: t,
			height: t,
			flex: "none",
			...r
		}
	});
}
// src/hooks/useT.ts
function q() {
	let e = G((e) => e.locale), t = G((e) => e.translationOverrides), n = d(() => Ut(e, t), [e, t]);
	return o((e, t) => n.t(e, t), [n]);
}
// node_modules/tailwind-merge/dist/bundle-mjs.mjs
var ma = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, ha = (e, t) => ({
	classGroupId: e,
	validator: t
}), ga = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), _a = "-", va = [], ya = "arbitrary..", ba = (e) => {
	let t = Ca(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Sa(e);
			let n = e.split(_a);
			return xa(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? ma(i, t) : t : i || va;
			}
			return n[e] || va;
		}
	};
}, xa = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = xa(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(_a) : e.slice(t).join(_a), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Sa = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? ya + r : void 0;
})(), Ca = (e) => {
	let { theme: t, classGroups: n } = e;
	return wa(n, t);
}, wa = (e, t) => {
	let n = ga();
	for (let r in e) {
		let i = e[r];
		Ta(i, n, r, t);
	}
	return n;
}, Ta = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Ea(i, t, n, r);
	}
}, Ea = (e, t, n, r) => {
	typeof e == "string" ? Da(e, t, n) : typeof e == "function" ? Oa(e, t, n, r) : ka(e, t, n, r);
}, Da = (e, t, n) => {
	let r = e === "" ? t : Aa(t, e);
	r.classGroupId = n;
}, Oa = (e, t, n, r) => {
	ja(e) ? Ta(e(r), t, n, r) : (t.validators === null && (t.validators = []), t.validators.push(ha(n, e)));
}, ka = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Ta(o, Aa(t, a), n, r);
	}
}, Aa = (e, t) => {
	let n = e, r = t.split(_a), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = ga(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, ja = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Ma = (e) => {
	if (e < 1) return {
		get: () => void 0,
		set: () => {}
	};
	let t = 0, n = Object.create(null), r = Object.create(null), i = (i, a) => {
		n[i] = a, t++, t > e && (t = 0, r = n, n = Object.create(null));
	};
	return {
		get(e) {
			let t = n[e];
			if (t !== void 0) return t;
			if ((t = r[e]) !== void 0) return i(e, t), t;
		},
		set(e, t) {
			e in n ? n[e] = t : i(e, t);
		}
	};
}, Na = "!", Pa = ":", Fa = [], Ia = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), La = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Pa) {
					t.push(e.slice(i, s)), i = s + 1;
					continue;
				}
				if (o === "/") {
					a = s;
					continue;
				}
			}
			o === "[" ? n++ : o === "]" ? n-- : o === "(" ? r++ : o === ")" && r--;
		}
		let s = t.length === 0 ? e : e.slice(i), c = s, l = !1;
		s.endsWith(Na) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Na) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Ia(t, l, c, u);
	};
	if (t) {
		let e = t + Pa, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Ia(Fa, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Ra = (e) => {
	let t = /* @__PURE__ */ new Map();
	return e.orderSensitiveModifiers.forEach((e, n) => {
		t.set(e, 1e6 + n);
	}), (e) => {
		let n = [], r = [];
		for (let i = 0; i < e.length; i++) {
			let a = e[i], o = a[0] === "[", s = t.has(a);
			o || s ? (r.length > 0 && (r.sort(), n.push(...r), r = []), n.push(a)) : r.push(a);
		}
		return r.length > 0 && (r.sort(), n.push(...r)), n;
	};
}, za = (e) => ({
	cache: Ma(e.cacheSize),
	parseClassName: La(e),
	sortModifiers: Ra(e),
	postfixLookupClassGroupIds: Ba(e),
	...ba(e)
}), Ba = (e) => {
	let t = Object.create(null), n = e.postfixLookupClassGroups;
	if (n) for (let e = 0; e < n.length; e++) t[n[e]] = !0;
	return t;
}, Va = /\s+/, Ha = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a, postfixLookupClassGroupIds: o } = t, s = [], c = e.trim().split(Va), l = "";
	for (let e = c.length - 1; e >= 0; --e) {
		let t = c[e], { isExternal: u, modifiers: d, hasImportantModifier: f, baseClassName: p, maybePostfixModifierPosition: m } = n(t);
		if (u) {
			l = t + (l.length > 0 ? " " + l : l);
			continue;
		}
		let h = !!m, g;
		if (h) {
			g = r(p.substring(0, m));
			let e = g && o[g] ? r(p) : void 0;
			e && e !== g && (g = e, h = !1);
		} else g = r(p);
		if (!g) {
			if (!h || (g = r(p), !g)) {
				l = t + (l.length > 0 ? " " + l : l);
				continue;
			}
			h = !1;
		}
		let _ = d.length === 0 ? "" : d.length === 1 ? d[0] : a(d).join(":"), v = f ? _ + Na : _, y = v + g;
		if (s.indexOf(y) > -1) continue;
		s.push(y);
		let b = i(g, h);
		for (let e = 0; e < b.length; ++e) {
			let t = b[e];
			s.push(v + t);
		}
		l = t + (l.length > 0 ? " " + l : l);
	}
	return l;
}, Ua = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Wa(n)) && (i && (i += " "), i += r);
	return i;
}, Wa = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Wa(e[r])) && (n && (n += " "), n += t);
	return n;
}, Ga = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = za(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Ha(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Ua(...e));
}, Ka = [], qa = (e) => {
	let t = (t) => t[e] || Ka;
	return t.isThemeGetter = !0, t.themeKey = e, t;
}, Ja = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Ya = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Xa = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Za = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Qa = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, $a = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix|color|light-dark)\(.+\)$/, eo = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, to = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, no = (e) => Xa.test(e), J = (e) => !!e && !Number.isNaN(Number(e)), ro = (e) => !!e && Number.isInteger(Number(e)), io = (e) => e.endsWith("%") && J(e.slice(0, -1)), ao = (e) => Za.test(e), oo = () => !0, so = (e) => Qa.test(e) && !$a.test(e), co = () => !1, lo = (e) => eo.test(e), uo = (e) => to.test(e), fo = (e) => !Y(e) && !X(e), po = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), mo = (e) => ko(e, No, co), Y = (e) => Ja.test(e), ho = (e) => ko(e, Po, so), go = (e) => ko(e, Fo, J), _o = (e) => ko(e, Lo, oo), vo = (e) => ko(e, Io, co), yo = (e) => ko(e, jo, co), bo = (e) => ko(e, Mo, uo), xo = (e) => ko(e, Ro, lo), X = (e) => Ya.test(e), So = (e) => Ao(e, Po), Co = (e) => Ao(e, Io), wo = (e) => Ao(e, jo), To = (e) => Ao(e, No), Eo = (e) => Ao(e, Mo), Do = (e) => Ao(e, Ro, !0), Oo = (e) => Ao(e, Lo, !0), ko = (e, t, n) => {
	let r = Ja.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Ao = (e, t, n = !1) => {
	let r = Ya.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, jo = (e) => e === "position" || e === "percentage", Mo = (e) => e === "image" || e === "url", No = (e) => e === "length" || e === "size" || e === "bg-size", Po = (e) => e === "length", Fo = (e) => e === "number", Io = (e) => e === "family-name", Lo = (e) => e === "number" || e === "weight", Ro = (e) => e === "shadow", zo = () => {
	let e = qa("color"), t = qa("font"), n = qa("text"), r = qa("font-weight"), i = qa("tracking"), a = qa("leading"), o = qa("breakpoint"), s = qa("container"), c = qa("spacing"), l = qa("radius"), u = qa("shadow"), d = qa("inset-shadow"), f = qa("text-shadow"), p = qa("drop-shadow"), m = qa("blur"), h = qa("perspective"), g = qa("aspect"), _ = qa("ease"), v = qa("animate"), y = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	], b = () => [
		"center",
		"top",
		"bottom",
		"left",
		"right",
		"top-left",
		"left-top",
		"top-right",
		"right-top",
		"bottom-right",
		"right-bottom",
		"bottom-left",
		"left-bottom"
	], x = () => [
		...b(),
		X,
		Y
	], S = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	], C = () => [
		"auto",
		"contain",
		"none"
	], w = () => [
		X,
		Y,
		c
	], T = () => [
		no,
		"full",
		"auto",
		...w()
	], E = () => [
		ro,
		"none",
		"subgrid",
		X,
		Y
	], D = () => [
		"auto",
		{ span: [
			"full",
			ro,
			X,
			Y
		] },
		ro,
		X,
		Y
	], O = () => [
		ro,
		"auto",
		X,
		Y
	], ee = () => [
		"auto",
		"min",
		"max",
		"fr",
		X,
		Y
	], te = () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline",
		"center-safe",
		"end-safe"
	], k = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], A = () => ["auto", ...w()], j = () => [
		no,
		"auto",
		"full",
		"dvw",
		"dvh",
		"lvw",
		"lvh",
		"svw",
		"svh",
		"min",
		"max",
		"fit",
		...w()
	], M = () => [
		s,
		no,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], N = () => [
		no,
		"screen",
		"full",
		"lh",
		"dvh",
		"lvh",
		"svh",
		"min",
		"max",
		"fit",
		...w()
	], P = () => [
		e,
		X,
		Y
	], F = () => [
		...b(),
		wo,
		yo,
		{ position: [X, Y] }
	], I = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], ne = () => [
		"auto",
		"cover",
		"contain",
		To,
		mo,
		{ size: [X, Y] }
	], re = () => [
		io,
		So,
		ho
	], L = () => [
		"",
		"none",
		"full",
		l,
		X,
		Y
	], R = () => [
		"",
		J,
		So,
		ho
	], z = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], ie = () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	], B = () => [
		J,
		io,
		wo,
		yo
	], ae = () => [
		"",
		"none",
		m,
		X,
		Y
	], oe = () => [
		"none",
		J,
		X,
		Y
	], se = () => [
		"none",
		J,
		X,
		Y
	], ce = () => [
		J,
		X,
		Y
	], le = () => [
		no,
		"full",
		...w()
	];
	return {
		cacheSize: 500,
		theme: {
			animate: [
				"spin",
				"ping",
				"pulse",
				"bounce"
			],
			aspect: ["video"],
			blur: [ao],
			breakpoint: [ao],
			color: [oo],
			container: [ao],
			"drop-shadow": [ao],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [fo],
			"font-weight": [
				"thin",
				"extralight",
				"light",
				"normal",
				"medium",
				"semibold",
				"bold",
				"extrabold",
				"black"
			],
			"inset-shadow": [ao],
			leading: [
				"none",
				"tight",
				"snug",
				"normal",
				"relaxed",
				"loose"
			],
			perspective: [
				"dramatic",
				"near",
				"normal",
				"midrange",
				"distant",
				"none"
			],
			radius: [ao],
			shadow: [ao],
			spacing: ["px", J],
			text: [ao],
			"text-shadow": [ao],
			tracking: [
				"tighter",
				"tight",
				"normal",
				"wide",
				"wider",
				"widest"
			]
		},
		classGroups: {
			aspect: [{ aspect: [
				"auto",
				"square",
				no,
				Y,
				X,
				g
			] }],
			container: ["container"],
			"container-type": [{ "@container": [
				"",
				"normal",
				"size",
				X,
				Y
			] }],
			"container-named": [po],
			columns: [{ columns: [
				J,
				"auto",
				Y,
				X,
				s
			] }],
			"break-after": [{ "break-after": y() }],
			"break-before": [{ "break-before": y() }],
			"break-inside": [{ "break-inside": [
				"auto",
				"avoid",
				"avoid-page",
				"avoid-column"
			] }],
			"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
			box: [{ box: ["border", "content"] }],
			display: [
				"block",
				"inline-block",
				"inline",
				"flex",
				"inline-flex",
				"table",
				"inline-table",
				"table-caption",
				"table-cell",
				"table-column",
				"table-column-group",
				"table-footer-group",
				"table-header-group",
				"table-row-group",
				"table-row",
				"flow-root",
				"grid",
				"inline-grid",
				"contents",
				"list-item",
				"hidden"
			],
			sr: ["sr-only", "not-sr-only"],
			float: [{ float: [
				"right",
				"left",
				"none",
				"start",
				"end"
			] }],
			clear: [{ clear: [
				"left",
				"right",
				"both",
				"none",
				"start",
				"end"
			] }],
			isolation: ["isolate", "isolation-auto"],
			"object-fit": [{ object: [
				"contain",
				"cover",
				"fill",
				"none",
				"scale-down"
			] }],
			"object-position": [{ object: x() }],
			overflow: [{ overflow: S() }],
			"overflow-x": [{ "overflow-x": S() }],
			"overflow-y": [{ "overflow-y": S() }],
			overscroll: [{ overscroll: C() }],
			"overscroll-x": [{ "overscroll-x": C() }],
			"overscroll-y": [{ "overscroll-y": C() }],
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			inset: [{ inset: T() }],
			"inset-x": [{ "inset-x": T() }],
			"inset-y": [{ "inset-y": T() }],
			start: [{
				"inset-s": T(),
				start: T()
			}],
			end: [{
				"inset-e": T(),
				end: T()
			}],
			"inset-bs": [{ "inset-bs": T() }],
			"inset-be": [{ "inset-be": T() }],
			top: [{ top: T() }],
			right: [{ right: T() }],
			bottom: [{ bottom: T() }],
			left: [{ left: T() }],
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			z: [{ z: [
				ro,
				"auto",
				X,
				Y
			] }],
			basis: [{ basis: [
				no,
				"full",
				"auto",
				s,
				...w()
			] }],
			"flex-direction": [{ flex: [
				"row",
				"row-reverse",
				"col",
				"col-reverse"
			] }],
			"flex-wrap": [{ flex: [
				"nowrap",
				"wrap",
				"wrap-reverse"
			] }],
			flex: [{ flex: [
				J,
				no,
				"auto",
				"initial",
				"none",
				Y
			] }],
			grow: [{ grow: [
				"",
				J,
				X,
				Y
			] }],
			shrink: [{ shrink: [
				"",
				J,
				X,
				Y
			] }],
			order: [{ order: [
				ro,
				"first",
				"last",
				"none",
				X,
				Y
			] }],
			"grid-cols": [{ "grid-cols": E() }],
			"col-start-end": [{ col: D() }],
			"col-start": [{ "col-start": O() }],
			"col-end": [{ "col-end": O() }],
			"grid-rows": [{ "grid-rows": E() }],
			"row-start-end": [{ row: D() }],
			"row-start": [{ "row-start": O() }],
			"row-end": [{ "row-end": O() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": ee() }],
			"auto-rows": [{ "auto-rows": ee() }],
			gap: [{ gap: w() }],
			"gap-x": [{ "gap-x": w() }],
			"gap-y": [{ "gap-y": w() }],
			"justify-content": [{ justify: [...te(), "normal"] }],
			"justify-items": [{ "justify-items": [...k(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...k()] }],
			"align-content": [{ content: ["normal", ...te()] }],
			"align-items": [{ items: [...k(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...k(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": te() }],
			"place-items": [{ "place-items": [...k(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...k()] }],
			p: [{ p: w() }],
			px: [{ px: w() }],
			py: [{ py: w() }],
			ps: [{ ps: w() }],
			pe: [{ pe: w() }],
			pbs: [{ pbs: w() }],
			pbe: [{ pbe: w() }],
			pt: [{ pt: w() }],
			pr: [{ pr: w() }],
			pb: [{ pb: w() }],
			pl: [{ pl: w() }],
			m: [{ m: A() }],
			mx: [{ mx: A() }],
			my: [{ my: A() }],
			ms: [{ ms: A() }],
			me: [{ me: A() }],
			mbs: [{ mbs: A() }],
			mbe: [{ mbe: A() }],
			mt: [{ mt: A() }],
			mr: [{ mr: A() }],
			mb: [{ mb: A() }],
			ml: [{ ml: A() }],
			"space-x": [{ "space-x": w() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": w() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: j() }],
			"inline-size": [{ inline: ["auto", ...M()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...M()] }],
			"max-inline-size": [{ "max-inline": ["none", ...M()] }],
			"block-size": [{ block: ["auto", ...N()] }],
			"min-block-size": [{ "min-block": ["auto", ...N()] }],
			"max-block-size": [{ "max-block": ["none", ...N()] }],
			w: [{ w: [
				s,
				"screen",
				...j()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...j()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...j()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...j()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...j()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				"none",
				...j()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				So,
				ho
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Oo,
				_o
			] }],
			"font-stretch": [{ "font-stretch": [
				"ultra-condensed",
				"extra-condensed",
				"condensed",
				"semi-condensed",
				"normal",
				"semi-expanded",
				"expanded",
				"extra-expanded",
				"ultra-expanded",
				io,
				Y
			] }],
			"font-family": [{ font: [
				Co,
				vo,
				t
			] }],
			"font-features": [{ "font-features": [Y] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				X,
				Y
			] }],
			"line-clamp": [{ "line-clamp": [
				J,
				"none",
				X,
				go
			] }],
			leading: [{ leading: [
				"none",
				a,
				...w()
			] }],
			"list-image": [{ "list-image": [
				"none",
				X,
				Y
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				X,
				Y
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: P() }],
			"text-color": [{ text: P() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...z(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				J,
				"from-font",
				"auto",
				X,
				ho
			] }],
			"text-decoration-color": [{ decoration: P() }],
			"underline-offset": [{ "underline-offset": [
				J,
				"auto",
				X,
				Y
			] }],
			"text-transform": [
				"uppercase",
				"lowercase",
				"capitalize",
				"normal-case"
			],
			"text-overflow": [
				"truncate",
				"text-ellipsis",
				"text-clip"
			],
			"text-wrap": [{ text: [
				"wrap",
				"nowrap",
				"balance",
				"pretty"
			] }],
			indent: [{ indent: w() }],
			"tab-size": [{ tab: [
				ro,
				X,
				Y
			] }],
			"vertical-align": [{ align: [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super",
				X,
				Y
			] }],
			whitespace: [{ whitespace: [
				"normal",
				"nowrap",
				"pre",
				"pre-line",
				"pre-wrap",
				"break-spaces"
			] }],
			break: [{ break: [
				"normal",
				"words",
				"all",
				"keep"
			] }],
			wrap: [{ wrap: [
				"break-word",
				"anywhere",
				"normal"
			] }],
			hyphens: [{ hyphens: [
				"none",
				"manual",
				"auto"
			] }],
			content: [{ content: [
				"none",
				X,
				Y
			] }],
			"bg-attachment": [{ bg: [
				"fixed",
				"local",
				"scroll"
			] }],
			"bg-clip": [{ "bg-clip": [
				"border",
				"padding",
				"content",
				"text"
			] }],
			"bg-origin": [{ "bg-origin": [
				"border",
				"padding",
				"content"
			] }],
			"bg-position": [{ bg: F() }],
			"bg-repeat": [{ bg: I() }],
			"bg-size": [{ bg: ne() }],
			"bg-image": [{ bg: [
				"none",
				{
					linear: [
						{ to: [
							"t",
							"tr",
							"r",
							"br",
							"b",
							"bl",
							"l",
							"tl"
						] },
						ro,
						X,
						Y
					],
					radial: [
						"",
						X,
						Y
					],
					conic: [
						"",
						ro,
						X,
						Y
					]
				},
				Eo,
				bo
			] }],
			"bg-color": [{ bg: P() }],
			"gradient-from-pos": [{ from: re() }],
			"gradient-via-pos": [{ via: re() }],
			"gradient-to-pos": [{ to: re() }],
			"gradient-from": [{ from: P() }],
			"gradient-via": [{ via: P() }],
			"gradient-to": [{ to: P() }],
			rounded: [{ rounded: L() }],
			"rounded-s": [{ "rounded-s": L() }],
			"rounded-e": [{ "rounded-e": L() }],
			"rounded-t": [{ "rounded-t": L() }],
			"rounded-r": [{ "rounded-r": L() }],
			"rounded-b": [{ "rounded-b": L() }],
			"rounded-l": [{ "rounded-l": L() }],
			"rounded-ss": [{ "rounded-ss": L() }],
			"rounded-se": [{ "rounded-se": L() }],
			"rounded-ee": [{ "rounded-ee": L() }],
			"rounded-es": [{ "rounded-es": L() }],
			"rounded-tl": [{ "rounded-tl": L() }],
			"rounded-tr": [{ "rounded-tr": L() }],
			"rounded-br": [{ "rounded-br": L() }],
			"rounded-bl": [{ "rounded-bl": L() }],
			"border-w": [{ border: R() }],
			"border-w-x": [{ "border-x": R() }],
			"border-w-y": [{ "border-y": R() }],
			"border-w-s": [{ "border-s": R() }],
			"border-w-e": [{ "border-e": R() }],
			"border-w-bs": [{ "border-bs": R() }],
			"border-w-be": [{ "border-be": R() }],
			"border-w-t": [{ "border-t": R() }],
			"border-w-r": [{ "border-r": R() }],
			"border-w-b": [{ "border-b": R() }],
			"border-w-l": [{ "border-l": R() }],
			"divide-x": [{ "divide-x": R() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": R() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...z(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...z(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: P() }],
			"border-color-x": [{ "border-x": P() }],
			"border-color-y": [{ "border-y": P() }],
			"border-color-s": [{ "border-s": P() }],
			"border-color-e": [{ "border-e": P() }],
			"border-color-bs": [{ "border-bs": P() }],
			"border-color-be": [{ "border-be": P() }],
			"border-color-t": [{ "border-t": P() }],
			"border-color-r": [{ "border-r": P() }],
			"border-color-b": [{ "border-b": P() }],
			"border-color-l": [{ "border-l": P() }],
			"divide-color": [{ divide: P() }],
			"outline-style": [{ outline: [
				...z(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				J,
				X,
				Y
			] }],
			"outline-w": [{ outline: [
				"",
				J,
				So,
				ho
			] }],
			"outline-color": [{ outline: P() }],
			shadow: [{ shadow: [
				"",
				"inner",
				"none",
				u,
				Do,
				xo
			] }],
			"shadow-color": [{ shadow: P() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Do,
				xo
			] }],
			"inset-shadow-color": [{ "inset-shadow": P() }],
			"ring-w": [{ ring: R() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: P() }],
			"ring-offset-w": [{ "ring-offset": [J, ho] }],
			"ring-offset-color": [{ "ring-offset": P() }],
			"inset-ring-w": [{ "inset-ring": R() }],
			"inset-ring-color": [{ "inset-ring": P() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Do,
				xo
			] }],
			"text-shadow-color": [{ "text-shadow": P() }],
			opacity: [{ opacity: [
				J,
				X,
				Y
			] }],
			"mix-blend": [{ "mix-blend": [
				...ie(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": ie() }],
			"mask-clip": [{ "mask-clip": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }, "mask-no-clip"],
			"mask-composite": [{ mask: [
				"add",
				"subtract",
				"intersect",
				"exclude"
			] }],
			"mask-image-linear-pos": [{ "mask-linear": [J] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": B() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": B() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": P() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": P() }],
			"mask-image-t-from-pos": [{ "mask-t-from": B() }],
			"mask-image-t-to-pos": [{ "mask-t-to": B() }],
			"mask-image-t-from-color": [{ "mask-t-from": P() }],
			"mask-image-t-to-color": [{ "mask-t-to": P() }],
			"mask-image-r-from-pos": [{ "mask-r-from": B() }],
			"mask-image-r-to-pos": [{ "mask-r-to": B() }],
			"mask-image-r-from-color": [{ "mask-r-from": P() }],
			"mask-image-r-to-color": [{ "mask-r-to": P() }],
			"mask-image-b-from-pos": [{ "mask-b-from": B() }],
			"mask-image-b-to-pos": [{ "mask-b-to": B() }],
			"mask-image-b-from-color": [{ "mask-b-from": P() }],
			"mask-image-b-to-color": [{ "mask-b-to": P() }],
			"mask-image-l-from-pos": [{ "mask-l-from": B() }],
			"mask-image-l-to-pos": [{ "mask-l-to": B() }],
			"mask-image-l-from-color": [{ "mask-l-from": P() }],
			"mask-image-l-to-color": [{ "mask-l-to": P() }],
			"mask-image-x-from-pos": [{ "mask-x-from": B() }],
			"mask-image-x-to-pos": [{ "mask-x-to": B() }],
			"mask-image-x-from-color": [{ "mask-x-from": P() }],
			"mask-image-x-to-color": [{ "mask-x-to": P() }],
			"mask-image-y-from-pos": [{ "mask-y-from": B() }],
			"mask-image-y-to-pos": [{ "mask-y-to": B() }],
			"mask-image-y-from-color": [{ "mask-y-from": P() }],
			"mask-image-y-to-color": [{ "mask-y-to": P() }],
			"mask-image-radial": [{ "mask-radial": [X, Y] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": B() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": B() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": P() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": P() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [J] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": B() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": B() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": P() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": P() }],
			"mask-mode": [{ mask: [
				"alpha",
				"luminance",
				"match"
			] }],
			"mask-origin": [{ "mask-origin": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }],
			"mask-position": [{ mask: F() }],
			"mask-repeat": [{ mask: I() }],
			"mask-size": [{ mask: ne() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				X,
				Y
			] }],
			filter: [{ filter: [
				"",
				"none",
				X,
				Y
			] }],
			blur: [{ blur: ae() }],
			brightness: [{ brightness: [
				J,
				X,
				Y
			] }],
			contrast: [{ contrast: [
				J,
				X,
				Y
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Do,
				xo
			] }],
			"drop-shadow-color": [{ "drop-shadow": P() }],
			grayscale: [{ grayscale: [
				"",
				J,
				X,
				Y
			] }],
			"hue-rotate": [{ "hue-rotate": [
				J,
				X,
				Y
			] }],
			invert: [{ invert: [
				"",
				J,
				X,
				Y
			] }],
			saturate: [{ saturate: [
				J,
				X,
				Y
			] }],
			sepia: [{ sepia: [
				"",
				J,
				X,
				Y
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				X,
				Y
			] }],
			"backdrop-blur": [{ "backdrop-blur": ae() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				J,
				X,
				Y
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				J,
				X,
				Y
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				J,
				X,
				Y
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				J,
				X,
				Y
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				J,
				X,
				Y
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				J,
				X,
				Y
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				J,
				X,
				Y
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				J,
				X,
				Y
			] }],
			"border-collapse": [{ border: ["collapse", "separate"] }],
			"border-spacing": [{ "border-spacing": w() }],
			"border-spacing-x": [{ "border-spacing-x": w() }],
			"border-spacing-y": [{ "border-spacing-y": w() }],
			"table-layout": [{ table: ["auto", "fixed"] }],
			caption: [{ caption: ["top", "bottom"] }],
			transition: [{ transition: [
				"",
				"all",
				"colors",
				"opacity",
				"shadow",
				"transform",
				"none",
				X,
				Y
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				J,
				"initial",
				X,
				Y
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				X,
				Y
			] }],
			delay: [{ delay: [
				J,
				X,
				Y
			] }],
			animate: [{ animate: [
				"none",
				v,
				X,
				Y
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				X,
				Y
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: oe() }],
			"rotate-x": [{ "rotate-x": oe() }],
			"rotate-y": [{ "rotate-y": oe() }],
			"rotate-z": [{ "rotate-z": oe() }],
			scale: [{ scale: se() }],
			"scale-x": [{ "scale-x": se() }],
			"scale-y": [{ "scale-y": se() }],
			"scale-z": [{ "scale-z": se() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: ce() }],
			"skew-x": [{ "skew-x": ce() }],
			"skew-y": [{ "skew-y": ce() }],
			transform: [{ transform: [
				X,
				Y,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: le() }],
			"translate-x": [{ "translate-x": le() }],
			"translate-y": [{ "translate-y": le() }],
			"translate-z": [{ "translate-z": le() }],
			"translate-none": ["translate-none"],
			zoom: [{ zoom: [
				ro,
				X,
				Y
			] }],
			accent: [{ accent: P() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: P() }],
			"color-scheme": [{ scheme: [
				"normal",
				"dark",
				"light",
				"light-dark",
				"only-dark",
				"only-light"
			] }],
			cursor: [{ cursor: [
				"auto",
				"default",
				"pointer",
				"wait",
				"text",
				"move",
				"help",
				"not-allowed",
				"none",
				"context-menu",
				"progress",
				"cell",
				"crosshair",
				"vertical-text",
				"alias",
				"copy",
				"no-drop",
				"grab",
				"grabbing",
				"all-scroll",
				"col-resize",
				"row-resize",
				"n-resize",
				"e-resize",
				"s-resize",
				"w-resize",
				"ne-resize",
				"nw-resize",
				"se-resize",
				"sw-resize",
				"ew-resize",
				"ns-resize",
				"nesw-resize",
				"nwse-resize",
				"zoom-in",
				"zoom-out",
				X,
				Y
			] }],
			"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
			"pointer-events": [{ "pointer-events": ["auto", "none"] }],
			resize: [{ resize: [
				"none",
				"",
				"y",
				"x"
			] }],
			"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
			"scrollbar-thumb-color": [{ "scrollbar-thumb": P() }],
			"scrollbar-track-color": [{ "scrollbar-track": P() }],
			"scrollbar-gutter": [{ "scrollbar-gutter": [
				"auto",
				"stable",
				"both"
			] }],
			"scrollbar-w": [{ scrollbar: [
				"auto",
				"thin",
				"none"
			] }],
			"scroll-m": [{ "scroll-m": w() }],
			"scroll-mx": [{ "scroll-mx": w() }],
			"scroll-my": [{ "scroll-my": w() }],
			"scroll-ms": [{ "scroll-ms": w() }],
			"scroll-me": [{ "scroll-me": w() }],
			"scroll-mbs": [{ "scroll-mbs": w() }],
			"scroll-mbe": [{ "scroll-mbe": w() }],
			"scroll-mt": [{ "scroll-mt": w() }],
			"scroll-mr": [{ "scroll-mr": w() }],
			"scroll-mb": [{ "scroll-mb": w() }],
			"scroll-ml": [{ "scroll-ml": w() }],
			"scroll-p": [{ "scroll-p": w() }],
			"scroll-px": [{ "scroll-px": w() }],
			"scroll-py": [{ "scroll-py": w() }],
			"scroll-ps": [{ "scroll-ps": w() }],
			"scroll-pe": [{ "scroll-pe": w() }],
			"scroll-pbs": [{ "scroll-pbs": w() }],
			"scroll-pbe": [{ "scroll-pbe": w() }],
			"scroll-pt": [{ "scroll-pt": w() }],
			"scroll-pr": [{ "scroll-pr": w() }],
			"scroll-pb": [{ "scroll-pb": w() }],
			"scroll-pl": [{ "scroll-pl": w() }],
			"snap-align": [{ snap: [
				"start",
				"end",
				"center",
				"align-none"
			] }],
			"snap-stop": [{ snap: ["normal", "always"] }],
			"snap-type": [{ snap: [
				"none",
				"x",
				"y",
				"both"
			] }],
			"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
			touch: [{ touch: [
				"auto",
				"none",
				"manipulation"
			] }],
			"touch-x": [{ "touch-pan": [
				"x",
				"left",
				"right"
			] }],
			"touch-y": [{ "touch-pan": [
				"y",
				"up",
				"down"
			] }],
			"touch-pz": ["touch-pinch-zoom"],
			select: [{ select: [
				"none",
				"text",
				"all",
				"auto"
			] }],
			"will-change": [{ "will-change": [
				"auto",
				"scroll",
				"contents",
				"transform",
				X,
				Y
			] }],
			fill: [{ fill: ["none", ...P()] }],
			"stroke-w": [{ stroke: [
				J,
				So,
				ho,
				go
			] }],
			stroke: [{ stroke: ["none", ...P()] }],
			"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
		},
		conflictingClassGroups: {
			"container-named": ["container-type"],
			overflow: ["overflow-x", "overflow-y"],
			overscroll: ["overscroll-x", "overscroll-y"],
			inset: [
				"inset-x",
				"inset-y",
				"inset-bs",
				"inset-be",
				"start",
				"end",
				"top",
				"right",
				"bottom",
				"left"
			],
			"inset-x": [
				"start",
				"end",
				"right",
				"left"
			],
			"inset-y": [
				"inset-bs",
				"inset-be",
				"top",
				"bottom"
			],
			flex: [
				"basis",
				"grow",
				"shrink"
			],
			gap: ["gap-x", "gap-y"],
			p: [
				"px",
				"py",
				"ps",
				"pe",
				"pbs",
				"pbe",
				"pt",
				"pr",
				"pb",
				"pl"
			],
			px: [
				"ps",
				"pe",
				"pr",
				"pl"
			],
			py: [
				"pbs",
				"pbe",
				"pt",
				"pb"
			],
			m: [
				"mx",
				"my",
				"ms",
				"me",
				"mbs",
				"mbe",
				"mt",
				"mr",
				"mb",
				"ml"
			],
			mx: [
				"ms",
				"me",
				"mr",
				"ml"
			],
			my: [
				"mbs",
				"mbe",
				"mt",
				"mb"
			],
			size: ["w", "h"],
			"font-size": ["leading"],
			"fvn-normal": [
				"fvn-ordinal",
				"fvn-slashed-zero",
				"fvn-figure",
				"fvn-spacing",
				"fvn-fraction"
			],
			"fvn-ordinal": ["fvn-normal"],
			"fvn-slashed-zero": ["fvn-normal"],
			"fvn-figure": ["fvn-normal"],
			"fvn-spacing": ["fvn-normal"],
			"fvn-fraction": ["fvn-normal"],
			"line-clamp": ["display", "overflow"],
			rounded: [
				"rounded-s",
				"rounded-e",
				"rounded-t",
				"rounded-r",
				"rounded-b",
				"rounded-l",
				"rounded-ss",
				"rounded-se",
				"rounded-ee",
				"rounded-es",
				"rounded-tl",
				"rounded-tr",
				"rounded-br",
				"rounded-bl"
			],
			"rounded-s": ["rounded-ss", "rounded-es"],
			"rounded-e": ["rounded-se", "rounded-ee"],
			"rounded-t": ["rounded-tl", "rounded-tr"],
			"rounded-r": ["rounded-tr", "rounded-br"],
			"rounded-b": ["rounded-br", "rounded-bl"],
			"rounded-l": ["rounded-tl", "rounded-bl"],
			"border-spacing": ["border-spacing-x", "border-spacing-y"],
			"border-w": [
				"border-w-x",
				"border-w-y",
				"border-w-s",
				"border-w-e",
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-r",
				"border-w-b",
				"border-w-l"
			],
			"border-w-x": [
				"border-w-s",
				"border-w-e",
				"border-w-r",
				"border-w-l"
			],
			"border-w-y": [
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-b"
			],
			"border-color": [
				"border-color-x",
				"border-color-y",
				"border-color-s",
				"border-color-e",
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-r",
				"border-color-b",
				"border-color-l"
			],
			"border-color-x": [
				"border-color-s",
				"border-color-e",
				"border-color-r",
				"border-color-l"
			],
			"border-color-y": [
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-b"
			],
			translate: [
				"translate-x",
				"translate-y",
				"translate-none"
			],
			"translate-none": [
				"translate",
				"translate-x",
				"translate-y",
				"translate-z"
			],
			"scroll-m": [
				"scroll-mx",
				"scroll-my",
				"scroll-ms",
				"scroll-me",
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mr",
				"scroll-mb",
				"scroll-ml"
			],
			"scroll-mx": [
				"scroll-ms",
				"scroll-me",
				"scroll-mr",
				"scroll-ml"
			],
			"scroll-my": [
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mb"
			],
			"scroll-p": [
				"scroll-px",
				"scroll-py",
				"scroll-ps",
				"scroll-pe",
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pr",
				"scroll-pb",
				"scroll-pl"
			],
			"scroll-px": [
				"scroll-ps",
				"scroll-pe",
				"scroll-pr",
				"scroll-pl"
			],
			"scroll-py": [
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pb"
			],
			touch: [
				"touch-x",
				"touch-y",
				"touch-pz"
			],
			"touch-x": ["touch"],
			"touch-y": ["touch"],
			"touch-pz": ["touch"]
		},
		conflictingClassGroupModifiers: { "font-size": ["leading"] },
		postfixLookupClassGroups: ["container-type"],
		orderSensitiveModifiers: [
			"*",
			"**",
			"after",
			"backdrop",
			"before",
			"details-content",
			"file",
			"first-letter",
			"first-line",
			"marker",
			"placeholder",
			"selection"
		]
	};
}, Bo = (e, { cacheSize: t, prefix: n, experimentalParseClassName: r, extend: i = {}, override: a = {} }) => (Vo(e, "cacheSize", t), Vo(e, "prefix", n), Vo(e, "experimentalParseClassName", r), Ho(e.theme, a.theme), Ho(e.classGroups, a.classGroups), Ho(e.conflictingClassGroups, a.conflictingClassGroups), Ho(e.conflictingClassGroupModifiers, a.conflictingClassGroupModifiers), Vo(e, "postfixLookupClassGroups", a.postfixLookupClassGroups), Vo(e, "orderSensitiveModifiers", a.orderSensitiveModifiers), Uo(e.theme, i.theme), Uo(e.classGroups, i.classGroups), Uo(e.conflictingClassGroups, i.conflictingClassGroups), Uo(e.conflictingClassGroupModifiers, i.conflictingClassGroupModifiers), Wo(e, i, "postfixLookupClassGroups"), Wo(e, i, "orderSensitiveModifiers"), e), Vo = (e, t, n) => {
	n !== void 0 && (e[t] = n);
}, Ho = (e, t) => {
	if (t) for (let n in t) Vo(e, n, t[n]);
}, Uo = (e, t) => {
	if (t) for (let n in t) Wo(e, t, n);
}, Wo = (e, t, n) => {
	let r = t[n];
	r !== void 0 && (e[n] = e[n] ? e[n].concat(r) : r);
}, Z = ((e, ...t) => typeof e == "function" ? Ga(zo, e, ...t) : Ga(() => Bo(zo(), e), ...t))({ extend: { theme: { text: [
	"display-xs",
	"display-sm",
	"display-md",
	"display-lg",
	"display-xl",
	"display-2xl"
] } } });
function Go(e) {
	return e;
}
// src/components/base/input/hint-text.tsx
var Ko = ({ isInvalid: e, className: t, size: n = "md", ...r }) => /* @__PURE__ */ C(Oe, {
	...r,
	slot: e ? "errorMessage" : "description",
	className: Z("text-sm text-tertiary", n === "sm" && "text-xs", "in-data-[input-size=sm]:text-xs", e && "text-error-primary", "group-invalid:text-error-primary", t)
});
Ko.displayName = "HintText";
// src/components/base/tooltip/tooltip.tsx
var qo = ({ title: e, description: t, children: n, arrow: r = !1, delay: i = 300, closeDelay: a = 0, trigger: o, isDisabled: s, isOpen: c, defaultOpen: l, offset: u = 6, crossOffset: d, placement: f = "top", onOpenChange: p, ...m }) => {
	let h = [
		"top left",
		"top end",
		"bottom left",
		"bottom end"
	].includes(f), g = [
		"top right",
		"top start",
		"bottom right",
		"bottom start"
	].includes(f), _ = h ? -12 : g ? 12 : 0;
	return /* @__PURE__ */ w(Ne, {
		trigger: o,
		delay: i,
		closeDelay: a,
		isDisabled: s,
		isOpen: c,
		defaultOpen: l,
		onOpenChange: p,
		children: [n, /* @__PURE__ */ C(Me, {
			...m,
			offset: u,
			placement: f,
			crossOffset: d ?? _,
			className: ({ isEntering: e, isExiting: t }) => Z(e && "ease-out animate-in", t && "ease-in animate-out"),
			children: ({ isEntering: n, isExiting: i }) => /* @__PURE__ */ w("div", {
				className: Z("z-(--z-tooltip) flex max-w-xs origin-(--trigger-anchor-point) flex-col items-start gap-1 rounded-lg bg-primary-solid px-3 shadow-lg will-change-transform", t ? "py-3" : "py-2", n && "ease-out animate-in fade-in zoom-in-95 in-placement-left:slide-in-from-right-0.5 in-placement-right:slide-in-from-left-0.5 in-placement-top:slide-in-from-bottom-0.5 in-placement-bottom:slide-in-from-top-0.5", i && "ease-in animate-out fade-out zoom-out-95 in-placement-left:slide-out-to-right-0.5 in-placement-right:slide-out-to-left-0.5 in-placement-top:slide-out-to-bottom-0.5 in-placement-bottom:slide-out-to-top-0.5"),
				children: [
					/* @__PURE__ */ C("span", {
						className: "text-xs font-semibold text-white",
						children: e
					}),
					t && /* @__PURE__ */ C("span", {
						className: "text-xs font-medium text-tooltip-supporting-text",
						children: t
					}),
					r && /* @__PURE__ */ C(de, { children: /* @__PURE__ */ C("svg", {
						viewBox: "0 0 100 100",
						className: "size-2.5 fill-bg-primary-solid in-placement-left:-rotate-90 in-placement-right:rotate-90 in-placement-top:rotate-0 in-placement-bottom:rotate-180",
						children: /* @__PURE__ */ C("path", { d: "M0,0 L35.858,35.858 Q50,50 64.142,35.858 L100,0 Z" })
					}) })
				]
			})
		})]
	});
}, Jo = ({ children: e, className: t, ...n }) => /* @__PURE__ */ C(E, {
	...n,
	className: (e) => Z("h-max w-max outline-hidden", typeof t == "function" ? t(e) : t),
	children: e
}), Yo = ({ isInvalid: e, isRequired: t, tooltip: n, tooltipDescription: r, className: i, ...a }) => /* @__PURE__ */ w(R, {
	"data-label": "true",
	...a,
	className: Z("flex cursor-default items-center gap-0.5 text-sm font-medium text-secondary", i),
	children: [
		a.children,
		/* @__PURE__ */ C("span", {
			className: Z("hidden text-brand-tertiary", t && "block", t === void 0 && "group-required:block", e && "text-error-primary", e === void 0 && "group-invalid:text-error-primary"),
			children: "*"
		}),
		n && /* @__PURE__ */ C(qo, {
			title: n,
			description: r,
			placement: "top",
			children: /* @__PURE__ */ C(Jo, {
				isDisabled: !1,
				className: "cursor-pointer text-fg-quaternary transition duration-200 hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover",
				children: /* @__PURE__ */ C(Ni, { className: "size-4" })
			})
		})
	]
});
Yo.displayName = "Label";
// src/components/base/input/input.tsx
var Xo = ({ ref: e, tooltip: t, shortcut: n, groupRef: r, size: i = "md", isInvalid: a, isDisabled: o, isRequired: c, icon: l, placeholder: u, passwordToggleLabel: d, wrapperClassName: f, tooltipClassName: m, inputClassName: h, iconClassName: g, type: _ = "text", ...v }) => {
	let [y, b] = p(!1), x = t || a, S = l, T = s(Zo), D = T?.size || i, O = Go({
		sm: {
			root: Z("px-3 py-1.5 text-[13px]/5", S && "pl-9", x && "pr-9"),
			iconLeading: "left-3 size-4 stroke-[2.25px]",
			iconTrailing: "right-3",
			shortcut: "pr-1.5"
		},
		md: {
			root: Z("px-3 py-2 text-md", S && "pl-10", x && "pr-9"),
			iconLeading: "left-3 size-5",
			iconTrailing: "right-3",
			shortcut: "pr-2"
		},
		lg: {
			root: Z("px-3.5 py-2.5 text-md", S && "pl-10.5", x && "pr-9.5"),
			iconLeading: "left-3.5 size-5",
			iconTrailing: "right-3.5",
			shortcut: "pr-2.5"
		}
	});
	return /* @__PURE__ */ w(F, {
		isDisabled: o,
		isInvalid: a,
		ref: r,
		className: ({ isFocusWithin: e, isDisabled: t, isInvalid: n }) => Z("group/input relative flex w-full flex-row place-content-center place-items-center rounded-lg bg-primary shadow-xs ring-1 ring-primary transition-shadow duration-100 ease-linear ring-inset", e && !t && "ring-2 ring-brand", t && "cursor-not-allowed opacity-50", "group-disabled:cursor-not-allowed group-disabled:opacity-50", n && "ring-error_subtle", "group-invalid:ring-error_subtle", n && e && "ring-2 ring-error", e && "group-invalid:ring-2 group-invalid:ring-error", T?.wrapperClassName, f),
		children: [
			l && /* @__PURE__ */ C(l, { className: Z("pointer-events-none absolute text-fg-quaternary", O[D].iconLeading, T?.iconClassName, g) }),
			/* @__PURE__ */ C(L, {
				...v,
				ref: e,
				required: c,
				type: _ === "password" && y ? "text" : _,
				placeholder: u,
				className: Z("m-0 w-full bg-transparent text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary disabled:cursor-not-allowed", O[D].root, T?.inputClassName, h)
			}),
			t && _ !== "password" && /* @__PURE__ */ C(qo, {
				title: t,
				placement: "top",
				children: /* @__PURE__ */ C(Jo, {
					className: Z("absolute cursor-pointer text-fg-quaternary transition duration-100 ease-linear group-invalid/input:hidden hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover", O[D].iconTrailing, T?.tooltipClassName, m),
					children: /* @__PURE__ */ C(Ni, { className: "size-4 stroke-[2.25px]" })
				})
			}),
			_ !== "password" && /* @__PURE__ */ C(Pi, { className: Z("pointer-events-none absolute hidden size-4 stroke-[2.25px] text-fg-error-secondary group-invalid/input:block", O[D].iconTrailing, T?.tooltipClassName, m) }),
			_ === "password" && /* @__PURE__ */ C(E, {
				"aria-label": d ?? "Toggle password visibility",
				onClick: () => b(!y),
				className: Z("absolute -m-1 flex size-6 cursor-pointer items-center justify-center rounded-sm text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover focus-visible:outline-2", O[D].iconTrailing),
				children: C(y ? Di : Oi, { className: "size-4 stroke-[2.25px]" })
			}),
			n && /* @__PURE__ */ C("div", {
				className: Z("pointer-events-none absolute inset-y-0.5 right-0.5 z-10 hidden items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8 md:flex", O[D].shortcut),
				children: /* @__PURE__ */ C("span", {
					"aria-hidden": "true",
					className: "pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset",
					children: typeof n == "string" ? n : "⌘K"
				})
			})
		]
	});
};
Xo.displayName = "InputBase";
var Zo = i({}), Qo = ({ className: e, size: t = "md", inputClassName: n, wrapperClassName: r, iconClassName: i, tooltipClassName: a, ...o }) => /* @__PURE__ */ C(Zo.Provider, {
	value: {
		inputClassName: n,
		wrapperClassName: r,
		iconClassName: i,
		tooltipClassName: a,
		size: t
	},
	children: /* @__PURE__ */ C(ke, {
		...o,
		"data-input-wrapper": !0,
		"data-input-size": t,
		className: (t) => Z("group flex h-max w-full flex-col items-start justify-start gap-1.5", typeof e == "function" ? e(t) : e)
	})
});
Qo.displayName = "TextField";
var $o = ({ size: e = "md", placeholder: t, icon: n, label: r, hint: i, shortcut: a, hideRequiredIndicator: o, className: s, ref: c, groupRef: l, tooltip: u, iconClassName: d, inputClassName: f, passwordToggleLabel: p, wrapperClassName: m, tooltipClassName: h, type: g = "text", ..._ }) => /* @__PURE__ */ C(Qo, {
	"aria-label": r ? void 0 : t,
	..._,
	size: e,
	className: s,
	children: ({ isRequired: s, isInvalid: _ }) => /* @__PURE__ */ w(S, { children: [
		r && /* @__PURE__ */ C(Yo, {
			isRequired: o ? !o : s,
			isInvalid: _,
			children: r
		}),
		/* @__PURE__ */ C(Xo, {
			ref: c,
			groupRef: l,
			size: e,
			placeholder: t,
			icon: n,
			shortcut: a,
			iconClassName: d,
			inputClassName: f,
			passwordToggleLabel: p,
			wrapperClassName: m,
			tooltipClassName: h,
			tooltip: u,
			type: g
		}),
		i && /* @__PURE__ */ C(Ko, {
			isInvalid: _,
			children: i
		})
	] })
});
$o.displayName = "Input";
// src/components/base/avatar/base-components/avatar-online-indicator.tsx
var es = {
	xs: "size-1.5",
	sm: "size-2",
	md: "size-2.5",
	lg: "size-3",
	xl: "size-3.5",
	"2xl": "size-4",
	"3xl": "size-4.5",
	"4xl": "size-5"
}, ts = ({ size: e, status: t, className: n }) => /* @__PURE__ */ C("span", {
	className: Z("absolute right-0 bottom-0 flex justify-center rounded-full ring-[1.5px] ring-bg-primary", t === "online" ? "bg-fg-success-secondary" : "bg-utility-neutral-300", es[e], n),
	style: { backgroundImage: "radial-gradient(43.75% 43.75% at 50% 28.75%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.00) 74.66%, rgba(255, 255, 255, 0.18) 100%), radial-gradient(75% 75% at 50% 0%, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.00) 50%, rgba(255, 255, 255, 0.08) 99%, rgba(255, 255, 255, 0.00) 100%)" },
	children: /* @__PURE__ */ w("svg", {
		viewBox: "0 0 7.2 2.85",
		fill: "none",
		className: "mt-[10%] h-[20%] w-[60%]",
		children: [/* @__PURE__ */ C("path", {
			d: "M7.2 1.83107C7.2 2.84235 5.58823 2.19729 3.6 2.19729C1.61177 2.19729 0 2.84235 0 1.83107C0 0.8198 1.61177 0 3.6 0C5.58823 0 7.2 0.8198 7.2 1.83107Z",
			fill: "url(#reflection-gradient)",
			fillOpacity: "0.4"
		}), /* @__PURE__ */ C("defs", { children: /* @__PURE__ */ w("linearGradient", {
			id: "reflection-gradient",
			x1: "3.6",
			y1: "0",
			x2: "3.6",
			y2: "2.4",
			gradientUnits: "userSpaceOnUse",
			children: [/* @__PURE__ */ C("stop", { stopColor: "white" }), /* @__PURE__ */ C("stop", {
				offset: "1",
				stopColor: "white",
				stopOpacity: "0.1"
			})]
		}) })]
	})
}), ns = {
	xs: "size-2.5",
	sm: "size-3",
	md: "size-3.5",
	lg: "size-4",
	xl: "size-4.5",
	"2xl": "size-5",
	"3xl": "size-6",
	"4xl": "size-8"
}, rs = ({ size: e, className: t }) => /* @__PURE__ */ w("svg", {
	className: Z("z-10 text-utility-blue-500", ns[e], t),
	viewBox: "0 0 10 10",
	fill: "none",
	children: [/* @__PURE__ */ C("path", {
		d: "M7.72237 1.77098C7.81734 2.00068 7.99965 2.18326 8.2292 2.27858L9.03413 2.61199C9.26384 2.70714 9.44635 2.88965 9.5415 3.11936C9.63665 3.34908 9.63665 3.60718 9.5415 3.83689L9.20833 4.64125C9.11313 4.87106 9.113 5.12943 9.20863 5.35913L9.54122 6.16325C9.58839 6.27702 9.61268 6.39897 9.6127 6.52214C9.61272 6.6453 9.58847 6.76726 9.54134 6.88105C9.4942 6.99484 9.42511 7.09823 9.33801 7.18531C9.2509 7.27238 9.14749 7.34144 9.03369 7.38854L8.22934 7.72171C7.99964 7.81669 7.81706 7.99899 7.72174 8.22855L7.38833 9.03348C7.29318 9.26319 7.11067 9.4457 6.88096 9.54085C6.65124 9.636 6.39314 9.636 6.16343 9.54085L5.35907 9.20767C5.12935 9.11276 4.87134 9.11295 4.64177 9.20821L3.83684 9.54115C3.60725 9.63608 3.34937 9.636 3.11984 9.54092C2.89032 9.44585 2.70791 9.26356 2.6127 9.03409L2.27918 8.22892C2.18421 7.99923 2.0019 7.81665 1.77235 7.72133L0.967421 7.38792C0.737807 7.29281 0.555355 7.11041 0.460169 6.88083C0.364983 6.65125 0.364854 6.39327 0.45981 6.16359L0.792984 5.35924C0.8879 5.12952 0.887707 4.87151 0.792445 4.64193L0.459749 3.83642C0.41258 3.72265 0.388291 3.60069 0.388272 3.47753C0.388252 3.35436 0.412501 3.2324 0.459634 3.11861C0.506767 3.00482 0.57586 2.90144 0.662965 2.81436C0.75007 2.72728 0.853479 2.65822 0.967283 2.61113L1.77164 2.27795C2.00113 2.18306 2.1836 2.00099 2.27899 1.7717L2.6124 0.966768C2.70755 0.737054 2.89006 0.554547 3.11978 0.459397C3.34949 0.364246 3.60759 0.364246 3.83731 0.459397L4.64166 0.792571C4.87138 0.887487 5.12939 0.887293 5.35897 0.792031L6.16424 0.459913C6.39392 0.364816 6.65197 0.364836 6.88164 0.459968C7.11131 0.555099 7.29379 0.737554 7.38895 0.967208L7.72247 1.77238L7.72237 1.77098Z",
		className: "fill-current"
	}), /* @__PURE__ */ C("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M6.95829 3.68932C7.02509 3.58439 7.04747 3.45723 7.02051 3.3358C6.99356 3.21437 6.91946 3.10862 6.81454 3.04182C6.70961 2.97502 6.58245 2.95264 6.46102 2.97959C6.33959 3.00655 6.23384 3.08064 6.16704 3.18557L4.33141 6.06995L3.49141 5.01995C3.41375 4.92281 3.30069 4.8605 3.17709 4.84673C3.05349 4.83296 2.92949 4.86885 2.83235 4.94651C2.73522 5.02417 2.67291 5.13723 2.65914 5.26083C2.64536 5.38443 2.68125 5.50843 2.75891 5.60557L4.00891 7.16807C4.0555 7.22638 4.11533 7.27271 4.18344 7.30323C4.25154 7.33375 4.32595 7.34757 4.40047 7.34353C4.47499 7.3395 4.54747 7.31773 4.61188 7.28004C4.67629 7.24234 4.73077 7.18981 4.77079 7.12682L6.95829 3.68932Z",
		fill: "white"
	})]
}), is = ({ count: e, className: t }) => /* @__PURE__ */ C("div", {
	className: Z("absolute right-0 bottom-0 p-px", t),
	children: /* @__PURE__ */ C("div", {
		className: "flex size-3.5 items-center justify-center rounded-full bg-fg-error-primary text-center text-[10px] leading-[13px] font-bold text-white",
		children: e
	})
}), as = {
	xs: {
		root: "size-6",
		rootWithBorder: "p-px",
		initials: "text-xs font-semibold",
		icon: "size-4"
	},
	sm: {
		root: "size-8",
		rootWithBorder: "p-px",
		initials: "text-sm font-semibold",
		icon: "size-5"
	},
	md: {
		root: "size-10",
		rootWithBorder: "p-px",
		initials: "text-md font-semibold",
		icon: "size-6"
	},
	lg: {
		root: "size-12",
		rootWithBorder: "p-[1.5px]",
		initials: "text-lg font-semibold",
		icon: "size-7"
	},
	xl: {
		root: "size-14",
		rootWithBorder: "p-0.5",
		initials: "text-xl font-semibold",
		icon: "size-8"
	},
	"2xl": {
		root: "size-16",
		rootWithBorder: "p-0.5",
		initials: "text-display-xs font-semibold",
		icon: "size-8"
	}
}, os = ({ size: e = "md", src: t, alt: n, initials: r, placeholder: i, placeholderIcon: a, border: o, badge: s, status: c, verified: l, count: u, focusable: d = !1, rounded: f = !0, className: m, contentClassName: h }) => {
	let [g, _] = p(!1), v = t && !g;
	return /* @__PURE__ */ w("div", {
		"data-avatar": !0,
		className: Z("relative inline-flex shrink-0 rounded-[7px]", f && "rounded-full", d && "outline-transparent group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-focus-ring", o && "ring-1 ring-secondary_alt", o && as[e].rootWithBorder, as[e].root, m),
		children: [/* @__PURE__ */ C("div", {
			className: Z("relative inline-flex size-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-tertiary outline-[0.5px] -outline-offset-[0.5px] outline-black/16 before:inset-[0.5px]", f && "rounded-full", v && e !== "xs" && "before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/32 before:mask-[linear-gradient(to_bottom,black_0%,transparent_25%,transparent_75%,black_100%)]", h),
			children: v ? /* @__PURE__ */ C("img", {
				"data-avatar-img": !0,
				className: "size-full object-cover",
				src: t,
				alt: n,
				onError: () => _(!0)
			}) : r ? /* @__PURE__ */ C("span", {
				className: Z("text-quaternary", as[e].initials),
				children: r
			}) : a ? /* @__PURE__ */ C(a, { className: Z("text-fg-quaternary", as[e].icon) }) : i || /* @__PURE__ */ C(aa, { className: Z("text-fg-quaternary", as[e].icon) })
		}), c ? /* @__PURE__ */ C(ts, {
			status: c,
			size: e
		}) : l ? /* @__PURE__ */ C(rs, {
			size: e,
			className: Z("absolute right-0 bottom-0", e === "xs" && "-right-px -bottom-px")
		}) : u ? /* @__PURE__ */ C(is, { count: u }) : s]
	});
}, ss = (e) => typeof e == "function", cs = (e) => typeof e == "function" && e.prototype && (!!e.prototype.isReactComponent || !!e.prototype.render), ls = (e) => typeof e == "object" && !!e && e.$$typeof.toString() === "Symbol(react.forward_ref)", us = (e) => ss(e) || ls(e) || cs(e), ds = (e) => /* @__PURE__ */ C(H, {
	placement: "bottom",
	containerPadding: 0,
	offset: 4,
	...e,
	className: (t) => Z("z-(--z-popover) w-max min-w-(--trigger-width) max-w-[min(24rem,calc(100vw-16px))] origin-(--trigger-anchor-point) overflow-x-hidden overflow-y-auto rounded-lg bg-primary py-1 shadow-lg ring-1 ring-secondary_alt outline-hidden will-change-transform", t.isEntering && "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5", t.isExiting && "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5", e.size === "sm" && "max-h-56!", e.size === "md" && "max-h-64!", e.size === "lg" && "max-h-80!", typeof e.className == "function" ? e.className(t) : e.className)
}), fs = {
	sm: {
		root: "py-1.5 pl-3 pr-2.5 gap-2 *:data-icon:size-4 *:data-icon:stroke-[2.25px]",
		withIcon: "",
		text: "text-[13px]/5",
		textContainer: "gap-x-1.5",
		shortcut: "pr-2.5"
	},
	md: {
		root: "py-2 px-3 gap-2 *:data-icon:size-5",
		withIcon: "",
		text: "text-md",
		textContainer: "gap-x-1.5",
		shortcut: "pr-2.5"
	},
	lg: {
		root: "py-2.5 px-3.5 gap-2 *:data-icon:size-5",
		withIcon: "",
		text: "text-md",
		textContainer: "gap-x-1.5",
		shortcut: "pr-3"
	}
}, ps = i({ size: "md" });
// src/hooks/use-resize-observer.ts
function ms() {
	return window.ResizeObserver !== void 0;
}
function hs(e) {
	let { ref: t, box: n, onResize: r } = e;
	c(() => {
		let e = t?.current;
		if (e) {
			if (ms()) {
				let t = new window.ResizeObserver((e) => {
					e.length && r();
				});
				return t.observe(e, { box: n }), () => {
					e && t.unobserve(e);
				};
			}
			return window.addEventListener("resize", r, !1), () => {
				window.removeEventListener("resize", r, !1);
			};
		}
	}, [
		r,
		t,
		n
	]);
}
// src/components/base/select/combobox.tsx
var gs = ({ size: e, shortcut: t, placeholder: n, shortcutClassName: r, icon: i, ref: o, ...c }) => {
	let l = s(k), u = l?.selectedItem?.value || null, d = l?.inputValue || null, f = d?.split(u?.supportingText)?.[0] || "", p = d?.split(f)[1];
	return /* @__PURE__ */ w(F, {
		ref: o,
		...c,
		className: ({ isFocusWithin: t, isDisabled: n }) => Z("relative flex w-full items-center gap-2 rounded-lg bg-primary shadow-xs ring-1 ring-primary outline-hidden transition-shadow duration-100 ease-linear ring-inset", n && "cursor-not-allowed opacity-50", t && "ring-2 ring-brand", "*:data-icon:shrink-0 *:data-icon:text-fg-quaternary", fs[e].root),
		children: [
			us(i) ? /* @__PURE__ */ C(i, {
				"data-icon": !0,
				className: "pointer-events-none",
				"aria-hidden": "true"
			}) : a(i) ? i : /* @__PURE__ */ C(Zi, {
				"data-icon": !0,
				className: "pointer-events-none",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ w("div", {
				className: "relative flex w-full items-center",
				children: [d && /* @__PURE__ */ w("span", {
					className: Z("absolute top-1/2 z-0 inline-flex w-full -translate-y-1/2 truncate", fs[e].textContainer),
					"aria-hidden": "true",
					children: [/* @__PURE__ */ C("p", {
						className: Z("font-medium text-primary", fs[e].text),
						children: f
					}), p && /* @__PURE__ */ C("p", {
						className: Z("-ml-0.75 text-tertiary", fs[e].text),
						children: p
					})]
				}), /* @__PURE__ */ C(L, {
					placeholder: n,
					className: Z("z-10 w-full appearance-none bg-transparent text-transparent caret-alpha-black/90 placeholder:text-placeholder focus:outline-hidden disabled:cursor-not-allowed", fs[e].text)
				})]
			}),
			t && /* @__PURE__ */ C("div", {
				className: Z("absolute inset-y-0.5 right-0.5 z-10 hidden items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8 md:flex", fs[e].shortcut, r),
				children: /* @__PURE__ */ C("span", {
					className: "pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset",
					"aria-hidden": "true",
					children: "⌘K"
				})
			})
		]
	});
}, _s = ({ placeholder: e = "Search", shortcut: t = !0, size: n = "md", children: r, items: i, shortcutClassName: a, icon: s, hideRequiredIndicator: c, ...l }) => {
	let u = f(null), [d, m] = p(""), h = o(() => {
		if (!u.current) return;
		let e = u.current?.getBoundingClientRect();
		m(e.width + "px");
	}, [u, m]);
	return hs({
		ref: u,
		box: "border-box",
		onResize: h
	}), /* @__PURE__ */ C(ps.Provider, {
		value: { size: n },
		children: /* @__PURE__ */ C(te, {
			menuTrigger: "focus",
			...l,
			children: (o) => /* @__PURE__ */ w("div", {
				className: "flex flex-col gap-1.5",
				children: [
					l.label && /* @__PURE__ */ C(Yo, {
						isRequired: !c && o.isRequired,
						tooltip: l.tooltip,
						children: l.label
					}),
					/* @__PURE__ */ C(gs, {
						ref: u,
						placeholder: e,
						shortcut: t,
						shortcutClassName: a,
						icon: s,
						size: n,
						onFocus: h,
						onPointerEnter: h
					}),
					/* @__PURE__ */ C(ds, {
						size: n,
						triggerRef: u,
						style: { width: d },
						className: l.popoverClassName,
						children: /* @__PURE__ */ C(ie, {
							items: i,
							className: "size-full outline-hidden",
							children: r
						})
					}),
					l.hint && /* @__PURE__ */ C(Ko, {
						isInvalid: o.isInvalid,
						className: Z(n === "sm" && "text-xs"),
						children: l.hint
					})
				]
			})
		})
	});
}, vs = ({ className: e, isSelected: t, isDisabled: n, isIndeterminate: r, size: i = "sm", isFocusVisible: a = !1 }) => /* @__PURE__ */ w("div", {
	className: Z("relative flex size-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded bg-primary ring-1 ring-primary ring-inset", i === "md" && "size-5 rounded-md", (t || r) && "bg-brand-solid ring-brand-solid", n && "cursor-not-allowed opacity-50", n && !(t || r) && "bg-tertiary", a && "outline-2 outline-offset-2 outline-focus-ring", e),
	children: [/* @__PURE__ */ C("svg", {
		"aria-hidden": "true",
		viewBox: "0 0 14 14",
		fill: "none",
		className: Z("pointer-events-none absolute h-3 w-2.5 text-fg-white opacity-0 transition-inherit-all", i === "md" && "size-3.5", r && "opacity-100"),
		children: /* @__PURE__ */ C("path", {
			d: "M2.91675 7H11.0834",
			stroke: "currentColor",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	}), /* @__PURE__ */ C("svg", {
		"aria-hidden": "true",
		viewBox: "0 0 14 14",
		fill: "none",
		className: Z("pointer-events-none absolute size-3 text-fg-white opacity-0 transition-inherit-all", i === "md" && "size-3.5", t && !r && "opacity-100"),
		children: /* @__PURE__ */ C("path", {
			d: "M11.6666 3.5L5.24992 9.91667L2.33325 7",
			stroke: "currentColor",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	})]
});
vs.displayName = "CheckboxBase";
var ys = ({ label: e, hint: t, size: n = "sm", className: r, ...i }) => {
	let a = {
		sm: {
			root: "gap-2",
			textWrapper: "",
			label: "text-sm font-medium",
			hint: "text-sm"
		},
		md: {
			root: "gap-3",
			textWrapper: "gap-0.5",
			label: "text-md font-medium",
			hint: "text-md"
		}
	};
	return /* @__PURE__ */ C(D, {
		...i,
		className: (e) => Z("relative flex items-start", e.isDisabled && "cursor-not-allowed", a[n].root, typeof r == "function" ? r(e) : r),
		children: ({ isSelected: r, isIndeterminate: i, isDisabled: o, isFocusVisible: s }) => /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ C(vs, {
			size: n,
			isSelected: r,
			isIndeterminate: i,
			isDisabled: o,
			isFocusVisible: s,
			className: e || t ? "mt-0.5" : ""
		}), (e || t) && /* @__PURE__ */ w("div", {
			className: Z("inline-flex flex-col", a[n].textWrapper),
			children: [e && /* @__PURE__ */ C("p", {
				className: Z("text-secondary select-none", a[n].label),
				children: e
			}), t && /* @__PURE__ */ C("span", {
				className: Z("text-tertiary", a[n].hint),
				onClick: (e) => e.stopPropagation(),
				children: t
			})]
		})] })
	});
};
ys.displayName = "Checkbox";
// src/components/base/select/select-item.tsx
var bs = {
	sm: {
		root: "px-2 py-1.5 pr-2.5 gap-2 *:data-icon:size-4 *:data-icon:stroke-[2.25px]",
		text: "text-[13px]/5",
		textContainer: "gap-x-1.5",
		check: "size-4 stroke-[2.25px]",
		checkbox: "sm"
	},
	md: {
		root: "p-2 pr-2.5 gap-2 *:data-icon:size-5",
		text: "text-md",
		textContainer: "gap-x-2",
		check: "size-5",
		checkbox: "sm"
	},
	lg: {
		root: "p-2.5 pl-2 gap-2 *:data-icon:size-5",
		text: "text-md",
		textContainer: "gap-x-2",
		check: "size-5",
		checkbox: "md"
	}
}, xs = ({ label: e, id: t, value: n, avatarUrl: r, supportingText: i, isDisabled: o, icon: c, className: l, children: u, selectionIndicator: d = "checkmark", selectionIndicatorAlign: f = "right", ...p }) => {
	let { size: m } = s(ps), h = e || (typeof u == "string" ? u : ""), g = i ? h + " " + i : h, _ = f === "left";
	return /* @__PURE__ */ C(B, {
		id: t,
		value: n ?? {
			id: t,
			label: h,
			avatarUrl: r,
			supportingText: i,
			isDisabled: o,
			icon: c
		},
		textValue: g,
		isDisabled: o,
		...p,
		className: (e) => Z("w-full py-px outline-hidden", m === "sm" ? "px-1" : "px-1.5", typeof l == "function" ? l(e) : l),
		children: (t) => /* @__PURE__ */ w("div", {
			className: Z("flex cursor-pointer items-center rounded-md outline-hidden select-none", (t.isFocused || t.isHovered || t.isSelected && d !== "checkbox") && "bg-primary_hover", t.isDisabled && "cursor-not-allowed opacity-50", t.isFocusVisible && "ring-2 ring-focus-ring ring-inset", "*:data-icon:shrink-0 *:data-icon:text-fg-quaternary", bs[m].root),
			children: [
				_ && d === "checkbox" && /* @__PURE__ */ C(vs, {
					size: bs[m].checkbox,
					isSelected: t.isSelected,
					isDisabled: t.isDisabled
				}),
				r ? /* @__PURE__ */ C(os, {
					"aria-hidden": "true",
					size: "xs",
					src: r,
					alt: e,
					className: Z(m === "sm" && "size-5")
				}) : us(c) ? /* @__PURE__ */ C(c, {
					"data-icon": !0,
					"aria-hidden": "true"
				}) : a(c) ? c : null,
				/* @__PURE__ */ w("div", {
					className: Z("flex w-full min-w-0 flex-1 flex-wrap", bs[m].textContainer),
					children: [/* @__PURE__ */ C(Oe, {
						slot: "label",
						className: Z("truncate font-medium whitespace-nowrap text-primary", bs[m].text),
						children: e || (typeof u == "function" ? u(t) : u)
					}), i && /* @__PURE__ */ C(Oe, {
						slot: "description",
						className: Z("whitespace-nowrap text-tertiary", bs[m].text),
						children: i
					})]
				}),
				t.isSelected && d === "checkmark" && /* @__PURE__ */ C(mi, {
					"aria-hidden": "true",
					className: Z("ml-auto text-fg-brand-primary", bs[m].check)
				}),
				!_ && d === "checkbox" && /* @__PURE__ */ C(vs, {
					size: bs[m].checkbox,
					isSelected: t.isSelected,
					isDisabled: t.isDisabled,
					className: "ml-auto"
				})
			]
		})
	});
}, Ss = ({ isOpen: e, isFocused: t, isDisabled: n, size: r, placeholder: i, icon: o, ref: s }) => /* @__PURE__ */ C(E, {
	ref: s,
	className: Z("relative flex w-full cursor-pointer items-center rounded-lg bg-primary shadow-xs ring-1 ring-primary outline-hidden transition duration-100 ease-linear ring-inset", (t || e) && "ring-2 ring-brand", !n && "hover:bg-primary_hover", n && "cursor-not-allowed opacity-50"),
	children: /* @__PURE__ */ C(ge, {
		className: (e) => Z("flex h-max w-full items-center justify-start truncate text-left align-middle", fs[r].root, (e.selectedItems[0]?.icon || o) && fs[r].withIcon, "*:data-icon:shrink-0 *:data-icon:text-fg-quaternary"),
		children: (e) => {
			let t = e.selectedItems[0], n = t?.icon || o;
			return /* @__PURE__ */ w(S, { children: [
				t?.avatarUrl ? /* @__PURE__ */ C(os, {
					size: "xs",
					src: t.avatarUrl,
					alt: t.label,
					className: Z(r === "sm" && "size-5")
				}) : us(n) ? /* @__PURE__ */ C(n, {
					"data-icon": !0,
					"aria-hidden": "true"
				}) : a(n) ? n : null,
				t ? /* @__PURE__ */ w("section", {
					className: Z("flex w-full truncate", fs[r].textContainer),
					children: [
						/* @__PURE__ */ C("p", {
							className: Z("truncate font-medium text-primary", fs[r].text),
							children: t?.label
						}),
						t?.supportingText && " ",
						t?.supportingText && /* @__PURE__ */ C("p", {
							className: Z("text-tertiary", fs[r].text),
							children: t?.supportingText
						})
					]
				}) : /* @__PURE__ */ C("p", {
					className: Z("text-placeholder", fs[r].text),
					children: i
				}),
				/* @__PURE__ */ C(hi, {
					"aria-hidden": "true",
					className: Z("ml-auto shrink-0 text-fg-quaternary", r === "lg" ? "size-5" : "size-4 stroke-[2.25px]")
				})
			] });
		}
	})
}), Cs = ({ placeholder: e = "Select", icon: t, size: n = "md", children: r, items: i, label: a, hint: o, tooltip: s, hideRequiredIndicator: c, className: l, ...u }) => /* @__PURE__ */ C(ps.Provider, {
	value: { size: n },
	children: /* @__PURE__ */ C(he, {
		...u,
		className: (e) => Z("flex flex-col gap-1.5", typeof l == "function" ? l(e) : l),
		children: (l) => /* @__PURE__ */ w(S, { children: [
			a && /* @__PURE__ */ C(Yo, {
				isRequired: !c && l.isRequired,
				tooltip: s,
				children: a
			}),
			/* @__PURE__ */ C(Ss, {
				...l,
				size: n,
				placeholder: e,
				icon: t
			}),
			/* @__PURE__ */ C(ds, {
				size: n,
				className: u.popoverClassName,
				children: /* @__PURE__ */ C(ie, {
					items: i,
					className: "size-full outline-hidden",
					children: r
				})
			}),
			o && /* @__PURE__ */ C(Ko, {
				isInvalid: l.isInvalid,
				className: Z(n === "sm" && "text-xs"),
				children: o
			})
		] })
	})
});
Cs.ComboBox = _s, Cs.Item = xs;
// src/components/ui/Tooltip.tsx
function ws({ children: e }) {
	return /* @__PURE__ */ C(S, { children: e });
}
function Ts({ content: e, children: t, side: n = "bottom", shortcut: r }) {
	if (!e) return t;
	let i = t.props.disabled === !0;
	return /* @__PURE__ */ C(qo, {
		title: e,
		description: r ? /* @__PURE__ */ C("span", {
			className: "font-mono",
			children: r
		}) : void 0,
		placement: n,
		arrow: !0,
		delay: 350,
		children: /* @__PURE__ */ C(N, {
			isDisabled: i,
			children: t
		})
	});
}
// src/components/ui/Popover.tsx
function Es({ trigger: e, children: t, align: n = "left", drop: r = "down", width: i, panelStyle: a, label: o, tooltip: s }) {
	let [c, l] = p(!1);
	return /* @__PURE__ */ w(j, {
		isOpen: c,
		onOpenChange: l,
		children: [s ? /* @__PURE__ */ C(Ts, {
			content: s,
			children: /* @__PURE__ */ C(fe, { children: e(c, () => {}) })
		}) : /* @__PURE__ */ C(fe, { children: e(c, () => {}) }), /* @__PURE__ */ w(H, {
			placement: `${r === "up" ? "top" : "bottom"} ${n === "right" ? "end" : "start"}`,
			offset: 6,
			containerPadding: 8,
			isNonModal: !0,
			className: "z-(--z-popover)",
			style: {
				width: i,
				fontSize: "var(--app-font, 13.5px)"
			},
			children: [/* @__PURE__ */ C(de, { children: /* @__PURE__ */ C("svg", {
				width: 12,
				height: 6,
				viewBox: "0 0 12 6",
				className: "block group-placement-top:rotate-180",
				children: /* @__PURE__ */ C("path", {
					d: "M0 6 L6 0 L12 6 Z",
					fill: "var(--pop)"
				})
			}) }), /* @__PURE__ */ C(A, {
				"aria-label": o,
				className: "ich-pop outline-hidden",
				style: {
					background: "var(--pop)",
					border: "1px solid var(--border)",
					borderRadius: "min(calc(var(--radius) + 2px), 10px)",
					boxShadow: "var(--shadow-elevated)",
					overflow: "hidden",
					...Ds(a)
				},
				children: ({ close: e }) => /* @__PURE__ */ C("div", {
					className: "max-h-[72vh] overflow-y-auto overscroll-contain touch-pan-y",
					children: t(e)
				})
			})]
		})]
	});
}
function Ds(e) {
	if (!e) return {};
	let { position: t, top: n, right: r, bottom: i, left: a, transform: o, ...s } = e;
	return s;
}
// src/components/ui/controls.ts
var Os = "background-color .12s ease, color .12s ease, border-color .12s ease, transform .12s ease", ks = (e = !1) => ({
	width: 30,
	height: 30,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	border: "none",
	backgroundColor: e ? "var(--accent-soft)" : "var(--ich-hover-bg, transparent)",
	borderRadius: "calc(var(--radius) - 2px)",
	cursor: "pointer",
	color: e ? "var(--accent)" : "var(--ich-hover-fg, var(--muted-fg))",
	flex: "none",
	transition: Os
}), As = {
	height: 28,
	display: "flex",
	alignItems: "center",
	gap: 6,
	padding: "0 9px",
	border: "1px solid var(--ich-hover-border, var(--border))",
	borderRadius: "calc(var(--radius) - 3px)",
	backgroundColor: "var(--ich-hover-bg, var(--bg))",
	cursor: "pointer",
	color: "var(--fg)",
	fontSize: 12,
	transition: Os
}, js = {
	display: "flex",
	alignItems: "center",
	gap: 9,
	width: "100%",
	height: 30,
	padding: "0 8px",
	border: "none",
	backgroundColor: "var(--ich-hover-bg, transparent)",
	borderRadius: "calc(var(--radius) - 3px)",
	cursor: "pointer",
	color: "var(--fg)",
	fontSize: 12.5,
	transition: Os
}, Ms = Go({
	common: {
		root: "group/button-group inline-flex h-max cursor-pointer items-center bg-primary font-semibold whitespace-nowrap text-secondary shadow-skeuomorphic ring-1 ring-primary outline-brand transition duration-100 ease-linear ring-inset hover:bg-primary_hover hover:text-secondary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-secondary/50 disabled:*:opacity-50 selected:bg-primary_hover selected:text-secondary_hover",
		icon: "pointer-events-none text-fg-quaternary transition-[inherit] group-hover/button-group:text-fg-quaternary_hover group-selected/button-group:text-fg-quaternary_hover"
	},
	sizes: {
		sm: {
			root: "gap-1.5 px-3.5 py-2 text-sm not-last:pr-[calc(calc(var(--spacing)*3.5)+1px)] first:rounded-l-lg last:rounded-r-lg data-icon-leading:pl-3 data-icon-only:px-2.5",
			icon: "size-5"
		},
		md: {
			root: "gap-1.5 px-4 py-2.5 text-sm not-last:pr-[calc(calc(var(--spacing)*4)+1px)] first:rounded-l-lg last:rounded-r-lg data-icon-leading:pl-3.5 data-icon-only:px-3",
			icon: "size-5"
		},
		lg: {
			root: "gap-2 px-4.5 py-2.5 text-md not-last:pr-[calc(calc(var(--spacing)*4.5)+1px)] first:rounded-l-lg last:rounded-r-lg data-icon-leading:pl-4 data-icon-only:px-3.5",
			icon: "size-5"
		}
	}
}), Ns = i({ size: "md" }), Ps = ({ iconLeading: e, iconTrailing: t, children: n, className: r, ...i }) => {
	let o = s(Ns);
	if (!o) throw Error("ButtonGroupItem must be used within a ButtonGroup component");
	let { size: c } = o, l = (e || t) && !n;
	return /* @__PURE__ */ w(Ae, {
		...i,
		"data-icon-only": l ? !0 : void 0,
		"data-icon-leading": e ? !0 : void 0,
		className: Z(Ms.common.root, Ms.sizes[c].root, r),
		children: [
			us(e) && /* @__PURE__ */ C(e, { className: Z(Ms.common.icon, Ms.sizes[c].icon) }),
			a(e) && e,
			n,
			us(t) && /* @__PURE__ */ C(t, { className: Z(Ms.common.icon, Ms.sizes[c].icon) }),
			a(t) && t
		]
	});
}, Fs = ({ children: e, size: t = "md", className: n, ...r }) => /* @__PURE__ */ C(Ns.Provider, {
	value: { size: t },
	children: /* @__PURE__ */ C(je, {
		selectionMode: "single",
		className: Z("relative z-0 inline-flex w-max -space-x-px rounded-lg shadow-xs", n),
		...r,
		children: e
	})
});
// src/components/ui/Segmented.tsx
function Is({ label: e, value: t, options: n, onChange: r, className: i, itemClassName: a }) {
	return /* @__PURE__ */ C(Fs, {
		size: "sm",
		"aria-label": e,
		selectedKeys: [t],
		disallowEmptySelection: !0,
		onSelectionChange: (e) => {
			let t = [...e][0];
			t !== void 0 && r(String(t));
		},
		className: Z("flex -space-x-0 gap-0.5 rounded-[calc(var(--radius)_-_2px)] bg-[var(--muted2)] p-0.5 shadow-none ring-1 ring-[var(--border)] ring-inset", i),
		children: n.map((e) => /* @__PURE__ */ C(Ps, {
			id: e.id,
			className: Z("h-[22px] justify-center rounded-[calc(var(--radius)_-_3px)] bg-transparent px-2 py-0 text-[11px] font-medium text-tertiary ring-0 not-last:pr-2 first:rounded-[calc(var(--radius)_-_3px)] last:rounded-[calc(var(--radius)_-_3px)] hover:bg-transparent selected:bg-[var(--pop)] selected:font-semibold selected:text-primary selected:shadow-[var(--shadow)] [&:not([data-selected])]:shadow-none", a),
			children: e.label
		}, e.id))
	});
}
// src/components/base/toggle/toggle.tsx
var Ls = ({ className: e, isHovered: t, isDisabled: n, isFocusVisible: r, isSelected: i, slim: a, size: o = "sm" }) => {
	let s = {
		default: {
			sm: {
				root: "h-5 w-9 p-0.5",
				switch: Z("size-4", i && "translate-x-4")
			},
			md: {
				root: "h-6 w-11 p-0.5",
				switch: Z("size-5", i && "translate-x-5")
			}
		},
		slim: {
			sm: {
				root: "h-4 w-8",
				switch: Z("size-4", i && "translate-x-4")
			},
			md: {
				root: "h-5 w-10",
				switch: Z("size-5", i && "translate-x-5")
			}
		}
	}, c = a ? s.slim[o] : s.default[o];
	return /* @__PURE__ */ C("div", {
		className: Z("cursor-pointer rounded-full bg-tertiary ring-[0.5px] ring-secondary outline-focus-ring transition duration-150 ease-linear ring-inset", i && "bg-brand-solid", i && t && "bg-brand-solid_hover", n && "cursor-not-allowed opacity-50", r && "outline-2 outline-offset-2", a && "ring-1", a && i && "ring-transparent", c.root, e),
		children: /* @__PURE__ */ C("div", {
			style: { transition: "transform 0.15s ease-in-out, translate 0.15s ease-in-out, border-color 0.1s linear, background-color 0.1s linear" },
			className: Z("rounded-full bg-fg-white shadow-sm", a && "shadow-xs", a && "border border-toggle-border", a && i && "border-toggle-slim-border_pressed", a && i && t && "border-toggle-slim-border_pressed-hover", c.switch)
		})
	});
}, Rs = {
	sm: {
		root: "gap-2",
		textWrapper: "",
		label: "text-sm font-medium",
		hint: "text-sm"
	},
	md: {
		root: "gap-3",
		textWrapper: "gap-0.5",
		label: "text-md font-medium",
		hint: "text-md"
	}
}, zs = ({ label: e, hint: t, className: n, size: r = "sm", slim: i, ...a }) => /* @__PURE__ */ C(Se, {
	...a,
	className: (e) => Z("relative flex w-max items-start", e.isDisabled && "cursor-not-allowed", Rs[r].root, typeof n == "function" ? n(e) : n),
	children: ({ isSelected: n, isDisabled: a, isFocusVisible: o, isHovered: s }) => /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ C(Ls, {
		slim: i,
		size: r,
		isHovered: s,
		isDisabled: a,
		isFocusVisible: o,
		isSelected: n,
		className: i ? "mt-0.5" : ""
	}), (e || t) && /* @__PURE__ */ w("div", {
		className: Z("flex flex-col", Rs[r].textWrapper),
		children: [e && /* @__PURE__ */ C("p", {
			className: Z("text-secondary select-none", Rs[r].label),
			children: e
		}), t && /* @__PURE__ */ C("span", {
			className: Z("text-tertiary", Rs[r].hint),
			onClick: (e) => e.stopPropagation(),
			children: t
		})]
	})] })
}), Bs = Go({
	default: "hidden",
	bottom: "absolute top-2 left-1/2 -translate-x-1/2 translate-y-full text-md font-medium text-primary",
	"top-floating": "absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded-lg bg-primary px-2 py-1.5 text-xs font-semibold text-secondary shadow-lg ring-1 ring-secondary_alt"
}), Vs = ({ labelPosition: e = "default", minValue: t = 0, maxValue: n = 100, labelFormatter: r, formatOptions: i, ...a }) => {
	let o = {
		style: "percent",
		maximumFractionDigits: 0
	}, s = !!(a["aria-label"] || a["aria-labelledby"]);
	return /* @__PURE__ */ w(ve, {
		...a,
		minValue: t,
		maxValue: n,
		formatOptions: i ?? o,
		children: [!s && /* @__PURE__ */ C(R, {}), /* @__PURE__ */ C(xe, {
			className: "relative h-6 w-full",
			children: ({ state: { values: t, getThumbValue: n, getThumbPercent: i, getFormattedValue: a } }) => {
				let o = t.length === 1 ? 0 : i(0), s = t.length === 1 ? i(0) : i(1) - o;
				return /* @__PURE__ */ w(S, { children: [
					/* @__PURE__ */ C("span", { className: "absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-quaternary" }),
					/* @__PURE__ */ C("span", {
						className: "absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-brand-solid",
						style: {
							left: `${o * 100}%`,
							width: `${s * 100}%`
						}
					}),
					t.map((t, i) => /* @__PURE__ */ C(be, {
						index: i,
						className: ({ isFocusVisible: e, isDragging: t }) => Z("top-1/2 box-border size-6 cursor-grab rounded-full bg-slider-handle-bg shadow-md ring-2 ring-slider-handle-border ring-inset", e && "outline-2 outline-offset-2 outline-focus-ring", t && "cursor-grabbing"),
						children: /* @__PURE__ */ C(ye, {
							className: Z("whitespace-nowrap", Bs[e]),
							children: r ? r(n(i)) : a(n(i) / 100)
						})
					}, i))
				] });
			}
		})]
	});
}, Hs = {
	display: "flex",
	alignItems: "center",
	gap: 8
}, Us = {
	fontSize: 11.5,
	fontWeight: 550,
	color: "var(--muted-fg)"
};
function Ws() {
	let e = G((e) => e.theme), t = G((e) => e.setTheme), n = G((e) => e.accent), r = G((e) => e.setAccent), i = G((e) => e.radius), a = G((e) => e.setRadius), o = G((e) => e.scale), s = G((e) => e.setScale), c = G((e) => e.density), l = G((e) => e.setDensity), u = G((e) => e.reduceMotion), d = G((e) => e.toggleReduceMotion), f = G((e) => e.showLabels), m = G((e) => e.toggleLabels), h = G((e) => e.adaptMonochrome), g = G((e) => e.toggleAdaptMonochrome), [_, v] = p(n), y = G((e) => e.config?.ui.accentOptions) ?? W.ui.accentOptions, b = G((e) => e.config?.ui.scaleOptions) ?? W.ui.scaleOptions, x = G((e) => e.config?.ranges.radius) ?? W.ranges.radius, S = G((e) => e.locale), T = G((e) => e.setLocale), E = q();
	return /* @__PURE__ */ C(Es, {
		label: E("appearance.title"),
		align: "right",
		width: 250,
		panelStyle: { padding: 12 },
		tooltip: E("appearance.title"),
		trigger: (e, t) => /* @__PURE__ */ C("button", {
			onClick: t,
			"aria-label": E("appearance.title"),
			style: ks(e),
			children: /* @__PURE__ */ C(K, {
				name: "palette",
				color: "currentColor"
			})
		}),
		children: () => /* @__PURE__ */ w("div", {
			className: "flex flex-col gap-[11px]",
			children: [
				/* @__PURE__ */ w("div", {
					style: {
						...Hs,
						gap: 7,
						paddingBottom: 2,
						borderBottom: "1px solid var(--border)"
					},
					children: [
						/* @__PURE__ */ C(K, {
							name: "palette",
							size: 12,
							color: "var(--accent-text)"
						}),
						/* @__PURE__ */ C("span", {
							className: "text-[12px] font-[650]",
							children: E("appearance.title")
						}),
						/* @__PURE__ */ C("span", {
							className: "text-[10px] text-[var(--faint-fg)]",
							children: E("appearance.subtitle")
						})
					]
				}),
				/* @__PURE__ */ w("div", {
					style: {
						...Hs,
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ C("span", {
						style: Us,
						children: E("appearance.theme")
					}), /* @__PURE__ */ C(Is, {
						label: E("appearance.theme"),
						value: e,
						onChange: t,
						options: [{
							id: "light",
							label: E("appearance.light")
						}, {
							id: "dark",
							label: E("appearance.dark")
						}]
					})]
				}),
				/* @__PURE__ */ w("div", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ C("span", {
							style: Us,
							children: E("appearance.brandAccent")
						}),
						/* @__PURE__ */ C("div", {
							className: "flex gap-[5px]",
							children: y.map((e) => /* @__PURE__ */ C("button", {
								onClick: () => {
									r(e), v(e);
								},
								title: e,
								"aria-label": e,
								"aria-pressed": n.toLowerCase() === e,
								style: {
									width: 22,
									height: 22,
									borderRadius: "50%",
									background: e,
									border: n.toLowerCase() === e ? "2px solid var(--fg)" : "2px solid transparent",
									cursor: "pointer"
								}
							}, e))
						}),
						/* @__PURE__ */ w("div", {
							style: {
								...Hs,
								gap: 6,
								marginTop: 6
							},
							children: [
								/* @__PURE__ */ C("span", {
									className: "text-[10.5px] text-[var(--muted-fg)] flex-none",
									children: E("appearance.customHex")
								}),
								/* @__PURE__ */ C($o, {
									size: "sm",
									value: _,
									onChange: (e) => {
										v(e), Ke(e) && r(e);
									},
									placeholder: "#7c3aed",
									"aria-label": E("appearance.customHex"),
									inputClassName: "font-mono",
									className: "min-w-0 flex-1"
								}),
								/* @__PURE__ */ C("span", { style: {
									width: 16,
									height: 16,
									borderRadius: 5,
									background: n,
									flex: "none"
								} })
							]
						})
					]
				}),
				/* @__PURE__ */ w("div", {
					style: Hs,
					children: [
						/* @__PURE__ */ C("span", {
							style: Us,
							children: E("appearance.radius")
						}),
						/* @__PURE__ */ C("div", {
							className: "flex-1",
							children: /* @__PURE__ */ C(Vs, {
								minValue: x.min,
								maxValue: x.max,
								value: i,
								onChange: (e) => a(e),
								"aria-label": E("appearance.radius"),
								formatOptions: { style: "decimal" }
							})
						}),
						/* @__PURE__ */ w("span", {
							className: "font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--muted-fg)] w-[30px]",
							children: [i, "px"]
						})
					]
				}),
				/* @__PURE__ */ w("div", {
					style: Hs,
					children: [
						/* @__PURE__ */ C("span", {
							style: Us,
							children: E("appearance.size")
						}),
						/* @__PURE__ */ C("span", { className: "flex-1" }),
						/* @__PURE__ */ C(Is, {
							label: E("appearance.size"),
							value: o,
							onChange: s,
							options: b.map((e) => ({
								id: e.id,
								label: e.label
							}))
						})
					]
				}),
				/* @__PURE__ */ w("div", {
					style: Hs,
					children: [
						/* @__PURE__ */ C("span", {
							style: Us,
							children: E("appearance.density")
						}),
						/* @__PURE__ */ C("span", { className: "flex-1" }),
						/* @__PURE__ */ C(Is, {
							label: E("appearance.density"),
							value: c,
							onChange: l,
							options: [{
								id: "compact",
								label: E("appearance.compact")
							}, {
								id: "comfy",
								label: E("appearance.comfy")
							}]
						})
					]
				}),
				/* @__PURE__ */ w("div", {
					style: Hs,
					children: [
						/* @__PURE__ */ C("span", {
							style: Us,
							children: E("appearance.language")
						}),
						/* @__PURE__ */ C("span", { className: "flex-1" }),
						/* @__PURE__ */ C(Cs, {
							size: "sm",
							"aria-label": E("appearance.language"),
							items: Rt.map((e) => ({
								id: e.code,
								label: e.label
							})),
							selectedKey: S,
							onSelectionChange: (e) => T(e),
							className: "w-32",
							children: (e) => /* @__PURE__ */ C(Cs.Item, { ...e })
						})
					]
				}),
				/* @__PURE__ */ C(Gs, {
					label: E("appearance.reduceMotion"),
					on: u,
					onToggle: d
				}),
				/* @__PURE__ */ C(Gs, {
					label: E("appearance.iconLabels"),
					on: f,
					onToggle: m
				}),
				/* @__PURE__ */ C(Gs, {
					label: E("appearance.adaptMono"),
					on: h,
					onToggle: g
				}),
				/* @__PURE__ */ C("div", {
					className: "text-[10px] text-[var(--faint-fg)] leading-[1.45]",
					children: E("appearance.footer")
				})
			]
		})
	});
}
function Gs({ label: e, on: t, onToggle: n }) {
	return /* @__PURE__ */ w("div", {
		style: Hs,
		children: [
			/* @__PURE__ */ C("span", {
				style: Us,
				children: e
			}),
			/* @__PURE__ */ C("span", { className: "flex-1" }),
			/* @__PURE__ */ C(zs, {
				size: "sm",
				"aria-label": e,
				isSelected: t,
				onChange: n
			})
		]
	});
}
// src/components/base/radio-buttons/radio-buttons.tsx
var Ks = i(null), qs = ({ className: e, isFocusVisible: t, isSelected: n, isDisabled: r, size: i = "sm" }) => /* @__PURE__ */ C("div", {
	className: Z("flex size-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full bg-primary ring-1 ring-primary ring-inset", i === "md" && "size-5", n && "bg-brand-solid ring-brand-solid", r && "cursor-not-allowed opacity-50", r && !n && "bg-tertiary", t && "outline-2 outline-offset-2 outline-focus-ring", e),
	children: /* @__PURE__ */ C("div", { className: Z("size-1.5 rounded-full bg-fg-white opacity-0 transition-inherit-all", i === "md" && "size-2", n && "opacity-100") })
});
qs.displayName = "RadioButtonBase";
var Js = ({ label: e, hint: t, className: n, size: r = "sm", ...i }) => {
	r = s(Ks)?.size ?? r;
	let a = {
		sm: {
			root: "gap-2",
			textWrapper: "",
			label: "text-sm font-medium",
			hint: "text-sm"
		},
		md: {
			root: "gap-3",
			textWrapper: "gap-0.5",
			label: "text-md font-medium",
			hint: "text-md"
		}
	};
	return /* @__PURE__ */ C(U, {
		...i,
		className: (e) => Z("relative flex items-start", e.isDisabled && "cursor-not-allowed", a[r].root, typeof n == "function" ? n(e) : n),
		children: ({ isSelected: n, isDisabled: i, isFocusVisible: o }) => /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ C(qs, {
			size: r,
			isSelected: n,
			isDisabled: i,
			isFocusVisible: o,
			className: e || t ? "mt-0.5" : ""
		}), (e || t) && /* @__PURE__ */ w("div", {
			className: Z("inline-flex flex-col", a[r].textWrapper),
			children: [e && /* @__PURE__ */ C("p", {
				className: Z("text-secondary select-none", a[r].label),
				children: e
			}), t && /* @__PURE__ */ C("span", {
				className: Z("text-tertiary", a[r].hint),
				onClick: (e) => e.stopPropagation(),
				children: t
			})]
		})] })
	});
};
Js.displayName = "RadioButton";
var Ys = ({ children: e, className: t, size: n = "sm", ...r }) => /* @__PURE__ */ C(Ks.Provider, {
	value: { size: n },
	children: /* @__PURE__ */ C(pe, {
		...r,
		className: Z("flex flex-col gap-4", t),
		children: e
	})
}), Xs = {
	Root: le,
	Popover: (e) => /* @__PURE__ */ C(H, {
		placement: "bottom right",
		...e,
		className: (t) => Z("w-62 origin-(--trigger-anchor-point) overflow-auto rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt will-change-transform", t.isEntering && "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5", t.isExiting && "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5", typeof e.className == "function" ? e.className(t) : e.className),
		children: e.children
	}),
	Menu: (e) => /* @__PURE__ */ C(oe, {
		...e,
		className: (t) => Z("h-min overflow-y-auto py-1 outline-hidden select-none", typeof e.className == "function" ? e.className(t) : e.className)
	}),
	Section: ce,
	SectionHeader: I,
	Item: ({ label: e, children: t, addon: n, icon: r, avatarUrl: i, unstyled: a, selectionIndicator: s = "checkmark", ...c }) => {
		let l = o((e) => s === "checkmark" ? /* @__PURE__ */ C(mi, {
			"aria-hidden": "true",
			className: Z("size-4 shrink-0 stroke-[2.25px] text-fg-brand-primary", !e.isSelected && "invisible", e.className)
		}) : s === "checkbox" ? /* @__PURE__ */ C(vs, {
			isSelected: e.isSelected && !e.hasSubmenu,
			isIndeterminate: e.isSelected && e.hasSubmenu,
			size: "sm",
			className: Z("shrink-0", e.className)
		}) : s === "radio" ? /* @__PURE__ */ C(qs, {
			isSelected: e.isSelected,
			className: Z("shrink-0", e.className)
		}) : s === "toggle" ? /* @__PURE__ */ C(Ls, {
			slim: !0,
			size: "sm",
			isSelected: e.isSelected,
			className: Z("shrink-0", e.className)
		}) : null, [s]);
		return a ? /* @__PURE__ */ C(se, {
			id: e,
			textValue: e,
			...c
		}) : /* @__PURE__ */ C(se, {
			...c,
			className: (e) => Z("group block cursor-pointer px-1.5 py-px outline-hidden", e.isDisabled && "cursor-not-allowed opacity-50", typeof c.className == "function" ? c.className(e) : c.className),
			children: (a) => /* @__PURE__ */ w("div", {
				className: Z("relative flex items-center rounded-md px-2.5 py-2 outline-focus-ring transition duration-100 ease-linear", !a.isDisabled && "group-hover:bg-primary_hover", a.isFocused && "bg-primary_hover", a.isFocusVisible && "outline-2 -outline-offset-2", a.hasSubmenu && "pr-1.5"),
				children: [
					a.selectionMode !== "none" && !i && !r && /* @__PURE__ */ C(l, {
						...a,
						className: "mr-2"
					}),
					i && /* @__PURE__ */ C("div", {
						className: "mr-2 flex size-4 items-center justify-center",
						children: /* @__PURE__ */ C(os, {
							"aria-hidden": "true",
							size: "xs",
							src: i,
							alt: e,
							className: "size-5"
						})
					}),
					r && /* @__PURE__ */ C(r, {
						"aria-hidden": "true",
						className: "mr-2 size-4 shrink-0 stroke-[2.25px] text-fg-quaternary"
					}),
					/* @__PURE__ */ C("span", {
						className: Z("grow truncate text-sm font-semibold text-secondary", a.isFocused && "text-secondary_hover"),
						children: e || (typeof t == "function" ? t(a) : t)
					}),
					n && /* @__PURE__ */ C("span", {
						className: "ml-1 shrink-0 pr-1 text-xs font-medium text-quaternary",
						children: n
					}),
					a.selectionMode !== "none" && (i || r) && /* @__PURE__ */ C(l, {
						...a,
						className: "ml-1"
					}),
					a.hasSubmenu && /* @__PURE__ */ C(_i, {
						"aria-hidden": "true",
						className: "ml-auto size-4 shrink-0 stroke-[2.25px] text-fg-quaternary"
					})
				]
			})
		});
	},
	Separator: (e) => /* @__PURE__ */ C(_e, {
		...e,
		className: Z("my-1 h-px w-full bg-border-secondary", e.className)
	}),
	DotsButton: (e) => /* @__PURE__ */ C(E, {
		...e,
		"aria-label": "Open menu",
		className: (t) => Z("cursor-pointer rounded-md text-fg-quaternary outline-focus-ring transition duration-100 ease-linear", (t.isPressed || t.isHovered) && "text-fg-quaternary_hover", (t.isPressed || t.isFocusVisible) && "outline-2 outline-offset-2", typeof e.className == "function" ? e.className(t) : e.className),
		children: /* @__PURE__ */ C(Ti, { className: "size-5 transition-inherit-all" })
	})
};
// src/components/ui/Menu.tsx
function Zs({ align: e = "left", width: t, className: n, children: r, ...i }) {
	return /* @__PURE__ */ C(Xs.Popover, {
		placement: `bottom ${e === "right" ? "end" : "start"}`,
		offset: 6,
		containerPadding: 8,
		isNonModal: !0,
		...i,
		className: Z("z-(--z-popover) w-auto min-w-36 bg-[var(--pop)] shadow-[var(--shadow-elevated)] ring-[var(--border)]", n),
		style: {
			width: t,
			maxHeight: "72vh",
			fontSize: "var(--app-font, 13.5px)",
			borderRadius: "min(calc(var(--radius) + 2px), 10px)"
		},
		children: r
	});
}
var Qs = ({ children: e, className: t, ...n }) => /* @__PURE__ */ C("span", {
	...n,
	className: Z("text-[12.5px] font-medium", t),
	children: e
}), $s = "ich-pop p-0.5";
function ec({ trigger: e, items: t, align: n = "left", label: r = "Menu" }) {
	return /* @__PURE__ */ w(Xs.Root, { children: [/* @__PURE__ */ C(fe, { children: e }), /* @__PURE__ */ C(Zs, {
		align: n,
		children: /* @__PURE__ */ C(Xs.Menu, {
			"aria-label": r,
			className: $s,
			children: t.map((e) => /* @__PURE__ */ C(Xs.Item, {
				id: e.id,
				onAction: e.onAction,
				textValue: typeof e.label == "string" ? e.label : e.id,
				children: /* @__PURE__ */ C(Qs, {
					className: e.danger ? "text-[var(--danger)]" : void 0,
					children: e.label
				})
			}, e.id))
		})
	})] });
}
// src/components/layout/LanguagePopover.tsx
function tc() {
	let e = G((e) => e.locale), t = G((e) => e.setLocale), n = q(), r = Rt.find((t) => t.code === e), [i, a] = p(!1);
	return /* @__PURE__ */ w(Xs.Root, {
		isOpen: i,
		onOpenChange: a,
		children: [/* @__PURE__ */ C(Ts, {
			content: `${n("appearance.language")} · ${r?.label ?? ""}`,
			children: /* @__PURE__ */ C(fe, { children: /* @__PURE__ */ C("button", {
				"aria-label": n("appearance.language"),
				style: ks(i),
				children: /* @__PURE__ */ C(K, {
					name: "globe",
					color: "currentColor"
				})
			}) })
		}), /* @__PURE__ */ C(Zs, {
			align: "right",
			width: 188,
			children: /* @__PURE__ */ C(Xs.Menu, {
				"aria-label": n("appearance.language"),
				className: $s,
				selectionMode: "single",
				selectedKeys: [e],
				disallowEmptySelection: !0,
				onAction: (e) => t(e),
				children: Rt.map((e) => /* @__PURE__ */ C(Xs.Item, {
					id: e.code,
					textValue: e.label,
					addon: e.code.toUpperCase(),
					children: /* @__PURE__ */ C(Qs, {
						dir: e.dir,
						children: e.label
					})
				}, e.code))
			})
		})]
	});
}
// src/components/layout/TeamPopover.tsx
var nc = {
	width: 22,
	height: 22,
	borderRadius: "50%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: 9,
	fontWeight: 700,
	color: "var(--accent-fg)",
	background: "var(--accent)",
	border: "2px solid var(--bg)"
};
function rc() {
	let e = Yr(), t = G((e) => e.config), n = G((e) => e.activeWorkspaceId), r = G((e) => e.auth.status === "authed"), i = q();
	if (!t || t.features.presence === !1 || !r) return null;
	let a = t.team ?? [], o = a.filter((e) => e.online), s = t.user.workspaces.find((e) => e.id === n) ?? t.user.workspaces[0];
	if (!a.length) return null;
	let c = t.ui.avatarPalette?.length ? t.ui.avatarPalette : ic;
	return /* @__PURE__ */ C(Es, {
		label: i("team.title"),
		align: "right",
		width: 250,
		panelStyle: { padding: 0 },
		trigger: (e, t) => /* @__PURE__ */ C("button", {
			onClick: t,
			title: `${i("team.online", { n: o.length })} · ${s?.name ?? i("team.title")}`,
			className: "flex items-center ps-2 h-[30px] border-0 bg-transparent cursor-pointer",
			children: o.slice(0, 3).map((e, t) => /* @__PURE__ */ C("div", {
				style: {
					...nc,
					marginInlineStart: t === 0 ? 0 : -8,
					background: c[t % c.length]
				},
				children: e.initials
			}, e.initials))
		}),
		children: (t) => /* @__PURE__ */ w(S, { children: [
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-2 py-[9px] px-3 border-b border-b-[var(--border)]",
				children: [
					/* @__PURE__ */ C("span", {
						className: "text-[12px] font-[650]",
						children: i("team.title")
					}),
					/* @__PURE__ */ C("span", {
						className: "font-[family-name:'Geist_Mono',monospace] text-[9.5px] text-[var(--faint-fg)]",
						children: s?.name
					}),
					/* @__PURE__ */ C("span", { className: "flex-1" }),
					/* @__PURE__ */ C("span", {
						className: "text-[10px] text-[var(--muted-fg)]",
						children: i("team.online", { n: o.length })
					})
				]
			}),
			/* @__PURE__ */ C("div", {
				className: "p-1",
				children: a.map((e, t) => {
					let n = e.status ?? (e.online ? "online" : "offline"), r = n === "online" ? "var(--success)" : n === "away" ? "var(--warning)" : "var(--border)", a = i(n === "online" ? "team.onlineNow" : n === "away" ? "team.away" : "team.offline");
					return /* @__PURE__ */ w("div", {
						className: "flex items-center gap-[9px] h-9 py-0 px-2 rounded-[6px]",
						children: [
							/* @__PURE__ */ C("div", {
								style: {
									...nc,
									border: "none",
									background: c[t % c.length]
								},
								children: e.initials
							}),
							/* @__PURE__ */ w("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ C("div", {
									className: "text-[12px] font-[550]",
									children: e.name
								}), /* @__PURE__ */ C("div", {
									className: "text-[10px] text-[var(--faint-fg)]",
									children: a
								})]
							}),
							/* @__PURE__ */ C("span", { style: {
								width: 8,
								height: 8,
								borderRadius: "50%",
								background: r
							} })
						]
					}, e.initials);
				})
			}),
			/* @__PURE__ */ w("div", {
				className: "flex gap-1.5 py-2 px-3 border-t border-t-[var(--border)]",
				children: [/* @__PURE__ */ C("button", {
					onClick: () => {
						e.getState().openShared(), t();
					},
					className: "flex-1 h-7 border border-[var(--border)] rounded-[calc(var(--radius)_-_3px)] bg-[var(--bg)] text-[var(--fg)] text-[11px] cursor-pointer",
					children: i("account.sharedCollections")
				}), /* @__PURE__ */ C("button", {
					onClick: () => {
						e.getState().openInvite(), t();
					},
					className: "flex-1 h-7 border-0 rounded-[calc(var(--radius)_-_3px)] bg-[var(--accent)] text-[var(--accent-fg)] text-[11px] font-semibold cursor-pointer",
					children: i("team.invite")
				})]
			})
		] })
	});
}
var ic = [
	"#7c3aed",
	"#0891b2",
	"#059669",
	"#e11d48",
	"#ea580c"
], ac = /* @__PURE__ */ new Map();
function oc(e) {
	let t = ac.get(e);
	return t || (t = ({ className: t }) => /* @__PURE__ */ C(K, {
		name: e,
		size: 16,
		className: t
	}), t.displayName = `GlyphIcon(${e})`, ac.set(e, t)), t;
}
// src/components/auth/AccountMenu.tsx
function sc() {
	let e = G((e) => e.auth.user), t = G((e) => e.config), n = G((e) => e.activeWorkspaceId), r = G((e) => e.setActiveWorkspace), i = G((e) => e.openLayer), a = G((e) => e.openShared), o = G((e) => e.openConfirm), s = G((e) => e.signOut), c = G((e) => e.showToast), l = q(), [u, d] = p(!1), f = e ?? (t ? {
		name: t.user.name,
		initials: t.user.initials,
		email: t.user.email,
		plan: t.user.plan
	} : null);
	if (!f) return null;
	let m = t?.user.workspaces ?? [];
	return /* @__PURE__ */ w(Xs.Root, {
		isOpen: u,
		onOpenChange: d,
		children: [/* @__PURE__ */ C(fe, { children: /* @__PURE__ */ C("button", {
			title: `${l("account.account")} — ${f.name}`,
			"aria-label": `${l("account.account")} — ${f.name}`,
			className: "w-[30px] h-[30px] ml-1 rounded-full border-0 bg-[var(--accent)] text-[var(--accent-fg)] text-[11px] font-bold cursor-pointer",
			children: f.initials
		}) }), /* @__PURE__ */ w(Zs, {
			align: "right",
			width: 230,
			children: [/* @__PURE__ */ w("div", {
				className: "flex items-center gap-[9px] p-2 mx-0.5 mt-0.5 border-b border-b-[var(--border)]",
				children: [/* @__PURE__ */ C("div", {
					"aria-hidden": !0,
					className: "w-[30px] h-[30px] rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-[11px] font-bold flex items-center justify-center flex-none",
					children: f.initials
				}), /* @__PURE__ */ w("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ w("div", {
						className: "text-[12.5px] font-[600] flex items-center gap-[5px]",
						children: [f.name, /* @__PURE__ */ C("span", {
							className: "text-[9px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-[5px]",
							children: f.plan
						})]
					}), /* @__PURE__ */ C("div", {
						className: "text-[10.5px] text-[var(--muted-fg)] whitespace-nowrap overflow-hidden text-ellipsis",
						children: f.email
					})]
				})]
			}), /* @__PURE__ */ w(Xs.Menu, {
				"aria-label": l("account.account"),
				className: $s,
				children: [
					m.length > 0 && /* @__PURE__ */ w(Xs.Section, {
						selectionMode: "single",
						selectedKeys: n ? [n] : [],
						disallowEmptySelection: !0,
						onSelectionChange: (e) => {
							let t = [...e][0], n = m.find((e) => e.id === t);
							n && (r(n.id), c(l("profile.switched", { name: n.name }), "check"));
						},
						children: [/* @__PURE__ */ C(Xs.SectionHeader, {
							className: "pt-1 px-2 pb-0.5 text-[10px] font-semibold text-[var(--faint-fg)]",
							children: l("account.workspace")
						}), m.map((e) => /* @__PURE__ */ C(Xs.Item, {
							id: e.id,
							textValue: e.name,
							addon: e.plan,
							children: /* @__PURE__ */ C(Qs, { children: e.name })
						}, e.id))]
					}),
					m.length > 0 && /* @__PURE__ */ C(Xs.Separator, {}),
					/* @__PURE__ */ w(Xs.Section, { children: [
						/* @__PURE__ */ C(Xs.Item, {
							id: "profile",
							icon: oc("settings"),
							textValue: l("account.profile"),
							onAction: () => i("profile"),
							children: /* @__PURE__ */ C(Qs, { children: l("account.profile") })
						}),
						/* @__PURE__ */ C(Xs.Item, {
							id: "shared",
							icon: oc("folder"),
							textValue: l("account.sharedCollections"),
							onAction: () => a(),
							children: /* @__PURE__ */ C(Qs, { children: l("account.sharedCollections") })
						}),
						/* @__PURE__ */ C(Xs.Item, {
							id: "signout",
							icon: cc,
							textValue: l("common.signOut"),
							onAction: () => o({
								title: l("profile.signOutTitle"),
								body: l("profile.signOutBody"),
								confirmLabel: l("common.signOut"),
								danger: !0,
								onConfirm: () => {
									s(), c(l("profile.signedOut"), "check");
								}
							}),
							children: /* @__PURE__ */ w(Qs, {
								className: "text-[var(--danger)]",
								children: [l("common.signOut"), "…"]
							})
						})
					] })
				]
			})]
		})]
	});
}
var cc = ({ className: e }) => /* @__PURE__ */ C(K, {
	name: "close",
	size: 16,
	className: Z(e, "text-[var(--danger)]")
}), lc = {
	sm: "*:data-icon:size-4 *:data-icon:stroke-[2.25px]",
	md: "*:data-icon:size-5",
	lg: "*:data-icon:size-6",
	xl: "*:data-icon:size-7"
}, uc = Go({
	light: {
		base: "rounded-full",
		sizes: {
			sm: "size-8",
			md: "size-10",
			lg: "size-12",
			xl: "size-14"
		},
		colors: {
			brand: "bg-brand-secondary text-featured-icon-light-fg-brand",
			gray: "bg-tertiary text-featured-icon-light-fg-gray",
			error: "bg-error-secondary text-featured-icon-light-fg-error",
			warning: "bg-warning-secondary text-featured-icon-light-fg-warning",
			success: "bg-success-secondary text-featured-icon-light-fg-success"
		}
	},
	gradient: {
		base: "rounded-full text-fg-white before:absolute before:inset-0 before:size-full before:rounded-full before:border before:mask-b-from-0% after:absolute after:block after:rounded-full",
		sizes: {
			sm: "size-8 after:size-6 *:data-icon:size-4",
			md: "size-10 after:size-7 *:data-icon:size-4",
			lg: "size-12 after:size-8 *:data-icon:size-5",
			xl: "size-14 after:size-10 *:data-icon:size-5"
		},
		colors: {
			brand: "before:border-utility-brand-200 before:bg-utility-brand-50 after:bg-brand-solid",
			gray: "before:border-utility-neutral-200 before:bg-utility-neutral-50 after:bg-secondary-solid",
			error: "before:border-utility-red-200 before:bg-utility-red-50 after:bg-error-solid",
			warning: "before:border-utility-yellow-200 before:bg-utility-yellow-50 after:bg-warning-solid",
			success: "before:border-utility-green-200 before:bg-utility-green-50 after:bg-success-solid"
		}
	},
	dark: {
		base: "text-fg-white shadow-xs-skeuomorphic before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
		sizes: {
			sm: "size-8 rounded-md before:rounded-[5px]",
			md: "size-10 rounded-lg before:rounded-[7px]",
			lg: "size-12 rounded-[10px] before:rounded-[9px]",
			xl: "size-14 rounded-xl before:rounded-[11px]"
		},
		colors: {
			brand: "bg-brand-solid before:border-utility-brand-200/12",
			gray: "bg-secondary-solid before:border-utility-neutral-200/12",
			error: "bg-error-solid before:border-utility-red-200/12",
			warning: "bg-warning-solid before:border-utility-yellow-200/12",
			success: "bg-success-solid before:border-utility-green-200/12"
		}
	},
	modern: {
		base: "bg-primary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset",
		sizes: {
			sm: "size-8 rounded-md",
			md: "size-10 rounded-lg",
			lg: "size-12 rounded-[10px]",
			xl: "size-14 rounded-xl"
		},
		colors: {
			brand: "text-fg-brand-primary",
			gray: "text-fg-secondary",
			error: "text-fg-error-primary",
			warning: "text-fg-warning-primary",
			success: "text-fg-success-primary"
		}
	},
	"modern-neue": {
		base: "bg-primary_alt ring-1 ring-inset before:absolute before:inset-1 before:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1),0px_3px_3px_0px_rgba(0,0,0,0.09),1px_8px_5px_0px_rgba(0,0,0,0.05),2px_21px_6px_0px_rgba(0,0,0,0),0px_0px_0px_1px_rgba(0,0,0,0.08),1px_13px_5px_0px_rgba(0,0,0,0.01),0px_-2px_2px_0px_rgba(0,0,0,0.13)_inset] before:ring-1 before:ring-secondary_alt",
		sizes: {
			sm: "size-8 rounded-[8px] before:rounded-[4px]",
			md: "size-10 rounded-[10px] before:rounded-[6px]",
			lg: "size-12 rounded-[12px] before:rounded-[8px]",
			xl: "size-14 rounded-[14px] before:rounded-[10px]"
		},
		colors: {
			brand: "",
			gray: "text-fg-secondary ring-primary",
			error: "",
			warning: "",
			success: ""
		}
	},
	outline: {
		base: "before:absolute before:rounded-full before:border-2 after:absolute after:rounded-full after:border-2",
		sizes: {
			sm: "size-4 before:size-6 after:size-8.5",
			md: "size-5 before:size-7 after:size-9.5",
			lg: "size-6 before:size-8 after:size-10.5",
			xl: "size-7 before:size-9 after:size-11.5"
		},
		colors: {
			brand: "text-fg-brand-primary before:border-fg-brand-primary/30 after:border-fg-brand-primary/10",
			gray: "text-fg-tertiary before:border-fg-tertiary/30 after:border-fg-tertiary/10",
			error: "text-fg-error-primary before:border-fg-error-primary/30 after:border-fg-error-primary/10",
			warning: "text-fg-warning-primary before:border-fg-warning-primary/30 after:border-fg-warning-primary/10",
			success: "text-fg-success-primary before:border-fg-success-primary/30 after:border-fg-success-primary/10"
		}
	}
}), dc = (e) => {
	let { size: t = "sm", theme: n = "light", color: r = "brand", icon: i, ...o } = e;
	return /* @__PURE__ */ w("div", {
		...o,
		"data-featured-icon": !0,
		className: Z("relative flex shrink-0 items-center justify-center", lc[t], uc[n].base, uc[n].sizes[t], uc[n].colors[r], e.className),
		children: [
			us(i) && /* @__PURE__ */ C(i, {
				"data-icon": !0,
				className: "z-1"
			}),
			a(i) && /* @__PURE__ */ C("div", {
				className: "z-1",
				children: i
			}),
			e.children
		]
	});
};
// src/components/ui/EmptyState.tsx
function fc({ icon: e, title: t, description: n, action: r, size: i = "sm", className: a }) {
	return /* @__PURE__ */ w("div", {
		className: Z("flex flex-col items-center justify-center gap-3 px-4 text-center", a),
		children: [
			/* @__PURE__ */ C(dc, {
				color: "gray",
				theme: "modern",
				size: i === "md" ? "lg" : "md",
				icon: oc(e)
			}),
			/* @__PURE__ */ w("div", {
				className: "flex flex-col items-center gap-1",
				children: [/* @__PURE__ */ C("p", {
					className: Z("font-semibold text-primary", i === "md" ? "text-md" : "text-sm"),
					children: t
				}), n && /* @__PURE__ */ C("p", {
					className: "max-w-[44ch] text-sm text-tertiary",
					children: n
				})]
			}),
			r && /* @__PURE__ */ C("div", {
				className: "mt-1",
				children: r
			})
		]
	});
}
// src/components/base/buttons/button.tsx
var pc = Go({
	common: {
		root: "group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-r-none in-data-input-wrapper:in-data-leading:before:rounded-r-none in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-l-none in-data-input-wrapper:in-data-trailing:before:rounded-l-none disabled:cursor-not-allowed disabled:opacity-50 in-data-input-wrapper:disabled:opacity-100 *:data-icon:pointer-events-none *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:transition-inherit-all",
		icon: "pointer-events-none size-5 shrink-0 transition-inherit-all"
	},
	sizes: {
		xs: {
			root: "gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2 in-data-input-wrapper:px-3.5 in-data-input-wrapper:py-2.5 in-data-input-wrapper:data-icon-only:p-2.5 *:data-icon:size-4 *:data-icon:stroke-[2.25px]",
			linkRoot: "gap-1 *:data-text:underline-offset-3"
		},
		sm: {
			root: "gap-1 rounded-lg px-3 py-2 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2 in-data-input-wrapper:px-3.5 in-data-input-wrapper:py-2.5 in-data-input-wrapper:data-icon-only:p-2.5",
			linkRoot: "gap-1 *:data-text:underline-offset-3"
		},
		md: {
			root: "gap-1 rounded-lg px-3.5 py-2.5 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2.5 in-data-input-wrapper:gap-1.5 in-data-input-wrapper:px-4 in-data-input-wrapper:text-md in-data-input-wrapper:data-icon-only:p-3",
			linkRoot: "gap-1 *:data-text:underline-offset-4"
		},
		lg: {
			root: "gap-1.5 rounded-lg px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3",
			linkRoot: "gap-1.5 *:data-text:underline-offset-4"
		},
		xl: {
			root: "gap-1.5 rounded-lg px-4.5 py-3 text-md font-semibold before:rounded-[7px] data-icon-only:p-3.5",
			linkRoot: "gap-1.5 *:data-text:underline-offset-4"
		}
	},
	colors: {
		primary: { root: "bg-brand-solid text-white shadow-xs-skeuomorphic ring-1 ring-transparent ring-inset hover:bg-brand-solid_hover data-loading:bg-brand-solid_hover before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0% *:data-icon:text-white/60 hover:*:data-icon:text-white/70" },
		secondary: { root: "bg-primary text-secondary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-secondary_hover data-loading:bg-primary_hover *:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover" },
		tertiary: { root: "text-tertiary hover:bg-primary_hover hover:text-tertiary_hover data-loading:bg-primary_hover *:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover" },
		"link-color": { root: "justify-normal rounded p-0! text-brand-secondary hover:text-brand-secondary_hover *:data-icon:text-fg-brand-secondary_alt hover:*:data-icon:text-fg-brand-secondary_hover" },
		"link-gray": { root: "justify-normal rounded p-0! text-tertiary hover:text-tertiary_hover *:data-icon:text-fg-quaternary hover:*:data-icon:text-fg-quaternary_hover" },
		"primary-destructive": { root: "bg-error-solid text-white shadow-xs-skeuomorphic ring-1 ring-transparent outline-error ring-inset hover:bg-error-solid_hover data-loading:bg-error-solid_hover before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0% *:data-icon:text-white/60 hover:*:data-icon:text-white/70" },
		"secondary-destructive": { root: "bg-primary text-error-primary shadow-xs-skeuomorphic ring-1 ring-error_subtle outline-error ring-inset hover:bg-error-primary hover:text-error-primary_hover data-loading:bg-error-primary *:data-icon:text-fg-error-secondary hover:*:data-icon:text-fg-error-primary" },
		"tertiary-destructive": { root: "text-error-primary outline-error hover:bg-error-primary hover:text-error-primary_hover data-loading:bg-error-primary *:data-icon:text-fg-error-secondary hover:*:data-icon:text-fg-error-primary" },
		"link-destructive": { root: "justify-normal rounded p-0! text-error-primary outline-error hover:text-error-primary_hover *:data-icon:text-fg-error-secondary hover:*:data-icon:text-fg-error-primary" }
	}
}), Q = ({ size: e = "sm", color: t = "primary", children: n, className: r, noTextPadding: i, iconLeading: o, iconTrailing: s, isDisabled: c, isLoading: l, showTextWhileLoading: u, ...d }) => {
	let f = "href" in d ? d.href : void 0, p = (o || s) && !n, m = [
		"link-gray",
		"link-color",
		"link-destructive"
	].includes(t);
	i = m || i;
	let h = /* @__PURE__ */ w(S, { children: [
		a(o) && o,
		us(o) && /* @__PURE__ */ C(o, {
			"data-icon": "leading",
			className: pc.common.icon
		}),
		l && /* @__PURE__ */ w("svg", {
			fill: "none",
			"data-icon": "loading",
			viewBox: "0 0 20 20",
			className: Z(pc.common.icon, !u && "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"),
			children: [/* @__PURE__ */ C("circle", {
				className: "stroke-current opacity-30",
				cx: "10",
				cy: "10",
				r: "8",
				fill: "none",
				strokeWidth: "2"
			}), /* @__PURE__ */ C("circle", {
				className: "origin-center animate-spin stroke-current",
				cx: "10",
				cy: "10",
				r: "8",
				fill: "none",
				strokeWidth: "2",
				strokeDasharray: "12.5 50",
				strokeLinecap: "round"
			})]
		}),
		n && /* @__PURE__ */ C("span", {
			"data-text": !0,
			className: Z("transition-inherit-all", !i && "px-0.5"),
			children: n
		}),
		a(s) && s,
		us(s) && /* @__PURE__ */ C(s, {
			"data-icon": "trailing",
			className: pc.common.icon
		})
	] }), g = {
		"data-loading": l ? !0 : void 0,
		"data-icon-only": p ? !0 : void 0,
		...d,
		isDisabled: c,
		className: Z(pc.common.root, pc.sizes[e].root, pc.colors[t].root, m && pc.sizes[e].linkRoot, (l || f && (c || l)) && "pointer-events-none", l && (u ? "[&>*:not([data-icon=loading]):not([data-text])]:hidden" : "[&>*:not([data-icon=loading])]:invisible"), r),
		children: h
	};
	return "href" in g ? /* @__PURE__ */ C(z, {
		...g,
		href: c ? void 0 : f
	}) : /* @__PURE__ */ C(E, {
		...g,
		type: g.type || "button",
		isPending: l
	});
}, mc = ({ icon: e, color: t = "brand", children: n, onClose: r, closeLabel: i = "Close", className: a }) => /* @__PURE__ */ w("div", {
	className: Z("relative flex max-w-[360px] items-center gap-3 rounded-xl bg-primary_alt p-3 pe-11 shadow-lg ring ring-secondary_alt", a),
	children: [
		/* @__PURE__ */ C(dc, {
			icon: e,
			color: t,
			theme: "outline",
			size: "sm"
		}),
		/* @__PURE__ */ C("p", {
			className: "min-w-0 flex-1 text-sm text-fg-secondary",
			children: n
		}),
		r && /* @__PURE__ */ C(Q, {
			color: "tertiary",
			size: "xs",
			iconLeading: oa,
			"aria-label": i,
			onClick: r,
			className: "absolute end-2 top-1/2 -translate-y-1/2"
		})
	]
}), hc = ({ icon: e, color: t = "brand", children: n, meta: r, className: i }) => /* @__PURE__ */ w("div", {
	className: Z("flex gap-3 px-3 py-2.5", i),
	children: [/* @__PURE__ */ C(dc, {
		icon: e,
		color: t,
		theme: "outline",
		size: "sm"
	}), /* @__PURE__ */ w("div", {
		className: "flex min-w-0 flex-1 flex-col gap-0.5",
		children: [/* @__PURE__ */ C("p", {
			className: "text-sm text-fg-secondary",
			children: n
		}), r && /* @__PURE__ */ C("p", {
			className: "text-xs text-tertiary",
			children: r
		})]
	})]
}), gc = (e) => e.toLocaleString("en-US");
function _c() {
	return typeof navigator > "u" ? "Ctrl+" : /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "⌘" : "Ctrl+";
}
function vc(e = _c()) {
	return e === "⌘" ? "⇧⌘⌫" : "Ctrl+Shift+Backspace";
}
function yc(e, t = Date.now()) {
	let n = Math.max(0, Math.round((t - e) / 1e3));
	if (n < 5) return "just now";
	if (n < 60) return `${n}s ago`;
	let r = Math.round(n / 60);
	if (r < 60) return `${r}m ago`;
	let i = Math.round(r / 60);
	return i < 24 ? `${i}h ago` : `${Math.round(i / 24)}d ago`;
}
function bc(e, t, n = 62) {
	let r = n / 100 * Math.min(t / 100, 1 - t / 100), i = (n) => {
		let i = (n + e / 30) % 12, a = t / 100 - r * Math.max(Math.min(i - 3, 9 - i, 1), -1);
		return Math.round(255 * a).toString(16).padStart(2, "0");
	};
	return `#${i(0)}${i(8)}${i(4)}`;
}
// src/components/notifications/NotificationsPopover.tsx
function xc() {
	let e = G((e) => e.notifications), t = G((e) => e.markNotificationsRead), n = G((e) => e.clearNotifications), r = G((e) => e.auth.status === "authed"), i = e.filter((e) => !e.read).length, a = q();
	return r ? /* @__PURE__ */ C(Es, {
		label: a("header.notifications"),
		align: "right",
		width: 300,
		panelStyle: {
			padding: 0,
			top: 35
		},
		trigger: (e, n) => /* @__PURE__ */ w("button", {
			onClick: () => {
				n(), i && t();
			},
			title: a("header.notifications"),
			style: {
				...ks(),
				position: "relative"
			},
			children: [/* @__PURE__ */ C(K, {
				name: "bell-filled",
				color: "currentColor"
			}), i > 0 && /* @__PURE__ */ C("span", {
				className: "absolute top-[1px] end-0 min-w-3.5 h-3.5 py-0 px-[3px] rounded-[7px] bg-[var(--danger)] text-[#fff] text-[9px] font-bold flex items-center justify-center font-[family-name:'Geist_Mono',monospace]",
				children: i
			})]
		}),
		children: () => /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ w("div", {
			className: "flex items-center py-[9px] px-3 border-b border-b-[var(--border)]",
			children: [
				/* @__PURE__ */ C("span", {
					className: "text-[12.5px] font-[650]",
					children: a("header.notifications")
				}),
				/* @__PURE__ */ C("span", { className: "flex-1" }),
				e.length > 0 && /* @__PURE__ */ C("button", {
					onClick: n,
					className: "border-0 bg-transparent text-[var(--accent-text)] text-[11px] font-semibold cursor-pointer",
					children: a("notifications.clearAll")
				})
			]
		}), /* @__PURE__ */ C("div", {
			className: "max-h-[340px] overflow-y-auto",
			children: e.length === 0 ? /* @__PURE__ */ C(fc, {
				icon: "bell-filled",
				title: a("notifications.empty"),
				className: "py-7"
			}) : /* @__PURE__ */ C("ul", {
				className: "m-0 list-none p-0",
				children: e.map((e) => /* @__PURE__ */ C("li", {
					className: "border-b border-secondary last:border-b-0",
					children: /* @__PURE__ */ C(hc, {
						icon: oc(e.icon),
						color: e.icon === "check" ? "success" : "brand",
						meta: yc(e.ts),
						children: e.text
					})
				}, e.id))
			})
		})] })
	}) : null;
}
// src/components/help/HelpMenu.tsx
function Sc() {
	let e = G((e) => e.openLayer), t = G((e) => e.startTour), n = G((e) => e.config?.about.links.find((e) => e.label.toLowerCase() === "docs")?.href ?? "https://github.com/ichava/icon-browser/tree/main/docs"), r = _c(), i = q(), [a, o] = p(!1);
	return /* @__PURE__ */ w(Xs.Root, {
		isOpen: a,
		onOpenChange: o,
		children: [/* @__PURE__ */ C(Ts, {
			content: i("help.title"),
			children: /* @__PURE__ */ C(fe, { children: /* @__PURE__ */ C("button", {
				"aria-label": i("help.title"),
				style: ks(a),
				children: /* @__PURE__ */ C(K, {
					name: "info",
					color: "currentColor"
				})
			}) })
		}), /* @__PURE__ */ C(Zs, {
			align: "right",
			width: 230,
			children: /* @__PURE__ */ w(Xs.Menu, {
				"aria-label": i("help.title"),
				className: $s,
				children: [
					/* @__PURE__ */ C(Xs.Item, {
						id: "about",
						icon: oc("info"),
						textValue: i("help.about"),
						onAction: () => e("about"),
						children: /* @__PURE__ */ C(Qs, { children: i("help.about") })
					}),
					/* @__PURE__ */ C(Xs.Item, {
						id: "docs",
						icon: oc("text"),
						textValue: i("help.docs"),
						href: n,
						target: "_blank",
						rel: "noreferrer",
						children: /* @__PURE__ */ C(Qs, { children: i("help.docs") })
					}),
					/* @__PURE__ */ C(Xs.Item, {
						id: "tour",
						icon: oc("sparkles"),
						textValue: i("help.replayTour"),
						onAction: () => t(),
						children: /* @__PURE__ */ C(Qs, { children: i("help.replayTour") })
					}),
					/* @__PURE__ */ C(Xs.Item, {
						id: "shortcuts",
						icon: oc("command"),
						textValue: i("help.shortcuts"),
						addon: `${r}K`,
						onAction: () => e("palette"),
						children: /* @__PURE__ */ C(Qs, { children: i("help.shortcuts") })
					})
				]
			})
		})]
	});
}
// src/hooks/useFullscreen.ts
function Cc() {
	let [e, t] = p(() => typeof document < "u" && !!document.fullscreenElement);
	return c(() => {
		let e = () => t(!!document.fullscreenElement);
		return document.addEventListener("fullscreenchange", e), () => document.removeEventListener("fullscreenchange", e);
	}, []), [e, o(() => {
		try {
			document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.();
		} catch {}
	}, [])];
}
// src/core/appScale.ts
var wc = {
	xs: .85,
	s: .93,
	m: 1,
	l: 1.12
};
function Tc(e) {
	return e === "comfy" ? {
		gap: 14,
		tilePad: 64,
		rowH: 46
	} : {
		gap: 8,
		tilePad: 52,
		rowH: 38
	};
}
function Ec(e, t) {
	return Math.max(86, e + Tc(t).tilePad);
}
function Dc(e) {
	return `calc(${e / 16} * var(--ich-rem, 1rem))`;
}
// src/components/layout/AppHeader.tsx
function Oc() {
	let e = G((e) => e.view), t = G((e) => e.setView), n = G((e) => e.toggleSidebar), r = G((e) => e.theme), i = G((e) => e.toggleTheme), a = G((e) => e.openLayer), o = G((e) => e.openLibrary), s = G((e) => e.favorites), c = G((e) => e.auth.status === "authed"), l = G((e) => e.openAuth), u = G((e) => e.config), d = G((e) => e.devtools.open), f = G((e) => e.toggleDevtools), p = Tn(u), m = _c(), h = q(), [g, _] = Cc();
	return /* @__PURE__ */ w("header", {
		style: {
			height: Dc(48),
			flex: "none",
			display: "flex",
			alignItems: "center",
			gap: 8,
			padding: "0 12px",
			borderBottom: "1px solid var(--border)",
			background: "var(--bg)",
			userSelect: "none"
		},
		children: [
			/* @__PURE__ */ C("button", {
				className: "ich-hamburger",
				onClick: n,
				title: h("header.filtersPackages"),
				"aria-label": h("header.toggleSidebar"),
				style: {
					width: 30,
					height: 30,
					alignItems: "center",
					justifyContent: "center",
					border: "1px solid var(--border)",
					backgroundColor: "var(--bg)",
					borderRadius: "calc(var(--radius) - 2px)",
					cursor: "pointer",
					color: "var(--muted-fg)",
					flex: "none"
				},
				children: /* @__PURE__ */ C(K, {
					name: "sliders",
					size: 14,
					color: "currentColor"
				})
			}),
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-2 flex-none",
				children: [/* @__PURE__ */ C("div", {
					className: "w-6 h-6 rounded-[6px] bg-[var(--accent)] flex items-center justify-center",
					children: /* @__PURE__ */ C(K, {
						name: "layers",
						size: 14,
						color: "var(--accent-fg)"
					})
				}), /* @__PURE__ */ w("div", {
					className: "flex items-baseline gap-[5px] whitespace-nowrap",
					children: [/* @__PURE__ */ C("span", {
						className: "font-[650] text-[13.5px] tracking-[-.01em]",
						children: u?.brand.name ?? "Ichava"
					}), /* @__PURE__ */ C("span", {
						className: "ich-header-brand-suffix text-[var(--muted-fg)] text-[12.5px]",
						children: u?.brand.suffix ?? "Browser"
					})]
				})]
			}),
			/* @__PURE__ */ C("div", {
				className: "ich-header-search flex-1 min-w-0 flex justify-center",
				children: /* @__PURE__ */ C(Ts, {
					content: h("header.commandPalette"),
					shortcut: `${m}K`,
					children: /* @__PURE__ */ w("button", {
						onClick: () => a("palette"),
						className: "ich-header-search-button w-full max-w-[280px] min-w-0 h-[30px] flex items-center gap-2 py-0 px-2 border border-[var(--border)] rounded-[calc(var(--radius)_-_2px)] bg-[var(--muted2)] text-[var(--muted-fg)] cursor-pointer text-[12.5px]",
						children: [
							/* @__PURE__ */ C(K, {
								name: "search",
								size: 13,
								color: "var(--muted-fg)"
							}),
							/* @__PURE__ */ C("span", {
								className: "ich-header-search-label flex-1 min-w-0 truncate text-start",
								children: h("common.search")
							}),
							/* @__PURE__ */ w("kbd", {
								className: "ich-header-search-label ich-header-search-kbd font-[family-name:'Geist_Mono',monospace] text-[10px] py-0.5 px-[5px] border border-[var(--border)] rounded-[4px] bg-[var(--bg)]",
								children: [m, "K"]
							})
						]
					})
				})
			}),
			/* @__PURE__ */ w("div", {
				className: "ich-header-actions flex items-center gap-1",
				children: [
					/* @__PURE__ */ C(Ts, {
						content: h(e === "grid" ? "header.listView" : "header.gridView"),
						children: /* @__PURE__ */ C("button", {
							onClick: () => t(e === "grid" ? "list" : "grid"),
							"aria-label": h(e === "grid" ? "header.listView" : "header.gridView"),
							style: {
								...ks(),
								color: "var(--accent-text)"
							},
							children: /* @__PURE__ */ C(K, {
								name: e === "grid" ? "grid" : "list",
								size: 14,
								color: "currentColor"
							})
						})
					}),
					/* @__PURE__ */ C(kc, {}),
					/* @__PURE__ */ C(Ts, {
						content: h("header.favorites"),
						shortcut: `${m}1`,
						children: /* @__PURE__ */ w("button", {
							onClick: () => o("favorites"),
							"aria-label": s.length ? `${h("header.favorites")} ${s.length}` : h("header.favorites"),
							style: {
								...ks(),
								position: "relative"
							},
							children: [/* @__PURE__ */ C(K, {
								name: s.length ? "heart-filled" : "heart",
								color: s.length ? "var(--accent)" : "currentColor"
							}), s.length > 0 && /* @__PURE__ */ C("span", {
								className: "absolute top-0.5 end-[1px] min-w-3.5 h-3.5 py-0 px-[3px] rounded-[7px] bg-[var(--accent)] text-[var(--accent-fg)] text-[9px] font-semibold flex items-center justify-center font-[family-name:'Geist_Mono',monospace]",
								children: s.length
							})]
						})
					}),
					u?.features.history !== !1 && /* @__PURE__ */ C(Ts, {
						content: h("header.history"),
						shortcut: `${m}2`,
						children: /* @__PURE__ */ C("button", {
							onClick: () => o("history"),
							"aria-label": h("header.history"),
							style: ks(),
							children: /* @__PURE__ */ C(K, {
								name: "clock",
								color: "currentColor"
							})
						})
					}),
					u?.features.collections !== !1 && /* @__PURE__ */ C(Ts, {
						content: h("header.collections"),
						shortcut: `${m}3`,
						children: /* @__PURE__ */ C("button", {
							onClick: () => o("collections"),
							"aria-label": h("header.collections"),
							style: ks(),
							children: /* @__PURE__ */ C(K, {
								name: "folder",
								color: "currentColor"
							})
						})
					}),
					/* @__PURE__ */ C(xc, {}),
					/* @__PURE__ */ C(rc, {}),
					/* @__PURE__ */ C(kc, {}),
					/* @__PURE__ */ C(Ws, {}),
					/* @__PURE__ */ C(tc, {}),
					/* @__PURE__ */ C(Ts, {
						content: h("header.toggleTheme"),
						shortcut: `${m}T`,
						children: /* @__PURE__ */ C("button", {
							onClick: i,
							"aria-label": h("header.toggleTheme"),
							style: ks(),
							children: /* @__PURE__ */ C(K, {
								name: r === "dark" ? "sun" : "moon",
								color: "currentColor"
							})
						})
					}),
					/* @__PURE__ */ C(Ts, {
						content: h(g ? "header.exitFullscreen" : "header.fullscreen"),
						children: /* @__PURE__ */ C("button", {
							onClick: _,
							"aria-label": h(g ? "header.exitFullscreen" : "header.fullscreen"),
							style: ks(g),
							children: /* @__PURE__ */ C(K, {
								name: g ? "minimize" : "resize",
								color: "currentColor"
							})
						})
					}),
					p && /* @__PURE__ */ C(Ts, {
						content: h("header.devtools"),
						shortcut: `${m}D`,
						children: /* @__PURE__ */ C("button", {
							onClick: f,
							"aria-label": h("header.devtools"),
							style: ks(d),
							children: /* @__PURE__ */ C(K, {
								name: "zap",
								color: "currentColor"
							})
						})
					}),
					/* @__PURE__ */ C(Sc, {}),
					/* @__PURE__ */ C(Ts, {
						content: h("header.settings"),
						shortcut: `${m},`,
						children: /* @__PURE__ */ C("button", {
							onClick: () => a("settings"),
							"aria-label": h("header.settings"),
							style: ks(),
							children: /* @__PURE__ */ C(K, {
								name: "settings",
								color: "currentColor"
							})
						})
					}),
					c ? /* @__PURE__ */ C(sc, {}) : /* @__PURE__ */ C(Q, {
						size: "sm",
						onClick: () => l("signin"),
						className: "ms-1",
						children: h("common.signIn")
					})
				]
			})
		]
	});
}
var kc = () => /* @__PURE__ */ C("div", { className: "w-[1px] h-[18px] bg-[var(--border)] my-0 mx-1" }), Ac = 300;
function jc(e) {
	return {
		items: [],
		total: 0,
		page: 1,
		perPage: e,
		lastPage: 1,
		rangeStart: 0,
		rangeEnd: 0
	};
}
function Mc(e, t, n) {
	let [r, i] = p(() => jc(t.perPage ?? 60)), [a, o] = p([]), [s, l] = p(/* @__PURE__ */ new Map()), [u, m] = p(!1), [h, g] = p(null), _ = f(null);
	return c(() => {
		if (!e) return;
		let n = setTimeout(() => {
			_.current?.abort();
			let n = new AbortController();
			_.current = n, m(!0), e.listIcons(t, n.signal).then((e) => {
				n.signal.aborted || (i(e), g(null));
			}).catch((e) => {
				n.signal.aborted || g(e);
			}).finally(() => {
				n.signal.aborted || m(!1);
			});
		}, Ac);
		return () => {
			clearTimeout(n), _.current?.abort();
		};
	}, [e, JSON.stringify(t)]), c(() => {
		if (!e) {
			o([]), l(/* @__PURE__ */ new Map());
			return;
		}
		let n = new AbortController();
		return Promise.all([e.getTree(n.signal), e.getVariantCounts(t, n.signal)]).then(([e, t]) => {
			n.signal.aborted || (o(e), l(t));
		}).catch((e) => {
			n.signal.aborted || g(e);
		}), () => n.abort();
	}, [e]), {
		page: r,
		tree: d(() => Nc(a, n), [a, n]),
		variantCounts: s,
		loading: u,
		error: h
	};
}
function Nc(e, t) {
	if (!t.trim()) return e;
	let n = t.toLowerCase();
	return e.map((e) => ({
		...e,
		cats: e.cats.map((e) => {
			let t = e.name.toLowerCase().includes(n), r = e.sub?.filter((e) => e.name.toLowerCase().includes(n));
			return t ? e : r && r.length ? {
				...e,
				sub: r
			} : null;
		}).filter((e) => e !== null)
	})).filter((e) => e.cats.length > 0);
}
// src/hooks/useRepo.ts
function Pc() {
	let e = G((e) => e.catalog), t = G((e) => e.filters), n = G((e) => e.catQ), r = G((e) => e.setPage), i = d(() => Rr(t), [t]), a = d(() => e ? new qt(e) : null, [e]), o = d(() => a?.page(i) ?? {
		items: [],
		total: 0,
		page: 1,
		perPage: t.perPage,
		lastPage: 1,
		rangeStart: 0,
		rangeEnd: 0
	}, [
		a,
		i,
		t.perPage
	]), s = d(() => {
		if (!a) return [];
		let e = a.categoryTree(i);
		if (!n.trim()) return e;
		let t = n.toLowerCase();
		return e.map((e) => ({
			...e,
			cats: e.cats.map((e) => {
				let n = e.name.toLowerCase().includes(t), r = e.sub?.filter((e) => e.name.toLowerCase().includes(t));
				return n ? e : r && r.length ? {
					...e,
					sub: r
				} : null;
			}).filter((e) => e !== null)
		})).filter((e) => e.cats.length > 0);
	}, [
		a,
		i,
		n
	]), l = d(() => a ? a.variantCounts(i) : /* @__PURE__ */ new Map(), [a, i]), u = Ue(), f = Mc(e ? null : u, i, n), p = e ? o : f.page, m = e ? s : f.tree, h = e ? l : f.variantCounts;
	return c(() => {
		p.total > 0 && t.page !== p.page && r(p.page);
	}, [
		t.page,
		p.page,
		p.total,
		r
	]), {
		repo: a,
		page: p,
		tree: m,
		variantCounts: h,
		catalog: e,
		client: e ? null : u,
		loading: !e && f.loading,
		error: e ? null : f.error
	};
}
// src/components/base/badges/badge-types.ts
var Fc = {
	pillColor: "pill-color",
	badgeColor: "color",
	badgeModern: "modern"
}, Ic = {
	gray: {
		root: "bg-utility-neutral-50 text-utility-neutral-700 ring-utility-neutral-200",
		addon: "text-utility-neutral-500",
		addonButton: "hover:bg-utility-neutral-100 text-utility-neutral-400 hover:text-utility-neutral-500"
	},
	brand: {
		root: "bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200",
		addon: "text-utility-brand-500",
		addonButton: "hover:bg-utility-brand-100 text-utility-brand-400 hover:text-utility-brand-500"
	},
	error: {
		root: "bg-utility-red-50 text-utility-red-700 ring-utility-red-200",
		addon: "text-utility-red-500",
		addonButton: "hover:bg-utility-red-100 text-utility-red-400 hover:text-utility-red-500"
	},
	warning: {
		root: "bg-utility-yellow-50 text-utility-yellow-700 ring-utility-yellow-200",
		addon: "text-utility-yellow-500",
		addonButton: "hover:bg-utility-yellow-100 text-utility-yellow-400 hover:text-utility-yellow-500"
	},
	success: {
		root: "bg-utility-green-50 text-utility-green-700 ring-utility-green-200",
		addon: "text-utility-green-500",
		addonButton: "hover:bg-utility-green-100 text-utility-green-400 hover:text-utility-green-500"
	},
	slate: {
		root: "bg-utility-slate-50 text-utility-slate-700 ring-utility-slate-200",
		addon: "text-utility-slate-500",
		addonButton: "hover:bg-utility-slate-100 text-utility-slate-400 hover:text-utility-slate-500"
	},
	sky: {
		root: "bg-utility-sky-50 text-utility-sky-700 ring-utility-sky-200",
		addon: "text-utility-sky-500",
		addonButton: "hover:bg-utility-sky-100 text-utility-sky-400 hover:text-utility-sky-500"
	},
	blue: {
		root: "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-200",
		addon: "text-utility-blue-500",
		addonButton: "hover:bg-utility-blue-100 text-utility-blue-400 hover:text-utility-blue-500"
	},
	indigo: {
		root: "bg-utility-indigo-50 text-utility-indigo-700 ring-utility-indigo-200",
		addon: "text-utility-indigo-500",
		addonButton: "hover:bg-utility-indigo-100 text-utility-indigo-400 hover:text-utility-indigo-500"
	},
	purple: {
		root: "bg-utility-purple-50 text-utility-purple-700 ring-utility-purple-200",
		addon: "text-utility-purple-500",
		addonButton: "hover:bg-utility-purple-100 text-utility-purple-400 hover:text-utility-purple-500"
	},
	pink: {
		root: "bg-utility-pink-50 text-utility-pink-700 ring-utility-pink-200",
		addon: "text-utility-pink-500",
		addonButton: "hover:bg-utility-pink-100 text-utility-pink-400 hover:text-utility-pink-500"
	},
	orange: {
		root: "bg-utility-orange-50 text-utility-orange-700 ring-utility-orange-200",
		addon: "text-utility-orange-500",
		addonButton: "hover:bg-utility-orange-100 text-utility-orange-400 hover:text-utility-orange-500"
	}
}, Lc = {
	[Fc.pillColor]: {
		common: "size-max flex items-center whitespace-nowrap rounded-full ring-1 ring-inset",
		styles: Ic
	},
	[Fc.badgeColor]: {
		common: "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset",
		styles: Ic
	},
	[Fc.badgeModern]: {
		common: "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset shadow-xs",
		styles: { gray: {
			root: "bg-primary text-secondary ring-primary",
			addon: "text-neutral-500",
			addonButton: "hover:bg-utility-neutral-100 text-utility-neutral-400 hover:text-utility-neutral-500"
		} }
	}
}, Rc = (e) => {
	let { type: t = "pill-color", size: n = "md", color: r = "gray", children: i } = e, a = Lc[t], o = {
		sm: "py-0.5 px-2 text-xs font-medium",
		md: "py-0.5 px-2.5 text-sm font-medium",
		lg: "py-1 px-3 text-sm font-medium"
	}, s = {
		sm: "py-0.5 px-1.5 text-xs font-medium",
		md: "py-0.5 px-2 text-sm font-medium",
		lg: "py-1 px-2.5 text-sm font-medium rounded-lg"
	}, c = {
		[Fc.pillColor]: o,
		[Fc.badgeColor]: s,
		[Fc.badgeModern]: s
	};
	return /* @__PURE__ */ C("span", {
		className: Z(a.common, c[t][n], a.styles[r].root, e.className),
		children: i
	});
}, zc = (e, t) => {
	let n = [], r = [e];
	for (; r.length > 0;) {
		let e = r.pop(), i = t.getChildren?.(e);
		if (i) for (let e of i) n.push(e.key), r.push(e.key);
	}
	return n;
}, Bc = (e, t) => {
	let n = [], r = t.getItem(e);
	for (; r?.parentKey != null;) n.push(r.parentKey), r = t.getItem(r.parentKey);
	return n;
}, Vc = (e, t, n) => {
	let r = new Set(e), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set();
	for (let n of e) t.has(n) || i.add(n);
	for (let n of t) e.has(n) || a.add(n);
	for (let e of i) for (let t of zc(e, n)) r.add(t);
	for (let e of a) for (let t of zc(e, n)) r.delete(t);
	let o = /* @__PURE__ */ new Set();
	for (let e of [...i, ...a]) for (let t of Bc(e, n)) o.add(t);
	let s = [...o].sort((e, t) => {
		let r = n.getItem(e)?.level ?? 0;
		return (n.getItem(t)?.level ?? 0) - r;
	});
	for (let e of s) {
		let t = zc(e, n);
		t.length !== 0 && (t.filter((e) => r.has(e)).length === t.length ? r.add(e) : r.delete(e));
	}
	return r;
}, Hc = (e, t) => {
	let n = document.createElement("div");
	n.style.display = "flex", n.style.flexDirection = "column", n.style.gap = "2px", n.style.position = "relative";
	let r = new Set([...t].map(String)), i = Array.from(e.querySelectorAll("[role=\"row\"]")), a = 0;
	for (let e of i) {
		let t = e.getAttribute("data-key") ?? e.id;
		if (!t || !r.has(t)) continue;
		let i = e.querySelector("div");
		if (!i) continue;
		let o = i.cloneNode(!0);
		o.style.paddingLeft = "8px", o.style.width = `${i.offsetWidth}px`, o.querySelectorAll("[data-tree-connector]").forEach((e) => e.remove()), n.appendChild(o), a++;
	}
	if (a > 1) {
		let e = document.createElement("div");
		e.textContent = String(a), Object.assign(e.style, {
			position: "absolute",
			top: "-6px",
			right: "-6px",
			width: "20px",
			height: "20px",
			borderRadius: "9999px",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: "12px",
			fontWeight: "600",
			color: "white",
			backgroundColor: "var(--color-bg-brand-solid, #7f56d9)"
		}), n.appendChild(e);
	}
	return n;
}, Uc = i({
	size: "sm",
	showConnectors: !1,
	selectedKeys: /* @__PURE__ */ new Set(),
	collectionRef: { current: null }
}), Wc = 24, Gc = 8, Kc = ({ type: e, size: t }) => /* @__PURE__ */ w("div", {
	className: "relative size-4 shrink-0",
	"data-tree-connector": !0,
	children: [e === "line" && /* @__PURE__ */ C("div", { className: Z("absolute top-1/2 left-1/2 w-px -translate-x-1/2 -translate-y-1/2 bg-border-secondary", t === "sm" ? "h-[42px]" : "h-[44px]") }), e === "end" && /* @__PURE__ */ C("div", {
		className: Z("absolute bottom-2 left-1/2 w-px -translate-x-1/2", t === "sm" ? "h-[22px]" : "h-[24px]"),
		children: /* @__PURE__ */ C("div", { className: Z("border-b border-l border-border-secondary", t === "sm" ? "h-[22px] w-[10px] rounded-bl-[5px]" : "h-[24px] w-[12px] rounded-bl-[6px]") })
	})]
}), qc = (e) => /* @__PURE__ */ C(M, {
	...e,
	className: "relative h-0 outline-hidden before:absolute before:inset-x-0 before:-top-px before:z-10 before:h-0.5 before:rounded-full before:bg-brand-solid"
}), Jc = ({ size: e = "sm", showConnectors: t = !1, draggable: n = !1, onReorder: r, onMove: i, className: a, selectedKeys: s, defaultSelectedKeys: c, onSelectionChange: l, selectionMode: u, dragAndDropHooks: m, ...h }) => {
	let g = f(null), _ = f(null), [v, y] = p(() => c === "all" ? "all" : c ? new Set(c) : /* @__PURE__ */ new Set()), b = f(c && c !== "all" ? new Set(c) : /* @__PURE__ */ new Set()), x = s !== void 0, S = x ? s : v, w = o((e) => {
		if (u !== "multiple" || !_.current) {
			l?.(e), x || y(e);
			return;
		}
		if (e === "all") {
			l?.(e), x || y(e), b.current = /* @__PURE__ */ new Set();
			return;
		}
		let t = Vc(e, b.current, _.current);
		b.current = t, x || y(t), l?.(t);
	}, [
		x,
		l,
		u
	]), T = o(() => {
		S === "all" ? b.current = /* @__PURE__ */ new Set() : b.current = new Set(S);
	}, [S]), { dragAndDropHooks: E } = Le({
		getItems: (e) => [...e].map((e) => ({ "text/plain": String(e) })),
		renderDragPreview: (e) => {
			if (!g.current) return /* @__PURE__ */ C("div", {});
			let t = new Set(e.map((e) => e["text/plain"]).filter((e) => e !== void 0)), n = Hc(g.current, t);
			return /* @__PURE__ */ C("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "2px",
					position: "relative"
				},
				ref: (e) => {
					e && e.replaceChildren(...Array.from(n.childNodes));
				}
			});
		},
		renderDropIndicator: (e) => /* @__PURE__ */ C(qc, { target: e }),
		onReorder: r ? (e) => {
			r({
				keys: e.keys,
				target: e.target
			}), T();
		} : void 0,
		onMove: i ? (e) => {
			i({
				keys: e.keys,
				target: e.target
			}), T();
		} : void 0
	}), D = m ?? (n ? E : void 0), O = d(() => ({
		size: e,
		showConnectors: t,
		selectedKeys: S,
		collectionRef: _
	}), [
		e,
		t,
		S
	]);
	return /* @__PURE__ */ C(Uc.Provider, {
		value: O,
		children: /* @__PURE__ */ C(Pe, {
			...h,
			ref: g,
			selectionMode: u,
			selectedKeys: S,
			onSelectionChange: w,
			dragAndDropHooks: D,
			className: (e) => Z("flex flex-col", typeof a == "function" ? a(e) : a)
		})
	});
}, Yc = ({ className: e, ...t }) => /* @__PURE__ */ C(Fe, {
	...t,
	className: (t) => Z("mt-0.5 outline-hidden first:mt-0", typeof e == "function" ? e(t) : e)
}), Xc = ({ icon: e, action: t, children: n, className: r }) => {
	let { size: i, showConnectors: o, selectedKeys: c, collectionRef: l } = s(Uc);
	return /* @__PURE__ */ C(Ie, { children: (s) => {
		let { id: u, state: d, hasChildItems: f, isExpanded: p, isSelected: m, isDisabled: h, selectionMode: g, isFocusVisible: _, allowsDragging: v, isDropTarget: y, level: b } = s, x = d.collection;
		l.current ||= x;
		let S = u != null && g === "multiple" && f && c !== "all" && (() => {
			let e = zc(u, x);
			if (e.length === 0) return !1;
			let t = e.filter((e) => c.has(e)).length;
			return t > 0 && (!m || t < e.length);
		})(), T = [];
		if (o && u != null && b > 1) {
			let e = u;
			for (let t = 0; t < b - 1; t++) {
				let n = x.getItem(e);
				if (!n?.parentKey) break;
				let r = [...x.getChildren(n.parentKey)], a = r[r.length - 1]?.key === e;
				T.unshift(/* @__PURE__ */ C(Kc, {
					size: i,
					type: a ? t === 0 ? "end" : "none" : "line"
				}, t)), e = n.parentKey;
			}
		}
		let O = o && b > 1 ? Gc : Gc + (b - 1) * Wc;
		return /* @__PURE__ */ w("div", {
			className: Z("flex w-full cursor-pointer items-center gap-2 rounded-sm -outline-offset-2 outline-focus-ring transition duration-100 ease-linear", i === "sm" ? "py-1.5 pr-2" : "py-2 pr-2", y && "bg-secondary_hover outline-2", !y && (m || S) && "bg-secondary hover:bg-secondary_hover", !y && !m && !S && "hover:bg-primary_hover", h && "cursor-not-allowed opacity-50", _ && "outline-2", r),
			style: { paddingLeft: O },
			children: [
				T,
				f && /* @__PURE__ */ C(E, {
					slot: "chevron",
					className: "flex shrink-0 items-center justify-center outline-hidden",
					children: C(p ? hi : _i, { className: "size-4 text-fg-quaternary" })
				}),
				g !== "none" && /* @__PURE__ */ C(D, {
					slot: "selection",
					className: "flex shrink-0 items-center justify-center outline-hidden",
					children: ({ isSelected: e, isDisabled: t, isFocusVisible: n }) => /* @__PURE__ */ C(vs, {
						size: "sm",
						isSelected: e || S,
						isIndeterminate: S,
						isDisabled: t,
						isFocusVisible: n
					})
				}),
				/* @__PURE__ */ w("div", {
					className: Z("flex min-w-0 flex-1 items-center", i === "sm" ? "gap-1.5" : "gap-2"),
					children: [
						e && (us(e) ? /* @__PURE__ */ C(e, { className: Z("shrink-0 text-fg-quaternary", i === "sm" ? "size-4" : "size-5") }) : a(e) ? e : null),
						/* @__PURE__ */ C("span", {
							className: "min-w-0 flex-1 truncate text-sm font-semibold text-tertiary",
							children: n
						}),
						t,
						v && /* @__PURE__ */ C(E, {
							slot: "drag",
							className: Z("shrink-0 cursor-grab outline-hidden", !m && "hidden"),
							children: /* @__PURE__ */ C(wi, { className: "size-4 text-fg-quaternary" })
						})
					]
				})
			]
		});
	} });
}, Zc = Jc;
Zc.Item = Yc, Zc.ItemContent = Xc, Zc.DropIndicator = qc;
// src/components/layout/CategoryTree.tsx
var Qc = [
	{ id: null },
	{ id: "outline" },
	{ id: "filled" },
	{ id: "color" }
], $c = "__all";
function el({ counts: e }) {
	let t = G((e) => e.filters.variant), n = G((e) => e.setVariant), r = q(), i = Qc.filter((t) => t.id === null || t.id === "outline" || t.id === "filled" || (e.get(t.id) ?? 0) > 0);
	return /* @__PURE__ */ C(Fs, {
		size: "sm",
		"aria-label": r("sidebar.iconVariant"),
		selectedKeys: [t ?? $c],
		disallowEmptySelection: !0,
		onSelectionChange: (e) => {
			let t = [...e][0];
			t !== void 0 && n(t === $c ? null : String(t));
		},
		className: "mb-2 flex w-full -space-x-0 gap-[3px] rounded-lg bg-[var(--muted2)] p-[3px] shadow-none",
		children: i.map((n) => {
			let i = n.id ? e.get(n.id) ?? 0 : null;
			return /* @__PURE__ */ w(Ps, {
				id: n.id ?? $c,
				className: "h-[26px] flex-1 justify-center gap-1 rounded-md bg-transparent px-1 py-0 text-[11.5px] font-medium text-tertiary ring-0 [&:not([data-selected])]:shadow-none not-last:pr-1 first:rounded-md last:rounded-md hover:bg-transparent selected:bg-primary selected:font-semibold selected:text-primary selected:shadow-[var(--shadow)]",
				children: [r(Vt(`variant.${n.id ?? "all"}`)), i !== null && /* @__PURE__ */ C("span", {
					className: `font-mono text-[10px] ${t === n.id ? "text-primary" : "text-[var(--muted-fg)]"}`,
					children: i
				})]
			}, String(n.id));
		})
	});
}
function tl() {
	let { tree: e, variantCounts: t } = Pc(), n = G((e) => e.filters), r = G((e) => e.catQ), i = G((e) => e.setCatQ), a = G((e) => e.clearCats), o = G((e) => e.toggleCat), s = G((e) => e.toggleSub), l = q(), u = G((e) => e.locale), m = d(() => e.map((e) => e.pack), [e]), h = d(() => e.flatMap((e) => e.cats.filter((e) => e.sub?.length).map((t) => `${e.pack}/${t.name}`)), [e]), [g, _] = p([]), v = f(!1);
	c(() => {
		!v.current && m.length && (v.current = !0, _(m));
	}, [m]);
	let y = m.every((e) => g.includes(e)) && h.every((e) => g.includes(e)), b = () => _(y ? [] : [...m, ...h]), x = d(() => e.map((e) => ({
		id: e.pack,
		label: e.label,
		count: e.count,
		kind: "pack",
		selected: !1,
		partial: !1,
		toggle: () => {},
		icon: Gi,
		children: e.cats.map((t) => {
			let r = !!t.sub?.length, i = n.categories.includes(t.name), a = r && t.sub.some((e) => n.subs.includes(`${t.name}/${e.slug}`));
			return {
				id: `${e.pack}/${t.name}`,
				label: t.name,
				count: t.count,
				kind: "cat",
				selected: i,
				partial: !i && a,
				toggle: () => o(t.name),
				icon: ki,
				children: (t.sub ?? []).map((r) => ({
					id: `${e.pack}/${t.name}/${r.slug}`,
					label: r.name,
					count: r.count,
					kind: "sub",
					selected: n.subs.includes(`${t.name}/${r.slug}`),
					partial: !1,
					toggle: () => s(t.name, r.slug),
					children: []
				}))
			};
		})
	})), [
		e,
		n.categories,
		n.subs,
		o,
		s
	]), S = n.categories.length > 0 || n.subs.length > 0;
	return /* @__PURE__ */ C(re, {
		locale: u,
		children: /* @__PURE__ */ w("div", {
			className: "-mx-[10px] mt-3 border-y border-[var(--border)] px-[10px] pt-[10px] pb-2",
			children: [
				/* @__PURE__ */ w("div", {
					className: "flex items-center gap-1.5 px-0.5 pb-2",
					children: [
						/* @__PURE__ */ C("h2", {
							className: "m-0 text-[11px] font-semibold text-tertiary",
							children: l("sidebar.categories")
						}),
						/* @__PURE__ */ C("span", { className: "flex-1" }),
						S && /* @__PURE__ */ C("button", {
							onClick: a,
							className: "cursor-pointer border-none bg-none p-0.5 text-[11px] text-tertiary",
							children: l("common.clear")
						}),
						/* @__PURE__ */ C(Ts, {
							content: l(y ? "sidebar.collapseAll" : "sidebar.expandAll"),
							children: /* @__PURE__ */ C("button", {
								onClick: b,
								"aria-label": l(y ? "sidebar.collapseAll" : "sidebar.expandAll"),
								className: "flex h-5 w-5 cursor-pointer items-center justify-center rounded-[5px] border border-[var(--border)] bg-primary text-tertiary",
								children: /* @__PURE__ */ C(K, {
									name: y ? "chevron-up" : "plus",
									size: 11,
									color: "currentColor"
								})
							})
						})
					]
				}),
				/* @__PURE__ */ w("div", {
					className: "relative mb-2",
					children: [/* @__PURE__ */ C(Xo, {
						size: "sm",
						icon: Qi,
						value: r,
						onChange: (e) => i(e.target.value),
						placeholder: l("sidebar.filterCategories"),
						"aria-label": l("sidebar.filterCategories"),
						inputClassName: r ? "pe-7" : void 0
					}), r && /* @__PURE__ */ C("button", {
						onClick: () => i(""),
						title: l("common.clear"),
						"aria-label": l("common.clear"),
						className: "absolute end-[1.5px] top-[2px] flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0",
						children: /* @__PURE__ */ C("span", {
							"aria-hidden": !0,
							className: "flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[var(--faint-fg)] text-[var(--bg)]",
							children: /* @__PURE__ */ C(K, {
								name: "close",
								size: 8,
								color: "currentColor"
							})
						})
					})]
				}),
				/* @__PURE__ */ C(el, { counts: t }),
				e.length === 0 ? /* @__PURE__ */ w("div", {
					className: "flex flex-col items-center gap-1.5 px-2 py-[18px] text-tertiary",
					children: [/* @__PURE__ */ C(K, {
						name: "search",
						size: 16,
						color: "var(--faint-fg)"
					}), /* @__PURE__ */ C("span", {
						className: "text-center text-[12px]",
						children: l("empty.noResults")
					})]
				}) : /* @__PURE__ */ C(Zc, {
					size: "sm",
					showConnectors: !0,
					"aria-label": l("sidebar.categories"),
					selectionMode: "none",
					items: x,
					expandedKeys: g,
					onExpandedChange: (e) => _([...e]),
					children: nl
				})
			]
		})
	});
}
function nl(e) {
	let t = e.selected || e.partial;
	return /* @__PURE__ */ w(Zc.Item, {
		id: e.id,
		textValue: e.label,
		children: [/* @__PURE__ */ C(Zc.ItemContent, {
			icon: e.icon,
			className: "py-1",
			children: /* @__PURE__ */ w("span", {
				className: "flex w-full items-center gap-1.5",
				children: [
					e.kind !== "pack" && /* @__PURE__ */ C("span", {
						onClick: (e) => e.stopPropagation(),
						onPointerDown: (e) => e.stopPropagation(),
						className: "flex items-center",
						children: /* @__PURE__ */ C(ys, {
							slot: null,
							isSelected: e.selected,
							isIndeterminate: e.partial,
							onChange: e.toggle,
							"aria-label": `Select ${e.label}`
						})
					}),
					/* @__PURE__ */ C("span", {
						className: e.kind === "pack" ? "font-mono text-[11.5px] font-semibold text-primary" : e.kind === "cat" ? "truncate text-[12.5px] font-normal text-primary capitalize" : "truncate text-[12px] font-normal text-tertiary",
						children: e.label
					}),
					/* @__PURE__ */ C(Rc, {
						type: "color",
						color: "gray",
						size: "sm",
						className: `ms-auto h-4 min-w-4 justify-center rounded px-1 font-mono text-[10px] font-normal ${t ? "text-primary" : "text-[var(--muted-fg)]"}`,
						children: e.count
					})
				]
			})
		}), e.children.length > 0 && /* @__PURE__ */ C(ee, {
			items: e.children,
			children: nl
		})]
	});
}
// src/components/layout/AppSidebar.tsx
var rl = [
	{
		id: "icons",
		key: "sidebar.scopeIcons"
	},
	{
		id: "packages",
		key: "sidebar.scopePackages"
	},
	{
		id: "categories",
		key: "sidebar.scopeCategories"
	},
	{
		id: "all",
		key: "sidebar.scopeAll"
	}
], il = {
	fontSize: 11,
	fontWeight: 600,
	color: "var(--muted-fg)"
}, al = { fontFamily: "'Geist Mono',monospace" }, ol = {
	border: "none",
	backgroundColor: "transparent",
	borderRadius: 4,
	fontSize: 11,
	cursor: "pointer",
	padding: 2
};
function sl() {
	let { catalog: e, page: t } = Pc(), n = G((e) => e.filters), r = l(), i = G((e) => e.selectAllPacks), a = G((e) => e.clearPacks), o = G((e) => e.favorites), s = G((e) => e.selection), c = G((e) => e.packageQuery), u = G((e) => e.sidebarOpen), f = G((e) => e.setSidebarOpen), p = q(), m = e?.packages ?? [], h = d(() => c ? m.filter((e) => e.label.toLowerCase().includes(c.toLowerCase())) : m, [m, c]), g = d(() => m.filter((e) => e.installed).map((e) => e.id), [m]), _ = d(() => {
		let t = new Set(h.filter((e) => n.packages.includes(e.id) && e.loaded).map((e) => e.id));
		return e?.icons ? e.icons.reduce((e, n) => e + +!!t.has(n.package), 0) : h.filter((e) => t.has(e.id)).reduce((e, t) => e + t.count, 0);
	}, [
		h,
		n.packages,
		e
	]);
	return /* @__PURE__ */ w(S, { children: [u && /* @__PURE__ */ C("div", {
		className: "ich-scrim",
		onClick: () => f(!1)
	}), /* @__PURE__ */ w("aside", {
		className: u ? "ich-sidebar open" : "ich-sidebar",
		style: {
			width: Dc(248),
			flex: "none",
			display: "flex",
			flexDirection: "column",
			borderRight: "1px solid var(--border)",
			background: "var(--bg)",
			minHeight: 0
		},
		children: [
			/* @__PURE__ */ C(cl, {}),
			/* @__PURE__ */ w("div", {
				className: "ich-side-scroll",
				style: {
					flex: 1,
					overflowY: "auto",
					padding: "2px 10px 10px",
					minHeight: 0
				},
				children: [
					/* @__PURE__ */ w("div", {
						className: "flex items-center gap-1.5 pt-2 px-0.5 pb-1",
						children: [
							/* @__PURE__ */ C("h2", {
								id: r,
								style: {
									...il,
									margin: 0
								},
								children: p("sidebar.packages")
							}),
							/* @__PURE__ */ w("span", {
								style: {
									...al,
									fontSize: 10,
									color: "var(--faint-fg)"
								},
								children: [
									m.filter((e) => n.packages.includes(e.id)).length,
									"/",
									m.length
								]
							}),
							/* @__PURE__ */ C("span", { className: "flex-1" }),
							/* @__PURE__ */ C("button", {
								onClick: () => i(g),
								style: {
									...ol,
									color: "var(--accent-text)",
									fontWeight: 500
								},
								children: p("common.all")
							}),
							/* @__PURE__ */ C("button", {
								onClick: a,
								style: {
									...ol,
									color: "var(--muted-fg)"
								},
								children: p("common.none")
							})
						]
					}),
					/* @__PURE__ */ C(O, {
						"aria-labelledby": r,
						value: n.packages,
						onChange: (e) => i(e),
						className: "flex flex-col gap-[1px]",
						children: h.map((e) => /* @__PURE__ */ C(D, {
							value: e.id,
							isDisabled: !e.installed,
							"aria-label": e.label,
							className: ({ isSelected: e, isDisabled: t, isFocusVisible: n }) => Z("flex h-[30px] items-center gap-2 rounded-[6px] px-1.5 outline-focus-ring", t ? "cursor-not-allowed opacity-55" : "cursor-pointer", e ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--muted2)]", n && "outline-2 -outline-offset-2"),
							children: ({ isSelected: t, isDisabled: n }) => /* @__PURE__ */ w(S, { children: [
								/* @__PURE__ */ C(vs, {
									size: "sm",
									isSelected: t,
									isDisabled: n
								}),
								/* @__PURE__ */ C("span", {
									title: e.description,
									className: "flex-1 min-w-0 text-[12.5px] font-medium whitespace-nowrap overflow-hidden text-ellipsis",
									children: e.label
								}),
								!e.installed && /* @__PURE__ */ C("span", {
									className: "text-[9.5px] text-[var(--faint-fg)] border border-[var(--border)] rounded-[4px] py-[1px] px-1",
									children: p("sidebar.notInstalled")
								}),
								/* @__PURE__ */ C("span", {
									style: {
										...al,
										fontSize: 10.5,
										color: "var(--muted-fg)"
									},
									children: gc(e.count)
								})
							] })
						}, e.id))
					}),
					/* @__PURE__ */ C(tl, {})
				]
			}),
			/* @__PURE__ */ w("div", {
				className: "flex-none border-t border-t-[var(--border)] py-2 px-3 flex flex-col gap-1",
				children: [
					/* @__PURE__ */ C(ll, {
						label: p("sidebar.inView"),
						value: gc(t.total)
					}),
					s.length > 0 && /* @__PURE__ */ C(ll, {
						label: p("sidebar.selected"),
						value: gc(s.length)
					}),
					/* @__PURE__ */ C(ll, {
						label: p("sidebar.loadedIcons"),
						value: gc(_)
					}),
					/* @__PURE__ */ C(ll, {
						label: p("sidebar.ecosystemTotal"),
						value: gc(e?.meta.total_ecosystem ?? 0)
					}),
					/* @__PURE__ */ C(ll, {
						label: p("sidebar.favorites"),
						value: gc(o.length)
					})
				]
			})
		]
	})] });
}
function cl() {
	let { catalog: e } = Pc(), t = q(), n = G((e) => e.searchScope), r = G((e) => e.setSearchScope), i = G((e) => e.setSearch), a = G((e) => e.clearSearch), o = G((e) => e.setCatQ), s = G((e) => e.setPackageQuery), l = G((e) => e.filters.search), [u, m] = p(l), h = f(null), g = (e) => {
		i(n === "icons" || n === "all" ? e : ""), o(n === "categories" || n === "all" ? e : ""), s(n === "packages" || n === "all" ? e : "");
	}, _ = (e) => {
		m(e), h.current && clearTimeout(h.current), h.current = setTimeout(() => g(e), 200);
	}, v = () => {
		m(""), h.current && clearTimeout(h.current), a(), o(""), s("");
	};
	c(() => {
		g(u);
	}, [n]);
	let y = d(() => {
		let t = u.trim().toLowerCase();
		return !t || !e ? {
			icons: 0,
			packages: 0,
			categories: 0
		} : {
			icons: e.icons.filter((e) => `${e.name} ${e.tags.join(" ")}`.toLowerCase().includes(t)).length,
			packages: e.packages.filter((e) => e.label.toLowerCase().includes(t)).length,
			categories: new Set(e.icons.map((e) => e.category)).size ? [...new Set(e.icons.map((e) => e.category))].filter((e) => e.toLowerCase().includes(t)).length : 0
		};
	}, [u, e]), b = t(n === "packages" ? "sidebar.filterPackages" : n === "categories" ? "sidebar.filterCategories" : n === "all" ? "sidebar.searchEverything" : "sidebar.filterIcons"), x = rl.map((n) => ({
		id: n.id,
		label: e && u.trim() && n.id !== "all" ? `${t(n.key)} ${gc(y[n.id])}` : t(n.key)
	}));
	return /* @__PURE__ */ w("div", {
		className: "pt-2.5 px-2.5 pb-1.5 flex flex-col gap-1.5",
		children: [/* @__PURE__ */ w("div", {
			className: "relative",
			children: [/* @__PURE__ */ C(Xo, {
				"data-role": "icon-filter",
				size: "sm",
				icon: Qi,
				value: u,
				onChange: (e) => _(e.target.value),
				placeholder: b,
				"aria-label": b,
				inputClassName: u ? "pe-8" : void 0
			}), u && /* @__PURE__ */ C("button", {
				onClick: v,
				title: t("common.clear"),
				"aria-label": t("common.clear"),
				className: "absolute end-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center border-0 bg-transparent cursor-pointer rounded-[4px] hover:bg-[var(--muted2)]",
				children: /* @__PURE__ */ C(K, {
					name: "close",
					size: 10,
					color: "var(--muted-fg)"
				})
			})]
		}), /* @__PURE__ */ C(Is, {
			label: t("sidebar.searchScope"),
			value: n,
			options: x,
			onChange: r,
			className: "w-full",
			itemClassName: "flex-auto px-1.5 whitespace-nowrap"
		})]
	});
}
function ll({ label: e, value: t }) {
	return /* @__PURE__ */ w("div", {
		className: "flex justify-between text-[11px] text-[var(--muted-fg)]",
		children: [/* @__PURE__ */ C("span", { children: e }), /* @__PURE__ */ C("span", {
			style: {
				...al,
				color: "var(--fg)"
			},
			children: t
		})]
	});
}
// src/hooks/useClipboard.ts
async function ul(e) {
	let t = typeof navigator < "u" ? navigator.clipboard : void 0;
	if (typeof e != "string" && t?.write && typeof ClipboardItem < "u") try {
		let n = Promise.resolve(e).then((e) => new Blob([e], { type: "text/plain" }));
		await t.write([new ClipboardItem({ "text/plain": n })]);
		return;
	} catch {}
	let n = await e;
	if (t?.writeText) {
		await t.writeText(n);
		return;
	}
	let r = document.createElement("textarea");
	r.value = n, r.style.position = "fixed", r.style.opacity = "0", document.body.appendChild(r), r.select();
	let i = document.execCommand("copy");
	if (document.body.removeChild(r), !i) throw Error("execCommand copy failed");
}
function dl() {
	let e = G((e) => e.showToast), t = q();
	return async (n, r = t("clipboard.copied")) => {
		try {
			await ul(n), e(r, "copy");
		} catch {
			e(t("clipboard.copyFailed"), "alert-circle");
		}
	};
}
// src/components/ui/ColorPicker.tsx
var fl = [
	"#09090b",
	"#71717a",
	"#7c3aed",
	"#2563eb",
	"#059669",
	"#e11d48",
	"#ea580c",
	"#0891b2"
];
function pl({ value: e, onChange: t }) {
	let [n, r] = p(265), [i, a] = p(50), [o, s] = p(100), [c, l] = p(e ?? "#7c3aed"), u = q(), d = bc(n, 50), f = (e, n) => t(n >= 100 ? e : qe(e, n)), m = (e, t) => {
		let n = bc(e, t);
		l(n), f(n, o);
	};
	return /* @__PURE__ */ w("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ w("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ C("span", {
					className: "text-[10.5px] font-semibold text-[var(--muted-fg)]",
					children: u("color.previewColor")
				}), /* @__PURE__ */ C("button", {
					onClick: () => t(null),
					style: {
						border: "none",
						backgroundColor: "transparent",
						color: e ? "var(--accent)" : "var(--faint-fg)",
						fontSize: 10.5,
						cursor: "pointer",
						padding: 2
					},
					children: u("color.resetToTheme")
				})]
			}),
			/* @__PURE__ */ C("div", {
				className: "flex gap-[5px] flex-wrap",
				children: fl.map((n) => /* @__PURE__ */ C("button", {
					onClick: () => {
						l(n), t(n);
					},
					title: n,
					style: {
						width: 22,
						height: 22,
						borderRadius: 6,
						background: n,
						border: e === n ? "2px solid var(--fg)" : "1px solid var(--border)",
						cursor: "pointer"
					}
				}, n))
			}),
			/* @__PURE__ */ C("input", {
				type: "range",
				className: "ich-hue",
				min: 0,
				max: 360,
				value: n,
				onChange: (e) => {
					let t = Number(e.target.value);
					r(t), m(t, i);
				},
				style: { width: "100%" }
			}),
			/* @__PURE__ */ C("input", {
				type: "range",
				className: "ich-light",
				min: 12,
				max: 88,
				value: i,
				onChange: (e) => {
					let t = Number(e.target.value);
					a(t), m(n, t);
				},
				style: {
					width: "100%",
					"--pick-mid": d
				}
			}),
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-[7px]",
				children: [
					/* @__PURE__ */ C("span", { style: {
						width: 20,
						height: 20,
						borderRadius: 6,
						background: e ?? d,
						border: "1px solid var(--border)",
						flex: "none"
					} }),
					/* @__PURE__ */ C($o, {
						size: "sm",
						value: c,
						onChange: (e) => {
							l(e), Ke(e) && f(e, o);
						},
						placeholder: "#7c3aed",
						"aria-label": u("appearance.customHex"),
						inputClassName: "font-mono",
						className: "min-w-0 flex-1"
					}),
					/* @__PURE__ */ C($o, {
						size: "sm",
						inputMode: "numeric",
						value: String(o),
						onChange: (e) => {
							let t = Math.max(0, Math.min(100, Number(e) || 0));
							s(t), Ke(c) && f(c, t);
						},
						"aria-label": u("color.opacity"),
						inputClassName: "text-right font-mono",
						className: "w-14 flex-none"
					})
				]
			})
		]
	});
}
// src/modules/svg/domain/svgPolicy.ts
var ml = {
	version: 2,
	_source: "phase-3-redesign.md §4.1, transcribed with its structure intact. JSONC comments became _comment keys because three runtimes parse this with strict JSON parsers; no value was changed, reordered or tidied.",
	_contract: "A POSITIVE specification derived from the engineering brief §1.3 fidelity contract: everything listed here MUST survive sanitisation, and anything stripping it is a bug, not security. The design rule is block by VALUE, not by name -- blunt tag bans over-block legitimate content and still miss real attacks.",
	_home: "core/resources/security/svg-policy.json. §4.1 says 'committed at the workspace root', which is not possible: the ichava workspace root is not a git repository, so a file there would be unversioned and would ship with nothing. It lives in ichava/core instead, the package every PHP consumer already depends on, and the JS and Python runtimes carry a synced copy checked by test.",
	allowedTags: /* @__PURE__ */ "svg.g.defs.symbol.title.desc.metadata.switch.path.circle.ellipse.rect.line.polyline.polygon.text.tspan.textPath.linearGradient.radialGradient.stop.pattern.mask.clipPath.filter.feBlend.feColorMatrix.feComponentTransfer.feComposite.feConvolveMatrix.feDiffuseLighting.feDisplacementMap.feDropShadow.feFlood.feFuncA.feFuncB.feFuncG.feFuncR.feGaussianBlur.feMerge.feMergeNode.feMorphology.feOffset.feSpecularLighting.feTile.feTurbulence.use".split("."),
	_allowedTags_comment: {
		stop: "REQUIRED. A gradient element with no stops paints nothing. The shipped PHP config allowed linearGradient while stripping stop, and allow-listed the offset/stop-color ATTRIBUTES of an element it removed.",
		title: "REQUIRED. Thousands of icons in the measured corpus carry one; it is the accessible name.",
		use: "Fragment references ONLY -- see fragmentOnlyRefs."
	},
	allowedAttributes: /* @__PURE__ */ "fill.stroke.stroke-width.stroke-linecap.stroke-linejoin.stroke-dasharray.stroke-dashoffset.stroke-miterlimit.fill-rule.fill-opacity.stroke-opacity.opacity.transform.transform-origin.viewBox.preserveAspectRatio.x.y.cx.cy.r.rx.ry.d.points.width.height.gradientUnits.gradientTransform.patternUnits.patternTransform.offset.stop-color.stop-opacity.clip-path.clip-rule.mask.filter.font-family.font-size.font-weight.text-anchor.dominant-baseline.letter-spacing.vector-effect.paint-order.shape-rendering.class.id.xmlns.xmlns:xlink.role.x1.y1.x2.y2.fx.fy.fr.spreadMethod.clipPathUnits.maskUnits.maskContentUnits".split("."),
	_allowedAttributes_addendum: "The last row is NOT in phase-3-redesign.md §4.1 and is added here deliberately. §4.1 (and brief §1.3 before it) list gradientUnits and gradientTransform but omit the coordinates a gradient is actually drawn with. A <linearGradient> without x1/y1/x2/y2 has no direction, a <radialGradient> without fx/fy/fr has no focal point, and clipPathUnits / maskUnits / maskContentUnits decide whether a clip or mask is interpreted in user space or object space -- get it wrong and the shape is clipped to nothing. The shipped PHP config had all eleven; adopting §4.1 verbatim would have REMOVED them and broken all 65 gradient icons plus every clip and mask. Caught by diffing the effective config before and after this file was wired in. This is the same single-archetype omission §1.1 describes, one level up: the spec was written from the fidelity contract, and the fidelity contract itself was incomplete.",
	allowedAttributePrefixes: ["aria-"],
	_allowedAttributePrefixes_comment: "Includes aria-labelledby and aria-describedby. Allowed by SHAPE rather than by list, so a newly standardised ARIA attribute cannot become an accessibility regression. Hundreds of icons in the measured corpus carry aria-labelledby, and it is the line most often forgotten when ids are rewritten.",
	allowedValues: [
		"currentColor",
		"var(--token)",
		"url(#local-ref)"
	],
	_allowedValues_comment: "currentColor is theme inheritance -- without it there is no theming at all. var(--token) is the Tailwind v4 @theme integration. url(#local-ref) covers gradients, masks and filters.",
	fragmentOnlyRefs: {
		attributes: ["href", "xlink:href"],
		allow: "^#[A-Za-z_][\\w.:-]*$",
		_comment: "Fragments are inert: they cannot fetch, leak or execute. Blocking them destroys <use>, <textPath>, <mpath> and feImage for zero security benefit. Everything else -- absolute, protocol-relative, relative, data:, javascript:, blob:, filesystem: -- is blocked. 261 icons in the measured corpus use <use>, 126 of them in the flag pack."
	},
	styleAttribute: {
		allow: "declarations, CSS custom properties, url(#fragment)",
		block: [
			"url() with any non-fragment target",
			"expression(",
			"behavior:",
			"-moz-binding"
		],
		_comment: "REQUIRED. Sole paint source for 3,239 icons in the measured corpus, 2 of them flags. In one proprietary icon set it paints about half the icons and almost none use currentColor. url(#gradient) must work; url(https://…) is the CSS exfiltration vector.",
		_count_note: "§4.1 records 59 fewer icons for one pack here. The census measured the higher count on 2026-09-02 (style-attribute paint source). The policy is unchanged either way; the figure is corrected rather than carried forward."
	},
	forbiddenTags: [
		"script",
		"foreignObject",
		"iframe",
		"object",
		"embed",
		"style",
		"animate",
		"animateTransform",
		"set"
	],
	_forbiddenTags_comment: {
		style: "The style ELEMENT stays blocked, distinct from the style ATTRIBUTE which is widened. 54 files contain it, only 2 depend on it for paint. Blocking costs 2 icons and removes the CSS-exfiltration surface entirely; log those 2 as known-degraded.",
		foreignObject: "Never widens. 6 occurrences, all Illustrator metadata. It embeds arbitrary HTML inside SVG and is a standard sanitiser bypass.",
		animate: "SMIL stays blocked, for free: corpus count of animate/set/attributeName is ZERO. If it is ever enabled, blocking attributeName values of href/xlink:href/style/class/on* becomes mandatory -- that is the post-sanitiser attribute-rewrite vector, and it is frequently missed."
	},
	denyAttributePrefixes: ["on"],
	stripDoctype: !0,
	stripEntities: !0,
	stripComments: !0,
	blockImageNonFragmentHref: !0,
	blockAnchorNonFragmentHref: !0,
	blockCdataScript: !0,
	_always_blocked_comment: "stripDoctype and stripEntities cover XXE and billion-laughs. <image> and <a> with a non-fragment href are blocked, which is why 5 brand logos that embed a raster image render blank -- known-degraded by policy, OQ-018."
};
function hl() {
	let e = [...ml.allowedAttributes];
	return ml.styleAttribute && e.push("style"), e.push(...ml.fragmentOnlyRefs?.attributes ?? []), [...new Set(e)];
}
function gl() {
	return new RegExp(ml.fragmentOnlyRefs.allow);
}
function _l(e) {
	let t = e.toLowerCase();
	if (t.includes("expression(") || t.includes("behavior:") || t.includes("-moz-binding") || t.includes("@import")) return !1;
	for (let t of e.matchAll(/url\(\s*(['"]?)([^'")]*)\1\s*\)/gi)) if (!(t[2] ?? "").startsWith("#")) return !1;
	return !0;
}
// node_modules/dompurify/dist/purify.es.mjs
function vl(e, t) {
	this.v = e, this.k = t;
}
function yl(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function bl(e) {
	if (Array.isArray(e)) return e;
}
function xl(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Sl() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Cl(e, t) {
	return bl(e) || xl(e, t) || wl(e, t) || Sl();
}
function wl(e, t) {
	if (e) {
		if (typeof e == "string") return yl(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yl(e, t) : void 0;
	}
}
function Tl(e) {
	var t, n;
	function r(t, n) {
		try {
			var a = e[t](n), o = a.value, s = o instanceof vl;
			Promise.resolve(s ? o.v : o).then(function(n) {
				if (s) {
					var c = t === "return" && o.k ? t : "next";
					if (!o.k || n.done) return r(c, n);
					n = e[c](n).value;
				}
				i(!!a.done, n);
			}, function(e) {
				r("throw", e);
			});
		} catch (e) {
			i(2, e);
		}
	}
	function i(e, i) {
		e === 2 ? t.reject(i) : t.resolve({
			value: i,
			done: e
		}), (t = t.next) ? r(t.key, t.arg) : n = null;
	}
	this._invoke = function(e, i) {
		return new Promise(function(a, o) {
			var s = {
				key: e,
				arg: i,
				resolve: a,
				reject: o,
				next: null
			};
			n ? n = n.next = s : (t = n = s, r(e, i));
		});
	}, typeof e.return != "function" && (this.return = void 0);
}
Tl.prototype[typeof Symbol == "function" && Symbol.asyncIterator || "@@asyncIterator"] = function() {
	return this;
}, Tl.prototype.next = function(e) {
	return this._invoke("next", e);
}, Tl.prototype.throw = function(e) {
	return this._invoke("throw", e);
}, Tl.prototype.return = function(e) {
	return this._invoke("return", e);
};
var El = Object.entries, Dl = Object.setPrototypeOf, Ol = Object.isFrozen, kl = Object.getPrototypeOf, Al = Object.getOwnPropertyDescriptor, jl = Object.freeze, Ml = Object.seal, Nl = Object.create, Pl = typeof Reflect < "u" && Reflect, Fl = Pl.apply, Il = Pl.construct;
jl ||= function(e) {
	return e;
}, Ml ||= function(e) {
	return e;
}, Fl ||= function(e, t) {
	var n = [...arguments].slice(2);
	return e.apply(t, n);
}, Il ||= function(e) {
	return new e(...[...arguments].slice(1));
};
var Ll = su(Array.prototype.forEach);
Array.prototype.indexOf;
var Rl = su(Array.prototype.lastIndexOf), zl = su(Array.prototype.pop), Bl = su(Array.prototype.push), Vl = su(Array.prototype.slice), Hl = su(Array.prototype.splice), Ul = Array.isArray, Wl = cu(Set), Gl = su(Set.prototype.add), Kl = su(Set.prototype.has), ql = su(String.prototype.toLowerCase), Jl = su(String.prototype.toString), Yl = su(String.prototype.match), Xl = su(String.prototype.replace), Zl = su(String.prototype.indexOf), Ql = su(String.prototype.trim), $l = su(Number.prototype.toString), eu = su(Boolean.prototype.toString), tu = typeof BigInt > "u" ? null : su(BigInt.prototype.toString), nu = typeof Symbol > "u" ? null : su(Symbol.prototype.toString), ru = su(Object.prototype.hasOwnProperty), iu = su(Object.prototype.toString), au = su(RegExp.prototype.test), ou = cu(TypeError);
function su(e) {
	return function(t) {
		t instanceof RegExp && (t.lastIndex = 0);
		var n = [...arguments].slice(1);
		return Fl(e, t, n);
	};
}
function cu(e) {
	return function() {
		return Il(e, [...arguments]);
	};
}
function $(e, t) {
	let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : ql;
	if (Dl && Dl(e, null), !Ul(t)) return e;
	let r = t.length;
	for (; r--;) {
		let i = t[r];
		if (typeof i == "string") {
			let e = n(i);
			e !== i && (Ol(t) || (t[r] = e), i = e);
		}
		e[i] = !0;
	}
	return e;
}
function lu(e) {
	for (let t = 0; t < e.length; t++) ru(e, t) || (e[t] = null);
	return e;
}
function uu(e) {
	let t = Nl(null);
	for (let r of El(e)) {
		var n = Cl(r, 2);
		let i = n[0], a = n[1];
		ru(e, i) && (t[i] = Ul(a) ? lu(a) : a && typeof a == "object" && a.constructor === Object ? uu(a) : a);
	}
	return t;
}
function du(e) {
	switch (typeof e) {
		case "string": return e;
		case "number": return $l(e);
		case "boolean": return eu(e);
		case "bigint": return tu ? tu(e) : "0";
		case "symbol": return nu ? nu(e) : "Symbol()";
		case "undefined": return iu(e);
		case "function":
		case "object": {
			if (e === null) return iu(e);
			let t = e, n = fu(t, "toString");
			if (typeof n == "function") {
				let e = n(t);
				return typeof e == "string" ? e : iu(e);
			}
			return iu(e);
		}
		default: return iu(e);
	}
}
function fu(e, t) {
	for (; e !== null;) {
		let n = Al(e, t);
		if (n) {
			if (n.get) return su(n.get);
			if (typeof n.value == "function") return su(n.value);
		}
		e = kl(e);
	}
	function n() {
		return null;
	}
	return n;
}
function pu(e, t) {
	for (; e !== null;) {
		let n = Al(e, t);
		if (n) return n.get ? su(n.get) : null;
		e = kl(e);
	}
	return null;
}
function mu(e) {
	try {
		return au(e, ""), !0;
	} catch {
		return !1;
	}
}
var hu = jl(/* @__PURE__ */ "a.abbr.acronym.address.area.article.aside.audio.b.bdi.bdo.big.blink.blockquote.body.br.button.canvas.caption.center.cite.code.col.colgroup.content.data.datalist.dd.decorator.del.details.dfn.dialog.dir.div.dl.dt.element.em.fieldset.figcaption.figure.font.footer.form.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.i.img.input.ins.kbd.label.legend.li.main.map.mark.marquee.menu.menuitem.meter.nav.nobr.ol.optgroup.option.output.p.picture.pre.progress.q.rp.rt.ruby.s.samp.search.section.select.shadow.slot.small.source.spacer.span.strike.strong.style.sub.summary.sup.table.tbody.td.template.textarea.tfoot.th.thead.time.tr.track.tt.u.ul.var.video.wbr".split(".")), gu = jl(/* @__PURE__ */ "svg.a.altglyph.altglyphdef.altglyphitem.animatecolor.animatemotion.animatetransform.circle.clippath.defs.desc.ellipse.enterkeyhint.exportparts.filter.font.g.glyph.glyphref.hkern.image.inputmode.line.lineargradient.marker.mask.metadata.mpath.part.path.pattern.polygon.polyline.radialgradient.rect.stop.style.switch.symbol.text.textpath.title.tref.tspan.view.vkern".split(".")), _u = jl([
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence"
]), vu = jl([
	"animate",
	"color-profile",
	"cursor",
	"discard",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignobject",
	"hatch",
	"hatchpath",
	"mesh",
	"meshgradient",
	"meshpatch",
	"meshrow",
	"missing-glyph",
	"script",
	"set",
	"solidcolor",
	"unknown",
	"use"
]), yu = jl(/* @__PURE__ */ "math.menclose.merror.mfenced.mfrac.mglyph.mi.mlabeledtr.mmultiscripts.mn.mo.mover.mpadded.mphantom.mroot.mrow.ms.mspace.msqrt.mstyle.msub.msup.msubsup.mtable.mtd.mtext.mtr.munder.munderover.mprescripts".split(".")), bu = jl([
	"maction",
	"maligngroup",
	"malignmark",
	"mlongdiv",
	"mscarries",
	"mscarry",
	"msgroup",
	"mstack",
	"msline",
	"msrow",
	"semantics",
	"annotation",
	"annotation-xml",
	"mprescripts",
	"none"
]), xu = jl(["#text"]), Su = jl(/* @__PURE__ */ "accept.action.align.alt.autocapitalize.autocomplete.autopictureinpicture.autoplay.background.bgcolor.border.capture.cellpadding.cellspacing.checked.cite.class.clear.color.cols.colspan.command.commandfor.controls.controlslist.coords.crossorigin.datetime.decoding.default.dir.disabled.disablepictureinpicture.disableremoteplayback.download.draggable.enctype.enterkeyhint.exportparts.face.for.headers.height.hidden.high.href.hreflang.id.inert.inputmode.integrity.ismap.kind.label.lang.list.loading.loop.low.max.maxlength.media.method.min.minlength.multiple.muted.name.nonce.noshade.novalidate.nowrap.open.optimum.part.pattern.placeholder.playsinline.popover.popovertarget.popovertargetaction.poster.preload.pubdate.radiogroup.readonly.rel.required.rev.reversed.role.rows.rowspan.spellcheck.scope.selected.shape.size.sizes.slot.span.srclang.start.src.srcset.step.style.summary.tabindex.title.translate.type.usemap.valign.value.width.wrap.xmlns".split(".")), Cu = jl(/* @__PURE__ */ "accent-height.accumulate.additive.alignment-baseline.amplitude.ascent.attributename.attributetype.azimuth.basefrequency.baseline-shift.begin.bias.by.class.clip.clippathunits.clip-path.clip-rule.color.color-interpolation.color-interpolation-filters.color-profile.color-rendering.cx.cy.d.dx.dy.diffuseconstant.direction.display.divisor.dominant-baseline.dur.edgemode.elevation.end.exponent.fill.fill-opacity.fill-rule.filter.filterunits.flood-color.flood-opacity.font-family.font-size.font-size-adjust.font-stretch.font-style.font-variant.font-weight.fx.fy.g1.g2.glyph-name.glyphref.gradientunits.gradienttransform.height.href.id.image-rendering.in.in2.intercept.k.k1.k2.k3.k4.kerning.keypoints.keysplines.keytimes.lang.lengthadjust.letter-spacing.kernelmatrix.kernelunitlength.lighting-color.local.marker-end.marker-mid.marker-start.markerheight.markerunits.markerwidth.maskcontentunits.maskunits.max.mask.mask-type.media.method.mode.min.name.numoctaves.offset.operator.opacity.order.orient.orientation.origin.overflow.paint-order.path.pathlength.patterncontentunits.patterntransform.patternunits.pointer-events.points.preservealpha.preserveaspectratio.primitiveunits.r.rx.ry.radius.refx.refy.repeatcount.repeatdur.restart.result.rotate.scale.seed.shape-rendering.slope.specularconstant.specularexponent.spreadmethod.startoffset.stddeviation.stitchtiles.stop-color.stop-opacity.stroke-dasharray.stroke-dashoffset.stroke-linecap.stroke-linejoin.stroke-miterlimit.stroke-opacity.stroke.stroke-width.style.surfacescale.systemlanguage.tabindex.tablevalues.targetx.targety.transform.transform-origin.text-anchor.text-decoration.text-orientation.text-rendering.textlength.type.u1.u2.unicode.values.vector-effect.viewbox.visibility.version.vert-adv-y.vert-origin-x.vert-origin-y.width.word-spacing.wrap.writing-mode.xchannelselector.ychannelselector.x.x1.x2.xmlns.y.y1.y2.z.zoomandpan".split(".")), wu = jl(/* @__PURE__ */ "accent.accentunder.align.bevelled.close.columnalign.columnlines.columnspacing.columnspan.denomalign.depth.dir.display.displaystyle.encoding.fence.frame.height.href.id.largeop.length.linethickness.lquote.lspace.mathbackground.mathcolor.mathsize.mathvariant.maxsize.minsize.movablelimits.notation.numalign.open.rowalign.rowlines.rowspacing.rowspan.rspace.rquote.scriptlevel.scriptminsize.scriptsizemultiplier.selection.separator.separators.stretchy.subscriptshift.supscriptshift.symmetric.voffset.width.xmlns".split(".")), Tu = jl([
	"xlink:href",
	"xml:id",
	"xlink:title",
	"xml:space",
	"xmlns:xlink"
]), Eu = Ml(/{{[\w\W]*|^[\w\W]*}}/g), Du = Ml(/<%[\w\W]*|^[\w\W]*%>/g), Ou = Ml(/\${[\w\W]*/g), ku = Ml(/^data-[\-\w.\u00B7-\uFFFF]+$/), Au = Ml(/^aria-[\-\w]+$/), ju = Ml(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), Mu = Ml(/^(?:\w+script|data):/i), Nu = Ml(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), Pu = Ml(/^html$/i), Fu = Ml(/^[a-z][.\w]*(-[.\w]+)+$/i), Iu = Ml(/<[/\w!]/g), Lu = Ml(/<[/\w]/g), Ru = Ml(/<\/no(script|embed|frames)/i), zu = Ml(/\/>/i), Bu = {
	element: 1,
	attribute: 2,
	text: 3,
	cdataSection: 4,
	entityReference: 5,
	entityNode: 6,
	processingInstruction: 7,
	comment: 8,
	document: 9,
	documentType: 10,
	documentFragment: 11,
	notation: 12
}, Vu = jl($({}, [
	"style",
	"script",
	"xmp",
	"iframe",
	"noembed",
	"noframes",
	"plaintext",
	"noscript"
])), Hu = function() {
	return typeof window > "u" ? null : window;
}, Uu = function(e, t) {
	if (typeof e != "object" || typeof e.createPolicy != "function") return null;
	let n = null, r = "data-tt-policy-suffix";
	t && t.hasAttribute(r) && (n = t.getAttribute(r));
	let i = "dompurify" + (n ? "#" + n : "");
	try {
		return e.createPolicy(i, {
			createHTML(e) {
				return e;
			},
			createScriptURL(e) {
				return e;
			}
		});
	} catch {
		return console.warn("TrustedTypes policy " + i + " could not be created."), null;
	}
}, Wu = function() {
	return {
		afterSanitizeAttributes: [],
		afterSanitizeElements: [],
		afterSanitizeShadowDOM: [],
		beforeSanitizeAttributes: [],
		beforeSanitizeElements: [],
		beforeSanitizeShadowDOM: [],
		uponSanitizeAttribute: [],
		uponSanitizeElement: [],
		uponSanitizeShadowNode: []
	};
}, Gu = function(e, t, n, r) {
	return ru(e, t) && Ul(e[t]) ? $(r.base ? uu(r.base) : {}, e[t], r.transform) : n;
}, Ku = function(e, t, n) {
	let r = ru(e, t) ? e[t] : void 0;
	return r && typeof r == "object" ? uu(r) : n();
};
function qu() {
	let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Hu(), t = (e) => qu(e);
	if (t.version = "3.4.17", t.removed = [], !e || !e.document || e.document.nodeType !== Bu.document || !e.Element) return t.isSupported = !1, t;
	let n = e.document, r = n, i = r.currentScript;
	e.DocumentFragment;
	let a = e.HTMLTemplateElement, o = e.Node, s = e.Element, c = e.NodeFilter;
	e.NamedNodeMap === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
	let l = e.DOMParser, u = e.trustedTypes, d = s.prototype, f = fu(d, "cloneNode"), p = fu(d, "remove"), m = fu(d, "removeAttributeNode"), h = fu(d, "nextSibling"), g = fu(d, "childNodes"), _ = fu(d, "parentNode"), v = fu(d, "shadowRoot"), y = fu(d, "attributes"), b = o && o.prototype ? fu(o.prototype, "nodeType") : null, x = o && o.prototype ? fu(o.prototype, "nodeName") : null, S = o && o.prototype ? fu(o.prototype, "ownerDocument") : null, C = function(e) {
		return b ? b(e) : e.nodeType;
	}, w = function(e) {
		return x ? x(e) : e.nodeName;
	}, T = pu(d, "namespaceURI"), E = function(e) {
		return T ? T(e) : e.namespaceURI;
	};
	if (typeof a == "function") {
		let e = n.createElement("template");
		e.content && e.content.ownerDocument && (n = e.content.ownerDocument);
	}
	let D, O = "", ee, te = !1, k = 0, A = function() {
		if (k > 0) throw ou("A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the \"DOMPurify and Trusted Types\" section of the README.");
	}, j = function(e) {
		A(), k++;
		try {
			return D.createHTML(e);
		} finally {
			k--;
		}
	}, M = function(e) {
		A(), k++;
		try {
			return D.createScriptURL(e);
		} finally {
			k--;
		}
	}, N = function() {
		return te ||= (ee = Uu(u, i), !0), ee;
	}, P = n, F = P.implementation, I = P.createNodeIterator, ne = P.createDocumentFragment, re = P.getElementsByTagName, L = r.importNode, R = Wu();
	t.isSupported = typeof El == "function" && typeof _ == "function" && F && F.createHTMLDocument !== void 0;
	let z = Eu, ie = Du, B = Ou, ae = ku, oe = Au, se = Mu, ce = Nu, le = Fu, ue = ju, V = null, de = $({}, [
		...hu,
		...gu,
		..._u,
		...yu,
		...xu
	]), H = null, fe = $({}, [
		...Su,
		...Cu,
		...wu,
		...Tu
	]), U = Object.seal(Nl(null, {
		tagNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		allowCustomizedBuiltInElements: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: !1
		}
	})), pe = null, me = null, he = Object.seal(Nl(null, {
		tagCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		}
	})), ge = !0, _e = !0, ve = !1, ye = !0, be = !1, xe = !0, Se = !1, Ce = !1, we = null, Te = null, Ee = !1, De = !1, Oe = !1, ke = !1, Ae = !0, je = !1, Me = "user-content-", Ne = !0, Pe = !1, Fe = null, Ie = {}, Le = null, Re = $({}, /* @__PURE__ */ "annotation-xml.audio.colgroup.desc.foreignobject.head.iframe.math.mi.mn.mo.ms.mtext.noembed.noframes.noscript.plaintext.script.selectedcontent.style.svg.template.thead.title.video.xmp".split(".")), ze = null, Be = $({}, [
		"audio",
		"video",
		"img",
		"source",
		"image",
		"track"
	]), Ve = null, He = $({}, [
		"alt",
		"class",
		"for",
		"id",
		"label",
		"name",
		"pattern",
		"placeholder",
		"role",
		"summary",
		"title",
		"value",
		"style",
		"xmlns"
	]), Ue = "http://www.w3.org/1998/Math/MathML", We = "http://www.w3.org/2000/svg", Ge = "http://www.w3.org/1999/xhtml", Ke = Ge, qe = !1, Je = null, Ye = $({}, [
		Ue,
		We,
		Ge
	], Jl), Xe = jl([
		"mi",
		"mo",
		"mn",
		"ms",
		"mtext"
	]), Ze = $({}, Xe), Qe = jl(["annotation-xml"]), $e = $({}, Qe), et = $({}, [
		"title",
		"style",
		"font",
		"a",
		"script"
	]), tt = null, nt = ["application/xhtml+xml", "text/html"], rt = null, it = null, at = n.createElement("form"), ot = function(e) {
		return e instanceof RegExp || e instanceof Function;
	}, st = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		if (it && it === e) return;
		e && typeof e == "object" || (e = {}), e = uu(e), tt = nt.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? "text/html" : e.PARSER_MEDIA_TYPE, rt = tt === "application/xhtml+xml" ? Jl : ql, V = Gu(e, "ALLOWED_TAGS", de, { transform: rt }), H = Gu(e, "ALLOWED_ATTR", fe, { transform: rt }), Je = Gu(e, "ALLOWED_NAMESPACES", Ye, { transform: Jl }), Ve = Gu(e, "ADD_URI_SAFE_ATTR", He, {
			transform: rt,
			base: He
		}), ze = Gu(e, "ADD_DATA_URI_TAGS", Be, {
			transform: rt,
			base: Be
		}), Le = Gu(e, "FORBID_CONTENTS", Re, { transform: rt }), pe = Gu(e, "FORBID_TAGS", uu({}), { transform: rt }), me = Gu(e, "FORBID_ATTR", uu({}), { transform: rt }), Ie = ru(e, "USE_PROFILES") ? e.USE_PROFILES && typeof e.USE_PROFILES == "object" ? uu(e.USE_PROFILES) : e.USE_PROFILES : !1, ge = e.ALLOW_ARIA_ATTR !== !1, _e = e.ALLOW_DATA_ATTR !== !1, ve = e.ALLOW_UNKNOWN_PROTOCOLS || !1, ye = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1, be = e.SAFE_FOR_TEMPLATES || !1, xe = e.SAFE_FOR_XML !== !1, Se = e.WHOLE_DOCUMENT || !1, De = e.RETURN_DOM || !1, Oe = e.RETURN_DOM_FRAGMENT || !1, ke = e.RETURN_TRUSTED_TYPE || !1, Ee = e.FORCE_BODY || !1, Ae = e.SANITIZE_DOM !== !1, je = e.SANITIZE_NAMED_PROPS || !1, Ne = e.KEEP_CONTENT !== !1, Pe = e.IN_PLACE || !1, ue = mu(e.ALLOWED_URI_REGEXP) ? e.ALLOWED_URI_REGEXP : ju, Ke = typeof e.NAMESPACE == "string" ? e.NAMESPACE : Ge, Ze = Ku(e, "MATHML_TEXT_INTEGRATION_POINTS", () => $({}, Xe)), $e = Ku(e, "HTML_INTEGRATION_POINTS", () => $({}, Qe));
		let t = Ku(e, "CUSTOM_ELEMENT_HANDLING", () => Nl(null));
		if (U = Nl(null), ru(t, "tagNameCheck") && ot(t.tagNameCheck) && (U.tagNameCheck = t.tagNameCheck), ru(t, "attributeNameCheck") && ot(t.attributeNameCheck) && (U.attributeNameCheck = t.attributeNameCheck), ru(t, "allowCustomizedBuiltInElements") && typeof t.allowCustomizedBuiltInElements == "boolean" && (U.allowCustomizedBuiltInElements = t.allowCustomizedBuiltInElements), Ml(U), be && (_e = !1), Oe && (De = !0), Ie && (V = $({}, xu), H = Nl(null), Ie.html === !0 && ($(V, hu), $(H, Su)), Ie.svg === !0 && ($(V, gu), $(H, Cu), $(H, Tu)), Ie.svgFilters === !0 && ($(V, _u), $(H, Cu), $(H, Tu)), Ie.mathMl === !0 && ($(V, yu), $(H, wu), $(H, Tu))), he.tagCheck = null, he.attributeCheck = null, ru(e, "ADD_TAGS") && (typeof e.ADD_TAGS == "function" ? he.tagCheck = e.ADD_TAGS : Ul(e.ADD_TAGS) && (V === de && (V = uu(V)), $(V, e.ADD_TAGS, rt))), ru(e, "ADD_ATTR") && (typeof e.ADD_ATTR == "function" ? he.attributeCheck = e.ADD_ATTR : Ul(e.ADD_ATTR) && (H === fe && (H = uu(H)), $(H, e.ADD_ATTR, rt))), ru(e, "ADD_FORBID_CONTENTS") && Ul(e.ADD_FORBID_CONTENTS) && (Le === Re && (Le = uu(Le)), $(Le, e.ADD_FORBID_CONTENTS, rt)), Ne && (V["#text"] = !0), Se && $(V, [
			"html",
			"head",
			"body"
		]), V.table && ($(V, ["tbody"]), delete pe.tbody), e.TRUSTED_TYPES_POLICY) {
			if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function") throw ou("TRUSTED_TYPES_POLICY configuration option must provide a \"createHTML\" hook.");
			if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw ou("TRUSTED_TYPES_POLICY configuration option must provide a \"createScriptURL\" hook.");
			let t = D;
			D = e.TRUSTED_TYPES_POLICY;
			try {
				O = j("");
			} catch (e) {
				throw D = t, e;
			}
		} else e.TRUSTED_TYPES_POLICY === null ? (D = void 0, O = "") : (D === void 0 && (D = N()), D && typeof O == "string" && (O = j("")));
		jl && jl(e), it = e;
	}, ct = $({}, [
		...gu,
		..._u,
		...vu
	]), lt = $({}, [...yu, ...bu]), ut = function(e, t, n) {
		return t.namespaceURI === Ge ? e === "svg" : t.namespaceURI === Ue ? e === "svg" && (n === "annotation-xml" || Ze[n]) : !!ct[e];
	}, dt = function(e, t, n) {
		return t.namespaceURI === Ge ? e === "math" : t.namespaceURI === We ? e === "math" && $e[n] : !!lt[e];
	}, ft = function(e, t, n) {
		return t.namespaceURI === We && !$e[n] || t.namespaceURI === Ue && !Ze[n] ? !1 : !lt[e] && (et[e] || !ct[e]);
	}, pt = function(e) {
		let t = E(e), n = ql(w(e)), r = _(e), i, a;
		return r && C(r) === Bu.element ? (i = { namespaceURI: E(r) }, a = ql(w(r))) : (i = { namespaceURI: Ke }, a = "template"), Je[t] ? t === We ? ut(n, i, a) : t === Ue ? dt(n, i, a) : t === Ge ? ft(n, i, a) : !!(tt === "application/xhtml+xml" && Je[t]) : !1;
	}, mt = function(e) {
		Bl(t.removed, { element: e });
		try {
			_(e).removeChild(e);
		} catch {
			if (p(e), !_(e)) throw ou("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
		}
	}, ht = function(e, t, n) {
		try {
			m(e, t);
		} catch {
			try {
				e.removeAttribute(n);
			} catch {}
		}
	}, gt = function(e) {
		bt(e);
		let t = g(e);
		t && Ll(Vl(t), (e) => {
			try {
				p(e);
			} catch {}
		});
		let n = C(e) === Bu.element ? y(e) : null;
		if (n) for (let t = n.length - 1; t >= 0; --t) {
			let r = n[t], i = r && r.name;
			typeof i == "string" && ht(e, r, i);
		}
	}, _t = function(e, n, r) {
		if (!r) try {
			r = n.getAttributeNode(e);
		} catch {
			r = null;
		}
		Bl(t.removed, {
			attribute: r || null,
			from: n
		});
		try {
			r ? m(n, r) : n.removeAttribute(e);
		} catch {
			try {
				n.removeAttribute(e);
			} catch {}
		}
		if (e === "is") {
			if (De || Oe) try {
				mt(n);
			} catch {}
			else try {
				n.setAttribute(e, "");
			} catch {}
		}
	}, vt = function(e) {
		let t = y(e);
		if (t) for (let n = t.length - 1; n >= 0; --n) {
			let r = t[n], i = r && r.name;
			typeof i != "string" || H[rt(i)] || ht(e, r, i);
		}
	}, yt = function(e, t) {
		let n = arguments.length > 2 && arguments[2] !== void 0 && arguments[2], r = [e];
		for (; r.length > 0;) {
			let e = r.pop();
			if (t(e) === !1) continue;
			if (n && C(e) === Bu.element) {
				let t = v(e);
				Ft(t) && r.push(t);
			}
			let i = g(e);
			if (i) for (let e = i.length - 1; e >= 0; --e) r.push(i[e]);
		}
	}, bt = function(e) {
		yt(e, (e) => {
			C(e) === Bu.element && vt(e);
		});
	}, xt = function(e) {
		let t = [];
		return yt(e, (e) => {
			t.push(e);
		}, !0), t;
	}, St = function(e, t) {
		let n = Wl();
		Ll(xt(e), (e) => {
			C(e) === Bu.element && Gl(n, e);
		}), Ll(t, (e) => {
			C(e) === Bu.element && !Kl(n, e) && vt(e);
		});
	}, Ct = function(e, n) {
		let r = !1;
		return Ll(t.removed, (t) => {
			t.element && (r ||= t.element === e, bt(t.element));
		}), St(e, n), r;
	}, wt = function(e, t) {
		let n = Fe, r = null, i = () => (r || (r = Wl(), Ll(t, (e) => {
			Gl(r, e);
		})), r);
		for (let t = 0;; t++) {
			let r = xt(e), a = [e], o = !1;
			if (Ll(r, (e) => {
				C(e) === Bu.documentFragment ? Bl(a, e) : !o && !Kl(n, e) && (o = Kl(i(), e));
			}), !o) return;
			if (t >= 8) throw ou("the tree kept changing during in-place sanitization; refusing to return it");
			Ll(a, (t, n) => {
				Tt(t, n > 0, e, i());
			});
		}
	}, Tt = function(e, t, n, r) {
		let i = At(e), a;
		for (; a = i.nextNode();) Kl(r, a) && !Kl(Fe, a) && (t && Lt(R.uponSanitizeShadowNode, a, null), Ut(a, n), Xt(a, n), Ft(a.content) && Zt(a.content));
	}, Et = function(e) {
		Fe && Gl(Fe, e);
	}, Dt = function(e, t) {
		return xe ? e === "patchsrc" || e === "for" && t !== "label" && t !== "output" : !1;
	}, Ot = function(e) {
		xe && yt(e, (e) => {
			let t = C(e);
			if (t === Bu.processingInstruction || t === Bu.comment && au(Lu, e.data)) {
				try {
					p(e);
				} catch {}
				return !1;
			}
			if (t === Bu.element) {
				let t = e, n = rt(w(e));
				try {
					t.hasAttribute && t.hasAttribute("patchsrc") && t.removeAttribute("patchsrc"), t.hasAttribute && t.hasAttribute("for") && Dt("for", n) && t.removeAttribute("for");
				} catch {}
			}
			return !0;
		});
	}, kt = function(e) {
		let t = null, r = null;
		if (Ee) e = "<remove></remove>" + e;
		else {
			let t = Yl(e, /^[\r\n\t ]+/);
			r = t && t[0];
		}
		tt === "application/xhtml+xml" && Ke === Ge && (e = "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head></head><body>" + e + "</body></html>");
		let i = D ? j(e) : e;
		if (Ke === Ge) try {
			t = new l().parseFromString(i, tt);
		} catch {}
		if (!t || !t.documentElement) {
			t = F.createDocument(Ke, "template", null);
			try {
				t.documentElement.innerHTML = qe ? O : i;
			} catch {}
		}
		let a = t.body || t.documentElement;
		return e && r && a.insertBefore(n.createTextNode(r), a.childNodes[0] || null), Ke === Ge ? re.call(t, Se ? "html" : "body")[0] : Se ? t.documentElement : a;
	}, At = function(e) {
		let t = S ? S(e) : e.ownerDocument;
		return I.call(t || e, e, c.SHOW_ELEMENT | c.SHOW_COMMENT | c.SHOW_TEXT | c.SHOW_PROCESSING_INSTRUCTION | c.SHOW_CDATA_SECTION, null);
	}, jt = function(e) {
		return e = Xl(e, z, " "), e = Xl(e, ie, " "), e = Xl(e, B, " "), e;
	}, Mt = function(e) {
		Nt(e);
		let t = e.querySelectorAll?.call(e, "template");
		t && Ll(t, (e) => {
			Ft(e.content) && Mt(e.content);
		});
	}, Nt = function(e) {
		e.normalize();
		let t = S ? S(e) : e.ownerDocument, n = I.call(t || e, e, c.SHOW_TEXT | c.SHOW_COMMENT | c.SHOW_CDATA_SECTION | c.SHOW_PROCESSING_INSTRUCTION, null), r = n.nextNode();
		for (; r;) r.data = jt(r.data), r = n.nextNode();
	}, Pt = function(e) {
		let t = x ? x(e) : null;
		return typeof t != "string" || rt(t) !== "form" ? !1 : typeof e.nodeName != "string" || typeof e.textContent != "string" || typeof e.removeChild != "function" || e.attributes !== y(e) || typeof e.removeAttribute != "function" || typeof e.removeAttributeNode != "function" || typeof e.getAttributeNode != "function" || typeof e.setAttribute != "function" || typeof e.namespaceURI != "string" || typeof e.insertBefore != "function" || typeof e.hasChildNodes != "function" || e.nodeType !== b(e) || e.childNodes !== g(e);
	}, Ft = function(e) {
		if (!b || typeof e != "object" || !e) return !1;
		try {
			return b(e) === Bu.documentFragment;
		} catch {
			return !1;
		}
	}, It = function(e) {
		if (!b || typeof e != "object" || !e) return !1;
		try {
			return typeof b(e) == "number";
		} catch {
			return !1;
		}
	};
	function Lt(e, n, r) {
		e.length !== 0 && Ll(e, (e) => {
			e.call(t, n, r, it);
		});
	}
	let Rt = function(e, t) {
		return !!(xe && e.hasChildNodes() && !It(e.firstElementChild) && au(Iu, e.textContent) && au(Iu, e.innerHTML) || xe && Vu[t] && C(e) === Bu.element && E(e) === Ge && (It(e.firstElementChild) || typeof e.textContent == "string" && au(Iu, e.textContent)) || e.nodeType === Bu.processingInstruction || xe && e.nodeType === Bu.comment && au(Lu, e.data));
	}, zt = function(e, t) {
		return e instanceof RegExp ? au(e, t) : e instanceof Function && !!e(t, ...[...arguments].slice(2));
	}, Bt = function(e, t, n) {
		if (!pe[t] && Kt(t) && zt(U.tagNameCheck, t)) return !1;
		if (Ne && !Le[t] && !Le[ql(t)]) {
			let t = _(e), r = g(e);
			if (r && t) {
				let i = r.length;
				for (let a = i - 1; a >= 0; --a) {
					let i = e === n ? f(r[a], !0) : r[a];
					t.insertBefore(i, h(e));
				}
			}
		}
		return mt(e), !0;
	}, Vt = function(e, t, n, r) {
		return e.length === 0 ? t : t === n || t === r ? uu(t) : t;
	}, Ht = function(e, t) {
		return e === t || _(e) !== null ? !1 : (Pe && bt(e), !0);
	}, Ut = function(e, n) {
		if (Et(e), Lt(R.beforeSanitizeElements, e, null), Ht(e, n)) return !0;
		if (Pt(e)) return mt(e), !0;
		let r = rt(w(e));
		if (V = Vt(R.uponSanitizeElement, V, de, we), Lt(R.uponSanitizeElement, e, {
			tagName: r,
			allowedTags: V
		}), Ht(e, n)) return !0;
		if (Rt(e, r)) return mt(e), !0;
		if (pe[r] || !(he.tagCheck instanceof Function && he.tagCheck(r)) && !V[r]) {
			let t = Bt(e, r, n);
			return t === !1 && (Lt(R.afterSanitizeElements, e, null), Ht(e, n)) ? !0 : t;
		}
		if (C(e) === Bu.element && !pt(e) || (r === "noscript" || r === "noembed" || r === "noframes") && au(Ru, e.innerHTML)) return mt(e), !0;
		if (be && e.nodeType === Bu.text) {
			let n = jt(e.textContent);
			e.textContent !== n && (Bl(t.removed, { element: e.cloneNode() }), e.textContent = n);
		}
		return Lt(R.afterSanitizeElements, e, null), Ht(e, n);
	}, Wt = function(e, t, r) {
		if (me[t] || Dt(t, e) || Ae && (t === "id" || t === "name") && (r in n || r in at)) return !1;
		let i = H[t] || he.attributeCheck instanceof Function && he.attributeCheck(t, e);
		return _e && au(ae, t) || ge && au(oe, t) ? !0 : i ? Ve[t] || au(ue, Xl(r, ce, "")) || (t === "src" || t === "xlink:href" || t === "href") && e !== "script" && Zl(r, "data:") === 0 && ze[e] || ve && !au(se, Xl(r, ce, "")) ? !0 : !r : Kt(e) && zt(U.tagNameCheck, e) && zt(U.attributeNameCheck, t, e) || t === "is" && U.allowCustomizedBuiltInElements && zt(U.tagNameCheck, r);
	}, Gt = $({}, [
		"annotation-xml",
		"color-profile",
		"font-face",
		"font-face-format",
		"font-face-name",
		"font-face-src",
		"font-face-uri",
		"missing-glyph"
	]), Kt = function(e) {
		return !Gt[ql(e)] && au(le, e);
	}, qt = function(e, t, n, r) {
		if (D && typeof u == "object" && typeof u.getAttributeType == "function" && !n) switch (u.getAttributeType(e, t)) {
			case "TrustedHTML": return j(r);
			case "TrustedScriptURL": return M(r);
		}
		return r;
	}, Jt = function(e, t, n, r) {
		try {
			return n ? e.setAttributeNS(n, t, r) : e.setAttribute(t, r), !Pt(e) || (mt(e), !1);
		} catch {
			return _t(t, e), !1;
		}
	}, Yt = function(e, t) {
		return xe && au(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, t) ? !0 : ql(e) === "attributename" && Yl(t, "href") !== null;
	}, Xt = function(e, n) {
		if (Lt(R.beforeSanitizeAttributes, e, null), Ht(e, n)) return;
		let r = e.attributes;
		if (!r || Pt(e)) return;
		H = Vt(R.uponSanitizeAttribute, H, fe, Te);
		let i = {
			attrName: "",
			attrValue: "",
			keepAttr: !0,
			allowedAttributes: H,
			forceKeepAttr: void 0
		}, a = r.length, o = rt(e.nodeName);
		for (; a--;) {
			let n = r[a], s = n.name, c = n.namespaceURI, l = n.value, u = rt(s), d = l, f = s === "value" ? d : Ql(d), p = !1;
			i.attrName = u, i.attrValue = f, i.keepAttr = !0, i.forceKeepAttr = void 0, Lt(R.uponSanitizeAttribute, e, i), f = i.attrValue, je && (u === "id" || u === "name") && Zl(f, Me) !== 0 && (_t(s, e, n), f = Me + f, p = !0), Yt(s, f) ? _t(s, e, n) : i.forceKeepAttr || (i.keepAttr ? !ye && au(zu, f) ? _t(s, e, n) : (be && (f = jt(f)), Wt(o, u, f) ? (f = qt(o, u, c, f), f !== d && Jt(e, s, c, f) && p && zl(t.removed)) : _t(s, e, n)) : _t(s, e, n));
		}
		Lt(R.afterSanitizeAttributes, e, null), Ht(e, n);
	}, Zt = function(e) {
		let t = null, n = At(e);
		for (Lt(R.beforeSanitizeShadowDOM, e, null); t = n.nextNode();) if (Lt(R.uponSanitizeShadowNode, t, null), Ut(t, e), Xt(t, e), Ft(t.content) && Zt(t.content), C(t) === Bu.element) {
			let e = v(t);
			Ft(e) && (Qt(e), Zt(e));
		}
		be && Nt(e), Lt(R.afterSanitizeShadowDOM, e, null);
	}, Qt = function(e) {
		let t = [{
			node: e,
			shadow: null
		}];
		for (; t.length > 0;) {
			let e = t.pop();
			if (e.shadow) {
				Zt(e.shadow);
				continue;
			}
			let n = e.node, r = C(n) === Bu.element, i = g(n);
			if (i) for (let e = i.length - 1; e >= 0; --e) t.push({
				node: i[e],
				shadow: null
			});
			if (r) {
				let e = x ? x(n) : null;
				if (typeof e == "string" && rt(e) === "template") {
					let e = n.content;
					Ft(e) && t.push({
						node: e,
						shadow: null
					});
				}
			}
			if (r) {
				let e = v(n);
				Ft(e) && t.push({
					node: null,
					shadow: e
				}, {
					node: e,
					shadow: null
				});
			}
		}
	};
	return t.sanitize = function(e) {
		let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = null, a = null, o = null, s = null;
		if (qe = !e, qe && (e = "<!-->"), typeof e != "string" && !It(e) && (e = du(e), typeof e != "string")) throw ou("dirty is not a string, aborting");
		if (!t.isSupported) return e;
		Ce ? (V = we, H = Te) : st(n), (R.uponSanitizeElement.length > 0 || R.uponSanitizeAttribute.length > 0) && (V = uu(V)), R.uponSanitizeAttribute.length > 0 && (H = uu(H)), t.removed = [];
		let c = Pe && typeof e != "string" && It(e), l = [], u = Fe;
		if (c) {
			Ot(e);
			let t = w(e);
			if (typeof t == "string") {
				let n = rt(t);
				if (!V[n] || pe[n]) throw gt(e), ou("root node is forbidden and cannot be sanitized in-place");
			}
			if (Pt(e)) throw gt(e), ou("root node is clobbered and cannot be sanitized in-place");
			l = xt(e), Fe = Wl();
		} else if (It(e)) i = kt("<!---->"), a = i.ownerDocument.importNode(e, !0), a.nodeType === Bu.element && a.nodeName === "BODY" || a.nodeName === "HTML" ? i = a : i.appendChild(a), Qt(i);
		else {
			if (!De && !be && !Se && e.indexOf("<") === -1) return D && ke ? j(e) : e;
			if (i = kt(e), !i) return De ? null : ke ? O : "";
		}
		i && Ee && mt(i.firstChild);
		let d = c ? e : i;
		try {
			c && Qt(e);
			let t = At(d);
			for (; o = t.nextNode();) Ut(o, d), Xt(o, d), Ft(o.content) && Zt(o.content);
			c && wt(e, l);
		} catch (t) {
			throw c && (gt(e), Ct(e, l)), t;
		} finally {
			Fe = u;
		}
		if (c) {
			if (Ct(e, l)) throw ou("a node selected for removal could not be safely returned; refusing to sanitize in place");
			return be && Mt(e), e;
		}
		if (De) {
			if (be && Mt(i), Oe) for (s = ne.call(i.ownerDocument); i.firstChild;) s.appendChild(i.firstChild);
			else s = i;
			return (H.shadowroot || H.shadowrootmode) && (s = L.call(r, s, !0)), s;
		}
		let f = Se ? i.outerHTML : i.innerHTML;
		return Se && V["!doctype"] && i.ownerDocument && i.ownerDocument.doctype && i.ownerDocument.doctype.name && au(Pu, i.ownerDocument.doctype.name) && (f = "<!DOCTYPE " + i.ownerDocument.doctype.name + ">\n" + f), be && (f = jt(f)), D && ke ? j(f) : f;
	}, t.setConfig = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		st(e), Ce = !0, we = V, Te = H;
	}, t.clearConfig = function() {
		it = null, Ce = !1, we = null, Te = null, D = ee, O = "";
	}, t.isValidAttribute = function(e, t, n) {
		it || st({});
		let r = rt(e), i = rt(t);
		return typeof n == "string" && (Yt(t, n) || !ye && au(zu, n)) ? !1 : Wt(r, i, n);
	}, t.addHook = function(e, t) {
		typeof t == "function" && ru(R, e) && Bl(R[e], t);
	}, t.removeHook = function(e, t) {
		if (ru(R, e)) {
			if (t !== void 0) {
				let n = Rl(R[e], t);
				return n === -1 ? void 0 : Hl(R[e], n, 1)[0];
			}
			return zl(R[e]);
		}
	}, t.removeHooks = function(e) {
		ru(R, e) && (R[e] = []);
	}, t.removeAllHooks = function() {
		R = Wu();
	}, t;
}
var Ju = qu(), Yu = null;
function Xu() {
	if (typeof window > "u") return null;
	if (Yu) return Yu;
	let e = Ju(window), t = gl(), n = ml.fragmentOnlyRefs.attributes;
	return e.addHook("afterSanitizeAttributes", (e) => {
		let r = e;
		for (let e of n) {
			let n = r.getAttribute?.(e);
			n != null && !t.test(n) && r.removeAttribute(e);
		}
		let i = r.getAttribute?.("style");
		i != null && !_l(i) && r.removeAttribute("style");
	}), Yu = e, Yu;
}
function Zu(e) {
	if (!e) return "";
	let t = Xu();
	return t ? t.sanitize(e, {
		ALLOWED_TAGS: [...ml.allowedTags],
		ALLOWED_ATTR: [...hl(), "data-layer"],
		FORBID_TAGS: [...ml.forbiddenTags],
		ALLOW_ARIA_ATTR: !0,
		ALLOW_DATA_ATTR: !1
	}) : "";
}
// src/modules/svg/infrastructure/monochrome.ts
var Qu = [
	"fill",
	"stroke",
	"color",
	"stop-color",
	"flood-color",
	"lighting-color"
], $u = /* @__PURE__ */ new Set([
	"none",
	"transparent",
	"currentcolor",
	"inherit",
	"unset",
	"initial"
]), ed = /^(?:#000(?:000)?|black|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))$/i, td = /^#(?:([0-9a-f])([0-9a-f])([0-9a-f])|([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))$/i, nd = /\s*!important\s*$/i;
function rd(e) {
	let t = e.trim();
	if (ed.test(t)) return !0;
	let n = td.exec(t);
	if (!n) return !1;
	let r = (n[1] ? [
		n[1] + n[1],
		n[2] + n[2],
		n[3] + n[3]
	] : [
		n[4],
		n[5],
		n[6]
	]).map((e) => parseInt(e, 16));
	return Math.max(...r) <= 64 && Math.max(...r) - Math.min(...r) <= 24;
}
function id(e) {
	let t = [];
	for (let n of Array.from(e.attributes)) {
		let e = n.name.toLowerCase();
		if (Qu.includes(e) && t.push(n.value.trim()), e === "style") for (let e of n.value.split(";")) {
			let n = e.indexOf(":");
			n < 0 || Qu.includes(e.slice(0, n).trim().toLowerCase()) && t.push(e.slice(n + 1).replace(nd, "").trim());
		}
	}
	return t;
}
function ad(e) {
	for (let t of Array.from(e.attributes)) {
		let n = t.name.toLowerCase();
		if (Qu.includes(n) && rd(t.value) && e.setAttribute(t.name, "currentColor"), n === "style") {
			let n = t.value.split(";").map((e) => {
				let t = e.indexOf(":");
				if (t < 0) return e;
				let n = e.slice(0, t), r = e.slice(t + 1);
				if (!Qu.includes(n.trim().toLowerCase())) return e;
				let i = nd.test(r);
				return rd(r.replace(nd, "")) ? `${n}:currentColor${i ? " !important" : ""}` : e;
			});
			e.setAttribute(t.name, n.join(";"));
		}
	}
}
function od(e) {
	if (typeof DOMParser > "u") return null;
	let t = new DOMParser().parseFromString(e, "image/svg+xml"), n = t.documentElement;
	return !n || n.nodeName.toLowerCase() !== "svg" || t.getElementsByTagName("parsererror").length ? null : t;
}
function sd(e) {
	let t = od(e);
	if (!t || t.getElementsByTagName("style").length) return !1;
	let n = !1;
	for (let e of [t.documentElement, ...Array.from(t.documentElement.getElementsByTagName("*"))]) for (let t of id(e)) if (rd(t)) n = !0;
	else if (!$u.has(t.toLowerCase())) return !1;
	return n;
}
function cd(e) {
	if (!sd(e)) return e;
	let t = od(e);
	for (let e of [t.documentElement, ...Array.from(t.documentElement.getElementsByTagName("*"))]) ad(e);
	return new XMLSerializer().serializeToString(t.documentElement);
}
// src/modules/svg/infrastructure/svgText.ts
var ld = /* @__PURE__ */ new Map(), ud = /* @__PURE__ */ new Map(), dd = /* @__PURE__ */ new WeakMap();
function fd(e, t, n, r) {
	let i = e.get(n);
	if (i !== void 0) return i;
	let a = t.get(n);
	if (a) return a;
	let o = r().then((r) => (e.set(n, r), t.delete(n), r), (e) => {
		throw t.delete(n), e;
	});
	return t.set(n, o), o;
}
function pd(e, t) {
	if (e.svgContent) return e.svgContent;
	if (t) {
		let n = dd.get(t);
		return n || dd.set(t, n = {
			done: /* @__PURE__ */ new Map(),
			pending: /* @__PURE__ */ new Map()
		}), fd(n.done, n.pending, e.id, () => t.getSvg(e));
	}
	let n = ca(e.svgUrl ?? "");
	return n ? md(n) : "";
}
function md(e) {
	return fd(ld, ud, e, () => fetch(e).then((e) => e.text()));
}
// src/modules/svg/infrastructure/svgCache.ts
var hd = [
	"fill",
	"fill-rule",
	"fill-opacity",
	"stroke",
	"stroke-width",
	"stroke-linecap",
	"stroke-linejoin",
	"stroke-miterlimit",
	"stroke-dasharray",
	"stroke-opacity",
	"clip-rule",
	"color",
	"opacity"
];
function gd(e) {
	let t = /<svg\b[^>]*>/i.exec(e)?.[0] ?? "", n = "";
	for (let e of hd) {
		let r = RegExp(`\\s${e}\\s*=\\s*"([^"]*)"`, "i").exec(t);
		r && (n += ` ${e}="${r[1]}"`);
	}
	return n;
}
var _d = /* @__PURE__ */ new Map(), vd = /* @__PURE__ */ new Map();
function yd(e) {
	let t = e.indexOf(">", e.indexOf("<svg")), n = e.lastIndexOf("</svg>");
	return (t >= 0 && n > t ? e.slice(t + 1, n) : e).replace(/<path\s+stroke="none"[^>]*fill="none"[^>]*><\/path>/gi, "").replace(/<path\s+stroke="none"[^>]*fill="none"[^>]*\/>/gi, "").trim();
}
function bd(e, t) {
	let n = Zu(e), r = /viewBox\s*=\s*"([^"]+)"/i.exec(n)?.[1] ?? t, i = {
		body: yd(n),
		viewBox: r
	};
	i.rootAttrs = gd(n);
	let a = cd(n);
	return a !== n && (i.monoBody = yd(a)), i;
}
function xd(e) {
	if (e.svgContent) return bd(e.svgContent, e.viewBox);
	let t = ca(e.svgUrl ?? "");
	if (!t) return {
		body: "",
		viewBox: e.viewBox
	};
	let n = _d.get(t);
	if (n) return n;
	let r = vd.get(t);
	if (r) return r;
	let i = Promise.resolve(md(t)).then((n) => {
		let r = bd(n, e.viewBox);
		return _d.set(t, r), vd.delete(t), r;
	}).catch(() => {
		let n = {
			body: "",
			viewBox: e.viewBox
		};
		return _d.set(t, n), vd.delete(t), n;
	});
	return vd.set(t, i), i;
}
// node_modules/fflate/esm/browser.js
var Sd = Uint8Array, Cd = Uint16Array, wd = Int32Array, Td = new Sd([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	0,
	0,
	0,
	0
]), Ed = new Sd([
	0,
	0,
	0,
	0,
	1,
	1,
	2,
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	7,
	7,
	8,
	8,
	9,
	9,
	10,
	10,
	11,
	11,
	12,
	12,
	13,
	13,
	0,
	0
]), Dd = new Sd([
	16,
	17,
	18,
	0,
	8,
	7,
	9,
	6,
	10,
	5,
	11,
	4,
	12,
	3,
	13,
	2,
	14,
	1,
	15
]), Od = function(e, t) {
	for (var n = new Cd(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new wd(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, kd = Od(Td, 2), Ad = kd.b, jd = kd.r;
Ad[28] = 258, jd[258] = 28;
var Md = Od(Ed, 0);
Md.b;
for (var Nd = Md.r, Pd = new Cd(32768), Fd = 0; Fd < 32768; ++Fd) {
	var Id = (Fd & 43690) >> 1 | (Fd & 21845) << 1;
	Id = (Id & 52428) >> 2 | (Id & 13107) << 2, Id = (Id & 61680) >> 4 | (Id & 3855) << 4, Pd[Fd] = ((Id & 65280) >> 8 | (Id & 255) << 8) >> 1;
}
for (var Ld = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new Cd(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new Cd(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new Cd(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[Pd[d] >> c] = l;
	} else for (s = new Cd(r), i = 0; i < r; ++i) e[i] && (s[i] = Pd[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), Rd = new Sd(288), Fd = 0; Fd < 144; ++Fd) Rd[Fd] = 8;
for (var Fd = 144; Fd < 256; ++Fd) Rd[Fd] = 9;
for (var Fd = 256; Fd < 280; ++Fd) Rd[Fd] = 7;
for (var Fd = 280; Fd < 288; ++Fd) Rd[Fd] = 8;
for (var zd = new Sd(32), Fd = 0; Fd < 32; ++Fd) zd[Fd] = 5;
var Bd = /*#__PURE__*/ Ld(Rd, 9, 0), Vd = /*#__PURE__*/ Ld(zd, 5, 0), Hd = function(e) {
	return (e + 7) / 8 | 0;
}, Ud = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new Sd(e.subarray(t, n));
}, Wd = [
	"unexpected EOF",
	"invalid block type",
	"invalid length/literal",
	"invalid distance",
	"stream finished",
	"no stream handler",
	,
	"no callback",
	"invalid UTF-8 data",
	"extra field too long",
	"date not in range 1980-2099",
	"filename too long",
	"stream finishing",
	"invalid zip data"
], Gd = function(e, t, n) {
	var r = Error(t || Wd[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, Gd), !n) throw r;
	return r;
}, Kd = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8;
}, qd = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, Jd = function(e, t) {
	for (var n = [], r = 0; r < e.length; ++r) e[r] && n.push({
		s: r,
		f: e[r]
	});
	var i = n.length, a = n.slice();
	if (!i) return {
		t: tf,
		l: 0
	};
	if (i == 1) {
		var o = new Sd(n[0].s + 1);
		return o[n[0].s] = 1, {
			t: o,
			l: 1
		};
	}
	n.sort(function(e, t) {
		return e.f - t.f;
	}), n.push({
		s: -1,
		f: 25001
	});
	var s = n[0], c = n[1], l = 0, u = 1, d = 2;
	for (n[0] = {
		s: -1,
		f: s.f + c.f,
		l: s,
		r: c
	}; u != i - 1;) s = n[n[l].f < n[d].f ? l++ : d++], c = n[l != u && n[l].f < n[d].f ? l++ : d++], n[u++] = {
		s: -1,
		f: s.f + c.f,
		l: s,
		r: c
	};
	for (var f = a[0].s, r = 1; r < i; ++r) a[r].s > f && (f = a[r].s);
	var p = new Cd(f + 1), m = Yd(n[u - 1], p, 0);
	if (m > t) {
		var r = 0, h = 0, g = m - t, _ = 1 << g;
		for (a.sort(function(e, t) {
			return p[t.s] - p[e.s] || e.f - t.f;
		}); r < i; ++r) {
			var v = a[r].s;
			if (p[v] > t) h += _ - (1 << m - p[v]), p[v] = t;
			else break;
		}
		for (h >>= g; h > 0;) {
			var y = a[r].s;
			p[y] < t ? h -= 1 << t - p[y]++ - 1 : ++r;
		}
		for (; r >= 0 && h; --r) {
			var b = a[r].s;
			p[b] == t && (--p[b], ++h);
		}
		m = t;
	}
	return {
		t: new Sd(p),
		l: m
	};
}, Yd = function(e, t, n) {
	return e.s == -1 ? Math.max(Yd(e.l, t, n + 1), Yd(e.r, t, n + 1)) : t[e.s] = n;
}, Xd = function(e) {
	for (var t = e.length; t && !e[--t];);
	for (var n = new Cd(++t), r = 0, i = e[0], a = 1, o = function(e) {
		n[r++] = e;
	}, s = 1; s <= t; ++s) if (e[s] == i && s != t) ++a;
	else {
		if (!i && a > 2) {
			for (; a > 138; a -= 138) o(32754);
			a > 2 && (o(a > 10 ? a - 11 << 5 | 28690 : a - 3 << 5 | 12305), a = 0);
		} else if (a > 3) {
			for (o(i), --a; a > 6; a -= 6) o(8304);
			a > 2 && (o(a - 3 << 5 | 8208), a = 0);
		}
		for (; a--;) o(i);
		a = 1, i = e[s];
	}
	return {
		c: n.subarray(0, r),
		n: t
	};
}, Zd = function(e, t) {
	for (var n = 0, r = 0; r < t.length; ++r) n += e[r] * t[r];
	return n;
}, Qd = function(e, t, n) {
	var r = n.length, i = Hd(t + 2);
	e[i] = r & 255, e[i + 1] = r >> 8, e[i + 2] = e[i] ^ 255, e[i + 3] = e[i + 1] ^ 255;
	for (var a = 0; a < r; ++a) e[i + a + 4] = n[a];
	return (i + 4 + r) * 8;
}, $d = function(e, t, n, r, i, a, o, s, c, l, u) {
	Kd(t, u++, n), ++i[256];
	for (var d = Jd(i, 15), f = d.t, p = d.l, m = Jd(a, 15), h = m.t, g = m.l, _ = Xd(f), v = _.c, y = _.n, b = Xd(h), x = b.c, S = b.n, C = new Cd(19), w = 0; w < v.length; ++w) ++C[v[w] & 31];
	for (var w = 0; w < x.length; ++w) ++C[x[w] & 31];
	for (var T = Jd(C, 7), E = T.t, D = T.l, O = 19; O > 4 && !E[Dd[O - 1]]; --O);
	var ee = l + 5 << 3, te = Zd(i, Rd) + Zd(a, zd) + o, k = Zd(i, f) + Zd(a, h) + o + 14 + 3 * O + Zd(C, E) + 2 * C[16] + 3 * C[17] + 7 * C[18];
	if (c >= 0 && ee <= te && ee <= k) return Qd(t, u, e.subarray(c, c + l));
	var A, j, M, N;
	if (Kd(t, u, 1 + (k < te)), u += 2, k < te) {
		A = Ld(f, p, 0), j = f, M = Ld(h, g, 0), N = h;
		var P = Ld(E, D, 0);
		Kd(t, u, y - 257), Kd(t, u + 5, S - 1), Kd(t, u + 10, O - 4), u += 14;
		for (var w = 0; w < O; ++w) Kd(t, u + 3 * w, E[Dd[w]]);
		u += 3 * O;
		for (var F = [v, x], I = 0; I < 2; ++I) for (var ne = F[I], w = 0; w < ne.length; ++w) {
			var re = ne[w] & 31;
			Kd(t, u, P[re]), u += E[re], re > 15 && (Kd(t, u, ne[w] >> 5 & 127), u += ne[w] >> 12);
		}
	} else A = Bd, j = Rd, M = Vd, N = zd;
	for (var w = 0; w < s; ++w) {
		var L = r[w];
		if (L > 255) {
			var re = L >> 18 & 31;
			qd(t, u, A[re + 257]), u += j[re + 257], re > 7 && (Kd(t, u, L >> 23 & 31), u += Td[re]);
			var R = L & 31;
			qd(t, u, M[R]), u += N[R], R > 3 && (qd(t, u, L >> 5 & 8191), u += Ed[R]);
		} else qd(t, u, A[L]), u += j[L];
	}
	return qd(t, u, A[256]), u + j[256];
}, ef = /*#__PURE__*/ new wd([
	65540,
	131080,
	131088,
	131104,
	262176,
	1048704,
	1048832,
	2114560,
	2117632
]), tf = /*#__PURE__*/ new Sd(0), nf = function(e, t, n, r, i, a) {
	var o = a.z || e.length, s = new Sd(r + o + 5 * (1 + Math.ceil(o / 7e3)) + i), c = s.subarray(r, s.length - i), l = a.l, u = (a.r || 0) & 7;
	if (t) {
		u && (c[0] = a.r >> 3);
		for (var d = ef[t - 1], f = d >> 13, p = d & 8191, m = (1 << n) - 1, h = a.p || new Cd(32768), g = a.h || new Cd(m + 1), _ = Math.ceil(n / 3), v = 2 * _, y = function(t) {
			return (e[t] ^ e[t + 1] << _ ^ e[t + 2] << v) & m;
		}, b = new wd(25e3), x = new Cd(288), S = new Cd(32), C = 0, w = 0, T = a.i || 0, E = 0, D = a.w || 0, O = 0; T + 2 < o; ++T) {
			var ee = y(T), te = T & 32767, k = g[ee];
			if (h[te] = k, g[ee] = te, D <= T) {
				var A = o - T;
				if ((C > 7e3 || E > 24576) && (A > 423 || !l)) {
					u = $d(e, c, 0, b, x, S, w, E, O, T - O, u), E = C = w = 0, O = T;
					for (var j = 0; j < 286; ++j) x[j] = 0;
					for (var j = 0; j < 30; ++j) S[j] = 0;
				}
				var M = 2, N = 0, P = p, F = te - k & 32767;
				if (A > 2 && ee == y(T - F)) for (var I = Math.min(f, A) - 1, ne = Math.min(32767, T), re = Math.min(258, A); F <= ne && --P && te != k;) {
					if (e[T + M] == e[T + M - F]) {
						for (var L = 0; L < re && e[T + L] == e[T + L - F]; ++L);
						if (L > M) {
							if (M = L, N = F, L > I) break;
							for (var R = Math.min(F, L - 2), z = 0, j = 0; j < R; ++j) {
								var ie = T - F + j & 32767, B = ie - h[ie] & 32767;
								B > z && (z = B, k = ie);
							}
						}
					}
					te = k, k = h[te], F += te - k & 32767;
				}
				if (N) {
					b[E++] = 268435456 | jd[M] << 18 | Nd[N];
					var ae = jd[M] & 31, oe = Nd[N] & 31;
					w += Td[ae] + Ed[oe], ++x[257 + ae], ++S[oe], D = T + M, ++C;
				} else b[E++] = e[T], ++x[e[T]];
			}
		}
		for (T = Math.max(T, D); T < o; ++T) b[E++] = e[T], ++x[e[T]];
		u = $d(e, c, l, b, x, S, w, E, O, T - O, u), l || (a.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, a.h = g, a.p = h, a.i = T, a.w = D);
	} else {
		for (var T = a.w || 0; T < o + l; T += 65535) {
			var se = T + 65535;
			se >= o && (c[u / 8 | 0] = l, se = o), u = Qd(c, u + 1, e.subarray(T, se));
		}
		a.i = o;
	}
	return Ud(s, 0, r + Hd(u) + i);
}, rf = /*#__PURE__*/ (function() {
	for (var e = /* @__PURE__ */ new Int32Array(256), t = 0; t < 256; ++t) {
		for (var n = t, r = 9; --r;) n = (n & 1 && -306674912) ^ n >>> 1;
		e[t] = n;
	}
	return e;
})(), af = function() {
	var e = -1;
	return {
		p: function(t) {
			for (var n = e, r = 0; r < t.length; ++r) n = rf[n & 255 ^ t[r]] ^ n >>> 8;
			e = n;
		},
		d: function() {
			return ~e;
		}
	};
}, of = function(e, t, n, r, i) {
	if (!i && (i = { l: 1 }, t.dictionary)) {
		var a = t.dictionary.subarray(-32768), o = new Sd(a.length + e.length);
		o.set(a), o.set(e, a.length), e = o, i.w = a.length;
	}
	return nf(e, t.level == null ? 6 : t.level, t.mem == null ? i.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, i);
}, sf = function(e, t) {
	var n = {};
	for (var r in e) n[r] = e[r];
	for (var r in t) n[r] = t[r];
	return n;
}, cf = function(e, t, n) {
	for (; n; ++t) e[t] = n, n >>>= 8;
};
function lf(e, t) {
	return of(e, t || {}, 0, 0);
}
var uf = function(e, t, n, r) {
	for (var i in e) {
		var a = e[i], o = t + i, s = r;
		Array.isArray(a) && (s = sf(r, a[1]), a = a[0]), ArrayBuffer.isView(a) ? n[o] = [a, s] : (n[o += "/"] = [new Sd(0), s], uf(a, o, n, r));
	}
}, df = typeof TextEncoder < "u" && /*#__PURE__*/ new TextEncoder(), ff = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	ff.decode(tf, { stream: !0 });
} catch {}
function pf(e, t) {
	if (t) {
		for (var n = new Sd(e.length), r = 0; r < e.length; ++r) n[r] = e.charCodeAt(r);
		return n;
	}
	if (df) return df.encode(e);
	for (var i = e.length, a = new Sd(e.length + (e.length >> 1)), o = 0, s = function(e) {
		a[o++] = e;
	}, r = 0; r < i; ++r) {
		if (o + 5 > a.length) {
			var c = new Sd(o + 8 + (i - r << 1));
			c.set(a), a = c;
		}
		var l = e.charCodeAt(r);
		l < 128 || t ? s(l) : l < 2048 ? (s(192 | l >> 6), s(128 | l & 63)) : l > 55295 && l < 57344 ? (l = 65536 + (l & 1047552) | e.charCodeAt(++r) & 1023, s(240 | l >> 18), s(128 | l >> 12 & 63), s(128 | l >> 6 & 63), s(128 | l & 63)) : (s(224 | l >> 12), s(128 | l >> 6 & 63), s(128 | l & 63));
	}
	return Ud(a, 0, o);
}
var mf = function(e) {
	var t = 0;
	if (e) for (var n in e) {
		var r = e[n].length;
		r > 65535 && Gd(9), t += r + 4;
	}
	return t;
}, hf = function(e, t, n, r, i, a, o, s) {
	var c = r.length, l = n.extra, u = s && s.length, d = mf(l);
	cf(e, t, o == null ? 67324752 : 33639248), t += 4, o != null && (e[t++] = 20, e[t++] = n.os), e[t] = 20, t += 2, e[t++] = n.flag << 1 | (a < 0 && 8), e[t++] = i && 8, e[t++] = n.compression & 255, e[t++] = n.compression >> 8;
	var f = new Date(n.mtime == null ? Date.now() : n.mtime), p = f.getFullYear() - 1980;
	if ((p < 0 || p > 119) && Gd(10), cf(e, t, p << 25 | f.getMonth() + 1 << 21 | f.getDate() << 16 | f.getHours() << 11 | f.getMinutes() << 5 | f.getSeconds() >> 1), t += 4, a != -1 && (cf(e, t, n.crc), cf(e, t + 4, a < 0 ? -a - 2 : a), cf(e, t + 8, n.size)), cf(e, t + 12, c), cf(e, t + 14, d), t += 16, o != null && (cf(e, t, u), cf(e, t + 6, n.attrs), cf(e, t + 10, o), t += 14), e.set(r, t), t += c, d) for (var m in l) {
		var h = l[m], g = h.length;
		cf(e, t, +m), cf(e, t + 2, g), e.set(h, t + 4), t += 4 + g;
	}
	return u && (e.set(s, t), t += u), t;
}, gf = function(e, t, n, r, i) {
	cf(e, t, 101010256), cf(e, t + 8, n), cf(e, t + 10, n), cf(e, t + 12, r), cf(e, t + 16, i);
};
function _f(e, t) {
	t ||= {};
	var n = {}, r = [];
	uf(e, "", n, t);
	var i = 0, a = 0;
	for (var o in n) {
		var s = n[o], c = s[0], l = s[1], u = l.level == 0 ? 0 : 8, d = pf(o), f = d.length, p = l.comment, m = p && pf(p), h = m && m.length, g = mf(l.extra);
		f > 65535 && Gd(11);
		var _ = u ? lf(c, l) : c, v = _.length, y = af();
		y.p(c), r.push(sf(l, {
			size: c.length,
			crc: y.d(),
			c: _,
			f: d,
			m,
			u: f != o.length || m && p.length != h,
			o: i,
			compression: u
		})), i += 30 + f + g + v, a += 76 + 2 * (f + g) + (h || 0) + v;
	}
	for (var b = new Sd(a + 22), x = i, S = a - i, C = 0; C < r.length; ++C) {
		var d = r[C];
		hf(b, d.o, d, d.f, d.u, d.c.length);
		var w = 30 + d.f.length + mf(d.extra);
		b.set(d.c, d.o + w), hf(b, i, d, d.f, d.u, d.c.length, d.o, d.m), i += 16 + w + (d.m ? d.m.length : 0);
	}
	return gf(b, i, r.length, S, x), b;
}
// src/modules/export/domain/ExportBundle.ts
var vf = class {
	#e;
	constructor(e) {
		this.#e = e;
	}
	sprite(e) {
		let t = this.names(e.map((e) => e.icon));
		return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${e.map((e, n) => `  <symbol id="${t[n]}" viewBox="${e.viewBox}"${e.rootAttrs ?? ""}>\n    ${e.body}\n  </symbol>`).join("\n")}\n</svg>\n`;
	}
	manifest(e) {
		return JSON.stringify({
			generated: "ichava-browser",
			count: e.length,
			icons: e.map((e) => ({
				id: e.id,
				ref: this.#e.ref(e),
				name: e.name,
				package: e.package,
				category: e.category,
				variant: e.variant
			}))
		}, null, 2);
	}
	standaloneSvg(e) {
		let t = e.rootAttrs ?? " fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"";
		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${e.viewBox}"${t}>\n  ${e.body}\n</svg>\n`;
	}
	names(e) {
		let t = (e) => e.reduce((e, t) => e.set(t, (e.get(t) ?? 0) + 1), /* @__PURE__ */ new Map()), n = e.map((e) => this.#e.slug(e)), r = t(n), i = e.map((e, t) => r.get(n[t]) > 1 ? `${n[t]}-${e.variant}` : n[t]), a = t(i);
		return e.map((e, t) => a.get(i[t]) > 1 ? `${i[t]}-${e.id}` : i[t]);
	}
	build(e, t) {
		if (!t.length) throw RangeError("ExportBundle.build: nothing to export");
		let n = t.map((e) => e.icon);
		if (e === "manifest") return yf("ichava-manifest.json", this.manifest(n), "application/json");
		if (e === "sprite") return yf("ichava-sprite.svg", this.sprite(t), "image/svg+xml");
		let r = this.names(n);
		if (e === "files") {
			if (t.length === 1) return yf(`${r[0]}.svg`, this.standaloneSvg(t[0]), "image/svg+xml");
			let e = {};
			return t.forEach((t, n) => {
				e[`${r[n]}.svg`] = pf(this.standaloneSvg(t));
			}), {
				name: "ichava-svgs.zip",
				type: "application/zip",
				bytes: _f(e, { level: 6 })
			};
		}
		let i = {
			"sprite.svg": pf(this.sprite(t)),
			"manifest.json": pf(this.manifest(n))
		};
		return t.forEach((e, t) => {
			i[`svg/${r[t]}.svg`] = pf(this.standaloneSvg(e));
		}), {
			name: "ichava-icons.zip",
			type: "application/zip",
			bytes: _f(i, { level: 6 })
		};
	}
};
function yf(e, t, n) {
	return {
		name: e,
		type: n,
		bytes: pf(t)
	};
}
// src/modules/export/application/exportIcons.ts
async function bf(e, t, n) {
	if (!t.length) return;
	let r = e === "manifest" ? t.map((e) => ({
		icon: e,
		body: "",
		viewBox: e.viewBox
	})) : await Promise.all(t.map(async (e) => {
		let t = await Promise.resolve(n.parts(e));
		return {
			icon: e,
			body: t.body,
			viewBox: t.viewBox,
			rootAttrs: t.rootAttrs ?? ""
		};
	}));
	n.downloader.download(n.bundle.build(e, r));
}
// src/modules/export/infrastructure/BrowserDownloader.ts
var xf = class {
	download(e) {
		let t = new Blob([e.bytes], { type: e.type }), n = URL.createObjectURL(t), r = document.createElement("a");
		r.href = n, r.download = e.name, r.click(), URL.revokeObjectURL(n);
	}
}, Sf = new vf({
	ref: Kt,
	slug: (e) => `${Gt(e)}-${e.name}`
});
function Cf(e, t) {
	return bf(e, t, {
		bundle: Sf,
		parts: xd,
		downloader: new xf()
	});
}
var wf = new class {
	buildSprite(e) {
		return Sf.sprite(e);
	}
	buildManifest(e) {
		return Sf.manifest(e);
	}
	buildStandaloneSvg(e) {
		return Sf.standaloneSvg(e);
	}
	async export(e, t) {
		return Cf(e, t);
	}
}(), Tf = W.toolbar.exportFormats, Ef = W.toolbar.sortOptions, Df = W.toolbar.treatments, Of = W.toolbar.sizeUnits;
function kf() {
	let { page: e, repo: t, client: n } = Pc(), r = G((e) => e.filters), i = G((e) => e.setSearch), a = G((e) => e.toggleCat), o = G((e) => e.setVariant), s = G((e) => e.setSort), c = G((e) => e.toggleOrder), l = G((e) => e.size), u = G((e) => e.setSize), f = G((e) => e.sizeUnit), p = G((e) => e.setSizeUnit), m = G((e) => e.gridStroke), h = G((e) => e.setGridStroke), g = G((e) => e.color), _ = G((e) => e.setColor), v = G((e) => e.treatment), y = G((e) => e.setTreatment), b = G((e) => e.selection), x = G((e) => e.clearSelection), T = G((e) => e.resetFilters), E = G((e) => e.openConfirm), D = G((e) => e.showToast), O = G((e) => e.runTask), ee = G((e) => e.config), te = dl(), k = q(), A = (e, t) => {
		let n = k(Vt(e));
		return n === e ? t : n;
	}, j = _c(), M = ee?.ranges ?? W.ranges, N = ee?.features ?? W.features, P = () => E({
		title: k("toolbar.resetTitle"),
		body: k("toolbar.resetBody"),
		confirmLabel: k("toolbar.resetConfirm"),
		danger: !0,
		onConfirm: () => {
			T(), D(k("toolbar.resetToast"), "refresh");
		}
	}), F = d(() => {
		let e = [];
		r.search && e.push({
			key: "q",
			label: `“${r.search}”`,
			remove: () => i("")
		});
		for (let t of r.categories) e.push({
			key: `c-${t}`,
			label: t,
			remove: () => a(t)
		});
		return r.variant && e.push({
			key: "v",
			label: r.variant,
			remove: () => o(r.variant)
		}), e;
	}, [
		r,
		i,
		a,
		o
	]);
	return /* @__PURE__ */ w("div", {
		"data-region": "toolbar",
		style: {
			minHeight: Dc(42),
			flex: "none",
			display: "flex",
			flexWrap: "wrap",
			alignItems: "center",
			gap: "6px 8px",
			padding: "5px 12px",
			borderBottom: "1px solid var(--border)"
		},
		children: [
			/* @__PURE__ */ w("span", {
				className: "text-[12px] text-[var(--muted-fg)] whitespace-nowrap",
				children: [
					gc(e.total),
					" ",
					e.total === 1 ? k("toolbar.iconOne") : k("toolbar.iconMany")
				]
			}),
			F.map((e) => /* @__PURE__ */ w("button", {
				onClick: e.remove,
				title: k("toolbar.removeFilter"),
				className: "flex items-center gap-[5px] h-[22px] py-0 px-[7px] border border-[var(--border)] rounded-[11px] bg-[var(--accent-soft)] text-brand-secondary text-[11px] font-medium cursor-pointer capitalize",
				children: [/* @__PURE__ */ C("span", { children: e.label }), /* @__PURE__ */ C(K, {
					name: "close",
					size: 8,
					color: "currentColor"
				})]
			}, e.key)),
			N.multiSelect !== !1 && b.length > 0 && /* @__PURE__ */ w("div", {
				className: "flex items-center gap-1.5 pl-1",
				children: [
					/* @__PURE__ */ C("span", {
						className: "text-[11.5px] text-[var(--accent-text)] font-semibold",
						children: k("toolbar.selected", { n: b.length })
					}),
					/* @__PURE__ */ C("button", {
						onClick: () => {
							let r = O(k("task.copyNames", { n: b.length }), async () => (await Af(b, t, n, e.items)).map((e) => Kt(e)).join("\n"));
							te(r, k("toolbar.namesCopied", { n: b.length }));
						},
						className: "h-[22px] py-0 px-2 border border-[var(--border)] rounded-[calc(var(--radius)_-_3px)] bg-[var(--bg)] text-[11px] cursor-pointer text-[var(--fg)]",
						children: k("toolbar.copyNames")
					}),
					/* @__PURE__ */ C(Es, {
						label: k("toolbar.export"),
						align: "left",
						width: 190,
						panelStyle: { padding: 4 },
						trigger: (e, t) => /* @__PURE__ */ w("button", {
							onClick: t,
							className: "h-[22px] py-0 px-2 border border-[var(--border)] rounded-[calc(var(--radius)_-_3px)] bg-[var(--bg)] text-[11px] cursor-pointer text-[var(--fg)] flex items-center gap-[5px]",
							children: [
								/* @__PURE__ */ C(K, {
									name: "download",
									size: 10,
									color: "currentColor"
								}),
								" ",
								k("toolbar.export"),
								" ",
								/* @__PURE__ */ C(K, {
									name: "chevron-down",
									size: 8,
									color: "var(--muted-fg)"
								})
							]
						}),
						children: (r) => /* @__PURE__ */ C(S, { children: Tf.map((i) => /* @__PURE__ */ w("button", {
							onClick: async () => {
								r();
								let a = await O(k("task.export", { n: b.length }), async () => {
									let r = await Af(b, t, n, e.items);
									return await wf.export(i.id, r), r;
								});
								D(k("toolbar.exportedToast", {
									n: a.length,
									label: k(`export.${i.id}`)
								}), "download");
							},
							style: {
								...js,
								height: "auto",
								padding: "7px 9px",
								gap: 10
							},
							children: [i.icon && /* @__PURE__ */ C("div", {
								className: "w-[26px] h-[26px] flex-none rounded-[7px] bg-[var(--muted)] flex items-center justify-center",
								children: /* @__PURE__ */ C(K, {
									name: i.icon,
									size: 14,
									color: "var(--muted-fg)"
								})
							}), /* @__PURE__ */ w("div", {
								className: "flex-1 text-start",
								children: [/* @__PURE__ */ C("div", {
									className: "text-[12.5px] font-[600]",
									children: k(`export.${i.id}`)
								}), /* @__PURE__ */ C("div", {
									className: "text-[10.5px] text-[var(--muted-fg)]",
									children: k(`export.${i.id}Desc`)
								})]
							})]
						}, i.id)) })
					}),
					/* @__PURE__ */ C("button", {
						onClick: x,
						className: "h-[22px] py-0 px-2 border-0 bg-transparent text-[11px] cursor-pointer text-[var(--muted-fg)]",
						children: k("common.clear")
					})
				]
			}),
			/* @__PURE__ */ C("span", { className: "flex-1" }),
			N.treatments && /* @__PURE__ */ C(Cs, {
				size: "sm",
				"aria-label": k("toolbar.treatment"),
				icon: ta,
				items: Df.map((e) => ({
					id: e.id,
					label: A(`treatment.${e.id}`, e.label)
				})),
				selectedKey: v,
				onSelectionChange: (e) => y(e),
				className: "w-36 flex-none",
				children: (e) => /* @__PURE__ */ C(Cs.Item, {
					...e,
					supportingText: A(`treatment.${String(e.id)}Desc`, Df.find((t) => t.id === e.id)?.desc ?? "")
				})
			}),
			/* @__PURE__ */ w("div", {
				className: "flex flex-none items-center gap-[7px]",
				children: [
					/* @__PURE__ */ C("span", {
						style: jf,
						children: k("toolbar.sort")
					}),
					/* @__PURE__ */ C(Cs, {
						size: "sm",
						"aria-label": k("toolbar.sort"),
						items: Ef.map((e) => ({
							id: e.id,
							label: A(`sort.${e.id}`, e.label)
						})),
						selectedKey: r.sortBy,
						onSelectionChange: (e) => s(e),
						className: "w-32 flex-none",
						children: (e) => /* @__PURE__ */ C(Cs.Item, { ...e })
					}),
					/* @__PURE__ */ C(Ts, {
						content: k("toolbar.toggleSortOrder"),
						children: /* @__PURE__ */ C("button", {
							onClick: c,
							"aria-label": k("toolbar.toggleSortOrder"),
							style: {
								...As,
								width: 28,
								padding: 0,
								justifyContent: "center",
								color: "var(--muted-fg)"
							},
							children: /* @__PURE__ */ C(K, {
								name: r.sortOrder === "asc" ? "sort-asc" : "sort-desc",
								size: 13,
								color: "currentColor"
							})
						})
					})
				]
			}),
			/* @__PURE__ */ C(Nf, {}),
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-[7px]",
				children: [
					/* @__PURE__ */ C("span", {
						style: jf,
						children: k("toolbar.size")
					}),
					/* @__PURE__ */ C("div", {
						className: "w-[104px] px-3",
						children: /* @__PURE__ */ C(Vs, {
							minValue: M.size.min,
							maxValue: M.size.max,
							step: M.size.step,
							value: l,
							onChange: (e) => u(e),
							"aria-label": k("toolbar.gridIconSize"),
							formatOptions: { style: "decimal" }
						})
					}),
					/* @__PURE__ */ C("span", {
						style: {
							...Mf,
							fontSize: 10.5,
							color: "var(--muted-fg)",
							minWidth: 52,
							textAlign: "right"
						},
						children: f === "px" ? k("unit.pxValue", { n: l }) : `${l} ${f}`
					}),
					/* @__PURE__ */ C(Cs, {
						size: "sm",
						"aria-label": k("toolbar.sizeUnit"),
						items: Of.map((e) => ({
							id: e,
							label: e
						})),
						selectedKey: f,
						onSelectionChange: (e) => p(e),
						className: "w-20 flex-none",
						popoverClassName: "min-w-20",
						children: (e) => /* @__PURE__ */ C(Cs.Item, { ...e })
					})
				]
			}),
			/* @__PURE__ */ C(Nf, {}),
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-[7px]",
				title: k("toolbar.strokeTitle"),
				children: [
					/* @__PURE__ */ C("span", {
						style: jf,
						children: k("toolbar.stroke")
					}),
					/* @__PURE__ */ C("div", {
						className: "w-[88px] px-3",
						children: /* @__PURE__ */ C(Vs, {
							minValue: M.stroke.min,
							maxValue: M.stroke.max,
							step: M.stroke.step,
							value: m,
							onChange: (e) => h(e),
							"aria-label": k("toolbar.stroke"),
							formatOptions: {
								style: "decimal",
								maximumFractionDigits: 2
							}
						})
					}),
					/* @__PURE__ */ C("span", {
						style: {
							...Mf,
							fontSize: 10.5,
							color: "var(--muted-fg)",
							minWidth: 40,
							textAlign: "right"
						},
						children: m.toFixed(2)
					})
				]
			}),
			/* @__PURE__ */ C(Nf, {}),
			/* @__PURE__ */ w("div", {
				className: "flex flex-none items-center gap-[7px]",
				children: [/* @__PURE__ */ C(Es, {
					label: k("toolbar.previewColor"),
					align: "right",
					width: 196,
					panelStyle: { padding: 10 },
					trigger: (e, t) => /* @__PURE__ */ w("button", {
						onClick: t,
						title: k("toolbar.previewColor"),
						style: {
							...As,
							padding: "0 8px"
						},
						children: [
							/* @__PURE__ */ C("span", { style: {
								width: 13,
								height: 13,
								borderRadius: "50%",
								background: g ?? "linear-gradient(135deg,var(--fg),var(--muted-fg))",
								border: "1px solid var(--border)"
							} }),
							/* @__PURE__ */ C("span", {
								className: "text-[11.5px]",
								children: k("toolbar.color")
							}),
							/* @__PURE__ */ C(K, {
								name: "chevron-down",
								size: 9,
								color: "currentColor"
							})
						]
					}),
					children: () => /* @__PURE__ */ C(S, { children: /* @__PURE__ */ C(pl, {
						value: g,
						onChange: _
					}) })
				}), /* @__PURE__ */ C(Ts, {
					content: k("toolbar.resetFilters"),
					shortcut: vc(j),
					children: /* @__PURE__ */ C("button", {
						onClick: P,
						"aria-label": k("toolbar.resetFilters"),
						style: {
							...As,
							width: 28,
							padding: 0,
							justifyContent: "center",
							border: "none",
							backgroundColor: "transparent",
							color: "var(--muted-fg)"
						},
						children: /* @__PURE__ */ C(K, {
							name: "refresh",
							size: 13,
							color: "currentColor"
						})
					})
				})]
			})
		]
	});
}
async function Af(e, t, n, r) {
	if (t) return e.map((e) => t.byId(e)).filter((e) => !!e);
	if (!n) return [];
	let i = new Map(r.map((e) => [e.id, e]));
	return (await Promise.all(e.map((e) => i.has(e) ? i.get(e) : n.getIcon(e).catch(() => null)))).filter((e) => !!e);
}
var jf = {
	fontSize: 11,
	fontWeight: 600,
	color: "var(--muted-fg)"
}, Mf = { fontFamily: "'Geist Mono',monospace" }, Nf = () => /* @__PURE__ */ C("div", { className: "hidden md:block w-[1px] h-[18px] bg-[var(--border)] my-0 mx-0.5" });
// node_modules/@tanstack/virtual-core/dist/esm/lazy-measurements.js
function Pf(e) {
	return typeof e == "object" ? e.key : e;
}
function Ff(e, t) {
	let n = e.length;
	return new Proxy(e, { get(e, r, i) {
		if (typeof r == "string") {
			let i = r.charCodeAt(0);
			if (i >= 48 && i <= 57) {
				let i = +r;
				if (Number.isInteger(i) && i >= 0 && i < n) {
					let n = e[i];
					if (typeof n != "object") {
						let r = t[i * 2];
						n = e[i] = {
							index: i,
							key: n,
							start: r,
							size: t[i * 2 + 1],
							end: r + t[i * 2 + 1],
							lane: 0
						};
					}
					return n;
				}
			}
			if (r === "length") return n;
		}
		return Reflect.get(e, r, i);
	} });
}
// node_modules/@tanstack/virtual-core/dist/esm/utils.js
function If(e, t, n) {
	let r = n.initialDeps ?? [], i, a = !0;
	function o() {
		let o = process.env.NODE_ENV !== "production" && !!n.key && !!n.debug?.call(n), s = 0;
		o && (s = Date.now());
		let c = e();
		if (!(c.length !== r.length || c.some((e, t) => r[t] !== e))) return i;
		r = c;
		let l = 0;
		if (o && (l = Date.now()), i = t(...c), o) {
			let e = Math.round((Date.now() - s) * 100) / 100, t = Math.round((Date.now() - l) * 100) / 100, r = t / 16, i = (e, t) => {
				for (e = String(e); e.length < t;) e = " " + e;
				return e;
			};
			console.info(`%c⏱ ${i(t, 5)} /${i(e, 5)} ms`, `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * r, 120))}deg 100% 31%);`, n?.key);
		}
		return n?.onChange && !(a && n.skipInitialOnChange) && n.onChange(i), a = !1, i;
	}
	return o.updateDeps = (e) => {
		r = e;
	}, o;
}
function Lf(e, t) {
	if (e === void 0) throw Error(`Unexpected undefined${t ? `: ${t}` : ""}`);
	return e;
}
var Rf = (e, t) => Math.abs(e - t) < 1.01, zf = (e, t, n) => {
	let r;
	return Object.assign(function(...i) {
		e.clearTimeout(r), r = e.setTimeout(() => t.apply(this, i), n);
	}, { cancel: () => {
		e.clearTimeout(r);
	} });
};
// node_modules/@tanstack/virtual-core/dist/esm/scroll-classifier.js
function Bf({ offset: e, isScrolling: t, elementMax: n, holdOffset: r, scrollOffset: i, pendingWrite: a, clampedMaxAtWrite: o }) {
	return t && a === null && e === i ? "spurious" : a !== null && Math.abs(e - a.target) < 1.5 ? "readBack" : a !== null && !a.smooth && n !== null && a.target > n + r + .5 && Math.abs(e - (n + r)) < 1.5 || a !== null && !a.smooth && a.lowMaxes?.some((t) => Math.abs(e - t) < 1.5) ? "clampedReadBack" : o !== null && Math.abs(e - o) < 1.5 ? "clampedEcho" : "external";
}
var Vf = (e) => e === "smooth" || e === "smoothFinishing";
function Hf({ kind: e, offset: t, command: n, target: r }) {
	return e !== "spurious" && e !== "readBack" && e !== "clampedReadBack" && n?.index != null && n.phase !== "queued" && !Vf(n.phase) && !Rf(t, n.lastTargetOffset) && !Rf(t, r()) && e !== "clampedEcho";
}
var Uf = 40;
function Wf(e) {
	let t = e[e.length - 1];
	if (t === void 0) return !1;
	let n = e.length - 2;
	for (; n >= 0 && t.t - e[n].t < Uf;) n--;
	if (n < 0) return !1;
	let r = e[n], i = n - 1;
	for (; i >= 0 && r.t - e[i].t < Uf;) i--;
	if (i < 0) return !1;
	let a = e[i], o = (t.offset - r.offset) / (t.t - r.t), s = (r.offset - a.offset) / (r.t - a.t);
	return o * s >= 0 && Math.abs(o) >= 2 * Math.abs(s) && Math.abs(o) - Math.abs(s) >= .8;
}
function Gf(e) {
	let t = e[e.length - 1];
	if (t === void 0) return !1;
	let n = e.length - 2;
	for (; n >= 0 && t.t - e[n].t < Uf;) n--;
	if (n < 0) return !1;
	let r = e[n];
	return Math.abs(t.offset - r.offset) / (t.t - r.t) >= .05;
}
// node_modules/@tanstack/virtual-core/dist/esm/ios-gesture.js
var Kf, qf = () => {
	if (Kf !== void 0) return Kf;
	if (typeof navigator > "u") return Kf = !1;
	if (/iP(hone|od|ad)/.test(navigator.userAgent)) return Kf = !0;
	let e = navigator.maxTouchPoints;
	return Kf = navigator.platform === "MacIntel" && e !== void 0 && e > 0;
}, Jf, Yf = () => Jf === void 0 ? Jf = qf() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("overflow-anchor: auto") : Jf, Xf = {
	capture: !0,
	passive: !0
}, Zf = class {
	constructor(e) {
		this.host = e, this._touch = null, this.inMotion = () => this._touch !== null && this._touch.phase !== "lateFling", this.dragging = () => this._touch?.phase === "down" && this._touch.moved, this.tail = () => this._touch?.phase === "tail" ? this._touch.moved ? "fling" : "tap" : null, this.onScroll = ({ isScrolling: e, ownReadBack: t, moved: n, external: r }) => (e && this._touch?.phase === "tail" ? this._openTail(this._touch.moved || !t, !1) : this._touch?.phase === "lateFling" && (this.host.now() > this._touch.until ? this._touch = null : r && e && n && this._openTail(!0, !1)), !t && e && n && this._touch?.phase === "down" ? (this._touch.moved = !0, !0) : !1), this.touchStart = () => {
			this.end(), this._touch = {
				phase: "down",
				moved: !1
			};
		}, this.touchEnd = () => {
			let e = this._touch?.phase === "down" && this._touch.moved;
			this.end(), this._openTail(e, e);
		}, this.end = () => {
			let e = this.host.getWindow();
			this._touch?.phase === "tail" && e != null && e.clearTimeout(this._touch.timerId), this._touch = null;
		}, this.listen = (e) => {
			let t = () => this.touchStart(), n = () => this.touchEnd();
			return e.addEventListener("touchstart", t, Xf), e.addEventListener("touchend", n, Xf), e.addEventListener("touchcancel", n, Xf), () => {
				e.removeEventListener("touchstart", t, Xf), e.removeEventListener("touchend", n, Xf), e.removeEventListener("touchcancel", n, Xf), this.end();
			};
		}, this._openTail = (e, t) => {
			let n = this.host.getWindow();
			if (!qf() || n == null) return;
			this.end();
			let r = {
				phase: "tail",
				moved: e,
				awaitingFling: t,
				timerId: n.setTimeout(() => {
					this.host.tailStillMoving() ? this._openTail(r.moved, r.awaitingFling) : (this._touch = r.awaitingFling ? {
						phase: "lateFling",
						until: this.host.now() + 1e3
					} : null, this.host.onTailClosed());
				}, 150)
			};
			this._touch = r;
		};
	}
	get touch() {
		return this._touch;
	}
}, Qf = (e) => {
	let { clientWidth: t, clientHeight: n } = e;
	return {
		width: t,
		height: n
	};
}, $f = (e) => {
	let t = /* @__PURE__ */ new Set();
	return {
		schedule: (n) => {
			let r = e.requestAnimationFrame(() => {
				t.delete(r), n();
			});
			t.add(r);
		},
		cancel: () => {
			t.forEach((t) => e.cancelAnimationFrame(t)), t.clear();
		}
	};
}, ep = (e) => e, tp = (e) => {
	let t = e.overscan * Math.max(e.lanes ?? 1, 1), n = Math.max(e.startIndex - t, 0), r = Math.min(e.endIndex + t, e.count - 1) - n + 1, i = Array(r);
	for (let e = 0; e < r; e++) i[e] = n + e;
	return i;
}, np = (e, t) => {
	let n = e.scrollElement;
	if (!n) return;
	let r = e.targetWindow;
	if (!r) return;
	let i = (e) => {
		let { width: n, height: r } = e;
		t({
			width: Math.round(n),
			height: Math.round(r)
		});
	};
	if (i(Qf(n)), !r.ResizeObserver) return () => {};
	let a = $f(r), o = new r.ResizeObserver(() => {
		let t = () => {
			i(Qf(n));
		};
		e.options.useAnimationFrameWithResizeObserver ? a.schedule(t) : t();
	});
	return o.observe(n, { box: "content-box" }), () => {
		o.unobserve(n), a.cancel();
	};
}, rp = { passive: !0 }, ip = typeof window > "u" || "onscrollend" in window, ap = (e, t, n) => {
	let r = e.scrollElement;
	if (!r) return;
	let i = e.targetWindow;
	if (!i) return;
	let a = e.options.useScrollendEvent && ip, o = 0, s = a ? null : zf(i, () => t(n(r), !1), e.options.isScrollingResetDelay), c = (e) => () => {
		o = n(r), s?.(), t(o, e);
	}, l = c(!0), u = c(!1);
	return r.addEventListener("scroll", l, rp), a && r.addEventListener("scrollend", u, rp), () => {
		r.removeEventListener("scroll", l), a && r.removeEventListener("scrollend", u), s?.cancel();
	};
}, op = (e, t) => ap(e, t, (t) => {
	let { horizontal: n, isRtl: r } = e.options;
	return n ? t.scrollLeft * (r && -1 || 1) : t.scrollTop;
}), sp = (e, t, n) => {
	if (n.options.useCachedMeasurements) {
		let t = n.indexFromElement(e), r = n.options.getItemKey(t);
		return n.itemSizeCache.get(r) ?? n.options.estimateSize(t);
	}
	if (t?.borderBoxSize) {
		let e = t.borderBoxSize[0];
		if (e) return Math.round(e[n.options.horizontal ? "inlineSize" : "blockSize"]);
	}
	if (!t) {
		let t = n.indexFromElement(e), r = n.options.getItemKey(t), i = n.itemSizeCache.get(r);
		if (i !== void 0) return i;
	}
	return e[n.options.horizontal ? "offsetWidth" : "offsetHeight"];
}, cp = (e, { adjustments: t = 0, behavior: n }, r) => {
	var i, a;
	(a = (i = r.scrollElement)?.scrollTo) == null || a.call(i, {
		[r.options.horizontal ? "left" : "top"]: e + t,
		behavior: n
	});
}, lp = (e, t) => e === "smooth" ? t ? "smoothLanded" : "smooth" : "instant", up = (e) => e?.phase === "smooth" || e?.phase === "smoothLanded";
function dp(e, t, n, r) {
	if (t === 0) return !1;
	let i = r(0), a = /* @__PURE__ */ new Set(), o = 0;
	for (; o < e;) {
		let e = n(o);
		if (e === i) break;
		a.add(e), o++;
	}
	let s = e - o;
	if (s === 0 || s >= t) return !1;
	for (let e = 0; e < s; e++) if (r(e) !== n(o + e)) return !1;
	for (let e = s; e < t; e++) if (a.has(r(e))) return !1;
	return !0;
}
var fp = class {
	constructor(e) {
		this.unsubs = [], this.scrollElement = null, this.targetWindow = null, this.isScrolling = !1, this.scrollState = null, this.measurementsCache = [], this._singleLaneMeasurements = null, this.itemSizeCache = /* @__PURE__ */ new Map(), this.itemSizeCacheVersion = 0, this.laneAssignments = /* @__PURE__ */ new Map(), this.pendingMin = null, this.prevLanes = void 0, this.lanesChangedFlag = !1, this.lanesSettling = !1, this.pendingScrollAnchor = null, this.scrollRect = null, this.scrollOffset = null, this.scrollDirection = null, this._holdOffset = 0, this._reportedOverscroll = !1, this._iosGesture = new Zf({
			getWindow: () => this.targetWindow,
			now: () => this.now(),
			tailStillMoving: () => {
				let e = this.scrollState;
				if (e?.phase !== "queued" || this.pendingWrite !== null) return !1;
				let t = this._readElementOffset();
				return t === null || this._lastElementOffset === null || Math.abs(t - this._lastElementOffset) < 1 ? !1 : (this._lastElementOffset = t, e.samples = [...e.samples ?? [], {
					t: this.now(),
					offset: t
				}], !0);
			},
			onTailClosed: () => {
				let e = this.scrollState;
				e?.phase === "queued" && Gf(e.samples ?? []) && (this.scrollState = null), this._flushHoldIfReady(!0), this._writeAwaitingCommand(), this._retryClampedAdjustment();
			}
		}), this._lastElementOffset = null, this.pendingWrite = null, this._clampedAdjustment = null, this.elementsCache = /* @__PURE__ */ new Map(), this._resizeBatch = null, this.now = () => {
			var e;
			return ((e = this.targetWindow?.performance)?.now)?.call(e) ?? Date.now();
		}, this.observer = /* @__PURE__ */ (() => {
			let e = null, t = null, n = () => {
				if (e) return e;
				let n = this.targetWindow;
				if (!n || !n.ResizeObserver) return null;
				let i = t = $f(n);
				return e = new n.ResizeObserver((e) => {
					let t = () => {
						let t = { sync: !1 };
						this._resizeBatch = t;
						try {
							e.forEach(r);
						} finally {
							this._resizeBatch = null, t.notify && (this.notify(t.sync), this._noteClampMax(), this._flushHoldIfReady(!0), this._retryClampedAdjustment());
						}
					};
					this.options.useAnimationFrameWithResizeObserver ? i.schedule(t) : t();
				});
			}, r = (e) => {
				let t = e.target, n = this.indexFromElement(t);
				if (t.isConnected) this.isIndexInRange(n) && this.shouldMeasureDuringScroll(n) && this.resizeItem(n, this.options.measureElement(t, e, this));
				else {
					this.observer.unobserve(t);
					for (let [e, n] of this.elementsCache) if (n === t) {
						this.elementsCache.delete(e);
						break;
					}
				}
			};
			return {
				disconnect: () => {
					var r;
					(r = n()) == null || r.disconnect(), t?.cancel(), e = null, t = null;
				},
				observe: (e) => n()?.observe(e, { box: "border-box" }),
				unobserve: (e) => n()?.unobserve(e)
			};
		})(), this.range = null, this.setOptions = (e) => {
			let t = {
				debug: !1,
				initialOffset: 0,
				overscan: 1,
				paddingStart: 0,
				paddingEnd: 0,
				scrollPaddingStart: 0,
				scrollPaddingEnd: 0,
				horizontal: !1,
				getItemKey: ep,
				rangeExtractor: tp,
				onChange: () => {},
				measureElement: sp,
				initialRect: {
					width: 0,
					height: 0
				},
				scrollMargin: 0,
				gap: 0,
				indexAttribute: "data-index",
				initialMeasurementsCache: [],
				lanes: 1,
				anchorTo: "start",
				followOnAppend: !1,
				scrollEndThreshold: 1,
				isScrollingResetDelay: 150,
				enabled: !0,
				isRtl: !1,
				useScrollendEvent: !1,
				useAnimationFrameWithResizeObserver: !1,
				laneAssignmentMode: "estimate",
				useCachedMeasurements: !1
			};
			for (let n in e) {
				let r = e[n];
				r !== void 0 && (t[n] = r);
			}
			let n = this.options, r = null, i = null, a = !1;
			if (n !== void 0 && n.enabled && t.enabled && t.anchorTo === "end" && this.scrollElement !== null) {
				let e = n.count, o = t.count, s = this.getMeasurements(), c = this._singleLaneMeasurements?.items ?? s, l = (e) => Pf(c[e]), u = e > 0 ? l(0) : null, d = e > 0 ? l(e - 1) : null;
				if (o !== e || e > 0 && o > 0 && (t.getItemKey(0) !== u || t.getItemKey(o - 1) !== d)) {
					a = !0;
					let c = e > 0 ? this.getVirtualItemForOffset(this.getScrollOffset()) ?? s[0] : null;
					c && (r = [c.key, this.getScrollOffset() - c.start]);
					let u = t.followOnAppend === !0 ? "auto" : t.followOnAppend || null;
					u && o > 0 && this.isAtEnd(n.scrollEndThreshold) && (e === 0 || t.getItemKey(o - 1) !== d) && (o > e || dp(e, o, l, t.getItemKey)) && (i = u);
				}
			}
			this.options = t, a && (this.pendingMin = 0, this.itemSizeCacheVersion++);
			let o = null;
			if (r && this.scrollOffset !== null && !this._awaitingCommandReadBack()) {
				let [e, t] = r, n = this.getMeasurements(), { count: a, getItemKey: s } = this.options, c = 0;
				for (; c < a && s(c) !== e;) c++;
				if (c < a) {
					let e = n[c];
					if (e) {
						let n = Math.max(0, e.start + t);
						!i && n !== this.scrollOffset && (o = n - this.scrollOffset, this.scrollOffset = n);
					}
				}
			}
			i ? this.pendingScrollAnchor = {
				kind: "follow",
				behavior: i
			} : o !== null && (this._canWriteScroll() ? this.pendingScrollAnchor = {
				kind: "anchor",
				delta: o
			} : (this._holdOffset += o, this._followOffsetTarget(o)));
		}, this.notify = (e) => {
			var t, n;
			(n = (t = this.options).onChange) == null || n.call(t, this, e);
		}, this.maybeNotify = If(() => (this.calculateRange(), [
			this.isScrolling,
			this.range ? this.range.startIndex : null,
			this.range ? this.range.endIndex : null
		]), (e) => {
			this.notify(e);
		}, {
			key: process.env.NODE_ENV !== "production" && "maybeNotify",
			debug: () => this.options.debug,
			initialDeps: [
				this.isScrolling,
				this.range ? this.range.startIndex : null,
				this.range ? this.range.endIndex : null
			]
		}), this.cleanup = () => {
			var e;
			this.unsubs.filter(Boolean).forEach((e) => e()), this.unsubs = [], this.observer.disconnect(), this.rafId != null && this.targetWindow && (this.targetWindow.cancelAnimationFrame(this.rafId), this.rafId = null), this.scrollState = null, (e = this._momentumStop) == null || e.restore(), this._momentumStop = null, this.isScrolling = !1, this.scrollDirection = null, this._holdOffset = 0, this._reportedOverscroll = !1, this._clampedAdjustment = null, this.pendingWrite = null, this.scrollElement = null, this.targetWindow = null;
		}, this._didMount = () => () => {
			this.cleanup();
		}, this._willUpdate = () => {
			let e = this.options.enabled ? this.options.getScrollElement() : null;
			if (this.scrollElement !== e) {
				if (this.cleanup(), !e) {
					this.maybeNotify();
					return;
				}
				this.scrollElement = e, this.targetWindow = this.scrollElement && "ownerDocument" in this.scrollElement ? this.scrollElement.ownerDocument.defaultView : this.scrollElement?.window ?? null, this.elementsCache.forEach((e) => {
					this.observer.observe(e);
				}), this.unsubs.push(this.options.observeElementRect(this, (e) => {
					this.scrollRect = e, this.maybeNotify();
				})), this.unsubs.push(this.options.observeElementOffset(this, (e, t) => {
					let n = t ? this._elementMaxScrollOffset() : null, r = this._reportedOverscroll;
					this._reportedOverscroll = e < 0 || n !== null && e > n + 1;
					let i = e;
					this._lastElementOffset = i, e = this._toLayoutOffset(e);
					let a = this._classifyScrollEvent(e, t, n);
					if (a === "spurious") return;
					a === "readBack" ? e = this.pendingWrite.target : a === "clampedReadBack" && this.scrollState?.index != null && e < this.getMaxScrollOffset() - 1.5 ? this.scrollState.lastTargetOffset = e : Hf({
						kind: a,
						offset: e,
						command: this.scrollState,
						target: () => this.getScrollStateTarget(this.scrollState)
					}) && (this.scrollState = null), this.pendingWrite = null, this._clampedAdjustment !== null && Math.abs(e - this._clampedAdjustment.maxAtWrite) >= 1.5 && (this._clampedAdjustment = null);
					let o = this.getScrollOffset(), s = this.scrollDirection;
					this.scrollDirection = t ? o === e ? this.scrollDirection : o < e ? "forward" : "backward" : null, this.scrollOffset = e, this.isScrolling = t;
					let c = this.scrollState;
					if (c?.phase === "queued" && a === "external" && t) {
						if (r || this._reportedOverscroll) c.samples = [];
						else {
							let e = this.now();
							c.samples = [...(c.samples ?? []).filter((t) => e - t.t <= 200), {
								t: e,
								offset: i
							}], (s !== null && this.scrollDirection !== s || Wf(c.samples)) && (this.scrollState = null);
						}
					}
					this._iosGesture.onScroll({
						isScrolling: t,
						ownReadBack: a === "readBack",
						moved: e !== o,
						external: a === "external" && this.scrollState?.phase !== "smooth" && this.scrollState?.phase !== "smoothFinishing"
					}) && this.scrollState?.phase === "queued" && (this.scrollState = null), this._flushHoldIfReady(!0), this.scrollState && this.scheduleScrollReconcile(), this.maybeNotify();
				})), "addEventListener" in this.scrollElement && this.unsubs.push(this._iosGesture.listen(this.scrollElement)), this._scrollToOffset(this.getScrollOffset());
			}
			this._noteClampMax();
			let t = this.pendingScrollAnchor;
			this.pendingScrollAnchor = null, t && this.scrollElement && this.options.enabled && (t.kind === "anchor" ? this._canWriteScroll() ? up(this.scrollState) && !Rf(this.getScrollOffset() - t.delta, this.scrollState.lastTargetOffset) || (this._followOffsetTarget(t.delta), this._scrollToOffset(this.getScrollOffset())) : (this._holdOffset += t.delta, this._followOffsetTarget(t.delta), this.notify(!1)) : this.scrollToEnd({ behavior: t.behavior })), this._flushHoldIfReady(!1), this._retryClampedAdjustment();
		}, this._classifyScrollEvent = (e, t, n) => Bf({
			offset: e,
			isScrolling: t,
			elementMax: n,
			holdOffset: this._holdOffset,
			scrollOffset: this.scrollOffset,
			pendingWrite: this.pendingWrite,
			clampedMaxAtWrite: this._clampedAdjustment?.maxAtWrite ?? null
		}), this._retryClampedAdjustment = () => {
			if (this._clampedAdjustment === null || !this.scrollElement || !this.options.enabled || !this._canWriteScroll()) return;
			let { target: e, maxAtWrite: t } = this._clampedAdjustment, n = this.getMaxScrollOffset();
			n > t + .5 && (this._clampedAdjustment = e > n + .5 ? {
				target: e,
				maxAtWrite: n
			} : null, this._scrollToOffset(e));
		}, this._writeAwaitingCommand = () => {
			let e = this.scrollState;
			if (e === null || e.phase !== "queued") return;
			let { behavior: t } = e;
			this.getMeasurements();
			let n = this.getScrollStateTarget(e);
			e.lastTargetOffset = n, this._clampedAdjustment = null, e.phase = lp(t, e.index != null && Rf(n, this.getScrollOffset())), this._scrollToOffset(n, { behavior: t }), this.scheduleScrollReconcile();
		}, this._readElementOffset = () => {
			let e = this.scrollElement;
			if (e == null) return null;
			let { horizontal: t, isRtl: n } = this.options;
			return typeof e.scrollTop == "number" ? t ? e.scrollLeft * (n && -1 || 1) : e.scrollTop : typeof e.scrollY == "number" ? t ? e.scrollX : e.scrollY : null;
		}, this._canWriteScroll = () => !(qf() && this._iosGesture.inMotion()) && !this._reportedOverscroll, this._flushHoldIfReady = (e) => {
			if (this._holdOffset === 0 || !this.scrollElement || !this.options.enabled || !this._canWriteScroll() || this.scrollState?.phase === "smooth") return;
			this._holdOffset = 0, this.scrollOffset !== null && this.scrollOffset < 0 && (this.scrollOffset = 0), this.notify(e);
			let t = this.getCommandWrittenOffset() ?? this.getScrollOffset();
			this._clampedAdjustment = this._clampedBy(t), this._scrollToOffset(t);
		}, this.rafId = null, this.getSize = () => this.options.enabled ? (this.scrollRect = this.scrollRect ?? this.options.initialRect, this.scrollRect[this.options.horizontal ? "width" : "height"]) : (this.scrollRect = null, 0), this.getScrollOffset = () => this.options.enabled ? (this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset == "function" ? this.options.initialOffset() : this.options.initialOffset), this.scrollOffset) : (this.scrollOffset = null, 0), this.getMeasurementOptions = If(() => [
			this.options.count,
			this.options.paddingStart,
			this.options.scrollMargin,
			this.options.getItemKey,
			this.options.enabled,
			this.options.lanes,
			this.options.laneAssignmentMode,
			this.options.gap
		], (e, t, n, r, i, a, o, s) => (this.prevLanes !== void 0 && this.prevLanes !== a && (this.lanesChangedFlag = !0), this.prevLanes = a, this.pendingMin = null, {
			count: e,
			paddingStart: t,
			scrollMargin: n,
			getItemKey: r,
			enabled: i,
			lanes: a,
			laneAssignmentMode: o,
			gap: s
		}), { key: !1 }), this.isIndexInRange = (e) => e >= 0 && e < this.options.count, this.getMeasurements = If(() => [this.getMeasurementOptions(), this.itemSizeCacheVersion], ({ count: e, paddingStart: t, scrollMargin: n, getItemKey: r, enabled: i, lanes: a, laneAssignmentMode: o, gap: s }, c) => {
			let l = this.itemSizeCache;
			if (!i) return this.measurementsCache = [], this._singleLaneMeasurements = null, this.itemSizeCache.clear(), this.laneAssignments.clear(), [];
			if (this.laneAssignments.size > e) for (let t of this.laneAssignments.keys()) t >= e && this.laneAssignments.delete(t);
			this.lanesChangedFlag && (this.lanesChangedFlag = !1, this.lanesSettling = !0, this.measurementsCache = [], this._singleLaneMeasurements = null, this.itemSizeCache.clear(), this.laneAssignments.clear(), this.pendingMin = null), this.measurementsCache.length === 0 && !this.lanesSettling && (this.measurementsCache = this.options.initialMeasurementsCache, this.measurementsCache.forEach((e) => {
				this.itemSizeCache.set(e.key, e.size);
			}));
			let u = this.lanesSettling ? 0 : this.pendingMin ?? 0;
			if (this.pendingMin = null, this.lanesSettling && this.measurementsCache.length === e && (this.lanesSettling = !1), a === 1) {
				let i = e * 2, a = this._singleLaneMeasurements?.flat;
				if (!a || a.length < i) {
					let e = new Float64Array(i);
					a && u > 0 && e.set(a.subarray(0, u * 2)), a = e;
				}
				let o = u === 0 ? Array(e) : this._singleLaneMeasurements.items.slice(), c;
				if (u === 0) c = t + n;
				else {
					let e = u - 1;
					c = a[e * 2] + a[e * 2 + 1] + s;
				}
				for (let t = u; t < e; t++) {
					let e = r(t);
					o[t] = e;
					let n = l.get(e), i = typeof n == "number" ? n : this.options.estimateSize(t);
					a[t * 2] = c, a[t * 2 + 1] = i, c += i + s;
				}
				this._singleLaneMeasurements = {
					flat: a,
					items: o
				};
				let d = Ff(o, a);
				return this.measurementsCache = d, d;
			}
			let d = this.measurementsCache.slice(0, u), f = Array(a).fill(void 0), p = new Float64Array(a), m = 0;
			for (let e = 0; e < u; e++) {
				let t = d[e];
				t && (f[t.lane] === void 0 && m++, f[t.lane] = e, p[t.lane] = t.end);
			}
			for (let i = u; i < e; i++) {
				let e = r(i), c = this.laneAssignments.get(i), u, h, g = o === "estimate" || l.has(e);
				if (c !== void 0 && this.options.lanes > 1) {
					u = c;
					let e = f[u], r = e === void 0 ? void 0 : d[e];
					h = r ? r.end + s : t + n;
				} else if (m === a) {
					let e = 0, t = p[0], n = f[0];
					for (let r = 1; r < a; r++) {
						let i = p[r];
						(i < t || i === t && f[r] < n) && (e = r, t = i, n = f[r]);
					}
					u = e, h = t + s, g && this.laneAssignments.set(i, u);
				} else u = i % this.options.lanes, h = t + n, g && this.laneAssignments.set(i, u);
				let _ = l.get(e), v = typeof _ == "number" ? _ : this.options.estimateSize(i), y = h + v;
				d[i] = {
					index: i,
					start: h,
					size: v,
					end: y,
					key: e,
					lane: u
				}, f[u] === void 0 && m++, f[u] = i, p[u] = y;
			}
			return this.measurementsCache = d, d;
		}, {
			key: process.env.NODE_ENV !== "production" && "getMeasurements",
			debug: () => this.options.debug
		}), this.calculateRange = If(() => [
			this.getMeasurements(),
			this.getSize(),
			this.getScrollOffset(),
			this.options.lanes
		], (e, t, n, r) => e.length === 0 || t === 0 ? (this.range = null, null) : (this.range = hp(e, t, n, r, r === 1 && this._singleLaneMeasurements !== null ? this._singleLaneMeasurements.flat : null), this.range), {
			key: process.env.NODE_ENV !== "production" && "calculateRange",
			debug: () => this.options.debug
		}), this.getVirtualIndexes = If(() => {
			let e = null, t = null, n = this.calculateRange();
			return n && (e = n.startIndex, t = n.endIndex), this.maybeNotify.updateDeps([
				this.isScrolling,
				e,
				t
			]), [
				this.options.rangeExtractor,
				this.options.overscan,
				this.options.count,
				e,
				t,
				this.options.lanes
			];
		}, (e, t, n, r, i, a) => r === null || i === null ? [] : e({
			startIndex: r,
			endIndex: i,
			overscan: t,
			count: n,
			lanes: a
		}), {
			key: process.env.NODE_ENV !== "production" && "getVirtualIndexes",
			debug: () => this.options.debug
		}), this.indexFromElement = (e) => {
			let t = this.options.indexAttribute, n = e.getAttribute(t);
			return n ? parseInt(n, 10) : (console.warn(`Missing attribute name '${t}={index}' on measured element.`), -1);
		}, this.shouldMeasureDuringScroll = (e) => {
			if (!up(this.scrollState)) return !0;
			let t = this.scrollState.index ?? this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)?.index;
			if (t !== void 0 && this.range) {
				let n = Math.max(this.options.overscan, Math.ceil((this.range.endIndex - this.range.startIndex) / 2)), r = Math.max(0, t - n), i = Math.min(this.options.count - 1, t + n);
				return e >= r && e <= i;
			}
			return !0;
		}, this.measureElement = (e) => {
			if (!e) {
				this.elementsCache.forEach((e, t) => {
					e.isConnected || (this.observer.unobserve(e), this.elementsCache.delete(t));
				});
				return;
			}
			let t = this.indexFromElement(e);
			if (!this.isIndexInRange(t)) return;
			let n = this.options.getItemKey(t), r = this.elementsCache.get(n);
			r !== e && (r && this.observer.unobserve(r), this.observer.observe(e), this.elementsCache.set(n, e)), e.isConnected && (!this.isScrolling || this.scrollState) && this.shouldMeasureDuringScroll(t) && this.resizeItem(t, this.options.measureElement(e, void 0, this));
		}, this.resizeItem = (e, t) => {
			var n;
			if (!this.isIndexInRange(e)) return;
			this._resizeBatch?.sync && this.getMeasurements();
			let r, i, a, o = this._singleLaneMeasurements?.flat;
			if (this.options.lanes === 1 && o != null) a = this.options.getItemKey(e), i = o[e * 2], r = o[e * 2 + 1];
			else {
				let t = this.measurementsCache[e];
				if (!t) return;
				a = t.key, i = t.start, r = t.size;
			}
			let s = this.itemSizeCache.get(a) ?? r, c = t - s;
			if (c !== 0) {
				let o = this.options.anchorTo === "end" && !up(this.scrollState) && this.getVirtualDistanceFromEnd() <= this.options.scrollEndThreshold, l = o ? this._getLayoutTotalSize() : 0, u = this.getScrollOffset(), d = this.itemSizeCache.has(a) ? i + s <= u && this.scrollDirection !== "backward" : i < u, f = !up(this.scrollState) && (this.shouldAdjustScrollPositionOnItemSizeChange === void 0 ? d : this.shouldAdjustScrollPositionOnItemSizeChange(this.measurementsCache[e] ?? {
					index: e,
					key: a,
					start: i,
					size: r,
					end: i + r,
					lane: 0
				}, c, this));
				(this.pendingMin === null || e < this.pendingMin) && (this.pendingMin = e), this.itemSizeCache.set(a, t), this.itemSizeCacheVersion++;
				let p = !1;
				if (this._awaitingCommandReadBack() || (o ? p = this.applyScrollAdjustment(this._getLayoutTotalSize() - l) : f && (p = this.applyScrollAdjustment(c))), this._resizeBatch) {
					this._resizeBatch.notify = !0, (n = this._resizeBatch).sync || (n.sync = p);
					return;
				}
				this.notify(p), this._noteClampMax(), this._flushHoldIfReady(!0), this._retryClampedAdjustment();
			}
		}, this.getVirtualItems = If(() => [
			this.getVirtualIndexes(),
			this.getMeasurements(),
			this._holdOffset
		], (e, t, n) => {
			let r = [];
			for (let i = 0, a = e.length; i < a; i++) {
				let a = t[e[i]];
				r.push(n === 0 ? a : {
					...a,
					start: a.start - n,
					end: a.end - n
				});
			}
			return r;
		}, {
			key: process.env.NODE_ENV !== "production" && "getVirtualItems",
			debug: () => this.options.debug
		}), this.getVirtualItemForOffset = (e) => {
			let t = this.getMeasurements();
			if (t.length === 0) return;
			let n = this._singleLaneMeasurements?.flat, r = this.options.lanes === 1 && n != null;
			return Lf(t[pp(0, t.length - 1, r ? (e) => n[e * 2] : (e) => Lf(t[e]).start, e)]);
		}, this._noteClampMax = () => {
			if (!this._awaitingCommandReadBack()) return;
			let e = this._elementMaxScrollOffset();
			if (e === null) return;
			let t = this.pendingWrite, n = Math.max(e, 0) + this._holdOffset;
			if (n >= t.target) return;
			let r = t.lowMaxes ??= [];
			r[r.length - 1] !== n && r.push(n);
		}, this.getMaxScrollOffset = () => (this._elementMaxScrollOffset() ?? 0) + this._holdOffset, this._toLayoutOffset = (e) => {
			let t = e + this._holdOffset;
			return this.pendingScrollAnchor?.kind === "anchor" && (t += this.pendingScrollAnchor.delta), t;
		}, this._elementMaxScrollOffset = () => {
			let e = this.scrollElement;
			if (e === null) return null;
			if ("scrollHeight" in e) return this.options.horizontal ? e.scrollWidth - e.clientWidth : e.scrollHeight - e.clientHeight;
			if ("document" in e) {
				let t = e.document.documentElement;
				return this.options.horizontal ? t.scrollWidth - e.innerWidth : t.scrollHeight - e.innerHeight;
			}
			return null;
		}, this._momentumStop = null, this._stopMomentum = (e) => {
			let t = this.scrollElement, n = this.targetWindow;
			if (t === null || n === null) return;
			let r = "document" in t ? t.document.scrollingElement : t;
			if (!r?.style) return;
			if (this._momentumStop) {
				this._momentumStop.done = e;
				return;
			}
			let { style: i } = r, a = this.options.horizontal ? "overflow-x" : "overflow-y", o = i.getPropertyValue(a), s = i.getPropertyPriority(a);
			i.setProperty(a, "hidden", "important");
			let c = {
				restore: () => i.getPropertyValue(a) !== "hidden" || i.getPropertyPriority(a) !== "important" ? !1 : (i.setProperty(a, o, s), !0),
				done: e
			};
			this._momentumStop = c, n.requestAnimationFrame(() => n.requestAnimationFrame(() => {
				this._momentumStop === c && (this._momentumStop = null, c.restore() && c.done());
			}));
		}, this._clampedBy = (e) => {
			let t = this._elementMaxScrollOffset();
			if (t === null) return null;
			let n = t + this._holdOffset;
			return e > n + .5 ? {
				target: e,
				maxAtWrite: n
			} : null;
		}, this.getVirtualDistanceFromEnd = () => Math.max(this._getLayoutTotalSize() + this.options.scrollMargin - this.getSize() - this.getScrollOffset(), 0), this.getDistanceFromEnd = () => Math.max(this.getMaxScrollOffset() - this.getScrollOffset(), 0), this.isAtEnd = (e = this.options.scrollEndThreshold) => this.getDistanceFromEnd() <= e, this.getOffsetForAlignment = (e, t, n = 0) => {
			if (!this.scrollElement) return 0;
			let r = this.getSize(), i = this.getScrollOffset();
			t === "auto" && (t = e >= i + r ? "end" : "start"), t === "center" ? e += (n - r) / 2 : t === "end" && (e -= r);
			let a = this.getMaxScrollOffset();
			return Math.max(Math.min(a, e), 0);
		}, this.getOffsetForIndex = (e, t = "auto") => {
			e = Math.max(0, Math.min(e, this.options.count - 1));
			let n = this.getSize(), r = this.getScrollOffset(), i = this.measurementsCache[e];
			if (!i) return;
			if (t === "auto") {
				if (i.end >= r + n - this.options.scrollPaddingEnd) t = "end";
				else if (i.start <= r + this.options.scrollPaddingStart) t = "start";
				else return [r, t];
			}
			if (t === "end" && e === this.options.count - 1) {
				let e = this.getMaxScrollOffset(), n = e - this.options.paddingEnd + this.options.scrollPaddingEnd;
				return [Math.max(Math.min(n, e), 0), t];
			}
			let a = t === "end" ? i.end + this.options.scrollPaddingEnd : i.start - this.options.scrollPaddingStart;
			return [this.getOffsetForAlignment(a, t, i.size), t];
		}, this.scrollToOffset = (e, { align: t = "start", behavior: n = "auto" } = {}) => {
			this._startScroll({
				index: null,
				align: t
			}, this.getOffsetForAlignment(e, t), n, "absolute");
		}, this.scrollToIndex = (e, { align: t = "auto", behavior: n = "auto" } = {}) => {
			e = Math.max(0, Math.min(e, this.options.count - 1));
			let r = this.getOffsetForIndex(e, t);
			if (!r) return;
			let [i, a] = r;
			this._startScroll({
				index: e,
				align: a
			}, i, n, "absolute");
		}, this.scrollBy = (e, { behavior: t = "auto" } = {}) => {
			let n = this.getOffsetForAlignment((this.getCommandWrittenOffset() ?? this.getScrollOffset()) + e, "start");
			this._startScroll({
				index: null,
				align: "start"
			}, n, t, "relative");
		}, this.scrollToEnd = ({ behavior: e = "auto" } = {}) => {
			this.options.count > 0 ? this._startScroll({
				index: this.options.count - 1,
				align: "end",
				toEnd: !0
			}, Math.max(this.getMaxScrollOffset(), 0), e, "absolute") : this.scrollToOffset(Math.max(this.getTotalSize() - this.getSize(), 0), { behavior: e });
		}, this.cancelScroll = () => {
			this.rafId != null && this.targetWindow && (this.targetWindow.cancelAnimationFrame(this.rafId), this.rafId = null), this.scrollState = null;
		}, this.getTotalSize = () => Math.max(this._getLayoutTotalSize() - this._holdOffset, 0), this._getLayoutTotalSize = () => {
			let e = this.getMeasurements(), t;
			if (e.length === 0) t = this.options.paddingStart;
			else if (this.options.lanes === 1) {
				let n = e.length - 1, r = this._singleLaneMeasurements?.flat;
				t = r == null ? e[n]?.end ?? 0 : r[n * 2] + r[n * 2 + 1];
			} else {
				let n = Array(this.options.lanes).fill(null), r = e.length - 1;
				for (; r >= 0 && n.some((e) => e === null);) {
					let t = e[r];
					n[t.lane] === null && (n[t.lane] = t.end), r--;
				}
				t = Math.max(...n.filter((e) => e !== null));
			}
			return Math.max(t - this.options.scrollMargin + this.options.paddingEnd, 0);
		}, this.takeSnapshot = () => {
			let e = [];
			if (this.itemSizeCache.size === 0) return e;
			let t = this.getMeasurements();
			for (let n of t) n && this.itemSizeCache.has(n.key) && e.push({
				index: n.index,
				key: n.key,
				start: n.start,
				size: n.size,
				end: n.end,
				lane: n.lane
			});
			return e;
		}, this._scrollToOffset = (e, { adjustments: t, behavior: n } = {}) => {
			let r = {
				target: e + (t ?? 0),
				smooth: n === "smooth"
			};
			return this.pendingWrite = r, this.options.scrollToFn(e - this._holdOffset, {
				behavior: n,
				adjustments: t
			}, this), r;
		}, this.getCommandWrittenOffset = () => this.scrollState !== null && this.pendingWrite !== null && !this.pendingWrite.smooth ? this.pendingWrite.target : null, this._awaitingCommandReadBack = () => {
			let e = this.getCommandWrittenOffset();
			return !(qf() && this._iosGesture.dragging()) && e !== null && !Rf(e, this.getScrollOffset());
		}, this._followOffsetTarget = (e) => {
			this.scrollState !== null && this.scrollState.index == null && (this.scrollState.lastTargetOffset += e);
		}, this.measure = () => {
			this.pendingMin = null, this.itemSizeCache.clear(), this.laneAssignments.clear(), this.itemSizeCacheVersion++, this.notify(!1);
		}, this.setOptions(e);
	}
	get scrollAdjustments() {
		return 0;
	}
	applyScrollAdjustment(e, t) {
		if (e === 0) return !1;
		if (process.env.NODE_ENV !== "production" && this.options.debug && console.info("correction", e), this._followOffsetTarget(e), this._canWriteScroll()) {
			let n = this.getScrollOffset();
			this._clampedAdjustment = this._clampedBy(n + e);
			let r = this._scrollToOffset(n, {
				adjustments: e,
				behavior: t
			});
			return this.scrollOffset !== null && (this.pendingWrite === r && (this.scrollOffset += e), this.scrollOffset < 0 && (this.scrollOffset = 0)), !0;
		}
		return this._holdOffset += e, this.scrollOffset !== null && (this.scrollOffset += e), !0;
	}
	scheduleScrollReconcile() {
		this.targetWindow ? this.rafId ??= this.targetWindow.requestAnimationFrame(() => {
			this.rafId = null, this.reconcileScroll();
		}) : this.scrollState = null;
	}
	getScrollStateTarget(e) {
		let t = e.toEnd ? [Math.max(this.getMaxScrollOffset(), 0)] : e.index == null ? void 0 : this.getOffsetForIndex(e.index, e.align);
		return t ? t[0] : e.lastTargetOffset;
	}
	reconcileScroll() {
		if (!this.scrollState || !this.scrollElement) return;
		if (this.now() - this.scrollState.startedAt > 5e3) {
			this.scrollState = null;
			return;
		}
		if (this.scrollState.phase === "queued") {
			this.scheduleScrollReconcile();
			return;
		}
		this.getMeasurements();
		let e = this.getScrollStateTarget(this.scrollState), t = this.scrollState.index == null ? 1 : this.options.useAnimationFrameWithResizeObserver ? 3 : 2, n = e !== this.scrollState.lastTargetOffset;
		if (!n && Rf(e, this.getScrollOffset())) {
			if (this.scrollState.phase === "smooth" ? this.scrollState.phase = "smoothLanded" : this.scrollState.phase === "smoothFinishing" && (this.scrollState.phase = "instant"), this.scrollState.stableFrames++, this.scrollState.stableFrames >= t) {
				this.getScrollOffset() !== e && this._scrollToOffset(e, { behavior: "auto" }), this.scrollState = null;
				return;
			}
		} else if (this.scrollState.stableFrames = 0, n) {
			let t = this.getSize() || 600, n = Math.abs(e - this.getScrollOffset()), r = up(this.scrollState) && n > t;
			this.scrollState.lastTargetOffset = e, r ? this.scrollState.phase = "smooth" : this.scrollState.phase === "smooth" ? this.scrollState.phase = "smoothFinishing" : this.scrollState.phase === "smoothLanded" && (this.scrollState.phase = "instant"), this._scrollToOffset(e, { behavior: r ? "smooth" : "auto" });
		}
		this.scheduleScrollReconcile();
	}
	_startScroll(e, t, n, r) {
		this.pendingScrollAnchor = null, this._clampedAdjustment = null;
		let i = this._iosGesture.tail();
		if (r === "absolute" && i !== null) {
			if (i === "fling" && Yf()) {
				this._stopMomentum(() => {
					this.scrollState?.phase !== "queued" || this._iosGesture.tail() !== "fling" || this._reportedOverscroll || (this._iosGesture.end(), this._flushHoldIfReady(!0), this._writeAwaitingCommand());
				}), this.scrollState = {
					...e,
					startedAt: this.now(),
					lastTargetOffset: t,
					stableFrames: 0,
					phase: "queued",
					behavior: n,
					samples: []
				}, this.scheduleScrollReconcile();
				return;
			}
			this._iosGesture.end();
		}
		this.scrollState = {
			...e,
			startedAt: this.now(),
			lastTargetOffset: t,
			stableFrames: 0,
			behavior: n,
			phase: lp(n, e.index != null && Rf(t, this.getScrollOffset()))
		}, this._scrollToOffset(t, { behavior: n }), this.scheduleScrollReconcile();
	}
}, pp = (e, t, n, r) => {
	for (; e <= t;) {
		let i = (e + t) / 2 | 0, a = n(i);
		if (a < r) e = i + 1;
		else if (a > r) t = i - 1;
		else return i;
	}
	return e > 0 ? e - 1 : 0;
};
function mp(e, t, n) {
	let r = 0;
	for (; r <= t;) {
		let i = (r + t) / 2 | 0, a = e[i * 2];
		if (a < n) r = i + 1;
		else if (a > n) t = i - 1;
		else return i;
	}
	return r > 0 ? r - 1 : 0;
}
function hp(e, t, n, r, i) {
	let a = e.length - 1;
	if (e.length <= r) return {
		startIndex: 0,
		endIndex: a
	};
	if (r === 1 && i !== null) {
		let e = mp(i, a, n), r = e, o = n + t;
		for (; r < a && i[r * 2] + i[r * 2 + 1] < o;) r++;
		return {
			startIndex: e,
			endIndex: r
		};
	}
	let o = pp(0, a, (t) => e[t].start, n), s = o;
	if (r === 1) for (; s < a && e[s].end < n + t;) s++;
	else if (r > 1) {
		let i = Array(r).fill(0);
		for (; s < a && i.some((e) => e < n + t);) {
			let t = e[s];
			i[t.lane] = t.end, s++;
		}
		let c = Array(r).fill(n + t);
		for (; o >= 0 && c.some((e) => e >= n);) {
			let t = e[o];
			c[t.lane] = t.start, o--;
		}
		o = Math.max(0, o - o % r), s = Math.min(a, s + (r - 1 - s % r));
	}
	return {
		startIndex: o,
		endIndex: s
	};
}
// node_modules/@tanstack/react-virtual/dist/esm/index.js
var gp = typeof document < "u" ? e.useLayoutEffect : e.useEffect;
function _p({ useFlushSync: t = !0, directDomUpdates: n = !1, directDomUpdatesMode: r = "transform", ...i }) {
	let a = e.useReducer((e) => e + 1, 0)[1], o = e.useRef({
		enabled: n,
		mode: r,
		container: null,
		lastSize: null,
		lastPositions: /* @__PURE__ */ new WeakMap(),
		prevRange: null
	});
	o.current.enabled = n, o.current.mode = r;
	let s = e.useRef(!1), c = (e) => {
		let t = o.current;
		if (!t.enabled || !t.container) return;
		let n = e.getTotalSize();
		if (n !== t.lastSize) {
			t.lastSize = n;
			let r = e.options.horizontal ? "width" : "height";
			t.container.style[r] = `${n}px`;
		}
	}, l = (e, t, n) => {
		let r = o.current, i = !!e.options.horizontal, a = t.start - e.options.scrollMargin;
		r.lastPositions.get(n) !== a && (r.lastPositions.set(n, a), r.mode === "transform" ? n.style.transform = i ? `translate3d(${a}px, 0, 0)` : `translate3d(0, ${a}px, 0)` : n.style[i ? "left" : "top"] = `${a}px`);
	}, u = (e) => {
		let t = o.current;
		if (t.enabled && t.container) {
			c(e);
			for (let t of e.getVirtualItems()) {
				let n = e.elementsCache.get(t.key);
				n && l(e, t, n);
			}
		}
	}, d = {
		...i,
		onChange: (e, n) => {
			var r;
			let c = o.current, l = !0;
			if (c.enabled) {
				u(e);
				let t = e.range, n = c.prevRange;
				l = !n || n.isScrolling !== e.isScrolling || n.startIndex !== t?.startIndex || n.endIndex !== t?.endIndex, l && (c.prevRange = t ? {
					startIndex: t.startIndex,
					endIndex: t.endIndex,
					isScrolling: e.isScrolling
				} : null);
			}
			l && (t && n && !s.current ? g(a) : a()), (r = i.onChange) == null || r.call(i, e, n);
		}
	}, [f] = e.useState(() => {
		let e = new fp(d), t = e.measureElement;
		return e.measureElement = (n) => {
			s.current = !0;
			try {
				t(n);
			} finally {
				s.current = !1;
			}
			let r = o.current;
			if (n !== null && r.enabled && r.container) {
				let t = e.measurementsCache[e.indexFromElement(n)];
				t && l(e, t, n);
			}
		}, Object.assign(e, { containerRef: (t) => {
			let n = o.current;
			n.container = t, n.lastSize = null, t !== null && u(e);
		} });
	});
	return f.setOptions(d), gp(() => f._didMount(), []), gp(() => (c(f), f._willUpdate())), gp(() => {
		u(f);
	}), f;
}
function vp(e) {
	return _p({
		observeElementRect: np,
		observeElementOffset: op,
		scrollToFn: cp,
		...e
	});
}
// src/core/TreatmentEngine.ts
function yp(e, t) {
	return {
		display: "inline-block",
		width: t,
		height: t,
		maskImage: `url("${e}")`,
		maskSize: "contain",
		maskRepeat: "no-repeat",
		maskPosition: "center",
		WebkitMaskImage: `url("${e}")`,
		WebkitMaskSize: "contain",
		WebkitMaskRepeat: "no-repeat",
		WebkitMaskPosition: "center"
	};
}
function bp(e, t, n, r) {
	let i = yp(e, t);
	switch (r) {
		case "solid": return {
			...i,
			backgroundColor: n,
			filter: "drop-shadow(0 0 .6px currentColor) drop-shadow(0 0 .6px currentColor) drop-shadow(0 0 .6px currentColor)"
		};
		case "duotone": return {
			...i,
			backgroundColor: "var(--accent)",
			filter: "drop-shadow(1.5px 1.5px 0 var(--fg))"
		};
		case "midtone": return {
			...i,
			backgroundColor: n,
			opacity: .5
		};
		case "halftone": return {
			...i,
			backgroundColor: "transparent",
			backgroundImage: "radial-gradient(currentColor 42%, transparent 44%)",
			backgroundSize: "3px 3px",
			color: n
		};
		default: return {
			...i,
			backgroundColor: n
		};
	}
}
function xp(e) {
	switch (e) {
		case "midtone": return { opacity: .5 };
		case "duotone": return { filter: "drop-shadow(1.5px 1.5px 0 var(--fg))" };
		case "solid": return { filter: "drop-shadow(0 0 .4px currentColor) drop-shadow(0 0 .4px currentColor)" };
		default: return {};
	}
}
// src/hooks/useSvgParts.ts
function Sp(e) {
	let t = d(() => xd(e), [e]), [n, r] = p(null);
	return c(() => {
		if (!(t instanceof Promise)) return;
		let n = !0;
		return t.then((t) => {
			n && r({
				icon: e,
				parts: t
			});
		}), () => {
			n = !1;
		};
	}, [t, e]), t instanceof Promise ? n?.icon === e ? n.parts : null : t;
}
// src/components/ui/IconAsset.tsx
var Cp = 1.5;
function wp({ icon: e, size: t, color: n, stroke: r, inline: i }) {
	let a = G((e) => e.color), o = G((e) => e.treatment), s = G((e) => e.gridStroke), c = G((e) => e.theme === "dark" && e.adaptMonochrome), l = (n === void 0 ? a : n) ?? "currentColor", u = r ?? s, d = e.variant === "outline" && Math.abs(u - Cp) > .01;
	if (e.ownColor) {
		let n = e.svgContent || i ? /* @__PURE__ */ C(Ep, {
			icon: e,
			size: t
		}) : /* @__PURE__ */ C("span", {
			"aria-hidden": !0,
			style: {
				display: "inline-block",
				...da.toStyle(da.resolve(e, null), t)
			}
		});
		return c ? /* @__PURE__ */ C(Tp, {
			icon: e,
			size: t,
			color: l,
			fallback: n
		}) : n;
	}
	if (i || d) return /* @__PURE__ */ C(Dp, {
		icon: e,
		size: t,
		color: l,
		stroke: u
	});
	let f = da.resolve(e, l).url;
	return /* @__PURE__ */ C("span", {
		"aria-hidden": !0,
		style: bp(f, t, l, o)
	});
}
function Tp({ icon: e, size: t, color: n, fallback: r }) {
	let i = Sp(e);
	return i?.monoBody ? /* @__PURE__ */ C("svg", {
		"aria-hidden": !0,
		"data-ichava-mono": "",
		width: t,
		height: t,
		viewBox: i.viewBox,
		className: "inline-block",
		style: { color: n },
		dangerouslySetInnerHTML: { __html: i.monoBody }
	}) : /* @__PURE__ */ C(S, { children: r });
}
function Ep({ icon: e, size: t }) {
	let n = Sp(e);
	return n ? /* @__PURE__ */ C("svg", {
		"aria-hidden": !0,
		"data-ichava-illustration": e.kind === "illustration" ? "" : void 0,
		width: t,
		height: t,
		viewBox: n.viewBox,
		className: "inline-block",
		dangerouslySetInnerHTML: { __html: n.body }
	}) : /* @__PURE__ */ C("span", {
		"aria-hidden": !0,
		style: {
			display: "inline-block",
			width: t,
			height: t
		}
	});
}
function Dp({ icon: e, size: t, color: n, stroke: r }) {
	let i = G((e) => e.treatment), a = Sp(e);
	return a ? /* @__PURE__ */ C("svg", {
		"aria-hidden": !0,
		width: t,
		height: t,
		viewBox: a.viewBox,
		fill: "none",
		stroke: n,
		strokeWidth: r,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		style: {
			display: "inline-block",
			...xp(i)
		},
		dangerouslySetInnerHTML: { __html: a.body }
	}) : /* @__PURE__ */ C("span", {
		"aria-hidden": !0,
		style: {
			display: "inline-block",
			width: t,
			height: t
		}
	});
}
// src/modules/snippets/application/copyPayload.ts
async function Op(e, t, n, r) {
	if (!(r.snippets.needsSvg ? r.snippets.needsSvg(t, n) : t === "svg")) return r.snippets.build(t, e, n);
	let i = await Promise.resolve(r.svgParts(e)), a = r.snippets.svgFromParts(e, i, n);
	return t === "svg" ? a : r.snippets.build(t, e, n, a);
}
// src/modules/snippets/infrastructure/SnippetFactory.ts
var kp = [
	"svg",
	"motion",
	"helper",
	"blade",
	"bladeGeneric",
	"livewire",
	"alpine",
	"vue",
	"react",
	"svelte",
	"webcomponent",
	"api",
	"name"
], Ap = [
	{
		id: "svg",
		label: "SVG"
	},
	{
		id: "motion",
		label: "Motion"
	},
	{
		id: "helper",
		label: "Helper"
	},
	{
		id: "blade",
		label: "Blade"
	},
	{
		id: "bladeGeneric",
		label: "Blade (generic)"
	},
	{
		id: "livewire",
		label: "Livewire"
	},
	{
		id: "alpine",
		label: "Alpine"
	},
	{
		id: "vue",
		label: "Vue"
	},
	{
		id: "react",
		label: "React"
	},
	{
		id: "svelte",
		label: "Svelte"
	},
	{
		id: "webcomponent",
		label: "Web Component"
	},
	{
		id: "api",
		label: "API"
	},
	{
		id: "name",
		label: "Name"
	}
];
function jp(e) {
	return e.variant && e.variant !== "default" ? e.variant : e.category && e.category !== "general" ? e.category : "";
}
function Mp(e) {
	return [Gt(e), jp(e)].filter(Boolean).join(" · ");
}
var Np = class {
	#e = /* @__PURE__ */ new Map();
	register(e, t) {
		return this.#e.set(e, t), this;
	}
	supports(e, t) {
		return kp.includes(e) || !!t?.templates?.[e] || this.#e.has(e);
	}
	needsSvg(e, t) {
		let n = t?.templates?.[e];
		return n ? /\{\{\s*(svg|jsx)\s*\}\}/.test(n) : e === "svg" || e === "vue" || e === "react" || e === "svelte" || e === "webcomponent" || this.#e.has(e);
	}
	build(e, t, n, r) {
		let i = Vp(t, e);
		if (i) return i;
		let a = this.needsSvg(e, n.config) ? this.svg(t, n, r) : "", o = Rp(t, n, a), s = n.config?.templates?.[e];
		if (s) return zp(s, o);
		let c = this.#e.get(e);
		if (c) return c({
			icon: t,
			options: n,
			tokens: o
		});
		let l = o;
		switch (e) {
			case "name": return l.path;
			case "helper": return t.helper || `{{ ichava('${l.path}')->class('${l.class}') }}`;
			case "blade": return t.bladeClean || Hp(l);
			case "bladeGeneric": return t.bladeGeneric || `<x-ichava::icon name="${l.path}" class="${l.class}" />`;
			case "svg": return a;
			case "motion": return this.motion(t, n);
			case "livewire": return `{{-- Needs a public $icon property on the component. --}}\n<button type="button" wire:click="$set('icon', '${l.path}')">\n    <x-ichava::icon name="${l.path}" class="${l.class}" />\n</button>`;
			case "alpine": return `<div x-data="{ shown: true }">
    <button type="button" x-on:click="shown = !shown">Toggle</button>
    <x-ichava::icon name="${l.path}" class="${l.class}" x-show="shown" x-transition />\n</div>`;
			case "vue": return `<!-- ${l.componentName}.vue -->\n<template>\n${qp(a, "  ")}\n</template>`;
			case "react": return `import type { SVGProps } from 'react';\n\nexport function ${l.componentName}(props: SVGProps<SVGSVGElement>) {\n  return (\n${qp(l.jsx, "    ")}\n  );\n}`;
			case "svelte": return `<!-- ${l.componentName}.svelte -->\n<script>\n  let props = $props();\n<\/script>\n\n${Jp(a, "{...props}")}`;
			case "webcomponent": return `<script type="module">\n  if (!customElements.get('${l.tag}')) {\n    customElements.define('${l.tag}', class extends HTMLElement {\n      connectedCallback() {\n        this.innerHTML = \`${Yp(a)}\`;\n      }\n    });\n  }\n<\/script>\n\n<${l.tag}></${l.tag}>`;
			case "api": return l.apiUrl;
			default: return l.path;
		}
	}
	motion(e, t) {
		let n = t.motion;
		if (!n || n.id === "none") return "// Pick a motion preset to export its definition.\n// Play with ichava-motion.js — IchavaMotion.fromJSON(el, def).";
		let r = n.iterations === Infinity || n.iterations == null ? "infinite" : n.iterations, i = `${n.speed.toFixed(n.speed < 1 ? 2 : +(n.speed < 10))}×`, a = {
			keyframes: n.keyframes,
			duration: Math.max(80, Math.round(n.base / Math.max(.1, n.speed))),
			easing: n.easing,
			direction: n.direction ?? "normal",
			iterations: r
		};
		return `// Ichava Motion — "${n.id}" · ${n.easingLabel ?? n.easing} · ${i}\n// Play with ichava-motion.js\n//   IchavaMotion.fromJSON(el, def, { trigger: 'loop' })\nconst def = ${JSON.stringify(a, null, 2)};`;
	}
	svg(e, t, n) {
		let r = t.color ?? "currentColor", i = t.strokeWidth ?? 1.5, a = n ? Zu(n).trim() : "";
		if (a) {
			let n = Ip(a, t.size);
			return e.ownColor || (n = n.replace(/stroke-width="[^"]*"/g, `stroke-width="${i}"`).replace(/(stroke|fill)="(?!none)[^"]*"/g, (e, t) => `${t}="${r}"`)), n;
		}
		return `<svg width="${t.size}" height="${t.size}" viewBox="${e.viewBox}" fill="none"\n     stroke="${r}" stroke-width="${i}" stroke-linecap="round" stroke-linejoin="round">\n  <!-- ${Lp(e)} -->\n</svg>`;
	}
	svgFromParts(e, t, n) {
		let r = n.size, i = t.viewBox || e.viewBox;
		return t.body ? e.ownColor ? `<svg xmlns="http://www.w3.org/2000/svg" width="${r}" height="${r}" viewBox="${i}">\n  ${t.body}\n</svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="${r}" height="${r}" viewBox="${i}" fill="none" stroke="${n.color ?? "currentColor"}" stroke-width="${n.strokeWidth ?? 1.5}" stroke-linecap="round" stroke-linejoin="round">\n  ${t.body}\n</svg>` : this.svg(e, n);
	}
}, Pp = new Np(), Fp = "http://www.w3.org/2000/svg";
function Ip(e, t) {
	return e.replace(/^<svg\b([^>]*)>/, (e, n) => {
		let r = n.replace(/\s(?:width|height)="[^"]*"/g, "");
		return /\sxmlns="/.test(r) || (r = ` xmlns="${Fp}"${r}`), `<svg${r} width="${t}" height="${t}">`;
	});
}
function Lp(e) {
	if (e.path) return e.path;
	let t = jp(e);
	return `${e.package}::${t ? `${t}/` : ""}${e.name}`;
}
function Rp(e, t, n = "") {
	let r = Lp(e), i = r.includes("::") ? r.slice(r.indexOf("::") + 2) : r, a = i.lastIndexOf("/"), o = a > 0 ? i.slice(0, a) : "", s = a >= 0 ? i.slice(a + 1) : i, c = Gt(e), l = e.package.includes("/") ? e.package.slice(e.package.indexOf("/") + 1) : e.package, u = Wp(`${c} ${s}`);
	return {
		path: r,
		relative: i,
		dir: o,
		leaf: s,
		name: e.name,
		package: e.package,
		pack: c,
		id: String(e.id),
		category: e.category ?? "",
		variant: e.variant ?? "",
		size: String(t.size),
		unit: t.unit,
		color: t.color ?? "currentColor",
		stroke: String(t.strokeWidth ?? 1.5),
		class: t.config?.className || "w-6 h-6",
		component: e.package.startsWith("ichava/") ? `${l.toLowerCase()}-icon` : "",
		componentName: /^[A-Za-z]/.test(u) ? u : `Icon${u}`,
		tag: Kp(c, s),
		svgUrl: e.svgUrl ?? "",
		apiUrl: Up(e, t),
		svg: n,
		jsx: n ? Qp(n) : ""
	};
}
function zp(e, t) {
	return e.replace(/\{\{\s*([A-Za-z]+)\s*\}\}/g, (e, n) => n in t ? t[n] : e);
}
function Bp(e, t = Pp) {
	let n = e?.tabs?.length ? e.tabs : Ap.map((e) => e.id), r = /* @__PURE__ */ new Set();
	return n.filter((n) => !r.has(n) && r.add(n) && t.supports(n, e)).map((t) => {
		let n = Ap.find((e) => e.id === t);
		return {
			id: t,
			label: e?.labels?.[t] || n?.label || Gp(t),
			builtin: !!n && !e?.labels?.[t]
		};
	});
}
function Vp(e, t) {
	let n = e.snippets;
	return n && (n[t] || n[t.replace(/[A-Z]/g, (e) => `_${e.toLowerCase()}`)]) || "";
}
function Hp(e) {
	if (!e.component) return `<x-ichava::icon name="${e.path}" class="${e.class}" />`;
	let t = e.dir ? ` category="${e.dir}"` : "";
	return `<x-${e.component} name="${e.leaf}"${t} class="${e.class}" />`;
}
function Up(e, t) {
	let n = (t.baseUrl || t.config?.apiOrigin || globalThis.location?.origin || "").replace(/\/$/, ""), r = e.svgUrl || `/ichava/api/icons/${e.id}/svg`;
	return /^https?:\/\//.test(r) || !n ? r : `${n}${r.startsWith("/") ? "" : "/"}${r}`;
}
function Wp(e) {
	return e.split(/[^A-Za-z0-9]+/).filter(Boolean).map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join("");
}
function Gp(e) {
	let t = e.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").trim();
	return t.charAt(0).toUpperCase() + t.slice(1);
}
function Kp(e, t) {
	return `ichava-${`${e}-${t}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "icon"}`;
}
function qp(e, t) {
	return e.split("\n").map((e) => e && t + e).join("\n");
}
function Jp(e, t) {
	return e.replace(/^<svg\b([^>]*?)(\s*\/?)>/, (e, n, r) => `<svg${n} ${t}${r}>`);
}
function Yp(e) {
	return e.replace(/[`\\]/g, "\\$&").replace(/\$\{/g, "\\${");
}
var Xp = /^(data|aria)-/, Zp = {
	class: "className",
	"xlink:href": "xlinkHref",
	"xmlns:xlink": "xmlnsXlink",
	"xml:space": "xmlSpace",
	"xml:lang": "xmlLang"
};
function Qp(e) {
	let t = new DOMParser().parseFromString(e, "text/html").body.querySelector("svg");
	return t ? $p(t, "", !0) : Jp(e, "{...props}");
}
function $p(e, t, n = !1) {
	let r = [];
	for (let t of Array.from(e.attributes)) {
		if (t.name === "xmlns" && !n) continue;
		if (t.name === "style") {
			r.push(`style={${em(t.value)}}`);
			continue;
		}
		let e = Zp[t.name] ?? (Xp.test(t.name) ? t.name : t.name.replace(/[-:]([a-z])/g, (e, t) => t.toUpperCase()));
		r.push(`${e}=${JSON.stringify(t.value)}`);
	}
	n && r.push("{...props}");
	let i = `${t}<${e.tagName}${r.length ? ` ${r.join(" ")}` : ""}`, a = [];
	for (let n of Array.from(e.childNodes)) if (n.nodeType === 1) a.push($p(n, `${t}  `));
	else if (n.nodeType === 3 || n.nodeType === 4) {
		let e = (n.textContent ?? "").trim();
		e && a.push(`${t}  {${JSON.stringify(e)}}`);
	}
	return a.length ? `${i}>\n${a.join("\n")}\n${t}</${e.tagName}>` : `${i} />`;
}
function em(e) {
	return `{ ${e.split(";").map((e) => e.trim()).filter((e) => e.includes(":")).map((e) => {
		let t = e.indexOf(":"), n = e.slice(0, t).trim();
		return `${n.startsWith("--") ? JSON.stringify(n) : n.replace(/-([a-z])/g, (e, t) => t.toUpperCase())}: ${JSON.stringify(e.slice(t + 1).trim())}`;
	}).join(", ")} }`;
}
// src/modules/snippets/index.ts
function tm(e, t, n) {
	return Op(e, t, n, {
		snippets: {
			build: (e, t, n, r) => Pp.build(e, t, n, r),
			svgFromParts: (e, t, n) => Pp.svgFromParts(e, t, n),
			needsSvg: (e, t) => Pp.needsSvg(e, t.config)
		},
		svgParts: xd
	});
}
// src/components/browser/IconTile.tsx
var nm = {
	width: 22,
	height: 22,
	border: "1px solid var(--border)",
	borderRadius: 6,
	backgroundColor: "var(--pop)",
	boxShadow: "var(--shadow)",
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "var(--fg)"
};
function rm({ icon: e, size: t, gridIndex: n, colIndex: r, tabIndex: i = 0, onCellFocus: a }) {
	let [o, s] = p(!1), [c, l] = p(!1), u = o || c, d = G((e) => e.showLabels), f = G((e) => e.copyFormat), m = G((e) => e.config?.snippets), h = G((e) => e.sizeUnit), g = G((e) => e.gridStroke), _ = G((e) => e.color), v = G((e) => e.favorites), y = G((e) => e.selection), b = G((e) => e.openDetail), x = G((e) => e.toggleFavorite), T = G((e) => e.toggleSelect), E = G((e) => e.config?.features.multiSelect !== !1), D = G((e) => e.pushHistory), O = G((e) => e.collections), ee = G((e) => e.addToCollection), te = G((e) => e.removeFromCollection), k = G((e) => e.openLibrary), A = G((e) => e.showToast), j = G((e) => e.openCtx), M = dl(), N = q(), P = v.includes(e.id), F = y.includes(e.id), I = n !== void 0, ne = jp(e), re = ne ? `${Kt(e)} · ${ne}` : Kt(e), L = t, R = (n) => {
		M(tm(e, f, {
			size: t,
			unit: h,
			color: _,
			strokeWidth: g,
			config: m
		}), n), D(e.id, "copied");
	}, z = () => [
		...O.map((t) => {
			let n = t.icons.includes(e.id);
			return {
				label: t.name,
				icon: n ? "check" : "folder",
				run: () => {
					n ? te(t.id, e.id) : ee(t.id, e.id), A(N(n ? "detail.removedFrom" : "detail.addedTo", { name: t.name }), "folder");
				}
			};
		}),
		{
			label: "",
			divider: !0
		},
		{
			label: N("detail.newCollection").replace(/^\+\s*/, ""),
			icon: "plus",
			run: () => k("collections")
		}
	], ie = (e) => {
		e.stopPropagation();
		let t = e.currentTarget.getBoundingClientRect();
		j(t.left, t.bottom + 4, z(), N("detail.addToCollection"));
	}, B = (t) => {
		t.stopPropagation(), R(`Copied ${f} · ${e.name}`);
	}, ae = (t, n) => j(t, n, [
		{
			label: N("tile.openDetail"),
			icon: "eye",
			run: () => {
				b(e.id), D(e.id, "viewed");
			}
		},
		{
			label: N("tile.copyFormat", { format: f }),
			icon: "copy",
			run: () => R(N("list.copiedToast", { name: e.name }))
		},
		{
			label: N("tile.copyName"),
			icon: "text",
			run: () => M(Kt(e), N("tile.copiedName"))
		},
		{
			label: N("tile.copyPermalink"),
			icon: "link",
			run: () => M(`${location.origin}${location.pathname}?icon=${e.id}`, N("tile.permalinkCopied"))
		},
		{
			label: "",
			divider: !0
		},
		...E ? [{
			label: N(F ? "tile.deselect" : "tile.select"),
			icon: "check",
			run: () => T(e.id)
		}] : [],
		{
			label: N(P ? "tile.removeFavorite" : "tile.addFavorite"),
			icon: P ? "heart-filled" : "heart",
			danger: P,
			run: () => x(e.id)
		},
		{
			label: "",
			divider: !0
		},
		...z()
	], Kt(e));
	return /* @__PURE__ */ w("div", {
		role: I ? "gridcell" : "button",
		tabIndex: i,
		"data-grid-index": n,
		"data-icon-id": e.id,
		"data-ich-tile": "",
		"aria-colindex": r,
		"aria-label": `${e.name} — ${re}${P ? `, ${N("tile.favoritedAria")}` : ""}${F && !I ? `, ${N("tile.selectedAria")}` : ""}`,
		"aria-pressed": I ? void 0 : F,
		"aria-selected": I && E ? F : void 0,
		onMouseEnter: () => s(!0),
		onMouseLeave: () => s(!1),
		onFocus: (e) => {
			l(!0), I && e.target === e.currentTarget && a?.(n);
		},
		onBlur: (e) => {
			e.currentTarget.contains(e.relatedTarget) || l(!1);
		},
		onKeyDown: (t) => {
			switch (t.key) {
				case "Enter":
				case " ":
					t.preventDefault(), b(e.id), D(e.id, "viewed");
					break;
				case "f":
				case "F":
					t.preventDefault(), x(e.id);
					break;
				case "c":
				case "C":
					t.preventDefault(), B(t);
					break;
				case "x":
				case "X":
					t.preventDefault(), E && T(e.id);
					break;
				case "ContextMenu":
					t.preventDefault();
					{
						let e = t.currentTarget.getBoundingClientRect();
						ae(e.left + e.width / 2, e.top + e.height / 2);
					}
					break;
				default: if (t.shiftKey && t.key === "F10") {
					t.preventDefault();
					let e = t.currentTarget.getBoundingClientRect();
					ae(e.left + e.width / 2, e.top + e.height / 2);
				}
			}
		},
		onClick: () => {
			b(e.id), D(e.id, "viewed");
		},
		onContextMenu: (e) => {
			e.preventDefault(), ae(e.clientX, e.clientY);
		},
		style: {
			position: "relative",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			gap: 6,
			aspectRatio: "1 / 1",
			minWidth: 86,
			overflow: "hidden",
			borderRadius: "var(--radius)",
			border: `1px solid ${F || u ? "var(--accent)" : "var(--border)"}`,
			background: F ? "var(--accent-soft)" : "var(--surface)",
			boxShadow: F || u ? "0 0 0 3px var(--accent-soft), 0 6px 16px -10px var(--accent)" : "none",
			transform: `translateY(${u ? -1 : 0}px) scale(var(--ich-press, 1))`,
			transition: "border-color .15s ease, box-shadow .18s ease, background-color .15s ease, transform .15s ease",
			cursor: "pointer",
			userSelect: "none",
			contentVisibility: "auto"
		},
		children: [
			u && /* @__PURE__ */ w(S, { children: [E && /* @__PURE__ */ C(Ts, {
				content: N(F ? "tile.deselect" : "tile.select"),
				shortcut: "X",
				side: "top",
				children: /* @__PURE__ */ C("button", {
					onClick: (t) => {
						t.stopPropagation(), T(e.id);
					},
					tabIndex: I ? -1 : void 0,
					"aria-label": N(F ? "tile.deselect" : "tile.select"),
					style: {
						position: "absolute",
						top: 4,
						insetInlineStart: 4,
						width: 16,
						height: 16,
						borderRadius: 4,
						border: `1px solid ${F ? "var(--accent)" : "var(--border)"}`,
						background: F ? "var(--accent)" : "var(--pop)",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 3
					},
					children: F && /* @__PURE__ */ C(K, {
						name: "check",
						size: 9,
						color: "var(--accent-fg)"
					})
				})
			}), /* @__PURE__ */ w("div", {
				className: "absolute inset-x-0 bottom-[3px] flex justify-center gap-[3px] z-3",
				children: [
					/* @__PURE__ */ C(Ts, {
						content: N("tile.copyFormat", { format: f }),
						shortcut: "C",
						side: "bottom",
						children: /* @__PURE__ */ C("button", {
							onClick: B,
							tabIndex: I ? -1 : void 0,
							"aria-label": N("common.copy"),
							style: nm,
							children: /* @__PURE__ */ C(K, {
								name: "copy",
								size: 12.5,
								color: "currentColor"
							})
						})
					}),
					/* @__PURE__ */ C(Ts, {
						content: N(P ? "tile.removeFavorite" : "tile.addFavorite"),
						shortcut: "F",
						side: "bottom",
						children: /* @__PURE__ */ C("button", {
							onClick: (t) => {
								t.stopPropagation(), x(e.id);
							},
							tabIndex: I ? -1 : void 0,
							"aria-label": N(P ? "tile.removeFavorite" : "tile.addFavorite"),
							"aria-pressed": P,
							style: nm,
							children: /* @__PURE__ */ C(K, {
								name: P ? "heart-filled" : "heart",
								size: 12.5,
								color: P ? "var(--accent)" : "currentColor"
							})
						})
					}),
					/* @__PURE__ */ C(Ts, {
						content: N("detail.addToCollection"),
						side: "bottom",
						children: /* @__PURE__ */ C("button", {
							onClick: ie,
							tabIndex: I ? -1 : void 0,
							"aria-label": N("detail.addToCollection"),
							"aria-haspopup": "menu",
							style: nm,
							children: /* @__PURE__ */ C(K, {
								name: "folder",
								size: 12.5,
								color: "currentColor"
							})
						})
					})
				]
			})] }),
			P && !u && /* @__PURE__ */ C(K, {
				name: "heart-filled",
				size: 13,
				color: "var(--accent-text)",
				style: {
					position: "absolute",
					top: 6,
					insetInlineEnd: 6,
					zIndex: 2
				}
			}),
			/* @__PURE__ */ C(wp, {
				icon: e,
				size: L
			}),
			d && /* @__PURE__ */ C("span", {
				className: `max-w-[90%] text-[10px] text-[var(--muted-fg)] whitespace-nowrap overflow-hidden text-ellipsis${u ? " invisible" : ""}`,
				children: e.name
			})
		]
	});
}
// src/core/gridNav.ts
function im(e, t, n, r, i = {}) {
	if (r <= 0) return null;
	let a = Math.max(1, Math.floor(n)), o = Math.max(1, Math.floor(i.pageRows ?? 3)) * a, s = i.rtl ? "ArrowLeft" : "ArrowRight", c = i.rtl ? "ArrowRight" : "ArrowLeft", l;
	switch (e) {
		case s:
			l = t + 1;
			break;
		case c:
			l = t - 1;
			break;
		case "ArrowDown":
			l = t + a;
			break;
		case "ArrowUp":
			l = t - a;
			break;
		case "PageDown":
			l = Math.min(r - 1, t + o);
			break;
		case "PageUp":
			l = Math.max(0, t - o);
			break;
		case "Home":
			l = 0;
			break;
		case "End":
			l = r - 1;
			break;
		default: return null;
	}
	return l < 0 || l >= r || l === t ? null : l;
}
function am(e, t, n) {
	return e > 0 ? Math.max(1, Math.floor((e + n) / (t + n))) : 1;
}
function om({ items: e, size: t, scrollRef: n, label: r }) {
	let i = G((e) => e.density), { gap: a } = Tc(i), o = Ec(t, i), [s, l] = p(0), d = f(null), m = f(null), h = f(null), [g, _] = p(0);
	u(() => {
		let e = d.current;
		if (!e || (l(e.clientWidth), typeof ResizeObserver > "u")) return;
		let t = new ResizeObserver(() => l(e.clientWidth));
		return t.observe(e), () => t.disconnect();
	}, []);
	let v = am(s, o, a), y = Math.ceil(e.length / v), b = Math.min(g, Math.max(0, e.length - 1)), x = e.length > 120, S = (e) => {
		_(e);
		let t = d.current?.querySelector(`[data-grid-index="${e}"]`);
		t ? t.focus() : (m.current = e, h.current?.(Math.floor(e / v)));
	};
	c(() => {
		let e = m.current;
		if (e == null) return;
		let t = d.current?.querySelector(`[data-grid-index="${e}"]`);
		t && (m.current = null, t.focus());
	});
	let w = (t) => {
		let r = t.target.getAttribute("data-grid-index");
		if (r == null) return;
		let i = getComputedStyle(t.currentTarget).direction === "rtl", o = n.current?.clientHeight ?? 0, c = s > 0 ? (s - (v - 1) * a) / v + a : 0, l = c > 0 && o > 0 ? Math.max(1, Math.floor(o / c)) : 3, u = im(t.key, Number(r), v, e.length, {
			rtl: i,
			pageRows: l
		});
		u != null && (t.preventDefault(), S(u));
	}, T = (n, r) => {
		let i = n * v;
		return /* @__PURE__ */ C("div", {
			role: "row",
			"aria-rowindex": n + 1,
			style: {
				display: "grid",
				gridTemplateColumns: `repeat(${v}, minmax(0, 1fr))`,
				gap: a,
				...r
			},
			children: e.slice(i, i + v).map((e, n) => {
				let r = i + n;
				return /* @__PURE__ */ C(rm, {
					icon: e,
					size: t,
					gridIndex: r,
					colIndex: n + 1,
					tabIndex: r === b ? 0 : -1,
					onCellFocus: _
				}, e.id);
			})
		}, n);
	};
	return /* @__PURE__ */ C("div", {
		ref: d,
		role: "grid",
		"aria-label": r,
		"aria-rowcount": y,
		"aria-colcount": v,
		onKeyDown: w,
		style: x ? {
			width: "100%",
			gap: a
		} : {
			display: "flex",
			flexDirection: "column",
			gap: a,
			width: "100%"
		},
		children: x ? /* @__PURE__ */ C(sm, {
			rowCount: y,
			rowHeight: (s > 0 ? (s - (v - 1) * a) / v : o) + a,
			gap: a,
			scrollRef: n,
			ready: s > 0,
			activeRow: Math.floor(b / v),
			scrollToRowRef: h,
			renderRow: T
		}) : Array.from({ length: y }, (e, t) => T(t))
	});
}
function sm({ rowCount: e, rowHeight: t, gap: n, scrollRef: r, ready: i, activeRow: a, scrollToRowRef: o, renderRow: s }) {
	let l = vp({
		count: e,
		getScrollElement: () => r.current,
		estimateSize: () => t,
		overscan: 4,
		rangeExtractor: (e) => {
			let t = [];
			for (let n = Math.max(0, e.startIndex - e.overscan); n <= Math.min(e.count - 1, e.endIndex + e.overscan); n++) t.push(n);
			return a < e.count && !t.includes(a) && t.push(a), t.sort((e, t) => e - t);
		}
	});
	return c(() => l.measure(), [t, l]), c(() => (o.current = (e) => l.scrollToIndex(e, { align: "auto" }), () => {
		o.current = null;
	}), [l, o]), /* @__PURE__ */ C("div", {
		role: "presentation",
		style: {
			position: "relative",
			height: l.getTotalSize(),
			width: "100%"
		},
		children: i && l.getVirtualItems().map((e) => s(e.index, {
			position: "absolute",
			top: 0,
			left: 0,
			width: "100%",
			transform: `translateY(${e.start}px)`,
			paddingBottom: n
		}))
	});
}
// src/components/browser/IconSkeleton.tsx
function cm({ view: e, count: t }) {
	let n = q(), r = G((e) => e.density), i = G((e) => e.size), { gap: a, rowH: o } = Tc(r);
	return /* @__PURE__ */ w("div", {
		role: "status",
		"aria-busy": "true",
		"aria-live": "polite",
		"data-ichava-skeleton": e,
		children: [/* @__PURE__ */ C("span", {
			className: "sr-only",
			children: n("boot.loadingCatalog")
		}), e === "grid" ? /* @__PURE__ */ C("div", {
			"aria-hidden": "true",
			style: {
				display: "grid",
				gridTemplateColumns: `repeat(auto-fill, minmax(${Ec(i, r)}px, 1fr))`,
				gap: a
			},
			children: Array.from({ length: t ?? 24 }).map((e, t) => /* @__PURE__ */ C("div", {
				className: "flex items-center justify-center aspect-square overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]",
				children: /* @__PURE__ */ C("span", {
					className: "ich-skeleton rounded-[calc(var(--radius)_-_2px)]",
					style: {
						width: Math.min(i, 48),
						height: Math.min(i, 48)
					}
				})
			}, t))
		}) : /* @__PURE__ */ C("div", {
			"aria-hidden": "true",
			className: "flex flex-col border border-[var(--border)] rounded-[var(--radius)] overflow-hidden",
			children: Array.from({ length: t ?? 12 }).map((e, t) => /* @__PURE__ */ w("div", {
				className: "flex items-center gap-[10px] px-3 border-b border-[var(--border)] last:border-b-0",
				style: { height: o },
				children: [
					/* @__PURE__ */ C("span", { className: "ich-skeleton w-[18px] h-[18px] rounded-[4px]" }),
					/* @__PURE__ */ C("span", {
						className: "ich-skeleton h-[10px] rounded-full",
						style: { width: 80 + t * 37 % 90 }
					}),
					/* @__PURE__ */ C("span", {
						className: "flex-1 min-w-0",
						children: /* @__PURE__ */ C("span", {
							className: "ich-skeleton block h-[9px] rounded-full",
							style: { width: `${30 + t * 23 % 35}%` }
						})
					}),
					/* @__PURE__ */ C("span", { className: "ich-skeleton w-[46px] h-[22px] rounded-[5px]" })
				]
			}, t))
		})]
	});
}
// src/components/layout/AppContent.tsx
function lm({ loading: e }) {
	let { page: t } = Pc(), n = G((e) => e.view), r = G((e) => e.filters), i = G((e) => e.size), a = G((e) => e.resetFilters), o = G((e) => e.selectAllPacks), s = G((e) => e.catalog), c = f(null), l = r.packages.length === 0, u = !e && !l && t.total === 0;
	return /* @__PURE__ */ C("div", {
		ref: c,
		className: "flex-1 overflow-y-auto p-3 [scrollbar-gutter:stable] bg-[var(--canvas)]",
		children: e ? /* @__PURE__ */ C(cm, { view: n === "list" ? "list" : "grid" }) : l ? /* @__PURE__ */ C(dm, { onSelectAll: () => o((s?.packages ?? []).filter((e) => e.installed).map((e) => e.id)) }) : u ? /* @__PURE__ */ C(fm, {
			search: r.search,
			onReset: a
		}) : n === "grid" ? /* @__PURE__ */ C(om, {
			items: t.items,
			size: i,
			scrollRef: c,
			label: `${t.total} icons`
		}) : /* @__PURE__ */ C(pm, {})
	});
}
function um() {
	return {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		animation: "ichFade .25s ease"
	};
}
function dm({ onSelectAll: e }) {
	let t = q();
	return /* @__PURE__ */ w("div", {
		style: um(),
		children: [
			/* @__PURE__ */ C("div", {
				className: "w-10 h-10 rounded-[10px] bg-[var(--muted)] flex items-center justify-center",
				children: /* @__PURE__ */ C(K, {
					name: "package",
					size: 20,
					color: "var(--muted-fg)"
				})
			}),
			/* @__PURE__ */ C("div", {
				className: "text-[14px] font-[600]",
				children: t("empty.onboardTitle")
			}),
			/* @__PURE__ */ C("div", {
				className: "text-[12.5px] text-[var(--muted-fg)]",
				children: t("empty.onboardDesc")
			}),
			/* @__PURE__ */ C(Q, {
				size: "sm",
				onClick: e,
				className: "mt-1",
				children: t("empty.selectAllPackages")
			})
		]
	});
}
function fm({ search: e, onReset: t }) {
	let n = q();
	return /* @__PURE__ */ C("div", {
		style: um(),
		children: /* @__PURE__ */ C(fc, {
			size: "md",
			icon: "search",
			title: e ? n("empty.noMatchSearch", { q: e }) : n("empty.noMatchFilters"),
			description: n("empty.tryDifferent"),
			action: /* @__PURE__ */ C(Q, {
				color: "secondary",
				size: "sm",
				onClick: t,
				children: n("empty.clearFilters")
			})
		})
	});
}
function pm() {
	let { page: e } = Pc(), t = G((e) => e.openDetail), n = G((e) => e.toggleFavorite), r = G((e) => e.favorites), i = G((e) => e.copyFormat), a = G((e) => e.config?.snippets), o = G((e) => e.size), s = G((e) => e.sizeUnit), l = G((e) => e.color), { rowH: u } = Tc(G((e) => e.density)), d = dl(), f = q(), [m, h] = p(null);
	return c(() => {
		if (m === null) return;
		let e = setTimeout(() => h(null), 1400);
		return () => clearTimeout(e);
	}, [m]), /* @__PURE__ */ C("div", {
		className: "flex flex-col border border-[var(--border)] rounded-[var(--radius)] overflow-hidden",
		children: e.items.map((e) => {
			let c = r.includes(e.id);
			return /* @__PURE__ */ w("div", {
				role: "button",
				tabIndex: 0,
				"aria-label": e.name,
				onClick: () => t(e.id),
				onKeyDown: (n) => {
					(n.key === "Enter" || n.key === " ") && (n.preventDefault(), t(e.id));
				},
				"data-ich-row": "",
				className: "transition-colors hover:bg-[var(--muted)]",
				style: {
					display: "flex",
					alignItems: "center",
					gap: 10,
					height: u,
					padding: "0 12px",
					borderBottom: "1px solid var(--border)",
					cursor: "pointer"
				},
				children: [
					/* @__PURE__ */ C(wp, {
						icon: e,
						size: 18
					}),
					/* @__PURE__ */ C("span", {
						className: "text-[12.5px] font-medium min-w-[100px] max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis",
						children: e.name
					}),
					/* @__PURE__ */ C("span", {
						className: "font-[family-name:'Geist_Mono',monospace] text-[11px] text-[var(--muted-fg)] flex-1 whitespace-nowrap overflow-hidden text-ellipsis",
						children: e.id
					}),
					/* @__PURE__ */ C("button", {
						onClick: (t) => {
							t.stopPropagation(), h(e.id), d(tm(e, i, {
								size: o,
								unit: s,
								color: l,
								config: a
							}), f("list.copiedToast", { name: e.name }));
						},
						className: "h-[22px] py-0 px-2 border border-[var(--border)] rounded-[5px] bg-[var(--bg)] text-[11px] cursor-pointer text-[var(--fg)] transition-colors hover:border-[var(--muted-fg)] hover:bg-[var(--muted)]",
						children: m === e.id ? /* @__PURE__ */ w("span", {
							className: "inline-flex items-center gap-1 text-[var(--accent-text)] [animation:ichIn_.14s_ease]",
							children: [/* @__PURE__ */ C(K, {
								name: "check",
								size: 11,
								color: "currentColor"
							}), f("console.copied")]
						}) : f("common.copy")
					}),
					/* @__PURE__ */ C(Ts, {
						content: f(c ? "tile.removeFavorite" : "tile.addFavorite"),
						children: /* @__PURE__ */ C("button", {
							onClick: (t) => {
								t.stopPropagation(), n(e.id);
							},
							"aria-label": f(c ? "tile.removeFavorite" : "tile.addFavorite"),
							"aria-pressed": c,
							className: "w-[26px] h-[26px] border-0 bg-transparent rounded-[5px] cursor-pointer flex items-center justify-center transition-colors hover:bg-[var(--muted)]",
							children: /* @__PURE__ */ C(K, {
								name: c ? "heart-filled" : "heart",
								size: 14,
								color: c ? "var(--accent)" : "var(--faint-fg)"
							})
						})
					}),
					/* @__PURE__ */ C(K, {
						name: "chevron-right",
						size: 12,
						color: "var(--faint-fg)"
					})
				]
			}, e.id);
		})
	});
}
// src/components/layout/AppFooter.tsx
var mm = [
	30,
	60,
	120,
	240
];
function hm() {
	let { page: e } = Pc(), t = q(), n = G((e) => e.filters.perPage), r = G((e) => e.setPerPage), i = G((e) => e.nextPage), a = G((e) => e.prevPage), o = G((e) => e.config?.ui.perPageOptions) ?? mm;
	return /* @__PURE__ */ w("div", {
		style: {
			height: Dc(38),
			flex: "none",
			display: "flex",
			alignItems: "center",
			gap: 10,
			padding: "0 12px",
			borderTop: "1px solid var(--border)",
			userSelect: "none"
		},
		children: [
			/* @__PURE__ */ C("span", {
				className: "text-[11.5px] text-[var(--muted-fg)]",
				children: e.total === 0 ? t("footer.noResults") : t("footer.range", {
					start: gc(e.rangeStart),
					end: gc(e.rangeEnd),
					total: gc(e.total)
				})
			}),
			/* @__PURE__ */ C("span", { className: "flex-1" }),
			/* @__PURE__ */ C(Cs, {
				size: "sm",
				"aria-label": t("footer.perPageLabel"),
				items: o.map((e) => ({
					id: e,
					label: t("footer.perPage", { n: e })
				})),
				selectedKey: n,
				onSelectionChange: (e) => r(Number(e)),
				className: "w-28 flex-none",
				children: (e) => /* @__PURE__ */ C(Cs.Item, { ...e })
			}),
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-0.5",
				children: [
					/* @__PURE__ */ C(Ts, {
						content: t("footer.prevPage"),
						side: "top",
						children: /* @__PURE__ */ C("button", {
							onClick: a,
							"aria-label": t("footer.prevPage"),
							disabled: e.page <= 1,
							style: {
								...gm,
								opacity: e.page <= 1 ? .45 : 1
							},
							children: /* @__PURE__ */ C(K, {
								name: "chevron-left",
								size: 11,
								color: "currentColor"
							})
						})
					}),
					/* @__PURE__ */ w("bdi", {
						dir: "ltr",
						"data-pager": "",
						className: "font-[family-name:'Geist_Mono',monospace] text-[11px] text-[var(--muted-fg)] py-0 px-1.5",
						children: [
							e.page,
							" / ",
							e.lastPage
						]
					}),
					/* @__PURE__ */ C(Ts, {
						content: t("footer.nextPage"),
						side: "top",
						children: /* @__PURE__ */ C("button", {
							onClick: () => i(e.lastPage),
							"aria-label": t("footer.nextPage"),
							disabled: e.page >= e.lastPage,
							style: {
								...gm,
								opacity: e.page >= e.lastPage ? .45 : 1
							},
							children: /* @__PURE__ */ C(K, {
								name: "chevron-right",
								size: 11,
								color: "currentColor"
							})
						})
					})
				]
			})
		]
	});
}
var gm = {
	width: 24,
	height: 24,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	border: "1px solid var(--ich-hover-border, var(--border))",
	borderRadius: 5,
	backgroundColor: "var(--ich-hover-bg, var(--bg))",
	cursor: "pointer",
	color: "var(--ich-hover-fg, var(--muted-fg))",
	transition: "background-color .12s ease, color .12s ease, border-color .12s ease"
};
// src/components/layout/AppMain.tsx
function _m({ loading: e }) {
	return /* @__PURE__ */ w("main", {
		className: "flex-1 flex flex-col min-w-0",
		children: [
			/* @__PURE__ */ C(kf, {}),
			/* @__PURE__ */ C(lm, { loading: e }),
			/* @__PURE__ */ C(hm, {})
		]
	});
}
// src/components/ui/Toaster.tsx
var vm = 3200;
function ym() {
	let e = G((e) => e.toasts), t = G((e) => e.dismissToast), n = q();
	return c(() => {
		if (!e.length) return;
		let n = e.map((e) => setTimeout(() => t(e.id), vm));
		return () => n.forEach(clearTimeout);
	}, [e, t]), e.length ? /* @__PURE__ */ C("div", {
		"aria-live": "polite",
		"aria-atomic": "false",
		className: "fixed end-4 bottom-4 z-[var(--z-toast)] flex flex-col gap-2 pointer-events-none text-[length:var(--app-font,13.5px)]",
		children: e.map((e) => /* @__PURE__ */ C(mc, {
			icon: oc(e.icon),
			color: bm(e.icon),
			onClose: () => t(e.id),
			closeLabel: n("common.close"),
			className: "pointer-events-auto [animation:ichIn_.14s_ease]",
			children: e.msg
		}, e.id))
	}) : null;
}
function bm(e) {
	return e === "alert-circle" ? "error" : e === "check" ? "success" : "brand";
}
// src/components/ui/TaskLoader.tsx
function xm() {
	let e = G((e) => e.tasks), t = q();
	if (!e.length) return null;
	let n = e[e.length - 1];
	return /* @__PURE__ */ C(Sm, {
		label: n.label || t("task.working"),
		more: e.length - 1
	});
}
function Sm({ label: e, more: t = 0 }) {
	return /* @__PURE__ */ w("div", {
		role: "status",
		"aria-live": "polite",
		"data-task-loader": "",
		className: "fixed inset-x-0 bottom-4 z-[var(--z-toast)] mx-auto flex w-[280px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--pop)] px-3 py-2.5 shadow-[var(--shadow-elevated)] [animation:ichIn_.14s_ease]",
		children: [/* @__PURE__ */ C("span", {
			"aria-hidden": "true",
			className: "flex size-8 flex-none items-center justify-center rounded-[9px] bg-[linear-gradient(155deg,#a78bfa,var(--accent)_72%)] shadow-[0_6px_16px_-6px_var(--accent-soft)]",
			children: /* @__PURE__ */ C(K, {
				name: "layers",
				size: 16,
				color: "#fff"
			})
		}), /* @__PURE__ */ w("span", {
			className: "flex min-w-0 flex-1 flex-col gap-1.5",
			children: [/* @__PURE__ */ w("span", {
				className: "truncate text-[12px] text-[var(--fg)]",
				children: [e, t > 0 && /* @__PURE__ */ w("span", {
					className: "text-[var(--muted-fg)]",
					children: [" +", t]
				})]
			}), /* @__PURE__ */ C("span", {
				"aria-hidden": "true",
				className: "relative block h-[3px] overflow-hidden rounded-[3px] bg-[var(--muted)]",
				children: /* @__PURE__ */ C("span", { className: "absolute inset-y-0 left-0 w-2/5 rounded-[3px] bg-[var(--accent)] [animation:ichTaskSlide_1.1s_ease-in-out_infinite]" })
			})]
		})]
	});
}
// src/hooks/useResolvedIcons.ts
function Cm(e) {
	let { repo: t, client: n, page: r } = Pc(), [i, a] = p(/* @__PURE__ */ new Map()), [o, s] = p(!1), l = d(() => new Map(r.items.map((e) => [e.id, e])), [r.items]);
	return c(() => {
		if (t || !n) return;
		let r = e.filter((e) => !l.has(e) && !i.has(e));
		if (r.length === 0) return;
		let o = new AbortController();
		return s(!0), Promise.all(r.map((e) => n.getIcon(e, o.signal).catch(() => null))).then((e) => {
			o.signal.aborted || a((t) => {
				let n = new Map(t);
				return e.forEach((e, t) => {
					e && n.set(r[t], e);
				}), n;
			});
		}).finally(() => {
			o.signal.aborted || s(!1);
		}), () => {
			o.abort();
		};
	}, [
		t,
		n,
		JSON.stringify(e),
		l
	]), t ? {
		icons: e.map((e) => t.byId(e)).filter((e) => !!e),
		loading: !1
	} : {
		icons: e.map((e) => l.get(e) ?? i.get(e)).filter((e) => !!e),
		loading: o
	};
}
// src/components/application/modals/modal.tsx
var wm = (e) => /* @__PURE__ */ C(V, {
	...e,
	className: (t) => Z("fixed inset-0 z-(--z-overlay) flex min-h-dvh w-full items-end justify-center bg-overlay/70 px-4 outline-hidden backdrop-blur-[6px] sm:items-center sm:justify-center sm:px-8", "pt-(--modal-pt) pb-(--modal-pb) [--modal-pb:clamp(16px,8vh,64px)] [--modal-pt:16px] sm:[--modal-pb:32px] sm:[--modal-pt:32px]", t.isEntering && "duration-300 ease-out animate-in fade-in", t.isExiting && "duration-200 ease-in animate-out fade-out", typeof e.className == "function" ? e.className(t) : e.className)
}), Tm = (e) => /* @__PURE__ */ C(ue, {
	...e,
	className: (t) => Z("rounded-xl bg-primary align-middle shadow-xl outline-hidden max-sm:overflow-y-auto sm:rounded-2xl", "max-h-[calc(var(--visual-viewport-height)-var(--modal-pt)-var(--modal-pb))]", t.isEntering && "duration-300 ease-out animate-in zoom-in-95", t.isExiting && "duration-200 ease-in animate-out zoom-out-95", typeof e.className == "function" ? e.className(t) : e.className)
}), Em = (e) => /* @__PURE__ */ C(A, {
	...e,
	className: Z("relative max-h-[inherit] w-full overflow-y-auto outline-hidden", e.className)
});
// src/components/ui/Modal.tsx
function Dm({ onClose: e, children: t, width: n, align: r = "center", panelStyle: i, label: a = "Dialog", showClose: o = !0, closeLabel: s = "Close" }) {
	return /* @__PURE__ */ C(wm, {
		isOpen: !0,
		onOpenChange: (t) => !t && e(),
		isDismissable: !0,
		className: r === "top" ? "items-start sm:items-start" : void 0,
		children: /* @__PURE__ */ C(Tm, {
			style: {
				width: n,
				maxWidth: "94vw",
				fontSize: "var(--app-font, 13.5px)"
			},
			className: `overflow-hidden bg-[var(--surface)] ${r === "top" ? "mt-[8vh]" : ""}`,
			children: /* @__PURE__ */ w(Em, {
				"aria-label": a,
				className: "flex max-h-[inherit] flex-col gap-0",
				style: i,
				children: [o && /* @__PURE__ */ C(E, {
					onPress: e,
					"aria-label": s,
					className: "absolute end-3 top-3 z-1 flex size-8 cursor-pointer items-center justify-center rounded-lg text-fg-quaternary outline-hidden transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:ring-2 focus-visible:ring-brand",
					children: /* @__PURE__ */ C(oa, { className: "size-4 stroke-[2.25px]" })
				}), t]
			})
		})
	});
}
// src/components/ui/Console.tsx
var Om = [
	{
		type: "comment",
		re: /\/\/[^\n]*/y
	},
	{
		type: "string",
		re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y
	},
	{
		type: "number",
		re: /-?\b\d+(?:\.\d+)?\b/y
	},
	{
		type: "keyword",
		re: /\b(?:const|let|def|import|from|export|return|function|new|true|false|null|Infinity)\b/y
	},
	{
		type: "punct",
		re: /[{}[\]():;,=<>/]+/y
	},
	{
		type: "space",
		re: /\s+/y
	},
	{
		type: "text",
		re: /[^\s{}[\]():;,=<>/"'0-9]+/y
	}
], km = {
	comment: "var(--console-comment)",
	string: "var(--console-string)",
	number: "var(--console-number)",
	keyword: "var(--console-keyword)",
	punct: "var(--console-punct)",
	text: "var(--console-fg)",
	space: "var(--console-fg)"
};
function Am(e) {
	let t = [], n = 0, r = 0;
	for (; n < e.length && r++ < 500;) {
		let r = !1;
		for (let { type: i, re: a } of Om) {
			a.lastIndex = n;
			let o = a.exec(e);
			if (o && o.index === n && o[0].length) {
				i === "space" ? t.push(o[0]) : t.push(/* @__PURE__ */ C("span", {
					style: { color: km[i] },
					children: o[0]
				}, n)), n += o[0].length, r = !0;
				break;
			}
		}
		r || (t.push(e[n]), n += 1);
	}
	return t;
}
function jm({ title: e, code: t, onCopy: n, height: r = 300 }) {
	let [i, a] = p(!1), o = q(), s = t.split("\n");
	return /* @__PURE__ */ w("div", {
		style: {
			height: r,
			display: "flex",
			flexDirection: "column",
			border: "1px solid var(--console-border)",
			borderRadius: "calc(var(--radius) - 2px)",
			overflow: "hidden",
			background: "var(--console-bg)"
		},
		children: [/* @__PURE__ */ w("div", {
			className: "h-[30px] flex-none flex items-center gap-1.5 py-0 px-2.5 bg-[var(--console-chrome)] border-b border-b-[var(--console-border)]",
			children: [
				/* @__PURE__ */ C(Mm, { c: "#f87171" }),
				/* @__PURE__ */ C(Mm, { c: "#fbbf24" }),
				/* @__PURE__ */ C(Mm, { c: "#34d399" }),
				/* @__PURE__ */ C("span", {
					className: "flex-1 text-center font-[family-name:'Geist_Mono',monospace] text-[10px] text-[var(--console-comment)]",
					children: e
				}),
				n && /* @__PURE__ */ w("button", {
					onClick: () => {
						n?.(), a(!0), setTimeout(() => a(!1), 1200);
					},
					"aria-label": o("console.copyCode"),
					className: "h-5 py-0 px-2 border border-[var(--console-border)] rounded-[5px] bg-[var(--console-chrome)] text-[10.5px] cursor-pointer text-[var(--console-fg)] flex items-center gap-[5px]",
					children: [
						/* @__PURE__ */ C(K, {
							name: i ? "check" : "copy",
							size: 9,
							color: "currentColor"
						}),
						" ",
						o(i ? "console.copied" : "console.copy")
					]
				})
			]
		}), /* @__PURE__ */ w("div", {
			role: "region",
			tabIndex: 0,
			dir: "ltr",
			"aria-label": `${o("console.code")} — ${e}`,
			className: "flex-1 overflow-auto flex font-[family-name:'Geist_Mono',monospace] text-[11px] leading-[1.7]",
			children: [/* @__PURE__ */ C("div", {
				"aria-hidden": !0,
				className: "flex-none pt-2.5 pr-2 pb-2.5 pl-2.5 text-right text-[var(--console-gutter)] select-none bg-[var(--console-bg)]",
				children: s.map((e, t) => /* @__PURE__ */ C("div", { children: t + 1 }, t))
			}), /* @__PURE__ */ C("pre", {
				className: "m-0 py-2.5 px-3 text-[var(--console-fg)] whitespace-pre-wrap [word-break:break-word] flex-1",
				children: s.map((e, t) => /* @__PURE__ */ C("div", { children: e ? Am(e) : "\xA0" }, t))
			})]
		})]
	});
}
function Mm({ c: e }) {
	return /* @__PURE__ */ C("span", { style: {
		width: 9,
		height: 9,
		borderRadius: "50%",
		background: e,
		flex: "none"
	} });
}
// node_modules/@ichava/js-motion/dist/ichava-motion.mjs
function Nm() {
	var e = "1.0.0", t = {
		linear: "linear",
		ease: "ease",
		"ease-in": "ease-in",
		"ease-out": "ease-out",
		"ease-in-out": "ease-in-out",
		spring: "cubic-bezier(.34,1.56,.64,1)",
		back: "cubic-bezier(.68,-.55,.27,1.55)",
		"steps(8)": "steps(8)",
		"ease-in-quad": "cubic-bezier(.55,.06,.68,.19)",
		"ease-out-cubic": "cubic-bezier(.22,.61,.36,1)"
	};
	function n(e) {
		return e ? t[e] ? t[e] : /^(linear|ease(-in|-out|-in-out)?|step-(start|end)|steps\([^)]+\)|cubic-bezier\(\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*(,\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*){3}\))$/.test(String(e).trim()) ? e : "ease-in-out" : "ease-in-out";
	}
	var r = "perspective(400px)", i = "var(--ichm-glow-color, currentColor)", a = [
		{
			s: "",
			a: 1,
			d: 1,
			r: !1
		},
		{
			s: " · Reverse",
			a: 1,
			d: 1,
			r: !0
		},
		{
			s: " · Subtle",
			a: .55,
			d: 1.15,
			r: !1
		},
		{
			s: " · Subtle · Reverse",
			a: .55,
			d: 1.15,
			r: !0
		},
		{
			s: " · Bold",
			a: 1.7,
			d: .8,
			r: !1
		},
		{
			s: " · Bold · Reverse",
			a: 1.7,
			d: .8,
			r: !0
		}
	], o = [
		{
			id: "spin",
			label: "Spin",
			base: 1400,
			kf: function() {
				return [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }];
			}
		},
		{
			id: "spin-y",
			label: "Spin Y",
			base: 1600,
			kf: function() {
				return [{ transform: r + " rotateY(0deg)" }, { transform: r + " rotateY(360deg)" }];
			}
		},
		{
			id: "spin-z",
			label: "Spin Z",
			base: 1600,
			kf: function() {
				return [{ transform: r + " rotateZ(0deg) rotateX(20deg)" }, { transform: r + " rotateZ(360deg) rotateX(20deg)" }];
			}
		},
		{
			id: "flip-x",
			label: "Flip X",
			base: 1400,
			kf: function() {
				return [{ transform: r + " rotateX(0deg)" }, { transform: r + " rotateX(360deg)" }];
			}
		},
		{
			id: "flip-y",
			label: "Flip Y",
			base: 1400,
			kf: function() {
				return [{ transform: r + " rotateY(0deg)" }, { transform: r + " rotateY(360deg)" }];
			}
		},
		{
			id: "roll",
			label: "Roll",
			base: 1200,
			kf: function(e) {
				return [{
					transform: "translateX(" + -24 * e + "%) rotate(" + -120 * e + "deg)",
					opacity: .4
				}, {
					transform: "translateX(0) rotate(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "orbit",
			label: "Orbit",
			base: 2e3,
			kf: function(e) {
				return [{ transform: "rotate(0deg) translateX(" + 6 * e + "px) rotate(0deg)" }, { transform: "rotate(360deg) translateX(" + 6 * e + "px) rotate(-360deg)" }];
			}
		},
		{
			id: "pulse",
			label: "Pulse",
			base: 1200,
			kf: function(e) {
				return [
					{ opacity: 1 },
					{ opacity: Math.max(.1, 1 - .65 * e) },
					{ opacity: 1 }
				];
			}
		},
		{
			id: "heartbeat",
			label: "Heartbeat",
			base: 1e3,
			kf: function(e) {
				return [
					{ transform: "scale(1)" },
					{ transform: "scale(" + (1 + .18 * e) + ")" },
					{ transform: "scale(1)" },
					{ transform: "scale(" + (1 + .12 * e) + ")" },
					{ transform: "scale(1)" }
				];
			}
		},
		{
			id: "breathe",
			label: "Breathe",
			base: 3e3,
			kf: function(e) {
				return [
					{ transform: "scale(1)" },
					{ transform: "scale(" + (1 + .08 * e) + ")" },
					{ transform: "scale(1)" }
				];
			}
		},
		{
			id: "zoom-in",
			label: "Zoom In",
			base: 900,
			once: !0,
			kf: function(e) {
				return [{
					transform: "scale(" + (1 - .4 * e) + ")",
					opacity: 0
				}, {
					transform: "scale(1)",
					opacity: 1
				}];
			}
		},
		{
			id: "zoom-out",
			label: "Zoom Out",
			base: 900,
			once: !0,
			kf: function(e) {
				return [{
					transform: "scale(1)",
					opacity: 1
				}, {
					transform: "scale(" + (1 + .4 * e) + ")",
					opacity: 0
				}];
			}
		},
		{
			id: "pop",
			label: "Pop",
			base: 500,
			once: !0,
			kf: function(e) {
				return [
					{ transform: "scale(1)" },
					{ transform: "scale(" + (1 + .25 * e) + ")" },
					{ transform: "scale(1)" }
				];
			}
		},
		{
			id: "rubber-band",
			label: "Rubber Band",
			base: 900,
			once: !0,
			kf: function(e) {
				return [
					{ transform: "scale(1,1)" },
					{ transform: "scale(" + (1 + .25 * e) + "," + (1 - .25 * e) + ")" },
					{ transform: "scale(" + (1 - .15 * e) + "," + (1 + .15 * e) + ")" },
					{ transform: "scale(" + (1 + .05 * e) + "," + (1 - .05 * e) + ")" },
					{ transform: "scale(1,1)" }
				];
			}
		},
		{
			id: "jello",
			label: "Jello",
			base: 900,
			once: !0,
			kf: function(e) {
				return [
					{ transform: "skewX(0deg) skewY(0deg)" },
					{ transform: "skewX(" + -12 * e + "deg) skewY(" + -12 * e + "deg)" },
					{ transform: "skewX(" + 6 * e + "deg) skewY(" + 6 * e + "deg)" },
					{ transform: "skewX(" + -3 * e + "deg) skewY(" + -3 * e + "deg)" },
					{ transform: "skewX(0) skewY(0)" }
				];
			}
		},
		{
			id: "tada",
			label: "Tada",
			base: 1e3,
			once: !0,
			kf: function(e) {
				return [
					{ transform: "scale(1) rotate(0)" },
					{ transform: "scale(" + (1 - .1 * e) + ") rotate(" + -3 * e + "deg)" },
					{ transform: "scale(" + (1 + .1 * e) + ") rotate(" + 3 * e + "deg)" },
					{ transform: "scale(" + (1 + .1 * e) + ") rotate(" + -3 * e + "deg)" },
					{ transform: "scale(1) rotate(0)" }
				];
			}
		},
		{
			id: "bounce",
			label: "Bounce",
			base: 900,
			kf: function(e) {
				return [
					{ transform: "translateY(0)" },
					{ transform: "translateY(" + -22 * e + "%)" },
					{ transform: "translateY(0)" }
				];
			}
		},
		{
			id: "float",
			label: "Float",
			base: 2400,
			kf: function(e) {
				return [
					{ transform: "translateY(0)" },
					{ transform: "translateY(" + -12 * e + "%)" },
					{ transform: "translateY(0)" }
				];
			}
		},
		{
			id: "hop",
			label: "Hop",
			base: 800,
			kf: function(e) {
				return [
					{ transform: "translateY(0) scaleY(1)" },
					{ transform: "translateY(0) scaleY(0.86)" },
					{ transform: "translateY(" + -24 * e + "%) scaleY(1.05)" },
					{ transform: "translateY(0) scaleY(1)" }
				];
			}
		},
		{
			id: "slide-up",
			label: "Slide Up",
			base: 900,
			once: !0,
			kf: function(e) {
				return [{
					transform: "translateY(" + 30 * e + "%)",
					opacity: 0
				}, {
					transform: "translateY(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "slide-down",
			label: "Slide Down",
			base: 900,
			once: !0,
			kf: function(e) {
				return [{
					transform: "translateY(" + -30 * e + "%)",
					opacity: 0
				}, {
					transform: "translateY(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "slide-left",
			label: "Slide Left",
			base: 900,
			once: !0,
			kf: function(e) {
				return [{
					transform: "translateX(" + 30 * e + "%)",
					opacity: 0
				}, {
					transform: "translateX(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "slide-right",
			label: "Slide Right",
			base: 900,
			once: !0,
			kf: function(e) {
				return [{
					transform: "translateX(" + -30 * e + "%)",
					opacity: 0
				}, {
					transform: "translateX(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "shake-x",
			label: "Shake X",
			base: 600,
			kf: function(e) {
				return [
					{ transform: "translateX(0)" },
					{ transform: "translateX(" + -3 * e + "px)" },
					{ transform: "translateX(" + 3 * e + "px)" },
					{ transform: "translateX(" + -2 * e + "px)" },
					{ transform: "translateX(0)" }
				];
			}
		},
		{
			id: "shake-y",
			label: "Shake Y",
			base: 600,
			kf: function(e) {
				return [
					{ transform: "translateY(0)" },
					{ transform: "translateY(" + -3 * e + "px)" },
					{ transform: "translateY(" + 3 * e + "px)" },
					{ transform: "translateY(" + -2 * e + "px)" },
					{ transform: "translateY(0)" }
				];
			}
		},
		{
			id: "vibrate",
			label: "Vibrate",
			base: 300,
			kf: function(e) {
				return [
					{ transform: "translate(0,0)" },
					{ transform: "translate(" + -1.5 * e + "px," + 1.5 * e + "px)" },
					{ transform: "translate(" + 1.5 * e + "px," + -1.5 * e + "px)" },
					{ transform: "translate(0,0)" }
				];
			}
		},
		{
			id: "wobble",
			label: "Wobble",
			base: 1e3,
			once: !0,
			kf: function(e) {
				return [
					{ transform: "translateX(0) rotate(0)" },
					{ transform: "translateX(" + -12 * e + "%) rotate(" + -5 * e + "deg)" },
					{ transform: "translateX(" + 8 * e + "%) rotate(" + 3 * e + "deg)" },
					{ transform: "translateX(" + -4 * e + "%) rotate(" + -2 * e + "deg)" },
					{ transform: "translateX(0) rotate(0)" }
				];
			}
		},
		{
			id: "wiggle",
			label: "Wiggle",
			base: 800,
			kf: function(e) {
				return [
					{ transform: "rotate(0deg)" },
					{ transform: "rotate(" + -11 * e + "deg)" },
					{ transform: "rotate(" + 11 * e + "deg)" },
					{ transform: "rotate(0deg)" }
				];
			}
		},
		{
			id: "swing",
			label: "Swing",
			base: 1e3,
			origin: "top center",
			kf: function(e) {
				return [
					{ transform: "rotate(0deg)" },
					{ transform: "rotate(" + 15 * e + "deg)" },
					{ transform: "rotate(" + -10 * e + "deg)" },
					{ transform: "rotate(" + 5 * e + "deg)" },
					{ transform: "rotate(0deg)" }
				];
			}
		},
		{
			id: "pendulum",
			label: "Pendulum",
			base: 1600,
			origin: "top center",
			kf: function(e) {
				return [
					{ transform: "rotate(" + -20 * e + "deg)" },
					{ transform: "rotate(" + 20 * e + "deg)" },
					{ transform: "rotate(" + -20 * e + "deg)" }
				];
			}
		},
		{
			id: "rock",
			label: "Rock",
			base: 1200,
			origin: "bottom center",
			kf: function(e) {
				return [
					{ transform: "rotate(0deg)" },
					{ transform: "rotate(" + -8 * e + "deg)" },
					{ transform: "rotate(" + 8 * e + "deg)" },
					{ transform: "rotate(0deg)" }
				];
			}
		},
		{
			id: "fade",
			label: "Fade",
			base: 1400,
			kf: function(e) {
				return [{ opacity: Math.max(0, 1 - e) }, { opacity: 1 }];
			}
		},
		{
			id: "blink",
			label: "Blink",
			base: 1e3,
			kf: function() {
				return [
					{ opacity: 1 },
					{ opacity: 1 },
					{ opacity: 0 },
					{ opacity: 0 },
					{ opacity: 1 }
				];
			}
		},
		{
			id: "flash",
			label: "Flash",
			base: 1e3,
			once: !0,
			kf: function() {
				return [
					{ opacity: 1 },
					{ opacity: 0 },
					{ opacity: 1 },
					{ opacity: 0 },
					{ opacity: 1 }
				];
			}
		},
		{
			id: "glow",
			label: "Glow",
			base: 1600,
			kf: function(e) {
				return [
					{ filter: "drop-shadow(0 0 0 " + i + ")" },
					{ filter: "drop-shadow(0 0 " + 5 * e + "px " + i + ")" },
					{ filter: "drop-shadow(0 0 0 " + i + ")" }
				];
			}
		},
		{
			id: "draw",
			label: "Draw",
			base: 1400,
			once: !0,
			domOnly: !0,
			draw: !0,
			stagger: 120,
			kf: function() {
				return [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
			}
		},
		{
			id: "reveal",
			label: "Reveal",
			base: 700,
			once: !0,
			perChild: !0,
			stagger: 90,
			kf: function(e) {
				return [{
					opacity: 0,
					transform: "translateY(" + 14 * e + "px)"
				}, {
					opacity: 1,
					transform: "translateY(0)"
				}];
			}
		},
		{
			id: "cascade",
			label: "Cascade",
			base: 700,
			once: !0,
			perChild: !0,
			stagger: 110,
			kf: function(e) {
				return [{
					opacity: 0,
					transform: "scale(" + (1 - .3 * e) + ")"
				}, {
					opacity: 1,
					transform: "scale(1)"
				}];
			}
		},
		{
			id: "assemble",
			label: "Assemble",
			base: 800,
			once: !0,
			perChild: !0,
			stagger: 90,
			kf: function(e) {
				return [{
					opacity: 0,
					transform: "translateX(" + -18 * e + "px) rotate(" + -8 * e + "deg)"
				}, {
					opacity: 1,
					transform: "translateX(0) rotate(0)"
				}];
			}
		},
		{
			id: "parallax",
			label: "Parallax",
			base: 2600,
			perChild: !0,
			stagger: 160,
			kf: function(e) {
				return [
					{ transform: "translateY(0)" },
					{ transform: "translateY(" + -7 * e + "px)" },
					{ transform: "translateY(0)" }
				];
			}
		}
	], s = {};
	function c(e) {
		return e ? "-" + e.replace(/[·\s]+/g, "").toLowerCase() : "";
	}
	function l() {
		s = {};
		for (var e = 0; e < o.length; e++) for (var t = o[e], n = 0; n < a.length; n++) {
			var r = a[n], i = t.id + c(r.s);
			s[i] = {
				id: i,
				label: t.label + r.s,
				keyframes: t.kf(r.a),
				base: Math.round(t.base * r.d),
				direction: r.r ? "reverse" : "normal",
				iterations: t.once ? 1 : Infinity,
				once: !!t.once,
				origin: t.origin,
				domOnly: !!t.domOnly,
				draw: !!t.draw,
				perChild: !!t.perChild,
				stagger: t.stagger,
				family: t.id
			};
		}
	}
	l();
	var u = {
		defaults: {
			duration: null,
			easing: "ease-in-out",
			delay: 0,
			iterations: null,
			direction: null,
			speed: 1,
			trigger: "load"
		},
		lottie: "off",
		lottiePlayer: null,
		reduceMotion: "respect"
	}, d = [
		"__proto__",
		"constructor",
		"prototype"
	];
	function f(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			if (n) for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && d.indexOf(r) === -1 && (e[r] && typeof e[r] == "object" && typeof n[r] == "object" && !Array.isArray(n[r]) ? f(e[r], n[r]) : e[r] = n[r]);
		}
		return e;
	}
	function p() {
		if (u.reduceMotion === "off") return !1;
		try {
			return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-reduce-motion");
		} catch {
			return !0;
		}
	}
	function m(e) {
		return typeof e == "string" ? document.querySelector(e) : e;
	}
	function h(e, t, r) {
		var i = t.speed == null ? u.defaults.speed || 1 : t.speed, a = e.duration == null ? e.base : e.duration, o = t.duration == null ? Math.max(80, (a || 1e3) / Math.max(.1, i)) : t.duration, s = t.iterations == null ? e.iterations == null ? u.defaults.iterations == null ? Infinity : u.defaults.iterations : e.iterations : t.iterations;
		s === "infinite" && (s = Infinity);
		var c = t.direction || e.direction || u.defaults.direction || "normal";
		return {
			duration: o,
			easing: n(t.easing || e.easing || u.defaults.easing),
			delay: (t.delay == null ? u.defaults.delay || 0 : t.delay) + (r || 0),
			direction: c === "reverse" ? "reverse" : c === "alternate" ? "alternate" : "normal",
			iterations: s,
			fill: s === Infinity ? "none" : "forwards"
		};
	}
	function g(e, t, n) {
		return e = m(e), !e || !t || !t.keyframes || !t.keyframes.length || p() ? null : (n ||= {}, t.origin && e.style && (e.style.transformOrigin = t.origin), e.animate(t.keyframes, h(t, n)));
	}
	function _(e) {
		var t = e.querySelectorAll("[data-layer]");
		return t.length ? t : (t = e.querySelectorAll(":scope > g, :scope > path"), t.length ? t : e.children);
	}
	function v(e, t, n) {
		n ||= {};
		var r = _(e);
		if (!r || !r.length) return g(e, t, n);
		for (var i = n.stagger == null ? t.stagger == null ? 90 : t.stagger : n.stagger, a = null, o = 0; o < r.length; o++) t.origin && r[o].style && (r[o].style.transformOrigin = t.origin), a = r[o].animate(t.keyframes, h(t, n, o * i));
		return a;
	}
	function y(e, t, n) {
		n ||= {};
		var r = e.querySelectorAll("path, line, polyline, polygon, circle, rect");
		if (!r.length) return g(e, t, n);
		for (var i = n.stagger == null ? t.stagger == null ? 120 : t.stagger : n.stagger, a = null, o = 0, s = 0; s < r.length; s++) {
			var c = r[s], l = 0;
			try {
				l = c.getTotalLength ? c.getTotalLength() : 0;
			} catch {
				l = 0;
			}
			l && (c.style.strokeDasharray = String(l), c.style.strokeDashoffset = String(l), a = c.animate([{ strokeDashoffset: l }, { strokeDashoffset: 0 }], h(t, n, o++ * i)));
		}
		return a;
	}
	function b(e, t, n) {
		var r = s[t];
		if (!r) return null;
		var i = m(e);
		return !i || p() ? null : r.draw ? y(i, r, n || {}) : r.perChild ? v(i, r, n || {}) : g(i, r, n);
	}
	function x(e, t, n) {
		return typeof t == "string" ? b(e, t, n) : t && t.layers && t.v && t.ip != null ? S(e, t, n) : g(e, t, n);
	}
	function S(e, t, n) {
		if (u.lottie === "import" && window.IchavaMotionLottie) {
			var r = window.IchavaMotionLottie.toSpec(t);
			if (r) return g(e, r, n);
		}
		if (u.lottie === "full") return T(m(e), t);
		if (window.IchavaMotionLottie) {
			var i = window.IchavaMotionLottie.toSpec(t);
			if (i) return g(e, i, n);
		}
		return null;
	}
	var C = !1;
	function w() {
		return u.lottiePlayer ? u.lottiePlayer : typeof window < "u" && window.lottie ? window.lottie : null;
	}
	function T(e, t) {
		if (!e) return null;
		var n = w();
		return n ? (n.loadAnimation({
			container: e,
			renderer: "svg",
			loop: !0,
			autoplay: !0,
			animationData: t
		}), null) : (C || (C = !0, console.warn("[ichava-motion] lottie:\"full\" needs a lottie-web player, and this library will not fetch one. Load lottie-web yourself (npm, or a <script> you control) and either expose it as window.lottie or pass it in: IchavaMotion.config({ lottiePlayer: lottie }).")), null);
	}
	function E(e) {
		var t = e.dataset, n = {};
		return t.motionSpeed && (n.speed = parseFloat(t.motionSpeed)), t.motionEasing && (n.easing = t.motionEasing), t.motionDelay && (n.delay = parseFloat(t.motionDelay)), t.motionDirection && (n.direction = t.motionDirection), t.motionIterations && (n.iterations = t.motionIterations === "infinite" ? Infinity : parseFloat(t.motionIterations)), t.motionStagger && (n.stagger = parseFloat(t.motionStagger)), n;
	}
	var D = /* @__PURE__ */ new WeakSet();
	function O(e) {
		if (D.has(e)) return;
		D.add(e);
		var t = e.getAttribute("data-ichava-motion"), n = e.getAttribute("data-motion-trigger") || u.defaults.trigger || "load", r = E(e), i = null;
		function a(n) {
			return i && i.cancel(), i = b(e, t, n || r), i;
		}
		if (n === "load") a();
		else if (n === "loop") a({ iterations: Infinity });
		else if (n === "hover") e.addEventListener("mouseenter", function() {
			a();
		}), e.addEventListener("mouseleave", function() {
			i && i.cancel();
		});
		else if (n === "click") e.addEventListener("click", function() {
			i && i.playState === "running" ? i.cancel() : a();
		});
		else if (n === "visible") {
			if ("IntersectionObserver" in window) {
				var o = new IntersectionObserver(function(n) {
					n.forEach(function(n) {
						n.isIntersecting && (a({ iterations: s[t] && s[t].once ? 1 : r.iterations }), o.unobserve(e));
					});
				});
				o.observe(e);
			} else a();
		}
	}
	function ee(e) {
		(e || document).querySelectorAll("[data-ichava-motion]").forEach(O);
	}
	var te = {
		version: e,
		config: function(e) {
			return f(u, e || {}), this;
		},
		animate: x,
		play: b,
		playSpec: g,
		fromJSON: function(e, t, n) {
			return n ||= {}, n.trigger === "loop" && (n.iterations = Infinity), g(e, t, n);
		},
		auto: ee,
		presets: function() {
			return s;
		},
		presetIds: function() {
			return Object.keys(s);
		},
		easings: function() {
			return f({}, t);
		},
		register: function(e, t) {
			return s[e] = f({
				id: e,
				keyframes: [],
				base: 1e3,
				iterations: Infinity,
				direction: "normal"
			}, t), this;
		},
		registerFamily: function(e) {
			return o.push(e), l(), this;
		},
		registerVariant: function(e) {
			return a.push(e), l(), this;
		},
		registerEasing: function(e, n) {
			return t[e] = n, this;
		},
		create: function() {
			return Nm();
		},
		catalog: function() {
			return {
				families: o.map(function(e) {
					return f({}, e);
				}),
				variants: a.map(function(e) {
					return f({}, e);
				})
			};
		}
	};
	return te.autoInit = function() {
		return typeof document > "u" || (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
			ee();
		}) : ee()), te;
	}, te;
}
var Pm = Nm();
typeof globalThis < "u" && globalThis.document !== void 0 && (globalThis.IchavaMotion = Pm);
// src/core/MotionEngine.ts
var Fm = Pm.catalog(), Im = (e) => ({
	id: e.id,
	label: e.label,
	base: e.base,
	keyframes: e.kf,
	...e.origin !== void 0 && { origin: e.origin },
	...e.once !== void 0 && { once: e.once },
	...e.domOnly !== void 0 && { domOnly: e.domOnly },
	...e.perChild !== void 0 && { perChild: e.perChild },
	...e.draw !== void 0 && { draw: e.draw },
	...e.stagger !== void 0 && { stagger: e.stagger }
}), Lm = Fm.variants.map((e) => ({
	suffix: e.s,
	ampMul: e.a,
	durMul: e.d,
	reverse: e.r
})), Rm = Fm.families.filter((e) => !e.perChild).map(Im), zm = Fm.families.filter((e) => e.perChild).map(Im), Bm = {
	id: "none",
	label: "None",
	base: 0,
	keyframes: []
}, Vm = {
	id: "json",
	label: "JSON · Custom ✦",
	base: 0,
	keyframes: [],
	custom: !0
};
function Hm(e, t) {
	let n = e.keyframes(t.ampMul);
	return {
		id: `${e.id}${t.suffix ? "-" + t.suffix.replace(/[·\s]+/g, "").toLowerCase() : ""}`,
		label: `${e.label}${t.suffix}`,
		base: Math.round(e.base * t.durMul),
		keyframes: n,
		direction: t.reverse ? "reverse" : "normal",
		iterations: e.once ? 1 : Infinity,
		once: e.once,
		origin: e.origin,
		family: e.id,
		domOnly: e.domOnly,
		perChild: e.perChild,
		draw: e.draw,
		stagger: e.stagger
	};
}
function Um(e = {}) {
	let t = [Bm, Vm];
	for (let n of Rm) if (!n.domOnly || e.includeDomOnly) for (let e of Lm) t.push(Hm(n, e));
	return t;
}
var Wm = Um(), Gm = [
	Bm,
	Vm,
	...zm.flatMap((e) => Lm.map((t) => Hm(e, t))),
	...Rm.filter((e) => e.draw).flatMap((e) => Lm.map((t) => Hm(e, t)))
], Km = [
	"linear",
	"ease",
	"ease-in",
	"ease-out",
	"ease-in-out",
	"cubic-bezier(.34,1.56,.64,1)",
	"cubic-bezier(.68,-.55,.27,1.55)",
	"steps(8)",
	"cubic-bezier(.55,.06,.68,.19)",
	"cubic-bezier(.22,.61,.36,1)"
], qm = {
	linear: "linear",
	ease: "ease",
	"ease-in": "ease-in",
	"ease-out": "ease-out",
	"ease-in-out": "ease-in-out",
	"cubic-bezier(.34,1.56,.64,1)": "spring",
	"cubic-bezier(.68,-.55,.27,1.55)": "back",
	"steps(8)": "steps(8)",
	"cubic-bezier(.55,.06,.68,.19)": "ease-in-quad",
	"cubic-bezier(.22,.61,.36,1)": "ease-out-cubic"
};
function Jm(e) {
	return 4 ** ((e - 50) / 50);
}
function Ym(e) {
	return `${e.toFixed(e < 1 ? 2 : +(e < 10))}×`;
}
function Xm(e, t, n) {
	if (t.keyframes.length === 0 || t.base === 0 || n.reduceMotion) return null;
	let r = {
		speed: n.speed,
		easing: n.easing,
		delay: n.delay,
		iterations: n.iterations
	};
	return t.draw || t.perChild ? Pm.play(e, t.id, r) : Pm.playSpec(e, t, r);
}
// src/core/raster.ts
async function Zm(e, t = 512, n = null) {
	let r = URL.createObjectURL(new Blob([e], { type: "image/svg+xml" }));
	try {
		let e = new Image();
		e.decoding = "async", await new Promise((t, n) => {
			e.onload = () => t(), e.onerror = () => n(/* @__PURE__ */ Error("svg decode failed")), e.src = r;
		});
		let i = document.createElement("canvas");
		i.width = t, i.height = t;
		let a = i.getContext("2d");
		if (!a) throw Error("no 2d context");
		return n && (a.fillStyle = n, a.fillRect(0, 0, t, t)), a.drawImage(e, 0, 0, t, t), await new Promise((e, t) => i.toBlob((n) => n ? e(n) : t(/* @__PURE__ */ Error("toBlob failed")), "image/png"));
	} finally {
		URL.revokeObjectURL(r);
	}
}
function Qm(e, t) {
	let n = URL.createObjectURL(t), r = document.createElement("a");
	r.href = n, r.download = e, r.click(), URL.revokeObjectURL(n);
}
// src/components/browser/MotionPicker.tsx
function $m(e, t) {
	let n = {
		id: "general",
		label: "",
		items: []
	}, r = /* @__PURE__ */ new Map();
	for (let i of e) {
		if (!i.family) {
			n.items.push({
				id: i.id,
				label: i.label,
				name: i.label
			});
			continue;
		}
		let e = r.get(i.family);
		e || (e = {
			id: i.family,
			label: i.label.split(" · ")[0],
			items: []
		}, r.set(i.family, e));
		let a = i.label.startsWith(e.label) ? i.label.slice(e.label.length).replace(/^\s*·\s*/, "") : i.label;
		e.items.push({
			id: i.id,
			label: a || t,
			name: i.label
		});
	}
	return [n, ...r.values()].filter((e) => e.items.length > 0);
}
function eh({ presets: e, value: t, onChange: n, isDisabled: r }) {
	let i = q(), { contains: a } = Re({ sensitivity: "base" }), o = d(() => $m(e, i("detail.motionDefault")), [e, i]);
	return /* @__PURE__ */ w(he, {
		"aria-label": i("detail.motion"),
		selectedKey: t,
		isDisabled: r,
		onSelectionChange: (t) => {
			let r = e.find((e) => e.id === t);
			r && n(r);
		},
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ w(E, {
			className: ({ isFocusVisible: e, isPressed: t }) => Z("relative flex w-full cursor-pointer items-center gap-2 rounded-lg bg-primary py-1.5 pr-2.5 pl-3 shadow-xs ring-1 ring-primary outline-hidden transition duration-100 ease-linear ring-inset", (e || t) && "ring-2 ring-brand"),
			children: [/* @__PURE__ */ C(ge, {
				className: "min-w-0 flex-1 truncate text-left text-[13px]/5 font-medium text-primary",
				children: ({ selectedText: n }) => e.find((e) => e.id === t)?.label ?? n
			}), /* @__PURE__ */ C(hi, {
				"aria-hidden": "true",
				className: "size-4 shrink-0 stroke-[2.25px] text-fg-quaternary"
			})]
		}), /* @__PURE__ */ C(H, {
			placement: "bottom start",
			offset: 4,
			className: ({ isEntering: e, isExiting: t }) => Z("z-(--z-popover) flex w-80 max-w-[calc(100vw-16px)] flex-col overflow-hidden rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt outline-hidden", e && "duration-150 ease-out animate-in fade-in", t && "duration-100 ease-in animate-out fade-out"),
			children: /* @__PURE__ */ w(T, {
				filter: (e, t) => t.trim().split(/\s+/).every((t) => a(e, t)),
				children: [/* @__PURE__ */ C(me, {
					"aria-label": i("detail.searchPresets", { n: e.length }),
					autoFocus: !0,
					className: "border-b border-secondary p-2",
					children: /* @__PURE__ */ w("div", {
						className: "relative flex items-center",
						children: [/* @__PURE__ */ C(Qi, {
							"aria-hidden": "true",
							className: "pointer-events-none absolute left-2.5 size-4 text-fg-quaternary"
						}), /* @__PURE__ */ C(L, {
							placeholder: i("detail.searchPresets", { n: e.length }),
							className: "w-full rounded-md bg-primary py-1.5 pr-2 pl-8 text-[13px]/5 text-primary ring-1 ring-primary outline-hidden ring-inset placeholder:text-placeholder focus:ring-2 focus:ring-brand [&::-webkit-search-cancel-button]:hidden"
						})]
					})
				}), /* @__PURE__ */ C(ie, {
					items: o,
					className: "max-h-64 min-h-0 flex-1 overflow-y-auto py-1 outline-hidden",
					renderEmptyState: () => /* @__PURE__ */ C("p", {
						className: "px-3 py-4 text-center text-[12.5px] text-tertiary",
						children: i("detail.noPresets")
					}),
					children: (e) => /* @__PURE__ */ w(ae, {
						id: `group:${e.id}`,
						className: "pb-1",
						children: [e.label && /* @__PURE__ */ C(I, {
							className: "sticky top-0 z-1 bg-primary px-3 pt-2 pb-1 text-[10.5px] font-semibold tracking-wide text-tertiary uppercase",
							children: e.label
						}), /* @__PURE__ */ C(ee, {
							items: e.items,
							children: (e) => /* @__PURE__ */ C(B, {
								id: e.id,
								textValue: e.name,
								className: "px-1 outline-hidden",
								children: ({ isSelected: t, isFocused: n }) => /* @__PURE__ */ w("div", {
									className: Z("flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px]/5 text-primary", (n || t) && "bg-primary_hover"),
									children: [/* @__PURE__ */ C("span", {
										className: "min-w-0 flex-1 truncate font-medium",
										children: e.label
									}), t && /* @__PURE__ */ C(mi, {
										"aria-hidden": "true",
										className: "size-4 shrink-0 stroke-[2.25px] text-fg-brand-primary"
									})]
								})
							})
						})]
					})
				})]
			})
		})]
	});
}
// src/components/application/tabs/tabs.tsx
var th = ({ isFocusVisible: e, isSelected: t, isHovered: n }) => ({
	"button-brand": Z("outline-focus-ring *:data-icon:text-fg-quaternary", e && "outline-2 -outline-offset-2", (t || n) && "bg-brand-primary_alt text-brand-secondary *:data-icon:text-fg-brand-secondary_hover"),
	"button-gray": Z("outline-focus-ring *:data-icon:text-fg-quaternary", n && "bg-primary_hover text-secondary *:data-icon:text-fg-secondary_hover", e && "outline-2 -outline-offset-2", t && "bg-primary_hover text-secondary *:data-icon:text-fg-secondary_hover"),
	"button-border": Z("outline-focus-ring *:data-icon:text-fg-quaternary", e && "outline-2 -outline-offset-2", (t || n) && "bg-primary_alt text-secondary shadow-sm *:data-icon:text-fg-secondary_hover"),
	"button-minimal": Z("rounded-lg outline-focus-ring *:data-icon:text-fg-quaternary", e && "outline-2 -outline-offset-2", (t || n) && "bg-primary_alt text-secondary shadow-xs ring-1 ring-primary ring-inset *:data-icon:text-fg-secondary_hover"),
	underline: Z("rounded-none border-b-2 border-transparent outline-focus-ring *:data-icon:text-fg-quaternary", e && "outline-2 -outline-offset-2", (t || n) && "border-fg-brand-primary_alt text-brand-secondary *:data-icon:text-fg-brand-secondary_hover"),
	line: Z("rounded-none border-l-2 border-transparent outline-focus-ring *:data-icon:text-fg-quaternary", e && "outline-2 -outline-offset-2", (t || n) && "border-fg-brand-primary_alt text-brand-secondary *:data-icon:text-fg-brand-secondary_hover")
}), nh = {
	sm: {
		base: "text-sm font-semibold gap-1 *:data-icon:size-4",
		"button-brand": "py-2 px-2.5",
		"button-gray": "py-2 px-2.5",
		"button-border": "py-2 px-2.5",
		"button-minimal": "py-2 px-2.5",
		underline: "px-0.5 pb-2.5 pt-0",
		line: "pl-2.5 pr-3 py-0.5"
	},
	md: {
		base: "text-md font-semibold gap-1.5 *:data-icon:size-5",
		"button-brand": "py-2.5 px-2.5",
		"button-gray": "py-2.5 px-2.5",
		"button-border": "py-2.5 px-2.5",
		"button-minimal": "py-2.5 px-2.5",
		underline: "px-0.5 pb-2.5 pt-0",
		line: "pr-3.5 pl-3 py-1"
	}
}, rh = ({ size: e, fullWidth: t }) => ({
	"button-brand": "gap-1",
	"button-gray": "gap-1",
	"button-border": Z("gap-1 rounded-[10px] bg-secondary_alt p-1 ring-1 ring-secondary ring-inset", e === "md" && "rounded-xl p-1.5"),
	"button-minimal": "gap-0.5 rounded-lg bg-secondary_alt ring-1 ring-inset ring-secondary",
	underline: Z("gap-3", t && "w-full gap-4"),
	line: "gap-2"
}), ih = i({
	size: "sm",
	type: "button-brand"
}), ah = ({ size: e = "sm", type: t = "button-brand", orientation: n, fullWidth: r, className: i, children: a, ...o }) => {
	let s = ze(De), c = n ?? s?.orientation ?? "horizontal";
	return /* @__PURE__ */ C(ih.Provider, {
		value: {
			size: e,
			type: t,
			orientation: c,
			fullWidth: r
		},
		children: /* @__PURE__ */ C(we, {
			...o,
			className: (n) => Z("group flex", rh({
				size: e,
				fullWidth: r
			})[t], c === "vertical" && "w-max flex-col", c === "horizontal" && t === "underline" && "relative before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border-secondary", typeof i == "function" ? i(n) : i),
			children: a ?? (o.items ? (e) => /* @__PURE__ */ C(sh, {
				...e,
				children: e.children
			}) : void 0)
		})
	});
}, oh = (e) => /* @__PURE__ */ C(Te, {
	...e,
	className: (t) => Z("outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2", typeof e.className == "function" ? e.className(t) : e.className)
}), sh = ({ label: e, children: t, badge: n, icon: r, className: i, ...o }) => {
	let { size: c = "sm", type: l = "button-brand", fullWidth: u } = s(ih), d = l === "underline" || l === "line" || l === "button-brand";
	return /* @__PURE__ */ C(Ce, {
		...o,
		className: (e) => Z("z-10 flex h-max cursor-pointer items-center justify-center gap-2 rounded-md whitespace-nowrap text-quaternary transition duration-100 ease-linear", "group-orientation-vertical:justify-start", u && "w-full flex-1", nh[c].base, nh[c][l], th(e)[l], typeof i == "function" ? i(e) : i),
		children: (i) => /* @__PURE__ */ w(S, { children: [
			a(r) && r,
			us(r) && /* @__PURE__ */ C(r, {
				"data-icon": !0,
				className: "transition-inherit-all"
			}),
			/* @__PURE__ */ w("span", {
				className: Z("flex items-center gap-1.5", l !== "line" && "px-0.5"),
				children: [typeof t == "function" ? t(i) : t || e, n && /* @__PURE__ */ C(Rc, {
					size: "sm",
					type: d ? "pill-color" : "modern",
					color: d && (i.isHovered || i.isSelected) ? "brand" : "gray",
					className: Z("hidden transition-inherit-all md:flex", c === "sm" && "-my-px"),
					children: n
				})]
			})
		] })
	});
}, ch = ({ className: e, ...t }) => /* @__PURE__ */ C(Ee, {
	keyboardActivation: "manual",
	...t,
	className: (t) => Z("flex w-full flex-col", typeof e == "function" ? e(t) : e)
});
ch.Panel = oh, ch.List = ah, ch.Item = sh;
// src/components/ui/tabs.ts
var lh = "flex-wrap self-start gap-0.5 rounded-[calc(var(--radius)_-_2px)] p-0.5", uh = "h-6 rounded-[calc(var(--radius)_-_3px)] px-2 py-0 text-[11px] font-medium data-[selected]:font-semibold", dh = [
	"motion",
	"helper",
	"bladeGeneric",
	"webcomponent",
	"name"
];
function fh() {
	let e = Yr(), { repo: t, client: n } = Pc(), r = G((e) => e.detailId), i = G((e) => e.closeLayer), a = G((e) => e.openDetail), o = G((e) => e.favorites), s = G((e) => e.toggleFavorite), l = G((e) => e.collections), u = G((e) => e.addToCollection), m = G((e) => e.removeFromCollection), h = G((e) => e.pushHistory), g = dl(), _ = $r(), v = ii(), y = f(void 0);
	c(() => () => ai(v?.current, y.current), [v]);
	let b = (e) => e ? e.builtin && dh.includes(e.id) ? T(Vt(`snippetTab.${e.id}`)) : e.label : "", x = G((e) => e.config?.snippets), S = G((e) => e.reduceMotion), T = q(), [E, D] = p("svg"), O = d(() => {
		let t = Bp(x);
		return e.getState().config?.features.motion === !1 ? t.filter((e) => e.id !== "motion") : t;
	}, [x, e]), ee = O.some((e) => e.id === E) ? E : O[0]?.id ?? "svg", te = O.find((e) => e.id === ee), k = G((e) => e.locale), [A, j] = p(96), [M, N] = p("px"), [P, F] = p(null), [I, ne] = p(1.5), [L, R] = p(null), [z, ie] = p(Wm[0]), [B, ae] = p("ease-in-out"), [oe, se] = p(50), [ce, le] = p(!1), [ue, V] = p("[\n  { \"transform\": \"rotate(0deg) scale(1)\", \"opacity\": 1 },\n  { \"transform\": \"rotate(-14deg) scale(1.12)\", \"opacity\": 1, \"offset\": 0.3 },\n  { \"transform\": \"rotate(0deg) scale(1)\", \"opacity\": 1 }\n]"), de = f(null), H = f(null), { icons: [fe] } = Cm(r == null ? [] : [r]), U = fe;
	c(() => {
		y.current = U?.id;
	}, [U?.id]);
	let pe = d(() => {
		if (!z.custom) return null;
		try {
			let e = JSON.parse(ue), t = Array.isArray(e) ? e : Array.isArray(e.keyframes) ? e.keyframes : null;
			return !t || !t.every((e) => e && typeof e == "object" && !Array.isArray(e)) ? null : t;
		} catch {
			return null;
		}
	}, [z.custom, ue]), me = z.custom && pe ? {
		...z,
		keyframes: pe,
		base: 1400
	} : z;
	c(() => {
		if (H.current?.cancel(), H.current = null, !de.current || me.id === "none" || me.custom && !pe) return;
		let e = Xm(de.current, me, {
			speed: Jm(oe),
			easing: B,
			iterations: me.once ? Infinity : void 0,
			reduceMotion: S
		});
		return H.current = e, e && ce && e.pause(), () => e?.cancel();
	}, [
		me,
		pe,
		oe,
		ce,
		B,
		U,
		S
	]), c(() => {
		if (!U) return;
		if (U.svgContent) {
			R(U.svgContent);
			return;
		}
		if (!n && !U.svgUrl) {
			R(null);
			return;
		}
		let e = !0;
		return Promise.resolve(pd(U, n)).then((t) => e && R(t)).catch(() => e && R(null)), () => {
			e = !1;
		};
	}, [U, n]);
	let [he, ge] = p([]);
	c(() => {
		if (!U || t || !n) {
			ge([]);
			return;
		}
		let e = !0;
		return n.getRelated(U).then((t) => e && ge(t)).catch(() => e && ge([])), () => {
			e = !1;
		};
	}, [
		U,
		t,
		n
	]);
	let _e = U && t ? t.related(U) : he, ve = d(() => U ? Pp.build(ee, U, {
		config: x,
		size: A,
		unit: M,
		color: P,
		strokeWidth: I,
		motion: {
			id: z.id,
			label: z.label,
			keyframes: pe ?? z.keyframes,
			base: z.base,
			easing: B,
			easingLabel: qm[B] ?? B,
			speed: Jm(oe),
			direction: z.direction,
			iterations: z.iterations
		}
	}, L) : "", [
		U,
		ee,
		x,
		A,
		M,
		P,
		I,
		L,
		z,
		B,
		oe
	]);
	if (!U) return null;
	let ye = o.includes(U.id), be = U.kind === "illustration" ? Gm : Wm, xe = e.getState().config?.features.motion !== !1, Se = A * ({
		px: 1,
		rem: 16,
		em: 16
	}[M] ?? 1), Ce = Math.max(28, Math.min(Se, 150)), we = Se > 150, Te = () => L ? Pp.build("svg", U, {
		size: A,
		unit: "px",
		color: P,
		strokeWidth: I
	}, L) : null, Ee = () => {
		let t = Te();
		t ? (Qm(`${U.name}.svg`, new Blob([t], { type: "image/svg+xml" })), h(U.id, "downloaded")) : e.getState().showToast(T("detail.noSvg"), "alert-circle");
	}, De = async () => {
		let t = Te();
		if (!t) e.getState().showToast(T("detail.pngNoSvg"), "alert-circle");
		else try {
			let n = await e.getState().runTask(T("task.png"), () => Zm(t, Math.max(256, A * 4)));
			Qm(`${U.name}.png`, n), h(U.id, "downloaded");
		} catch {
			e.getState().showToast(T("detail.pngFailed"), "alert-circle");
		}
	};
	return /* @__PURE__ */ w(Dm, {
		showClose: !1,
		onClose: i,
		width: 940,
		align: "top",
		label: Kt(U),
		panelStyle: { overflowY: "auto" },
		children: [/* @__PURE__ */ w("div", {
			className: "flex items-center gap-2 py-3 px-4 border-b border-b-[var(--border)]",
			children: [
				/* @__PURE__ */ C("h2", {
					className: "m-0 font-[family-name:'Geist_Mono',monospace] text-[13.5px] font-semibold min-w-0 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis",
					children: U.name
				}),
				/* @__PURE__ */ C("span", {
					className: "text-[10.5px] text-[var(--color-text-brand-secondary)] bg-[var(--accent-soft)] rounded-[5px] py-0.5 px-1.5 font-[550] flex-none",
					children: U.package.replace("ichava/", "")
				}),
				/* @__PURE__ */ w("span", {
					className: "text-[11px] text-[var(--muted-fg)] capitalize whitespace-nowrap overflow-hidden text-ellipsis",
					children: [
						U.category,
						" · ",
						U.variant
					]
				}),
				/* @__PURE__ */ C("span", { className: "flex-1 min-w-2" }),
				_ && /* @__PURE__ */ C(hh, {
					name: "link",
					title: T("tile.copyPermalink"),
					onClick: () => g(_(U.id), T("tile.permalinkCopied"))
				}),
				/* @__PURE__ */ C(hh, {
					name: "close",
					title: `${T("common.close")} — Esc`,
					onClick: i
				})
			]
		}), /* @__PURE__ */ w("div", {
			className: "ich-detail-grid",
			style: {
				display: "grid",
				gridTemplateColumns: "300px minmax(0,1fr)",
				gap: 18,
				padding: 18
			},
			children: [/* @__PURE__ */ w("div", {
				className: "flex flex-col gap-2.5",
				children: [
					/* @__PURE__ */ w("div", {
						className: "relative h-56 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--muted2)] flex items-center justify-center overflow-hidden",
						children: [/* @__PURE__ */ C("div", {
							ref: de,
							className: "flex",
							children: /* @__PURE__ */ C(wp, {
								inline: !0,
								icon: U,
								size: Ce,
								color: P,
								stroke: I
							})
						}), /* @__PURE__ */ w("span", {
							className: "absolute bottom-2 left-0 right-0 text-center text-[10.5px] text-[var(--muted-fg)]",
							children: [
								we ? `${T("detail.scaledToFit")} · ` : "",
								T("detail.actual"),
								" ",
								M === "px" ? T("unit.pxValue", { n: A }) : `${A} ${M}`
							]
						})]
					}),
					/* @__PURE__ */ C("p", {
						className: "m-0 -mt-1 text-[10.5px] text-[var(--muted-fg)]",
						children: T("detail.previewOnly")
					}),
					/* @__PURE__ */ w(mh, {
						label: T("detail.size"),
						children: [
							/* @__PURE__ */ C("div", {
								className: "flex-1",
								children: /* @__PURE__ */ C(Vs, {
									minValue: 16,
									maxValue: 256,
									step: 16,
									value: A,
									onChange: (e) => j(e),
									"aria-label": T("detail.previewSize"),
									formatOptions: { style: "decimal" }
								})
							}),
							/* @__PURE__ */ C(ph, { children: M === "px" ? T("unit.pxValue", { n: A }) : `${A} ${M}` }),
							/* @__PURE__ */ C(Cs, {
								size: "sm",
								"aria-label": T("detail.unit"),
								items: [
									"px",
									"rem",
									"em"
								].map((e) => ({
									id: e,
									label: e
								})),
								selectedKey: M,
								onSelectionChange: (e) => N(e),
								className: "w-20",
								popoverClassName: "min-w-20",
								children: (e) => /* @__PURE__ */ C(Cs.Item, { ...e })
							})
						]
					}),
					!U.ownColor && /* @__PURE__ */ C(Es, {
						label: T("color.previewColor"),
						align: "left",
						width: 196,
						panelStyle: {
							padding: 10,
							top: 30
						},
						trigger: (e, t) => /* @__PURE__ */ w("button", {
							onClick: t,
							style: gh,
							children: [
								/* @__PURE__ */ C("span", { style: {
									width: 13,
									height: 13,
									borderRadius: "50%",
									background: P ?? "linear-gradient(135deg,var(--fg),var(--muted-fg))",
									border: "1px solid var(--border)"
								} }),
								/* @__PURE__ */ C("span", {
									className: "text-[11.5px]",
									children: T("detail.color")
								}),
								/* @__PURE__ */ C(K, {
									name: "chevron-down",
									size: 9,
									color: "currentColor"
								})
							]
						}),
						children: () => /* @__PURE__ */ C(pl, {
							value: P,
							onChange: F
						})
					}),
					U.variant === "outline" && !U.ownColor && /* @__PURE__ */ w(mh, {
						label: T("detail.stroke"),
						children: [/* @__PURE__ */ C("div", {
							className: "flex-1",
							children: /* @__PURE__ */ C(Vs, {
								minValue: .5,
								maxValue: 3,
								step: .25,
								value: I,
								onChange: (e) => ne(e),
								"aria-label": T("detail.stroke"),
								formatOptions: {
									style: "decimal",
									maximumFractionDigits: 2
								}
							})
						}), /* @__PURE__ */ w(ph, { children: [I.toFixed(2), "px"] })]
					}),
					xe && /* @__PURE__ */ w("div", {
						className: "flex flex-col gap-1.5",
						children: [
							/* @__PURE__ */ C("span", {
								className: "text-[11px] font-semibold text-[var(--muted-fg)]",
								children: T("detail.motion")
							}),
							/* @__PURE__ */ C(eh, {
								presets: be,
								value: z.id,
								onChange: (e) => {
									ie(e), le(!1);
								}
							}),
							/* @__PURE__ */ w("div", {
								className: "flex gap-[5px]",
								children: [/* @__PURE__ */ C(Cs, {
									size: "sm",
									"aria-label": T("detail.easing"),
									isDisabled: z.id === "none",
									items: Km.map((e) => ({
										id: e,
										label: qm[e] ?? e
									})),
									selectedKey: B,
									onSelectionChange: (e) => ae(e),
									className: "min-w-0 flex-1",
									children: (e) => /* @__PURE__ */ C(Cs.Item, { ...e })
								}), /* @__PURE__ */ C("button", {
									onClick: () => le((e) => !e),
									disabled: z.id === "none",
									title: T(ce ? "detail.play" : "detail.pause"),
									"aria-label": T(ce ? "detail.play" : "detail.pause"),
									style: {
										...gh,
										width: 32,
										height: 32,
										alignSelf: "center",
										padding: 0,
										justifyContent: "center",
										opacity: z.id === "none" ? .4 : 1
									},
									children: /* @__PURE__ */ C(K, {
										name: ce ? "play" : "pause",
										size: 13,
										color: "currentColor"
									})
								})]
							}),
							z.id !== "none" && /* @__PURE__ */ w(mh, {
								label: T("detail.speed"),
								children: [/* @__PURE__ */ C("div", {
									className: "flex-1",
									children: /* @__PURE__ */ C(Vs, {
										minValue: 0,
										maxValue: 100,
										value: oe,
										onChange: (e) => se(e),
										"aria-label": T("detail.speed"),
										formatOptions: { style: "decimal" }
									})
								}), /* @__PURE__ */ C(ph, { children: Ym(Jm(oe)) })]
							})
						]
					}),
					/* @__PURE__ */ w("button", {
						onClick: () => {
							g(ve, T("detail.copied", { label: b(te) })), h(U.id, "copied");
						},
						className: "h-8 border-0 rounded-[calc(var(--radius)_-_2px)] bg-[var(--accent)] text-[var(--accent-fg)] text-[12.5px] font-semibold cursor-pointer",
						children: [
							T("common.copy"),
							" ",
							b(te)
						]
					}),
					/* @__PURE__ */ w("div", {
						className: "flex gap-1.5",
						children: [/* @__PURE__ */ C(ec, {
							label: T("detail.download"),
							trigger: /* @__PURE__ */ w("button", {
								className: "flex-1 h-[30px] flex items-center justify-center gap-[5px] border border-[var(--border)] rounded-[calc(var(--radius)_-_2px)] bg-[var(--bg)] text-[var(--fg)] text-[12px] cursor-pointer",
								children: [
									T("detail.download"),
									" ",
									/* @__PURE__ */ C(K, {
										name: "chevron-down",
										size: 9,
										color: "var(--muted-fg)"
									})
								]
							}),
							items: [{
								id: "svg",
								label: "SVG",
								onAction: () => Ee()
							}, {
								id: "png",
								label: "PNG",
								onAction: () => {
									De();
								}
							}]
						}), /* @__PURE__ */ C("button", {
							onClick: () => s(U.id),
							style: {
								flex: 1,
								height: 30,
								border: `1px solid ${ye ? "var(--accent)" : "var(--border)"}`,
								borderRadius: "calc(var(--radius) - 2px)",
								backgroundColor: ye ? "var(--accent-soft)" : "var(--bg)",
								color: ye ? "var(--accent)" : "var(--fg)",
								fontSize: 12,
								cursor: "pointer"
							},
							children: T(ye ? "common.favorited" : "common.favorite")
						})]
					})
				]
			}), /* @__PURE__ */ w("div", {
				className: "flex flex-col gap-2.5 min-w-0",
				children: [
					/* @__PURE__ */ C(re, {
						locale: k,
						children: /* @__PURE__ */ w(ch, {
							selectedKey: ee,
							onSelectionChange: (e) => D(e),
							keyboardActivation: "automatic",
							className: "gap-2.5",
							children: [/* @__PURE__ */ C(ch.List, {
								type: "button-border",
								size: "sm",
								"aria-label": T("detail.snippetFormat"),
								className: lh,
								children: O.map((e) => /* @__PURE__ */ C(ch.Item, {
									id: e.id,
									className: uh,
									children: b(e)
								}, e.id))
							}), O.map((e) => /* @__PURE__ */ C(ch.Panel, {
								id: e.id,
								children: /* @__PURE__ */ C(jm, {
									title: `ichava — ${b(e)}`,
									code: ve,
									onCopy: () => g(ve, T("detail.copied", { label: b(e) }))
								})
							}, e.id))]
						})
					}),
					xe && z.custom && /* @__PURE__ */ w("div", {
						className: "flex flex-col gap-[5px]",
						children: [/* @__PURE__ */ C("textarea", {
							value: ue,
							onChange: (e) => V(e.target.value),
							spellCheck: !1,
							placeholder: "[ { \"transform\": \"rotate(0deg)\" }, { \"transform\": \"rotate(360deg)\" } ]",
							"aria-label": T("detail.keyframesAria"),
							style: {
								width: "100%",
								height: 120,
								resize: "vertical",
								padding: 10,
								border: `1px solid ${pe ? "var(--console-border)" : "var(--danger)"}`,
								borderRadius: "calc(var(--radius) - 2px)",
								background: "var(--console-bg)",
								color: "var(--console-fg)",
								fontFamily: "'Geist Mono',monospace",
								fontSize: 11,
								lineHeight: 1.6
							}
						}), /* @__PURE__ */ C("span", {
							style: {
								fontSize: 10,
								color: pe ? "var(--muted-fg)" : "var(--danger)"
							},
							children: pe ? T("detail.keyframesValid", { n: pe.length }) : T("detail.keyframesInvalid")
						})]
					}),
					_e.length > 0 && /* @__PURE__ */ w("div", {
						className: "flex flex-col gap-[5px]",
						children: [/* @__PURE__ */ C("span", {
							className: "text-[11px] font-semibold text-[var(--muted-fg)]",
							children: T("detail.related")
						}), /* @__PURE__ */ C("div", {
							className: "flex gap-[5px]",
							children: _e.map((e) => /* @__PURE__ */ C("button", {
								onClick: () => a(e.id),
								title: e.name,
								className: "w-[38px] h-[38px] flex-none flex items-center justify-center border border-[var(--border)] rounded-[calc(var(--radius)_-_2px)] bg-[var(--card)] cursor-pointer",
								children: /* @__PURE__ */ C(wp, {
									icon: e,
									size: 20
								})
							}, e.id))
						})]
					}),
					/* @__PURE__ */ w("div", {
						className: "flex flex-col gap-1",
						children: [/* @__PURE__ */ C("span", {
							className: "text-[11px] font-semibold text-[var(--muted-fg)]",
							children: T("detail.addToCollection")
						}), /* @__PURE__ */ w("div", {
							className: "flex flex-wrap gap-[5px]",
							children: [l.map((t) => {
								let n = t.icons.includes(U.id);
								return /* @__PURE__ */ w("button", {
									"aria-pressed": n,
									onClick: () => {
										n ? m(t.id, U.id) : u(t.id, U.id), e.getState().showToast(T(n ? "detail.removedFrom" : "detail.addedTo", { name: t.name }), "folder");
									},
									style: {
										height: 24,
										padding: "0 9px",
										border: `1px solid ${n ? "var(--accent)" : "var(--border)"}`,
										borderRadius: 12,
										backgroundColor: n ? "var(--accent-soft)" : "var(--bg)",
										color: n ? "var(--accent)" : "var(--fg)",
										fontSize: 11,
										cursor: "pointer",
										display: "inline-flex",
										alignItems: "center"
									},
									children: [n && /* @__PURE__ */ C(K, {
										name: "check",
										size: 10,
										color: "currentColor",
										style: { marginInlineEnd: 4 }
									}), t.name]
								}, t.id);
							}), /* @__PURE__ */ C("button", {
								onClick: () => e.getState().openLibrary("collections"),
								className: "h-6 py-0 px-[9px] border border-dashed border-[var(--border)] rounded-[12px] bg-transparent text-[var(--muted-fg)] text-[11px] cursor-pointer",
								children: T("detail.newCollection")
							})]
						})]
					})
				]
			})]
		})]
	});
}
var ph = ({ children: e }) => /* @__PURE__ */ C("span", {
	className: "font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--muted-fg)] min-w-12 text-right",
	children: e
});
function mh({ label: e, children: t }) {
	return /* @__PURE__ */ w("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ C("span", {
			className: "text-[11px] font-semibold text-[var(--muted-fg)] flex-none",
			children: e
		}), t]
	});
}
function hh({ name: e, title: t, onClick: n }) {
	return /* @__PURE__ */ C(Ts, {
		content: t,
		children: /* @__PURE__ */ C("button", {
			onClick: n,
			"aria-label": t,
			className: "w-[26px] h-[26px] border border-[var(--border)] bg-[var(--bg)] shadow-[var(--shadow)] rounded-[6px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]",
			children: /* @__PURE__ */ C(K, {
				name: e,
				size: 12,
				color: "currentColor"
			})
		})
	});
}
var gh = {
	alignSelf: "flex-start",
	height: 28,
	display: "flex",
	alignItems: "center",
	gap: 6,
	padding: "0 8px",
	border: "1px solid var(--border)",
	borderRadius: "calc(var(--radius) - 3px)",
	backgroundColor: "var(--bg)",
	cursor: "pointer",
	color: "var(--fg)",
	fontSize: 11.5
}, _h = ({ keys: e, withThen: t, className: r, size: i = "md" }) => /* @__PURE__ */ C("div", {
	className: Z("flex items-center gap-x-1", r),
	children: e.map((e, r) => /* @__PURE__ */ w(n, { children: [r !== 0 && /* @__PURE__ */ w("div", {
		className: "flex items-center gap-x-1 text-quaternary",
		children: [t && /* @__PURE__ */ C("span", {
			className: "text-sm font-medium",
			children: "then"
		}), /* @__PURE__ */ C(li, {
			size: 16,
			strokeWidth: 2.2
		})]
	}), /* @__PURE__ */ C("kbd", {
		className: Z("min-w-6 rounded-[4px] bg-secondary_alt px-1 py-0.5 text-center font-medium text-tertiary ring-1 ring-secondary ring-inset", i === "sm" ? "font-mono text-[10.5px]" : "text-sm"),
		children: e.toUpperCase()
	})] }, r))
}), vh = ({ placeholder: e, shortcutKeys: t, tooltip: n, className: r, ...i }) => /* @__PURE__ */ w(F, {
	className: ({ isFocusWithin: e }) => Z("flex items-center gap-x-2 rounded-xl bg-primary p-4", e && "outline-2 outline-focus-ring", r),
	children: [
		/* @__PURE__ */ C("div", {
			className: "pointer-events-none absolute",
			children: /* @__PURE__ */ C(Zi, { className: "size-5 text-fg-quaternary" })
		}),
		/* @__PURE__ */ C(L, {
			placeholder: e,
			className: "m-0 w-full bg-transparent pl-7 text-md text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary",
			...i
		}),
		n && /* @__PURE__ */ C(qo, {
			title: n,
			placement: "top",
			children: /* @__PURE__ */ C(Jo, {
				className: "cursor-pointer text-fg-quaternary transition duration-200 hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover",
				children: /* @__PURE__ */ C(Ni, { className: "size-4 stroke-[2.25px]" })
			})
		}),
		t && /* @__PURE__ */ C(_h, { keys: t })
	]
}), yh = (e) => /* @__PURE__ */ w("div", {
	className: "flex h-7 min-w-7 items-center justify-between rounded-lg bg-primary p-1.5 ring-1 ring-secondary ring-inset",
	children: [e.type === "icon" && /* @__PURE__ */ C(e.icon, {
		strokeWidth: 2.4,
		className: "size-4 text-fg-quaternary"
	}), e.type === "text" && /* @__PURE__ */ C("span", {
		className: "text-sm font-semibold text-fg-quaternary",
		children: e.label
	})]
}), bh = ({ className: e }) => /* @__PURE__ */ w("footer", {
	className: Z("absolute inset-x-0 bottom-0 flex items-center justify-between gap-x-3 bg-alpha-white/80 p-2 pl-4.5 ring-1 ring-secondary_alt backdrop-blur-lg max-md:hidden", e),
	children: [/* @__PURE__ */ w("div", {
		className: "flex gap-4",
		children: [
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ w("div", {
					className: "flex gap-1.5",
					children: [/* @__PURE__ */ C(yh, {
						type: "icon",
						icon: ui
					}), /* @__PURE__ */ C(yh, {
						type: "icon",
						icon: si
					})]
				}), /* @__PURE__ */ C("span", {
					className: "text-sm font-semibold text-quaternary",
					children: "to navigate"
				})]
			}),
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ C(yh, {
					type: "icon",
					icon: Si
				}), /* @__PURE__ */ C("span", {
					className: "text-sm font-semibold text-quaternary",
					children: "to select"
				})]
			}),
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ C(yh, {
					type: "text",
					label: "esc"
				}), /* @__PURE__ */ C("span", {
					className: "text-sm font-semibold text-quaternary",
					children: "to close"
				})]
			}),
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ C(yh, {
					type: "icon",
					icon: ci
				}), /* @__PURE__ */ C("span", {
					className: "text-sm font-semibold text-quaternary",
					children: "return to parent"
				})]
			})
		]
	}), /* @__PURE__ */ C(Q, {
		size: "sm",
		color: "tertiary",
		iconLeading: $i
	})]
}), xh = ({ children: e, className: t }) => /* @__PURE__ */ C(I, {
	className: Z("flex px-4.5 pt-2 text-xs font-semibold text-tertiary", t),
	children: e
});
// src/components/application/command-menus/base-components/command-menu-item.tsx
function Sh(e, t) {
	let n = new Set(t);
	return Object.fromEntries(Object.entries(e).filter(([e]) => !n.has(e)));
}
var Ch = ({ label: e, children: t, description: n, stacked: r, shortcutKeys: i, className: a, size: o = "md", ...s }) => {
	let c = o === "sm";
	return /* @__PURE__ */ C(B, {
		...Sh(s, [
			"type",
			"icon",
			"alt",
			"src"
		]),
		textValue: e,
		className: (e) => Z("group block cursor-pointer px-2 py-0.5 outline-hidden", typeof a == "function" ? a(e) : a),
		children: (a) => /* @__PURE__ */ w("div", {
			className: Z("relative flex min-h-10 items-center justify-between rounded-lg px-2.5 py-2 pl-2.5 outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover", c && "min-h-8 rounded-md px-2 py-1 pl-2", a.isSelected && "bg-primary_hover", a.isFocusVisible && "outline-2 outline-offset-2", r && "items-start p-2.5 pl-3.5"),
			children: [
				s.type === "icon" && !r && /* @__PURE__ */ C(s.icon, { className: Z("mr-2 text-fg-quaternary", c ? "size-4" : "size-5") }),
				s.type === "icon" && r && /* @__PURE__ */ C(dc, {
					color: "gray",
					size: "md",
					theme: "modern",
					icon: s.icon,
					className: "mr-2"
				}),
				s.type === "avatar" && /* @__PURE__ */ C(os, {
					alt: s.alt,
					src: s.src,
					size: r ? "md" : "xs",
					className: "mr-2"
				}),
				s.type === "dot" && /* @__PURE__ */ C("svg", {
					width: "10",
					height: "10",
					viewBox: "0 0 10 10",
					fill: "none",
					className: Z("mr-2 shrink-0 text-fg-success-secondary", r && "mt-2 self-start"),
					children: /* @__PURE__ */ C("circle", {
						cx: "5",
						cy: "5",
						r: "4",
						fill: "currentColor"
					})
				}),
				/* @__PURE__ */ w("div", {
					className: Z("flex flex-1 gap-x-1.5", r && "flex-col"),
					children: [/* @__PURE__ */ w(Oe, {
						slot: "label",
						className: Z("font-medium text-primary", c ? "text-[12.5px]" : "text-sm", i && "flex flex-1 items-center justify-between gap-2"),
						children: [
							/* @__PURE__ */ C("span", { children: typeof t == "function" ? t(a) : t || e }),
							i && " ",
							i && /* @__PURE__ */ C(_h, {
								keys: i,
								size: o
							})
						]
					}), n && /* @__PURE__ */ C(Oe, {
						slot: "description",
						className: Z("text-tertiary", c ? "font-mono text-[10.5px]" : "text-sm"),
						children: n
					})]
				})
			]
		})
	});
}, wh = i({
	hasFooter: !1,
	flatItems: [],
	selectedKeys: /* @__PURE__ */ new Set(),
	setSelectedKeys: () => {}
}), Th = ({ items: e, children: n, dialogClassName: r, overlayClassName: i, filter: a, inputValue: o, defaultItems: s, onInputChange: c, onSelectionChange: l, sensitivity: u = "base", placeholder: m = "Search", defaultSelectedKeys: h, shortcut: g = "⌘/", dialogLabel: _ = "Command menu", inputLabel: v = "Search", listLabel: y = "Command menu results", ...b }) => {
	let x = f(null), { contains: S } = Re({ sensitivity: u }), [E, D] = p(h ?? /* @__PURE__ */ new Set()), O = e ?? s, ee = (O ?? []).reduce((e, t) => [...e, ...t.items], []), te = d(() => {
		let e = !1;
		return t.forEach(n, (t) => {
			t && typeof t == "object" && "type" in t && t.type === bh && (e = !0);
		}), e;
	}, [n]);
	return /* @__PURE__ */ C(wh.Provider, {
		value: {
			hasFooter: te,
			flatItems: ee,
			selectedKeys: E,
			setSelectedKeys: D,
			onSelectionChange: l,
			items: O,
			listLabel: y,
			...b
		},
		children: /* @__PURE__ */ C(Eh, {
			"aria-label": _,
			isOpen: b.isOpen,
			onOpenChange: b.onOpenChange,
			className: i,
			dialogClassName: r,
			children: /* @__PURE__ */ w(T, {
				inputValue: o,
				onInputChange: c,
				filter: a === !1 ? void 0 : a || S,
				children: [/* @__PURE__ */ C(ke, {
					"aria-label": v,
					children: /* @__PURE__ */ C(vh, {
						autoFocus: !0,
						role: "combobox",
						"aria-expanded": !0,
						shortcutKeys: g ? [g] : void 0,
						placeholder: m,
						ref: x,
						className: "relative outline-hidden! after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-border-secondary"
					})
				}), n]
			})
		})
	});
}, Eh = ({ className: e, dialogClassName: t, children: n, "aria-label": r = "Command menu", ...i }) => /* @__PURE__ */ C(V, {
	...i,
	isDismissable: !0,
	className: (t) => Z("fixed inset-0 z-50 flex min-h-full items-start justify-center overflow-y-auto bg-overlay/70 p-4 text-center backdrop-blur md:pt-16 xl:pt-[clamp(64px,10vh,243px)]", t.isEntering && "duration-300 ease-out animate-in fade-in", t.isExiting && "duration-200 ease-in animate-out fade-out", typeof e == "function" ? e(t) : e),
	children: (e) => /* @__PURE__ */ C(ue, {
		className: (e) => Z("flex max-h-full w-160 flex-col overflow-hidden rounded-xl bg-primary text-left align-middle shadow-xl", e.isEntering && "duration-300 ease-out animate-in zoom-in-95", e.isExiting && "duration-200 ease-in animate-out zoom-out-95", typeof t == "function" ? t(e) : t),
		children: /* @__PURE__ */ C(A, {
			"aria-label": r,
			className: "relative flex min-h-0 flex-1 flex-col outline-hidden",
			children: typeof n == "function" ? n(e) : n
		})
	})
}), Dh = ({ className: e, selectionMode: t = "single", ...n }) => {
	let { hasFooter: r, emptyState: i, listLabel: a, ...o } = s(wh);
	return /* @__PURE__ */ C(ie, {
		"aria-label": a,
		...n,
		...o,
		renderEmptyState: () => i,
		selectionMode: t,
		onSelectionChange: (e) => {
			o.onSelectionChange?.(e), o.setSelectedKeys(e);
		},
		className: (t) => Z("flex max-h-106 flex-1 scroll-py-10 flex-col gap-2 overflow-auto focus:outline-hidden", r && "scroll-pb-22 pb-13", !t.isEmpty && "pt-2", typeof e == "function" ? e(t) : e)
	});
}, Oh = ({ title: e, children: t, items: n, ...r }) => /* @__PURE__ */ w(ae, {
	...r,
	className: Z("border-b border-secondary pb-2 last:border-transparent", r.className),
	children: [e && /* @__PURE__ */ C(xh, {
		className: "pb-1",
		children: e
	}, e), /* @__PURE__ */ C(ee, {
		items: n,
		children: t
	})]
}), kh = ({ children: e, asChild: t, ...r }) => {
	let { selectedKeys: i } = s(wh), a = Array.from(i);
	if (!a.length) return null;
	let o = a.at(0);
	return t ? /* @__PURE__ */ C(n, { children: typeof e == "function" ? e({ selectedId: o }) : e }) : /* @__PURE__ */ C("div", {
		...r,
		children: typeof e == "function" ? e({ selectedId: o }) : e
	});
}, Ah = ({ className: e, ...t }) => /* @__PURE__ */ C("div", {
	...t,
	className: Z("min-h-0 flex-1", e)
}), jh = Th;
jh.Item = Ch, jh.List = Dh, jh.Group = Ah, jh.Footer = bh, jh.Preview = kh, jh.Section = Oh, jh.Trigger = j, jh.Collection = ee;
// src/components/command/CommandPalette.tsx
function Mh() {
	let e = Yr(), t = Ue(), { catalog: n, page: r } = Pc(), i = G((e) => e.closeLayer), [a, o] = p(""), [s, c] = p(Ph), l = _c(), u = q(), f = G((e) => e.config?.limits) ?? W.limits, m = e.getState(), h = d(() => [
		{
			id: "theme",
			label: u("palette.toggleTheme"),
			icon: "moon",
			kbd: `${l}T`,
			run: () => m.toggleTheme()
		},
		{
			id: "settings",
			label: u("palette.openSettings"),
			icon: "settings",
			kbd: `${l},`,
			run: () => m.openLayer("settings")
		},
		{
			id: "favorites",
			label: u("palette.openFavorites"),
			icon: "heart",
			kbd: `${l}1`,
			run: () => m.openLibrary("favorites")
		},
		{
			id: "history",
			label: u("palette.openHistory"),
			icon: "clock",
			kbd: `${l}2`,
			run: () => m.openLibrary("history")
		},
		{
			id: "collections",
			label: u("palette.openCollections"),
			icon: "folder",
			kbd: `${l}3`,
			run: () => m.openLibrary("collections")
		},
		{
			id: "view",
			label: m.view === "grid" ? u("palette.switchListView") : u("palette.switchGridView"),
			icon: m.view === "grid" ? "list" : "grid",
			kbd: "",
			run: () => m.setView(m.view === "grid" ? "list" : "grid")
		},
		{
			id: "reset",
			label: u("palette.resetFilters"),
			icon: "refresh",
			kbd: vc(l),
			run: () => m.openConfirm({
				title: u("toolbar.resetTitle"),
				body: u("toolbar.resetBody"),
				confirmLabel: u("toolbar.resetConfirm"),
				danger: !0,
				onConfirm: () => {
					m.resetFilters(), m.showToast(u("toolbar.resetToast"), "refresh");
				}
			})
		},
		{
			id: "selectAll",
			label: u("palette.selectAll"),
			icon: "check",
			kbd: `${l}A`,
			run: () => Kr(e, t)
		},
		...m.config?.features.devtools === !1 ? [] : [{
			id: "devtools",
			label: u("palette.openDevtools"),
			icon: "zap",
			kbd: `${l}D`,
			run: () => m.toggleDevtools()
		}]
	], [
		l,
		m,
		u,
		e,
		t
	]), g = a.trim().toLowerCase(), _ = g ? h.filter((e) => e.label.toLowerCase().includes(g)) : [...h].sort((e, t) => Ih(s, e.id) - Ih(s, t.id)), v = d(() => g ? (n ? n.icons : r.items).filter((e) => `${e.name} ${e.id} ${(e.tags ?? []).join(" ")}`.toLowerCase().includes(g)).slice(0, f.paletteIconResults) : [], [
		g,
		n,
		r,
		f.paletteIconResults
	]), y = new Map(_.map((e) => [`a:${e.id}`, e])), b = new Map(v.map((e) => [`i:${e.id}`, e])), x = d(() => v.map((e) => {
		let t = ({ className: t }) => /* @__PURE__ */ C("span", {
			className: Z("inline-flex items-center justify-center", t),
			children: /* @__PURE__ */ C(Lh, { icon: e })
		}), n = /* @__PURE__ */ w(S, { children: [
			e.name,
			" ",
			/* @__PURE__ */ C("span", {
				className: "ms-1 font-mono text-[10.5px] font-normal text-tertiary",
				children: Mp(e)
			})
		] });
		return {
			id: `i:${e.id}`,
			type: "icon",
			icon: t,
			label: e.name,
			children: n,
			size: "sm"
		};
	}), [v]), T = [];
	return _.length && T.push({
		id: "actions",
		title: !g && s.length ? u("palette.recent") : u("palette.actions"),
		items: _.map((e) => ({
			id: `a:${e.id}`,
			type: "icon",
			icon: oc(e.icon),
			label: e.label,
			shortcutKeys: e.kbd ? [e.kbd] : void 0,
			size: "sm"
		}))
	}), x.length && T.push({
		id: "icons",
		title: u("palette.icons"),
		items: x
	}), /* @__PURE__ */ w(jh, {
		isOpen: !0,
		onOpenChange: (e) => !e && i(),
		items: T,
		filter: !1,
		inputValue: a,
		onInputChange: o,
		onAction: (t) => {
			let n = b.get(String(t));
			if (n) {
				m.openDetail(n.id);
				return;
			}
			let r = y.get(String(t));
			if (!r) return;
			let a = [r.id, ...s.filter((e) => e !== r.id)].slice(0, f.recentCommandsCap);
			c(a), Fh(a), r.run(), e.getState().layer === "palette" && i();
		},
		shortcut: null,
		placeholder: u("palette.placeholder"),
		inputLabel: u("palette.placeholder"),
		dialogLabel: u("header.commandPalette"),
		listLabel: u("palette.results"),
		overlayClassName: "z-(--z-overlay)",
		dialogClassName: "w-[560px] max-w-[94vw] bg-[var(--surface)] text-[length:var(--app-font,13.5px)]",
		emptyState: /* @__PURE__ */ C("div", {
			className: "p-6 text-center text-[12px] text-[var(--muted-fg)]",
			children: u("palette.noMatches", { q: a })
		}),
		children: [/* @__PURE__ */ C(jh.Group, { children: /* @__PURE__ */ C(jh.List, {
			selectionMode: "none",
			children: (e) => /* @__PURE__ */ C(jh.Section, {
				...e,
				children: (e) => /* @__PURE__ */ C(jh.Item, { ...e }, e.id)
			})
		}) }), /* @__PURE__ */ w("div", {
			className: "flex items-center gap-2.5 border-t border-secondary px-3.5 py-2 text-[10.5px] text-[var(--muted-fg)]",
			children: [
				/* @__PURE__ */ w("span", { children: [
					/* @__PURE__ */ C("b", { children: "↑↓" }),
					" ",
					u("palette.navigate")
				] }),
				/* @__PURE__ */ C("span", {
					"aria-hidden": !0,
					children: "·"
				}),
				/* @__PURE__ */ w("span", { children: [
					/* @__PURE__ */ C("b", { children: "↵" }),
					" ",
					u("palette.select")
				] }),
				/* @__PURE__ */ C("span", {
					"aria-hidden": !0,
					children: "·"
				}),
				/* @__PURE__ */ w("span", { children: [
					/* @__PURE__ */ C("b", { children: "esc" }),
					" ",
					u("palette.close")
				] })
			]
		})]
	});
}
var Nh = new or(W.storageKeys.paletteRecent);
function Ph() {
	let e = Nh.read();
	return Array.isArray(e) ? e : [];
}
function Fh(e) {
	Nh.write(e);
}
function Ih(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? 99 : n;
}
function Lh({ icon: e }) {
	let t = !!(e.svgUrl || e.svgContent), n = Sp(e);
	return !t || n?.body === "" ? /* @__PURE__ */ C("span", {
		"data-role": "preview-fallback",
		className: "inline-flex",
		children: /* @__PURE__ */ C(K, {
			name: "cube",
			size: 16,
			color: "var(--muted-fg)"
		})
	}) : /* @__PURE__ */ C(wp, {
		icon: e,
		size: 16,
		inline: !0
	});
}
// src/components/base/form/form.tsx
var Rh = (e) => /* @__PURE__ */ C(P, { ...e });
Rh.displayName = "Form";
// src/components/library/LibraryDialog.tsx
var zh = [
	{
		id: "favorites",
		key: "library.favorites"
	},
	{
		id: "history",
		key: "library.history"
	},
	{
		id: "collections",
		key: "library.collections"
	}
];
function Bh() {
	let e = Yr(), t = q(), n = G((e) => e.closeLayer), r = G((e) => e.libTab), i = G((e) => e.locale), a = (t) => e.setState({ libTab: t });
	return /* @__PURE__ */ C(Dm, {
		showClose: !1,
		onClose: n,
		width: 620,
		panelStyle: { height: 460 },
		children: /* @__PURE__ */ C(re, {
			locale: i,
			children: /* @__PURE__ */ w(ch, {
				selectedKey: r,
				onSelectionChange: (e) => a(e),
				keyboardActivation: "automatic",
				className: "min-h-0 flex-1",
				children: [
					/* @__PURE__ */ w("div", {
						className: "flex items-center gap-2 py-2.5 px-3.5 border-b border-b-[var(--border)]",
						children: [
							/* @__PURE__ */ C(ch.List, {
								type: "button-border",
								size: "sm",
								className: lh,
								children: zh.map((e) => /* @__PURE__ */ C(ch.Item, {
									id: e.id,
									className: `${uh} px-3 text-[11.5px]`,
									children: t(e.key)
								}, e.id))
							}),
							/* @__PURE__ */ C("span", { className: "flex-1" }),
							/* @__PURE__ */ C("button", {
								onClick: n,
								title: `${t("common.close")} — Esc`,
								"aria-label": t("common.close"),
								className: "w-[26px] h-[26px] border border-[var(--border)] bg-[var(--bg)] shadow-[var(--shadow)] rounded-[6px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]",
								children: /* @__PURE__ */ C(K, {
									name: "close",
									size: 12,
									color: "currentColor"
								})
							})
						]
					}),
					/* @__PURE__ */ C(ch.Panel, {
						id: "favorites",
						className: "flex-1 overflow-y-auto p-3",
						children: /* @__PURE__ */ C(Uh, {})
					}),
					/* @__PURE__ */ C(ch.Panel, {
						id: "history",
						className: "flex-1 overflow-y-auto p-3",
						children: /* @__PURE__ */ C(Wh, {})
					}),
					/* @__PURE__ */ C(ch.Panel, {
						id: "collections",
						className: "flex-1 overflow-y-auto p-3",
						children: /* @__PURE__ */ C(Gh, {})
					})
				]
			})
		})
	});
}
function Vh({ icon: e, text: t }) {
	return /* @__PURE__ */ C(fc, {
		icon: e,
		title: t,
		className: "h-full"
	});
}
var Hh = {
	height: 24,
	padding: "0 8px",
	border: "1px solid var(--border)",
	borderRadius: "calc(var(--radius) - 3px)",
	backgroundColor: "var(--bg)",
	color: "var(--fg)",
	fontSize: 11,
	cursor: "pointer"
};
function Uh() {
	let e = G((e) => e.favorites), t = G((e) => e.toggleFavorite), n = G((e) => e.openDetail), r = q(), { icons: i } = Cm(e);
	return i.length ? /* @__PURE__ */ C("div", {
		className: "grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2",
		children: i.map((e) => e && /* @__PURE__ */ w("div", {
			role: "button",
			tabIndex: 0,
			"aria-label": e.name,
			onClick: () => n(e.id),
			onKeyDown: (t) => {
				(t.key === "Enter" || t.key === " ") && (t.preventDefault(), n(e.id));
			},
			className: "relative flex flex-col items-center justify-center gap-1.5 aspect-[1_/_0.9] border border-[var(--border)] rounded-[var(--radius)] cursor-pointer",
			children: [
				/* @__PURE__ */ C("button", {
					onClick: (n) => {
						n.stopPropagation(), t(e.id);
					},
					title: r("common.remove"),
					className: "absolute top-1 end-1 w-[22px] h-[22px] border border-[var(--border)] bg-[var(--pop)] rounded-[6px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]",
					children: /* @__PURE__ */ C(K, {
						name: "close",
						size: 11,
						color: "currentColor"
					})
				}),
				/* @__PURE__ */ C(wp, {
					icon: e,
					size: 24
				}),
				/* @__PURE__ */ C("span", {
					className: "text-[10px] text-[var(--muted-fg)] max-w-[90%] whitespace-nowrap overflow-hidden text-ellipsis",
					children: e.name
				})
			]
		}, e.id))
	}) : /* @__PURE__ */ C(Vh, {
		icon: "heart",
		text: r("library.emptyFavorites")
	});
}
function Wh() {
	let e = G((e) => e.history), t = G((e) => e.clearHistory), n = G((e) => e.openDetail), r = q(), { icons: i } = Cm(e.map((e) => e.id)), a = new Map(i.map((e) => [e.id, e]));
	return e.length ? /* @__PURE__ */ w("div", {
		className: "flex flex-col",
		children: [e.map((e, t) => {
			let r = a.get(e.id);
			return /* @__PURE__ */ w("div", {
				role: "button",
				tabIndex: 0,
				onClick: () => n(e.id),
				onKeyDown: (t) => {
					(t.key === "Enter" || t.key === " ") && (t.preventDefault(), n(e.id));
				},
				className: "flex items-center gap-2.5 h-[38px] border-b border-b-[var(--border)] cursor-pointer",
				children: [
					r && /* @__PURE__ */ C(wp, {
						icon: r,
						size: 16
					}),
					/* @__PURE__ */ C("span", {
						className: "text-[12.5px] font-medium min-w-[120px]",
						children: r?.name ?? e.id
					}),
					/* @__PURE__ */ C("span", {
						className: "text-[11px] text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-1.5",
						children: e.action
					}),
					/* @__PURE__ */ C("span", { className: "flex-1" }),
					/* @__PURE__ */ C("span", {
						className: "font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--faint-fg)]",
						children: yc(e.ts)
					})
				]
			}, `${e.id}-${e.action}-${t}`);
		}), /* @__PURE__ */ C("button", {
			onClick: t,
			className: "self-start mt-2.5 h-[26px] py-0 px-2.5 border border-[var(--border)] rounded-[calc(var(--radius)_-_3px)] bg-transparent text-[var(--muted-fg)] text-[11.5px] cursor-pointer",
			children: r("library.clearHistory")
		})]
	}) : /* @__PURE__ */ C(Vh, {
		icon: "clock",
		text: r("library.emptyHistory")
	});
}
function Gh() {
	let e = G((e) => e.collections), t = G((e) => e.createCollection), n = G((e) => e.openAccess), r = q(), [i, a] = p("");
	return /* @__PURE__ */ w(S, { children: [
		/* @__PURE__ */ w(Rh, {
			onSubmit: (e) => {
				e.preventDefault(), t(i), a("");
			},
			style: {
				display: "flex",
				gap: 6,
				marginBottom: 12
			},
			children: [/* @__PURE__ */ C($o, {
				size: "sm",
				value: i,
				onChange: a,
				placeholder: r("library.newCollectionPlaceholder"),
				"aria-label": r("library.newCollectionPlaceholder"),
				className: "flex-1"
			}), /* @__PURE__ */ C("button", {
				type: "submit",
				className: "flex-none py-0 px-3 border-0 rounded-[calc(var(--radius)_-_2px)] bg-[var(--accent)] text-[var(--accent-fg)] text-[12px] font-semibold cursor-pointer",
				children: r("common.create")
			})]
		}),
		e.length === 0 && /* @__PURE__ */ C(Vh, {
			icon: "folder",
			text: r("library.emptyCollections")
		}),
		/* @__PURE__ */ C("div", {
			className: "flex flex-col gap-1.5",
			children: e.map((e) => /* @__PURE__ */ C(Kh, {
				c: e,
				onManageAccess: () => n(e.id)
			}, e.id))
		})
	] });
}
function Kh({ c: e, onManageAccess: t }) {
	let n = G((e) => e.removeCollection), r = G((e) => e.removeFromCollection), i = G((e) => e.openDetail), a = dl(), o = q(), { icons: s } = Cm(e.icons), c = new Map(s.map((e) => [e.id, e]));
	return /* @__PURE__ */ w("div", {
		className: "border border-[var(--border)] rounded-[var(--radius)] overflow-hidden",
		children: [/* @__PURE__ */ w("div", {
			className: "flex items-center gap-2 py-2.5 px-3",
			children: [
				/* @__PURE__ */ C(K, {
					name: "folder",
					size: 14,
					color: "var(--accent-text)"
				}),
				/* @__PURE__ */ C("span", {
					className: "text-[12.5px] font-[550]",
					children: e.name
				}),
				/* @__PURE__ */ C("span", {
					className: "font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--muted-fg)]",
					children: o("library.iconCount", { n: e.icons.length })
				}),
				e.shared && /* @__PURE__ */ C("span", {
					className: "text-[9px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-[5px]",
					children: o("library.teamBadge")
				}),
				e.shared && e.role === "viewer" && /* @__PURE__ */ C("span", {
					className: "text-[9px] font-semibold text-[var(--faint-fg)] border border-[var(--border)] rounded-[4px] py-[1px] px-[5px]",
					children: o("library.viewerBadge")
				}),
				e.shared && (e.sharedWith ?? []).length > 0 && /* @__PURE__ */ C("div", {
					className: "flex",
					children: (e.sharedWith ?? []).slice(0, 3).map((e, t) => /* @__PURE__ */ C("div", {
						style: {
							width: 18,
							height: 18,
							borderRadius: "50%",
							marginLeft: t === 0 ? 0 : -6,
							border: "2px solid var(--pop)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 7.5,
							fontWeight: 700,
							color: "#fff",
							background: [
								"#7c3aed",
								"#0891b2",
								"#059669"
							][t % 3]
						},
						children: e.initials
					}, e.initials))
				}),
				/* @__PURE__ */ C("span", { className: "flex-1" }),
				/* @__PURE__ */ C("button", {
					onClick: t,
					title: o("shared.manageAccess"),
					style: Hh,
					children: o("shared.manageAccess")
				}),
				/* @__PURE__ */ C("button", {
					onClick: () => {
						a(s.map(Kt).join("\n"), o("toolbar.namesCopied", { n: e.icons.length }));
					},
					title: o("library.copyNamesTitle"),
					style: Hh,
					children: o("toolbar.copyNames")
				}),
				/* @__PURE__ */ C("button", {
					onClick: () => n(e.id),
					title: o("library.deleteCollection"),
					className: "w-[26px] h-[26px] border border-[var(--border)] bg-[var(--pop)] rounded-[6px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]",
					children: /* @__PURE__ */ C(K, {
						name: "trash",
						size: 13,
						color: "currentColor"
					})
				})
			]
		}), e.icons.length > 0 && /* @__PURE__ */ C("div", {
			className: "flex flex-wrap gap-1.5 border-t border-t-[var(--border)] py-2.5 px-3 mt-0 mx-3 mb-2.5",
			children: e.icons.map((t) => {
				let n = c.get(t);
				return n ? /* @__PURE__ */ w("div", {
					role: "button",
					tabIndex: 0,
					"aria-label": n.name,
					onClick: () => i(t),
					onKeyDown: (e) => {
						(e.key === "Enter" || e.key === " ") && (e.preventDefault(), i(t));
					},
					title: n.name,
					className: "relative w-[38px] h-[38px] border border-[var(--border)] rounded-[6px] bg-[var(--card)] flex items-center justify-center cursor-pointer",
					children: [/* @__PURE__ */ C(wp, {
						icon: n,
						size: 18
					}), /* @__PURE__ */ C("button", {
						onClick: (n) => {
							n.stopPropagation(), r(e.id, t);
						},
						title: o("common.remove"),
						className: "absolute -top-[5px] -end-[5px] w-[15px] h-[15px] border border-[var(--border)] bg-[var(--pop)] rounded-full flex items-center justify-center cursor-pointer text-[var(--muted-fg)]",
						children: /* @__PURE__ */ C(K, {
							name: "close",
							size: 7,
							color: "currentColor"
						})
					})]
				}, t) : null;
			})
		})]
	});
}
// src/components/application/modal-layouts/modal-layouts.tsx
var qh = ({ icon: e, title: t, description: n, align: r = "start", className: i }) => /* @__PURE__ */ w("div", {
	className: Z("flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6", r === "center" && "items-center text-center", i),
	children: [e, /* @__PURE__ */ w("div", {
		className: Z("flex flex-col gap-0.5", r === "center" && "items-center"),
		children: [/* @__PURE__ */ C(ne, {
			slot: "title",
			className: "text-md font-semibold text-primary",
			children: t
		}), n && /* @__PURE__ */ C("div", {
			className: "text-sm text-tertiary",
			children: n
		})]
	})]
}), Jh = ({ children: e, className: t }) => /* @__PURE__ */ C("div", {
	className: Z("flex flex-col gap-4 px-4 pt-5 sm:px-6", t),
	children: e
}), Yh = ({ children: e, layout: t = "stack", className: n }) => /* @__PURE__ */ C("div", {
	className: Z("flex gap-3 p-4 pt-6 sm:px-6 sm:pt-8 sm:pb-6", t === "stack" && "flex-col *:grow", t === "row" && "flex-col-reverse sm:flex-row sm:items-center sm:justify-end", t === "grid" && "flex-col-reverse *:grow sm:grid sm:grid-cols-2", n),
	children: e
});
// src/components/settings/SettingsDialog.tsx
function Xh() {
	let e = q(), t = G((e) => e.closeLayer), n = G((e) => e.filters.perPage), r = G((e) => e.setPerPage), i = G((e) => e.copyFormat), a = G((e) => e.setCopyFormat), o = G((e) => e.factoryReset), s = G((e) => e.showToast), c = G((e) => e.openLayer), l = G((e) => e.openConfirm), u = G((e) => e.config), d = G((e) => e.storageDriver), f = G((e) => e.setStorageDriver), p = G((e) => e.startTour), m = G((e) => e.auth.status === "authed"), h = G((e) => e.auth.user), g = G((e) => e.openAuth), _ = u?.ui.perPageOptions ?? W.ui.perPageOptions, v = u?.toolbar.copyFormats ?? W.toolbar.copyFormats, y = h ?? (u ? {
		name: u.user.name,
		initials: u.user.initials,
		email: u.user.email,
		plan: u.user.plan
	} : null);
	return /* @__PURE__ */ w(Dm, {
		onClose: t,
		width: 480,
		label: e("header.settings"),
		panelStyle: { overflowY: "auto" },
		children: [
			/* @__PURE__ */ C(qh, { title: e("header.settings") }),
			/* @__PURE__ */ w(Jh, {
				className: "gap-3.5 pb-4",
				children: [
					/* @__PURE__ */ w("div", {
						className: "flex items-center gap-2.5 py-2.5 px-3 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--muted2)]",
						children: [/* @__PURE__ */ C("div", {
							className: "w-[26px] h-[26px] flex-none rounded-[7px] bg-[var(--accent-soft)] flex items-center justify-center",
							children: /* @__PURE__ */ C(K, {
								name: "palette",
								size: 13,
								color: "var(--accent-text)"
							})
						}), /* @__PURE__ */ w("div", {
							className: "flex-1 text-[11.5px] text-[var(--muted-fg)] leading-[1.5]",
							children: [
								e("settings.appearanceHintPre"),
								/* @__PURE__ */ C("b", {
									className: "text-[var(--fg)]",
									children: e("appearance.title")
								}),
								e("settings.appearanceHintPost")
							]
						})]
					}),
					/* @__PURE__ */ C(Zh, { children: e("settings.behavior") }),
					/* @__PURE__ */ C(Qh, {
						title: e("settings.perPageTitle"),
						desc: e("settings.perPageDesc"),
						children: /* @__PURE__ */ C(Cs, {
							size: "sm",
							"aria-label": e("settings.perPageTitle"),
							items: _.map((e) => ({
								id: e,
								label: String(e)
							})),
							selectedKey: n,
							onSelectionChange: (e) => r(Number(e)),
							className: "w-28",
							children: (e) => /* @__PURE__ */ C(Cs.Item, { ...e })
						})
					}),
					/* @__PURE__ */ C(Qh, {
						title: e("settings.copyFormatTitle"),
						desc: e("settings.copyFormatDesc"),
						children: /* @__PURE__ */ C(Cs, {
							size: "sm",
							"aria-label": e("settings.copyFormatTitle"),
							items: v.map((t) => ({
								id: t.id,
								label: W.toolbar.copyFormats.some((e) => e.id === t.id && e.label === t.label) ? e(Vt(`copyFormat.${t.id}`)) : t.label
							})),
							selectedKey: i,
							onSelectionChange: (e) => a(e),
							className: "w-40",
							children: (e) => /* @__PURE__ */ C(Cs.Item, { ...e })
						})
					}),
					/* @__PURE__ */ C(Qh, {
						title: e("settings.storageTitle"),
						desc: e("settings.storageDesc"),
						children: /* @__PURE__ */ w(Fs, {
							size: "sm",
							"aria-label": e("settings.storageTitle"),
							selectedKeys: [d],
							disallowEmptySelection: !0,
							onSelectionChange: (e) => {
								let t = [...e][0];
								(t === "local" || t === "session") && f(t);
							},
							children: [/* @__PURE__ */ C(Ps, {
								id: "local",
								className: "h-8 px-2.5 py-0 text-xs",
								children: e("settings.storageLocal")
							}), /* @__PURE__ */ C(Ps, {
								id: "session",
								className: "h-8 px-2.5 py-0 text-xs",
								children: e("settings.storageSession")
							})]
						})
					}),
					/* @__PURE__ */ C(Qh, {
						title: e("settings.tourTitle"),
						desc: e("settings.tourDesc"),
						children: /* @__PURE__ */ C(Q, {
							color: "secondary",
							size: "xs",
							onClick: () => {
								p(), t();
							},
							children: e("settings.replayTour")
						})
					}),
					/* @__PURE__ */ C(Qh, {
						title: e("settings.factoryTitle"),
						desc: e("settings.factoryDesc"),
						children: /* @__PURE__ */ C(Q, {
							color: "secondary-destructive",
							size: "xs",
							onClick: () => l({
								title: e("settings.factoryConfirmTitle"),
								body: e("settings.factoryConfirmBody"),
								confirmLabel: e("settings.factoryConfirmLabel"),
								danger: !0,
								onConfirm: () => {
									o(), s(e("settings.factoryToast"), "refresh");
								}
							}),
							children: e("settings.resetEverything")
						})
					}),
					/* @__PURE__ */ C("div", { className: "h-[1px] bg-[var(--border)]" }),
					/* @__PURE__ */ C(Zh, { children: e("settings.account") }),
					m && y ? /* @__PURE__ */ w("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ C("div", {
							className: "w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-[11.5px] font-bold flex items-center justify-center flex-none",
							children: y.initials
						}), /* @__PURE__ */ w("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ w("div", {
								className: "text-[12.5px] font-[600]",
								children: [
									y.name,
									" ",
									/* @__PURE__ */ C("span", {
										className: "text-[9px] font-semibold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-[5px]",
										children: y.plan
									})
								]
							}), /* @__PURE__ */ w("div", {
								className: "text-[11px] text-[var(--muted-fg)]",
								children: [
									y.email,
									" · ",
									e("settings.syncNote")
								]
							})]
						})]
					}) : /* @__PURE__ */ w("div", {
						className: "flex items-center gap-2.5 py-3 px-3.5 border border-dashed border-[var(--border)] rounded-[var(--radius)]",
						children: [
							/* @__PURE__ */ C(K, {
								name: "info",
								size: 15,
								color: "var(--muted-fg)"
							}),
							/* @__PURE__ */ C("div", {
								className: "flex-1 text-[11.5px] text-[var(--muted-fg)] leading-[1.5]",
								children: e("settings.guestNote")
							}),
							/* @__PURE__ */ C(Q, {
								size: "xs",
								className: "flex-none",
								onClick: () => {
									g("signin"), t();
								},
								children: e("common.signIn")
							})
						]
					})
				]
			}),
			/* @__PURE__ */ w("div", {
				className: "py-2.5 px-4 border-t border-t-[var(--border)] flex items-center text-[10.5px] text-[var(--faint-fg)]",
				children: [
					/* @__PURE__ */ w("span", { children: [
						"© 2026 Simtabi LLC · ichava/icon-browser v",
						(u ?? W).meta.version,
						" · ",
						(u ?? W).meta.license
					] }),
					/* @__PURE__ */ C("span", { className: "flex-1" }),
					/* @__PURE__ */ C("button", {
						onClick: () => c("about"),
						className: "border-0 bg-transparent text-brand-secondary text-[10.5px] cursor-pointer p-0.5 font-semibold",
						children: e("settings.aboutLink")
					})
				]
			})
		]
	});
}
var Zh = ({ children: e }) => /* @__PURE__ */ C("div", {
	className: "text-[10.5px] font-semibold text-[var(--faint-fg)]",
	children: e
});
function Qh({ title: e, desc: t, children: n }) {
	return /* @__PURE__ */ w("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ w("div", {
			className: "flex-1",
			children: [/* @__PURE__ */ C("div", {
				className: "text-[12.5px] font-[550]",
				children: e
			}), /* @__PURE__ */ C("div", {
				className: "text-[11px] text-[var(--muted-fg)]",
				children: t
			})]
		}), n]
	});
}
// src/components/ui/Marquee.tsx
function $h({ children: e, direction: t = "vertical", durationSec: n = 16, gap: r = 0, style: i, fade: a = !0, fadeColor: o = "var(--muted2)" }) {
	return C(t === "horizontal" ? ng : tg, {
		durationSec: n,
		gap: r,
		style: i,
		fade: a,
		fadeColor: o,
		children: e
	});
}
function eg(e, t) {
	return {
		position: "absolute",
		inset: 0,
		pointerEvents: "none",
		background: e ? `linear-gradient(${t}, transparent 16px, transparent calc(100% - 16px), ${t})` : `linear-gradient(90deg, ${t}, transparent 24px, transparent calc(100% - 24px), ${t})`
	};
}
function tg({ children: e, durationSec: t, gap: n, style: r, fade: i, fadeColor: a }) {
	let o = f(null), s = f(!1);
	return c(() => {
		let e = o.current;
		if (!e) return;
		let n = 0, r = performance.now(), i = e.scrollTop, a = (o) => {
			let c = o - r;
			r = o;
			let l = document.documentElement.hasAttribute("data-reduce-motion"), u = e.scrollHeight / 2;
			s.current || l ? (i = e.scrollTop, u > 0 && i >= u && (i -= u, e.scrollTop = i)) : u > 0 && (i += u / (t * 1e3) * c, i >= u && (i -= u), e.scrollTop = i), n = requestAnimationFrame(a);
		};
		return n = requestAnimationFrame(a), () => cancelAnimationFrame(n);
	}, [t]), /* @__PURE__ */ w("div", {
		onMouseEnter: () => s.current = !0,
		onMouseLeave: () => s.current = !1,
		style: {
			position: "relative",
			overflow: "hidden",
			...r
		},
		children: [/* @__PURE__ */ w("div", {
			ref: o,
			className: "ich-marquee-scroll",
			style: {
				height: "100%",
				overflowY: "auto",
				overscrollBehavior: "contain"
			},
			children: [/* @__PURE__ */ C("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: n
				},
				children: e
			}), /* @__PURE__ */ C("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: n
				},
				"aria-hidden": !0,
				children: e
			})]
		}), i && /* @__PURE__ */ C("div", { style: eg(!0, a) })]
	});
}
function ng({ children: e, durationSec: t, gap: n, style: r, fade: i, fadeColor: a }) {
	let [o, s] = p(!1);
	return /* @__PURE__ */ w("div", {
		onMouseEnter: () => s(!0),
		onMouseLeave: () => s(!1),
		style: {
			position: "relative",
			overflow: "hidden",
			...r
		},
		children: [/* @__PURE__ */ w("div", {
			style: {
				display: "flex",
				flexDirection: "row",
				gap: n,
				animation: `ichMarqueeX ${t}s linear infinite`,
				animationPlayState: o ? "paused" : "running",
				willChange: "transform"
			},
			children: [/* @__PURE__ */ C("div", {
				style: {
					display: "flex",
					flexDirection: "row",
					gap: n
				},
				children: e
			}), /* @__PURE__ */ C("div", {
				style: {
					display: "flex",
					flexDirection: "row",
					gap: n
				},
				"aria-hidden": !0,
				children: e
			})]
		}), i && /* @__PURE__ */ C("div", { style: eg(!1, a) })]
	});
}
// src/components/about/AboutDialog.tsx
function rg() {
	let e = q(), t = G((e) => e.closeLayer), n = G((e) => e.config), r = G((e) => e.catalog), i = n?.about ?? W.about, a = i.credits, o = i.links;
	return /* @__PURE__ */ w(Dm, {
		showClose: !1,
		onClose: t,
		width: 400,
		panelStyle: { overflow: "hidden" },
		children: [
			/* @__PURE__ */ w("div", {
				className: "relative",
				children: [/* @__PURE__ */ C("button", {
					onClick: t,
					title: `${e("common.close")} — Esc`,
					className: "absolute top-2.5 end-2.5 z-2 w-[26px] h-[26px] border border-[var(--border)] bg-[var(--pop)] shadow-[var(--shadow)] rounded-[6px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]",
					children: /* @__PURE__ */ C(K, {
						name: "close",
						size: 12,
						color: "currentColor"
					})
				}), /* @__PURE__ */ w("div", {
					className: "flex flex-col items-center gap-2.5 pt-[26px] px-5 pb-[18px] bg-[var(--accent-soft)]",
					children: [
						/* @__PURE__ */ C("div", {
							className: "w-[46px] h-[46px] rounded-[12px] bg-[var(--accent)] flex items-center justify-center shadow-[var(--shadow-elevated)]",
							children: /* @__PURE__ */ C(K, {
								name: "layers",
								size: 25,
								color: "var(--accent-fg)"
							})
						}),
						/* @__PURE__ */ w("div", {
							className: "flex items-baseline gap-1.5",
							children: [
								/* @__PURE__ */ C("span", {
									className: "font-bold text-[16px] tracking-[-.02em]",
									children: n?.brand.name ?? "Ichava"
								}),
								/* @__PURE__ */ C("span", {
									className: "text-[var(--muted-fg)] text-[14px]",
									children: n?.brand.suffix ?? e("about.browser")
								}),
								/* @__PURE__ */ w("span", {
									className: "font-[family-name:'Geist_Mono',monospace] text-[11px] text-[var(--accent-text)]",
									children: ["v", n?.meta.version ?? "0.1.1"]
								})
							]
						}),
						/* @__PURE__ */ C("div", {
							className: "text-[12px] text-[var(--muted-fg)] text-center leading-[1.55] max-w-[40ch]",
							children: i.description
						}),
						/* @__PURE__ */ w("div", {
							className: "text-[11px] text-[var(--faint-fg)]",
							children: [
								e("about.craftedBy"),
								" ",
								/* @__PURE__ */ C("b", {
									className: "text-[var(--fg)] font-semibold",
									children: n?.meta.author ?? "Imani Manyara"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ w("div", {
				className: "flex border-t border-t-[var(--border)] border-b border-b-[var(--border)]",
				children: [
					/* @__PURE__ */ C(ig, {
						value: gc(r?.meta.total_ecosystem ?? 0),
						label: i.stats[0]?.label ?? e("about.statIcons"),
						border: !0
					}),
					/* @__PURE__ */ C(ig, {
						value: String(n?.meta.sets ?? 70),
						label: i.stats[1]?.label ?? e("about.statSets"),
						border: !0
					}),
					/* @__PURE__ */ C(ig, {
						value: n?.meta.license ?? W.meta.license,
						label: i.stats[2]?.label ?? e("about.statLicense")
					})
				]
			}),
			/* @__PURE__ */ C("div", {
				className: "text-[9.5px] font-bold tracking-[.08em] text-[var(--faint-fg)] text-center pt-2 px-0 pb-1.5 bg-[var(--muted2)] border-b border-b-[var(--border)]",
				children: i.creditsTitle
			}),
			/* @__PURE__ */ C($h, {
				durationSec: i.creditsMarqueeSec,
				style: {
					height: 126,
					background: "var(--muted2)"
				},
				fadeColor: "var(--muted2)",
				children: a.map((e) => /* @__PURE__ */ w("div", {
					className: "flex items-baseline justify-center gap-2 py-[5px] px-4",
					children: [
						/* @__PURE__ */ C("span", {
							className: "text-[11.5px] font-[600]",
							children: e.name
						}),
						/* @__PURE__ */ C("span", {
							className: "text-[10px] text-[var(--muted-fg)]",
							children: e.author
						}),
						/* @__PURE__ */ C("span", {
							className: "font-[family-name:'Geist_Mono',monospace] text-[9.5px] text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[3px] py-0 px-[5px]",
							children: e.license
						})
					]
				}, e.name))
			}),
			/* @__PURE__ */ w("div", {
				className: "flex items-center gap-3 py-3 px-4 flex-wrap",
				children: [
					/* @__PURE__ */ C("span", {
						className: "text-[11px] text-[var(--muted-fg)]",
						children: i.copyright
					}),
					/* @__PURE__ */ C("span", { className: "flex-1" }),
					/* @__PURE__ */ C("div", {
						className: "flex items-center gap-3",
						children: o.map((e) => /* @__PURE__ */ C("a", {
							href: e.href,
							target: "_blank",
							rel: "noreferrer",
							className: "text-[12px]",
							children: e.label
						}, e.label))
					})
				]
			})
		]
	});
}
function ig({ value: e, label: t, border: n }) {
	return /* @__PURE__ */ w("div", {
		style: {
			flex: 1,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: 2,
			padding: 10,
			borderRight: n ? "1px solid var(--border)" : void 0
		},
		children: [/* @__PURE__ */ C("span", {
			className: "font-[family-name:'Geist_Mono',monospace] text-[14px] font-semibold",
			children: e
		}), /* @__PURE__ */ C("span", {
			className: "text-[10px] text-[var(--muted-fg)]",
			children: t
		})]
	});
}
// src/components/browser/ContextMenu.tsx
function ag() {
	let e = G((e) => e.ctx), t = G((e) => e.closeCtx), n = q(), r = f(null), [i, a] = p(null), { getContainer: o } = v();
	if (u(() => {
		if (!e) {
			a(null);
			return;
		}
		let t = r.current, n = t?.offsetWidth ?? 210, i = t?.offsetHeight ?? 176;
		a({
			x: Math.max(8, Math.min(e.x, window.innerWidth - n - 8)),
			y: Math.max(8, Math.min(e.y, window.innerHeight - i - 8))
		});
	}, [e]), c(() => {
		if (!e) return;
		let t = setTimeout(() => r.current?.querySelector("button[role=\"menuitem\"]:not(:disabled)")?.focus(), 0);
		return () => clearTimeout(t);
	}, [e]), c(() => {
		if (!e) return;
		let n = () => t();
		return window.addEventListener("scroll", n, !0), window.addEventListener("resize", n), () => {
			window.removeEventListener("scroll", n, !0), window.removeEventListener("resize", n);
		};
	}, [e, t]), !e) return null;
	let s = () => Array.from(r.current?.querySelectorAll("button[role=\"menuitem\"]:not(:disabled)") ?? []);
	return h(/* @__PURE__ */ w(S, { children: [/* @__PURE__ */ C("div", {
		onClick: t,
		onContextMenu: (e) => {
			e.preventDefault(), t();
		},
		className: "fixed inset-0 z-88"
	}), /* @__PURE__ */ w("div", {
		ref: r,
		role: "menu",
		"aria-label": e.title ?? n("contextMenu.actions"),
		onKeyDown: (e) => {
			let n = s(), r = n.indexOf(document.activeElement);
			e.key === "Escape" ? (e.preventDefault(), t()) : e.key === "ArrowDown" ? (e.preventDefault(), n[(r + 1) % n.length]?.focus()) : e.key === "ArrowUp" ? (e.preventDefault(), n[(r - 1 + n.length) % n.length]?.focus()) : e.key === "Home" ? (e.preventDefault(), n[0]?.focus()) : e.key === "End" && (e.preventDefault(), n[n.length - 1]?.focus());
		},
		"data-region": "context-menu",
		style: {
			position: "fixed",
			top: i?.y ?? e.y,
			left: i?.x ?? e.x,
			minWidth: 200,
			visibility: i ? "visible" : "hidden",
			zIndex: 89,
			background: "var(--pop)",
			border: "1px solid var(--border)",
			borderRadius: "min(calc(var(--radius) + 2px), 10px)",
			boxShadow: "var(--shadow-elevated)",
			animation: "ichIn .1s ease",
			overflow: "hidden",
			fontSize: "var(--app-font, 13.5px)"
		},
		children: [e.title && /* @__PURE__ */ C("div", {
			className: "flex items-center gap-2 py-2 px-2.5 border-b border-b-[var(--border)]",
			children: /* @__PURE__ */ C("span", {
				className: "font-[family-name:'Geist_Mono',monospace] text-[12px] font-semibold",
				children: e.title
			})
		}), /* @__PURE__ */ C("div", {
			className: "p-1 flex flex-col",
			children: e.items.map((e, n) => e.divider ? /* @__PURE__ */ C("div", {
				role: "separator",
				className: "h-[1px] bg-[var(--border)] my-1 mx-1.5"
			}, `d-${n}`) : /* @__PURE__ */ w("button", {
				role: "menuitem",
				disabled: e.disabled,
				onClick: () => {
					e.run?.(), t();
				},
				style: {
					display: "flex",
					alignItems: "center",
					gap: 9,
					height: 30,
					padding: "0 8px",
					border: "none",
					backgroundColor: "transparent",
					borderRadius: 6,
					cursor: e.disabled ? "default" : "pointer",
					color: e.disabled ? "var(--faint-fg)" : e.danger ? "var(--danger)" : "var(--fg)",
					fontSize: 12.5,
					textAlign: "start",
					opacity: e.disabled ? .6 : 1
				},
				onMouseEnter: (t) => !e.disabled && (t.currentTarget.style.background = e.danger ? "var(--danger-soft)" : "var(--muted)"),
				onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
				onFocus: (t) => !e.disabled && (t.currentTarget.style.background = e.danger ? "var(--danger-soft)" : "var(--muted)"),
				onBlur: (e) => e.currentTarget.style.background = "transparent",
				children: [
					e.icon && /* @__PURE__ */ C(K, {
						name: e.icon,
						size: 14,
						color: e.danger ? "var(--danger)" : "var(--muted-fg)"
					}),
					/* @__PURE__ */ C("span", {
						className: "flex-1",
						children: e.label
					}),
					e.kbd && /* @__PURE__ */ C("kbd", {
						className: "font-[family-name:'Geist_Mono',monospace] text-[10px] py-[1px] px-[5px] border border-[var(--border)] rounded-[4px] text-[var(--muted-fg)]",
						children: e.kbd
					})
				]
			}, `${e.label}-${n}`))
		})]
	})] }), o?.() ?? document.body);
}
// src/components/ui/ConfirmDialog.tsx
function og() {
	let e = G((e) => e.confirm), t = G((e) => e.closeConfirm), n = q();
	if (!e) return null;
	let { title: r, body: i, confirmLabel: a, cancelLabel: o = n("common.cancel"), danger: s, onConfirm: c } = e;
	return /* @__PURE__ */ w(Dm, {
		onClose: t,
		width: 400,
		label: r,
		children: [/* @__PURE__ */ C(qh, {
			icon: /* @__PURE__ */ C(dc, {
				color: s ? "error" : "brand",
				size: "md",
				theme: "modern",
				icon: oc("alert-circle")
			}),
			title: r,
			description: i
		}), /* @__PURE__ */ w(Yh, {
			layout: "grid",
			children: [/* @__PURE__ */ C(Q, {
				color: "secondary",
				size: "md",
				onClick: t,
				children: o
			}), /* @__PURE__ */ C(Q, {
				color: s ? "primary-destructive" : "primary",
				size: "md",
				onClick: () => {
					c(), t();
				},
				children: a
			})]
		})]
	});
}
// src/components/auth/AuthModal.tsx
function sg() {
	let e = Yr(), t = G((e) => e.authView), n = G((e) => e.closeAuth), r = G((e) => e.signIn), i = G((e) => e.createAccount), a = G((e) => e.config?.brand.name ?? "Ichava");
	return t === "create" ? /* @__PURE__ */ C(ug, {
		brand: a,
		onClose: n,
		onCreate: i
	}) : t === "signin" ? /* @__PURE__ */ C(lg, {
		brand: a,
		onClose: n,
		onSignIn: r,
		onCreate: () => e.getState().openAuth("create")
	}) : null;
}
function cg({ brand: e }) {
	return /* @__PURE__ */ C("div", {
		className: "w-10 h-10 rounded-[10px] bg-[var(--accent)] flex items-center justify-center shadow-[var(--shadow-elevated)]",
		title: e,
		children: /* @__PURE__ */ C(K, {
			name: "layers",
			size: 24,
			color: "var(--accent-fg)"
		})
	});
}
function lg({ brand: e, onClose: t, onSignIn: n, onCreate: r }) {
	let i = G((e) => e.authReason), a = q(), [o, s] = p("email"), [u, d] = p(""), [m, h] = p([
		"",
		"",
		"",
		"",
		"",
		""
	]), [g, _] = p(0), [v, y] = p(!1), b = f([]), x = l();
	c(() => {
		if (o !== "code" || g <= 0) return;
		let e = setInterval(() => _((e) => Math.max(0, e - 1)), 1e3);
		return () => clearInterval(e);
	}, [o, g]);
	let T = () => {
		/.+@.+\..+/.test(u) && (s("code"), _(21), setTimeout(() => b.current[0]?.focus(), 30));
	}, E = (e, t) => {
		let n = t.replace(/\D/g, "").slice(-1);
		y(!1), h((t) => t.map((t, r) => r === e ? n : t)), n && e < 5 && b.current[e + 1]?.focus();
	}, D = (e, t) => {
		t.key === "Backspace" && !m[e] && e > 0 && b.current[e - 1]?.focus();
	};
	return /* @__PURE__ */ C(Dm, {
		onClose: t,
		width: 400,
		label: a("common.signIn"),
		children: o === "email" ? /* @__PURE__ */ w(S, { children: [
			/* @__PURE__ */ C(qh, {
				align: "center",
				icon: /* @__PURE__ */ C(cg, { brand: e }),
				title: a("auth.signInTo", { brand: e }),
				description: /* @__PURE__ */ w(S, { children: [i ? /* @__PURE__ */ w(S, { children: [
					/* @__PURE__ */ C("b", { children: i }),
					" ",
					a("auth.needsAccount"),
					" "
				] }) : null, a("auth.emailCode")] })
			}),
			/* @__PURE__ */ C(Jh, { children: /* @__PURE__ */ C(Rh, {
				id: x,
				onSubmit: (e) => {
					e.preventDefault(), T();
				},
				className: "flex flex-col gap-4",
				children: /* @__PURE__ */ C($o, {
					autoFocus: !0,
					isRequired: !0,
					type: "email",
					value: u,
					onChange: d,
					placeholder: a("auth.emailPlaceholder"),
					"aria-label": a("auth.emailPlaceholder")
				})
			}) }),
			/* @__PURE__ */ w(Yh, { children: [/* @__PURE__ */ C(Q, {
				type: "submit",
				form: x,
				color: "primary",
				size: "md",
				children: a("auth.sendCode")
			}), /* @__PURE__ */ w("div", {
				className: "flex items-center justify-center gap-1 text-sm text-tertiary",
				children: [a("auth.newHere"), /* @__PURE__ */ C(Q, {
					color: "link-color",
					size: "md",
					onClick: r,
					children: a("auth.createAccount")
				})]
			})] })
		] }) : /* @__PURE__ */ w(S, { children: [
			/* @__PURE__ */ C(qh, {
				align: "center",
				icon: /* @__PURE__ */ C(cg, { brand: e }),
				title: a("auth.enterCode"),
				description: /* @__PURE__ */ w(S, { children: [
					a("auth.sentTo"),
					" ",
					/* @__PURE__ */ C("b", {
						className: "text-primary",
						children: u
					}),
					/* @__PURE__ */ C("span", {
						className: "mt-1 block text-xs text-[var(--muted-fg)]",
						children: a("auth.demoHint")
					})
				] })
			}),
			/* @__PURE__ */ w(Jh, {
				className: "items-center",
				children: [/* @__PURE__ */ C("div", {
					className: "flex gap-2",
					onPaste: (e) => {
						let t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
						t.length && (e.preventDefault(), h((e) => e.map((e, n) => t[n] ?? "")), b.current[Math.min(5, t.length)]?.focus());
					},
					children: m.map((e, t) => /* @__PURE__ */ C("input", {
						ref: (e) => {
							b.current[t] = e;
						},
						value: e,
						onChange: (e) => E(t, e.target.value),
						onKeyDown: (e) => D(t, e),
						inputMode: "numeric",
						"aria-label": a("auth.digit", { n: t + 1 }),
						"aria-invalid": v || void 0,
						className: `h-14 w-12 rounded-lg bg-primary text-center text-2xl font-semibold text-primary shadow-xs ring-1 ring-inset outline-focus-ring focus:ring-2 focus:ring-brand ${v ? "ring-error_subtle" : "ring-primary"}`
					}, t))
				}), v && /* @__PURE__ */ C("div", {
					role: "alert",
					className: "text-sm text-error-primary",
					children: a("auth.codeFailed")
				})]
			}),
			/* @__PURE__ */ w(Yh, { children: [/* @__PURE__ */ C(Q, {
				color: "primary",
				size: "md",
				onClick: () => {
					let e = m.join("");
					e.length < 6 || n(u, e) || (y(!0), h([
						"",
						"",
						"",
						"",
						"",
						""
					]), b.current[0]?.focus());
				},
				children: a("auth.verify")
			}), /* @__PURE__ */ w("div", {
				className: "flex items-center justify-center gap-4 text-sm text-tertiary",
				children: [/* @__PURE__ */ C(Q, {
					color: "link-color",
					size: "md",
					onClick: () => s("email"),
					children: a("auth.changeEmail")
				}), /* @__PURE__ */ C("span", { children: g > 0 ? a("auth.resendIn", { n: g }) : /* @__PURE__ */ C(Q, {
					color: "link-color",
					size: "md",
					onClick: () => _(21),
					children: a("auth.resendCode")
				}) })]
			})] })
		] })
	});
}
function ug({ brand: e, onClose: t, onCreate: n }) {
	let r = Yr(), [i, a] = p(""), [o, s] = p(""), [c, u] = p(""), [d, f] = p(""), m = q(), h = i.trim() && /.+@.+\..+/.test(c) && d.length >= 8, g = l();
	return /* @__PURE__ */ w(Dm, {
		onClose: t,
		width: 400,
		label: m("auth.createAccount"),
		children: [
			/* @__PURE__ */ C(qh, {
				align: "center",
				icon: /* @__PURE__ */ C(cg, { brand: e }),
				title: m("auth.createTitle"),
				description: m("auth.createBlurb")
			}),
			/* @__PURE__ */ C(Jh, { children: /* @__PURE__ */ w(Rh, {
				id: g,
				onSubmit: (e) => {
					e.preventDefault(), h && n({
						first: i,
						last: o,
						email: c
					});
				},
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ w("div", {
						className: "flex w-full gap-3",
						children: [/* @__PURE__ */ C($o, {
							autoFocus: !0,
							isRequired: !0,
							value: i,
							onChange: a,
							placeholder: m("auth.firstName"),
							"aria-label": m("auth.firstName")
						}), /* @__PURE__ */ C($o, {
							value: o,
							onChange: s,
							placeholder: m("auth.lastName"),
							"aria-label": m("auth.lastName")
						})]
					}),
					/* @__PURE__ */ C($o, {
						isRequired: !0,
						type: "email",
						value: c,
						onChange: u,
						placeholder: m("auth.emailPlaceholder"),
						"aria-label": m("auth.emailPlaceholder")
					}),
					/* @__PURE__ */ C($o, {
						isRequired: !0,
						type: "password",
						value: d,
						onChange: f,
						placeholder: m("auth.passwordPlaceholder"),
						"aria-label": m("auth.passwordPlaceholder"),
						passwordToggleLabel: m("auth.togglePassword")
					})
				]
			}) }),
			/* @__PURE__ */ w(Yh, { children: [/* @__PURE__ */ C(Q, {
				type: "submit",
				form: g,
				color: "primary",
				size: "md",
				isDisabled: !h,
				children: m("auth.createAccount")
			}), /* @__PURE__ */ w("div", {
				className: "flex items-center justify-center gap-1 text-sm text-tertiary",
				children: [m("auth.haveAccount"), /* @__PURE__ */ C(Q, {
					color: "link-color",
					size: "md",
					onClick: () => r.getState().openAuth("signin"),
					children: m("common.signIn")
				})]
			})] })
		]
	});
}
// src/components/auth/ProfileModal.tsx
var dg = {
	fontSize: 10.5,
	fontWeight: 600,
	color: "var(--muted-fg)",
	textTransform: "uppercase",
	letterSpacing: ".04em"
};
function fg() {
	let e = G((e) => e.closeLayer), t = G((e) => e.openLayer), n = G((e) => e.openConfirm), r = G((e) => e.signOut), i = G((e) => e.showToast), a = G((e) => e.config), o = G((e) => e.auth.user), s = G((e) => e.activeWorkspaceId), c = G((e) => e.setActiveWorkspace), u = q(), d = l(), f = o ?? (a ? {
		name: a.user.name,
		initials: a.user.initials,
		email: a.user.email,
		plan: a.user.plan
	} : null);
	if (!f) return null;
	let p = a?.user.workspaces ?? [], m = () => n({
		title: u("profile.signOutTitle"),
		body: u("profile.signOutBody"),
		confirmLabel: u("common.signOut"),
		danger: !0,
		onConfirm: () => {
			r(), i(u("profile.signedOut"), "check");
		}
	});
	return /* @__PURE__ */ w(Dm, {
		onClose: e,
		width: 440,
		label: u("profile.title"),
		children: [
			/* @__PURE__ */ C(qh, { title: u("profile.title") }),
			/* @__PURE__ */ w(Jh, { children: [/* @__PURE__ */ w("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ C("div", {
					"aria-hidden": !0,
					className: "w-11 h-11 flex-none rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center text-[15px] font-bold",
					children: f.initials
				}), /* @__PURE__ */ w("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ w("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ C("span", {
							className: "text-sm font-semibold text-primary",
							children: f.name
						}), /* @__PURE__ */ C("span", {
							className: "text-[9.5px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[5px] py-0.5 px-1.5",
							children: f.plan
						})]
					}), /* @__PURE__ */ C("div", {
						className: "text-sm text-tertiary truncate",
						children: f.email
					})]
				})]
			}), p.length > 0 && /* @__PURE__ */ w("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ C("span", {
					id: d,
					style: dg,
					children: u("account.workspace")
				}), /* @__PURE__ */ C(Ys, {
					"aria-labelledby": d,
					value: s ?? null,
					onChange: (e) => {
						let t = p.find((t) => t.id === e);
						t && (c(t.id), i(u("profile.switched", { name: t.name }), "check"));
					},
					className: "gap-1.5",
					children: p.map((e) => /* @__PURE__ */ C(Js, {
						value: e.id,
						label: e.name,
						hint: e.plan,
						className: "rounded-lg p-2.5 ring-1 ring-secondary ring-inset selected:bg-[var(--accent-soft)] selected:ring-[var(--accent)]"
					}, e.id))
				})]
			})] }),
			/* @__PURE__ */ w(Yh, {
				layout: "row",
				children: [/* @__PURE__ */ w(Q, {
					color: "secondary-destructive",
					size: "md",
					className: "sm:mr-auto",
					onClick: () => {
						e(), m();
					},
					children: [u("common.signOut"), "…"]
				}), /* @__PURE__ */ C(Q, {
					color: "secondary",
					size: "md",
					onClick: () => t("settings"),
					children: u("profile.appSettings")
				})]
			})
		]
	});
}
// src/components/tour/steps.ts
var pg = [
	{
		icon: "sparkles",
		titleKey: "tour.s1Title",
		bodyKey: "tour.s1Body"
	},
	{
		icon: "search",
		titleKey: "tour.s2Title",
		bodyKey: "tour.s2Body"
	},
	{
		icon: "palette",
		titleKey: "tour.s3Title",
		bodyKey: "tour.s3Body"
	},
	{
		icon: "copy",
		titleKey: "tour.s4Title",
		bodyKey: "tour.s4Body"
	},
	{
		icon: "folder",
		titleKey: "tour.s5Title",
		bodyKey: "tour.s5Body"
	}
];
// src/components/tour/TourModal.tsx
function mg() {
	let e = G((e) => e.tour.step), t = G((e) => e.nextTourStep), n = G((e) => e.prevTourStep), r = G((e) => e.skipTour), i = G((e) => e.endTour), a = q(), o = pg.length, s = Math.min(e, o - 1), c = pg[s], l = s >= o - 1;
	return /* @__PURE__ */ w(Dm, {
		onClose: r,
		width: 400,
		label: a("settings.tourTitle"),
		children: [
			/* @__PURE__ */ C("div", {
				className: "px-4 pt-4 sm:px-6 sm:pt-6",
				children: /* @__PURE__ */ C("div", {
					className: "flex h-32 items-center justify-center rounded-lg bg-tertiary",
					children: /* @__PURE__ */ C(dc, {
						color: "brand",
						size: "xl",
						theme: "modern",
						icon: oc(c.icon)
					})
				})
			}),
			/* @__PURE__ */ C(qh, {
				align: "center",
				title: a(c.titleKey),
				description: a(c.bodyKey)
			}),
			/* @__PURE__ */ w("div", {
				className: "flex flex-col items-center gap-2 pt-5",
				children: [/* @__PURE__ */ C("div", {
					"aria-hidden": !0,
					className: "flex gap-4",
					children: pg.map((e, t) => /* @__PURE__ */ C("span", { className: Z("size-2.5 rounded-full transition-colors", t === s ? "bg-fg-brand-primary_alt" : "bg-quaternary") }, t))
				}), /* @__PURE__ */ C("span", {
					className: "sr-only",
					"aria-live": "polite",
					children: a("tour.stepOf", {
						n: s + 1,
						total: o
					})
				})]
			}),
			/* @__PURE__ */ w(Yh, {
				layout: "grid",
				children: [s === 0 ? /* @__PURE__ */ C(Q, {
					color: "secondary",
					size: "md",
					onClick: r,
					children: a("tour.skip")
				}) : /* @__PURE__ */ C(Q, {
					color: "secondary",
					size: "md",
					onClick: n,
					children: a("tour.back")
				}), /* @__PURE__ */ C(Q, {
					color: "primary",
					size: "md",
					onClick: () => l ? i() : t(),
					children: a(l ? "tour.getStarted" : "tour.next")
				})]
			})
		]
	});
}
// src/components/shared-assets/banners/notice-banner.tsx
var hg = ({ icon: e, title: t, body: n, actions: r, className: i, ...a }) => {
	let o = l();
	return /* @__PURE__ */ w("div", {
		"aria-describedby": n ? o : void 0,
		...a,
		className: Z("flex flex-col gap-4 rounded-xl bg-secondary p-4 text-start shadow-lg ring-1 ring-secondary_alt", i),
		children: [/* @__PURE__ */ w("div", {
			className: "flex gap-3",
			children: [e && /* @__PURE__ */ C(e, {
				"aria-hidden": !0,
				className: "size-5 shrink-0 text-fg-brand-primary_alt"
			}), /* @__PURE__ */ w("div", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ C("p", {
					className: "text-sm font-semibold text-secondary",
					children: t
				}), n && /* @__PURE__ */ C("p", {
					id: o,
					className: "text-sm text-tertiary",
					children: n
				})]
			})]
		}), /* @__PURE__ */ C("div", {
			className: "flex justify-end gap-3",
			children: r
		})]
	});
};
// src/components/consent/ConsentBanner.tsx
function gg() {
	let e = G((e) => e.setConsent), t = q();
	return /* @__PURE__ */ C(hg, {
		role: "dialog",
		"aria-label": t("consent.ariaLabel"),
		icon: pi,
		title: t("consent.title"),
		body: t("consent.body"),
		className: "fixed start-4 bottom-4 z-70 w-[360px] max-w-[calc(100vw_-_32px)] [animation:ichRise_.2s_ease]",
		actions: /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ C(Q, {
			color: "secondary",
			size: "sm",
			onClick: () => e("essential"),
			children: t("consent.essentialOnly")
		}), /* @__PURE__ */ C(Q, {
			size: "sm",
			onClick: () => e("all"),
			children: t("consent.acceptAll")
		})] })
	});
}
// src/hooks/useConsentNotice.ts
function _g(e) {
	let t = Yr(), [n] = p(() => Symbol("ichava.consent.notice"));
	c(() => At((e) => {
		t.getState().consent !== e && t.setState({ consent: e });
	}), [t]), c(() => e ? Ft(n) : void 0, [e, n]);
	let r = m(Lt, () => It(n), () => It(n));
	return e && r;
}
// src/components/team/InviteModal.tsx
var vg = [
	{
		v: "24h",
		k: "invite.exp24h"
	},
	{
		v: "7 days",
		k: "invite.exp7d"
	},
	{
		v: "30 days",
		k: "invite.exp30d"
	},
	{
		v: "Never",
		k: "invite.expNever"
	}
];
function yg() {
	let e = G((e) => e.closeInvite), t = G((e) => e.pushNotification), n = G((e) => e.showToast), r = G((e) => {
		let t = e.config?.user.workspaces ?? [];
		return t.find((t) => t.id === e.activeWorkspaceId) ?? t[0];
	}), i = dl(), a = q(), [o, s] = p(""), [c, u] = p("editor"), [d, f] = p("7 days"), m = l(), h = r?.name ?? a("invite.workspace"), g = `${location.origin}/ichava/invite/${r?.id ?? "team"}-${c}-${d.replace(/\s/g, "")}`;
	return /* @__PURE__ */ w(Dm, {
		onClose: e,
		width: 520,
		label: a("invite.title"),
		children: [
			/* @__PURE__ */ C(qh, {
				title: a("invite.title"),
				description: /* @__PURE__ */ C("span", {
					className: "font-mono text-xs",
					children: r?.id ?? h
				})
			}),
			/* @__PURE__ */ w(Jh, { children: [
				/* @__PURE__ */ C($o, {
					size: "md",
					type: "email",
					value: o,
					onChange: s,
					placeholder: a("invite.emailPlaceholder"),
					"aria-label": a("invite.emailPlaceholder")
				}),
				/* @__PURE__ */ w(Fs, {
					size: "sm",
					"aria-label": a("invite.role"),
					selectedKeys: [c],
					disallowEmptySelection: !0,
					onSelectionChange: (e) => {
						let t = [...e][0];
						(t === "editor" || t === "viewer") && u(t);
					},
					children: [/* @__PURE__ */ C(Ps, {
						id: "editor",
						children: a("invite.roleEditor")
					}), /* @__PURE__ */ C(Ps, {
						id: "viewer",
						children: a("invite.roleViewer")
					})]
				}),
				/* @__PURE__ */ w("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ C("span", {
							id: m,
							className: "text-sm font-medium text-secondary",
							children: a("invite.linkExpires")
						}),
						/* @__PURE__ */ C("span", { className: "flex-1" }),
						/* @__PURE__ */ C(Fs, {
							size: "sm",
							"aria-labelledby": m,
							selectedKeys: [d],
							disallowEmptySelection: !0,
							onSelectionChange: (e) => {
								let t = [...e][0];
								t !== void 0 && f(String(t));
							},
							children: vg.map((e) => /* @__PURE__ */ C(Ps, {
								id: e.v,
								children: a(e.k)
							}, e.v))
						})
					]
				}),
				/* @__PURE__ */ C("div", {
					className: "text-sm text-tertiary",
					children: a("invite.blurb")
				})
			] }),
			/* @__PURE__ */ w(Yh, {
				layout: "row",
				children: [/* @__PURE__ */ C(Q, {
					color: "secondary",
					size: "md",
					onClick: () => i(g, a("invite.linkCopied")),
					children: a("invite.generateLink")
				}), /* @__PURE__ */ C(Q, {
					color: "primary",
					size: "md",
					onClick: () => {
						let r = o.trim() || a("invite.yourTeammate");
						t({
							icon: "info",
							text: a("invite.sentNotification", {
								to: r,
								role: c
							})
						}), n(a("invite.sent"), "check"), e();
					},
					children: a("invite.sendInvite")
				})]
			})
		]
	});
}
// src/components/team/ManageAccessModal.tsx
var bg = [
	"#7c3aed",
	"#0891b2",
	"#059669",
	"#e11d48",
	"#ea580c"
];
function xg() {
	let e = G((e) => e.accessCollectionId), t = G((e) => e.closeAccess), n = G((e) => e.collections.find((t) => t.id === e.accessCollectionId)), r = G((e) => e.config?.team ?? []), i = G((e) => e.shareCollection), a = dl(), o = q(), [s, c] = p(""), [l, u] = p(n?.sharedWith ?? []);
	if (!e || !n) return null;
	let d = r.filter((e) => !l.some((t) => t.initials === e.initials) && (e.name.toLowerCase().includes(s.toLowerCase()) || s === "")), f = (e) => u((t) => [...t, {
		initials: e.initials,
		name: e.name
	}]);
	return /* @__PURE__ */ w(Dm, {
		onClose: t,
		width: 480,
		label: o("shared.manageAccess"),
		children: [
			/* @__PURE__ */ C(qh, {
				title: o("shared.manageAccess"),
				description: n.name
			}),
			/* @__PURE__ */ w(Jh, { children: [
				/* @__PURE__ */ C($o, {
					size: "md",
					icon: Qi,
					label: o("access.addPeople"),
					value: s,
					onChange: c,
					placeholder: o("access.searchTeammates")
				}),
				s !== "" && d.length > 0 && /* @__PURE__ */ C("div", {
					className: "overflow-hidden rounded-lg ring-1 ring-secondary ring-inset",
					children: d.map((e, t) => /* @__PURE__ */ w("button", {
						onClick: () => {
							f(e), c("");
						},
						className: "flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-2.5 py-2 text-primary hover:bg-primary_hover",
						children: [/* @__PURE__ */ C(Sg, {
							m: e,
							i: t
						}), /* @__PURE__ */ C("span", {
							className: "text-sm",
							children: e.name
						})]
					}, e.initials))
				}),
				l.length === 0 ? /* @__PURE__ */ C("div", {
					className: "text-sm text-tertiary",
					children: o("access.onlyYou")
				}) : /* @__PURE__ */ w("div", {
					className: "flex flex-col gap-1.5",
					children: [l.map((e, t) => /* @__PURE__ */ w("div", {
						className: "flex items-center gap-[9px]",
						children: [
							/* @__PURE__ */ C(Sg, {
								m: e,
								i: t
							}),
							/* @__PURE__ */ C("span", {
								className: "flex-1 text-sm text-primary",
								children: e.name
							}),
							/* @__PURE__ */ C(Q, {
								color: "tertiary",
								size: "sm",
								"aria-label": `${o("common.remove")} ${e.name}`,
								iconLeading: oc("close"),
								onClick: () => u((t) => t.filter((t) => t.initials !== e.initials))
							})
						]
					}, e.initials)), /* @__PURE__ */ C(Q, {
						color: "primary",
						size: "sm",
						className: "self-start",
						onClick: () => {
							i(e, {
								role: "editor",
								sharedWith: l
							}), t();
						},
						children: o("access.saveAccess")
					})]
				})
			] }),
			/* @__PURE__ */ w(Yh, {
				layout: "row",
				children: [/* @__PURE__ */ C(Q, {
					color: "link-gray",
					size: "md",
					className: "sm:mr-auto",
					onClick: () => a(`${location.origin}/ichava/c/${n.id}`, o("access.shareLinkCopied")),
					children: o("access.copyLinkInstead")
				}), /* @__PURE__ */ C(Q, {
					color: "primary",
					size: "md",
					onClick: () => {
						i(e, {
							role: "editor",
							sharedWith: r.map((e) => ({
								initials: e.initials,
								name: e.name
							}))
						}), t();
					},
					children: o("access.shareEntireTeam")
				})]
			})
		]
	});
}
function Sg({ m: e, i: t }) {
	return /* @__PURE__ */ C("div", {
		style: {
			width: 24,
			height: 24,
			borderRadius: "50%",
			flex: "none",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: 9,
			fontWeight: 700,
			color: "#fff",
			background: bg[t % bg.length]
		},
		children: e.initials
	});
}
// src/components/team/SharedCollectionsModal.tsx
function Cg() {
	let e = G((e) => e.closeShared), t = G((e) => e.collections), n = G((e) => e.activeWorkspaceId), r = G((e) => e.config), i = G((e) => e.openDetail), a = G((e) => e.openAccess), o = G((e) => e.openInvite), s = q(), c = r?.ui.avatarPalette?.length ? r.ui.avatarPalette : W.ui.avatarPalette, l = r?.user.workspaces.find((e) => e.id === n) ?? r?.user.workspaces[0], u = t.filter((e) => e.shared || (e.sharedWith ?? []).length > 0);
	return /* @__PURE__ */ w(Dm, {
		onClose: e,
		width: 620,
		label: s("shared.title"),
		panelStyle: {
			maxHeight: "80vh",
			display: "flex",
			flexDirection: "column"
		},
		children: [/* @__PURE__ */ C(qh, {
			className: "flex-none",
			title: s("shared.title"),
			description: /* @__PURE__ */ w(S, { children: [
				/* @__PURE__ */ C("span", {
					className: "font-mono text-xs",
					children: l?.name ?? s("team.title")
				}),
				" · ",
				s("shared.count", { n: u.length })
			] })
		}), /* @__PURE__ */ C(Jh, {
			className: "min-h-0 flex-1 gap-2.5 overflow-y-auto pb-6",
			children: u.length === 0 ? /* @__PURE__ */ w("div", {
				className: "flex flex-col items-center gap-2 px-4 py-10 text-tertiary",
				children: [
					/* @__PURE__ */ C(K, {
						name: "folder",
						size: 22,
						color: "var(--faint-fg)"
					}),
					/* @__PURE__ */ C("span", {
						className: "text-center text-sm",
						children: s("shared.empty")
					}),
					/* @__PURE__ */ C(Q, {
						color: "primary",
						size: "sm",
						onClick: () => {
							e(), o();
						},
						children: s("shared.inviteTeam")
					})
				]
			}) : u.map((e) => /* @__PURE__ */ C(wg, {
				c: e,
				palette: c,
				onManageAccess: () => a(e.id),
				onOpenDetail: i
			}, e.id))
		})]
	});
}
function wg({ c: e, palette: t, onManageAccess: n, onOpenDetail: r }) {
	let i = dl(), a = q(), { icons: o } = Cm(e.icons), s = new Map(o.map((e) => [e.id, e]));
	return /* @__PURE__ */ w("div", {
		className: "border border-[var(--border)] rounded-[var(--radius)] overflow-hidden",
		children: [/* @__PURE__ */ w("div", {
			className: "flex items-center gap-2 py-2.5 px-3",
			children: [
				/* @__PURE__ */ C(K, {
					name: "folder",
					size: 14,
					color: "var(--accent-text)"
				}),
				/* @__PURE__ */ C("span", {
					className: "text-[12.5px] font-[550]",
					children: e.name
				}),
				/* @__PURE__ */ C("span", {
					className: "font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--muted-fg)]",
					children: a("library.iconCount", { n: e.icons.length })
				}),
				/* @__PURE__ */ C("span", {
					className: "text-[9px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-[5px]",
					children: e.role === "viewer" ? a("shared.viewer") : a("shared.editor")
				}),
				(e.sharedWith ?? []).length > 0 && /* @__PURE__ */ C("div", {
					className: "flex",
					children: (e.sharedWith ?? []).slice(0, 3).map((e, n) => /* @__PURE__ */ C("div", {
						style: {
							width: 18,
							height: 18,
							borderRadius: "50%",
							marginInlineStart: n === 0 ? 0 : -6,
							border: "2px solid var(--pop)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 7.5,
							fontWeight: 700,
							color: "var(--accent-fg)",
							background: t[n % t.length]
						},
						children: e.initials
					}, e.initials))
				}),
				/* @__PURE__ */ C("span", { className: "flex-1" }),
				/* @__PURE__ */ C(Q, {
					color: "secondary",
					size: "xs",
					onClick: n,
					children: a("shared.manageAccess")
				}),
				/* @__PURE__ */ C(Q, {
					color: "secondary",
					size: "xs",
					onClick: () => {
						i(o.map(Kt).join("\n"), a("toolbar.namesCopied", { n: e.icons.length }));
					},
					children: a("toolbar.copyNames")
				})
			]
		}), e.icons.length > 0 && /* @__PURE__ */ C("div", {
			className: "flex flex-wrap gap-1.5 border-t border-t-[var(--border)] py-2.5 px-3",
			children: e.icons.map((e) => {
				let t = s.get(e);
				return t ? /* @__PURE__ */ C("div", {
					role: "button",
					tabIndex: 0,
					"aria-label": t.name,
					onClick: () => r(e),
					onKeyDown: (t) => {
						(t.key === "Enter" || t.key === " ") && (t.preventDefault(), r(e));
					},
					title: t.name,
					className: "w-[38px] h-[38px] border border-[var(--border)] rounded-[6px] bg-[var(--card)] flex items-center justify-center cursor-pointer",
					children: /* @__PURE__ */ C(wp, {
						icon: t,
						size: 18
					})
				}, e) : null;
			})
		})]
	});
}
// src/hooks/useDevBus.ts
function Tg() {
	return Hr(Yr()) ?? Mn;
}
// src/hooks/useLogger.ts
var Eg = i(null);
function Dg() {
	return s(Eg) ?? An;
}
// src/components/devtools/regression.ts
function Og(e, t, n) {
	try {
		return {
			name: e,
			pass: t(),
			detail: n
		};
	} catch (t) {
		return {
			name: e,
			pass: !1,
			detail: t instanceof Error ? t.message : String(t)
		};
	}
}
function kg(e, t, n) {
	let r = [], i = e ? new qt(e) : null, a = e?.icons[0];
	return r.push(Og("catalog loaded with icons", () => !!e && e.icons.length > 0)), r.push(Og("repository paginates within perPage", () => {
		if (!i) return !1;
		let e = i.page({
			search: "",
			packages: [],
			categories: [],
			variants: [],
			page: 1,
			perPage: 60,
			sortBy: "name",
			sortDirection: "asc"
		});
		return e.items.length <= 60 && e.total >= e.items.length;
	})), r.push(Og("byId round-trips a known icon", () => !i || !a ? !1 : i.byId(a.id)?.name === a.name)), r.push(Og("package filter narrows results", () => !i || !a ? !1 : i.page({
		search: "",
		packages: [a.package],
		categories: [],
		variants: [],
		page: 1,
		perPage: 120,
		sortBy: "name",
		sortDirection: "asc"
	}).items.every((e) => e.package === a.package))), r.push(Og("snippet: name format yields the Laravel icon path", () => a ? Pp.build("name", a, {
		size: 24,
		unit: "px",
		color: null
	}) === Lp(a) : !1)), r.push(Og("snippet: react snippet is a component that forwards its props", () => {
		if (!a) return !1;
		let e = Pp.build("react", a, {
			size: 24,
			unit: "px",
			color: null
		});
		return e.includes("export function") && e.includes("{...props}");
	})), r.push(Og("treatment: duotone uses the accent token", () => {
		let e = bp("mask://x", 26, "#000", "duotone");
		return JSON.stringify(e).includes("--accent");
	})), r.push(Og("config: features flags present", () => !!t && typeof t.features.devtools == "boolean")), r.push(Og("config: seo drives the document title when the app owns it", () => !t || typeof t.seo.title != "string" ? !1 : document.documentElement.style.getPropertyValue("--accent") === "" || document.title === t.seo.title)), r.push(Og("store: favorites & collections are arrays", () => {
		let e = n.getState();
		return Array.isArray(e.favorites) && Array.isArray(e.collections);
	})), r.push(Og("store: active workspace resolvable", () => {
		let e = n.getState();
		return !t || t.user.workspaces.length === 0 || !!e.activeWorkspaceId;
	})), r;
}
// src/components/devtools/DevToolsPanel.tsx
var Ag = [
	{
		id: "events",
		label: "Events"
	},
	{
		id: "state",
		label: "State"
	},
	{
		id: "storage",
		label: "Storage"
	},
	{
		id: "tests",
		label: "Tests"
	},
	{
		id: "logs",
		label: "Logs"
	},
	{
		id: "boot",
		label: "Boot"
	}
], jg = [
	{
		id: "bottom",
		label: "Dock to bottom",
		Icon: Ii
	},
	{
		id: "right",
		label: "Dock to right",
		Icon: Ri
	},
	{
		id: "left",
		label: "Dock to left",
		Icon: Li
	},
	{
		id: "top",
		label: "Dock to top",
		Icon: zi
	}
];
function Mg(e) {
	if (typeof window > "u") return Ar.max;
	let t = e === "left" || e === "right" ? window.innerWidth : window.innerHeight;
	return Math.max(Ar.min, Math.min(Ar.max, Math.floor(t * .85)));
}
var Ng = {
	bottom: (e) => ({
		left: 0,
		right: 0,
		bottom: 0,
		height: e,
		borderTop: "1px solid var(--border)",
		boxShadow: "0 -8px 24px -12px rgba(0,0,0,.3)"
	}),
	top: (e) => ({
		left: 0,
		right: 0,
		top: 0,
		height: e,
		borderBottom: "1px solid var(--border)",
		boxShadow: "0 8px 24px -12px rgba(0,0,0,.3)"
	}),
	left: (e) => ({
		top: 0,
		bottom: 0,
		left: 0,
		width: e,
		borderRight: "1px solid var(--border)",
		boxShadow: "8px 0 24px -12px rgba(0,0,0,.3)"
	}),
	right: (e) => ({
		top: 0,
		bottom: 0,
		right: 0,
		width: e,
		borderLeft: "1px solid var(--border)",
		boxShadow: "-8px 0 24px -12px rgba(0,0,0,.3)"
	})
};
function Pg() {
	let e = Yr(), t = G((e) => e.devtools.tab), n = G((e) => e.setDevToolsTab), r = G((e) => e.toggleDevtools), { dock: i, size: a } = G((e) => e.devtoolsLayout), o = G((e) => e.setDevtoolsDock), s = G((e) => e.setDevtoolsSize), l = Tg();
	c(() => l.on((t) => e.getState().pushDevEvent(t)), [l, e]);
	let [, u] = p(0);
	c(() => {
		let e = () => u((e) => e + 1);
		return window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
	}, []);
	let d = Mg(i), f = Math.min(a, d), m = i === "top" || i === "bottom", h = (e) => {
		e.preventDefault();
		let t = e.currentTarget;
		t.setPointerCapture(e.pointerId);
		let n = (e) => i === "bottom" ? window.innerHeight - e.clientY : i === "top" ? e.clientY : i === "left" ? e.clientX : window.innerWidth - e.clientX, r = (e) => s(Math.min(Mg(i), n(e))), a = (e) => {
			t.releasePointerCapture(e.pointerId), t.removeEventListener("pointermove", r), t.removeEventListener("pointerup", a);
		};
		t.addEventListener("pointermove", r), t.addEventListener("pointerup", a);
	}, g = (e) => {
		let t = {
			bottom: "ArrowUp",
			top: "ArrowDown",
			left: "ArrowRight",
			right: "ArrowLeft"
		}[i], n = {
			bottom: "ArrowDown",
			top: "ArrowUp",
			left: "ArrowLeft",
			right: "ArrowRight"
		}[i], r = e.shiftKey ? 64 : 16, a = null;
		e.key === t ? a = f + r : e.key === n ? a = f - r : e.key === "Home" ? a = Ar.min : e.key === "End" && (a = d), a !== null && (e.preventDefault(), s(Math.min(d, a)));
	}, _ = i === "bottom" ? {
		top: -3,
		left: 0,
		right: 0,
		height: 6,
		cursor: "ns-resize"
	} : i === "top" ? {
		bottom: -3,
		left: 0,
		right: 0,
		height: 6,
		cursor: "ns-resize"
	} : i === "left" ? {
		right: -3,
		top: 0,
		bottom: 0,
		width: 6,
		cursor: "ew-resize"
	} : {
		left: -3,
		top: 0,
		bottom: 0,
		width: 6,
		cursor: "ew-resize"
	};
	return /* @__PURE__ */ w("div", {
		role: "region",
		"aria-label": "Ichava DevTools",
		"data-dock": i,
		className: "fixed z-55 bg-[var(--pop)] flex flex-col text-[12px]",
		style: Ng[i](f),
		children: [
			/* @__PURE__ */ C("div", {
				role: "separator",
				"aria-orientation": m ? "horizontal" : "vertical",
				"aria-label": "Resize DevTools",
				"aria-valuemin": Ar.min,
				"aria-valuemax": d,
				"aria-valuenow": f,
				tabIndex: 0,
				onPointerDown: h,
				onKeyDown: g,
				className: "absolute z-1 touch-none outline-focus-ring hover:bg-[var(--accent-soft)] focus-visible:bg-[var(--accent-soft)]",
				style: _
			}),
			/* @__PURE__ */ w("div", {
				className: "flex flex-wrap items-center gap-1 min-h-[34px] py-1 px-2.5 border-b border-b-[var(--border)] flex-none",
				children: [
					/* @__PURE__ */ C(K, {
						name: "zap",
						size: 13,
						color: "var(--accent-text)"
					}),
					/* @__PURE__ */ C("span", {
						className: "text-[12px] font-[650] mr-1.5",
						children: "Ichava DevTools"
					}),
					Ag.map((e) => /* @__PURE__ */ C("button", {
						onClick: () => n(e.id),
						style: {
							height: 24,
							padding: "0 9px",
							border: "none",
							backgroundColor: t === e.id ? "var(--muted)" : "transparent",
							color: t === e.id ? "var(--fg)" : "var(--muted-fg)",
							borderRadius: 5,
							fontSize: 11.5,
							fontWeight: t === e.id ? 600 : 500,
							cursor: "pointer"
						},
						children: e.label
					}, e.id)),
					/* @__PURE__ */ C("span", { className: "flex-1" }),
					m && /* @__PURE__ */ C("span", {
						className: "font-[family-name:'Geist_Mono',monospace] text-[10px] text-[var(--faint-fg)]",
						children: "window.dispatchEvent → ichava:*"
					}),
					/* @__PURE__ */ C("div", {
						role: "radiogroup",
						"aria-label": "DevTools position",
						className: "ml-2 flex items-center gap-0.5 rounded-[6px] border border-[var(--border)] p-0.5",
						children: jg.map(({ id: e, label: t, Icon: n }) => /* @__PURE__ */ C("button", {
							role: "radio",
							"aria-checked": i === e,
							"aria-label": t,
							title: t,
							onClick: () => o(e),
							className: `flex h-5 w-5 items-center justify-center rounded-[4px] border-0 cursor-pointer ${i === e ? "bg-[var(--muted)] text-[var(--fg)]" : "bg-transparent text-[var(--muted-fg)]"}`,
							children: /* @__PURE__ */ C(n, {
								"aria-hidden": "true",
								className: "size-3.5"
							})
						}, e))
					}),
					/* @__PURE__ */ C("button", {
						onClick: r,
						title: "Close — ⌘D / Esc",
						className: "ml-2 w-6 h-6 border border-[var(--border)] bg-[var(--bg)] rounded-[5px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]",
						children: /* @__PURE__ */ C(K, {
							name: "close",
							size: 11,
							color: "currentColor"
						})
					})
				]
			}),
			/* @__PURE__ */ w("div", {
				className: "flex-1 overflow-auto p-3 font-[family-name:'Geist_Mono',monospace]",
				children: [
					t === "events" && /* @__PURE__ */ C(Ig, {}),
					t === "state" && /* @__PURE__ */ C(Lg, {}),
					t === "storage" && /* @__PURE__ */ C(Rg, {}),
					t === "tests" && /* @__PURE__ */ C(zg, {}),
					t === "logs" && /* @__PURE__ */ C(Bg, {}),
					t === "boot" && /* @__PURE__ */ C(Vg, {})
				]
			})
		]
	});
}
function Fg(e) {
	try {
		return new Date(e).toLocaleTimeString();
	} catch {
		return String(e);
	}
}
function Ig() {
	let e = G((e) => e.devtools.events), t = G((e) => e.devtools.capturing), n = G((e) => e.setCapturing), r = G((e) => e.clearDevEvents);
	return /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ w(Hg, { children: [
		/* @__PURE__ */ w(Ug, {
			onClick: () => n(!t),
			children: [t ? "Pause" : "Resume", " capture"]
		}),
		/* @__PURE__ */ C(Ug, {
			onClick: r,
			children: "Clear log"
		}),
		/* @__PURE__ */ w("span", {
			className: "text-[var(--faint-fg)]",
			children: [e.length, " events"]
		})
	] }), e.length === 0 ? /* @__PURE__ */ C(Gg, { children: "No events yet — interact with the app (sign in, share, toggle theme…)." }) : e.map((e, t) => /* @__PURE__ */ w(Wg, { children: [
		/* @__PURE__ */ C("span", {
			className: "text-[var(--faint-fg)]",
			children: Fg(e.ts)
		}),
		/* @__PURE__ */ C("span", {
			className: "text-[var(--faint-fg)]",
			children: e.source ?? "page"
		}),
		/* @__PURE__ */ C("span", {
			className: "text-[var(--accent-text)] font-semibold",
			children: e.label
		}),
		e.payload != null && /* @__PURE__ */ C("span", {
			className: "text-[var(--muted-fg)]",
			children: JSON.stringify(e.payload)
		})
	] }, t))] });
}
function Lg() {
	let e = G((e) => e), t = {
		theme: e.theme,
		view: e.view,
		accent: e.accent,
		size: e.size,
		sizeUnit: e.sizeUnit,
		gridStroke: e.gridStroke,
		color: e.color,
		treatment: e.treatment,
		filters: e.filters,
		auth: {
			status: e.auth.status,
			plan: e.auth.user?.plan ?? null
		},
		favorites: e.favorites.length,
		collections: e.collections.length,
		storageDriver: e.storageDriver,
		consent: e.consent
	};
	return /* @__PURE__ */ C("pre", {
		className: "m-0 whitespace-pre-wrap text-[var(--fg)] text-[11.5px] leading-[1.55]",
		children: JSON.stringify(t, null, 2)
	});
}
function Rg() {
	let e = Yr(), t = dl(), n = G((e) => e.storageDriver), r = G((e) => e.setStorageDriver), i = G((e) => e.factoryReset), a = G((e) => e.openConfirm);
	return /* @__PURE__ */ w(S, { children: [
		/* @__PURE__ */ C("div", {
			className: "font-[600] mb-1.5",
			children: "Frontend storage driver"
		}),
		/* @__PURE__ */ C("div", {
			className: "inline-flex gap-0.5 border border-[var(--border)] rounded-[6px] p-0.5 mb-2.5",
			children: ["local", "session"].map((e) => /* @__PURE__ */ C("button", {
				onClick: () => r(e),
				style: {
					height: 24,
					padding: "0 12px",
					border: "none",
					borderRadius: 4,
					backgroundColor: n === e ? "var(--accent-soft)" : "transparent",
					color: n === e ? "var(--accent)" : "var(--muted-fg)",
					fontSize: 11.5,
					fontWeight: 600,
					cursor: "pointer"
				},
				children: e === "local" ? "localStorage" : "sessionStorage"
			}, e))
		}),
		/* @__PURE__ */ w("div", {
			className: "text-[11px] text-[var(--muted-fg)] leading-[1.5] mb-2.5 font-[family-name:'Geist',system-ui]",
			children: [
				"State key ",
				/* @__PURE__ */ C("b", { children: zn }),
				" — appearance, filters, view, favorites, collections, auth, notifications, consent. Active driver: ",
				/* @__PURE__ */ C("b", { children: Yn() }),
				"."
			]
		}),
		/* @__PURE__ */ w(Hg, { children: [/* @__PURE__ */ C(Ug, {
			onClick: () => t(JSON.stringify(e.getState(), (e, t) => e === "catalog" || e === "filtersData" ? void 0 : t), "State JSON copied"),
			children: "Copy state JSON"
		}), /* @__PURE__ */ C(Ug, {
			onClick: () => a({
				title: "Reset stored state?",
				body: "Clears the persisted snapshot from the active storage driver and restores factory defaults.",
				confirmLabel: "Reset state",
				danger: !0,
				onConfirm: () => {
					Zn(), i();
				}
			}),
			children: "Reset stored state…"
		})] })
	] });
}
function zg() {
	let e = Yr(), t = G((e) => e.catalog), n = G((e) => e.config), [r, i] = p(null), a = r?.filter((e) => e.pass).length ?? 0, o = r?.length ?? 0;
	return /* @__PURE__ */ w(S, { children: [/* @__PURE__ */ w(Hg, { children: [
		/* @__PURE__ */ C(Ug, {
			onClick: () => i(kg(t, n, e)),
			primary: !0,
			children: "Run full regression"
		}),
		r && /* @__PURE__ */ w("span", {
			style: {
				color: a === o ? "var(--success)" : "var(--danger)",
				fontWeight: 600
			},
			children: [
				a,
				" passed · ",
				o - a,
				" failed"
			]
		}),
		/* @__PURE__ */ C("span", {
			className: "text-[var(--faint-fg)] font-[family-name:'Geist',system-ui]",
			children: "Covers catalog, pagination, snippets, treatments, config, store invariants"
		})
	] }), r?.map((e, t) => /* @__PURE__ */ w(Wg, { children: [
		/* @__PURE__ */ C(K, {
			name: e.pass ? "check" : "close",
			size: 12,
			color: e.pass ? "var(--success)" : "var(--danger)"
		}),
		/* @__PURE__ */ C("span", {
			className: "text-[var(--fg)]",
			children: e.name
		}),
		e.detail && !e.pass && /* @__PURE__ */ C("span", {
			className: "text-[var(--danger)]",
			children: e.detail
		})
	] }, t))] });
}
function Bg() {
	let e = Dg(), [t, n] = p(0), r = f("all");
	c(() => e.subscribe(() => n((e) => e + 1)), [e]);
	let i = d(() => e.buffer(), [e, t]), a = dl();
	return /* @__PURE__ */ w(S, { children: [
		/* @__PURE__ */ w(Hg, { children: [
			/* @__PURE__ */ C(Ug, {
				onClick: () => {
					e.clear(), n((e) => e + 1);
				},
				children: "Clear"
			}),
			/* @__PURE__ */ C(Ug, {
				onClick: () => a(JSON.stringify(i, null, 2), "Logs copied"),
				children: "Export JSON"
			}),
			/* @__PURE__ */ w("span", {
				className: "text-[var(--faint-fg)]",
				children: [
					i.length,
					" entries · level ",
					e.getLevel()
				]
			})
		] }),
		i.length === 0 ? /* @__PURE__ */ C(Gg, { children: "No log entries." }) : i.slice().reverse().map((e, t) => /* @__PURE__ */ w(Wg, { children: [
			/* @__PURE__ */ C("span", {
				className: "text-[var(--faint-fg)]",
				children: Fg(e.ts)
			}),
			/* @__PURE__ */ C("span", {
				style: {
					color: e.level === "error" ? "var(--danger)" : e.level === "warn" ? "var(--warning)" : "var(--muted-fg)",
					fontWeight: 600,
					minWidth: 40
				},
				children: e.level
			}),
			/* @__PURE__ */ C("span", {
				className: "text-[var(--faint-fg)]",
				children: e.source ?? "page"
			}),
			/* @__PURE__ */ C("span", {
				className: "text-[var(--accent-text)]",
				children: e.channel
			}),
			/* @__PURE__ */ C("span", {
				className: "text-[var(--fg)]",
				children: e.message
			})
		] }, t)),
		/* @__PURE__ */ C("button", {
			hidden: !0,
			onClick: () => r.current = "all"
		})
	] });
}
function Vg() {
	let e = G((e) => e.boot), t = () => {
		let e = window.ichavaBoot;
		e && e.retry();
	}, n = (e) => {
		window.ichavaBoot?.[e]?.(!0);
	};
	return /* @__PURE__ */ w(S, { children: [
		/* @__PURE__ */ w(Hg, { children: [
			/* @__PURE__ */ C(Ug, {
				onClick: t,
				children: "Replay boot"
			}),
			/* @__PURE__ */ C(Ug, {
				onClick: () => n("simSlow"),
				children: "Sim slow"
			}),
			/* @__PURE__ */ C(Ug, {
				onClick: () => n("simOffline"),
				children: "Sim offline"
			})
		] }),
		/* @__PURE__ */ w(Wg, { children: [/* @__PURE__ */ C("span", {
			className: "text-[var(--faint-fg)]",
			children: "phase"
		}), /* @__PURE__ */ C("span", {
			className: "text-[var(--accent-text)] font-semibold",
			children: e.phase
		})] }),
		/* @__PURE__ */ w(Wg, { children: [/* @__PURE__ */ C("span", {
			className: "text-[var(--faint-fg)]",
			children: "progress"
		}), /* @__PURE__ */ w("span", {
			className: "text-[var(--fg)]",
			children: [e.progress, "%"]
		})] }),
		/* @__PURE__ */ w(Wg, { children: [/* @__PURE__ */ C("span", {
			className: "text-[var(--faint-fg)]",
			children: "label"
		}), /* @__PURE__ */ C("span", {
			className: "text-[var(--fg)]",
			children: e.label || "—"
		})] }),
		/* @__PURE__ */ w(Wg, { children: [/* @__PURE__ */ C("span", {
			className: "text-[var(--faint-fg)]",
			children: "done"
		}), /* @__PURE__ */ C("span", {
			className: "text-[var(--fg)]",
			children: String(e.done)
		})] })
	] });
}
function Hg({ children: e }) {
	return /* @__PURE__ */ C("div", {
		className: "flex items-center gap-2 mb-2.5",
		children: e
	});
}
function Ug({ children: e, onClick: t, primary: n }) {
	return /* @__PURE__ */ C("button", {
		onClick: t,
		style: {
			height: 26,
			padding: "0 10px",
			border: n ? "none" : "1px solid var(--border)",
			borderRadius: 5,
			backgroundColor: n ? "var(--accent)" : "var(--bg)",
			color: n ? "var(--accent-fg)" : "var(--fg)",
			fontSize: 11.5,
			fontWeight: 600,
			cursor: "pointer",
			fontFamily: "'Geist',system-ui"
		},
		children: e
	});
}
function Wg({ children: e }) {
	return /* @__PURE__ */ C("div", {
		className: "flex items-center gap-2 py-0.5 px-0 text-[11.5px]",
		children: e
	});
}
function Gg({ children: e }) {
	return /* @__PURE__ */ C("div", {
		className: "text-[var(--faint-fg)] font-[family-name:'Geist',system-ui] py-2 px-0",
		children: e
	});
}
// src/app/runtime.ts
var Kg = 0;
function qg() {
	let e = `ichava-${++Kg}`;
	return {
		id: e,
		logger: An.child(e)
	};
}
// src/boot/prepaint.ts
var Jg = "ichava-prepaint";
function Yg({ immediate: e = !1 } = {}) {
	if (typeof document > "u") return;
	let t = document.getElementById(Jg);
	t && !t.hasAttribute("data-leaving") && (t.setAttribute("data-leaving", ""), t.removeAttribute("data-slow"), e ? t.remove() : setTimeout(() => t.remove(), 220));
}
// src/app/mountEffects.ts
var Xg = W.ui.baseFontSize;
function Zg(e, t) {
	u(() => {
		t && _t(t) && e.getState().locale !== t && e.setState({ locale: t });
	}, [t, e]);
}
function Qg(e, t, { catalog: n, config: r, manageDocument: i }) {
	c(() => {
		n ? (e.getState().setCatalog(n), e.getState().setFiltersData(new qt(n).filters()), t.info("app", "catalog mounted", { icons: n.icons.length })) : (e.setState({ loading: !1 }), t.info("app", "REST client mounted")), r && e.getState().setConfig(r), t.configure(r), i && An.configure(r), r?.features?.demo && e.getState().seedDemoNotifications(), e.getState().tourSeen || e.getState().startTour();
	}, [
		n,
		r,
		e,
		t,
		i
	]);
}
function $g(e, t, n) {
	c(() => {
		if (!Tn(n)) return;
		let r = window, i = t.source, a = {
			id: i,
			store: e,
			config: n,
			runRegression: () => kg(e.getState().catalog, e.getState().config, e),
			logs: () => t.buffer(),
			setLogLevel: (e) => t.setLevel(e)
		};
		return r.ichava = {
			...a,
			mounts: {
				...r.ichava?.mounts,
				[i]: a
			}
		}, () => {
			let { [i]: e, ...t } = r.ichava?.mounts ?? {}, n = Object.values(t).at(-1);
			n ? r.ichava = {
				...r.ichava?.id === i ? n : r.ichava,
				mounts: t
			} : delete r.ichava;
		};
	}, [
		n,
		e,
		t
	]);
}
function e_({ manageDocument: e, theme: t, vars: n, density: r, reduceMotion: i, scale: a }) {
	c(() => {
		if (!e) return;
		let o = document.documentElement, s = o.classList.contains("dark-mode");
		o.classList.toggle("dark-mode", t === "dark");
		for (let [e, t] of Object.entries(n)) o.style.setProperty(e, t);
		return o.style.setProperty("--app-font", `${Xg}px`), o.style.setProperty("font-size", `${16 * (wc[a] || 1)}px`), o.setAttribute("data-density", r), o.toggleAttribute("data-reduce-motion", i), () => {
			o.classList.toggle("dark-mode", s), o.style.removeProperty("font-size");
			for (let e of [...ht, "--app-font"]) o.style.removeProperty(e);
			o.removeAttribute("data-density"), o.removeAttribute("data-reduce-motion");
		};
	}, [
		e,
		t,
		n,
		r,
		i,
		a
	]);
}
function t_(e, t) {
	c(() => {
		if (!e) return;
		let n = document.documentElement, r = n.getAttribute("lang"), i = n.getAttribute("dir");
		return n.setAttribute("lang", t), n.setAttribute("dir", zt(t)), () => {
			r === null ? n.removeAttribute("lang") : n.setAttribute("lang", r), i === null ? n.removeAttribute("dir") : n.setAttribute("dir", i);
		};
	}, [e, t]);
}
function n_(e, t) {
	c(() => {
		let n = e?.i18n?.endpoint;
		if (!n) return;
		let r = !0;
		return fetch(n).then((e) => e.ok ? e.json() : null).then((e) => {
			r && e && t.getState().addTranslations(e);
		}).catch(() => {}), () => {
			r = !1;
		};
	}, [e, t]);
}
function r_({ manageDocument: e, config: t, locale: n, translationOverrides: r }) {
	c(() => {
		if (!e) return;
		let i = t?.seo ?? W.seo, a = document.title, o = i?.title === W.seo.title ? Wt({
			locale: n,
			translationOverrides: r
		}, "app.documentTitle") : i?.title;
		o && (document.title = o);
		let s = !1, c = null, l = null;
		return i?.description && (c = document.head.querySelector("meta[name=\"description\"]"), c ? l = c.getAttribute("content") : (c = document.createElement("meta"), c.setAttribute("name", "description"), document.head.appendChild(c), s = !0), c.setAttribute("content", i.description)), () => {
			document.title = a, c && (s ? c.remove() : l === null ? c.removeAttribute("content") : c.setAttribute("content", l));
		};
	}, [
		e,
		t,
		n,
		r
	]);
}
function i_(e, t) {
	c(() => {
		if (typeof window > "u") return;
		let e = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
		return () => cancelAnimationFrame(e);
	}, [e, t]);
}
function a_() {
	c(() => Yg(), []);
}
// src/IchavaBrowser.tsx
var o_ = {
	light: "#ffffff",
	dark: "#0a0a0a"
};
function s_({ catalog: e, client: t, config: n = null, manageDocument: r = !1, syncUrl: i = !1, urlPrefix: a = "", store: o, locale: s }) {
	if (e == null == (t == null)) throw Error("IchavaBrowser: pass exactly one of `catalog` (static) or `client` (REST/custom).");
	return /* @__PURE__ */ C(Jr, {
		value: o ?? null,
		children: /* @__PURE__ */ C(He, {
			value: t ?? null,
			children: /* @__PURE__ */ C(c_, {
				catalog: e ?? null,
				config: n,
				manageDocument: r,
				syncUrl: i,
				urlPrefix: a,
				locale: s
			})
		})
	});
}
function c_({ catalog: e, config: t, manageDocument: n, syncUrl: r, urlPrefix: i, locale: a }) {
	let s = Yr(), { logger: c } = d(() => qg(), []);
	Zg(s, a);
	let l = G((e) => e.theme), u = G((e) => e.accent), m = G((e) => e.radius), g = G((e) => e.scale), v = G((e) => e.density), y = G((e) => e.locale), b = G((e) => e.translationOverrides), x = G((e) => e.layer), S = G((e) => e.auth.status === "authed"), T = G((e) => e.loading), E = G((e) => e.reduceMotion), D = G((e) => e.tour.active), O = G((e) => e.consent), ee = _g(O === null), te = G((e) => e.inviteOpen), k = G((e) => e.accessCollectionId), A = G((e) => e.sharedOpen), j = G((e) => e.devtools.open), M = Tn(t), N = f(null), P = f(null);
	Xr({
		manageDocument: n,
		rootRef: N,
		overlayRef: P
	}), a_(), ti({
		enabled: r,
		prefix: i
	});
	let F = d(() => ({
		enabled: r,
		prefix: i
	}), [r, i]), I = d(() => rt(u, l === "dark" ? o_.dark : o_.light), [u, l]), ne = d(() => mt(u, I, l, m), [
		u,
		I,
		l,
		m
	]);
	Qg(s, c, {
		catalog: e,
		config: t,
		manageDocument: n
	}), $g(s, c, t), e_({
		manageDocument: n,
		theme: l,
		vars: ne,
		density: v,
		reduceMotion: E,
		scale: g
	}), t_(n, y), n_(t, s), r_({
		manageDocument: n,
		config: t,
		locale: y,
		translationOverrides: b
	}), i_(g, v);
	let re = t?.brand ?? W.brand, L = `${re.name} ${re.suffix}`.trim(), R = d(() => {
		let e = wc[g] || 1;
		return {
			height: "100%",
			display: "flex",
			flexDirection: "column",
			background: "var(--bg)",
			color: "var(--fg)",
			overflow: "hidden",
			"--spacing": `${.25 * e}rem`,
			"--ich-rem": `${16 * e}px`,
			fontSize: `${Xg * e}px`,
			"--app-font": `${Xg * e}px`,
			...ne
		};
	}, [ne, g]), [z, ie] = p(null), B = o((e) => {
		P.current = e, ie(e);
	}, []), ae = o(() => z, [z]), oe = d(() => {
		let e = n ? {} : Object.fromEntries(Object.entries(R).filter(([e]) => e === "--spacing" || e === "--ich-rem" || e === "--app-font"));
		return {
			display: "contents",
			color: "var(--fg)",
			...ne,
			...e
		};
	}, [
		n,
		R,
		ne
	]);
	return /* @__PURE__ */ w(_, {
		getContainer: z ? ae : null,
		children: [typeof document < "u" && h(/* @__PURE__ */ C("div", {
			ref: B,
			className: l === "dark" ? "dark-mode" : void 0,
			style: oe,
			"data-ichava-theme": "",
			"data-ichava-portal": "",
			"data-density": v,
			"data-reduce-motion": E ? "" : void 0,
			lang: y,
			dir: zt(y)
		}), document.body), /* @__PURE__ */ C(Eg.Provider, {
			value: c,
			children: /* @__PURE__ */ C(Qr.Provider, {
				value: F,
				children: /* @__PURE__ */ C(ri.Provider, {
					value: N,
					children: /* @__PURE__ */ C(ws, { children: /* @__PURE__ */ w("div", {
						ref: N,
						className: l === "dark" ? "dark-mode" : void 0,
						style: R,
						"data-app": "ichava-browser",
						"data-ichava-root": "",
						"data-ichava-theme": "",
						"data-density": v,
						"data-reduce-motion": E ? "" : void 0,
						lang: y,
						dir: zt(y),
						children: [
							/* @__PURE__ */ C("h1", {
								className: "sr-only",
								children: L
							}),
							/* @__PURE__ */ C(Oc, {}),
							/* @__PURE__ */ w("div", {
								className: "flex-1 flex min-h-0",
								children: [/* @__PURE__ */ C(sl, {}), /* @__PURE__ */ C(_m, { loading: T })]
							}),
							x === "detail" && /* @__PURE__ */ C(fh, {}),
							x === "palette" && /* @__PURE__ */ C(Mh, {}),
							x === "library" && /* @__PURE__ */ C(Bh, {}),
							x === "settings" && /* @__PURE__ */ C(Xh, {}),
							x === "profile" && S && /* @__PURE__ */ C(fg, {}),
							x === "about" && /* @__PURE__ */ C(rg, {}),
							te && /* @__PURE__ */ C(yg, {}),
							k && /* @__PURE__ */ C(xg, {}),
							A && /* @__PURE__ */ C(Cg, {}),
							D && O !== null && /* @__PURE__ */ C(mg, {}),
							ee && /* @__PURE__ */ C(gg, {}),
							M && j && /* @__PURE__ */ C(Pg, {}),
							/* @__PURE__ */ C(ag, {}),
							/* @__PURE__ */ C(sg, {}),
							/* @__PURE__ */ C(og, {}),
							/* @__PURE__ */ C(ym, {}),
							/* @__PURE__ */ C(xm, {})
						]
					}) })
				})
			})
		})]
	});
}
// src/app/BrowserBuilder.ts
var l_ = class e {
	#e;
	#t;
	#n;
	constructor(e, t = {}) {
		this.#e = e, this.#t = Object.freeze({ ...t }), Object.seal(this);
	}
	#r(t) {
		return new e(this.#e, {
			...this.#t,
			...t
		});
	}
	catalog(t) {
		let { client: n, ...r } = this.#t;
		return new e(this.#e, {
			...r,
			catalog: t
		});
	}
	rest(t) {
		let { catalog: n, ...r } = this.#t;
		return new e(this.#e, {
			...r,
			client: t
		});
	}
	config(e) {
		return this.#r({ config: e });
	}
	persist(e) {
		return this.#r({ persistKey: e });
	}
	ephemeral() {
		return this.#r({ persistKey: null });
	}
	store(e) {
		return this.#r({ store: e });
	}
	standalone() {
		return this.#r({
			manageDocument: !0,
			syncUrl: !0
		});
	}
	embedded() {
		return this.#r({
			manageDocument: !1,
			syncUrl: !1
		});
	}
	syncUrl(e) {
		return this.#r(e === void 0 ? { syncUrl: !0 } : {
			syncUrl: !0,
			urlPrefix: e
		});
	}
	locale(e) {
		if (!_t(e)) throw RangeError(`browser(): unknown locale "${String(e)}"`);
		return this.#r({ locale: e });
	}
	#i() {
		let { catalog: e, client: t } = this.#t;
		if (!e && !t) throw Error("browser(): call .catalog(catalog) or .rest(client) before mounting.");
		return e ? { catalog: e } : { client: t };
	}
	#a() {
		let { store: e, persistKey: t } = this.#t;
		if (e) return e;
		if (t !== void 0) return this.#e.createStore({ persistKey: t });
	}
	toOptions() {
		let e = this.#t, t = { ...this.#i() };
		return e.config !== void 0 && (t.config = e.config), e.manageDocument !== void 0 && (t.manageDocument = e.manageDocument), e.syncUrl !== void 0 && (t.syncUrl = e.syncUrl), e.urlPrefix !== void 0 && (t.urlPrefix = e.urlPrefix), e.locale !== void 0 && (t.locale = e.locale), e.store ? t.store = e.store : e.persistKey !== void 0 && (t.persistKey = e.persistKey), t;
	}
	toProps() {
		let { persistKey: e, store: t, ...n } = this.toOptions();
		return this.#n ??= this.#a(), this.#n ? {
			...n,
			store: this.#n
		} : n;
	}
	mount(e) {
		let t = this.toOptions(), n = t.store ?? this.#e.createStore(t.persistKey === void 0 ? {} : { persistKey: t.persistKey }), r = this.#e.mount(e, {
			...t,
			store: n
		}), i = !0, a = () => {
			i && (i = !1, r.unmount());
		};
		return {
			store: n,
			unmount: a,
			[Symbol.dispose]: a
		};
	}
};
// src/mount.tsx
function u_(e, t) {
	let n = t.store ?? Ur(t.persistKey === void 0 ? {} : { persistKey: t.persistKey }), i = Be(e);
	return i.render(/* @__PURE__ */ C(r, { children: /* @__PURE__ */ C(s_, {
		catalog: t.catalog,
		client: t.client,
		config: t.config ?? null,
		manageDocument: t.manageDocument,
		syncUrl: t.syncUrl,
		urlPrefix: t.urlPrefix,
		store: n,
		locale: t.locale
	}) })), i;
}
function d_() {
	return new l_({
		mount: u_,
		createStore: Ur
	});
}
export { kp as BUILTIN_SNIPPET_FORMATS, l_ as BrowserBuilder, W as CONFIG_DEFAULTS, en as HttpError, rn as HttpTransport, s_ as IchavaBrowser, qt as IconRepository, $t as LARAVEL_SANCTUM_PRESET, tn as RequestAbortedError, dn as RestCatalog, Ap as SNIPPET_TABS, Np as SnippetFactory, un as StaticCatalog, ua as SvgFidelity, Sr as TASK_LOADER_DELAY_MS, Sm as TaskLoaderView, ca as assetUrl, d_ as browser, vn as createCatalog, da as fidelity, Qt as getBrowserId, Lp as iconPath, Kt as iconRef, u_ as mountIchavaBrowser, zp as renderTemplate, Ln as resolveConfig, Bp as snippetTabs, Rp as snippetTokens, Pp as snippets, la as svgDataUrl, We as svgHasOwnColors, Qp as svgToJsx, Ge as toIcon, Wr as useStore };

