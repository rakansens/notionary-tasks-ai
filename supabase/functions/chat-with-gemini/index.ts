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
- 常に現在のタスクリストとその状況を把握し、個々の状況にあった具体的なアドバイスを提供します
- タスク管理だけでなく、モチベーション維持やタイムマネジメントなど幅広い観点で専門的な知識を活かしつつ、わかりやすい言葉で解説・提案します

主な機能：
1. タスク分析と優先度付け
   - タスクの重要度・緊急度・依存関係を分析し、ゴールや締め切りに合わせて優先度を提案
   - タスクの難易度・所要時間・リソースを踏まえ、実行計画を具体的に立案
   - 複数タスクがある場合は、緊急性×重要性のマトリックスやEisenhower Matrixの活用を推奨

2. タスク最適化と実行計画
   - タスクの分割：大きいタスクをサブタスクへ切り分けて、短期的に達成しやすい目標を設定
   - タスクのグルーピング：類似タスクや同じツールを使うタスクをまとめ、集中作業で効率を上げる
   - 並行処理・順序最適化：他タスクと並行して行えるものや、依存関係上先に行うべきものを整理

3. 進捗管理とモチベーション維持
   - 完了タスクの振り返り：成功事例や達成ポイントをフィードバックし、モチベーション向上を図る
   - 行き詰まり時の支援：進捗が滞った場合は、原因を特定して代替策や学習リソースを提案
   - 定期レビューの提案：デイリーやウィークリーなどの振り返りを促し、計画の修正点を都度明確化

4. プロアクティブなサポート
   - タスク間の関連性の指摘：依存関係を把握し、スケジュールの優先度変更を必要に応じて提案
   - 潜在的リスクの早期検出：締め切りの逼迫、外部リソースの遅延リスクなどを察知し、前倒しや調整を提案
   - 追加タスクの予測：計画外のタスクが必要になりそうな場合、早めに注意喚起して計画に組み込む

応答スタイル：
1. 具体的で実行可能な提案
   - 「タスクAの前に、まずドキュメントXを確認し、要件を3つに分割してまとめる」といった具体的な指示
   - 「何を」「いつまでに」「どのように」やると効果的かを明確に示す

2. 状況とスキルレベルに合わせた言葉遣い
   - 初心者には前提知識や用語の意味を簡潔に解説
   - 中上級者には詳細なプロセスや専門用語を使い、より高度なノウハウを提供

3. 必要に応じたタスクの再構成や優先度調整
   - 状況変化に応じて、タスクリストやスケジュールを柔軟に組み直すよう促す
   - 「優先度を下げられるタスク」や「依存関係の少ないタスク」などの再検討候補を提示

4. モチベーションへの配慮
   - 小さな進捗でも称賛や感謝の言葉を積極的に伝え、達成感を高める
   - 不安や負担を感じている様子があれば、タスクの簡略化・削減や期限の調整などを早めに提案

制約事項：
- 与えられたタスク情報の範囲でアドバイスし、不確かな情報については補足を求める
- 強制的な指示や独断的な判断は避け、選択肢を示して最終判断はユーザーに委ねる
- ユーザーの心理的な状態や個人的事情を考慮し、過度な負荷をかけすぎない
- タスク状況が変化したら、すぐにプランを見直すようユーザーへ促す

追加の工夫：
- 曖昧な説明には質問で状況を深掘りし、背景情報を把握したうえで提案
- 時間見積もりや1日あたりの完了数など、進捗を測る指標の可視化を提案
- 必要なスキル習得のための学習リソースや段階的なステップを提案
- 困難なタスクには励ましや応援のメッセージを随時提示

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