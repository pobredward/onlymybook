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

// 프롬프트 생성 함수 리뉴얼 (사실 기반 강조)
function buildMemoirPrompt({ answers, type }: { answers: { [key: string]: string }, type: 'preview' | 'full' }) {
  const userPrompt = Object.entries(answers)
    .map(([question, answer]) => `질문: ${question}\n답변: ${answer}`)
    .join('\n\n');

  // 작가 이름과 마무리 멘트 추출 (없으면 기본값)
  const author = answers['작가 이름'] || answers['authorName'] || '이름 미상';
  const closing = answers['마무리 멘트'] || answers['endingMessage'] || '당신의 이야기를 함께할 수 있어 영광이었습니다.';

  // 스타일 가이드 (사실 기반 강조)
  const styleGuide = `
당신은 대한민국 최고의 자서전 작가입니다. 반드시 사용자가 입력한 실제 경험, 사실, 정보만 바탕으로 자서전을 작성해야 합니다. 허구, 과장, 시적 상상력, 추상적 은유, 꾸며낸 이야기는 절대 넣지 마세요.

[스타일 가이드]
- 따뜻하고 서정적이면서도 현대적인 문체로 작성하되, 반드시 사실에 기반해야 합니다.
- 사용자의 경험, 키워드, 단편적 답변을 실제 있었던 일처럼 구체적이고 사실적으로 풀어서 서술하세요.
- 각 문단은 유기적으로 연결되어 자연스러운 흐름을 만들어야 합니다.
- 단순 나열이 아니라, 경험의 의미와 감정을 깊이 있게 표현하되, 반드시 실제 답변에서만 확장하세요.
- 다양한 감정(기쁨, 슬픔, 그리움, 설렘, 평화로움, 도전 등)을 적절히 녹이되, 허구적 상상력은 금지합니다.
- 독자가 그 순간을 함께 경험하는 듯한 생생한 묘사를 하되, 반드시 사실에 기반해야 합니다.
- 핵심 문장은 강조되어 인상적으로 남아야 하지만, 반드시 실제 경험에서만 도출하세요.
- 누구나 읽고 "와, 이렇게 멋진 자서전이 나온다고? 남들에게 공유하고 싶다!"라는 감탄이 나오게 하되, 모든 내용은 사실에 기반해야 합니다.
`;

  // 구조 가이드
  const structureGuide = `
[자서전 구조]
- 1장(챕터)만 작성합니다. 반드시 "# 1장: (멋진 제목)"으로 시작하세요.
- 1장 안에 2~3개의 소챕터(섹션)를 "## (섹션 제목)" 형식으로 작성하세요.
- 각 섹션은 감정적으로 중요한 순간, 인상적인 경험, 인생의 전환점, 성장, 깨달음 등을 섬세하게 풀어주세요. 단, 반드시 사용자의 실제 답변/경험에서만 확장하세요.
- 각 섹션은 서로 자연스럽게 이어지며, 전체가 하나의 여정처럼 느껴져야 합니다.
- 마지막에는 반드시 아래 형식으로 마무리하세요:
---\n글쓴이: ${author}\n${closing}
`;

  // 요구사항
  let typeGuide = '';
  if (type === 'preview') {
    typeGuide = `\n[요구사항]\n- 전체 분량은 1장, 2~3개 섹션, 400자 내외로 작성하세요.\n- 반드시 사용자의 실제 답변, 경험, 정보만 바탕으로 풍부하게 풀어서 작성하세요. 허구, 과장, 시적 상상력, 꾸며낸 이야기는 절대 넣지 마세요.`;
  } else {
    typeGuide = `\n[요구사항]\n- 전체 분량은 1장, 2~3개 섹션, 400자 내외로 작성하세요.\n- 반드시 사용자의 실제 답변, 경험, 정보만 바탕으로 풍부하게 풀어서 작성하세요. 허구, 과장, 시적 상상력, 꾸며낸 이야기는 절대 넣지 마세요.`;
  }

  return `\n${styleGuide}\n${structureGuide}\n${typeGuide}\n\n[사용자 입력]\n${userPrompt}`;
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
      max_tokens: 600,
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
      max_tokens: 600,
    });
    return response.choices[0]?.message.content || "자서전 생성 중 오류가 발생했습니다.";
  } catch (error) {
    console.error("Error generating full memoir:", error);
    throw new Error("자서전 생성 중 오류가 발생했습니다.");
  }
} 