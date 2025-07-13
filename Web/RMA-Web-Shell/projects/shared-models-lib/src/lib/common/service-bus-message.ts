export class ServiceBusMessage {
    serviceBusMessageId: number;
    messageTaskType: string;
    from: string ;
    to: string ;
    environment: string;
    enqueuedTime: Date;
    messageBody: string ;
    correlationID: string;
    messageProcessedTime: Date ;
    messageProcessingCompletionTime?: Date;
    messageProcessingStatusText: string ;
    messageTypeTaskHandler: string ;
  }