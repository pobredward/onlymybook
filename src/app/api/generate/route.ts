import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 기본 스타일 프롬프트
const baseStylePrompt = `
당신은 전문적인 자서전 작가입니다. 사용자의 답변을 바탕으로 풍부하고 감성적인 자서전을 작성해주세요.

작성 스타일 가이드:
1. 따뜻하고 서정적인 문체로 작성하되, 감정의 깊이와 복잡성을 담아냅니다.
2. 각 문단은 유기적으로 연결되어 자연스러운 흐름을 만들어야 합니다.
3. 사용자의 경험을 단순히 나열하지 말고, 그 경험이 가진 의미와 감정을 풍부하게 표현하세요.
4. 다양한 감정(기쁨, 슬픔, 그리움, 설렘, 평화로움, 도전 정신)을 적절히 표현하세요.
5. 독자가 그 순간을 함께 경험하는 듯한 생생한 묘사를 포함하세요.

자서전 구조:
- 챕터 제목은 반드시 "# 1장: 제목" 형식으로 작성하세요.
- 각 챕터 내 섹션은 "## 섹션 제목" 형식으로 작성하세요.
- 각 챕터는 사용자 삶의 다른 측면이나 시기를 다루되, 전체적으로 하나의 여정으로 연결되어야 합니다.
`;

// 프롬프트 생성 함수 추가
function buildMemoirPrompt({ answers, type }: { answers: { [key: string]: string }, type: 'preview' | 'full' }) {
  const userPrompt = Object.entries(answers)
    .map(([question, answer]) => `질문: ${question}\n답변: ${answer}`)
    .join('\n\n');

  // 작가 이름과 마무리 멘트 추출 (없으면 기본값)
  const author = answers['작가 이름'] || '이름 미상';
  const closing = answers['마무리 멘트'] || '당신의 이야기를 함께할 수 있어 영광이었습니다.';

  // 공통 스타일 가이드
  const styleGuide = `
작성 스타일 가이드:
1. 따뜻하고 서정적이면서도 현대적인 문체로 작성하되, 감정의 깊이와 복잡성을 담아냅니다.
2. 각 문단은 유기적으로 연결되어 자연스러운 흐름을 만들어야 합니다.
3. 사용자의 경험을 단순히 나열하지 말고, 그 경험이 가진 의미와 감정을 풍부하게 표현하세요.
4. 다양한 감정(기쁨, 슬픔, 그리움, 설렘, 평화로움, 도전 정신 등)을 적절히 표현하세요.
5. 독자가 그 순간을 함께 경험하는 듯한 생생한 묘사를 포함하세요.
6. 글 속 핵심 문장은 강조되어 독자에게 인상적으로 남을 수 있도록 작성합니다.
7. 웹 뷰에서 자연스러운 흐름을 위해 텍스트의 리듬과 호흡을 고려하세요.
`;

  // 공통 구조 가이드
  const structureGuide = `
자서전 구조:
- 챕터는 1개만 작성하며, "# 1장: 제목" 형식으로 시작합니다.
- 챕터 내에는 5~6개의 소제목(섹션)을 "## 섹션 제목" 형식으로 작성합니다.
- 각 섹션에는 감정적으로 중요한 순간이나 인상적인 경험을 섬세하게 표현하세요.
- 마지막에는 반드시 아래 형식으로 마무리하세요:\n\n---\n글쓴이: ${author}\n${closing}
`;

  // 타입별 추가 요구사항
  let typeGuide = '';
  if (type === 'preview') {
    typeGuide = `\n요구사항:\n- 자서전 미리보기이므로 전체 분량은 1챕터, 5~6개 섹션, 400자 내외로 작성하세요.`;
  } else {
    typeGuide = `\n요구사항:\n- 자서전 전체 분량은 1챕터, 5~6개 섹션, 400자 내외로 작성하세요.`;
  }

  return `\n${styleGuide}\n${structureGuide}\n${typeGuide}\n\n사용자의 답변:\n${userPrompt}`;
}

export async function POST(request: Request) {
  try {
    const { type, answers } = await request.json();
    
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: '유효한 답변이 필요합니다' },
        { status: 400 }
      );
    }
    
    let content = '';
    
    if (type === 'preview') {
      content = await generatePreview(answers);
    } else if (type === 'full') {
      content = await generateFullMemoir(answers);
    } else {
      return NextResponse.json(
        { error: '유효한 생성 타입이 필요합니다' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: '자서전 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 2개 챕터 미리보기 생성
async function generatePreview(answers: { [key: string]: string }): Promise<string> {
  const prompt = buildMemoirPrompt({ answers, type: 'preview' });
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: baseStylePrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });
    return response.choices[0]?.message.content || "자서전 생성 중 오류가 발생했습니다.";
  } catch (error) {
    console.error("Error generating preview:", error);
    throw new Error("자서전 생성 중 오류가 발생했습니다.");
  }
}

// 전체 자서전 생성
async function generateFullMemoir(answers: { [key: string]: string }): Promise<string> {
  const prompt = buildMemoirPrompt({ answers, type: 'full' });
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: baseStylePrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });
    return response.choices[0]?.message.content || "자서전 생성 중 오류가 발생했습니다.";
  } catch (error) {
    console.error("Error generating full memoir:", error);
    throw new Error("자서전 생성 중 오류가 발생했습니다.");
  }
} 