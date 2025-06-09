export interface IFormattedTransactionData {
  signature: string;
  slot: string;

  [accountName: string]: string;
}

export interface ICompiledInstruction {
  programIdIndex: number;
  accounts: Uint8Array;
  data: Uint8Array;
}

export interface IMessage {
  header: IMessageHeader | undefined;
  accountKeys: Uint8Array[];
  recentBlockhash: Uint8Array;
  instructions: ICompiledInstruction[];
  versioned: boolean;
  addressTableLookups: IMessageAddressTableLookup[];
}

export interface IMessageHeader {
  numRequiredSignatures: number;
  numReadonlySignedAccounts: number;
  numReadonlyUnsignedAccounts: number;
}

export interface IMessageAddressTableLookup {
  accountKey: Uint8Array;
  writableIndexes: Uint8Array;
  readonlyIndexes: Uint8Array;
}

export interface ISubscribeUpdate {
  filters: string[];
  account?: ISubscribeUpdateAccount | undefined;
  slot?: ISubscribeUpdateSlot | undefined;
  transaction?: ISubscribeUpdateTransaction | undefined;
  transactionStatus?: ISubscribeUpdateTransactionStatus | undefined;
  block?: ISubscribeUpdateBlock | undefined;
  ping?: ISubscribeUpdatePing | undefined;
  pong?: ISubscribeUpdatePong | undefined;
  blockMeta?: ISubscribeUpdateBlockMeta | undefined;
  entry?: ISubscribeUpdateEntry | undefined;
  createdAt: Date | undefined;
}

export interface ISubscribeUpdateAccount {
  account: ISubscribeUpdateAccountInfo | undefined;
  slot: string;
  isStartup: boolean;
}

export interface ISubscribeUpdateAccountInfo {
  pubkey: Uint8Array;
  lamports: string;
  owner: Uint8Array;
  executable: boolean;
  rentEpoch: string;
  data: Uint8Array;
  writeVersion: string;
  txnSignature?: Uint8Array | undefined;
}

export interface ISubscribeUpdateSlot {
  slot: string;
  parent?: string | undefined;
  status: SlotStatus;
  deadError?: string | undefined;
}

export interface ISubscribeUpdateTransaction {
  transaction: ISubscribeUpdateTransactionInfo | undefined;
  slot: string;
}

export interface ISubscribeUpdateTransactionInfo {
  signature: Uint8Array;
  isVote: boolean;
  transaction: ITransaction | undefined;
  meta: ITransactionStatusMeta | undefined;
  index: string;
}

export interface ISubscribeUpdateTransactionStatus {
  slot: string;
  signature: Uint8Array;
  isVote: boolean;
  index: string;
  err: ITransactionError | undefined;
}

export interface ISubscribeUpdateBlock {
  slot: string;
  blockhash: string;
  rewards: IRewards | undefined;
  blockTime: IUnixTimestamp | undefined;
  blockHeight: IBlockHeight | undefined;
  parentSlot: string;
  parentBlockhash: string;
  executedTransactionCount: string;
  transactions: ISubscribeUpdateTransactionInfo[];
  updatedAccountCount: string;
  accounts: ISubscribeUpdateAccountInfo[];
  entriesCount: string;
  entries: ISubscribeUpdateEntry[];
}

export interface ISubscribeUpdateBlockMeta {
  slot: string;
  blockhash: string;
  rewards: IRewards | undefined;
  blockTime: IUnixTimestamp | undefined;
  blockHeight: IBlockHeight | undefined;
  parentSlot: string;
  parentBlockhash: string;
  executedTransactionCount: string;
  entriesCount: string;
}

export enum SlotStatus {
  SLOT_PROCESSED = 0,
  SLOT_CONFIRMED = 1,
  SLOT_FINALIZED = 2,
  SLOT_FIRST_SHRED_RECEIVED = 3,
  SLOT_COMPLETED = 4,
  SLOT_CREATED_BANK = 5,
  SLOT_DEAD = 6,
  UNRECOGNIZED = -1,
}

export enum CommitmentLevel {
  PROCESSED = 0,
  CONFIRMED = 1,
  FINALIZED = 2,
  UNRECOGNIZED = -1,
}

export enum RewardType {
  Unspecified = 0,
  Fee = 1,
  Rent = 2,
  Staking = 3,
  Voting = 4,
  UNRECOGNIZED = -1,
}

export interface ISubscribeUpdateEntry {
  slot: string;
  index: string;
  numHashes: string;
  hash: Uint8Array;
  executedTransactionCount: string;
  /** added in v1.18, for solana 1.17 value is always 0 */
  startingTransactionIndex: string;
}

export interface ISubscribeUpdatePing {}

export interface ISubscribeUpdatePong {
  id: number;
}

export interface IReward {
  pubkey: string;
  lamports: string;
  postBalance: string;
  rewardType: RewardType;
  commission: string;
}

export interface IRewards {
  rewards: IReward[];
  numPartitions: INumPartitions | undefined;
}

export interface IUnixTimestamp {
  timestamp: string;
}

export interface IBlockHeight {
  blockHeight: string;
}

export interface INumPartitions {
  numPartitions: string;
}

export interface ITransaction {
  signatures: Uint8Array[];
  message: IMessage | undefined;
}

export interface ITransactionError {
  err: Uint8Array;
}

export interface ITransactionStatusMeta {
  err: ITransactionError | undefined;
  fee: string;
  preBalances: string[];
  postBalances: string[];
  innerInstructions: IInnerInstructions[];
  innerInstructionsNone: boolean;
  logMessages: string[];
  logMessagesNone: boolean;
  preTokenBalances: ITokenBalance[];
  postTokenBalances: ITokenBalance[];
  rewards: IReward[];
  loadedWritableAddresses: Uint8Array[];
  loadedReadonlyAddresses: Uint8Array[];
  returnData: IReturnData | undefined;
  returnDataNone: boolean;
  /**
   * Sum of compute units consumed by all instructions.
   * Available since Solana v1.10.35 / v1.11.6.
   * Set to `None` for txs executed on earlier versions.
   */
  computeUnitsConsumed?: string | undefined;
}

export interface ITokenBalance {
  accountIndex: number;
  mint: string;
  uiTokenAmount: IUiTokenAmount | undefined;
  owner: string;
  programId: string;
}

export interface IUiTokenAmount {
  uiAmount: number;
  decimals: number;
  amount: string;
  uiAmountString: string;
}

export interface IReturnData {
  programId: Uint8Array;
  data: Uint8Array;
}

export interface IInnerInstructions {
  index: number;
  instructions: IInnerInstruction[];
}

export interface IInnerInstruction {
  programIdIndex: number;
  accounts: Uint8Array;
  data: Uint8Array;
  /**
   * Invocation stack height of an inner instruction.
   * Available since Solana v1.14.6
   * Set to `None` for txs executed on earlier versions.
   */
  stackHeight?: number | undefined;
}

export interface ISubscribeRequest {
  accounts: {
    [key: string]: ISubscribeRequestFilterAccounts;
  };
  slots: {
    [key: string]: ISubscribeRequestFilterSlots;
  };
  transactions: {
    [key: string]: ISubscribeRequestFilterTransactions;
  };
  transactionsStatus: {
    [key: string]: ISubscribeRequestFilterTransactions;
  };
  blocks: {
    [key: string]: ISubscribeRequestFilterBlocks;
  };
  blocksMeta: {
    [key: string]: ISubscribeRequestFilterBlocksMeta;
  };
  entry: {
    [key: string]: ISubscribeRequestFilterEntry;
  };
  commitment?: CommitmentLevel | undefined;
  accountsDataSlice: ISubscribeRequestAccountsDataSlice[];
  ping?: ISubscribeRequestPing | undefined;
  fromSlot?: string | undefined;
}

export interface ISubscribeRequestFilterBlocksMeta {}

export interface ISubscribeRequestFilterEntry {}

export interface ISubscribeRequestAccountsDataSlice {
  offset: string;
  length: string;
}

export interface ISubscribeRequestPing {
  id: number;
}

export interface ISubscribeUpdate {
  filters: string[];
  account?: ISubscribeUpdateAccount | undefined;
  slot?: ISubscribeUpdateSlot | undefined;
  transaction?: ISubscribeUpdateTransaction | undefined;
  transactionStatus?: ISubscribeUpdateTransactionStatus | undefined;
  block?: ISubscribeUpdateBlock | undefined;
  ping?: ISubscribeUpdatePing | undefined;
  pong?: ISubscribeUpdatePong | undefined;
  blockMeta?: ISubscribeUpdateBlockMeta | undefined;
  entry?: ISubscribeUpdateEntry | undefined;
  createdAt: Date | undefined;
}

export interface ISubscribeUpdateAccount {
  account: ISubscribeUpdateAccountInfo | undefined;
  slot: string;
  isStartup: boolean;
}

export interface ISubscribeUpdateAccountInfo {
  pubkey: Uint8Array;
  lamports: string;
  owner: Uint8Array;
  executable: boolean;
  rentEpoch: string;
  data: Uint8Array;
  writeVersion: string;
  txnSignature?: Uint8Array | undefined;
}

export interface ISubscribeRequestFilterSlots {
  filterByCommitment?: boolean | undefined;
  interslotUpdates?: boolean | undefined;
}

export interface ISubscribeRequestFilterTransactions {
  vote?: boolean | undefined;
  failed?: boolean | undefined;
  signature?: string | undefined;
  accountInclude: string[];
  accountExclude: string[];
  accountRequired: string[];
}

export interface ISubscribeRequestFilterBlocks {
  accountInclude: string[];
  includeTransactions?: boolean | undefined;
  includeAccounts?: boolean | undefined;
  includeEntries?: boolean | undefined;
}

export interface ISubscribeRequestFilterAccounts {
  account: string[];
  owner: string[];
  filters: ISubscribeRequestFilterAccountsFilter[];
  nonemptyTxnSignature?: boolean | undefined;
}

export interface ISubscribeRequestFilterAccountsFilter {
  memcmp?: ISubscribeRequestFilterAccountsFilterMemcmp | undefined;
  datasize?: string | undefined;
  tokenAccountState?: boolean | undefined;
  lamports?: ISubscribeRequestFilterAccountsFilterLamports | undefined;
}

export interface ISubscribeRequestFilterAccountsFilterMemcmp {
  offset: string;
  bytes?: Uint8Array | undefined;
  base58?: string | undefined;
  base64?: string | undefined;
}

export interface ISubscribeRequestFilterAccountsFilterLamports {
  eq?: string | undefined;
  ne?: string | undefined;
  lt?: string | undefined;
  gt?: string | undefined;
}
