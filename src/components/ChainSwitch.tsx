import { CHAIN_LIST, type ChainId, type ChainInfo } from "../lib/chains.ts";
import css from "./ChainSwitch.module.css";

type Props = {
	value: ChainId;
	onChange: (id: ChainId) => void;
	chains?: ChainInfo[];
};

export function ChainSwitch({ value, onChange, chains = CHAIN_LIST }: Props) {
	const active = Math.max(
		0,
		chains.findIndex((c) => c.id === value),
	);

	return (
		<div
			className={css.switch}
			role="tablist"
			aria-label="Network"
			style={{
				["--n" as string]: chains.length,
				["--i" as string]: active,
			}}
		>
			<span className={css.thumb} aria-hidden="true" />

			{chains.map((c) => (
				<button
					key={c.id}
					type="button"
					role="tab"
					aria-selected={value === c.id}
					className={`${css.tab} ${value === c.id ? css.on : ""}`}
					onClick={() => onChange(c.id)}
				>
					{c.name}
					{!c.deployed && <span className={css.soon}>soon</span>}
				</button>
			))}
		</div>
	);
}
