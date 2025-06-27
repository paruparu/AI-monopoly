const express = require('express');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // API key is now loaded from .env
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// New endpoint for AI negotiation
app.post('/cpu-propose-message', async (req, res) => {
  const { cpu, player, offer, request, boardData } = req.body;

  try {
    const prompt = `あなたはモノポリーゲームのCPUプレイヤーです。人間プレイヤー（${player.name}）に交渉を提案します。以下の条件で提案する際のメッセージを生成してください。
あなたのプレイヤー名: ${cpu.name}
あなたの所持金: ¥${cpu.money.toLocaleString()}
あなたの所有物件: ${cpu.properties.map(pIdx => boardData[pIdx].name).join(', ') || 'なし'}

あなたが提案する内容:
- 提示物件: ${offer.properties.map(pIdx => boardData[pIdx].name).join(', ') || 'なし'}
- 提示現金: ¥${offer.money.toLocaleString()}

あなたが要求する内容:
- 要求物件: ${request.properties.map(pIdx => boardData[pIdx].name).join(', ') || 'なし'}
- 要求現金: ¥${request.money.toLocaleString()}

メッセージは簡潔に、かつ交渉の意図が伝わるようにしてください。
あなたのメッセージ:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const message = completion.choices[0].message.content;
    res.json({ message });

  } catch (error) {
    console.error('Error generating CPU proposal message:', error);
    res.status(500).json({ message: '交渉メッセージの生成中にエラーが発生しました。' });
  }
});

// New endpoint for CPU to CPU negotiation
app.post('/cpu-to-cpu-negotiate', async (req, res) => {
  const { offeringCpu, targetCpu, offer, request, boardData } = req.body;

  try {
    const prompt = `あなたはモノポリーゲームのCPUプレイヤーです。他のCPUプレイヤー（${offeringCpu.name}）から交渉提案を受けています。以下の提案について、あなたの立場（${targetCpu.name}）として返答してください。

あなたのプレイヤー名: ${targetCpu.name}
あなたの所持金: ¥${targetCpu.money.toLocaleString()}
あなたの所有物件: ${targetCpu.properties.map(pIdx => boardData[pIdx].name).join(', ') || 'なし'}

相手プレイヤー（${offeringCpu.name}）の提案:
- 提示物件: ${offer.properties.map(pIdx => boardData[pIdx].name).join(', ') || 'なし'}
- 提示現金: ¥${offer.money.toLocaleString()}

あなたが要求されているもの:
- 要求物件: ${request.properties.map(pIdx => boardData[pIdx].name).join(', ') || 'なし'}
- 要求現金: ¥${request.money.toLocaleString()}

あなたの返答は、以下のJSON形式でお願いします。
{
  "decision": "accept" | "reject",
  "response_text": "[返答メッセージ]"
}
- 'decision'は'accept'（受け入れる）または'reject'（拒否する）のいずれかです。
- 'response_text'は相手へのメッセージです。
- CPU同士の交渉では再提案は行いません。

あなたの返答:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const llmResponse = JSON.parse(completion.choices[0].message.content);
    res.json(llmResponse);

  } catch (error) {
    console.error('Error during CPU to CPU negotiation:', error);
    res.status(500).json({ decision: 'reject', response_text: '交渉中にエラーが発生しました。', error: error.message });
  }
});

app.post('/negotiate', async (req, res) => {
  const { player, partner, yourOffer, theirOffer, message, boardData } = req.body;

  try {
    const prompt = `あなたはモノポリーゲームのCPUプレイヤーです。以下の交渉提案について、相手プレイヤー（人間）に返答してください。\n\n現在の状況:\n- あなたのプレイヤー名: ${partner.name}\n- あなたの所持金: ¥${partner.money.toLocaleString()}\n- あなたの所有物件: ${partner.properties.map(pIdx => boardData[pIdx].name).join(', ') || 'なし'}\n\n相手プレイヤー（${player.name}）の提案:\n- 提示物件: ${yourOffer.properties.map(pIdx => boardData[pIdx].name).join(', ') || 'なし'}\n- 提示現金: ¥${yourOffer.money.toLocaleString()}\n\nあなたが要求されているもの:\n- 要求物件: ${theirOffer.properties.map(pIdx => boardData[pIdx].name).join(', ') || 'なし'}\n- 要求現金: ¥${theirOffer.money.toLocaleString()}\n\n相手からのメッセージ: "${message}"\n\nあなたの返答は、以下のJSON形式でお願いします。\n{\n  "decision": "accept" | "reject" | "counter",\n  "response_text": "[返答メッセージ]",\n  "counter_offer": {\n    "properties": [物件ID],\n    "money": [金額]\n  },\n  "counter_request": {\n    "properties": [物件ID],\n    "money": [金額]\n  }\n}\n\n- 'decision'は'accept'（受け入れる）、'reject'（拒否する）、'counter'（再提案する）のいずれかです。\n- 'response_text'は相手へのメッセージです。\n- 'counter'の場合のみ'counter_offer'と'counter_request'を含めてください。\n- 'counter_offer'はあなたが相手に提示する物件と現金、'counter_request'はあなたが相手に要求する物件と現金です。\n- 物件IDはboardDataのインデックスです。\n\nあなたの返答:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can choose a different model like "gpt-4" if available
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const llmResponse = JSON.parse(completion.choices[0].message.content);
    res.json(llmResponse);

  } catch (error) {
    console.error('Error during OpenAI negotiation:', error);
    res.status(500).json({ decision: 'reject', response_text: '交渉中にエラーが発生しました。', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
