"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUser } from "@/lib/admin";

interface Props {
  email: string;
}

export function DeleteUserButton({ email }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deleteUser(email);
      const parts: string[] = [];
      if (result.deletedSubmission) parts.push("dados de compensacao");
      if (result.deletedFirebase) parts.push("conta Firebase");
      if (result.deletedInvitation) parts.push("convite");
      if (result.deletedRequests > 0) parts.push(`${result.deletedRequests} solicitacao(oes)`);
      if (result.deletedGcs) parts.push("documentos GCS");
      toast.success(
        parts.length > 0
          ? `Removido: ${parts.join(", ")}`
          : "Usuario removido (sem dados encontrados)"
      );
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="h-8"
          title="Remove todos os dados (LGPD)"
        >
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir usuario permanentemente?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso ira remover permanentemente todos os dados do usuario{" "}
            <strong>{email}</strong>: conta Firebase, dados de compensacao,
            documentos e convite. Esta acao e irreversivel (LGPD).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Sim, excluir tudo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
