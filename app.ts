import {
  createDefaultRpcTransport,
  createSolanaRpcFromTransport,
} from "@solana/rpc";
import * as fs from "node:fs";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import {
  SPL_TOKEN_INSTRUCTIONS,
  SYSTEM_INSTRUCTIONS,
  PUMP_AMM_INSTRUCTIONS,
} from "./parsers";
import { Signature } from "@solana/kit";
import * as util from "node:util";

const PUMP_PROGRAM_ID = "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA";
const SPL_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";

const transport = createDefaultRpcTransport({
  url: "https://api.mainnet-beta.solana.com",
});

const rpc = createSolanaRpcFromTransport(transport);

const signature =
  "4steNap8Gx6SgeX2cS85kuvC4bFjgu4LvMgrCgVzRt6JW7i6kt4x9wpKDbNX6u9RAjabzXkGE8oe1BkjA8wvHAqT";
// "3XB5bjjkqhDPcZqasxjnciNLnx4gVfj1Fcwqqc64rbsqn8mSgSReu1pZnziWEEXz6okistv2x5qA3QyB8fxWM4QH";

const config: any = {
  commitment: "finalized",
  maxSupportedTransactionVersion: 0,
};

function getStringFromDataObject(data: any): any {
  return JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? Number(value) : value
  );
}
rpc
  .getTransaction(signature as Signature, config)
  .send()
  .then((tx) => {
    if (
      !tx ||
      !tx.transaction.message.instructions ||
      // @ts-ignore
      !tx.transaction.message.accountKeys.includes(PUMP_PROGRAM_ID)
    ) {
      return;
    }
    const innerMap = new Map<number, any[]>();
    const resultArr = [];
    for (const inner of tx.meta?.innerInstructions || []) {
      // @ts-ignore
      innerMap.set(inner.index, inner.instructions);
    }

    for (let i = 0; i < tx.transaction.message.instructions.length; i++) {
      const ix = tx.transaction.message.instructions[i];
      const programId =
        // @ts-ignore
        typeof ix.programIdIndex === "string"
          ? // @ts-ignore
            ix.programIdIndex
          : // @ts-ignore
            tx.transaction.message.accountKeys[ix.programIdIndex];
      // @ts-ignore
      if (!ix?.data) {
        return;
      }
      // @ts-ignore
      const data = Buffer.from(bs58.decode(ix.data), "base64");
      let decoded;

      if (programId === PUMP_PROGRAM_ID) {
        decoded = decodePumpAmmInstruction(data);
      } else if (programId === SPL_TOKEN_PROGRAM_ID) {
        decoded = decodeSplTokenInstruction(data);
      } else if (programId === SYSTEM_PROGRAM_ID) {
        decoded = decodeSystemInstruction(data);
      }
      // @ts-ignore
      const accounts = ix.accounts.map(
        (account) => tx.transaction.message.accountKeys[account]
      );
      const result = {
        programId,
        discriminator: data[0],
        accounts,
      };

      if (decoded) {
        const innerAccounts = {};
        result["decoded"] = decoded;
        decoded.accounts.map((account, index) => {
          innerAccounts[account] = accounts[index];
        });
        result.accounts = innerAccounts;
      }
      const inner = innerMap.get(i);
      if (inner) {
        result["innerPrograms"] = [];
        for (const innerIx of inner) {
          const innerProgramId = String(
            tx.transaction.message.accountKeys[innerIx.programIdIndex]
          );
          const innerAccounts = innerIx.accounts.map(
            (j) => tx.transaction.message.accountKeys[j]
          );
          // @ts-ignore
          const innerData = Buffer.from(bs58.decode(innerIx.data), "base64");

          let innerDecoded;
          if (innerProgramId === PUMP_PROGRAM_ID) {
            innerDecoded = decodePumpAmmInstruction(innerData);
          } else if (innerProgramId === SPL_TOKEN_PROGRAM_ID) {
            innerDecoded = decodeSplTokenInstruction(innerData);
          } else if (innerProgramId === SYSTEM_PROGRAM_ID) {
            innerDecoded = decodeSystemInstruction(innerData);
          }

          const data = {
            programId: innerProgramId,
            _accounts: innerIx.accounts,
            accounts: innerAccounts,
            stackHeight: innerIx.stackHeight,
            // innerData,
          };
          if (innerDecoded) {
            const innerAccounts = {};
            data["decoded"] = innerDecoded;
            innerDecoded.accounts.map((account, index) => {
              innerAccounts[account] = accounts[index];
            });
            data.accounts = innerAccounts;
          }
          result["innerPrograms"].push(data);
        }
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
      result["tokenChanges"] = tokenChanges;
      resultArr.push(result);
      console.log(util.inspect(result, false, 5, true));
    }
    fs.writeFileSync("transaction.json", getStringFromDataObject(tx), "utf-8");
    fs.writeFileSync(
      "transactionResult.json",
      getStringFromDataObject(resultArr),
      "utf-8"
    );
  });

function readArg(buffer: Buffer, offset: number, type: string): [any, number] {
  switch (type) {
    case "u8":
      return [buffer.readUInt8(offset), offset + 1];
    case "u64":
      return [buffer.readBigUInt64LE(offset), offset + 8];
    case "bool":
      return [buffer.readUInt8(offset) === 1, offset + 1];
    case "Pubkey":
      return [
        new PublicKey(buffer.slice(offset, offset + 32)).toBase58(),
        offset + 32,
      ];
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
      const len = buffer.readUInt32LE(offset);
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
