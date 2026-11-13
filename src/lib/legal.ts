/**
 * Shown on the privacy and delete-account pages. Fixed for now; Vercel env vars
 * (NEXT_PUBLIC_CONTACT_EMAIL / NEXT_PUBLIC_COMPANY_NAME) override them if set later.
 */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'pankajbawliya77@gmail.com';
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'TowerBites';
export const POLICY_DATE = '13 November 2026';
