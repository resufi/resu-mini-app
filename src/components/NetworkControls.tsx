import { TonConnectButton } from "@tonconnect/ui-react";
import css from "./NetworkControls.module.css";

export function NetworkControls() {
	return (
		<span className={css.controls}>
			<span className={css.wallet}>
				<TonConnectButton />
			</span>
		</span>
	);
}
