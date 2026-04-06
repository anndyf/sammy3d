import { redirect } from "next/navigation";

// O proxy protege esta rota — só usuários com sessão chegam aqui.
// Redirecionar para /catalog (painel principal do admin).
export default function RootPage() {
  redirect("/catalog");
}
