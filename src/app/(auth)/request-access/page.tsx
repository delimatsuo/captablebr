"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLES } from "@/lib/types";

const ROLE_LABELS: Record<string, string> = {
  "CEO": "CEO",
  "COO": "COO",
  "CFO": "CFO",
  "CTO": "CTO",
  "CMO": "CMO",
  "CRO/VP Sales": "CRO/VP Vendas",
  "CPO/VP Product": "CPO/VP Produto",
  "CHRO/VP People": "CHRO/VP Pessoas",
  "VP Engineering": "VP Engenharia",
  "Other C-Level": "Outro C-Level",
  "Other VP": "Outro VP",
};

type FormState = "form" | "verifying" | "approved" | "pending" | "error";

export default function RequestAccessPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [role, setRole] = useState("");
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("form");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!lgpdConsent) {
      setErrorMessage("Você precisa autorizar o processamento do perfil do LinkedIn.");
      return;
    }

    setFormState("verifying");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, linkedinUrl, role, lgpdConsent }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar");
      }

      const data = await res.json();

      if (data.status === "approved") {
        setFormState("approved");
      } else {
        setFormState("pending");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao enviar solicitação");
      setFormState("error");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold">CaptableBR</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Acesso gratuito para executivos
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
            CaptableBR oferece benchmarks gratuitos de equity e remuneração para executivos de startups brasileiras.
          </p>
          <div className="space-y-4">
            {[
              "Verificação automática via IA",
              "Dados 100% anonimizados",
              "Acesso imediato após verificação",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold">CaptableBR</span>
            </div>

            {formState === "approved" && (
              <>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <CardTitle className="text-2xl">Perfil verificado!</CardTitle>
                <CardDescription>
                  Faça login com Google para acessar os benchmarks.
                </CardDescription>
              </>
            )}

            {formState === "pending" && (
              <>
                <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <CardTitle className="text-2xl">Perfil em análise</CardTitle>
                <CardDescription>
                  Seu perfil está em análise. Você receberá um email quando aprovado.
                </CardDescription>
              </>
            )}

            {formState === "verifying" && (
              <>
                <CardTitle className="text-2xl">Verificando...</CardTitle>
                <CardDescription>
                  Verificando seu perfil no LinkedIn...
                </CardDescription>
              </>
            )}

            {formState === "error" && (
              <>
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                </div>
                <CardTitle className="text-2xl">Erro na verificação</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </>
            )}

            {formState === "form" && (
              <>
                <CardTitle className="text-2xl">Criar conta</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo. Verificaremos seu perfil do LinkedIn automaticamente.
                </CardDescription>
              </>
            )}
          </CardHeader>

          {formState === "verifying" && (
            <CardContent className="space-y-4">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Isso pode levar até 60 segundos...
              </p>
            </CardContent>
          )}

          {formState === "approved" && (
            <CardContent>
              <Link href="/login">
                <Button className="w-full h-11">Fazer login</Button>
              </Link>
            </CardContent>
          )}

          {formState === "pending" && (
            <CardContent>
              <Link href="/login">
                <Button variant="outline" className="w-full h-11">
                  Voltar para login
                </Button>
              </Link>
            </CardContent>
          )}

          {formState === "error" && (
            <CardContent className="space-y-3">
              <Button
                className="w-full h-11"
                onClick={() => {
                  setErrorMessage("");
                  setFormState("form");
                }}
              >
                Tentar novamente
              </Button>
              <Link href="/login">
                <Button variant="outline" className="w-full h-11">
                  Voltar para login
                </Button>
              </Link>
            </CardContent>
          )}

          {formState === "form" && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="linkedin.com/in/seu-perfil"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione seu cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r] || r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="lgpdConsent"
                    checked={lgpdConsent}
                    onCheckedChange={(checked) => setLgpdConsent(checked === true)}
                  />
                  <Label htmlFor="lgpdConsent" className="text-sm leading-snug cursor-pointer">
                    Autorizo o processamento do meu perfil do LinkedIn para verificação
                  </Label>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    {errorMessage}
                  </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={!role || !lgpdConsent}>
                  Verificar e criar conta
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground pt-4">
                Já tem acesso?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Entrar
                </Link>
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
