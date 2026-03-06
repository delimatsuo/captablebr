"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteGrant } from "@/lib/actions";

export function GrantDeleteButton({ grantId }: { grantId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este grant?")) return;
    try {
      await deleteGrant(grantId);
      toast.success("Grant excluido");
      router.refresh();
    } catch {
      toast.error("Erro ao excluir grant");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive">
      Excluir
    </Button>
  );
}
