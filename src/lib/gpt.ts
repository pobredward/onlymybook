import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 기본 스타일 프롬프트
const baseStylePrompt = `
당신은 고품질 자서전 작가입니다. 사용자의 답변을 바탕으로 아름답고 감성적인 자서전 형식의 글을 작성해주세요.
글의 스타일은 따뜻하고, 개인적이며, 감성적이어야 합니다.
각 문단은 유기적으로 연결되어야 하며, 사용자의 삶을 풍부하게 표현해야 합니다.
한국어로 작성하며, 문학적이고 서정적인 표현을 사용하세요.
`;

// 2개 챕터 미리보기 생성
export async function generatePreview(answers: { [key: string]: string }): Promise<string> {
  const userPrompt = Object.entries(answers)
    .map(([question, answer]) => `질문: ${question}\n답변: ${answer}`)
    .join('\n\n');

  const prompt = `
${baseStylePrompt}

다음 질문에 대한 사용자 답변을 바탕으로 2개의 챕터로 구성된 자서전 미리보기를 작성해주세요.
각 챕터는 제목과 내용으로 구성되며, 챕터 간에 자연스러운 흐름이 있어야 합니다.
사용자가 공유한 기억과 경험을 확장하고 풍부하게 표현해주세요.

${userPrompt}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: baseStylePrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0]?.message.content || "자서전 생성 중 오류가 발생했습니다.";
  } catch (error) {
    console.error("Error generating preview:", error);
    return "자서전 생성 중 오류가 발생했습니다.";
  }
}

// 전체 자서전 생성
export async function generateFullMemoir(answers: { [key: string]: string }): Promise<string> {
  const userPrompt = Object.entries(answers)
    .map(([question, answer]) => `질문: ${question}\n답변: ${answer}`)
    .join('\n\n');

  const prompt = `
${baseStylePrompt}

다음 질문에 대한 사용자 답변을 바탕으로 완전한 자서전을 작성해주세요.
자서전은 총 10개의 챕터로 구성되며, 각 챕터는 사용자의 인생 이야기의 다른 측면을 다루어야 합니다.
각 챕터는 제목과 내용으로 구성되며, 전체적으로 사용자의 삶을 아름답게 묘사해야 합니다.
사용자가 공유한 기억과 경험을 확장하고 풍부하게 표현해주세요.

${userPrompt}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: baseStylePrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return response.choices[0]?.message.content || "자서전 생성 중 오류가 발생했습니다.";
  } catch (error) {
    console.error("Error generating full memoir:", error);
    return "자서전 생성 중 오류가 발생했습니다.";
  }
} 