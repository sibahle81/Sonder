

CREATE   Procedure [legal].[getMeetingsDetails_Information]
(
@ObjectionId as int,
@RecordCount INT = 0 OUTPUT
)
AS
Begin

SET @RecordCount = (select 
		Count (*)
	from 
	 [legal].[Meetings]
	where 
	IsDeleted = 0)

	select 
		[legal].[Meetings].Id,
		[legal].[Meetings].ObjectionId,		
		convert(varchar,[legal].[Meetings].Date, 20) Date,
		[legal].[Meetings].TimeFrom,
		[legal].[Meetings].TimeTo,
		[legal].[Meetings].IsActive,
		[legal].[Meetings].Description,
		[legal].[Meetings].RefDocument,
		[legal].[MeetingAttendies].UserId,
		[legal].[Attorney].AttorneyName,
		[legal].[MeetingAttendies].IsAttended,
		[legal].[MeetingAttendies].ClaimForm 
		
	from  [legal].[Meetings] 
	Left Join [legal].[MeetingAttendies] on [legal].[MeetingAttendies].MeetingId =[legal].[Meetings].Id 
	Left Join [legal].[Attorney] on [legal].[Attorney].Id= [legal].[MeetingAttendies].UserId 
	where 
		[legal].[Meetings].IsDeleted = 0
		and [legal].[Meetings].ObjectionId = @ObjectionId
END

--exec [legal].[GetMeetingsDetails_Information] 102  -- Parameter @ObjectionId =102