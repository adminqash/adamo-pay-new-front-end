import { Avatar, AvatarFallback, AvatarImage } from "@adamosuiteservices/ui/avatar";
import { Badge } from "@adamosuiteservices/ui/badge";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adamosuiteservices/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@adamosuiteservices/ui/dropdown-menu";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { useAvatar } from "@/features/common/contexts/use-avatar";

export function ProfilePage() {
  const { t, i18n } = useTranslation(["profile"]);
  const { avatarUrl, setAvatarUrl, userInitials, userName, userEmail, userRole } = useAvatar();
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isDeactivate2FADialogOpen, setIsDeactivate2FADialogOpen] = useState(false);
  const [deactivate2FAStep, setDeactivate2FAStep] = useState(1);
  const [deactivateOtpCode, setDeactivateOtpCode] = useState("");
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // Password validation
  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasUpperCase && hasNumber;
  };

  const isNewPasswordValid = validatePassword(newPassword);
  const doPasswordsMatch = newPassword === confirmPassword;
  const showPasswordError = hasAttemptedSubmit && newPassword.length > 0 && !isNewPasswordValid;
  const showConfirmError = hasAttemptedSubmit && confirmPassword.length > 0 && !doPasswordsMatch;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        ToastManager.show({
          message: t("profile:header.photo_updated"),
          variant: "success",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarUrl("");
    ToastManager.show({
      message: t("profile:header.photo_deleted"),
      variant: "success",
    });
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("profile:page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="flex w-full flex-col gap-6 p-6">
          {/* Profile header */}
          <div className="flex w-full flex-col gap-4">
            <div className={`
              flex w-full flex-wrap items-center gap-8 rounded-3xl bg-muted p-6
            `}
            >
              <div
                className="relative"
                onMouseEnter={() => setIsAvatarHovered(true)}
                onMouseLeave={() => !isDropdownOpen && setIsAvatarHovered(false)}
              >
                <Avatar className="size-[92px] rounded-2xl">
                  <AvatarImage src={avatarUrl} alt={userName} />
                  <AvatarFallback className={`
                    rounded-2xl bg-primary-100 text-2xl font-bold text-primary
                  `}
                  >
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {(isAvatarHovered || isDropdownOpen) && (
                  <>
                    <div className={`
                      pointer-events-none absolute inset-0 rounded-2xl
                      bg-white/20
                    `}
                    />
                    {avatarUrl
                      ? (
                        <DropdownMenu onOpenChange={setIsDropdownOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              className={`
                                absolute right-0 bottom-0 left-0 z-10 w-full
                              `}
                            >
                              {t("profile:header.update_photo")}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                              {t("profile:header.upload_photo")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={handleDeleteAvatar}
                              className="text-destructive"
                            >
                              {t("profile:header.delete_photo")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )
                      : (
                        <Button
                          variant="secondary"
                          size="sm"
                          className={`
                            absolute right-0 bottom-0 left-0 z-10 w-full
                          `}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {t("profile:header.update_photo")}
                        </Button>
                      )}
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex min-w-[275px] flex-1 flex-col gap-2">
                <h1 className={`
                  text-base leading-[22px] font-bold text-foreground
                `}
                >
                  {userName}
                </h1>
                <p className="text-base leading-[22px] text-foreground">
                  {userEmail}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={`
                  h-8 bg-[#e5f3fa] px-2 text-sm leading-5 text-foreground
                `}
              >
                {userRole}
              </Badge>
            </div>
            <p className="text-sm leading-5 text-foreground">
              {t("profile:header.email_update_notice")}{" "}
              <span className="text-pay-500">{t("profile:header.customer_service")}</span>
            </p>
          </div>
          {/* Settings cards */}
          <div className="flex w-full flex-wrap gap-4">
            {/* Security card */}
            <Card className={`
              flex w-full flex-col gap-8 p-6
              md:w-auto md:flex-[1_1_480px]
            `}
            >
              <div className="flex flex-col gap-4">
                <div className={`
                  flex h-14 w-fit items-center gap-3 rounded-full bg-pay-25 px-4
                  py-4
                `}
                >
                  <Icon
                    symbol="verified_user"
                    weight={200}
                    className="text-pay-500"
                  />
                </div>
                <h2 className="text-sm leading-5 font-bold text-foreground">
                  {t("profile:security.title")}
                </h2>
                <p className="text-sm leading-5 text-foreground">
                  {t("profile:security.description")}
                </p>
              </div>
              <div className={`
                flex flex-col items-start gap-4
                md:flex-row md:gap-6
              `}
              >
                <Button variant="secondary" onClick={() => setIsPasswordDialogOpen(true)}>
                  {t("profile:security.change_password")}
                </Button>
                <Button
                  variant={is2FAEnabled ? "destructive-medium" : "default"}
                  onClick={() => {
                    if (is2FAEnabled) {
                      // Abrir dialog de confirmación
                      setIsDeactivate2FADialogOpen(true);
                    } else {
                      // Abrir dialog para activar 2FA
                      setIs2FADialogOpen(true);
                    }
                  }}
                >
                  {is2FAEnabled
                    ? t("profile:security.deactivate_2fa")
                    : t("profile:security.activate_2fa")}
                </Button>
              </div>
            </Card>
            {/* Language card */}
            <Card className={`
              flex w-full flex-col gap-8 p-6
              md:w-auto md:flex-[1_1_480px]
            `}
            >
              <div className="flex flex-col gap-4">
                <div className={`
                  flex h-14 w-fit items-center gap-3 rounded-full bg-pay-25 px-4
                  py-4
                `}
                >
                  <Icon symbol="language" weight={200} className="text-pay-500" />
                </div>
                <h2 className="text-sm leading-5 font-bold text-foreground">
                  {t("profile:language.title")}
                </h2>
                <p className="text-sm leading-5 text-foreground">
                  {t("profile:language.description")}
                  <br />
                  {t("profile:language.current")}
                </p>
              </div>
              <div className="flex gap-6">
                <Button variant="secondary" onClick={() => setIsLanguageDialogOpen(true)}>
                  {t("profile:language.change_language")}
                </Button>
              </div>
            </Card>
            {/* Billing card */}
            <Card className={`
              flex w-full flex-col gap-8 p-6
              md:w-auto md:flex-[1_1_480px]
            `}
            >
              <div className="flex flex-col gap-4">
                <div className={`
                  flex h-14 w-fit items-center gap-3 rounded-full bg-pay-25 px-4
                  py-4
                `}
                >
                  <Icon
                    symbol="receipt_long"
                    weight={200}
                    className="text-pay-500"
                  />
                </div>
                <h2 className="text-sm leading-5 font-bold text-foreground">
                  {t("profile:billing.title")}
                </h2>
                <p className="text-sm leading-5 text-foreground">
                  {t("profile:billing.description")}
                </p>
              </div>
              <div className="flex gap-6">
                <Button variant="secondary">
                  {t("profile:billing.manage_plan")}
                </Button>
              </div>
            </Card>
          </div>
        </Card>
      </PageContainer>
      {/* Language dialog */}
      <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-sm font-semibold">
              {t("profile:language.dialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground">
              {t("profile:language.dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-8">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsLanguageDialogOpen(false);
                setSelectedLanguage(i18n.language);
              }}
            >
              {t("profile:language.dialog.cancel")}
            </Button>
            <Button
              variant="default"
              disabled={selectedLanguage === i18n.language}
              onClick={() => {
                i18n.changeLanguage(selectedLanguage);
                setIsLanguageDialogOpen(false);
                ToastManager.show({
                  message: t("profile:language.dialog.success"),
                  variant: "success",
                });
              }}
            >
              {t("profile:language.dialog.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Password dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open);
          if (!open) {
            setPasswordStep(1);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            setHasAttemptedSubmit(false);
          }
        }}
      >
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-sm font-semibold">
              {t("profile:security.password_dialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground">
              {passwordStep === 1
                ? t("profile:security.password_dialog.step1_description")
                : t("profile:security.password_dialog.step2_description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-8">
            {passwordStep === 1
              ? (
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder={t("profile:security.password_dialog.current_password_placeholder")}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={`
                      absolute inset-y-0 right-2 flex items-center
                      text-foreground-secondary
                      hover:text-foreground
                    `}
                  >
                    <Icon
                      symbol={showCurrentPassword ? "visibility" : "visibility_off"}
                      weight={200}
                      className="size-6"
                    />
                  </button>
                </div>
              )
              : (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder={t("profile:security.password_dialog.new_password_placeholder")}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        aria-invalid={showPasswordError}
                        className="h-10 w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={`
                          absolute inset-y-0 right-2 flex items-center
                          text-foreground-secondary
                          hover:text-foreground
                        `}
                      >
                        <Icon
                          symbol={showNewPassword ? "visibility" : "visibility_off"}
                          weight={200}
                          className="size-6"
                        />
                      </button>
                    </div>
                    <p className="text-xs leading-4 text-foreground">
                      {t("profile:security.password_dialog.password_requirements")}
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("profile:security.password_dialog.confirm_password_placeholder")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      aria-invalid={showConfirmError}
                      className="h-10 w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`
                        absolute inset-y-0 right-2 flex items-center
                        text-foreground-secondary
                        hover:text-foreground
                      `}
                    >
                      <Icon
                        symbol={showConfirmPassword ? "visibility" : "visibility_off"}
                        weight={200}
                        className="size-6"
                      />
                    </button>
                  </div>
                </div>
              )}
          </div>
          <DialogFooter className="gap-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setPasswordStep(1);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setHasAttemptedSubmit(false);
              }}
            >
              {t("profile:security.password_dialog.cancel")}
            </Button>
            <Button
              variant="default"
              disabled={
                passwordStep === 1
                  ? !currentPassword.trim()
                  : !newPassword.trim() || !confirmPassword.trim()
              }
              onClick={() => {
                if (passwordStep === 1) {
                  setPasswordStep(2);
                  setHasAttemptedSubmit(false);
                } else {
                  // Check if there are validation errors
                  if (!isNewPasswordValid || !doPasswordsMatch) {
                    setHasAttemptedSubmit(true);
                    return;
                  }

                  // TODO: Implement password change logic
                  console.log("Change password:", { currentPassword, newPassword });
                  ToastManager.show({
                    message: t("profile:security.password_dialog.success"),
                    variant: "success",
                  });
                  setIsPasswordDialogOpen(false);
                  setPasswordStep(1);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setHasAttemptedSubmit(false);
                }
              }}
            >
              {passwordStep === 1
                ? t("profile:security.password_dialog.continue")
                : t("profile:security.password_dialog.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 2FA dialog */}
      <Dialog
        open={is2FADialogOpen}
        onOpenChange={(open) => {
          setIs2FADialogOpen(open);
          if (!open) {
            setTwoFAStep(1);
            setOtpCode("");
          }
        }}
      >
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-sm font-semibold">
              {t("profile:security.twofa_dialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-foreground">
              {twoFAStep === 1
                ? t("profile:security.twofa_dialog.step1_description")
                : t("profile:security.twofa_dialog.step2_description")}
            </DialogDescription>
          </DialogHeader>
          {twoFAStep === 2 && (
            <div className="flex flex-col gap-6">
              {/* QR Code Container */}
              <div className={`
                flex w-full flex-col items-center gap-6 rounded-3xl bg-muted p-6
              `}
              >
                {/* QR Code */}
                <div className="rounded bg-white p-4 shadow-sm">
                  <div className={`
                    flex h-36 w-36 items-center justify-center bg-foreground/10
                  `}
                  >
                    {/* Placeholder for QR code - replace with actual QR code component */}
                  </div>
                </div>
                {/* Secret Key */}
                <div className="flex w-full flex-col gap-2">
                  <p className={`
                    text-center text-xs leading-4 text-muted-foreground
                  `}
                  >
                    {t("profile:security.twofa_dialog.secret_key_label")}
                  </p>
                  <div className={`
                    flex items-center justify-center gap-2 rounded-lg bg-accent
                    px-3 py-3
                  `}
                  >
                    <p className={`
                      flex-1 text-center text-sm leading-5 text-foreground
                    `}
                    >
                      ZVF3 XCP2 CHG5 A246
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("ZVF3XCP2CHG5A246");
                        ToastManager.show({
                          message: "Clave copiada",
                          variant: "success",
                        });
                      }}
                      className={`
                        text-foreground
                        hover:text-foreground/80
                      `}
                    >
                      <Icon symbol="content_copy" className="size-6" />
                    </button>
                  </div>
                </div>
              </div>
              {/* OTP Input */}
              <div className="flex flex-col gap-3">
                <p className="text-center text-sm leading-5 text-foreground">
                  {t("profile:security.twofa_dialog.otp_label")}
                </p>
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={setOtpCode}
                >
                  <InputOTPGroup className="w-full gap-2">
                    <InputOTPSlot index={0} className="h-10 flex-1" />
                    <InputOTPSlot index={1} className="h-10 flex-1" />
                    <InputOTPSlot index={2} className="h-10 flex-1" />
                    <InputOTPSlot index={3} className="h-10 flex-1" />
                    <InputOTPSlot index={4} className="h-10 flex-1" />
                    <InputOTPSlot index={5} className="h-10 flex-1" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          )}
          <DialogFooter className="gap-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIs2FADialogOpen(false);
                setTwoFAStep(1);
                setOtpCode("");
              }}
            >
              {t("profile:security.twofa_dialog.cancel")}
            </Button>
            <Button
              variant="default"
              disabled={twoFAStep === 2 && otpCode.length !== 6}
              onClick={() => {
                if (twoFAStep === 1) {
                  setTwoFAStep(2);
                } else {
                  // TODO: Implement 2FA activation logic
                  console.log("Activate 2FA with code:", otpCode);
                  setIs2FAEnabled(true);
                  ToastManager.show({
                    message: t("profile:security.twofa_dialog.success"),
                    variant: "success",
                  });
                  setIs2FADialogOpen(false);
                  setTwoFAStep(1);
                  setOtpCode("");
                }
              }}
            >
              {twoFAStep === 1
                ? t("profile:security.twofa_dialog.continue")
                : t("profile:security.twofa_dialog.activate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Deactivate 2FA dialog */}
      <Dialog
        open={isDeactivate2FADialogOpen}
        onOpenChange={(open) => {
          setIsDeactivate2FADialogOpen(open);
          if (!open) {
            setDeactivate2FAStep(1);
            setDeactivateOtpCode("");
          }
        }}
      >
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-sm font-semibold">
              {t("profile:security.deactivate_2fa_dialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-foreground">
              {deactivate2FAStep === 1
                ? t("profile:security.deactivate_2fa_dialog.description")
                : t("profile:security.deactivate_2fa_dialog.otp_description")}
            </DialogDescription>
          </DialogHeader>
          {deactivate2FAStep === 2 && (
            <InputOTP
              maxLength={6}
              value={deactivateOtpCode}
              onChange={setDeactivateOtpCode}
            >
              <InputOTPGroup className="w-full gap-2">
                <InputOTPSlot index={0} className="h-10 flex-1" />
                <InputOTPSlot index={1} className="h-10 flex-1" />
                <InputOTPSlot index={2} className="h-10 flex-1" />
                <InputOTPSlot index={3} className="h-10 flex-1" />
                <InputOTPSlot index={4} className="h-10 flex-1" />
                <InputOTPSlot index={5} className="h-10 flex-1" />
              </InputOTPGroup>
            </InputOTP>
          )}
          <DialogFooter className="gap-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeactivate2FADialogOpen(false);
                setDeactivate2FAStep(1);
                setDeactivateOtpCode("");
              }}
            >
              {t("profile:security.deactivate_2fa_dialog.cancel")}
            </Button>
            <Button
              variant="destructive-medium"
              disabled={deactivate2FAStep === 2 && deactivateOtpCode.length !== 6}
              onClick={() => {
                if (deactivate2FAStep === 1) {
                  setDeactivate2FAStep(2);
                } else {
                  // TODO: Implement 2FA deactivation logic with OTP
                  console.log("Deactivate 2FA with code:", deactivateOtpCode);
                  setIs2FAEnabled(false);
                  setIsDeactivate2FADialogOpen(false);
                  setDeactivate2FAStep(1);
                  setDeactivateOtpCode("");
                  ToastManager.show({
                    message: t("profile:security.deactivate_2fa_success"),
                    variant: "warning",
                  });
                }
              }}
            >
              {t("profile:security.deactivate_2fa_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
