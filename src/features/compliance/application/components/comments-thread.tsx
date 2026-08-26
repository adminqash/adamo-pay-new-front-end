import { Avatar, AvatarFallback } from "@adamosuiteservices/ui/avatar";
import { Button } from "@adamosuiteservices/ui/button";
import { Icon } from "@adamosuiteservices/ui/icon";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ComplianceComment } from "@/features/compliance/application/entities/compliance-case.entity";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type CommentsThreadProps = {
  comments: ComplianceComment[]
  canComment: boolean
  isPending?: boolean
  onSubmit: (input: {
    text: string
    attachments: Array<{ name: string, size?: number, contentType?: string }>
  }) => void
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CommentsThread({
  comments,
  canComment,
  isPending,
  onSubmit,
}: CommentsThreadProps) {
  const { t } = useTranslation(["compliance"]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleComments = comments.filter((comment) => comment.type !== "case-resolution");

  return (
    <div className="flex flex-col gap-6">
      {canComment && (
        <div className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("compliance:comments.placeholder")}
            className="min-h-28 w-full rounded-2xl border border-neutrals-200 bg-white p-4 text-sm text-neutrals-900 outline-none"
          />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <span
                  key={`${file.name}-${file.size}`}
                  className="inline-flex items-center gap-2 rounded-full bg-neutrals-50 px-3 py-1 text-xs text-neutrals-700"
                >
                  {file.name}
                  <button
                    type="button"
                    onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                    className="text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="default"
              disabled={!text.trim() || isPending}
              onClick={() => {
                onSubmit({
                  text: text.trim(),
                  attachments: files.map((file) => ({
                    name: file.name,
                    size: file.size,
                    contentType: file.type,
                  })),
                });
                setText("");
                setFiles([]);
              }}
            >
              <Icon symbol="send" weight={200} />
              {t("compliance:comments.submit")}
            </Button>
            <Button variant="link" className="px-0" onClick={() => fileInputRef.current?.click()}>
              <Icon symbol="attach_file" weight={200} />
              {t("compliance:comments.attach")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);
                setFiles((current) => [...current, ...selected]);
                event.target.value = "";
              }}
            />
          </div>
        </div>
      )}

      {visibleComments.map((comment) => (
        <div key={comment.id} className="flex flex-col gap-2 rounded-3xl bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback>{initials(comment.authorName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-neutrals-900">{comment.authorName}</p>
                <p className="text-xs text-neutrals-500">
                  {format(new Date(comment.createdAt), "dd/MM/yy, hh:mm a", { locale: es })}
                </p>
              </div>
            </div>
            <p className="text-xs font-semibold text-neutrals-500">
              {comment.type === "finding-resolution"
                ? t("compliance:comments.finding_resolution")
                : comment.authorRole === "compliance"
                  ? t("compliance:comments.compliance_team")
                  : t("compliance:comments.client")}
            </p>
          </div>
          <p className="whitespace-pre-wrap text-sm text-neutrals-700">{comment.text}</p>
          {comment.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {comment.attachments.map((attachment) => (
                <span
                  key={attachment.name}
                  className="rounded-full bg-neutrals-50 px-3 py-1 text-xs text-neutrals-700"
                >
                  {attachment.name}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
