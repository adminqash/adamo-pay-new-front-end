import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { Card } from "@adamosuiteservices/ui/card";
import { Button } from "@adamosuiteservices/ui/button";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  ctaText?: string;
  ctaAction?: () => void;
}

export function NotificationsPage() {
  const { t } = useTranslation(["notifications"]);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Pago recibido",
      description: "Se ha recibido un pago de $50,000 COP",
      time: "Hace 5 minutos",
      isRead: false,
      ctaText: "Ver detalles",
      ctaAction: () => console.log("Ver detalles pago"),
    },
    {
      id: "2",
      title: "Lote procesado",
      description: "El lote #1234 se ha procesado correctamente",
      time: "Hace 1 hora",
      isRead: true,
      ctaText: "Descargar reporte",
      ctaAction: () => console.log("Descargar reporte"),
    },
    {
      id: "3",
      title: "Documento aprobado",
      description: "Tu documento ha sido aprobado y está listo para usar",
      time: "Hace 2 horas",
      isRead: true,
    },
    {
      id: "4",
      title: "Pago pendiente",
      description: "Tienes un pago pendiente de aprobación",
      time: "Hace 3 horas",
      isRead: true,
      ctaText: "Revisar pago",
      ctaAction: () => console.log("Revisar pago"),
    },
    {
      id: "5",
      title: "Transferencia completada",
      description: "Se ha completado la transferencia de $120,000 COP",
      time: "Hace 5 horas",
      isRead: true,
    },
    {
      id: "6",
      title: "Nuevo beneficiario agregado",
      description: "Se ha agregado un nuevo beneficiario a tu cuenta",
      time: "Hace 1 día",
      isRead: true,
      ctaText: "Ver beneficiario",
      ctaAction: () => console.log("Ver beneficiario"),
    },
  ]);

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("notifications:page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 border border-neutral-200 rounded-3xl ${
                notification.isRead ? "bg-neutral-50" : "bg-white"
              }`}
            >
              <div className="flex flex-wrap gap-6 items-start">
                {/* Text + CTA section */}
                <div className="flex flex-col gap-4 flex-1 min-w-[200px]">
                  {/* Title and description */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <div className="size-2 shrink-0 rounded-full bg-destructive" />
                      )}
                      <p className="text-sm font-semibold text-neutral-700">
                        {notification.title}
                      </p>
                    </div>
                    <p className="text-sm text-neutral-700">
                      {notification.description}
                    </p>
                  </div>

                  {/* CTA button (optional) */}
                  {notification.ctaText && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-6 p-0 text-pay-500 self-start"
                      onClick={notification.ctaAction}
                    >
                      {notification.ctaText}
                    </Button>
                  )}
                </div>

                {/* Time */}
                <p className="text-sm text-neutral-400 whitespace-nowrap shrink-0">
                  {notification.time}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
