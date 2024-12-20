document.addEventListener('DOMContentLoaded', function () {
    var ws;
    var connectButton = document.getElementById('connectBtn');
    var disconnectButton = document.getElementById('disconnectBtn');
    var sendButton = document.getElementById('sendBtn');
    var messageInput = document.getElementById('messageInput');
    var messagesList = document.getElementById('messages');

    function connect() {
        ws = new WebSocket('wss://8080-741795251496554496-OOWq-web.staging.clackypaas.com/ws/123456'); // 修改为你的公共URL

        ws.onopen = function () {
            console.log('Connected to the WebSocket server.');
            connectButton.disabled = true;
            disconnectButton.disabled = false;
            sendButton.disabled = false;
        };

        ws.onmessage = function (event) {
            var message = JSON.parse(event.data);
            if (message.type === 'message') {
                var listItem = document.createElement('li');
                listItem.textContent = `${message.sender}: ${message.content}`;
                messagesList.appendChild(listItem);
            } else if (message.type === 'notification') {
                var notificationItem = document.createElement('li');
                notificationItem.textContent = `Notification: ${message.content}`;
                messagesList.appendChild(notificationItem);
            }
        };

        ws.onclose = function (event) {
            console.log('Disconnected from the WebSocket server. Code:', event.code);
            connectButton.disabled = false;
            disconnectButton.disabled = true;
            sendButton.disabled = true;

            // 尝试重连
            setTimeout(connect, 3000); // 3秒后尝试重连
        };

        ws.onerror = function (event) {
            var errorMessage;
            try {
                var message = JSON.parse(event.data);
                if (message.type === 'error') {
                    errorMessage = message.content;
                } else {
                    errorMessage = 'An unknown error occurred.';
                }
            } catch (e) {
                errorMessage = 'An error occurred, but the message format is wrong.';
            }
            console.error('WebSocket error:', errorMessage);
            alert(errorMessage);
        };
    }

    connectButton.addEventListener('click', connect);

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