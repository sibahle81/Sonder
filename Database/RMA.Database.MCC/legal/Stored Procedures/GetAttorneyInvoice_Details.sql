
CREATE Procedure [legal].[getAttorneyInvoice_Details]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@ReferralId Int,
@RecordCount INT = 0 OUTPUT
)
AS
Begin

DECLARE @SelectCount As NVARCHAR(MAX)

SET @SelectCount = (select 
		Count (*)
	from 
	 [legal].[AttorneyInvoices]
	where 
	[legal].[AttorneyInvoices].IsDeleted = 0
		and  ([legal].[AttorneyInvoices].InvoiceFile like ('%'+ @SearchCreatia +'%') OR [legal].[AttorneyInvoices].Notes like ('%'+ @SearchCreatia +'%')) 
		and [legal].[AttorneyInvoices].ReferralId= @ReferralId)

SET @RecordCount = (select 
		Count (*)
	from 
	 [legal].[AttorneyInvoices]
	where 
	[legal].[AttorneyInvoices].IsDeleted = 0
		and  ([legal].[AttorneyInvoices].InvoiceFile like ('%'+ @SearchCreatia +'%') OR [legal].[AttorneyInvoices].Notes like ('%'+ @SearchCreatia +'%')) 
		and [legal].[AttorneyInvoices].ReferralId= @ReferralId)

	select 
		[legal].[AttorneyInvoices].Id ,			
		[legal].[AttorneyInvoices].InvoiceFile ,
		[legal].[AttorneyInvoices].DocumentId ,
		[legal].[AttorneyInvoices].Notes,		
		[legal].[AttorneyInvoices].LegalCareInvoiceApprovalStatusId LegalCareInvoiceApprovalStatus,
		[legal].[AttorneyInvoices].ReferralId, 
		[legal].[AttorneyInvoices].IsDeleted,		
		isnull((select case when isnull([security].[user].DisplayName,'')='' then isnull([security].[user].UserName,'') else isnull([security].[user].DisplayName,'') END from [security].[user] where [security].[user].Email=[legal].[AttorneyInvoices].CreatedBy),'') CreatedBy, 
		[legal].[AttorneyInvoices].CreatedDate,	
		[legal].[AttorneyInvoices].CreatedDate,
		[legal].[AttorneyInvoices].ModifiedBy,
		[legal].[AttorneyInvoices].ModifiedDate,				
		[legal].[AttorneyInvoices].IsActive , 
						
		[legal].[AttorneyInvoices].Amount , 
		@SelectCount 
	from 
	[legal].[AttorneyInvoices] 	
	where 
		[legal].[AttorneyInvoices].IsDeleted = 0
		and  ([legal].[AttorneyInvoices].InvoiceFile like ('%'+ @SearchCreatia +'%') OR [legal].[AttorneyInvoices].Notes like ('%'+ @SearchCreatia +'%')) 
		and [legal].[AttorneyInvoices].ReferralId= @ReferralId
		order by [legal].[AttorneyInvoices].Id desc
		OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY 
END
--exec [legal].[GetAttorneyInvoice_Details] 23,1,10,'','','', 17    --  here Approval Status is Pending, Approved, Rejected