CREATE PROCEDURE [common].[ProcessDailyServiceBusErrorMessages] 
(
@StartTime AS DATETIME
)
AS
BEGIN 

	Truncate Table [dbo].[STPDailyServiceBusErrorMessages]

	Create Table #TempTable (
	MessageId varchar(100)
	)

	Insert INTO #TempTable
	SelECT MessageID From 
	[compcare].[ServiceBusMessage]
	where messageTaskType = '001'

	Create Table #MissingMessagesId (
	Id int identity(1,1),
	MessageId varchar(100)
	)

	Insert INTO #MissingMessagesId
	Select MessageID from 
	#TempTable 
	where MessageId not in (Select CompCareIntegrationMessageId from Claim.PersonEvent where compCarePersonEventId is not null)  order by 1 desc

	declare @Begin int = 1
	declare @End int = (select count(*) from #MissingMessagesId)
	declare @MessageId varchar(350)
	declare @MessageBody varchar(Max)
	declare @EventDetails varchar(Max)
	declare @PersonEventDetails Varchar(Max)
	Declare @CompCarePersonEventId int
	Declare @Count int

	Select @End as [Total Missing]

	while @begin <=@End
	begin
		Set @Count = 0 
		select @MessageId = MessageId from #MissingMessagesId where ID = @Begin

		SelECT @MessageBody = MessageBody 
		From [compcare].[ServiceBusMessage] where messageId = @MessageId 

		SELECT @EventDetails = JSON_Value(@MessageBody,'$.MessageBody')
		Select @PersonEventDetails = JSON_Query(@EventDetails,'$.PersonEvents[0]')
		Select @CompCarePersonEventId = JSON_Value(@PersonEventDetails, '$.PersonEventID') 

		Select @Count = Count(*) from claim.PersonEvent Where CompCarePersonEventId = @CompCarePersonEventId
		IF(@Count = 0)
		BEGIN
			insert into [dbo].[STPDailyServiceBusErrorMessages]([LogsId], [MessageId], [ErrorMessage], [ErrorMessageTimeStamp], [ErrorMessageException], [JobRunDate])
			Select Top 1 lgs.ID ,
			@MessageId ,
			lgs.[Message] , 
			lgs.[TimeStamp],
			Exc= SUBSTRING([Exception] ,0,CHARINDEX(' at ',[Exception] ,0)),
			GETDATE()
			from dbo.Logs (nolock) lgs
			where
			lgs.[TimeStamp] > @StartTime
			And lgs.[message] like '%' + @MessageId +'%'
			order by 1 desc
		END
	

		set @Begin = @Begin + 1
	end

	DROP TABLE #TempTable
	DROP TABLE #MissingMessagesId
END



