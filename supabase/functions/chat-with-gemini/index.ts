import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, tasks, groups } = await req.json();

    // タスクとグループの情報をより詳細なコンテキストとして整形
    const groupedTasks = groups.map(group => {
      const groupTasks = tasks
        .filter(task => task.groupId === group.id)
        .map(task => {
          const subtasks = task.subtasks 
            ? `\n    サブタスク:\n      ${task.subtasks
                .map(st => `- ${st.title} (${st.completed ? '完了' : '未完了'})`)
                .join('\n      ')}`
            : '';
          return `  - ${task.title} (${task.completed ? '完了' : '未完了'})${subtasks}`;
        })
        .join('\n');
      return `グループ「${group.name}」:\n${groupTasks}`;
    }).join('\n\n');

    const ungroupedTasks = tasks
      .filter(task => !task.groupId && !task.parentId)
      .map(task => {
        const subtasks = task.subtasks 
          ? `\n  サブタスク:\n    ${task.subtasks
              .map(st => `- ${st.title} (${st.completed ? '完了' : '未完了'})`)
              .join('\n    ')}`
          : '';
        return `- ${task.title} (${task.completed ? '完了' : '未完了'})${subtasks}`;
      })
      .join('\n');

    const systemPrompt = `
あなたはタスク管理のエキスパートアシスタントです。以下の役割と機能を持っています：

基本姿勢：
- ユーザーのタスク管理を支援する、親身で実践的なアドバイザーとして振る舞います
- 常に現在のタスクリストとその状況を把握し、それに基づいた具体的なアドバイスを提供します
- タスク管理だけでなく、モチベーション維持やタイムマネジメントなど幅広い観点で専門的な知識を活かしつつ、わかりやすい言葉で説明します

主な機能：
1. タスク分析と優先度付け
   - 現在のタスクの依存関係や重要度を分析
   - 締め切りや難易度を考慮した優先順位の提案
   - タスクの進捗状況に基づいたボトルネックの特定

2. タスク最適化の提案
   - 類似タスクのグループ化
   - サブタスクへの分割提案
   - より効率的な実行順序の提示

3. 進捗管理とモチベーション支援
   - 完了タスクの評価と称賛
   - 未完了タスクへの具体的なアプローチ提案
   - 行き詰まり時の代替案の提示

4. プロアクティブなサポート
   - タスク間の関連性の指摘
   - 潜在的な問題点の早期警告
   - 追加で必要となる可能性のあるタスクの予測

応答スタイル：
- 具体的で実行可能な提案を心がけます
- ユーザーの状況に応じて、詳細な説明と簡潔な指示を使い分けます
- 必要に応じて、タスクの再構成や優先度の見直しを提案します
- 小さな進捗でも称賛や感謝の言葉を積極的に伝え、達成感を高めます

現在のタスク状況は以下の通りです：

${groupedTasks}

グループに属さないタスク：
${ungroupedTasks}

上記の情報を踏まえて、以下の質問に答えてください：
${message}`;

    console.log('Sending to Gemini API with context:', systemPrompt);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();
    console.log('Gemini API Response:', data);

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-gemini function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});