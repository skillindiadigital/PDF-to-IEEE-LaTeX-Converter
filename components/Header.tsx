import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
        PDF to <span className="text-indigo-600">IEEE LaTeX</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Extract abstracts from your PDF files and convert them instantly into clean, compilation-ready IEEE single-column LaTeX code.
      </p>
    </header>
  );
};

export default Header;