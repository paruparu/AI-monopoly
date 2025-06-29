const express = require('express');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// --- Part 1: Check OPENAI_API_KEY on startup ---
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set in the .env file.');
  console.error('Please create a .env file in the root directory and add OPENAI_API_KEY=YOUR_API_KEY_HERE');
  process.exit(1); // Exit the process with an error code
}

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
  // --- Part 2: Log incoming request body for debugging ---
  console.log('Received /cpu-propose-message request body:', JSON.stringify(req.body, null, 2));

  const { cpu, player, offer, request, boardData } = req.body;

  try {
    const prompt = `あなたはモノポリーゲームのCPUプレイヤーです。人間プレイヤー（${player.name}）に交渉を提案します。以下の条件で提案する際のメッセージを生成してください。
あなたのプレイヤー名: ${cpu.name}
あなたの所持金: ¥${cpu.money.toLocaleString()}
あなたの所有物件: ${cpu.properties.filter(pIdx => pIdx !== null && pIdx !== undefined).map(pIdx => boardData[pIdx]?.name).join(', ') || 'なし'}

あなたが提案する内容:
- 提示物件: ${offer.properties.filter(pIdx => pIdx !== null && pIdx !== undefined).map(pIdx => boardData[pIdx]?.name).join(', ') || 'なし'}
- 提示現金: ¥${(offer.money || 0).toLocaleString()}

あなたが要求する内容:
- 要求物件: ${request.properties.filter(pIdx => pIdx !== null && pIdx !== undefined).map(pIdx => boardData[pIdx]?.name).join(', ') || 'なし'}
- 要求現金: ¥${(request.money || 0).toLocaleString()}

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
  // --- Part 2: Log incoming request body for debugging ---
  console.log('Received /cpu-to-cpu-negotiate request body:', JSON.stringify(req.body, null, 2));

  const { offeringCpu, targetCpu, offer, request, boardData } = req.body;

  try {
    const prompt = `あなたはモノポリーゲームのCPUプレイヤーです。他のCPUプレイヤー（${offeringCpu.name}）から交渉提案を受けています。以下の提案について、あなたの立場（${targetCpu.name}）として返答してください。

あなたのプレイヤー名: ${targetCpu.name}
あなたの所持金: ¥${targetCpu.money.toLocaleString()}
あなたの所有物件: ${targetCpu.properties.filter(pIdx => pIdx !== null && pIdx !== undefined).map(pIdx => boardData[pIdx]?.name).join(', ') || 'なし'}

相手プレイヤー（${offeringCpu.name}）の提案:
- 提示物件: ${offer.properties.filter(pIdx => pIdx !== null && pIdx !== undefined).map(pIdx => boardData[pIdx]?.name).join(', ') || 'なし'}
- 提示現金: ¥${(offer.money || 0).toLocaleString()}

あなたが要求されているもの:
- 要求物件: ${request.properties.filter(pIdx => pIdx !== null && pIdx !== undefined).map(pIdx => boardData[pIdx]?.name).join(', ') || 'なし'}
- 要求現金: ¥${(request.money || 0).toLocaleString()}

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
  // --- Part 2: Log incoming request body for debugging ---
  console.log('Received /negotiate request body:', JSON.stringify(req.body, null, 2));

  const { player, partner, yourOffer, theirOffer, message, boardData } = req.body;

  try {
    const getPropertyName = (id) => boardData.find(p => p.id === id)?.name || '不明な物件';

    const prompt = `あなたはモノポリーゲームのCPUプレイヤーです。以下の交渉提案について、相手プレイヤー（人間）に返答してください.\n\n現在の状況:
- あなたのプレイヤー名: ${partner.name}
- あなたの所持金: ¥${(partner.money || 0).toLocaleString()}
- あなたの所有物件: ${partner.properties.map(getPropertyName).join(', ') || 'なし'}

相手プレイヤー（${player.name}）の提案:
- 提示物件: ${yourOffer.properties.map(getPropertyName).join(', ') || 'なし'}
- 提示現金: ¥${(yourOffer.money || 0).toLocaleString()}

あなたが要求されているもの:
- 要求物件: ${theirOffer.properties.map(getPropertyName).join(', ') || 'なし'}
- 要求現金: ¥${(theirOffer.money || 0).toLocaleString()}\n\n相手からのメッセージ: "${message}"\n\nあなたの返答は、以下のJSON形式でお願いします.\n{\n  "decision": "accept" | "reject" | "counter",\n  "response_text": "[返答メッセージ]",\n  "counter_offer": {\n    "properties": ["物件ID"],\n    "money": 0\n  },\n  "counter_request": {\n    "properties": ["物件ID"],\n    "money": 0\n  }\n}\n\n- 'decision'は'accept'（受け入れる）、'reject'（拒否する）、'counter'（再提案する）のいずれかです.\n- 'response_text'は相手へのメッセージです.\n- 'counter'の場合のみ'counter_offer'と'counter_request'を含めてください.\n- 物件IDは'okinawa'のような文字列IDです.\n\nあなたの返答:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
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

// Endpoint for AI to decide on construction
app.post('/decide-construction', async (req, res) => {
  console.log('Received /decide-construction request body:', JSON.stringify(req.body, null, 2));
  const { cpuPlayer, buildableProperties } = req.body;

  try {
    const propertiesString = buildableProperties.map(prop => {
        const currentRent = prop.rentLevels[prop.houses];
        const nextRent = prop.rentLevels[prop.houses + 1];
        return `- ${prop.name} (ID: ${prop.id}, 現在${prop.houses}軒, 建築コスト:¥${prop.houseCost}, 家賃: ¥${currentRent} -> ¥${nextRent})`;
    }).join('\n');

    const prompt = `あなたはモノポリーの戦略的なAIプレイヤーです。目的は、他のプレイヤーを破産させて勝利することです。そのための最も重要な戦略の一つは、独占したカラーグループに家を建てて、高額な家賃収入を得ることです。

現在のあなたの状況:
- プレイヤー名: ${cpuPlayer.name}
- 所持金: ¥${cpuPlayer.money.toLocaleString()}

建築可能な物件のリスト:
${propertiesString}

上記の情報を元に、どの物件に家を1軒建てるべきか、あるいは今は建築を見送るべきかを判断してください。

判断のヒント:
- 所持金を全て使い切るのは危険です。他のプレイヤーの高額な土地に止まった際に支払う現金は残しておくべきです。一般的に、建築後も最低 ¥20,000 ~ ¥30,000 は手元に残しておくと安全です。
- 複数の選択肢がある場合、どの物件に建築すれば最も家賃の上がり幅が大きく、投資対効果が高いかを考慮してください。
- 相手を破産させる可能性が最も高まるような、戦略的な一手を選んでください。

あなたの判断を、以下のJSON形式で出力してください。
{
  "decision": "build" | "pass",
  "propertyId": "[建築を決定した物件のID]" | null,
  "reason": "[判断理由を簡潔に説明]"
}

- 建築する場合は "decision" を "build" とし、"propertyId" にその物件のID（例: "shinjuku"）を指定します。
- 建築しない場合は "decision" を "pass" とし、"propertyId" は null にします。
- 1ターンに建築できる家は1軒だけです。最も良い選択肢を一つだけ選んでください。`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.5,
    });

    const llmResponse = JSON.parse(completion.choices[0].message.content);
    console.log('LLM construction decision:', llmResponse);
    res.json(llmResponse);

  } catch (error) {
    console.error('Error during AI construction decision:', error);
    res.status(500).json({ decision: 'pass', propertyId: null, reason: 'AIの判断中にエラーが発生しました。' });
  }
});

app.listen(port, () => {
  if (!isProduction) {
    console.log(`Server is running in ${isProduction ? 'production' : 'development'} mode on port ${port}`);
  }
  console.log(`Server listening at http://localhost:${port}`);
});
