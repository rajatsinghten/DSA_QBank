declare module '@/data/dsa.json' {
  import { Question } from '@/store/useResourceStore';
 
  const data: Record<string, Question[]>;
  export default data;
} 