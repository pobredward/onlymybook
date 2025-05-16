import { Descendant } from 'slate';

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  content: Descendant[]; // Plate(RichText) JSON 구조
}

export interface DraggableItem {
  id: string;
  index: number;
} 