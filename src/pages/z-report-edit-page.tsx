import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useFiscalStore } from "@/store/fiscal";
import type { ZReport } from "@/lib/fm-types";

const fieldLabels: Record<keyof ZReport, string> = {
  DateTime: "Дата/час",
  FiscalCount: "Фіскальний лічильник",
  StornoCount: "Лічильник повернень",
  LastDocument: "Останній документ",
  KSEFNum: "Номер KSEF",
  salesMode: "Режим продажу",
  ObigVatA: "Обіг VAT A",
  ObigVatB: "Обіг VAT B",
  ObigVatC: "Обіг VAT C",
  ObigVatD: "Обіг VAT D",
  ObigVatE: "Обіг VAT E",
  ObigVatAStorno: "Обіг VAT A повернення",
  ObigVatBStorno: "Обіг VAT B повернення",
  ObigVatCStorno: "Обіг VAT C повернення",
  ObigVatDStorno: "Обіг VAT D повернення",
  ObigVatEStorno: "Обіг VAT E повернення",
  SumaVatA: "Сума VAT A",
  SumaVatB: "Сума VAT B",
  SumaVatC: "Сума VAT C",
  SumaVatD: "Сума VAT D",
  SumaVatE: "Сума VAT E",
  SumaVatAStorno: "Сума VAT A повернення",
  SumaVatBStorno: "Сума VAT B повернення",
  SumaVatCStorno: "Сума VAT C повернення",
  SumaVatDStorno: "Сума VAT D повернення",
  SumaVatEStorno: "Сума VAT E повернення",
  ZbirVatM: "Збір VAT M",
  ZbirVatH: "Збір VAT H",
  ZbirVatMStorno: "Збір VAT M повернення",
  ZbirVatHStorno: "Збір VAT H повернення",
  ZbirVatMTax: "Збір VAT M TAX",
  ZbirVatHTax: "Збір VAT H TAX",
  ZbirVatMTaxStorno: "Збір VAT M TAX повернення",
  ZbirVatHTaxStorno: "Збір VAT H TAX повернення",
  ZNumber: "Номер Z-звіту",
  FMNumChanges: "",
  LastFiscalizationNum: "",
  TaxNumChanges: "",
  RamResetsCount: ""
};

const baseFields: Array<keyof ZReport> = [
  "DateTime",
  "FiscalCount",
  "StornoCount",
  "LastDocument",
  "KSEFNum",
  "salesMode",
];

const salesFields: Array<keyof ZReport> = [
  "ObigVatA",
  "ObigVatB",
  "ObigVatC",
  "ObigVatD",
  "ObigVatE",
  "SumaVatA",
  "SumaVatB",
  "SumaVatC",
  "SumaVatD",
  "SumaVatE",
  "ZbirVatM",
  "ZbirVatH",
  "ZbirVatMTax",
  "ZbirVatHTax",
];

const returnFields: Array<keyof ZReport> = [
  "ObigVatAStorno",
  "ObigVatBStorno",
  "ObigVatCStorno",
  "ObigVatDStorno",
  "ObigVatEStorno",
  "SumaVatAStorno",
  "SumaVatBStorno",
  "SumaVatCStorno",
  "SumaVatDStorno",
  "SumaVatEStorno",
  "ZbirVatMStorno",
  "ZbirVatHStorno",
  "ZbirVatMTaxStorno",
  "ZbirVatHTaxStorno",
];

const editableFields: Array<keyof ZReport> = [
  ...baseFields,
  ...salesFields,
  ...returnFields,
];

export const ZReportEditPage = () => {
  const { data, setZReports, setMessage } = useFiscalStore();
  const navigate = useNavigate();
  const params = useParams();
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});

  const zNumber = useMemo(() => Number(params.id), [params.id]);
  const reportIndex = useMemo(() => {
    if (!data?.zReports || Number.isNaN(zNumber)) return -1;
    return data.zReports.findIndex((item) => item.ZNumber === zNumber);
  }, [data?.zReports, zNumber]);
  const report = reportIndex >= 0 ? data?.zReports[reportIndex] : undefined;

  useEffect(() => {
    if (!report) return;
    const draft = editableFields.reduce<Record<string, string>>((acc, key) => {
      if (key === "DateTime") {
        acc[key] = report.DateTime?.iso ?? "";
        return acc;
      }
      acc[key] = report[key]?.toString() ?? "";
      return acc;
    }, {});
    setEditDraft(draft);
  }, [report]);

  const handleSave = () => {
    if (!report || reportIndex < 0) return;
    const updated: ZReport = { ...report };
    editableFields.forEach((key) => {
      const rawValue = editDraft[key] ?? "";
      if (key === "DateTime") {
        if (!rawValue) {
          updated.DateTime = null;
          return;
        }
        const existing = report.DateTime;
        updated.DateTime = existing
          ? { ...existing, iso: rawValue }
          : { raw: { time: 0, date: 0 }, iso: rawValue };
        return;
      }
      const original = report[key];
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
      prev.map((item, idx) => (idx === reportIndex ? updated : item))
    );
    setMessage("Z-звіт оновлено.");
    toast.success("Z-звіт оновлено");
    navigate("/z-reports");
  };

  const handleCancel = () => {
    navigate("/z-reports");
  };

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Спочатку завантажте файл фіскальної пам&apos;яті.
      </p>
    );
  }

  if (Number.isNaN(zNumber) || !report) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Z-звіт не знайдено.
        </p>
        <Button variant="outline" onClick={handleCancel}>
          Назад до списку
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">
            Редагування Z-звіту #{report.ZNumber}
          </h2>
          <p className="text-xs text-muted-foreground">
            {report.DateTime?.iso ?? "Без дати"}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Назад
        </Button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="space-y-6 text-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Основні
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {baseFields.map((field) => (
                <label key={field} className="space-y-1">
                  <span className="block text-[11px] font-medium text-muted-foreground">
                    {fieldLabels[field] ?? field}
                  </span>
                  <Input
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
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Продажі
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {salesFields.map((field) => (
                <label key={field} className="space-y-1">
                  <span className="block text-[11px] font-medium text-muted-foreground">
                    {fieldLabels[field] ?? field}
                  </span>
                  <Input
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
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Повернення
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {returnFields.map((field) => (
                <label key={field} className="space-y-1">
                  <span className="block text-[11px] font-medium text-muted-foreground">
                    {fieldLabels[field] ?? field}
                  </span>
                  <Input
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
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-end gap-2 md:flex-row">
        <Button variant="ghost" onClick={handleCancel}>
          Скасувати
        </Button>
        <Button onClick={handleSave}>Зберегти</Button>
      </div>
    </div>
  );
};
