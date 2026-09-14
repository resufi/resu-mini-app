import { useEffect, useState } from "react";
import { isTelegram, supports, tg, type TelegramWebApp } from "../lib/telegram.ts";

const ROOT_VARS = {
	viewport: "--tg-viewport",
	stable: "--tg-viewport-stable",
	top: "--tg-safe-top",
	bottom: "--tg-safe-bottom",
	left: "--tg-safe-left",
	right: "--tg-safe-right",
} as const;

function token(name: string): string {
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
	return /^#[0-9a-f]{3,8}$/i.test(value) ? value : "#ffffff";
}

function applyMetrics(app: TelegramWebApp): void {
	const root = document.documentElement.style;
	root.setProperty(ROOT_VARS.viewport, `${app.viewportHeight}px`);
	root.setProperty(ROOT_VARS.stable, `${app.viewportStableHeight}px`);

	const safe = app.safeAreaInset;
	const content = app.contentSafeAreaInset;
	const sum = (a?: number, b?: number) => `${(a ?? 0) + (b ?? 0)}px`;

	root.setProperty(ROOT_VARS.top, sum(safe?.top, content?.top));
	root.setProperty(ROOT_VARS.bottom, sum(safe?.bottom, content?.bottom));
	root.setProperty(ROOT_VARS.left, sum(safe?.left, content?.left));
	root.setProperty(ROOT_VARS.right, sum(safe?.right, content?.right));
}

export function useTelegram(): { inTelegram: boolean } {
	const [inTelegram] = useState(isTelegram);

	useEffect(() => {
		const app = tg();
		if (!app) return;

		app.ready();
		app.expand();

		if (supports("7.7")) app.disableVerticalSwipes?.();
		if (supports("6.1")) {
			const bg = token("--bg");
			app.setHeaderColor?.(bg);
			app.setBackgroundColor?.(bg);
			if (supports("7.10")) app.setBottomBarColor?.(bg);
		}

		const apply = () => applyMetrics(app);
		apply();

		const events = ["viewportChanged", "safeAreaChanged", "contentSafeAreaChanged"];
		for (const e of events) app.onEvent(e, apply);

		document.documentElement.dataset.telegram = "true";

		return () => {
			for (const e of events) app.offEvent(e, apply);
		};
	}, []);

	return { inTelegram };
}
