import type { ReactNode } from 'react';

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-sage-50 text-sage-900 font-sans flex flex-col">
      <header className="border-b border-sage-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="px-8 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-sage-900">
            Battle Pass Simulator
          </h1>
          <a
            href="https://www.linkedin.com/in/mmhchan/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-sage-400 hover:text-sage-600 transition-colors"
          >
            <LinkedInIcon />
            Michael Chan
          </a>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};
