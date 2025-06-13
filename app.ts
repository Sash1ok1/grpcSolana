import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";
import { ClientDuplexStream } from "@grpc/grpc-js";
import { PublicKey } from "@solana/web3.js";
import * as fs from "node:fs/promises";
import bs58 from "bs58";
import {
  PUMP_AMM_INSTRUCTIONS,
  SPL_TOKEN_INSTRUCTIONS,
  SYSTEM_INSTRUCTIONS,
} from "./parsers";
import {
  CommitmentLevel,
  ISubscribeRequest,
  ISubscribeUpdate,
  ISubscribeUpdateTransaction,
} from "./types";

const PUMP_PROGRAM_ID = "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA";
const SPL_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";

const FILTER_CONFIG = {
  programIds: [PUMP_PROGRAM_ID],
  instructionDiscriminators: [],
};
const PROTO_PATH = "./proto/geyser.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  json: true,
});

async function main(): Promise<void> {
  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
  await fs.mkdir("transactions", { recursive: true });

  const client = new protoDescriptor.geyser.Geyser(
    "solana-yellowstone-grpc.publicnode.com:443",
    grpc.credentials.createSsl()
  );

  const stream = client.Subscribe();
  const request = createSubscribeRequest();

  try {
    await sendSubscribeRequest(stream, request);
    console.log("Geyser connection established - watching Pump.fun \n");
    await handleStreamEvents(stream);
  } catch (error) {
    console.error("Error in subscription process:", error);
    stream.end();
  }
}

function readArg(buffer: Buffer, offset: number, type: string): [any, number] {
  switch (type) {
    case "u8":
      return [buffer.readUInt8(offset), offset + 1];
    case "u64":
      return [buffer.readBigUInt64LE(offset), offset + 8];
    case "bool":
      return [buffer.readUInt8(offset) === 1, offset + 1];
    case "Pubkey":
      if (offset + 32 > buffer.length) {
        throw new Error(`Not enough bytes to read Pubkey at offset ${offset}`);
      }
      const pk = new PublicKey(buffer.slice(offset, offset + 32)).toBase58();
      return [pk, offset + 32];
    case "Pubkey[8]": {
      const keys = [];
      for (let i = 0; i < 8; i++) {
        const key = new PublicKey(buffer.slice(offset, offset + 32)).toBase58();
        keys.push(key);
        offset += 32;
      }
      return [keys, offset];
    }
    case "string": {
      let len = buffer.readUInt32LE(offset);
      if (len > 5000) {
        len = buffer.readUInt32LE(offset + 4);
      }
      const str = buffer.slice(offset + 4, offset + 4 + len).toString("utf8");
      return [str, offset + 4 + len];
    }
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

function decodeFromTable(
  data: Buffer,
  table: Record<
    number,
    { name: string; args: { name: string; type: string }[]; accounts: string[] }
  >
): { name: string; args: Record<string, any>; accounts: string[] } | null {
  const discriminator = data[0];
  const entry = table[discriminator];
  if (!entry) return null;

  const args: Record<string, any> = {};
  let offset = 1;
  for (const arg of entry.args) {
    const [value, nextOffset] = readArg(data, offset, arg.type);
    args[arg.name] = value;
    offset = nextOffset;
  }
  return { name: entry.name, args, accounts: entry.accounts };
}

export function decodeSplTokenInstruction(data: Buffer) {
  return decodeFromTable(data, SPL_TOKEN_INSTRUCTIONS);
}

export function decodeSystemInstruction(data: Buffer) {
  return decodeFromTable(data, SYSTEM_INSTRUCTIONS);
}

export function decodePumpAmmInstruction(data: Buffer) {
  return decodeFromTable(data, PUMP_AMM_INSTRUCTIONS);
}

function handleStreamEvents(
  stream: ClientDuplexStream<ISubscribeRequest, ISubscribeUpdate>
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream.on("data", async (data) => {
      try {
        handleData(data);
      } catch (err) {
        console.error("Error handling data:", err);
      }
    });

    stream.on("error", (error: Error) => {
      console.error("Stream error:", error);
      reject(error);
      stream.end();
    });

    stream.on("end", () => {
      console.log("Stream ended");
      resolve();
    });

    stream.on("close", () => {
      console.log("Stream closed");
      resolve();
    });
  });
}

async function handleData(data: ISubscribeUpdate): Promise<void> {
  const tx = data?.transaction?.transaction;
  const accounts: string[] = tx.transaction.message.accountKeys.map(
    (key: Uint8Array<ArrayBufferLike>) => bs58.encode(key)
  );
  if (
    !isSubscribeUpdateTransaction(data) ||
    !accounts.includes(PUMP_PROGRAM_ID)
  ) {
    return;
  }

  const signature = bs58.encode(tx.signature);

  const innerMap = new Map<number, any[]>();
  const resultArr = [];
  for (const inner of tx.meta?.innerInstructions || []) {
    innerMap.set(inner.index, inner.instructions);
  }

  for (let i = 0; i < tx.transaction.message.instructions.length; i++) {
    const ix = tx.transaction.message.instructions[i];
    const programId =
      typeof ix.programIdIndex === "string"
        ? ix.programIdIndex
        : accounts[ix.programIdIndex];
    if (!ix?.data) {
      return;
    }
    let decoded;
    const data = Buffer.from(ix.data);

    if (programId === PUMP_PROGRAM_ID) {
      decoded = decodePumpAmmInstruction(data);
    } else if (programId === SPL_TOKEN_PROGRAM_ID) {
      decoded = decodeSplTokenInstruction(data);
    } else if (programId === SYSTEM_PROGRAM_ID) {
      decoded = decodeSystemInstruction(data);
    }

    const result: any = {
      programId: accounts[ix.programIdIndex],
      discriminator: ix.data[0],
      _accounts: Array.from(ix.accounts),
      accounts: Array.from(ix.accounts).map((index: number) => accounts[index]),
    };

    if (decoded) {
      const innerAccounts: Record<string, string> = {};
      result.decoded = decoded;

      decoded.accounts?.forEach((account: string, index: number) => {
        innerAccounts[account] = result.accounts[index];
      });

      result.accounts = innerAccounts;
    }
    const inner = innerMap.get(i);
    if (inner) {
      result.innerPrograms = [];

      for (const innerIx of inner) {
        const innerProgramId = accounts[innerIx.programIdIndex];
        const innerAccountsList = Array.from<number>(innerIx.accounts).map(
          (j) => accounts[j]
        );

        const innerData = Buffer.from(innerIx.data);
        let innerDecoded;

        if (innerProgramId === PUMP_PROGRAM_ID) {
          innerDecoded = decodePumpAmmInstruction(innerData);
        } else if (innerProgramId === SPL_TOKEN_PROGRAM_ID) {
          innerDecoded = decodeSplTokenInstruction(innerData);
        } else if (innerProgramId === SYSTEM_PROGRAM_ID) {
          innerDecoded = decodeSystemInstruction(innerData);
        }

        const innerResult: any = {
          programId: innerProgramId,
          discriminator: innerData[0],
          _accounts: Array.from(innerIx.accounts),
          accounts: innerAccountsList,
          stackHeight: innerIx.stackHeight,
        };
        if (innerDecoded) {
          const mappedAccounts: Record<string, string> = {};
          innerResult.decoded = innerDecoded;

          innerDecoded.accounts?.forEach((acc: string, idx: number) => {
            mappedAccounts[acc] = innerResult.accounts[idx];
          });

          innerResult.accounts = mappedAccounts;
        }

        result.innerPrograms.push(innerResult);
      }

      const tokenChanges = (tx.meta?.postTokenBalances || []).map((post) => {
        const pre = tx.meta?.preTokenBalances?.find(
          (p) => p.accountIndex === post.accountIndex
        );
        const delta =
          BigInt(post.uiTokenAmount.amount) -
          BigInt(pre?.uiTokenAmount?.amount || "0");
        return {
          account: accounts[post.accountIndex],
          mint: post.mint,
          delta,
          owner: post.owner,
        };
      });

      result.tokenChanges = tokenChanges;
      resultArr.push(result);
    }

    try {
      await fs.writeFile(
        `transactions/${signature}.json`,
        getStringFromDataObject(tx),
        "utf-8"
      );
      await fs.writeFile(
        `transactions/${signature}_result.json`,
        getStringFromDataObject(resultArr),
        "utf-8"
      );
    } catch (err) {
      console.error("Error writing transaction files:", err);
    }
  }
}

function sendSubscribeRequest(
  stream: ClientDuplexStream<ISubscribeRequest, ISubscribeUpdate>,
  request: ISubscribeRequest
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream.write(request, (err: Error | null) => {
      if (err) {
        console.log({ err });
        reject(err);
      } else {
        console.log("resolve");
        resolve();
      }
    });
  });
}

function isSubscribeUpdateTransaction(
  data: ISubscribeUpdate
): data is ISubscribeUpdate & { transaction: ISubscribeUpdateTransaction } {
  return (
    "transaction" in data &&
    typeof data.transaction === "object" &&
    data.transaction !== null &&
    "slot" in data.transaction &&
    "transaction" in data.transaction
  );
}

function createSubscribeRequest(): ISubscribeRequest {
  return {
    transactions: {
      // @ts-ignore
      filter1: { account_include: FILTER_CONFIG.programIds },
    },
    commitment: CommitmentLevel.FINALIZED,
  };
}

function getStringFromDataObject(data: any): any {
  return JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? Number(value) : value
  );
}

main();
