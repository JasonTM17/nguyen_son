import { createContext } from 'react';
import type { CvMetadata } from './cv-api';
export const PublicCvContext = createContext<CvMetadata | null>(null);
