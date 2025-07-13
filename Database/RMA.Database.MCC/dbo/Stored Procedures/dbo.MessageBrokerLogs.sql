CREATE proc dbo.MessageBrokerLogs
AS
/*  
exec dbo.MessageBrokerLogs  
*/
BEGIN

DECLARE @LastRun DATETIME =   DATEADD(HOUR, -6, GETDATE());

select
Id,
[TimeStamp] as ExceptionDate,
json_value(replace(l.[MessageTemplate],'HandleReceiveMessageError BrokeredMessage| ',''), '$.LockToken') as 'LockToken',
json_value(replace(l.[MessageTemplate],'HandleReceiveMessageError BrokeredMessage| ',''), '$.MessageId') as 'MessageId',
json_value(replace(l.[MessageTemplate],'HandleReceiveMessageError BrokeredMessage| ',''), '$.Properties.MessageFrom') as 'MessageFrom',
json_value(replace(l.[MessageTemplate],'HandleReceiveMessageError BrokeredMessage| ',''), '$.Properties.MessageTo') as 'MessageTo',
'Abandoned' as 'MessageStatus',
SUBSTRING( l.Exception, 0, CHARINDEX(' at ', l.Exception)) as ExceptionMessage
from dbo.logs (NOLOCK) l 
where l.[messageTemplate] like '%HandleReceiveMessageError BrokeredMessage|%'
and [TimeStamp] >= @LastRun

END


