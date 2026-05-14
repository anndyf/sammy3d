import { redirect } from "next/navigation";

// O proxy protege esta rota — só usuários com sessão chegam aqui.
// Redirecionar para /dashboard (painel principal do admin).
export default function RootPage() {
  redirect("/dashboard");
}
