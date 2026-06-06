#![no_std]

use odra::casper_types::U256;
use odra::prelude::*;

const DEFAULT_REPUTATION: u64 = 100;
const ERR_UNAUTHORIZED: u16 = 1_001;
const ERR_DUPLICATE_ORACLE: u16 = 1_002;
const ERR_ORACLE_ID_MISMATCH: u16 = 1_003;
const ERR_ORACLE_NOT_REGISTERED: u16 = 1_004;
const ERR_ORACLE_NOT_FOUND: u16 = 1_005;
const ERR_INVALID_CONFIDENCE: u16 = 1_006;
const ERR_DATA_NOT_FOUND: u16 = 1_007;

#[cfg(test)]
extern crate std;

#[odra::odra_type]
pub struct OracleInfo {
    pub name: String,
    pub public_key: Address,
    pub registered_at: u64,
    pub active: bool,
}

#[odra::odra_type]
pub struct DataPoint {
    pub asset_id: String,
    pub value: U256,
    pub timestamp: u64,
    pub confidence: u8,
    pub oracle_id: Address,
    pub evidence_hash: Option<String>,
}

#[odra::odra_type]
struct HistoryKey {
    asset_id: String,
    index: u32,
}

#[cfg(target_arch = "wasm32")]
fn user_error(code: u16, _message: &str) -> OdraError {
    OdraError::user(code)
}

#[cfg(not(target_arch = "wasm32"))]
fn user_error(code: u16, message: &str) -> OdraError {
    OdraError::user(code, message)
}

#[odra::module]
pub struct RwaOracle {
    owner: Var<Address>,
    oracle_infos: Mapping<Address, OracleInfo>,
    registered_oracles: Mapping<Address, bool>,
    reputations: Mapping<Address, u64>,
    latest_data: Mapping<String, DataPoint>,
    history_lengths: Mapping<String, u32>,
    history: Mapping<HistoryKey, DataPoint>,
    slash_reasons: Mapping<Address, String>,
}

#[odra::module]
impl RwaOracle {
    pub fn init(&mut self) {
        self.owner.set(self.caller());
    }

    pub fn register_oracle(&mut self, name: String, public_key: Address) {
        let caller = self.caller();
        if public_key != caller {
            self.revert(
                ERR_ORACLE_ID_MISMATCH,
                "oracle public key must match caller",
            );
        }
        if self.oracle_infos.get(&public_key).is_some() {
            self.revert(ERR_DUPLICATE_ORACLE, "oracle already registered");
        }

        let info = OracleInfo {
            name,
            public_key,
            registered_at: self.env().get_block_time_secs(),
            active: true,
        };
        self.oracle_infos.set(&public_key, info);
        self.registered_oracles.set(&public_key, true);
        self.reputations.set(&public_key, DEFAULT_REPUTATION);
    }

    pub fn get_oracle_info(&self, oracle_id: Address) -> OracleInfo {
        self.oracle_infos
            .get(&oracle_id)
            .unwrap_or_revert_with(self, user_error(ERR_ORACLE_NOT_FOUND, "oracle not found"))
    }

    pub fn is_registered(&self, address: Address) -> bool {
        self.registered_oracles.get_or_default(&address)
    }

    pub fn publish_data(
        &mut self,
        asset_id: String,
        value: U256,
        timestamp: u64,
        confidence: u8,
        evidence_hash: Option<String>,
    ) {
        if confidence > 100 {
            self.revert(ERR_INVALID_CONFIDENCE, "confidence must be 0..100");
        }

        let oracle_id = self.caller();
        if !self.is_registered(oracle_id) {
            self.revert(ERR_ORACLE_NOT_REGISTERED, "oracle is not registered");
        }

        let data_point = DataPoint {
            asset_id: asset_id.clone(),
            value,
            timestamp,
            confidence,
            oracle_id,
            evidence_hash,
        };
        let index = self.history_lengths.get_or_default(&asset_id);
        let history_key = HistoryKey {
            asset_id: asset_id.clone(),
            index,
        };

        self.latest_data.set(&asset_id, data_point.clone());
        self.history.set(&history_key, data_point);
        self.history_lengths.set(&asset_id, index + 1);
    }

    pub fn get_latest_data(&self, asset_id: String) -> DataPoint {
        self.latest_data.get(&asset_id).unwrap_or_revert_with(
            self,
            user_error(ERR_DATA_NOT_FOUND, "latest data not found"),
        )
    }

    pub fn get_history(&self, asset_id: String, count: u32) -> Vec<DataPoint> {
        let len = self.history_lengths.get_or_default(&asset_id);
        let capped_count = if count > len { len } else { count };
        let mut result = Vec::new();

        for offset in 0..capped_count {
            let index = len - offset - 1;
            let history_key = HistoryKey {
                asset_id: asset_id.clone(),
                index,
            };
            if let Some(point) = self.history.get(&history_key) {
                result.push(point);
            }
        }

        result
    }

    pub fn update_reputation(&mut self, oracle_id: Address, accuracy_delta: i32) {
        self.ensure_owner();
        if self.oracle_infos.get(&oracle_id).is_none() {
            self.revert(ERR_ORACLE_NOT_FOUND, "oracle not found");
        }

        let current = self.reputations.get_or_default(&oracle_id);
        let updated = if accuracy_delta >= 0 {
            current.saturating_add(accuracy_delta as u64)
        } else {
            current.saturating_sub(accuracy_delta.unsigned_abs() as u64)
        };

        self.reputations.set(&oracle_id, updated);
    }

    pub fn get_reputation(&self, oracle_id: Address) -> u64 {
        self.reputations.get_or_default(&oracle_id)
    }

    pub fn slash(&mut self, oracle_id: Address, reason: String) {
        self.ensure_owner();
        let mut info = self
            .oracle_infos
            .get(&oracle_id)
            .unwrap_or_revert_with(self, user_error(ERR_ORACLE_NOT_FOUND, "oracle not found"));

        info.active = false;
        self.oracle_infos.set(&oracle_id, info);
        self.registered_oracles.set(&oracle_id, false);
        self.reputations.set(&oracle_id, 0);
        self.slash_reasons.set(&oracle_id, reason);
    }

    pub fn pause_oracle(&mut self, oracle_id: Address) {
        self.ensure_owner();
        let mut info = self
            .oracle_infos
            .get(&oracle_id)
            .unwrap_or_revert_with(self, user_error(ERR_ORACLE_NOT_FOUND, "oracle not found"));

        info.active = false;
        self.oracle_infos.set(&oracle_id, info);
        self.registered_oracles.set(&oracle_id, false);
    }

    fn caller(&self) -> Address {
        self.env().caller()
    }

    fn ensure_owner(&self) {
        if self.caller()
            != self
                .owner
                .get_or_revert_with(user_error(ERR_UNAUTHORIZED, "owner not initialized"))
        {
            self.revert(ERR_UNAUTHORIZED, "caller is not owner");
        }
    }

    fn revert(&self, code: u16, message: &str) -> ! {
        self.env().revert(user_error(code, message))
    }
}

#[cfg(test)]
mod tests {
    use crate::{DataPoint, RwaOracle, RwaOracleHostRef};
    use odra::casper_types::U256;
    use odra::host::{Deployer, NoArgs};
    use odra::prelude::ToString;

    fn deploy() -> (
        odra::host::HostEnv,
        RwaOracleHostRef,
        odra::prelude::Address,
        odra::prelude::Address,
        odra::prelude::Address,
    ) {
        let env = odra_test::env();
        let owner = env.get_account(0);
        let oracle = env.get_account(1);
        let stranger = env.get_account(2);
        env.set_caller(owner);
        let contract = RwaOracle::deploy(&env, NoArgs);
        (env, contract, owner, oracle, stranger)
    }

    #[test]
    fn duplicate_oracle_registration_is_rejected() {
        let (env, mut contract, _owner, oracle, _stranger) = deploy();
        env.set_caller(oracle);

        contract.register_oracle("northstar".to_string(), oracle);

        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            contract.register_oracle("northstar-copy".to_string(), oracle);
        }))
        .expect_err("duplicate registration should revert");
    }

    #[test]
    fn registered_oracle_can_publish_data() {
        let (env, mut contract, _owner, oracle, _stranger) = deploy();
        env.set_caller(oracle);
        contract.register_oracle("northstar".to_string(), oracle);

        contract.publish_data(
            "rwa/property/sfo-001".to_string(),
            U256::from(825_000u64),
            1_780_707_600,
            91,
            Some("sha256:x402-paid-evidence-demo".to_string()),
        );

        let latest = contract.get_latest_data("rwa/property/sfo-001".to_string());
        assert_eq!(latest.asset_id, "rwa/property/sfo-001");
        assert_eq!(latest.value, U256::from(825_000u64));
        assert_eq!(latest.timestamp, 1_780_707_600);
        assert_eq!(latest.confidence, 91);
        assert_eq!(latest.oracle_id, oracle);
        assert_eq!(
            latest.evidence_hash,
            Some("sha256:x402-paid-evidence-demo".to_string())
        );
    }

    #[test]
    fn unregistered_oracle_publish_is_rejected() {
        let (env, mut contract, _owner, _oracle, stranger) = deploy();
        env.set_caller(stranger);

        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            contract.publish_data(
                "rwa/bond/us-t-10y".to_string(),
                U256::from(430u64),
                1_780_707_700,
                80,
                None,
            );
        }))
        .expect_err("unregistered oracle publish should revert");
    }

    #[test]
    fn reputation_updates_and_slash_are_owner_controlled() {
        let (env, mut contract, owner, oracle, stranger) = deploy();
        env.set_caller(oracle);
        contract.register_oracle("northstar".to_string(), oracle);

        env.set_caller(owner);
        contract.update_reputation(oracle, 25);
        contract.update_reputation(oracle, -5);
        assert_eq!(contract.get_reputation(oracle), 120);

        env.set_caller(stranger);
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            contract.update_reputation(oracle, 1);
        }))
        .expect_err("non-owner reputation update should revert");

        env.set_caller(owner);
        contract.slash(oracle, "incorrect appraisal evidence".to_string());
        assert_eq!(contract.get_reputation(oracle), 0);
        assert!(!contract.is_registered(oracle));
    }

    #[test]
    fn history_returns_newest_data_first() {
        let (env, mut contract, _owner, oracle, _stranger) = deploy();
        env.set_caller(oracle);
        contract.register_oracle("northstar".to_string(), oracle);
        contract.publish_data(
            "rwa/property/sfo-001".to_string(),
            U256::from(810_000u64),
            1,
            88,
            None,
        );
        contract.publish_data(
            "rwa/property/sfo-001".to_string(),
            U256::from(825_000u64),
            2,
            91,
            Some("sha256:second-evidence".to_string()),
        );

        let history = contract.get_history("rwa/property/sfo-001".to_string(), 2);

        assert_eq!(
            history,
            odra::prelude::vec![
                DataPoint {
                    asset_id: "rwa/property/sfo-001".to_string(),
                    value: U256::from(825_000u64),
                    timestamp: 2,
                    confidence: 91,
                    oracle_id: oracle,
                    evidence_hash: Some("sha256:second-evidence".to_string()),
                },
                DataPoint {
                    asset_id: "rwa/property/sfo-001".to_string(),
                    value: U256::from(810_000u64),
                    timestamp: 1,
                    confidence: 88,
                    oracle_id: oracle,
                    evidence_hash: None,
                },
            ]
        );
    }

    #[test]
    fn paused_oracle_cannot_publish_data() {
        let (env, mut contract, owner, oracle, _stranger) = deploy();
        env.set_caller(oracle);
        contract.register_oracle("northstar".to_string(), oracle);

        env.set_caller(owner);
        contract.pause_oracle(oracle);

        env.set_caller(oracle);
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            contract.publish_data(
                "rwa/property/sfo-001".to_string(),
                U256::from(825_000u64),
                1_780_707_600,
                91,
                None,
            );
        }))
        .expect_err("paused oracle publish should revert");
    }
}
