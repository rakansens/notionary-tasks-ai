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

    // タスクとグループの情報をコンテキストとして整形
    const taskContext = tasks.map(task => {
      const group = groups.find(g => g.id === task.groupId);
      return `- ${task.title} (${task.completed ? '完了' : '未完了'})${group ? ` [グループ: ${group.name}]` : ''}`;
    }).join('\n');

    const contextPrompt = `
以下のタスク情報を参考にして回答してください：

${taskContext}

ユーザーからの質問：${message}`;

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
        }]
      })
    });

    const data = await response.json();
    console.log('Gemini API Response:', data);

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