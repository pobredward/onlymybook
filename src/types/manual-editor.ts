export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface DraggableItem {
  id: string;
  index: number;
} 