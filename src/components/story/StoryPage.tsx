import React, { useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react';
import { createEditor, Descendant } from 'slate';

interface StoryPageProps {
  sectionId: string;
  title: string;
  content: string | Descendant[];
  backgroundColor?: string;
  textColor?: string;
  illustration?: string;
  isHighlight?: boolean;
  index: number;
}

// Slate 커스텀 타입 선언
type CustomElement = {
  type: string;
  url?: string;
  [key: string]: unknown;
};
type CustomText = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  text: string;
  [key: string]: unknown;
};

export const StoryPage: React.FC<StoryPageProps> = ({
  sectionId,
  title,
  content,
  backgroundColor = 'bg-amber-50',
  textColor = 'text-gray-800',
  illustration,
  isHighlight = false,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  // 단락을 분리합니다
  let paragraphs: string[] = [];
  let isRichText = false;
  let richContent: Descendant[] = [];
  if (typeof content === 'string') {
    paragraphs = content.split('\n\n');
  } else if (Array.isArray(content)) {
    isRichText = true;
    richContent = content as Descendant[];
  }

  // Slate editor 인스턴스
  const editor = React.useMemo(() => withReact(createEditor()), []);

  // 커스텀 element 렌더러 (paragraph, heading, list, link 등)
  const renderElement = React.useCallback((props: RenderElementProps) => {
    const { element, children, attributes } = props;
    const el = element as unknown as CustomElement;
    switch (el.type) {
      case 'heading':
        return <h2 {...attributes} className="text-2xl font-bold mb-4">{children}</h2>;
      case 'bulleted-list':
        return <ul {...attributes} className="list-disc ml-6 mb-2">{children}</ul>;
      case 'numbered-list':
        return <ol {...attributes} className="list-decimal ml-6 mb-2">{children}</ol>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'link':
        return <a {...attributes} href={el.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{children}</a>;
      default:
        return <p {...attributes} className="mb-4">{children}</p>;
    }
  }, []);

  // 커스텀 leaf 렌더러 (bold, italic 등)
  const renderLeaf = React.useCallback((props: RenderLeafProps) => {
    const { leaf, children, attributes } = props;
    const lf = leaf as unknown as CustomText;
    let el = children;
    if (lf.bold) {
      el = <strong>{el}</strong>;
    }
    if (lf.italic) {
      el = <em>{el}</em>;
    }
    if (lf.underline) {
      el = <u>{el}</u>;
    }
    if (lf.code) {
      el = <code className="bg-gray-100 px-1 rounded text-sm">{el}</code>;
    }
    return <span {...attributes}>{el}</span>;
  }, []);

  return (
    <motion.div
      id={sectionId}
      ref={ref}
      className={`
        relative min-h-[100vh] flex flex-col items-center justify-center py-16 px-6 md:px-12
        ${backgroundColor} ${textColor} 
        transition-colors duration-1000 ease-in-out
      `}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
      }}
    >
      {/* 페이지 질감 효과 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `url(/images/paper-texture.png)`,
          backgroundSize: 'cover',
          mixBlendMode: 'multiply'
        }}
      />

      {/* 그림자 효과 */}
      <div className="absolute inset-0 shadow-inner pointer-events-none" />

      <div className="w-full max-w-3xl mx-auto relative z-10">
        {/* 일러스트레이션 (있는 경우) */}
        {illustration && (
          <div className="flex justify-center mb-8">
            <img 
              src={illustration} 
              alt="Chapter illustration" 
              className="max-h-40 object-contain"
            />
          </div>
        )}

        {/* 제목 */}
        {title && (
          <motion.h2
            className={`text-3xl md:text-4xl font-serif font-bold mb-8 text-center 
              ${isHighlight ? 'text-indigo-800' : ''}`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } },
            }}
          >
            {title}
          </motion.h2>
        )}

        {/* 내용 */}
        <div className="space-y-6">
          {isRichText ? (
            <Slate editor={editor} initialValue={richContent} onChange={() => {}}>
              <Editable
                readOnly
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                className="leading-relaxed text-lg font-serif bg-transparent border-none shadow-none outline-none"
              />
            </Slate>
          ) : (
            paragraphs.map((paragraph, idx) => (
              <motion.p
                key={idx}
                className="leading-relaxed text-lg font-serif"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { 
                      duration: 0.5, 
                      delay: 0.2 + (idx * 0.1) 
                    } 
                  },
                }}
              >
                {isHighlight && idx === 0 ? (
                  <span className="font-semibold text-xl text-indigo-900">{paragraph}</span>
                ) : (
                  paragraph
                )}
              </motion.p>
            ))
          )}
        </div>

        {/* 페이지 번호 */}
        <div className="mt-12 text-center text-sm opacity-60">
          {index + 1}
        </div>
      </div>
    </motion.div>
  );
}; 