
CREATE   Procedure [legal].[getAttorneyRecoveredPayment_Details]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@RecordCount INT = 0 OUTPUT
)
AS
Begin

DECLARE @SelectCount As NVARCHAR(MAX)

SET @SelectCount = (select 
		Count (*)
	from 
	 [legal].[AttorneyRecoveredPayment] inner join [legal].[ReferralDetails] on [legal].[AttorneyRecoveredPayment].ReferralId= [legal].[ReferralDetails].Id 
	where 
		[legal].[AttorneyRecoveredPayment].IsDeleted = 0 
		)

SET @RecordCount = (select 
		Count (*)
	from 
	 [legal].[AttorneyRecoveredPayment] inner join [legal].[ReferralDetails] on [legal].[AttorneyRecoveredPayment].ReferralId= [legal].[ReferralDetails].Id 
	where 
		[legal].[AttorneyRecoveredPayment].IsDeleted = 0 
		)
		
		
	select 
		[legal].[AttorneyRecoveredPayment].Id ,			
		[legal].[AttorneyRecoveredPayment].Id ReferralId,
		[legal].[AttorneyRecoveredPayment].DocumentId,
		[legal].[AttorneyRecoveredPayment].[File] ,
		[legal].[AttorneyRecoveredPayment].Amount ,
		[legal].[AttorneyRecoveredPayment].Date,
		[legal].[AttorneyRecoveredPayment].CapitalAmount ,	
		[legal].[AttorneyRecoveredPayment].ContigencyFees , 
		[legal].[AttorneyRecoveredPayment].DisbursedAmount ,
		[legal].[AttorneyRecoveredPayment].RmaAmount ,
		[legal].[AttorneyRecoveredPayment].Notes ,
		[legal].[AttorneyRecoveredPayment].IsDeleted,		
		[legal].[AttorneyRecoveredPayment].CreatedBy,	
		[legal].[AttorneyRecoveredPayment].CreatedDate,
		[legal].[AttorneyRecoveredPayment].ModifiedBy,
		[legal].[AttorneyRecoveredPayment].ModifiedDate,		
		[legal].[AttorneyRecoveredPayment].IsActive, 
		@SelectCount 
	from 
	[legal].[AttorneyRecoveredPayment] inner join [legal].[ReferralDetails] on [legal].[AttorneyRecoveredPayment].ReferralId= [legal].[ReferralDetails].Id  
	where 
		[legal].[AttorneyRecoveredPayment].IsDeleted = 0 
		Order by [legal].[AttorneyRecoveredPayment].Id Desc
		OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY
		
END
--exec [legal].[GetAttorneyRecoveredPayment_Details] 23,1,10,'','',''--,'Active'