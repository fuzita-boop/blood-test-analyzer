import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams, Link } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  Printer,
  Copy,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Streamdown } from "streamdown";

interface AbnormalItem {
  item: string;
  value: number;
  unit: string;
  status: string;
  referenceRange: string;
  category: string;
}

interface PredictedCondition {
  condition: string;
  relatedItems: string[];
}

function StatusIcon({ status }: { status: string }) {
  if (status === "critical_high" || status === "critical_low") {
    return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
  }
  if (status === "high") return <TrendingUp className="w-3.5 h-3.5 text-amber-600" />;
  if (status === "low") return <TrendingDown className="w-3.5 h-3.5 text-blue-600" />;
  return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    critical_high: { label: "緊急高値", className: "bg-red-50 text-red-700 border-red-200" },
    critical_low: { label: "緊急低値", className: "bg-red-50 text-red-700 border-red-200" },
    high: { label: "高値", className: "bg-amber-50 text-amber-700 border-amber-200" },
    low: { label: "低値", className: "bg-blue-50 text-blue-700 border-blue-200" },
    normal: { label: "正常", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  };
  const c = config[status] ?? { label: status, className: "" };
  return (
    <Badge variant="outline" className={`text-xs ${c.className}`}>
      {c.label}
    </Badge>
  );
}

export default function Report() {
  const params = useParams<{ id: string }>();
  const recordId = parseInt(params.id ?? "0");

  const { data: record, isLoading: recordLoading } = trpc.bloodTest.get.useQuery({ id: recordId });
  const { data: report, isLoading: reportLoading } = trpc.report.getByRecordId.useQuery({ recordId });

  const isLoading = recordLoading || reportLoading;

  const handlePrint = () => window.print();

  const handleCopy = () => {
    if (!report?.recordSummary) return;
    navigator.clipboard.writeText(report.recordSummary).then(() => {
      toast.success("記録用サマリーをコピーしました");
    });
  };

  const handleCopyFull = () => {
    if (!report?.fullReportText) return;
    navigator.clipboard.writeText(report.fullReportText).then(() => {
      toast.success("レポート全文をコピーしました");
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">レポートを読み込み中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!record || !report) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">レポートが見つかりません</p>
            <Link href="/history">
              <Button variant="outline" size="sm" className="mt-4">
                履歴に戻る
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const abnormalValues = (report.abnormalValues as AbnormalItem[]) ?? [];
  const predictedConditions = (report.predictedConditions as PredictedCondition[]) ?? [];
  const observationPoints = (report.observationPoints as string[]) ?? [];

  const criticalItems = abnormalValues.filter(
    (v) => v.status === "critical_high" || v.status === "critical_low"
  );

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 print:p-4 print:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <Link href="/history">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                戻る
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <h1 className="text-lg font-semibold text-foreground">アセスメントレポート</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
              <Copy className="w-3.5 h-3.5" />
              サマリーをコピー
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5" />
              印刷
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block">
          <h1 className="text-xl font-bold">採血データ アセスメントレポート</h1>
          <p className="text-sm text-gray-600 mt-1">
            解析日時: {format(new Date(report.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
          </p>
        </div>

        {/* Critical Alert */}
        {criticalItems.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">緊急異常値が検出されました</p>
              <p className="text-xs text-red-600 mt-1">
                {criticalItems.map((v) => `${v.item}（${v.value} ${v.unit}）`).join("、")}
              </p>
              <p className="text-xs text-red-600 mt-1 font-medium">
                直ちに主治医へ報告してください。
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Abnormal Values */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
              スクリーニング結果（異常値サマリー）
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {abnormalValues.length === 0 ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <p className="text-sm text-emerald-700">基準値内の異常値は検出されませんでした</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Group by category */}
                {Object.entries(
                  abnormalValues.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {} as Record<string, AbnormalItem[]>)
                ).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-medium text-muted-foreground mb-2 mt-3 first:mt-0">{category}</p>
                    <div className="space-y-1.5">
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                        >
                          <StatusIcon status={item.status} />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground">{item.item}</span>
                            <span className="text-xs text-muted-foreground ml-2">（基準値: {item.referenceRange}）</span>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {item.value} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Predicted Conditions */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
              予測される状態・疑われる疾患の可能性
              <Badge variant="outline" className="text-xs ml-1 text-muted-foreground">参考情報</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {predictedConditions.length === 0 ? (
              <p className="text-sm text-muted-foreground">特記すべき疾患リスクは検出されませんでした</p>
            ) : (
              predictedConditions.map((cond, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-card">
                  <p className="text-sm font-medium text-foreground">{cond.condition}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cond.relatedItems.map((item, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Section 3: Observation Points */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
              現場での観察・アセスメントポイント
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {observationPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                  <Eye className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{point}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Record Summary */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">4</span>
                記録用サマリー
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2 no-print" onClick={handleCopy}>
                <Copy className="w-3 h-3" />
                コピー
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {report.recordSummary}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Full Report */}
        {report.fullReportText && (
          <Card className="border-border shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  詳細レポート
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2 no-print" onClick={handleCopyFull}>
                  <Copy className="w-3 h-3" />
                  全文コピー
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="prose prose-sm max-w-none p-4 rounded-lg bg-muted/30 border border-border">
                <Streamdown>{report.fullReportText}</Streamdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            ※本データはAIによる参考情報です。医学的な診断を示すものではありません。
            異常値については必ず主治医の指示を仰ぎ、看護師の専門的判断のもと対応してください。
          </p>
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground text-right no-print">
          解析日時: {format(new Date(report.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
        </div>
      </div>
    </AppLayout>
  );
}
