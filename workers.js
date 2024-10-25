export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const { messages } = await request.json();
      console.log('请求的消息:', messages); // 打印请求的消息

      try {
        // 调用 AI 模型处理对话
        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', { messages });
        console.log('AI Response:', response); // 打印 AI 的完整返回值

        // 假设返回的 response 本身就是 JSON 格式
        return Response.json(response);
      } catch (error) {
        console.error('请求超时或发生错误:', error);
        return Response.json({ response: '请求超时或发生错误。' });
      }
    }

    // 返回美观的 HTML 页面和嵌入的 JavaScript
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Llama3-8b</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
              #chat { max-width: 600px; margin: 50px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
              #messages { border: 1px solid #ccc; height: 400px; overflow-y: auto; padding: 10px; border-radius: 10px; }
              #userInput { width: calc(100% - 90px); padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
              #sendBtn { padding: 10px; background: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
              #sendBtn:hover { background: #0056b3; }
              .message { margin: 10px 0; }
              .user { color: #007bff; }
              .assistant { color: #28a745; }
              .role { font-weight: bold; }
          </style>
      </head>
      <body>
          <div id="chat">
              <h2 style="text-align: center;">Llama3-8b</h2>
              <div id="messages"></div>
              <div style="padding: 10px;">
                  <input type="text" id="userInput" placeholder="Type your message...">
                  <button id="sendBtn">Send</button>
              </div>
          </div>
          <script>
              const messagesDiv = document.getElementById('messages');
              const userInput = document.getElementById('userInput');
              const sendBtn = document.getElementById('sendBtn');

              let conversationHistory = [];

              sendBtn.addEventListener('click', async () => {
                  const userMessage = userInput.value.trim();
                  if (!userMessage) return;

                  conversationHistory.push({ role: 'user', content: userMessage });
                  updateMessages();

                  const response = await fetch('/', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ messages: conversationHistory })
                  });

                  const data = await response.json();
                  conversationHistory.push({ role: 'assistant', content: data.response }); // 确保 data 中有 response 字段
                  updateMessages();
                  userInput.value = '';
              });

              function updateMessages() {
                  messagesDiv.innerHTML = conversationHistory.map(msg => 
                      \`<div class="message \${msg.role}"><span class="role">\${msg.role}:</span> \${msg.content}</div>\`
                  ).join('');
                  messagesDiv.scrollTop = messagesDiv.scrollHeight; // 自动滚动到最底部
              }
          </script>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }
};
