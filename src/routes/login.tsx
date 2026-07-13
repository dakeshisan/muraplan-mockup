import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

// TODO: заменить демо-логику на реальный POST /api/login
// (httpOnly cookie-сессия + CSRF-токен, серверная валидация).
const AUTH_KEY = "atlas.loggedIn";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход · ATLAS — ERP ATAMURA" },
      { name: "description", content: "Вход в корпоративный портал ATLAS — ERP ATAMURA." },
      { name: "robots", content: "noindex" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant:wght@500;600&family=Jost:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password.trim()) return;
    setBusy(true);
    // Демо: любой пароль пускает дальше.
    // TODO: заменить на fetch("/api/login", { method: "POST", credentials: "include", ... })
    try {
      localStorage.setItem(AUTH_KEY, "1");
    } catch {
      /* ignore */
    }
    // На «/» PersonaPickerProvider покажет «Кто вы сегодня?».
    navigate({ to: "/" });
  };

  const jost = { fontFamily: "'Jost', system-ui, sans-serif" };
  const cormorant = { fontFamily: "'Cormorant', Georgia, serif" };

  return (
    <div className="min-h-screen w-full bg-[#fbf9f5] text-[#233c52]" style={jost}>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* ЛЕВО — брендовая панель */}
        <aside
          className="relative overflow-hidden px-6 py-10 sm:px-10 lg:px-14 lg:py-14 text-white"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #233c52 0%, #1a4b5c 55%, #0d6b78 100%)",
          }}
        >
          {/* Тонкий мотив-логотип в углу */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-[0.12]"
            viewBox="0 0 400 400"
            fill="none"
          >
            <circle cx="200" cy="200" r="180" stroke="#cfb372" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" stroke="#cfb372" strokeWidth="1" />
            <circle cx="200" cy="200" r="100" stroke="#cfb372" strokeWidth="1" />
            <circle cx="200" cy="200" r="60" stroke="#cfb372" strokeWidth="1" />
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i * Math.PI * 2) / 24;
              const x = 200 + Math.cos(a) * 180;
              const y = 200 + Math.sin(a) * 180;
              return <circle key={i} cx={x} cy={y} r="1.6" fill="#cfb372" />;
            })}
          </svg>

          <div className="relative flex h-full flex-col">
            {/* Официальный вордмарк ATAMŪRA GROUP (белая версия для тёмного фона) */}
            <img
              src="/brand/logo-white.svg"
              alt="ATAMŪRA GROUP"
              draggable={false}
              className="h-7 w-auto object-contain sm:h-[28px]"
            />

            {/* Eyebrow */}
            <p
              className="mt-14 text-[11px] uppercase tracking-[0.32em] text-white/75"
              style={{ fontWeight: 500 }}
            >
              ATLAS · ERP ATAMURA
            </p>

            {/* Headline — редакторский Cormorant */}
            <h1
              className="mt-5 text-5xl leading-[1.05] sm:text-6xl lg:text-[64px]"
              style={{ ...cormorant, fontWeight: 500 }}
            >
              <span className="block text-white/95">Вся стройка —</span>
              <span className="block italic" style={{ color: "#cfb372", fontWeight: 600 }}>
                в одном месте
              </span>
            </h1>

            {/* Lead */}
            <p
              className="mt-6 max-w-md text-[15px] leading-relaxed text-white/75"
              style={{ fontWeight: 300 }}
            >
              Заявки, акты, ГПР, снабжение и финансы застройщика — в одном
              рабочем пространстве.
            </p>

            <div className="flex-1" />

            {/* Подвал панели */}
            <div
              className="mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/50"
              style={{ fontWeight: 400 }}
            >
              <span className="h-px w-8 bg-white/25" />
              Алматы · 2026
            </div>
          </div>
        </aside>

        {/* ПРАВО — форма входа */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
          <div className="w-full max-w-sm">
            <p
              className="text-[11px] uppercase tracking-[0.28em] text-[#7c8794]"
              style={{ fontWeight: 500 }}
            >
              Добро пожаловать
            </p>
            <h2
              className="mt-3 text-4xl leading-tight text-[#233c52]"
              style={{ ...cormorant, fontWeight: 600 }}
            >
              Вход в портал
            </h2>

            <div className="my-7 h-px w-full bg-[#e9e4db]" />

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[12px] text-[#5f7484]"
                  style={{ fontWeight: 400 }}
                >
                  Введите пароль портала
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-[#e9e4db] bg-white px-4 py-3 text-[15px] text-[#233c52] outline-none transition-colors placeholder:text-[#a9b3bd] focus:border-[#233c52] focus:ring-2 focus:ring-[#233c52]/15"
                  placeholder="••••••••"
                  style={{ fontWeight: 400 }}
                />
              </div>

              <button
                type="submit"
                disabled={busy || !password.trim()}
                className="w-full rounded-md bg-[#233c52] px-4 py-3 text-[14px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#182b3d] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ fontWeight: 500 }}
              >
                {busy ? "Входим…" : "Войти"}
              </button>

              <p
                className="pt-1 text-center text-[11px] text-[#8a97a3]"
                style={{ fontWeight: 300 }}
              >
                демо: любой пароль
              </p>
            </form>

            <div className="mt-10 h-px w-full bg-[#e9e4db]" />
            <p
              className="mt-4 text-center text-[11px] uppercase tracking-[0.22em] text-[#a1abb5]"
              style={{ fontWeight: 400 }}
            >
              © ATAMURA · ATLAS
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
