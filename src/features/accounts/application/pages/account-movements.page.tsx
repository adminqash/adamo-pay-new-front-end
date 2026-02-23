import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@adamosuiteservices/ui/breadcrumb";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext } from "@adamosuiteservices/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";

export function AccountMovementsPage() {
  const { t } = useTranslation("accounts");

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // datos de ejemplo - reemplazar con hook real
  const account = {
    name: "Cuenta de nómina",
    balance: "$190.034.500,59",
    currency: "COP",
  };

  const movements = [
    { date: "10/12/2025", type: "Débito", amount: "$22.350.000,00" },
    { date: "11/15/2025", type: "Débito", amount: "$18.750.000,00" },
    { date: "12/01/2025", type: "Débito", amount: "$27.900.000,00" },
    { date: "01/20/2026", type: "Crédito", amount: "$15.500.000,00" },
    { date: "02/15/2026", type: "Crédito", amount: "$20.000.000,00" },
    { date: "03/10/2026", type: "Crédito", amount: "$23.750.000,00" },
    { date: "04/05/2026", type: "Débito", amount: "$19.300.000,00" },
    { date: "05/25/2026", type: "Débito", amount: "$25.500.000,00" },
    { date: "06/30/2026", type: "Crédito", amount: "$30.000.000,00" },
    { date: "07/18/2026", type: "Débito", amount: "$28.150.000,00" },
    { date: "08/12/2026", type: "Débito", amount: "$16.800.000,00" },
    { date: "09/09/2026", type: "Débito", amount: "$22.900.000,00" },
    { date: "10/30/2026", type: "Débito", amount: "$21.250.000,00" },
    { date: "11/21/2026", type: "Crédito", amount: "$24.900.000,00" },
    { date: "12/14/2026", type: "Débito", amount: "$29.000.000,00" },
  ];

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/accounts">{t("accounts.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("movements.page_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="p-6 flex flex-col gap-6">
          {/* account header card */}
          <Card className="bg-gradient-to-r from-[#e5f3fa] to-white border-0 p-6">
            <div className="flex flex-col gap-4">
              <div className="text-sm text-neutrals-700 font-bold leading-5">
                {account.name}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                  <span className="text-sm font-bold text-neutrals-700">
                    {account.balance}
                  </span>
                  <span className="text-sm text-neutrals-700">
                    {account.currency}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-8">
                  <Button variant="default">
                    <Icon symbol="swap_horiz" />
                    Transferir
                  </Button>
                  <Button variant="default" size="icon">
                    <Icon symbol="more_vert" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* movements table */}
          <Card className="p-6 flex flex-col gap-6">
            {/* header with search */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex-1 min-w-[220px]">
                <p className="text-sm font-semibold text-neutrals-700">
                  143 Movimientos
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <Button variant="secondary">
                  Exportar datos
                </Button>
              </div>
              <div className="basis-full lg:basis-0 lg:flex-1 lg:min-w-[500px]">
                <div className="relative">
                  <Icon symbol="search" className="absolute left-2 top-1/2 -translate-y-1/2 text-neutrals-400" />
                  <Input
                    placeholder="Buscar por fecha/ tipo de movimiento o monto"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* table */}
            <Table className="rounded-2xl">
              <TableHeader>
                  <TableRow className="bg-neutrals-25">
                    <TableHead className="text-xs font-semibold text-neutrals-700">FECHA</TableHead>
                    <TableHead className="text-xs font-semibold text-neutrals-700">TIPO DE MOVIMIENTO</TableHead>
                    <TableHead className="text-xs font-semibold text-neutrals-700">MONTO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm text-neutrals-700">{movement.date}</TableCell>
                      <TableCell className="text-sm text-neutrals-700">{movement.type}</TableCell>
                      <TableCell className="text-sm text-neutrals-700">{movement.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>

            {/* pagination */}
            <Pagination className="justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">
                    4
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">
                    13
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Card>
        </Card>
      </PageContainer>
    </>
  );
}
