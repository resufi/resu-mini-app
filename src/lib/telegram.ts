export type HapticStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
export type HapticNotification = "error" | "success" | "warning";

type Inset = { top: number; bottom: number; left: number; right: number };

export type TelegramWebApp = {
	initData: string;
	version: string;
	platform: string;
	colorScheme: "light" | "dark";
	viewportHeight: number;
	viewportStableHeight: number;
	isExpanded: boolean;
	safeAreaInset?: Inset;
	contentSafeAreaInset?: Inset;
	ready(): void;
	expand(): void;
	onEvent(event: string, handler: () => void): void;
	offEvent(event: string, handler: () => void): void;
	setHeaderColor?(color: string): void;
	setBackgroundColor?(color: string): void;
	setBottomBarColor?(color: string): void;
	disableVerticalSwipes?(): void;
	openLink?(url: string, options?: { try_instant_view?: boolean }): void;
	HapticFeedback?: {
		impactOccurred(style: HapticStyle): void;
		notificationOccurred(type: HapticNotification): void;
	};
};

export function tg(): TelegramWebApp | null {
	const host = globalThis as { Telegram?: { WebApp?: TelegramWebApp } };
	return host.Telegram?.WebApp ?? null;
}

export function isTelegram(): boolean {
	const app = tg();
	return Boolean(app && app.platform && app.platform !== "unknown");
}

export function supports(version: string): boolean {
	const app = tg();
	if (!app?.version) return false;
	const have = app.version.split(".").map(Number);
	const need = version.split(".").map(Number);
	for (let i = 0; i < Math.max(have.length, need.length); i++) {
		const a = have[i] ?? 0;
		const b = need[i] ?? 0;
		if (a !== b) return a > b;
	}
	return true;
}

export function haptic(style: HapticStyle = "light"): void {
	try {
		tg()?.HapticFeedback?.impactOccurred(style);
	} catch {
		return;
	}
}

export function hapticNotify(type: HapticNotification): void {
	try {
		tg()?.HapticFeedback?.notificationOccurred(type);
	} catch {
		return;
	}
}

export function openExternal(url: string): void {
	const app = tg();
	if (app?.openLink) {
		app.openLink(url);
		return;
	}
	window.open(url, "_blank", "noopener,noreferrer");
}
