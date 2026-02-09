import { Button } from "@adamosuiteservices/ui/button";
import { Card, CardContent, CardFooter } from "@adamosuiteservices/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@adamosuiteservices/ui/field";
import { Input } from "@adamosuiteservices/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import type { TranslateFunction } from "@/lib/i18n/i18n.types";
import { useCreateDocument } from "@/features/documents/application/hooks/use-create-document";

const CREATE_DOCUMENT_FORM_ID = "create-document-form";

function buildFormSchema(t: TranslateFunction) {
  return z.object({
    name: z.string().min(1, t("documents:create_document.name_required")),
  });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

export function CreateDocumentForm() {
  const { t } = useTranslation(["documents"]);

  const FormSchema = buildFormSchema(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  const mutation = useCreateDocument();

  const submit = (values: FormValues) => {
    mutation.mutate(
      { name: values.name },
      {
        onSuccess: () => {},
        onError: () => {},
        onSettled: () => {},
      },
    );
  };

  return (
    <Card>
      <CardContent>
        <form id={CREATE_DOCUMENT_FORM_ID} onSubmit={form.handleSubmit(submit)}>
          <FieldSet>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => {
                  return (
                    <Field>
                      <FieldLabel>{t("documents:create_document.name_label")}</FieldLabel>
                      <Input {...field} />
                      <FieldError errors={[form.formState.errors.name]} />
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form={CREATE_DOCUMENT_FORM_ID}
          loading={mutation.isPending}
        >
          {t("documents:create_document.create_action")}
        </Button>
      </CardFooter>
    </Card>
  );
}
