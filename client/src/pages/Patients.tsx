import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  ArrowRight,
  User,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

function AddPatientDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [patientCode, setPatientCode] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const createMutation = trpc.patient.create.useMutation({
    onSuccess: () => {
      toast.success("患者を登録しました");
      utils.patient.list.invalidate();
      setOpen(false);
      setName(""); setPatientCode(""); setBirthYear(""); setGender(""); setNotes("");
      onSuccess();
    },
    onError: (e) => toast.error(`登録に失敗しました: ${e.message}`),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          患者を追加
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">患者を登録</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">患者名 <span className="text-red-500">*</span></Label>
            <Input
              placeholder="例：田中 太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">患者コード（任意）</Label>
              <Input
                placeholder="例：PT-001"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">生年（任意）</Label>
              <Input
                type="number"
                placeholder="例：1950"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">性別（任意）</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as typeof gender)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男性</SelectItem>
                <SelectItem value="female">女性</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">メモ（任意）</Label>
            <Textarea
              placeholder="既往歴・特記事項など"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm resize-none"
              rows={3}
            />
          </div>
          <Button
            className="w-full"
            disabled={!name.trim() || createMutation.isPending}
            onClick={() =>
              createMutation.mutate({
                name: name.trim(),
                patientCode: patientCode.trim() || undefined,
                birthYear: birthYear ? parseInt(birthYear) : undefined,
                gender: gender || undefined,
                notes: notes.trim() || undefined,
              })
            }
          >
            {createMutation.isPending ? "登録中..." : "登録する"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Patients() {
  const [search, setSearch] = useState("");
  const { data: patients, isLoading } = trpc.patient.list.useQuery();
  const { data: records } = trpc.bloodTest.list.useQuery({ patientId: undefined });

  const recordCountMap = new Map<number, number>();
  records?.forEach((r) => {
    if (r.patientId) {
      recordCountMap.set(r.patientId, (recordCountMap.get(r.patientId) ?? 0) + 1);
    }
  });

  const filtered = patients?.filter((p) => {
    if (!search) return true;
    return p.name.includes(search) || p.patientCode?.includes(search);
  }) ?? [];

  const genderLabel = (g: string | null) => {
    if (g === "male") return "男性";
    if (g === "female") return "女性";
    if (g === "other") return "その他";
    return null;
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">患者管理</h1>
            <p className="text-muted-foreground text-sm mt-1">患者情報と採血データの経時変化を管理します</p>
          </div>
          <AddPatientDialog onSuccess={() => {}} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="患者名・コードで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Patients */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {search ? "検索結果がありません" : "患者が登録されていません"}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground mt-2">
                「患者を追加」から患者情報を登録できます
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((patient) => {
              const count = recordCountMap.get(patient.id) ?? 0;
              return (
                <Card key={patient.id} className="border-border shadow-none hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{patient.name}</span>
                          {patient.patientCode && (
                            <Badge variant="secondary" className="text-xs">{patient.patientCode}</Badge>
                          )}
                          {patient.gender && (
                            <Badge variant="outline" className="text-xs">{genderLabel(patient.gender)}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          {patient.birthYear && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {patient.birthYear}年生
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            解析 {count}件
                          </span>
                          <span className="text-xs text-muted-foreground">
                            登録: {format(new Date(patient.createdAt), "yyyy年M月d日", { locale: ja })}
                          </span>
                        </div>
                        {patient.notes && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{patient.notes}</p>
                        )}
                      </div>
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">
                          詳細
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {filtered.length}名の患者
          </p>
        )}
      </div>
    </AppLayout>
  );
}
