export const SPL_TOKEN_INSTRUCTIONS: Record<
  number,
  {
    name: string;
    args: { name: string; type: string }[];
    accounts: string[];
  }
> = {
  0: {
    name: "initialize_mint",
    args: [
      { name: "decimals", type: "u8" },
      { name: "mint_authority", type: "Pubkey" },
      { name: "freeze_authority_option", type: "u8" },
      { name: "freeze_authority", type: "Pubkey" },
    ],
    accounts: ["mint"],
  },
  1: {
    name: "initialize_account",
    args: [],
    accounts: ["account", "mint", "owner"],
  },
  2: {
    name: "initialize_multisig",
    args: [{ name: "m", type: "u8" }],
    accounts: ["multisig"],
  },
  3: {
    name: "transfer",
    args: [{ name: "amount", type: "u64" }],
    accounts: ["source", "destination", "owner"],
  },
  4: {
    name: "approve",
    args: [{ name: "amount", type: "u64" }],
    accounts: ["source", "delegate", "owner"],
  },
  5: {
    name: "revoke",
    args: [],
    accounts: ["source", "owner"],
  },
  6: {
    name: "set_authority",
    args: [
      { name: "authority_type", type: "u8" },
      { name: "new_authority_option", type: "u8" },
      { name: "new_authority", type: "Pubkey" },
    ],
    accounts: ["account_or_mint", "current_authority"],
  },
  7: {
    name: "mint_to",
    args: [{ name: "amount", type: "u64" }],
    accounts: ["mint", "account", "mint_authority"],
  },
  8: {
    name: "burn",
    args: [{ name: "amount", type: "u64" }],
    accounts: ["account", "mint", "owner"],
  },
  9: {
    name: "close_account",
    args: [],
    accounts: ["account", "destination", "owner"],
  },
  10: {
    name: "freeze_account",
    args: [],
    accounts: ["account", "mint", "freeze_authority"],
  },
  11: {
    name: "thaw_account",
    args: [],
    accounts: ["account", "mint", "freeze_authority"],
  },
  12: {
    name: "transfer_checked",
    args: [
      { name: "amount", type: "u64" },
      { name: "decimals", type: "u8" },
    ],
    accounts: ["source", "mint", "destination", "owner"],
  },
  13: {
    name: "approve_checked",
    args: [
      { name: "amount", type: "u64" },
      { name: "decimals", type: "u8" },
    ],
    accounts: ["source", "mint", "delegate", "owner"],
  },
  14: {
    name: "mint_to_checked",
    args: [
      { name: "amount", type: "u64" },
      { name: "decimals", type: "u8" },
    ],
    accounts: ["mint", "account", "mint_authority"],
  },
  15: {
    name: "burn_checked",
    args: [
      { name: "amount", type: "u64" },
      { name: "decimals", type: "u8" },
    ],
    accounts: ["account", "mint", "owner"],
  },
  16: {
    name: "initialize_account2",
    args: [{ name: "owner", type: "Pubkey" }],
    accounts: ["account", "mint"],
  },
  17: {
    name: "sync_native",
    args: [],
    accounts: ["account"],
  },
  18: {
    name: "initialize_account3",
    args: [{ name: "owner", type: "Pubkey" }],
    accounts: ["account", "mint"],
  },
  19: {
    name: "initialize_multisig2",
    args: [{ name: "m", type: "u8" }],
    accounts: ["multisig"],
  },
  20: {
    name: "initialize_mint2",
    args: [
      { name: "decimals", type: "u8" },
      { name: "mint_authority", type: "Pubkey" },
      { name: "freeze_authority_option", type: "u8" },
      { name: "freeze_authority", type: "Pubkey" },
    ],
    accounts: ["mint"],
  },
  21: {
    name: "get_account_data_size",
    args: [{ name: "extension_types_len", type: "u8" }],
    accounts: ["mint"],
  },
  22: {
    name: "initialize_immutable_owner",
    args: [],
    accounts: ["account"],
  },
  23: {
    name: "amount_to_ui_amount",
    args: [{ name: "amount", type: "u64" }],
    accounts: ["mint"],
  },
  24: {
    name: "ui_amount_to_amount",
    args: [
      { name: "ui_amount_len", type: "u32" },
      { name: "ui_amount", type: "string" },
    ],
    accounts: ["mint"],
  },
};
