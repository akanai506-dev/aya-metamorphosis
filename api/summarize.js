import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { logs } = req.body;
  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    return res.status(400).json({ error: 'No logs provided' });
  }

  const logText = logs.map(l => `${l.date}: ${l.text}`).join('\n');

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `あなたは学習サポートAIです。以下はユーザーの学習ログです。これを読んで、学んだことを箇条書きで要約してください。

ルール：
- 日本語で回答
- 箇条書き（各項目は「・」で始める）
- 要点を簡潔にまとめる（各項目1〜2文）
- 最後に1行、ポジティブな励ましのコメントを添える

学習ログ：
${logText}`,
        },
      ],
    });

    const summary = message.content[0].text;
    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Anthropic API error:', error);
    return res.status(500).json({ error: 'AI要約の生成に失敗しました' });
  }
}
