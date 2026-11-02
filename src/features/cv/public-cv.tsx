import { useContext } from 'react';
import { usePortfolioLanguage } from '../../i18n/portfolio-language-context';
import { PublicCvContext } from './public-cv-context';
export function PublicCv({ className = '' }: { className?: string }) {
  const { language } = usePortfolioLanguage();
  const cv = useContext(PublicCvContext);
  return cv ? <a className={`button cv-public-link ${className}`} href="/api/cv?download=1">{language === 'vi' ? 'Tải CV · PDF' : 'Download CV · PDF'} <span aria-hidden="true">↓</span></a> : null;
}
