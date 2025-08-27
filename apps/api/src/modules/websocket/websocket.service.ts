import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
@Injectable()
export class WebSocketService {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-document')
  handleJoinDocument(
    @MessageBody() data: { documentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`document-${data.documentId}`);
    return { event: 'joined-document', documentId: data.documentId };
  }

  @SubscribeMessage('leave-document')
  handleLeaveDocument(
    @MessageBody() data: { documentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`document-${data.documentId}`);
    return { event: 'left-document', documentId: data.documentId };
  }

  @SubscribeMessage('document-edit')
  handleDocumentEdit(
    @MessageBody() data: { documentId: string; edit: any },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast edit to all clients in the document room
    client.to(`document-${data.documentId}`).emit('document-edit', {
      documentId: data.documentId,
      edit: data.edit,
      userId: client.id,
    });
    return { event: 'edit-broadcasted' };
  }

  @SubscribeMessage('transcript-update')
  handleTranscriptUpdate(
    @MessageBody() data: { documentId: string; transcript: any },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast transcript update to all clients in the document room
    client.to(`document-${data.documentId}`).emit('transcript-update', {
      documentId: data.documentId,
      transcript: data.transcript,
    });
    return { event: 'transcript-broadcasted' };
  }

  // Method to emit events from other services
  emitToDocument(documentId: string, event: string, data: any) {
    this.server.to(`document-${documentId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }
}
