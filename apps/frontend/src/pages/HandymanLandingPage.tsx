import { useEffect } from "react";

const services = [
  {
    title: "הרכבת רהיטים",
    description: "איקאה, ארונות, שידות ומיטות בצורה מדויקת, יציבה ובטוחה לאורך זמן.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    icon: "🪛",
  },
  {
    title: "תלייה מקצועית",
    description:
      "טלוויזיות על כל סוגי הקירות כולל גבס, מדפים, מראות, תאורה ותמונות בדיוק מושלם.",
    image:
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80",
    icon: "📺",
  },
  {
    title: "תיקונים כלליים וצבע",
    description:
      "סתימת חורים, צביעת קירות, החלפת מנעולים וידיות, החלפת ברזים ותיקוני אינסטלציה קלים.",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    icon: "🎨",
  },
  {
    title: "פתרונות בהתאמה אישית",
    description:
      "זקוקים למשהו מיוחד? אנחנו ניידים, יצירתיים ומוצאים פתרון לכל בעיה בבית.",
    image:
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80",
    icon: "🧰",
  },
];

const portfolio = [
  {
    title: "תליית טלוויזיה מדויקת בסלון",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "הרכבת ארון מודרני חדש",
    image:
      "https://images.unsplash.com/photo-1617104551722-3b2d5136649e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "צביעת קיר דגש בסלון",
    image:
      "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "תליית גלריית מסגרות ומדפים",
    image:
      "https://images.unsplash.com/photo-1616627561839-074385245ff6?auto=format&fit=crop&w=1200&q=80",
  },
];

const benefits = [
  {
    title: "זמינות גבוהה וניידות",
    text: "מגיעים מהר לכל מקום בתל אביב, המרכז וגוש דן.",
    icon: "⚡",
  },
  {
    title: "עבודה נקייה ומסודרת",
    text: "שומרים על הבית או המשרד נקיים ומסודרים בסיום העבודה.",
    icon: "✨",
  },
  {
    title: "מחירים הוגנים ושקיפות",
    text: "תמחור ברור מראש, בלי הפתעות בסוף העבודה.",
    icon: "💬",
  },
];

export function HandymanLandingPage() {
  useEffect(() => {
    document.documentElement.setAttribute("lang", "he");
    document.documentElement.setAttribute("dir", "rtl");
    document.title = "רז וחן – הנדימן מקצועי בתל אביב והמרכז";
  }, []);

  return (
    <div dir="rtl" className="bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <p className="text-base font-bold text-slate-900">רז וחן – הנדימן</p>
          <a
            href="tel:+972501234567"
            className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
          >
            <span aria-hidden>📞</span>
            חיוג מהיר
          </a>
        </div>
      </nav>

      <main>
        <section className="relative isolate overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1920&q=80"
            alt="הנדימן מקצועי עם כלי עבודה בדירה מודרנית"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/70" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="mb-4 inline-flex rounded-full border border-emerald-200/30 bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-100">
              מבוססים בתל אביב וניידים לכל מקום במרכז ובגוש דן!
            </p>
            <h1 className="max-w-3xl text-3xl leading-tight font-extrabold text-white sm:text-5xl">
              צריכים תיקון בבית או במשרד? רז וחן כאן בשבילכם!
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-100 sm:text-lg">
              שירותי הנדימן מקצועיים בתל אביב והסביבה. הרכבה, תלייה, תיקונים קטנים
              ועבודות מיוחדות. מגיעים לכל מקום במרכז במהירות ובמחירים הוגנים.
            </p>
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-xl">
              <a
                href="https://wa.me/972501234567"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-600"
              >
                <span aria-hidden>🟢</span>
                שלחו לנו הודעה בוואטסאפ
              </a>
              <a
                href="tel:+972501234567"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition hover:bg-sky-700"
              >
                <span aria-hidden>📞</span>
                התקשרו עכשיו לייעוץ חינם
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">אזור השירותים שלנו</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <img src={service.image} alt={service.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="mb-2 text-xl">{service.icon}</p>
                  <h3 className="text-lg font-bold text-slate-900">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center sm:py-16">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                הכירו את רז וחן – הצוות שלכם לכל תיקון
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-700">
                אנחנו רז וחן, שותפים וחברים שהחליטו להביא את עולם ההנדימן לרמה אחרת
                של שירות במרכז. עבורנו, הנדימן זה לא רק לקדוח חור בקיר – זה להגיע
                בזמן, לעבוד נקי, לדבר בגובה העיניים ולהשאיר אתכם עם חיוך וראש שקט.
                אנחנו מבוססים בתל אביב אבל ניידים עם הרכב והציוד המקצועי ביותר לכל
                נקודה שתצטרכו.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-2xl">
                👷
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-800">כאן תבוא תמונה של רז וחן מהשטח</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">עבודות שלנו מהשטח</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {portfolio.map((item) => (
              <figure key={item.title} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />
                <figcaption className="px-3 py-2 text-xs font-medium text-slate-600">{item.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 py-14 text-white sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold sm:text-3xl">למה לבחור בנו?</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                  <p className="text-2xl">{benefit.icon}</p>
                  <h3 className="mt-3 text-lg font-bold">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{benefit.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="rounded-3xl bg-gradient-to-l from-sky-800 to-slate-900 p-6 text-center text-white shadow-xl sm:p-10">
            <h2 className="text-2xl font-extrabold sm:text-3xl">יש לכם פרויקט בשבילנו? דברו איתנו עכשיו!</h2>
            <div className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href="https://wa.me/972501234567"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
              >
                שלחו הודעה בוואטסאפ
              </a>
              <a
                href="tel:+972501234567"
                className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
              >
                התקשרו עכשיו
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500 sm:px-6">
        © 2026 רז וחן הנדימן. כל הזכויות שמורות.
      </footer>

      <div className="fixed right-3 bottom-3 z-50 flex w-[calc(100%-1.5rem)] gap-2 sm:hidden">
        <a
          href="https://wa.me/972501234567"
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-full bg-emerald-500 px-4 py-3 text-center text-sm font-bold text-white shadow-lg"
        >
          וואטסאפ
        </a>
        <a
          href="tel:+972501234567"
          className="flex-1 rounded-full bg-sky-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg"
        >
          חיוג
        </a>
      </div>
    </div>
  );
}
