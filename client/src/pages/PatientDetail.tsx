import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  ArrowLeft,
  Upload,
  FileText,
  ArrowRight,
  User,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { REFERENCE_VALUES_BASIC as REFERENCE_VALUES } from "@shared/referenceValues";

interface ExtractedItem {
  item: string;
  value: number;
  unit: string;
}

interface ExtractedData {
  items: ExtractedItem[];
  testDate: string | null;
}

interface AbnormalItem {
  item: string;
  value: number;
  unit: string;
  status: string;
  referenceRange: string;
  category: string;
}

// 経時変化グラフ用データ生成
function buildTrendData(
  records: Array<{ createdAt: Date; testDate?: Date | null; extractedData: unknown }>,
  itemName: string
) {
  return records
    .map((r) => {
      const data = r.extractedData as ExtractedData | null;
      if (!data?.items) return null;
      const found = data.items.find(
        (i) => i.item === itemName || i.item.toUpperCase() === itemName.toUpperCase()
      );
      if (!found) return null;
      return {
        date: format(new Date(r.testDate ?? r.createdAt), "M/d", { locale: ja }),
        value: found.value,
      };
    })
    .filter(Boolean) as Array<{ date: string; value: number }>;
}

// よく使われる主要検査項目
const KEY_ITEMS = ["WBC", "HGB", "PLT", "CRE", "BUN", "GLU", "HbA1c", "CRP", "K", "Na", "AST", "ALT"];

export default function PatientDetail() {
  const params = useParams<{ id: string }>();
  const patientId = parseInt(params.id ?? "0");

  const { data: patient, isLoading: patientLoading } = trpc.patient.get.useQuery({ id: patientId });
  const { data: records, isLoading: recordsLoading } = trpc.bloodTest.list.useQuery({ patientId });

  const isLoading = patientLoading || recordsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!patient) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center py-16">
          <p className="text-muted-foreground">患者が見つかりません</p>
          <Link href="/patients">
            <Button variant="outline" size="sm" className="mt-4">患者一覧に戻る</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const completedRecords = records?.filter((r) => r.status === "completed") ?? [];

  // 利用可能な検査項目を収集
  const availableItems = new Set<string>();
  completedRecords.forEach((r) => {
    const data = r.extractedData as ExtractedData | null;
    data?.items?.forEach((i) => availableItems.add(i.item));
  });

  const trendItems = KEY_ITEMS.filter((k) => availableItems.has(k));

  const genderLabel = (g: string | null) => {
    if (g === "male") return "男性";
    if (g === "female") return "女性";
    if (g === "other") return "その他";
    return null;
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/patients">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                患者一覧
              </Button>
            </Link>
          </div>
          <Link href={`/upload?patientId=${patientId}`}>
            <Button size="sm" className="gap-2">
              <Upload className="w-3.5 h-3.5" />
              新規解析
            </Button>
          </Link>
        </div>

        {/* Patient Info */}
        <Card className="border-border shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-foreground">{patient.name}</h2>
                  {patient.patientCode && (
                    <Badge variant="secondary" className="text-xs">{patient.patientCode}</Badge>
                  )}
                  {patient.gender && (
                    <Badge variant="outline" className="text-xs">{genderLabel(patient.gender)}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  {patient.birthYear && (
                    <span className="text-xs text-muted-foreground">{patient.birthYear}年生</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    解析 {records?.length ?? 0}件
                  </span>
                  <span className="text-xs text-muted-foreground">
                    登録: {format(new Date(patient.createdAt), "yyyy年M月d日", { locale: ja })}
                  </span>
                </div>
                {patient.notes && (
                  <p className="text-xs text-muted-foreground mt-1.5 p-2 rounded bg-muted/50">{patient.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="records">
          <TabsList className="h-9">
            <TabsTrigger value="records" className="text-xs">解析履歴</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs">経時変化</TabsTrigger>
          </TabsList>

          {/* Records Tab */}
          <TabsContent value="records" className="mt-4 space-y-3">
            {records?.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">解析履歴がありません</p>
              </div>
            ) : (
              records?.map((record) => {
                const extractedData = record.extractedData as ExtractedData | null;
                const itemCount = extractedData?.items?.length ?? 0;
                return (
                  <Card key={record.id} className="border-border shadow-none hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                          {record.imageUrl ? (
                            <img src={record.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">解析 #{record.id}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(record.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
                            </span>
                            {record.testDate && (
                              <span className="text-xs text-muted-foreground">
                                採血日: {format(new Date(record.testDate), "M月d日", { locale: ja })}
                              </span>
                            )}
                            {itemCount > 0 && (
                              <span className="text-xs text-muted-foreground">{itemCount}項目</span>
                            )}
                          </div>
                        </div>
                        {record.status === "completed" && (
                          <Link href={`/report/${record.id}`}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">
                              レポート
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="mt-4">
            {trendItems.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">経時変化を表示するには複数の解析が必要です</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendItems.map((itemName) => {
                  const trendData = buildTrendData(
                    completedRecords.map((r) => ({
                      createdAt: new Date(r.createdAt),
                      testDate: r.testDate ? new Date(r.testDate) : null,
                      extractedData: r.extractedData,
                    })),
                    itemName
                  );
                  if (trendData.length < 2) return null;

                  const ref = REFERENCE_VALUES[itemName];
                  const latest = trendData[trendData.length - 1];
                  const prev = trendData[trendData.length - 2];
                  const trend = latest && prev ? latest.value - prev.value : 0;

                  return (
                    <Card key={itemName} className="border-border shadow-none">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs font-semibold text-foreground">
                            {ref?.fullName ?? itemName}
                            <span className="text-muted-foreground font-normal ml-1">({itemName})</span>
                          </CardTitle>
                          <div className="flex items-center gap-1.5">
                            {latest && (
                              <span className="text-sm font-bold text-foreground">
                                {latest.value}
                                <span className="text-xs font-normal text-muted-foreground ml-1">{ref?.unit}</span>
                              </span>
                            )}
                            {trend !== 0 && (
                              trend > 0
                                ? <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                                : <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
                            )}
                          </div>
                        </div>
                        {ref && (
                          <p className="text-xs text-muted-foreground">
                            基準値: {ref.min ?? "−"} 〜 {ref.max ?? "−"} {ref.unit}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="px-2 pb-4">
                        <ResponsiveContainer width="100%" height={140}>
                          <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 240)" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} width={40} />
                            <Tooltip
                              contentStyle={{ fontSize: 11, borderRadius: 6 }}
                              formatter={(v: number) => [`${v} ${ref?.unit ?? ""}`, itemName]}
                            />
                            {ref?.min !== undefined && (
                              <ReferenceLine y={ref.min} stroke="oklch(0.52 0.18 220)" strokeDasharray="4 2" strokeWidth={1} />
                            )}
                            {ref?.max !== undefined && (
                              <ReferenceLine y={ref.max} stroke="oklch(0.62 0.18 45)" strokeDasharray="4 2" strokeWidth={1} />
                            )}
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="oklch(0.38 0.12 240)"
                              strokeWidth={2}
                              dot={{ fill: "oklch(0.38 0.12 240)", r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 mt-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                グラフの破線は一般的な基準値の上下限を示します。個人差や測定条件により異なる場合があります。
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
