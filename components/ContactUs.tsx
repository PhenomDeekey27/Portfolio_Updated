"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ArrowUpRight, Mail, MapPin, Phone, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import HiddenLeafSeal from "./motifs/HiddenLeafSeal";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";
import ContactWorld from "./worlds/ContactWorld";
import { profile } from "@/lib/data/profile";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const toastStyle = {
  background: "#111419",
  color: "#ede7da",
  border: "1px solid rgba(201, 163, 95, 0.35)",
  fontSize: "13px",
};

interface CommunicationRecord {
  id: string;
  label: string;
  value: string;
  href?: string;
  icon: LucideIcon;
}

const RECORDS: CommunicationRecord[] = [
  {
    id: "email",
    label: "Email transmission",
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
  },
  {
    id: "phone",
    label: "Direct contact number",
    value: profile.phone,
    href: profile.phoneHref,
    icon: Phone,
  },
  {
    id: "location",
    label: "Current location",
    value: profile.location,
    icon: MapPin,
  },
];

type TransmissionStatus = "idle" | "sending" | "sent" | "error";

/**
 * CONTACT — the Hokage Communication Chamber.
 *
 * PHASE 6.12 — the section is now its own environment (an inline vector
 * chamber, `ContactWorld`) and the form is a parchment transmission scroll.
 *
 * The submission path is unchanged: the same Web3Forms endpoint, the same
 * `access_key` from `NEXT_PUBLIC_WEB3FORMS_KEY`, the same real response
 * handling. Nothing is faked — "sealed" only appears when the endpoint
 * actually returns `success: true`, and a failure surfaces the endpoint's own
 * message (plus a clear inline alert) rather than a generic success.
 */
export default function Contact() {
  const [status, setStatus] = useState<TransmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = status === "sending";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";
    formData.append("access_key", accessKey);

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (data.success) {
        setStatus("sent");
        toast.success("Transmission sealed. I'll be in touch.", {
          style: toastStyle,
          iconTheme: { primary: "#c9a35f", secondary: "#111419" },
        });
        form.reset();
      } else {
        const message = data.message || "The transmission could not be sent.";
        setStatus("error");
        setErrorMessage(message);
        toast.error(message, { style: toastStyle });
      }
    } catch {
      const message =
        "The transmission could not reach the chamber. Please try again.";
      setStatus("error");
      setErrorMessage(message);
      toast.error(message, { style: toastStyle });
    }
  };

  return (
    <section
      id="contact"
      data-contact-section
      className="relative overflow-clip border-b border-bone/10 bg-[#080604] py-24 sm:py-32"
    >
      <ContactWorld />
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="relative z-10 mx-auto w-full max-w-[1250px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-14 xl:gap-16">
          {/* -------------------------------------------------------------
              Left: the summons and the communication records.
          -------------------------------------------------------------- */}
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeading
                index="06"
                label="Contact"
                title="Every great mission begins with a message."
                description="Building an application, adding AI to an existing product, or untangling an integration? Send a transmission — I'll read it personally."
              />
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-10 border-t border-gold/20">
                <p className="flex items-center gap-3 py-4 font-mono text-[8px] uppercase tracking-[0.3em] text-gold/70">
                  <span
                    aria-hidden="true"
                    className="h-1 w-1 rotate-45 bg-gold/70"
                  />
                  Communication records
                </p>

                <ul className="border-t border-bone/10">
                  {RECORDS.map((record, index) => {
                    const Icon = record.icon;
                    const body = (
                      <span className="flex items-center gap-4">
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center border border-gold/25 bg-void/40 text-gold/80"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono text-[8px] uppercase tracking-[0.24em] text-ash/50">
                            {record.label}
                          </span>
                          <span className="mt-1 block truncate text-sm text-bone transition-colors group-hover:text-gold-soft sm:text-[15px]">
                            {record.value}
                          </span>
                        </span>
                      </span>
                    );

                    return (
                      <li key={record.id} className="border-b border-bone/10">
                        {record.href ? (
                          <a
                            href={record.href}
                            className="group flex items-center justify-between gap-4 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60"
                          >
                            {body}
                            <ArrowUpRight
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0 text-ash/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                            />
                          </a>
                        ) : (
                          <div className="flex items-center justify-between gap-4 py-4">
                            {body}
                            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-ash/30">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href={profile.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 border border-bone/10 bg-void/35 px-4 py-3.5 transition-colors hover:border-gold/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60"
                >
                  <FaGithub
                    aria-hidden="true"
                    className="h-4 w-4 text-gold/75"
                  />
                  <span className="flex flex-col">
                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-ash/50">
                      GitHub
                    </span>
                    <span className="mt-0.5 text-xs text-bone group-hover:text-gold-soft">
                      PhenomDeekey27
                    </span>
                  </span>
                </a>
                <a
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 border border-bone/10 bg-void/35 px-4 py-3.5 transition-colors hover:border-gold/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60"
                >
                  <FaLinkedinIn
                    aria-hidden="true"
                    className="h-4 w-4 text-gold/75"
                  />
                  <span className="flex flex-col">
                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-ash/50">
                      LinkedIn
                    </span>
                    <span className="mt-0.5 text-xs text-bone group-hover:text-gold-soft">
                      Kasthuri Rangan
                    </span>
                  </span>
                </a>
              </div>
            </Reveal>
          </div>

          {/* -------------------------------------------------------------
              Right: the parchment transmission scroll.
          -------------------------------------------------------------- */}
          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <div className="tx-scroll">
                <span aria-hidden="true" className="tx-roller tx-roller-top" />

                <div className="tx-sheet">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#8a6b3c]">
                        Transmission form · 06-B
                      </p>
                      <h3
                        id="contact-form-title"
                        className="mt-3 font-display text-3xl font-light leading-tight text-[#241b12] sm:text-[2.15rem]"
                      >
                        Send a transmission
                      </h3>
                    </div>
                    <span className="tx-leaf" aria-hidden="true">
                      <HiddenLeafSeal
                        className="h-full w-full"
                        strokeWidth={3.2}
                      />
                    </span>
                  </div>

                  <div
                    aria-hidden="true"
                    className="mt-5 h-px w-full bg-gradient-to-r from-[#8a6b3c]/45 via-[#8a6b3c]/25 to-transparent"
                  />

                  {status === "sent" ? (
                    <div
                      className="mt-8 flex flex-col items-start gap-5 pb-2"
                      role="status"
                      aria-live="polite"
                    >
                      <span className="tx-stamp" aria-hidden="true">
                        <HiddenLeafSeal
                          className="h-full w-full"
                          strokeWidth={2.6}
                        />
                      </span>
                      <div>
                        <p className="font-display text-2xl font-light text-[#241b12]">
                          Transmission sealed.
                        </p>
                        <p className="mt-2 max-w-md text-sm leading-7 text-[#4a3a26]">
                          Your message reached me. I read every transmission
                          myself and will reply to the address you left.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStatus("idle")}
                        className="cursor-pointer border border-[#8a6b3c]/60 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#4a3a26] transition-colors hover:border-[#8a6b3c] hover:bg-[#e3d3ae] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a6b3c]"
                      >
                        Seal another transmission
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={onSubmit}
                      aria-labelledby="contact-form-title"
                      className="mt-7 space-y-6"
                      noValidate={false}
                    >
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="name"
                            className="mb-1.5 block font-mono text-[8px] uppercase tracking-[0.24em] text-[#6b5636]"
                          >
                            Name of sender
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            autoComplete="name"
                            placeholder="How should I address you?"
                            className="tx-field"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="Email"
                            className="mb-1.5 block font-mono text-[8px] uppercase tracking-[0.24em] text-[#6b5636]"
                          >
                            Return address
                          </label>
                          <input
                            type="email"
                            name="Email"
                            id="Email"
                            required
                            autoComplete="email"
                            placeholder="you@company.com"
                            aria-describedby={
                              status === "error" ? "transmission-error" : undefined
                            }
                            className="tx-field"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="contact-number"
                          className="mb-1.5 block font-mono text-[8px] uppercase tracking-[0.24em] text-[#6b5636]"
                        >
                          Contact number
                        </label>
                        <input
                          type="tel"
                          name="contact"
                          id="contact-number"
                          required
                          autoComplete="tel"
                          placeholder="+91"
                          className="tx-field"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="mb-1.5 block font-mono text-[8px] uppercase tracking-[0.24em] text-[#6b5636]"
                        >
                          Message
                        </label>
                        <textarea
                          name="message"
                          id="message"
                          required
                          rows={6}
                          placeholder="What are you building, and what does it need?"
                          className="tx-field tx-field-area"
                        />
                      </div>

                      {status === "error" ? (
                        <p
                          id="transmission-error"
                          role="alert"
                          className="border-l-2 border-[#7a2c20] bg-[#7a2c20]/8 px-3 py-2 text-[13px] leading-6 text-[#5d2018]"
                        >
                          {errorMessage}
                        </p>
                      ) : null}

                      <div className="flex flex-col gap-5 border-t border-[#8a6b3c]/30 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-[15rem] text-[10px] leading-5 text-[#6b5636]">
                          Your details are used only to reply to this message.
                        </p>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="tx-send group"
                        >
                          <span className="tx-send-mark" aria-hidden="true">
                            <HiddenLeafSeal
                              className="h-full w-full"
                              strokeWidth={3.6}
                            />
                          </span>
                          {isSubmitting ? (
                            <>
                              <span
                                aria-hidden="true"
                                className="h-3.5 w-3.5 animate-spin rounded-full border border-[#241b12]/40 border-t-[#241b12]"
                              />
                              Sealing
                            </>
                          ) : (
                            <>
                              <Send
                                aria-hidden="true"
                                className="h-3.5 w-3.5"
                              />
                              Seal and send
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <span
                  aria-hidden="true"
                  className="tx-roller tx-roller-bottom"
                />
              </div>
            </Reveal>
          </div>
        </div>

        {/* ---------------------------------------------------------------
            End of transmission.
        ---------------------------------------------------------------- */}
        <Reveal delay={160}>
          <div className="mt-16 flex flex-col items-center gap-4 sm:mt-20">
            <span
              aria-hidden="true"
              className="flex items-center gap-3 font-mono text-[8px] uppercase tracking-[0.34em] text-gold/45"
            >
              <span className="h-px w-8 bg-gold/25 sm:w-12" />
              End of transmission
              <span className="h-px w-8 bg-gold/25 sm:w-12" />
            </span>
            <HiddenLeafSeal
              className="h-7 w-7 text-gold/30"
              aria-hidden="true"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
