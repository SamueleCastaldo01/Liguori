import { useState } from 'react';

export default function usePrintFormat() {
  const [format, setFormat] = useState(() => localStorage.getItem('printPaperFormat') === 'A5' ? 'A5' : 'A4');
  const changeFormat = (value) => {
    const paper = value === 'A5' ? 'A5' : 'A4';
    localStorage.setItem('printPaperFormat', paper);
    setFormat(paper);
  };
  return [format, changeFormat];
}
