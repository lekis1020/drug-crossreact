import type { DrugClass } from '../types';

export const R1_GROUP_COLORS: Record<string, string> = {
  G1: '#FF6B6B',
  G2: '#FF8E53',
  G3: '#4ECDC4',
  G4: '#45B7D1',
  G5: '#96CEB4',
  G6: '#FFEAA7',
  G7: '#DDA0DD',
  G8: '#98D8C8',
  G9: '#F7DC6F',
  G10: '#BB8FCE',
  G11: '#82E0AA',
  G12: '#F1948A',
  G13: '#85C1E9',
  G14: '#F0B27A',
  G15: '#A3E4D7',
};

export const DRUG_CLASS_COLORS: Record<DrugClass, string> = {
  quinolone: '#A855F7',
  glycopeptide: '#EC4899',
  sulfonamide: '#F59E0B',
  penicillin: '#FF6B6B',
  cephalosporin: '#4ECDC4',
  carbapenem: '#A3E4D7',
  monobactam: '#45B7D1',
};

export const CLASS_LABELS: Record<DrugClass, string> = {
  penicillin: 'Penicillin',
  cephalosporin: 'Cephalosporin',
  carbapenem: 'Carbapenem',
  monobactam: 'Monobactam',
  quinolone: 'Fluoroquinolone',
  glycopeptide: 'Glycopeptide',
  sulfonamide: 'Sulfonamide',
};

export function getDrugColor(r1Group?: string, drugClass?: DrugClass): string {
  if (r1Group && R1_GROUP_COLORS[r1Group]) return R1_GROUP_COLORS[r1Group];
  if (drugClass) return DRUG_CLASS_COLORS[drugClass];
  return '#888888';
}
