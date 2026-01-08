import { useCallback, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFiscalStore } from "@/store/fiscal";
import type { ZReport } from "@/lib/fm-types";

export const ZReportsPage = () => {
  const { data, setZReports } = useFiscalStore();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [zNumberFilter, setZNumberFilter] = useState("");
  const [zRangeStart, setZRangeStart] = useState("");
  const [zRangeEnd, setZRangeEnd] = useState("");

  const reports = data?.zReports ?? [];
  const itemEstimate = 260;
  const overscan = 10;
  const itemGap = 12;

  const filteredReports = useMemo(
    () =>
      reports
        .map((report, index) => ({ report, index }))
        .filter(({ report }) => {
          // z-number exact filter
          if (zNumberFilter.trim()) {
            const parsedZ = Number(zNumberFilter.trim());
            if (!Number.isNaN(parsedZ) && report.ZNumber !== parsedZ) {
              return false;
            }
          }

          // date range filter
          if (dateFrom || dateTo) {
            const iso = report.DateTime?.iso ?? "";
            if (!iso) return false;
            const time = Date.parse(iso);
            if (Number.isNaN(time)) return false;
            if (dateFrom) {
              const fromMs = Date.parse(dateFrom);
              if (!Number.isNaN(fromMs) && time < fromMs) return false;
            }
            if (dateTo) {
              const toMs = Date.parse(dateTo);
              if (!Number.isNaN(toMs) && time > toMs) return false;
            }
          }

          return true;
        }),
    [reports, dateFrom, dateTo, zNumberFilter]
  );

  const getItemKey = useCallback(
    (virtualIndex: number) => {
      const row = filteredReports[virtualIndex];
      if (!row) return virtualIndex;
      return `${row.report.ZNumber}-${row.index}`;
    },
    [filteredReports]
  );

  const measureRow = useCallback(
    (el: Element | null | undefined) =>
      el?.getBoundingClientRect().height ?? itemEstimate,
    [itemEstimate]
  );

  const rowVirtualizer = useVirtualizer({
    count: filteredReports.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => itemEstimate,
    overscan,
    enabled: filteredReports.length > 0,
    gap: itemGap,
    getItemKey,
    measureElement: measureRow,
  });

  const renderField = (label: string, value: string | number | undefined) => (
    <div className="flex items-center justify-between rounded border border-border/40 bg-muted/40 px-2 py-1 text-[11px] leading-tight text-muted-foreground">
      <span className="font-medium text-foreground">{label}</span>
      <span className="ml-2 text-right text-foreground/90">{value ?? "—"}</span>
    </div>
  );

  const editableFields: Array<keyof ZReport> = useMemo(
    () => [
      "DateTime",
      "FiscalCount",
      "StornoCount",
      "LastDocument",
      "KSEFNum",
      "salesMode",
      "ObigVatA",
      "ObigVatB",
      "ObigVatC",
      "ObigVatD",
      "ObigVatE",
      "ObigVatAStorno",
      "ObigVatBStorno",
      "ObigVatCStorno",
      "ObigVatDStorno",
      "ObigVatEStorno",
      "SumaVatA",
      "SumaVatB",
      "SumaVatC",
      "SumaVatD",
      "SumaVatE",
      "SumaVatAStorno",
      "SumaVatBStorno",
      "SumaVatCStorno",
      "SumaVatDStorno",
      "SumaVatEStorno",
      "ZbirVatM",
      "ZbirVatH",
      "ZbirVatMStorno",
      "ZbirVatHStorno",
      "ZbirVatMTax",
      "ZbirVatHTax",
      "ZbirVatMTaxStorno",
      "ZbirVatHTaxStorno",
    ],
    []
  );

  const openEdit = (report: ZReport, originalIndex: number) => {
    setEditingIndex(originalIndex);
    const draft = editableFields.reduce<Record<string, string>>((acc, key) => {
      if (key === "DateTime") {
        acc[key] = report.DateTime?.iso ?? "";
        return acc;
      }
      acc[key] = report[key]?.toString() ?? "";
      return acc;
    }, {});
    setEditDraft(draft);
  };

  const closeEdit = () => {
    setEditingIndex(null);
    setEditDraft({});
  };

  const handleSave = () => {
    if (editingIndex === null) return;
    const current = reports[editingIndex];
    if (!current) return;

    const updated: ZReport = { ...current };
    editableFields.forEach((key) => {
      const rawValue = editDraft[key] ?? "";
      if (key === "DateTime") {
        if (!rawValue) {
          updated.DateTime = null;
          return;
        }
        const existing = current.DateTime;
        updated.DateTime = existing
          ? { ...existing, iso: rawValue }
          : { raw: { time: 0, date: 0 }, iso: rawValue };
        return;
      }

      const original = current[key];
      if (typeof original === "number") {
        const parsed = rawValue === "" ? 0 : Number(rawValue);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updated as any)[key] = Number.isNaN(parsed) ? original : parsed;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updated as any)[key] = rawValue as any;
      }
    });

    setZReports((prev) =>
      prev.map((item, idx) => (idx === editingIndex ? updated : item))
    );
    closeEdit();
  };

  const handleDelete = (originalIndex: number) => {
    setZReports((prev) =>
      prev
        .filter((_, idx) => idx !== originalIndex)
        .map((item, idx) => ({
          ...item,
          ZNumber: idx + 1,
          FiscalCount: idx + 1,
        }))
    );
    if (editingIndex === originalIndex) {
      closeEdit();
    }
  };

  const handleDeleteRange = () => {
    const start = Number(zRangeStart);
    const end = Number(zRangeEnd);
    if (Number.isNaN(start) || Number.isNaN(end)) return;
    const [min, max] = start <= end ? [start, end] : [end, start];
    setZReports((prev) =>
      prev
        .filter((item) => item.ZNumber < min || item.ZNumber > max)
        .map((item, idx) => ({
          ...item,
          ZNumber: idx + 1,
          FiscalCount: idx + 1,
        }))
    );
    closeEdit();
  };

  const renderReport = (
    report: ZReport,
    key: string,
    start: number,
    virtualIndex: number,
    originalIndex: number
  ) => {
    return (
      <div
        key={key}
        ref={rowVirtualizer.measureElement}
        data-index={virtualIndex}
        className="absolute left-0 right-0 rounded-lg border border-border bg-card/60 p-3 text-sm"
        style={{
          transform: `translateY(${start}px)`,
          width: "100%",
        }}
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            Z #{report.ZNumber}
          </span>
          <span>{report.DateTime?.iso ?? "—"}</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => openEdit(report, originalIndex)}
            className="text-[11px]"
          >
            Редагувати
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(originalIndex)}
            className="text-[11px]"
          >
            Видалити
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
          {renderField("Фіскальний", report.FiscalCount)}
          {renderField("Сторно", report.StornoCount)}
          {renderField("Останній документ", report.LastDocument)}
          {renderField("KSEF", report.KSEFNum)}
          {renderField("Режим продажу", report.salesMode)}
          {renderField("Дата", report.DateTime?.iso ?? "—")}
        </div>

        <div className="mt-3 space-y-2 text-[12px]">
          <div className="grid grid-cols-5 gap-2">
            {renderField("Обіг A", report.ObigVatA)}
            {renderField("Обіг B", report.ObigVatB)}
            {renderField("Обіг C", report.ObigVatC)}
            {renderField("Обіг D", report.ObigVatD)}
            {renderField("Обіг E", report.ObigVatE)}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {renderField("Обіг A сторно", report.ObigVatAStorno)}
            {renderField("Обіг B сторно", report.ObigVatBStorno)}
            {renderField("Обіг C сторно", report.ObigVatCStorno)}
            {renderField("Обіг D сторно", report.ObigVatDStorno)}
            {renderField("Обіг E сторно", report.ObigVatEStorno)}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {renderField("Сума VAT A", report.SumaVatA)}
            {renderField("Сума VAT B", report.SumaVatB)}
            {renderField("Сума VAT C", report.SumaVatC)}
            {renderField("Сума VAT D", report.SumaVatD)}
            {renderField("Сума VAT E", report.SumaVatE)}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {renderField("Сума VAT A сторно", report.SumaVatAStorno)}
            {renderField("Сума VAT B сторно", report.SumaVatBStorno)}
            {renderField("Сума VAT C сторно", report.SumaVatCStorno)}
            {renderField("Сума VAT D сторно", report.SumaVatDStorno)}
            {renderField("Сума VAT E сторно", report.SumaVatEStorno)}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {renderField("Збір M", report.ZbirVatM)}
            {renderField("Збір H", report.ZbirVatH)}
            {renderField("Збір M сторно", report.ZbirVatMStorno)}
            {renderField("Збір H сторно", report.ZbirVatHStorno)}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {renderField("Збір M TAX", report.ZbirVatMTax)}
            {renderField("Збір H TAX", report.ZbirVatHTax)}
            {renderField("Збір M TAX сторно", report.ZbirVatMTaxStorno)}
            {renderField("Збір H TAX сторно", report.ZbirVatHTaxStorno)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Z-звіти</h2>
          <p className="text-xs text-muted-foreground">
            Всього: {filteredReports.length} / {reports.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={zRangeStart}
              onChange={(e) => setZRangeStart(e.target.value)}
              placeholder="Z від"
              className="h-8 w-24 text-xs"
            />
            <Input
              type="number"
              value={zRangeEnd}
              onChange={(e) => setZRangeEnd(e.target.value)}
              placeholder="Z до"
              className="h-8 w-24 text-xs"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteRange}
              className="h-8 text-[11px]"
            >
              Видалити діапазон
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={zNumberFilter}
              onChange={(e) => setZNumberFilter(e.target.value)}
              placeholder="Z номер"
              className="h-8 w-28 text-xs"
            />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 w-36 text-xs"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 w-36 text-xs"
            />
          </div>
        </div>
      </div>

      {!data ? (
        <p className="text-sm text-muted-foreground">
          Спочатку завантажте файл фіскальної пам&apos;яті.
        </p>
      ) : (
        <>
          <div
            ref={listRef}
            className="relative h-[70vh] overflow-auto rounded-lg bg-muted/30"
          >
            <div
              style={{
                height: rowVirtualizer.getTotalSize(),
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((item) => {
                const row = filteredReports[item.index];
                if (!row) return null;
                return renderReport(
                  row.report,
                  String(item.key),
                  item.start,
                  item.index,
                  row.index
                );
              })}
            </div>
          </div>

          <Dialog
            open={editingIndex !== null}
            onOpenChange={(open) => {
              if (!open) closeEdit();
            }}
          >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  Редагування Z-звіту #
                  {editingIndex !== null
                    ? (reports[editingIndex]?.ZNumber ?? editingIndex)
                    : ""}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                {editableFields.map((field) => (
                  <label key={field} className="space-y-1">
                    <span className="block text-[11px] font-medium text-muted-foreground">
                      {field}
                    </span>
                    <input
                      className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                      value={editDraft[field] ?? ""}
                      onChange={(e) =>
                        setEditDraft((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>

              <DialogFooter className="mt-4 gap-2">
                <Button variant="outline" onClick={closeEdit}>
                  Скасувати
                </Button>
                <Button onClick={handleSave}>Зберегти</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
