import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';

export type Language = 'en' | 'hi' | 'mr';

export type TranslationSchema = typeof en;

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' }
];

export const translations: Record<Language, TranslationSchema> = {
  en,
  hi,
  mr
};
