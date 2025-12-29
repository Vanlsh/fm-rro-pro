import type {
  SuccessResponse,
  ErrorResponse,
  CheckParams,
  CheckResponse,
} from "./lib/types";

export {};

type FiscalMemoryDump = {
  meta: { flag: number; idString: string; ksefNumbers: number[] };
  serialRecord: unknown;
  fmNumbers: unknown[];
  vatRates: unknown[];
  ramResets: unknown[];
  taxRecords: unknown[];
  testRecords: unknown[];
  zReports: unknown[];
};

declare global {
  interface Window {
    api: {
      ping: () => Promise<string>;
      checkForUpdates: () => Promise<
        | { status: "up-to-date" }
        | { status: "downloaded"; version: string }
        | { status: "unavailable"; message: string }
        | { status: "error"; message: string }
      >;
      installUpdate: () => Promise<
        | { status: "installing" }
        | { status: "unavailable"; message: string }
        | { status: "error"; message: string }
      >;
      onUpdateDownloadProgress: (
        callback: (info: {
          percent: number;
          bytesPerSecond: number;
          transferred: number;
          total: number;
        }) => void
      ) => void;
      openFiscalMemory: () => Promise<
        | {
            filePath: string;
            data: FiscalMemoryDump;
          }
        | null
      >;
      parseFiscalMemory: (
        buffer: ArrayBuffer | Buffer
      ) => Promise<FiscalMemoryDump>;
      saveFiscalMemoryAs: (
        data: FiscalMemoryDump
      ) => Promise<{ filePath: string; success: true } | null>;
      saveFiscalMemoryToPath: (
        filePath: string,
        data: FiscalMemoryDump
      ) => Promise<{ filePath: string; success: true }>;
    };
  }
}
