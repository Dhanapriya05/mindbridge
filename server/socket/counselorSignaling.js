import { nanoid } from 'nanoid';

export const registerCounselorSignaling = (io) => {
  const queue = [];
  const sessions = new Map();
  io.on('connection', (socket) => {
    socket.on('counselor:session_request', (payload = {}) => { queue.push({ socketId: socket.id, alias: payload.alias || 'Anonymous Student', severity: payload.severity || 'standard', requestedAt: Date.now() }); io.emit('counselor:queue_updated', { count: queue.length }); });
    socket.on('counselor:session_accept', ({ studentSocketId } = {}) => { const index = queue.findIndex((item) => item.socketId === studentSocketId); if (index < 0) return socket.emit('counselor:session_error', { message: 'Session request is no longer available' }); const student = queue.splice(index, 1)[0]; const roomId = `session_${nanoid(12)}`; sessions.set(roomId, { sockets: new Set([socket.id, student.socketId]), createdAt: Date.now() }); socket.join(roomId); io.sockets.sockets.get(student.socketId)?.join(roomId); io.to(roomId).emit('counselor:session_ready', { roomId, studentAlias: student.alias, severity: student.severity }); io.emit('counselor:queue_updated', { count: queue.length }); });
    const relay = (event) => (payload = {}) => { const session = sessions.get(payload.roomId); if (!session || !session.sockets.has(socket.id)) return; socket.to(payload.roomId).emit(event, { ...payload, senderSocketId: socket.id }); };
    socket.on('webrtc:offer', relay('webrtc:offer')); socket.on('webrtc:answer', relay('webrtc:answer')); socket.on('webrtc:ice_candidate', relay('webrtc:ice_candidate'));
    socket.on('session:disconnect', ({ roomId } = {}) => { const session = sessions.get(roomId); if (!session) return; io.to(roomId).emit('session:closed'); sessions.delete(roomId); });
    socket.on('disconnect', () => { for (const [roomId, session] of sessions) if (session.sockets.has(socket.id)) { io.to(roomId).emit('session:closed'); sessions.delete(roomId); } });
  });
};