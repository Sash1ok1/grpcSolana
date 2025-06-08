export const SYSTEM_INSTRUCTIONS: Record<
  number,
  {
    name: string;
    args: { name: string; type: string }[];
    accounts: string[];
  }
> = {
  0: {
    name: "CreateAccount",
    args: [
      { name: "lamports", type: "u64" },
      { name: "space", type: "u64" },
      { name: "programId", type: "Pubkey" },
    ],
    accounts: ["from", "to"],
  },
  1: {
    name: "Assign",
    args: [{ name: "programId", type: "Pubkey" }],
    accounts: ["account"],
  },
  2: {
    name: "Transfer",
    args: [{ name: "lamports", type: "u64" }],
    accounts: ["from", "to"],
  },
  3: {
    name: "CreateAccountWithSeed",
    args: [
      { name: "base", type: "Pubkey" },
      { name: "seed", type: "string" },
      { name: "lamports", type: "u64" },
      { name: "space", type: "u64" },
      { name: "programId", type: "Pubkey" },
    ],
    accounts: ["from", "to"],
  },
  4: {
    name: "AdvanceNonceAccount",
    args: [],
    accounts: ["nonce", "authorized"],
  },
  5: {
    name: "WithdrawNonceAccount",
    args: [{ name: "lamports", type: "u64" }],
    accounts: ["nonce", "to", "authorized"],
  },
  6: {
    name: "InitializeNonceAccount",
    args: [{ name: "authorized", type: "Pubkey" }],
    accounts: ["nonce", "recentBlockhashesSysvar", "rentSysvar"],
  },
  7: {
    name: "AuthorizeNonceAccount",
    args: [{ name: "authorized", type: "Pubkey" }],
    accounts: ["nonce", "currentAuthorized"],
  },
  8: {
    name: "Allocate",
    args: [{ name: "space", type: "u64" }],
    accounts: ["account"],
  },
  9: {
    name: "AllocateWithSeed",
    args: [
      { name: "base", type: "Pubkey" },
      { name: "seed", type: "string" },
      { name: "space", type: "u64" },
      { name: "programId", type: "Pubkey" },
    ],
    accounts: ["account"],
  },
  10: {
    name: "AssignWithSeed",
    args: [
      { name: "base", type: "Pubkey" },
      { name: "seed", type: "string" },
      { name: "programId", type: "Pubkey" },
    ],
    accounts: ["account"],
  },
  11: {
    name: "TransferWithSeed",
    args: [
      { name: "lamports", type: "u64" },
      { name: "fromSeed", type: "string" },
      { name: "fromOwner", type: "Pubkey" },
    ],
    accounts: ["from", "to"],
  },
};
