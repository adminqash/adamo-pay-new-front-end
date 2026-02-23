import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@adamosuiteservices/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@adamosuiteservices/ui/dropdown-menu";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { CountryFlag } from "@/features/common/components/flags/country-flag";

export function AccountsPage() {
  const { t } = useTranslation("accounts");
  const [newAccountName, setNewAccountName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // datos de ejemplo - reemplazar con hook real
  const accounts = [
    {
      id: "1",
      name: "Cuenta principal",
      balance: "$90.784.510,46",
      currency: "COP",
      countryCode: "CO",
    },
    {
      id: "2",
      name: "Cuenta de nómina",
      balance: "$61.002.031,71",
      currency: "COP",
      countryCode: "CO",
    },
    {
      id: "3",
      name: "Cuenta de ahorros",
      balance: "$39.002.031,71",
      currency: "COP",
      countryCode: "CO",
    },
  ];

  const totalBalance = "$190.034.500,59";

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("accounts.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="p-6 flex flex-col gap-6">
          {/* wallet card with gradient */}
          <Card className="bg-gradient-to-r from-[#e5f3fa] to-white border-0 p-6">
            <div className="flex flex-col gap-4">
              <div className="text-sm text-neutrals-700 font-bold leading-5">
                Saldo total disponible
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                  <CountryFlag countryCode="CO" />
                  <span className="text-sm font-bold text-neutrals-700">
                    {totalBalance}
                  </span>
                  <span className="text-sm text-neutrals-700">
                    COP
                  </span>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-6 p-0 text-pay-500">
                      <Icon symbol="add" />
                      Crear nueva cuenta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear nueva cuenta</DialogTitle>
                      <DialogDescription>
                        Ingresa un nombre para crear una nueva cuenta:
                      </DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <Input
                        placeholder="Ingresa un nombre"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                      />
                    </DialogBody>
                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setNewAccountName("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        disabled={!newAccountName.trim()}
                        onClick={() => {
                          // TODO: Implementar creación de cuenta
                          console.log("Crear cuenta:", newAccountName);
                          setIsDialogOpen(false);
                          setNewAccountName("");
                        }}
                      >
                        Crear cuenta
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>

          {/* accounts grid */}
          <div className="flex flex-wrap gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="w-full sm:flex-1 sm:min-w-[400px] bg-pay-50 border-transparent p-6 relative">
                {/* menu button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-4 top-4 h-6 w-6"
                    >
                      <Icon symbol="more_vert" className="text-neutrals-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Añadir saldo
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Transferir a otra cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/accounts/${account.id}/movements`}>
                        Ver movimientos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Editar nombre de cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      Eliminar cuenta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-neutrals-900 leading-5">
                      {account.name}
                    </h3>
                    <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14 w-fit">
                      <span className="text-sm font-bold text-neutrals-700">
                        {account.balance}
                      </span>
                      <span className="text-sm text-neutrals-700">
                        {account.currency}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-8">
                    <Button variant="default" className="w-fit" asChild>
                      <Link to={`/accounts/${account.id}/movements`}>
                        Ver movimientos
                      </Link>
                    </Button>
                    <Button variant="link" className="h-6 p-0 text-pay-500">
                      <Icon symbol="swap_horiz" />
                      Transferir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
