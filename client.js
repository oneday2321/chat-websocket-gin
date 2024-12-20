document.addEventListener('DOMContentLoaded', function () {
    var ws;
    var connectButton = document.getElementById('connectBtn');
    var disconnectButton = document.getElementById('disconnectBtn');
    var sendButton = document.getElementById('sendBtn');
    var messageInput = document.getElementById('messageInput');
    var messagesList = document.getElementById('messages');

    function connect() {
        ws = new WebSocket('wss://8080-741780596661125120-Xqb5-web.staging.clackypaas.com/ws/123456'); // 修改为你的公共URL
        startHeartbeat();
        reconnectAttempts = 0;

        ws.onopen = function () {
            console.log('Connected to the WebSocket server.');
            connectButton.disabled = true;
            disconnectButton.disabled = false;
            sendButton.disabled = false;
        };

        ws.onmessage = function (event) {
            var message = JSON.parse(event.data);
            // Handle heartbeat message
            if (message.type === 'heartbeat') {
                console.log('Heartbeat received');
            }
            var listItem = document.createElement('li');
            listItem.textContent = `${message.sender}: ${message.content}`;
            messagesList.appendChild(listItem);
        };

        ws.onclose = function (event) {
            console.log('Disconnected from the WebSocket server. Code:', event.code);
            connectButton.disabled = false;
            disconnectButton.disabled = true;
            sendButton.disabled = true;

            // 尝试重连
            reconnectAttempts = Math.min(reconnectAttempts + 1, 10);
            const timeout = Math.pow(2, reconnectAttempts) * 1000;
            setTimeout(connect, timeout); // Use exponential backoff for reconnection
        };

        ws.onerror = function (error) {
            console.error('WebSocket error:', error);
        };
    }

    let reconnectAttempts = 0;
    function startHeartbeat() {
        setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({type: 'heartbeat'}));
            }
        }, 30000); // Send a heartbeat every 30 seconds
    }

    disconnectButton.addEventListener('click', function () {
        if (ws) {
            ws.close();
        }
    });

    sendButton.addEventListener('click', function () {
        if (ws && ws.readyState === WebSocket.OPEN) {
            var message = {
                type: 'message',
                sender: 'user1', // 发送者ID
                recipient: 'user2', // 接收者ID
                content: messageInput.value,
                id: 'room1' // 房间ID
            };
            ws.send(JSON.stringify(message));
            messageInput.value = ''; // 清空输入框
        }
    });
});