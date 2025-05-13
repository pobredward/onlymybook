'use client';

// 2개 챕터 미리보기 생성
export async function generatePreview(answers: { [key: string]: string }): Promise<string> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'preview',
        answers,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '미리보기 생성 중 오류가 발생했습니다.');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error generating preview:", error);
    return "자서전 생성 중 오류가 발생했습니다.";
  }
}

// 전체 자서전 생성
export async function generateFullMemoir(answers: { [key: string]: string }): Promise<string> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'full',
        answers,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '자서전 생성 중 오류가 발생했습니다.');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error generating full memoir:", error);
    return "자서전 생성 중 오류가 발생했습니다.";
  }
} 