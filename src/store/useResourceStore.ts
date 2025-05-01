// src/store/useResourceStore.ts
import { create } from 'zustand';
import dsaData from '@/data/dsa.json';

// Define types for our data structure
export interface Question {
  question_no: number;
  question_name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question_link: string;
  subtopics: string[];
}

export type CompanyQuestions = [string, Question[]];

interface ResourceState {
  resources: Record<string, Question[]>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  sortBy: 'difficulty' | 'question_no' | 'easy' | 'medium' | 'hard' | null;
  setSortBy: (sort: 'difficulty' | 'question_no' | 'easy' | 'medium' | 'hard' | null) => void;

  selectedSubtopics: string[];
  setSelectedSubtopics: (subtopics: string[]) => void;
}

export const useResourceStore = create<ResourceState>((set) => ({
  resources: dsaData,
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  sortBy: null,
  setSortBy: (sort) => set({ sortBy: sort }),

  selectedSubtopics: [],
  setSelectedSubtopics: (subtopics) => set({ selectedSubtopics: subtopics }),
}));

// Custom hook to get filtered, difficulty-filtered and sorted resources
export const useFilteredResources = (): CompanyQuestions[] => {
  const {
    resources,
    searchQuery,
    sortBy,
    selectedSubtopics,
  } = useResourceStore();

  let entries = Object.entries(resources) as CompanyQuestions[];

  // 1) Filter by company‐ or question‐name search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    entries = entries
      .map(([company, qs]) => [
        company,
        qs.filter(
          (x) =>
            company.toLowerCase().includes(q) ||
            x.question_name.toLowerCase().includes(q)
        ),
      ] as CompanyQuestions)
      .filter(([, qs]) => qs.length > 0);
  }

  // 2) Filter by subtopics
  if (selectedSubtopics.length > 0) {
    entries = entries
      .map(([company, qs]) => [
        company,
        qs.filter((x) =>
          selectedSubtopics.some((t) => x.subtopics.includes(t))
        ),
      ] as CompanyQuestions)
      .filter(([, qs]) => qs.length > 0);
  }

  // 3) Filter by difficulty if specific difficulty is selected
  if (sortBy === 'easy' || sortBy === 'medium' || sortBy === 'hard') {
    entries = entries
      .map(([company, qs]) => [
        company,
        qs.filter((x) => x.difficulty === sortBy.charAt(0).toUpperCase() + sortBy.slice(1)),
      ] as CompanyQuestions)
      .filter(([, qs]) => qs.length > 0);
  }

  // 4) Sort
  if (sortBy === 'difficulty' || sortBy === 'question_no') {
    entries = entries.map(([company, qs]) => {
      const sorted = [...qs].sort((a, b) => {
        if (sortBy === 'difficulty') {
          const order = { Easy: 0, Medium: 1, Hard: 2 };
          return order[a.difficulty] - order[b.difficulty];
        }
        return a.question_no - b.question_no;
      });
      return [company, sorted] as CompanyQuestions;
    });
  }

  return entries;
};

// Get all unique subtopics
export const useAllSubtopics = (): string[] => {
  const { resources } = useResourceStore();
  const s = new Set<string>();
  Object.values(resources).flat().forEach((q) =>
    q.subtopics.forEach((t) => s.add(t))
  );
  return Array.from(s).sort();
};
