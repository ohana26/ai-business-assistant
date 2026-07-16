import { useEffect, type ReactNode } from "react";

const PHONE_NUMBER = "+972501234567";
const WHATSAPP_NUMBER = "972501234567";
const WHATSAPP_BASE_TEXT = "היי רז וחן, ראיתי את האתר ואשמח להצעת מחיר.";

const trustPillars = [
  {
    title: "זמינות מהירה וניידות",
    description: "אנחנו עם רכב וציוד מלאים, ומגיעים במהירות לכל תל אביב והמרכז.",
    icon: <LightningIcon />,
    tone: "from-amber-100 to-orange-100 text-amber-700",
  },
  {
    title: "עבודה נקייה ומסודרת",
    description: "מתייחסים לבית שלכם כמו לבית שלנו - נקי, מדויק ומכבד לאורך כל הדרך.",
    icon: <SparkleIcon />,
    tone: "from-emerald-100 to-lime-100 text-emerald-700",
  },
  {
    title: "שקיפות ומחיר הוגן",
    description: "תמחור ברור מראש, בלי אותיות קטנות ובלי הפתעות בסוף העבודה.",
    icon: <ShieldIcon />,
    tone: "from-sky-100 to-indigo-100 text-sky-700",
  },
];

const services = [
  {
    title: "הרכבת רהיטים ואיקאה",
    description: "הרכבה יציבה ומדויקת לארונות, מיטות, שידות ורהיטים מורכבים.",
    icon: <FurnitureIcon />,
    whatsappText: "שלום, אשמח להצעת מחיר להרכבת רהיטים ואיקאה.",
  },
  {
    title: "תלייה מקצועית וקירות",
    description: "טלוויזיות, מראות כבדות, מדפים, תאורה ווילונות על כל סוגי הקירות.",
    icon: <WallIcon />,
    whatsappText: "שלום, אשמח להצעת מחיר לתלייה מקצועית וקירות.",
  },
  {
    title: "תיקונים ואינסטלציה קלה",
    description: "נזילות קטנות, ברזים, ידיות, מנעולים, תיקוני צבע והתקנות חכמות.",
    icon: <WrenchIcon />,
    whatsappText: "שלום, אשמח להצעת מחיר לתיקונים ואינסטלציה קלה.",
  },
  {
    title: "פתרונות מיוחדים בהתאמה אישית",
    description: "יש לכם משימה מיוחדת? נחשוב איתכם ונבנה פתרון חכם, נקי ואסתטי.",
    icon: <CustomIcon />,
    whatsappText: "שלום, יש לי פרויקט מיוחד ואשמח להתייעצות מהירה.",
  },
];

const portfolio = [
  {
    title: "תליית טלוויזיה",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80",
    badge: "תלייה מקצועית",
  },
  {
    title: "ארון איקאה בהרכבה מלאה",
    image:
      "https://images.unsplash.com/photo-1617104551722-3b2d5136649e?auto=format&fit=crop&w=1200&q=80",
    badge: "הרכבה מדויקת",
  },
  {
    title: "צביעה וגימור נקי",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
    badge: "צבע וחידוש",
  },
  {
    title: "גלריית קיר מעוצבת",
    image:
      "https://images.unsplash.com/photo-1616627561839-074385245ff6?auto=format&fit=crop&w=1200&q=80",
    badge: "עיצוב והתקנה",
  },
];

function getWhatsAppLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function IconBadge({ children, tone }: { children: ReactNode; tone: string }) {
  return (
    <div
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone}`}
      aria-hidden
    >
      {children}
    </div>
  );
}

export function HandymanLandingPage() {
  useEffect(() => {
    document.documentElement.setAttribute("lang", "he");
    document.documentElement.setAttribute("dir", "rtl");
    document.title = "רז וחן – הנדימן מקצועי בתל אביב והמרכז";
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-100 text-slate-900"
    >
      <header>
        <nav
          aria-label="ניווט ראשי"
          className="sticky top-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-md"
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(15,23,42,0.22)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-slate-800"
              aria-label="חיוג מהיר לרז וחן"
            >
              <PhoneIcon className="h-4 w-4 animate-pulse" />
              חיוג מהיר
            </a>
            <p className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
              רז וחן <span className="mx-1 text-slate-300">|</span> הנדימן מקצועי
            </p>
          </div>
        </nav>
      </header>

      <main>
        <section aria-labelledby="hero-title" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <article className="order-2 lg:order-1">
              <p className="mb-4 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 shadow-sm">
                📍 תל אביב והסביבה | ניידים לכל המרכז
              </p>
              <h1
                id="hero-title"
                className="text-3xl leading-tight font-black tracking-tight text-slate-900 sm:text-5xl"
              >
                <span className="bg-gradient-to-l from-slate-900 via-slate-700 to-emerald-700 bg-clip-text text-transparent">
                  מתקנים את הבית בראש שקט. בלי חאפרים, בלי הפתעות.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                רז וחן מביאים סטנדרט חדש של שירות והגינות לתל אביב והמרכז. מתליית
                טלוויזיה ועד הרכבה מורכבת של איקאה - אנחנו אצלכם עם הציוד הכי מקצועי
                שיש.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={getWhatsAppLink(WHATSAPP_BASE_TEXT)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="שליחת הודעה בוואטסאפ לרז וחן"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_35px_rgba(34,197,94,0.35)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:bg-emerald-600"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  דברו איתנו בוואטסאפ
                </a>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  aria-label="התקשרו עכשיו"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-bold text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.05)] backdrop-blur-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl"
                >
                  <PhoneIcon className="h-5 w-5" />
                  התקשרו עכשיו
                </a>
              </div>
            </article>

            <div className="order-1 lg:order-2">
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white/70 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1581147036324-c47a03a81d48?auto=format&fit=crop&w=1400&q=80"
                  alt="ציוד עבודה מקצועי בבית מודרני"
                  className="h-[320px] w-full rounded-[1.35rem] object-cover sm:h-[420px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="trust-title" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
          <h2 id="trust-title" className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            למה לקוחות בוחרים ברז וחן?
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {trustPillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl"
              >
                <IconBadge tone={pillar.tone}>{pillar.icon}</IconBadge>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="services-title" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <h2 id="services-title" className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            קטלוג שירותים מקצועי
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{service.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{service.description}</p>
                    <a
                      href={getWhatsAppLink(service.whatsappText)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-semibold text-emerald-700 transition-all duration-300 ease-in-out hover:text-emerald-800"
                      aria-label={`שליחת הודעה בוואטסאפ בנושא ${service.title}`}
                    >
                      לפרטים ושליחת תמונה
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="team-title" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md sm:p-8">
              <h2 id="team-title" className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                הכירו את רז וחן
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                הכרנו דרך אהבה משותפת לעבודת יד מדויקת ולאנשים. אחרי שנים של פרויקטים
                ולקוחות מרוצים, החלטנו לבנות שירות הנדימן אחר: כזה שמגיע בזמן, עובד
                נקי, מסביר הכל מראש ומשאיר בית מסודר וחוויה נעימה. המטרה שלנו פשוטה:
                שתדעו שיש לכם צוות מקצועי ואמין לכל תיקון, הרכבה או שדרוג בבית.
              </p>
            </article>

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-300/80 bg-gradient-to-b from-emerald-50/60 to-white px-6 text-center animate-pulse">
                <AvatarIcon />
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  העלו כאן תמונה של רז וחן מהשטח
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="gallery-title" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <h2 id="gallery-title" className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            גלריית עבודות מהשטח
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {portfolio.map((item) => (
              <figure
                key={item.title}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-52 w-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
                  />
                  <span className="absolute right-3 bottom-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {item.badge}
                  </span>
                </div>
                <figcaption className="px-4 py-3 text-sm font-medium text-slate-700">{item.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pt-8 pb-14 sm:px-6 sm:pb-16">
          <article className="rounded-3xl bg-gradient-to-l from-slate-900 to-slate-800 p-7 text-white shadow-2xl shadow-slate-900/20 sm:p-10">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              יש לכם פרויקט בשבילנו? שלחו הודעה או תמונות ונחזור עם הצעת מחיר בתוך
              דקות!
            </h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={getWhatsAppLink(WHATSAPP_BASE_TEXT)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_35px_rgba(34,197,94,0.4)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:bg-emerald-600"
                aria-label="שליחת הודעה בוואטסאפ"
              >
                <WhatsAppIcon className="h-5 w-5" />
                שלחו הודעה בוואטסאפ
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/40 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-white/20"
                aria-label="התקשרו לרז וחן"
              >
                <PhoneIcon className="h-5 w-5" />
                התקשרו עכשיו
              </a>
            </div>
          </article>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 px-4 py-8 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-600 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden />
            <span>זמינים לשירות בתל אביב והמרכז</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={getWhatsAppLink(WHATSAPP_BASE_TEXT)} target="_blank" rel="noreferrer" className="hover:text-slate-900">
              וואטסאפ
            </a>
            <a href={`tel:${PHONE_NUMBER}`} className="hover:text-slate-900">
              טלפון
            </a>
          </div>
          <p>© 2026 רז וחן הנדימן. כל הזכויות שמורות.</p>
        </div>
      </footer>

      <div className="fixed right-3 bottom-3 z-50 flex w-[calc(100%-1.5rem)] gap-2 sm:hidden">
        <a
          href={getWhatsAppLink(WHATSAPP_BASE_TEXT)}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-full bg-emerald-500 px-4 py-3 text-center text-sm font-bold text-white shadow-xl"
          aria-label="וואטסאפ מהיר"
        >
          וואטסאפ
        </a>
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white shadow-xl"
          aria-label="חיוג מהיר"
        >
          חיוג
        </a>
      </div>
    </div>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6.6 10.8a15.7 15.7 0 006.6 6.6l2.2-2.2a1 1 0 011-.24c1.08.36 2.24.56 3.44.56a1 1 0 011 1V20a1 1 0 01-1 1C11.16 21 3 12.84 3 2.99a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.36.56 3.44a1 1 0 01-.25 1L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20.52 3.48A11.9 11.9 0 0012.06 0C5.46 0 .1 5.36.1 11.95c0 2.1.55 4.17 1.59 6L0 24l6.25-1.64a11.93 11.93 0 005.81 1.48h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.2-3.5-8.41zM12.07 21.8h-.01a9.88 9.88 0 01-5.03-1.38l-.36-.21-3.7.97.99-3.6-.24-.37a9.86 9.86 0 01-1.54-5.26c0-5.47 4.45-9.92 9.93-9.92 2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 012.9 7c0 5.47-4.45 9.92-9.95 9.92zm5.44-7.44c-.3-.15-1.8-.89-2.07-.99-.28-.1-.49-.15-.69.15-.2.3-.79.99-.96 1.2-.18.2-.36.23-.66.08-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.52-1.78-1.7-2.08-.17-.3-.02-.47.13-.62.13-.13.3-.34.45-.5.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.54-.08-.15-.7-1.67-.96-2.3-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.5.07-.76.38s-1 1-.96 2.45c.03 1.44 1.02 2.83 1.16 3.03.15.2 2 3.05 4.83 4.28.67.29 1.2.47 1.6.6.67.21 1.28.18 1.77.11.54-.08 1.8-.73 2.05-1.44.26-.7.26-1.3.18-1.44-.08-.13-.28-.2-.59-.35z"
        fill="currentColor"
      />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM5 16l.9 2.1L8 19l-2.1.9L5 22l-.9-2.1L2 19l2.1-.9L5 16zm14-1l1.2 2.8L23 19l-2.8 1.2L19 23l-1.2-2.8L15 19l2.8-1.2L19 15z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M12 2l8 3v6c0 5.25-3.4 9.74-8 11-4.6-1.26-8-5.75-8-11V5l8-3zm-1 12l6-6-1.4-1.4L11 11.2 8.4 8.6 7 10l4 4z"
        fill="currentColor"
      />
    </svg>
  );
}

function FurnitureIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-700" fill="none" aria-hidden>
      <path
        d="M4 8a2 2 0 012-2h12a2 2 0 012 2v8h-2v4h-2v-4H8v4H6v-4H4V8zm2 0v4h12V8H6z"
        fill="currentColor"
      />
    </svg>
  );
}

function WallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-700" fill="none" aria-hidden>
      <path
        d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h5v8H3v-8zm7 0h11v8H10v-8z"
        fill="currentColor"
      />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-700" fill="none" aria-hidden>
      <path
        d="M14.7 6.3a4.5 4.5 0 01-5.9 5.9L3 18v3h3l5.8-5.8a4.5 4.5 0 005.9-5.9l-2.4 2.4-2.6-.8-.8-2.6 2.4-2.4z"
        fill="currentColor"
      />
    </svg>
  );
}

function CustomIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-700" fill="none" aria-hidden>
      <path
        d="M11 3h2v4h-2V3zm0 14h2v4h-2v-4zM3 11h4v2H3v-2zm14 0h4v2h-4v-2zm-9.2-5.8l1.4-1.4L12 6.6l2.8-2.8 1.4 1.4L13.4 8l2.8 2.8-1.4 1.4L12 9.4l-2.8 2.8-1.4-1.4L10.6 8 7.8 5.2z"
        fill="currentColor"
      />
    </svg>
  );
}

function AvatarIcon() {
  return (
    <svg viewBox="0 0 120 120" className="h-20 w-20 text-slate-500" fill="none" aria-hidden>
      <circle cx="60" cy="40" r="20" fill="currentColor" opacity="0.35" />
      <path
        d="M20 102c0-18 18-30 40-30s40 12 40 30"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
