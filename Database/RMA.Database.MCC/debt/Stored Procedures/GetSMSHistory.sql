CREATE Procedure [debt].[GetSMSHistory]
(
@FinPayeeId int,
@ClientNumber as varchar (15)
)
AS
Begin
	select 
	[debt].[SMS].FinPayeeId , 
	[debt].[SMS].ClientNumber,		
	[debt].[SMS].SMSText,  
	[debt].[sms].CreatedBy,
	[debt].[sms].CreatedDate 
	from 
	[debt].[SMS] 
		where 
		[debt].[SMS].IsDeleted = 0
		and [debt].[SMS].ClientNumber = @ClientNumber 
		and [debt].[SMS].FinPayeeId = @FinPayeeId
		order by [debt].[sms].CreatedDate desc 
END

--exec [debt].[GetSMSHistory] '2375','2754122500'  -- Parameter @FinPayeeId 1 , ClientNumber '123456'