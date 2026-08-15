'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Linkedin, Instagram, ArrowRight } from 'lucide-react';
import { useSystemConfig } from '../providers/SystemConfigProvider';

const footerLinks = {
  Programs: [
    { label: "Full Stack Dev", href: "/courses" },
    { label: "Data Science & AI", href: "/courses" },
    { label: "Artificial Intelligence", href: "/courses" },
    { label: "UI/UX Design", href: "/courses" },
    { label: "Business Analytics", href: "/courses" },
    { label: "Financial Modeling", href: "/courses" },
  ],
  Internships: [
    { label: "Frontend Developer", href: "https://www.emberquest.in/internships/frontend-developer-intern" },
    { label: "Backend Developer", href: "https://www.emberquest.in/internships/backend-developer-intern" },
    { label: "Data Analyst", href: "https://www.emberquest.in/internships/data-analyst-intern" },
    { label: "UI/UX Design", href: "https://www.emberquest.in/internships/ui-ux-design-intern" },
    { label: "Digital Marketing", href: "https://www.emberquest.in/internships/digital-marketing-intern" },
    { label: "Content Writing", href: "https://www.emberquest.in/internships/content-writing-intern" },
  ],
  Company: [
    { label: "About EmberQuest", href: "https://www.emberquest.in/about" },
    { label: "Placement Assistance", href: "https://www.emberquest.in/placement" },
    { label: "Gallery", href: "https://www.emberquest.in/gallery" },
    { label: "Contact Us", href: "https://www.emberquest.in/contact" },
    { label: "Careers", href: "https://www.emberquest.in/contact" },
    { label: "Blog", href: "https://www.emberquest.in", badge: "Coming Soon" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "https://www.emberquest.in/privacy-policy" },
    { label: "Terms of Use", href: "https://www.emberquest.in/terms-of-service" },
    { label: "Refund Policy", href: "https://www.emberquest.in/refund-policy" },
    { label: "Instructor Agreement", href: "https://www.emberquest.in/instructor-agreement" },
    { label: "Internship Policy", href: "https://www.emberquest.in/internship-policy" },
    { label: "Acceptable Use Policy", href: "https://www.emberquest.in/acceptable-use-policy" },
    { label: "Grievance Policy", href: "https://www.emberquest.in/grievance-policy" },
  ],
};

const socialLinks = [
  { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/emberquest/", color: "#0077b5" },
  { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/emberquest1/", color: "#e1306c" },
];

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const { config } = useSystemConfig();

  if (pathname?.startsWith('/embed') || pathname?.startsWith('/programs')) return null;

  return (
    <footer className="mt-auto bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
      
      {/* ─── Newsletter CTA Strip ─── */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-xl md:text-2xl text-slate-900 dark:text-slate-50 mb-1">
                Get career tips & early access
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                Join 5,000+ students who get our weekly insights straight to their inbox.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all shadow-sm"
              />
              <a href="https://www.emberquest.in/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all flex-shrink-0">
                Subscribe <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Footer Grid ─── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 pr-6">
            <div className="flex items-center gap-3 group w-fit mb-6">
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.svg" alt="EmberQuest" className="h-10 w-auto object-contain dark:invert dark:brightness-200" />
              </Link>
              <div className="flex flex-col items-start leading-none">
                <a href="https://www.skilvi.in" className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">EmberQuest</a>
                <a href="https://www.skilvi.in" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5 hover:text-blue-600 transition-colors">POWERED BY SKILVI</a>
              </div>
            </div>

            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
              India's most results-obsessed software career platform. Real skills. Internships.
              Dedicated placement support.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              {[
                { Icon: Mail, text: config.supportEmail || "support@emberquest.in", href: `mailto:${config.supportEmail}` },
                { Icon: Phone, text: config.contactPhone || "+91 97317 55053", href: `tel:${config.contactPhone}` },
                { Icon: MapPin, text: "Bangalore, India", href: "/contact" },
              ].map(({ Icon, text, href }) => (
                <a
                  key={text}
                  href={href}
                  className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors shadow-sm">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {text}
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm uppercase tracking-wider mb-5">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {(link as any).badge ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-400 cursor-default">
                          {link.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-wider">
                          {(link as any).badge}
                        </span>
                      </div>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors duration-150 flex items-center gap-1 group"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <p className="text-sm">
                © {currentYear} Skilvi Technologies Pvt. Ltd. All rights reserved.
              </p>
              <p className="text-[11px] font-medium text-slate-400 text-center sm:text-left tracking-wide">
                Website Managed by <a href="https://www.skilvi.in" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">skilvi</a>
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
               <a href="https://www.emberquest.in/privacy-policy" className="hover:text-blue-600 transition">Privacy</a>
               <span>•</span>
               <a href="https://www.emberquest.in/terms-of-service" className="hover:text-blue-600 transition">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
