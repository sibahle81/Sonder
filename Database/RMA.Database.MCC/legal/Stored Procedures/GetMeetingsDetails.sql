
CREATE   Procedure [legal].[getMeetingsDetails]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@Status as VARCHAR(150),
@ObjectionId as int ,
@RecordCount INT = 0 OUTPUT
)
AS
Begin

DECLARE @SelectCount As NVARCHAR(MAX)

SET @SelectCount = (select 
		Count (*)
	from 
	 [legal].[Meetings]
	where 
		[legal].[Meetings].IsDeleted = 0
		and  ( [legal].[Meetings].Description like ('%'+ @SearchCreatia +'%') )
		and 	 
		 (
		 (@status='Completed' AND convert(varchar, [legal].[Meetings].TimeTo, 21)  <  convert(varchar, getdate(), 21)) 
		  Or
		 (@status ='Schedule' and convert(varchar, [legal].[Meetings].TimeTo, 21)  >  convert(varchar, getdate(), 21))
		 )
 		and [legal].[Meetings].ObjectionId = @ObjectionId)

SET @RecordCount = (select 
		Count (*)
	from 
	 [legal].[Meetings]
	where 
		[legal].[Meetings].IsDeleted = 0
		and  ( [legal].[Meetings].Description like ('%'+ @SearchCreatia +'%') )
		and 	 
		 (
		 (@status='Completed' AND convert(varchar, [legal].[Meetings].TimeTo, 21)  <  convert(varchar, getdate(), 21)) 
		  Or
		 (@status ='Schedule' and convert(varchar, [legal].[Meetings].TimeTo, 21)  >  convert(varchar, getdate(), 21))
		 )
 		and [legal].[Meetings].ObjectionId = @ObjectionId)

	select 
		Id,
		ObjectionId,
		Date,
		TimeFrom,
		TimeTo,
		IsActive,
		Description,
		RefDocument,
		IsDeleted,
		CreatedBy,
		[legal].[Meetings].CreatedDate,
		ModifiedBy,
		[legal].[Meetings].ModifiedDate,
(select stuff((select ', '+ 
case when ISNULL([legal].[MeetingAttendies].UserId,'') = '' then [legal].[MeetingAttendies].EmailId 
else convert(varchar,[Security].[User].DisplayName) End 
From [legal].[MeetingAttendies] 
left join [Security].[User] on [Security].[User].Id = isnull([legal].[MeetingAttendies].UserId,0)  
where [legal].[MeetingAttendies].MeetingId = [legal].[Meetings].id and [legal].[MeetingAttendies].IsDeleted =0  
for XML PATH('')),1,1,'') ) AttendeesName,
(select stuff((select ', '+
case when ISNULL([legal].[MeetingAttendies].UserId,'') = '' then [legal].[MeetingAttendies].EmailId 
else convert(varchar,[Security].[User].Email) End
From [legal].[MeetingAttendies] 
left join [Security].[User] on [Security].[User].Id = isnull([legal].[MeetingAttendies].UserId,0)  
where [legal].[MeetingAttendies].MeetingId = [legal].[Meetings].id and [legal].[MeetingAttendies].IsDeleted =0
for XML PATH('')),1,1,'') ) AttendeesEmail,

@SelectCount 
	from 
	[legal].[Meetings] 	
	where 
		[legal].[Meetings].IsDeleted = 0
		and  ( [legal].[Meetings].Description like ('%'+ @SearchCreatia +'%') )
		and 
		 (
		 (@status='Completed' AND convert(varchar, [legal].[Meetings].TimeTo, 21)  <  convert(varchar, getdate(), 21)) 
		  Or
		 (@status ='Schedule' and convert(varchar, [legal].[Meetings].TimeTo, 21)  >  convert(varchar, getdate(), 21))
		 )
 		and [legal].[Meetings].ObjectionId = @ObjectionId
	order by [legal].[Meetings].id DESC  
		OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY		
END

--exec [legal].[GetMeetingsDetails] 23,1,10,'','','','completed',290221   -- Parameter @status, ObjectionId    Status = Schedule / Submitted
--exec [legal].[GetMeetingsDetails] 23,1,10,'','','','schedule',290224   -- Parameter @status, ObjectionId		Status = Schedule / Submitted