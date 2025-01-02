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

    const contextPrompt = `
現在のタスク状況は以下の通りです：

${groupedTasks}

グループに属さないタスク：
${ungroupedTasks}

上記の情報を踏まえて、以下の質問に答えてください：
${message}`;

    console.log('Sending to Gemini API with context:', contextPrompt);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: contextPrompt
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