CREATE PROCEDURE [campaign].[ProcessBulkSmsRequestPerBatch]
AS BEGIN 

	DECLARE @BulkSmsRequestDetailIdTable Table (Id int identity(1,1), BulkSmsRequestDetailId int not null);
	DECLARE @SmsBatch int;

	select @SmsBatch = (select count(1) FROM  [campaign].[BulkSmsRequestHeader]  bsrh (nolock)
	inner join [campaign].[BulkSmsRequestDetail] bsrd (nolock) on bsrd.BulkSmsRequestHeaderId = bsrh.BulkSmsRequestHeaderId
	where   bsrd.SmsStatusId in (1,3) 
			AND bsrd.SendAttemptCount < 3
			AND bsrh.WhenToSend < GETDATE())

	insert @BulkSmsRequestDetailIdTable
	SELECT DISTINCT
	TOP  1000 
	BulkSmsRequestDetailId 
	FROM [campaign].[BulkSmsRequestHeader]  bsrh (nolock)
	inner join [campaign].[BulkSmsRequestDetail] bsrd (nolock) on bsrd.BulkSmsRequestHeaderId = bsrh.BulkSmsRequestHeaderId
	where   bsrd.SmsStatusId in (1,3) 
			AND bsrd.SendAttemptCount < 3
			AND bsrh.WhenToSend < GETDATE()
	--UPDATE
	UPDATE BSD
	SET 
		BSD.SmsStatusId = 5,
		BSD.SmsProcessedDate = GETDATE(),
		BSD.SmsSendResponse = 'BulkSmsRequestBatch Processing...',
		BSD.ModifiedBy = 'BulkSmsRequestBatch',
		bsd.ModifiedDate = GETDATE()
	FROM [campaign].[BulkSmsRequestDetail]  BSD
	INNER JOIN @BulkSmsRequestDetailIdTable TMP ON TMP.BulkSmsRequestDetailId = BSD.BulkSmsRequestDetailId

	SELECT
	SmsBatch = @SmsBatch,
	bsrh.BulkSmsRequestHeaderId,
	bsrd.BulkSmsRequestDetailId, 
	ItemId,
	ItemType,
	Campaign,
	Department,
	[Message] = SmsMessage,
	SmsNumber = CellPhoneNumber,
	SendAttemptCount,
	WhenToSend,
	LastChangedBy = bsrh.[CreatedBy]
	FROM [campaign].[BulkSmsRequestHeader]  bsrh (nolock)
	inner join [campaign].[BulkSmsRequestDetail] bsrd (nolock) on bsrd.BulkSmsRequestHeaderId = bsrh.BulkSmsRequestHeaderId
	INNER JOIN @BulkSmsRequestDetailIdTable tmp on tmp.BulkSmsRequestDetailId = bsrd.BulkSmsRequestDetailId
	/*where   bsrd.SmsStatusId in (1,3) 
			AND bsrd.SendAttemptCount < 3
			AND bsrd.WhenToSend < GETDATE()
			*/
	Order by bsrh.BulkSmsRequestHeaderId, bsrd.BulkSmsRequestDetailId

END
