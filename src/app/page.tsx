import type { Metadata } from "next";
import Link from "next/link";
import {
  FaUserInjured,
  FaUserDoctor,
  FaShieldHalved,
  FaBrain,
  FaArrowRight,
  FaCloudArrowUp,
  FaChartLine,
} from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Prescripto-AI | AI Medical Analytics Platform",
  description:
    "Upload prescriptions and medical reports. Get AI-structured health summaries instantly.",
};

const portals = [
  {
    href: "/patient",
    icon: FaUserInjured,
    label: "Patient Portal",
    description: "Upload prescriptions and medical reports for AI analysis.",
    color: "#6366f1",
    bg: "#eef2ff",
    darkBg: "#1e1b4b",
  },
  {
    href: "/doctor",
    icon: FaUserDoctor,
    label: "Doctor Portal",
    description: "View patient health timelines and diagnostic history.",
    color: "#06b6d4",
    bg: "#ecfeff",
    darkBg: "#0c4a6e",
  },
  {
    href: "/admin",
    icon: FaShieldHalved,
    label: "Admin Portal",
    description: "Monitor system audit logs and manage data settings.",
    color: "#10b981",
    bg: "#ecfdf5",
    darkBg: "#064e3b",
  },
];

const features = [
  {
    icon: FaCloudArrowUp,
    title: "Smart Upload",
    desc: "Drag and drop PDFs or images of any prescription.",
  },
  {
    icon: FaBrain,
    title: "AI Extraction",
    desc: "Gemini AI parses medicines, diagnoses, and test results.",
  },
  {
    icon: FaChartLine,
    title: "Health Analytics",
    desc: "Track antibiotic usage and diagnostic trends over time.",
  },
];

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border"
          style={{
            backgroundColor: "var(--color-brand-subtle)",
            color: "var(--color-brand)",
            borderColor: "var(--color-brand)",
            borderOpacity: 0.2,
          }}
        >
          <FaBrain className="w-3 h-3" />
          Powered by Gemini 2.5 Flash
        </div>

        <h1
          className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Medical Records,
          <br />
          <span style={{ color: "var(--color-brand)" }}>Intelligently Organized</span>
        </h1>

        <p
          className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Upload any prescription or medical report. Our AI extracts structured
          health data instantly — medicines, diagnoses, test results, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/patient"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: "var(--color-brand)",
              color: "#ffffff",
            }}
          >
            Start Uploading
            <FaArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/doctor"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border transition-all hover:opacity-80"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            View Doctor Dashboard
          </Link>
        </div>
      </section>

      {/* Feature highlights */}
      <section
        className="border-y"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--color-brand-subtle)" }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: "var(--color-brand)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-semibold text-sm mb-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2
          className="text-2xl font-bold mb-3 text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          Choose Your Portal
        </h2>
        <p
          className="text-center text-sm mb-12"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Three dedicated workspaces built for different roles.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map(({ href, icon: Icon, label, description, color }) => (
            <Link
              key={href}
              href={href}
              className="group p-6 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: color + "20" }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3
                className="font-semibold text-base mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                {label}
              </h3>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {description}
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium group-hover:gap-2.5 transition-all"
                style={{ color }}
              >
                Open portal
                <FaArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
