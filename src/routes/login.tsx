import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Корпоративный вход · ATLAS" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fa] px-5 text-[#233c52]">
      <section className="w-full max-w-md rounded-3xl border border-[#dfe7ec] bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d6b78]">
          ATLAS · закрытый пилот
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Корпоративный вход</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#5f7484]">
          Финансовый реестр доступен только назначенным сотрудникам через единый корпоративный вход.
        </p>
        <a
          href="/auth/login"
          className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#183a52] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0f2839]"
        >
          Продолжить через корпоративный вход
        </a>
        <p className="mt-5 text-xs leading-relaxed text-[#7c8794]">
          Если доступ не назначен или вход не открывается, обратитесь к владельцу ATLAS.
        </p>
      </section>
    </main>
  );
}
