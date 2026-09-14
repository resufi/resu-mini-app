import type { TelegramWebApp } from "./telegram.ts";

type Host = { Telegram?: { WebApp?: TelegramWebApp } };

const INSETS = {
	ios: { top: 47, bottom: 34, left: 0, right: 0 },
	android: { top: 24, bottom: 0, left: 0, right: 0 },
	desktop: { top: 0, bottom: 0, left: 0, right: 0 },
};

export function installTelegramMock(): void {
	if (!import.meta.env.DEV) return;

	const mode = new URLSearchParams(window.location.search).get("tg");
	if (!mode) return;

	const host = globalThis as Host;
	const real = host.Telegram?.WebApp;
	if (real && real.platform && real.platform !== "unknown") return;

	const platform = mode === "1" ? "ios" : mode;
	const safe = INSETS[platform as keyof typeof INSETS] ?? INSETS.ios;
	const listeners = new Map<string, Set<() => void>>();

	const app: TelegramWebApp = {
		initData: "",
		version: "8.0",
		platform,
		colorScheme: "light",
		viewportHeight: window.innerHeight,
		viewportStableHeight: window.innerHeight,
		isExpanded: true,
		safeAreaInset: safe,
		contentSafeAreaInset: { top: 46, bottom: 0, left: 0, right: 0 },
		ready: () => undefined,
		expand: () => undefined,
		onEvent(event, handler) {
			const set = listeners.get(event) ?? new Set();
			set.add(handler);
			listeners.set(event, set);
		},
		offEvent(event, handler) {
			listeners.get(event)?.delete(handler);
		},
		setHeaderColor: () => undefined,
		setBackgroundColor: () => undefined,
		setBottomBarColor: () => undefined,
		disableVerticalSwipes: () => undefined,
		openLink: (url) => {
			window.open(url, "_blank", "noopener,noreferrer");
		},
		HapticFeedback: {
			impactOccurred: (style) => console.info(`[tg mock] haptic ${style}`),
			notificationOccurred: (type) => console.info(`[tg mock] haptic ${type}`),
		},
	};

	window.addEventListener("resize", () => {
		app.viewportHeight = window.innerHeight;
		app.viewportStableHeight = window.innerHeight;
		listeners.get("viewportChanged")?.forEach((handler) => handler());
	});

	host.Telegram = { ...host.Telegram, WebApp: app };
	console.info(`[tg mock] platform=${platform}, safe area ${safe.top}/${safe.bottom}`);
}
