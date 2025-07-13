
CREATE Procedure [bpm].[LegalReferralDetails_Temp]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@Status as VARCHAR(150),
@RecordCount INT = 0 OUTPUT
)
AS
Begin

DECLARE @SelectCount As NVARCHAR(MAX)

SET @SelectCount = (select 
		Count (*)
	from 
	 [bpm].[referraltemp]
	where 
	IsDeleted = 0)
	
Print @SelectCount

	select 
		ReferralId ,	
		ClaimNumber  ,	
		PolicyNumber ,	
		CustomerName  ,	
		Date,	
		Status ,	
		AssignId ,
		IsDeleted,		
		CreatedBy,	
		CreatedDate,	
		ModifiedBy,
		ModifiedDate,
		@SelectCount 
	from 
	 [bpm].[referraltemp]
	where 
		IsDeleted = 0
		and Status = @Status

END
--exec [bpm].[LegalReferralDetails_Temp] 23,1,10,'','','','Open'