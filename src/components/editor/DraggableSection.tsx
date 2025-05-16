'use client';

import React, { useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GripVertical, Trash2 } from 'lucide-react';
import { Section, DraggableItem } from '@/types/manual-editor';
import { Descendant } from 'slate';
import { createSlateEditor } from '@udecode/plate-core';
import { Slate, Editable, withReact } from 'slate-react';

interface DraggableSectionProps {
  section: Section;
  chapterId: string;
  index: number;
  moveSection: (chapterId: string, fromIndex: number, toIndex: number) => void;
  handleSectionTitleChange: (chapterId: string, sectionId: string, title: string) => void;
  handleSectionContentChange: (chapterId: string, sectionId: string, content: Descendant[]) => void;
  handleDeleteSection: (chapterId: string, sectionId: string) => void;
}

export const DraggableSection: React.FC<DraggableSectionProps> = ({ 
  section, 
  chapterId, 
  index,
  moveSection,
  handleSectionTitleChange,
  handleSectionContentChange,
  handleDeleteSection
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const editor = useMemo(() => withReact(createSlateEditor()), []);
  
  // 드래그 설정
  const [{ isDragging }, drag] = useDrag({
    type: 'SECTION',
    item: { id: section.id, index } as DraggableItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // 드롭 설정
  const [, drop] = useDrop({
    accept: 'SECTION',
    hover(item: DraggableItem) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // 자기 자신 위에 드롭할 경우 무시
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // 섹션 위치 변경 호출
      moveSection(chapterId, dragIndex, hoverIndex);
      
      // 드래그 중인 아이템의 인덱스 업데이트
      item.index = hoverIndex;
    }
  });
  
  // drag와 drop 레퍼런스 연결
  drag(drop(ref));
  
  return (
    <div 
      ref={ref}
      className={`mb-6 last:mb-0 p-4 border rounded-md ${
        'border-gray-100'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="cursor-move text-gray-400 p-1 hover:text-gray-600">
            <GripVertical size={18} />
          </div>
          <Input
            value={section.title}
            onChange={(e) => handleSectionTitleChange(chapterId, section.id, e.target.value)}
            className="w-full max-w-md"
            placeholder="섹션 제목"
          />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteSection(chapterId, section.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      
      <Slate
        editor={editor as any}
        initialValue={section.content}
        onChange={value => handleSectionContentChange(chapterId, section.id, value as Descendant[])}
      >
        <Editable
          placeholder="섹션 내용을 입력하세요..."
          className="border rounded px-2 py-2 min-h-[80px] bg-white"
        />
      </Slate>
    </div>
  );
}; 