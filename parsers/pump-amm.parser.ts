export const PUMP_AMM_INSTRUCTIONS: Record<
  number,
  {
    name: string;
    args: { name: string; type: string }[];
    accounts: string[];
  }
> = {
  0: {
    name: "buy",
    args: [
      { name: "base_amount_out", type: "u64" },
      { name: "max_quote_amount_in", type: "u64" },
    ],
    accounts: [
      "user",
      "base_account",
      "quote_account",
      "mint",
      "user_base",
      "user_quote",
      "program",
      "config",
    ],
  },
  1: {
    name: "collect_coin_creator_fee",
    args: [],
    accounts: ["pool", "coin_creator", "token_program"],
  },
  2: {
    name: "create_config",
    args: [
      { name: "lp_fee_basis_points", type: "u64" },
      { name: "protocol_fee_basis_points", type: "u64" },
      { name: "protocol_fee_recipients", type: "Pubkey[8]" },
      { name: "coin_creator_fee_basis_points", type: "u64" },
    ],
    accounts: ["admin", "payer", "config_account", "system_program"],
  },
  3: {
    name: "create_pool",
    args: [
      { name: "index", type: "u16" },
      { name: "base_amount_in", type: "u64" },
      { name: "quote_amount_in", type: "u64" },
      { name: "coin_creator", type: "Pubkey" },
    ],
    accounts: ["payer", "pool", "config", "base_mint", "quote_mint", "lp_mint"],
  },
  4: {
    name: "deposit",
    args: [
      { name: "lp_token_amount_out", type: "u64" },
      { name: "max_base_amount_in", type: "u64" },
      { name: "max_quote_amount_in", type: "u64" },
    ],
    accounts: [
      "user",
      "user_lp",
      "user_base",
      "user_quote",
      "pool",
      "token_program",
    ],
  },
  5: {
    name: "disable",
    args: [
      { name: "disable_create_pool", type: "bool" },
      { name: "disable_deposit", type: "bool" },
      { name: "disable_withdraw", type: "bool" },
      { name: "disable_buy", type: "bool" },
      { name: "disable_sell", type: "bool" },
    ],
    accounts: ["admin", "config"],
  },
  6: {
    name: "extend_account",
    args: [],
    accounts: ["account", "payer", "system_program"],
  },
  7: {
    name: "sell",
    args: [
      { name: "base_amount_in", type: "u64" },
      { name: "min_quote_amount_out", type: "u64" },
    ],
    accounts: [
      "user",
      "base_account",
      "quote_account",
      "mint",
      "user_base",
      "user_quote",
      "program",
      "config",
    ],
  },
  8: {
    name: "set_coin_creator",
    args: [],
    accounts: ["admin", "pool", "coin_creator"],
  },
  9: {
    name: "update_admin",
    args: [],
    accounts: ["current_admin", "new_admin"],
  },
  10: {
    name: "update_fee_config",
    args: [
      { name: "lp_fee_basis_points", type: "u64" },
      { name: "protocol_fee_basis_points", type: "u64" },
      { name: "protocol_fee_recipients", type: "Pubkey[8]" },
      { name: "coin_creator_fee_basis_points", type: "u64" },
    ],
    accounts: ["admin", "config"],
  },
  11: {
    name: "withdraw",
    args: [
      { name: "lp_token_amount_in", type: "u64" },
      { name: "min_base_amount_out", type: "u64" },
      { name: "min_quote_amount_out", type: "u64" },
    ],
    accounts: [
      "user",
      "user_lp",
      "user_base",
      "user_quote",
      "pool",
      "token_program",
    ],
  },
};
