use std::time::{SystemTime, UNIX_EPOCH};

use odra::casper_types::U256;
use odra::host::{Deployer, NoArgs};
use odra::prelude::Addressable;
use rwa_oracle::RwaOracle;

const DEFAULT_DEPLOY_GAS: u64 = 800_000_000_000;
const DEFAULT_CALL_GAS: u64 = 150_000_000_000;
const DEMO_ORACLE_NAME: &str = "casper-rwa-agent-demo";
const DEMO_ASSET_ID: &str = "rwa-demo-invoice-001";
const DEMO_EVIDENCE_HASH: &str =
    "sha256:9d9c4b27d7ec8f245fbe28f5ac6f1d3a75b8a6d4b13f8a932dc4c4b84ddf2f4f";

fn main() {
    let env = odra_casper_livenet_env::env();
    let caller = env.caller();

    println!("Casper RWA Oracle deployment starting");
    println!("caller={}", caller.to_formatted_string());
    println!("network={}", network_name());

    let deploy_gas = env_u64("RWA_ORACLE_DEPLOY_GAS", DEFAULT_DEPLOY_GAS);
    let call_gas = env_u64("RWA_ORACLE_CALL_GAS", DEFAULT_CALL_GAS);
    println!("deploy_gas={}", deploy_gas);
    println!("call_gas={}", call_gas);

    env.set_gas(deploy_gas);
    let mut contract = RwaOracle::deploy(&env, NoArgs);
    let contract_address = contract.address();
    println!(
        "contract_package_hash={}",
        contract_address.to_formatted_string()
    );

    env.set_gas(call_gas);
    contract.register_oracle(DEMO_ORACLE_NAME.to_string(), caller);
    println!("registered_oracle={}", caller.to_formatted_string());

    env.set_gas(call_gas);
    contract.publish_data(
        DEMO_ASSET_ID.to_string(),
        U256::from(1_250_000u64),
        unix_timestamp_secs(),
        91,
        Some(DEMO_EVIDENCE_HASH.to_string()),
    );

    let latest = contract.get_latest_data(DEMO_ASSET_ID.to_string());
    println!("sample_asset_id={}", DEMO_ASSET_ID);
    println!("sample_value={}", latest.value);
    println!("sample_confidence={}", latest.confidence);
    println!(
        "sample_evidence_hash={}",
        latest.evidence_hash.unwrap_or_default()
    );
}

fn network_name() -> String {
    std::env::var("ODRA_CASPER_LIVENET_CHAIN_NAME").unwrap_or_else(|_| "casper-test".to_string())
}

fn env_u64(name: &str, default: u64) -> u64 {
    std::env::var(name)
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(default)
}

fn unix_timestamp_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock should be after UNIX epoch")
        .as_secs()
}
