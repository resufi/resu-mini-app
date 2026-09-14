import { useEffect, useRef, useState } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import { deployment, isDeployed } from "./lib/config.ts";
import { fmtAmount, fmtBps, fmtDuration, shortAddress } from "./lib/format.ts";
import { useProtocol } from "./hooks/useProtocol.ts";
import { hasApiKey } from "./lib/chain.ts";
import { Waterfall } from "./components/Waterfall.tsx";
import { DepositPanel } from "./components/DepositPanel.tsx";
import { PositionsPanel } from "./components/PositionsPanel.tsx";
import { Logo } from "./components/Logo.tsx";
import { NetworkControls } from "./components/NetworkControls.tsx";
import { useTelegram } from "./hooks/useTelegram.ts";
import { Loader } from "./components/Loader.tsx";
import { HeroSkeleton } from "./components/HeroSkeleton.tsx";
import css from "./App.module.css";

const LOADER_MIN_MS = 3800;

const ASSET = "tsTON";
const UNIT = "GRAM";

export default function App() {
	useTelegram();
	const { data, error, loading, refresh, network } = useProtocol();
	const wallet = useTonAddress();
	const [selected, setSelected] = useState(0);

	const booted = useRef(false);
	useEffect(() => {
		if (data) booted.current = true;
	}, [data]);

	const [minShown, setMinShown] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setMinShown(true), LOADER_MIN_MS);
		return () => clearTimeout(t);
	}, []);

	if (!booted.current && (!minShown || (isDeployed && !data && !error))) {
		return <Loader />;
	}


	return (
		<div className={css.page}>
			<header className={css.topbar}>
				<span className={css.brand}>
					<Logo />
					Resu
					{network === "testnet" && <span className={css.chip}>testnet</span>}
				</span>
				<NetworkControls />
			</header>

			<h1 className={css.lede} data-lede>
				Staking where you pick
				<br />
				your place in the loss queue.
			</h1>

			{!isDeployed ? (
				<NotDeployed />
			) : !data ? (
				error ? (
					<p className={css.state}>
						{error}{" "}
						<button className={css.linkish} onClick={() => void refresh()}>
							Retry
						</button>
					</p>
				) : (
					<HeroSkeleton />
				)
			) : (
				<>
					{(error || !hasApiKey) && (
						<p className={`${css.state} small`}>
							{error
								? "Data may be stale."
								: "Public node is rate-limited, so reads are slow."}
							{!hasApiKey && " A toncenter API key removes the limit."}{" "}
							<button className={css.linkish} onClick={() => void refresh()}>
								Refresh
							</button>
						</p>
					)}

					<div className={css.hero}>
						<Waterfall
							tranches={data.tranches}
							headroom={data.headroom}
							mandate={deployment.mandate}
							rate={data.rate}
							asset={ASSET}
							selected={selected}
							onSelect={setSelected}
						/>

						<div className={css.side}>
							{wallet ? (
								<>
									<DepositPanel
										data={data}
										trancheId={selected}
										onDone={() => void refresh()}
									/>
									<PositionsPanel
										data={data}
										withdrawDelay={data.vault.withdrawDelay}
										asset={ASSET}
										unit={UNIT}
										onDone={() => void refresh()}
									/>
								</>
							) : (
								<p className={css.state}>
									Pick a tranche, then connect a wallet to deposit.
								</p>
							)}
						</div>
					</div>

					<Details vault={data.vault} loading={loading} />
				</>
			)}
		</div>
	);
}

function Details({
	vault,
	loading,
}: {
	vault: {
		maxLossBps: number;
		withdrawDelay: number;
		principalDeposited: bigint;
		cumulativeLoss: bigint;
	};
	loading: boolean;
}) {
	const m = deployment.mandate;
	return (
		<details className={css.details}>
			<summary>Rules and addresses{loading ? " · refreshing" : ""}</summary>

			<dl className={css.facts}>
				<div>
					<dt>Loss cap</dt>
					<dd className="num">{fmtBps(vault.maxLossBps)}</dd>
				</div>
				<div>
					<dt>Withdrawal</dt>
					<dd className="num">{fmtDuration(vault.withdrawDelay)}</dd>
				</div>
				<div>
					<dt>Senior fee</dt>
					<dd className="num">{fmtBps(m.seniorFeeBps)}</dd>
				</div>
				<div>
					<dt>Total deposited</dt>
					<dd className="num">{fmtAmount(vault.principalDeposited)}</dd>
				</div>
				<div>
					<dt>Losses applied</dt>
					<dd className="num">{fmtAmount(vault.cumulativeLoss)}</dd>
				</div>
			</dl>

			<p className="muted small">
				The mandate is immutable: different rules mean a different vault, not an
				edit.
			</p>

			<ul className={css.addrs}>
				<li>
					Vault <code>{shortAddress(deployment.vault!)}</code>
				</li>
				<li>
					Registry <code>{shortAddress(deployment.registry!)}</code>
				</li>
				<li>
					Asset <code>{shortAddress(deployment.jettonMaster!)}</code>
				</li>
			</ul>
		</details>
	);
}

function NotDeployed() {
	return (
		<section>
			<h2 className={css.title}>Protocol not deployed</h2>
			<p className="muted small">
				No addresses in <code>src/deployments/{deployment.network}.json</code>.
			</p>
			<pre className={css.code}>
				<code>
					npx blueprint run deployAll --{deployment.network}
					{"\n"}cp deployments/{deployment.network}.json
					../../frontend/src/deployments/
				</code>
			</pre>
		</section>
	);
}
