"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestAccessPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar solicitação");
    } finally {
      setLoading(false);
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
            Acesso exclusivo para executivos
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
            CaptableBR é uma plataforma exclusiva para executivos de startups brasileiras.
            Solicite acesso e entraremos em contato.
          </p>
          <div className="space-y-4">
            {[
              "Acesso por convite direto",
              "Dados 100% anonimizados",
              "Apenas executivos verificados",
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
            {submitted ? (
              <>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <CardTitle className="text-2xl">Solicitação enviada!</CardTitle>
                <CardDescription>
                  Sua solicitação será avaliada e você receberá um convite por email caso aprovada.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl">Solicitar acesso</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo. Avaliaremos sua solicitação e enviaremos um convite.
                </CardDescription>
              </>
            )}
          </CardHeader>
          {!submitted && (
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
                  <Label htmlFor="message">Por que deseja acesso?</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Conte um pouco sobre sua posição e por que gostaria de usar a plataforma..."
                    className="min-h-[100px] resize-none"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar solicitação"}
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
          {submitted && (
            <CardContent>
              <Link href="/login">
                <Button variant="outline" className="w-full h-11">
                  Voltar para login
                </Button>
              </Link>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
