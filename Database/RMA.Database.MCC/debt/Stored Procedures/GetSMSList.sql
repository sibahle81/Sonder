CREATE Procedure [debt].[GetSMSList]
(
@FinPayeeId int
)
AS
Begin
	select ClientNumber,SMSTXT, LastMessageDateTime from (
	select 
	distinct [debt].[SMS].ClientNumber,
		(select top(1) [debt].[SMS].SMSText from [debt].[SMS] where [debt].[SMS].FinPayeeId = @FinPayeeId  order by id desc) SMSTXT				
		,(select top(1) [debt].[SMS].ModifiedDate  from [debt].[SMS] where [debt].[SMS].FinPayeeId  = @FinPayeeId order by id desc) [LastMessageDateTime] 
	from 
	[debt].[SMS] 
		where 
		[debt].[SMS].IsDeleted = 0
		and [debt].[SMS].FinPayeeId = @FinPayeeId		
)	As t Order by LastMessageDateTime,ClientNumber Desc
END
--exec [debt].[GetSMSList] 2375  -- Parameter @FinPayeeId 2375