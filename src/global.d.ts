import type {
  ArticleSaveResponse,
  Product,
  SuccessResponse,
  ErrorResponse,
  GroupSaveResponse,
  TaxSaveResponse,
  CheckParams,
  CheckResponse,
  ProductResponse,
} from "./lib/types";

export {};

declare global {
  interface Window {
    api: {
      ping: () => void;
      setArticles: (
        ip: string,
        data: Product[]
      ) => Promise<SuccessResponse<ArticleSaveResponse> | ErrorResponse>;
      getArticles: (
        ip: string
      ) => Promise<SuccessResponse<ProductResponse> | ErrorResponse>;
      setGroups: (
        ip: string,
        data: T[]
      ) => Promise<SuccessResponse<GroupSaveResponse> | ErrorResponse>;
      setTaxes: (
        ip: string,
        data: T[]
      ) => Promise<SuccessResponse<TaxSaveResponse> | ErrorResponse>;
      deleteArticles: (
        ip: string
      ) => Promise<
        SuccessResponse<{ success: boolean; message: string }> | ErrorResponse
      >;
      deleteGroups: (
        ip: string
      ) => Promise<
        SuccessResponse<{ success: boolean; message: string }> | ErrorResponse
      >;
      saveValidationErrors: (
        errors: unknown
      ) => Promise<SuccessResponse<string> | ErrorResponse>;
      selectExcelFile: () => Promise<string | null>;
      parseExcel: (
        path: string
      ) => Promise<
        SuccessResponse<Record<ProductFieldLabel, unknown>[]> | ErrorResponse
      >;
      getChecks: (
        ip: string,
        params: CheckParams
      ) => Promise<SuccessResponse<CheckResponse> | ErrorResponse>;
      deleteSales: (ip: string) => Promise<unknown>;
      generateExampleProducts: () => Promise<{
        success: boolean;
        message: string;
      }>;
      generateExampleTaxes: () => Promise<{
        success: boolean;
        message: string;
      }>;
      generateExampleGroups: () => Promise<{
        success: boolean;
        message: string;
      }>;
      downloadExcel: (
        data: Record<string, unknown>[],
        label: string,
        name: string
      ) => Promise<{
        success: boolean;
        message: string;
      }>;
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
      windowControl: (
        action: "minimize" | "maximize" | "unmaximize" | "close"
      ) => Promise<{ isMaximized: boolean } | void>;
      confirmDialog: (options: {
        message: string;
        detail?: string;
        title?: string;
        yesLabel?: string;
        noLabel?: string;
      }) => Promise<boolean>;
    };
  }
}
