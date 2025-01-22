let socket: WebSocket | null = null;

export const createSocket = (token: string, onMessage: (data: string) => void) => {
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    return socket;
  }

  socket = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/notifications/ws/token=${token}`);

  socket.onmessage = (event) => {
    const notification = event.data;
    console.log('New notification:', notification);
    onMessage(notification);
  };

  socket.onclose = (event) => {
    console.log('WebSocket closed:', event);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return socket;
};
