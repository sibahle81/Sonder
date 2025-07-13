
CREATE    Procedure [legal].[getLegalCareRecoveryHeadTemp_DetailsList]
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
DECLARE @UserRole As VARCHAR(50)
Declare @StatusCondition as int =  (select common.LegalCareInvoiceApprovalStatus.Id from common.LegalCareInvoiceApprovalStatus where common.LegalCareInvoiceApprovalStatus.Name =@Status ) 
DECLARE @IsApprove BIT = 1

SET @SelectCount = (select 
		Count (*)
	from 
	 [legal].AttorneyInvoices	 
	 	Inner Join [legal].[ReferralDetails] on [legal].[ReferralDetails].Id = [legal].AttorneyInvoices.ReferralId 	 
	 	Inner Join [claim].Claim on [claim].Claim.ClaimId = [legal].[ReferralDetails].ClaimId 
		Inner Join [policy].[policy] on [policy].[policy].PolicyId =[claim].Claim.PolicyId
		Inner Join [claim].PersonEvent on [claim].PersonEvent.PersonEventId =[claim].Claim.PersonEventId
		Inner Join [claim].Event  on [claim].Event.EventId = [claim].PersonEvent.EventId
		Inner Join [client].Person on [client].Person.RolePlayerId= [claim].PersonEvent.InsuredLifeId  
		Inner Join [client].RolePlayer Employee on Employee.RolePlayerId = [claim].PersonEvent.InsuredLifeId 
		Inner join [client].RolePlayer Member on Member.RolePlayerId = [claim].PersonEvent.ClaimantId 
	where 
		[legal].[ReferralDetails] .IsDeleted = 0
		and ( [claim].Claim.ClaimReferenceNumber like ('%'+ @SearchCreatia +'%') or  [policy].[policy].PolicyNumber like ('%'+ @SearchCreatia +'%')  or  Member.DisplayName like ('%'+ @SearchCreatia +'%')) and [legal].AttorneyInvoices.IsDeleted  = 0)

SET @UserRole = (select [security].Role.Name From [security].[User] 
	inner join [security].Role on [security].Role.Id = [security].[User].RoleId where [security].[User].Id=@userId)

SET @RecordCount = (select 
		Count (*)

	from [legal].AttorneyInvoices	 
	 	Inner Join [legal].[ReferralDetails] on [legal].[ReferralDetails].Id = [legal].AttorneyInvoices.ReferralId 	
	 	Inner Join [claim].Claim on [claim].Claim.ClaimId = [legal].[ReferralDetails].ClaimId 
		Inner Join [policy].[policy] on [policy].[policy].PolicyId =[claim].Claim.PolicyId
		Inner Join [claim].PersonEvent on [claim].PersonEvent.PersonEventId =[claim].Claim.PersonEventId
		Inner Join [claim].Event  on [claim].Event.EventId = [claim].PersonEvent.EventId
		Inner Join [client].Person on [client].Person.RolePlayerId= [claim].PersonEvent.InsuredLifeId  
		Inner Join [client].RolePlayer Employee on Employee.RolePlayerId = [claim].PersonEvent.InsuredLifeId 
		Inner join [client].RolePlayer Member on Member.RolePlayerId = [claim].PersonEvent.ClaimantId 
	where 
		[legal].[ReferralDetails] .IsDeleted = 0
		and ( [claim].Claim.ClaimReferenceNumber like ('%'+ @SearchCreatia +'%') or  [policy].[policy].PolicyNumber like ('%'+ @SearchCreatia +'%')  or  Member.DisplayName like ('%'+ @SearchCreatia +'%'))  
		and [legal].AttorneyInvoices.LegalCareInvoiceApprovalStatusId = @StatusCondition and @UserRole='Recovery Legal Head'
		)
		
	select 
		[legal].AttorneyInvoices.Id, 
		[legal].AttorneyInvoices.InvoiceFile Invoice, 	
		[legal].[ReferralDetails].[Date] ,	
		isnull([legal].AttorneyInvoices.Amount,0) Amount,
		isnull((select case when isnull([security].[user].DisplayName,'')='' then [security].[user].DisplayName else [security].[user].UserName END Name from [security].[user] where [security].[user].Email =[legal].AttorneyInvoices.CreatedBy),'') UploadedBy  ,	
		[claim].Claim.ClaimReferenceNumber ClaimNumber, 	
		[policy].[policy].PolicyNumber, 	
		Member.DisplayName CustomerName, 
		[legal].AttorneyInvoices.LegalCareInvoiceApprovalStatusId LegalCareInvoiceApprovalStatus,
		'' DocumentPath, 
		@IsApprove IsApprove, 
		[legal].AttorneyInvoices.IsDeleted,		
		[legal].AttorneyInvoices.CreatedBy,	
		[legal].AttorneyInvoices.CreatedDate,	
		[legal].AttorneyInvoices.ModifiedBy,
		[legal].AttorneyInvoices.ModifiedDate,
		[legal].AttorneyInvoices.IsActive , 
		@RecordCount 
	from [legal].AttorneyInvoices	 
	 	Inner Join [legal].[ReferralDetails] on [legal].[ReferralDetails].Id = [legal].AttorneyInvoices.ReferralId 	
	 	Inner Join [claim].Claim on [claim].Claim.ClaimId = [legal].[ReferralDetails].ClaimId 
		Inner Join [policy].[policy] on [policy].[policy].PolicyId =[claim].Claim.PolicyId
		Inner Join [claim].PersonEvent on [claim].PersonEvent.PersonEventId =[claim].Claim.PersonEventId
		Inner Join [claim].Event  on [claim].Event.EventId = [claim].PersonEvent.EventId
		Inner Join [client].Person on [client].Person.RolePlayerId= [claim].PersonEvent.InsuredLifeId  
		Inner Join [client].RolePlayer Employee on Employee.RolePlayerId = [claim].PersonEvent.InsuredLifeId 
		Inner join [client].RolePlayer Member on Member.RolePlayerId = [claim].PersonEvent.ClaimantId 
	where 
		[legal].[ReferralDetails] .IsDeleted = 0
		and ( [claim].Claim.ClaimReferenceNumber like ('%'+ @SearchCreatia +'%') or  [policy].[policy].PolicyNumber like ('%'+ @SearchCreatia +'%')  or  Member.DisplayName like ('%'+ @SearchCreatia +'%'))  
		and [legal].AttorneyInvoices.LegalCareInvoiceApprovalStatusId = @StatusCondition and @UserRole='Recovery Legal Head' and [legal].AttorneyInvoices.IsDeleted  = 0 
		ORDER BY [legal].AttorneyInvoices.CreatedDate desc
		OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY
END
--exec [legal].[GetLegalCareRecoveryHeadTemp_DetailsList] 1622,1,100,'','','','Pending'   -- Parameters @userId  1622,  @Status Pending =1 , Approved=2 , Rejected=3