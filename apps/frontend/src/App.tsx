import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  Workflow,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

type Language = "en" | "he";

type ProcessStep = {
  title: string;
  description: string;
};

type Project = {
  title: string;
  tech: string;
  challengeLabel: string;
  challenge: string;
  solutionLabel: string;
  solution: string;
};

type TranslationContent = {
  direction: "ltr" | "rtl";
  nav: {
    about: string;
    process: string;
    projects: string;
    contact: string;
  };
  hero: {
    heading: string;
    subheading: string;
    cta: string;
  };
  processSectionTitle: string;
  processSteps: ProcessStep[];
  projectsTitle: string;
  projects: Project[];
  aboutTitle: string;
  aboutName: string;
  aboutBio: string;
  contactTitle: string;
  contactSubtitle: string;
  formLabels: {
    name: string;
    email: string;
    phone: string;
    message: string;
    submit: string;
  };
  directContact: string;
  footer: string;
};

const translations: Record<Language, TranslationContent> = {
  en: {
    direction: "ltr",
    nav: {
      about: "About",
      process: "Process",
      projects: "Projects",
      contact: "Contact",
    },
    hero: {
      heading: "Turning Complex Business Problems Into Scalable Software. Fast.",
      subheading:
        "Hi, I'm Chen. I don't just write code. I partner with founders and businesses to architect, build, and deploy production-ready MVPs and custom software.",
      cta: "Let's Solve Your Problem (Free Discovery Call)",
    },
    processSectionTitle: "My Process",
    processSteps: [
      {
        title: "1. Diagnose",
        description:
          "A quick 20-minute call to map your business bottlenecks, manual tasks, and goals.",
      },
      {
        title: "2. Architect",
        description:
          "Designing a lean, secure, and cost-effective blueprint (databases, APIs, AI integrations) without bloated hosting costs.",
      },
      {
        title: "3. Rapid Build",
        description:
          "Developing your custom system using modern tech (React, Supabase, AI systems) to launch a fully working MVP in weeks.",
      },
    ],
    projectsTitle: "Selected Projects",
    projects: [
      {
        title: "SaaS & Serverless Systems",
        tech: "React, Node.js, AWS Lambda, Terraform",
        challengeLabel: "Challenge",
        challenge: "Manual data-heavy processes costing hours of daily work.",
        solutionLabel: "Solution",
        solution:
          "Designed high-scale serverless backend to automate workloads and display data on a responsive React dashboard.",
      },
      {
        title: "AI-Powered Automations & Integrations",
        tech: "React, OpenAI API, Supabase DB",
        challengeLabel: "Challenge",
        challenge:
          "Sifting through unstructured user requests and manual lead sorting.",
        solutionLabel: "Solution",
        solution:
          "Built an automated AI pipeline that processes text requests, categorizes them, and syncs them directly to a secure DB.",
      },
      {
        title: "Custom MVPs & Web Applications",
        tech: "React, Supabase, Lovable, Vercel/Railway",
        challengeLabel: "Challenge",
        challenge:
          "High development costs and slow time-to-market for early-stage startups.",
        solutionLabel: "Solution",
        solution:
          "Developed a rapid, production-ready MVP with auth, database, and custom logic in record time.",
      },
    ],
    aboutTitle: "About Me",
    aboutName: "Chen Ochana (חן אוחנה)",
    aboutBio:
      "I am a results-driven Software Engineer holding a B.Sc. in Computer Science. My background includes building full-stack applications in demanding environments at Cellebrite and Almond, alongside deploying scalable cloud infrastructures (AWS, Docker, Terraform). I specialize in bridging the gap between business processes, AI integrations, and automated DevOps operations to deliver high-performance software solutions.",
    contactTitle: "Let's Build Something That Moves Your Business Forward",
    contactSubtitle:
      "Tell me what is blocking your growth and I will map the fastest way to a working, scalable solution.",
    formLabels: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      submit: "Send Message",
    },
    directContact: "Direct Contact",
    footer: "Designed and engineered by Chen Ochana.",
  },
  he: {
    direction: "rtl",
    nav: {
      about: "אודות",
      process: "תהליך",
      projects: "פרויקטים",
      contact: "יצירת קשר",
    },
    hero: {
      heading: "הופכים בעיות עסקיות מורכבות למוצרים עובדים. מהר.",
      subheading:
        "היי, אני חן. אני לא רק כותב קוד – אני עוזר ליזמים ולעסקים לאפיין בעיות, לתכנן את הארכיטקטורה הנכונה ביותר, ולהפוך אותן לאפליקציות ומערכות ווב חכמות ויציבות בחצי מהזמן.",
      cta: "בוא נפתור את הבעיה שלך (שיחת אפיון ללא התחייבות)",
    },
    processSectionTitle: "תהליך העבודה",
    processSteps: [
      {
        title: "1. אבחון",
        description:
          "שיחה קצרה של 20 דקות למיפוי צווארי הבקבוק בעסק, העבודה הידנית והמטרות שלכם.",
      },
      {
        title: "2. ארכיטקטורה",
        description:
          "תכנון ארכיטקטורה רזה, מאובטחת וחסכונית (בסיסי נתונים, APIs, ואינטגרציות AI) ללא עלויות שרתים מנופחות.",
      },
      {
        title: "3. פיתוח מהיר",
        description:
          "פיתוח המערכת שלכם באמצעות הטכנולוגיות המתקדמות ביותר (React, Supabase, כלי AI) להשקת מוצר עובד תוך שבועות בודדים.",
      },
    ],
    projectsTitle: "פרויקטים נבחרים",
    projects: [
      {
        title: "SaaS & Serverless Systems",
        tech: "React, Node.js, AWS Lambda, Terraform",
        challengeLabel: "אתגר",
        challenge: "תהליכים ידניים מורכבים שגזלו שעות עבודה יומיומיות.",
        solutionLabel: "פתרון",
        solution:
          "תכנון בקאנד סרברלס חסכוני לביצוע אוטומציות מלאות והצגת הנתונים בדשבורד React מהיר.",
      },
      {
        title: "AI-Powered Automations & Integrations",
        tech: "React, OpenAI API, Supabase DB",
        challengeLabel: "אתגר",
        challenge: "סינון ידני של לידים וניתוח פניות משתמשים לא מובנות.",
        solutionLabel: "פתרון",
        solution:
          "הקמת תשתית AI אוטומטית שמנתחת פניות טקסט, מסווגת אותן ומסנכרנת אותן ישירות לבסיס נתונים מאובטח.",
      },
      {
        title: "Custom MVPs & Web Applications",
        tech: "React, Supabase, Lovable, Vercel/Railway",
        challengeLabel: "אתגר",
        challenge:
          "עלויות פיתוח גבוהות וזמן השקה איטי לסטארטאפים בתחילת הדרך.",
        solutionLabel: "פתרון",
        solution:
          "פיתוח והשקה מהירה של מוצר עובד (MVP) הכולל מערכת משתמשים, בסיס נתונים ולוגיקה מותאמת אישית בזמן שיא.",
      },
    ],
    aboutTitle: "קצת עליי",
    aboutName: "חן אוחנה (Chen Ochana)",
    aboutBio:
      "מהנדס תוכנה ממוקד תוצאות, בעל תואר B.Sc במדעי המחשב. הרקע המקצועי שלי כולל פיתוח מערכות Full Stack בסביבות עבודה אינטנסיביות בחברות Cellebrite ו-Almond, לצד הקמת תשתיות ענן ודאטה מתקדמות (AWS, Docker, Terraform). אני מתמחה בחיבור בין תהליכים עסקיים, שילוב כלי AI, ואוטומציות DevOps כדי לייצר פתרונות תוכנה מהירים ויציבים.",
    contactTitle: "בואו נבנה יחד מערכת שמקדמת את העסק שלכם",
    contactSubtitle:
      "ספרו לי מה מעכב את הצמיחה שלכם, ואבנה עבורכם את המסלול הקצר ביותר לפתרון עובד וסקיילבילי.",
    formLabels: {
      name: "שם",
      email: "אימייל",
      phone: "טלפון",
      message: "הודעה",
      submit: "שליחה",
    },
    directContact: "יצירת קשר ישירה",
    footer: "עוצב ונבנה על ידי Chen Ochana.",
  },
};

function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const browserLanguage = navigator.language.toLowerCase();
    setLanguage(browserLanguage.startsWith("he") ? "he" : "en");
    setHydrated(true);
  }, []);

  const content = useMemo(() => translations[language], [language]);
  const isRtl = content.direction === "rtl";

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    document.documentElement.lang = language;
    document.documentElement.dir = content.direction;
  }, [content.direction, hydrated, language]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 ${
            isRtl ? "text-right" : "text-left"
          }`}
          aria-label="Main navigation"
        >
          <a
            href="#hero"
            className="text-lg font-semibold tracking-wide text-slate-100 transition-colors hover:text-emerald-400"
          >
            Chen Ochana
          </a>
          <div className="flex items-center gap-2 md:gap-3">
            <a className="nav-link" href="#about">
              {content.nav.about}
            </a>
            <a className="nav-link" href="#process">
              {content.nav.process}
            </a>
            <a className="nav-link" href="#projects">
              {content.nav.projects}
            </a>
            <a className="nav-link" href="#contact">
              {content.nav.contact}
            </a>
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "he" : "en")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/75 px-3 py-1.5 text-xs font-medium tracking-wide text-slate-100 transition hover:border-emerald-500/80 hover:text-emerald-300"
            >
              <Globe size={14} />
              {language === "en" ? "HE" : "EN"}
            </button>
          </div>
        </nav>
      </header>

      <main
        className={`mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:gap-10 ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <section
          id="hero"
          className="glass-panel section-glow relative overflow-hidden p-8 md:p-12"
        >
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-28 -right-12 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative z-10 max-w-4xl">
            <h1 className="text-3xl font-bold leading-tight text-slate-50 md:text-5xl">
              {content.hero.heading}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-300 md:text-lg">
              {content.hero.subheading}
            </p>
            <a href="#contact" className="hero-cta mt-8 inline-flex">
              {content.hero.cta}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </section>

        <section id="process" className="space-y-5">
          <h2 className="section-title">{content.processSectionTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {content.processSteps.map((step) => (
              <article key={step.title} className="glass-panel section-glow p-6">
                <h3 className="text-lg font-semibold text-emerald-300">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="space-y-5">
          <h2 className="section-title">{content.projectsTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {content.projects.map((project) => (
              <article key={project.title} className="glass-panel section-glow p-6">
                <h3 className="text-lg font-semibold text-indigo-300">
                  {project.title}
                </h3>
                <p className="mt-2 text-xs uppercase tracking-wider text-emerald-300/80">
                  {project.tech}
                </p>
                <p className="mt-4 text-sm text-slate-200">
                  <span className="font-semibold text-slate-100">
                    {project.challengeLabel}:
                  </span>{" "}
                  {project.challenge}
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  <span className="font-semibold text-slate-100">
                    {project.solutionLabel}:
                  </span>{" "}
                  {project.solution}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="glass-panel section-glow p-8">
          <h2 className="section-title">{content.aboutTitle}</h2>
          <h3 className="mt-4 text-xl font-semibold text-emerald-300">
            {content.aboutName}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            {content.aboutBio}
          </p>
        </section>

        <section id="contact" className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="glass-panel section-glow p-8">
            <h2 className="section-title">{content.contactTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {content.contactSubtitle}
            </p>
            <form
              action="https://api.web3forms.com/submit"
              method="POST"
              className="mt-6 space-y-4"
            >
              <input
                type="hidden"
                name="access_key"
                value="YOUR_WEB3FORMS_ACCESS_KEY_HERE"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="form-label">
                  {content.formLabels.name}
                  <input
                    required
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder={content.formLabels.name}
                  />
                </label>
                <label className="form-label">
                  {content.formLabels.email}
                  <input
                    required
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder={content.formLabels.email}
                  />
                </label>
              </div>
              <label className="form-label">
                {content.formLabels.phone}
                <input
                  required
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder={content.formLabels.phone}
                />
              </label>
              <label className="form-label">
                {content.formLabels.message}
                <textarea
                  required
                  name="message"
                  rows={5}
                  className="form-input"
                  placeholder={content.formLabels.message}
                />
              </label>
              <button type="submit" className="hero-cta inline-flex">
                {content.formLabels.submit}
                <Workflow size={18} />
              </button>
            </form>
          </article>

          <aside className="glass-panel section-glow p-8">
            <h3 className="section-title">{content.directContact}</h3>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href="mailto:chenochana@gmail.com"
                className="social-link"
                aria-label="Email Chen Ochana"
              >
                <Mail size={18} />
                chenochana@gmail.com
              </a>
              <a
                href="https://linkedin.com/in/chen-ochana"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                aria-label="LinkedIn profile"
              >
                <FaLinkedin size={18} />
                linkedin.com/in/chen-ochana
              </a>
              <a
                href="https://wa.me/972502534754"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                aria-label="WhatsApp contact"
              >
                <Phone size={18} />
                +972 50-253-4754
              </a>
            </div>
          </aside>
        </section>
      </main>

      <a
        href="https://wa.me/972502534754"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.35)] transition hover:bg-emerald-500/25"
        aria-label="Open WhatsApp chat"
      >
        <MessageCircle size={18} />
        WhatsApp
      </a>

      <footer className="border-t border-slate-800/80 px-6 py-8 text-center text-sm text-slate-400">
        {content.footer}
      </footer>
    </div>
  );
}

export default App;
