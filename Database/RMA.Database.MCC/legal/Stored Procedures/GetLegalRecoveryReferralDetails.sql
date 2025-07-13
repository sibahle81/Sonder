CREATE   Procedure [legal].[getLegalRecoveryReferralDetails]
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
Declare @StatusCondition as int =  (select common.LegalCareReferralStatus.Id from common.LegalCareReferralStatus where common.LegalCareReferralStatus.Name =@Status ) 

SET @UserRole = (select [security].Role.Name From [security].[User] 
	inner join [security].Role on [security].Role.Id = [security].[User].RoleId where [security].[User].Id=@userId)
	
SET @SelectCount = (select 
		Count (*)
	from 
		[legal].[ReferralDetails] 
		Inner Join [claim].Claim on [claim].Claim.ClaimId = [legal].[ReferralDetails].ClaimId 
		Inner Join [policy].[policy] on [policy].[policy].PolicyId =[claim].Claim.PolicyId
		Inner Join [claim].PersonEvent on [claim].PersonEvent.PersonEventId =[claim].Claim.PersonEventId
		Inner Join [claim].Event  on [claim].Event.EventId = [claim].PersonEvent.EventId
		Inner Join [client].Person on [client].Person.RolePlayerId= [claim].PersonEvent.InsuredLifeId  
		Inner Join [client].RolePlayer Employee on Employee.RolePlayerId = [claim].PersonEvent.InsuredLifeId 
		Inner join [client].RolePlayer Member on Member.RolePlayerId = [claim].PersonEvent.ClaimantId 
		left join [legal].ReferralTransactionDetails on [legal].ReferralTransactionDetails.ReferralId =[legal].[ReferralDetails].Id 
		where 
			[legal].[ReferralDetails].IsDeleted = 0 
			and  ( [claim].Claim.ClaimReferenceNumber like ('%'+ @SearchCreatia +'%') or [policy].[policy].PolicyNumber like ('%'+ @SearchCreatia +'%')  or  Member.DisplayName like ('%'+ @SearchCreatia +'%')) 
			and 	(
		 (@UserRole = 'Recovery Admin') 
		 Or
		 (@UserRole = 'Recovery Consultant' and [legal].[ReferralDetails].AssignId = @userId )
		)
			and [legal].[ReferralDetails].LegalCareReferralStatusId = @StatusCondition)		

SET @RecordCount = (select 
		Count (*)
	from 
		[legal].[ReferralDetails] 
		Inner Join [claim].Claim on [claim].Claim.ClaimId = [legal].[ReferralDetails].ClaimId 
		Inner Join [policy].[policy] on [policy].[policy].PolicyId =[claim].Claim.PolicyId
		Inner Join [claim].PersonEvent on [claim].PersonEvent.PersonEventId =[claim].Claim.PersonEventId
		Inner Join [claim].Event  on [claim].Event.EventId = [claim].PersonEvent.EventId
		Inner Join [client].Person on [client].Person.RolePlayerId= [claim].PersonEvent.InsuredLifeId  
		Inner Join [client].RolePlayer Employee on Employee.RolePlayerId = [claim].PersonEvent.InsuredLifeId 
		Inner join [client].RolePlayer Member on Member.RolePlayerId = [claim].PersonEvent.ClaimantId 
		left join [legal].ReferralTransactionDetails on [legal].ReferralTransactionDetails.ReferralId =[legal].[ReferralDetails].Id 
		where 
			[legal].[ReferralDetails].IsDeleted = 0 
			and  ( [claim].Claim.ClaimReferenceNumber like ('%'+ @SearchCreatia +'%') or [policy].[policy].PolicyNumber like ('%'+ @SearchCreatia +'%')  or  Member.DisplayName like ('%'+ @SearchCreatia +'%')) 
			and 	(
		 (@UserRole = 'Recovery Admin') 
		 Or
		 (@UserRole = 'Recovery Consultant' and [legal].[ReferralDetails].AssignId = @userId )
		)		
			and [legal].[ReferralDetails].LegalCareReferralStatusId = @StatusCondition)
		
	select 
		[legal].[ReferralDetails].Id ,
		[legal].[ReferralDetails].Id ReferralId,
		[legal].[ReferralDetails].ClaimId,
		[claim].Claim.ClaimReferenceNumber ClaimNumber, 	
		[policy].[policy].PolicyNumber, 	
		Member.DisplayName CustomerName, 	
		[legal].[ReferralDetails].Date,	
		[legal].[ReferralDetails].LegalCareReferralStatusId LegalCareReferralStatus,
		[legal].[ReferralDetails].AssignId ,		
		isnull((select case when isnull([security].[user].UserName ,'')='' then [security].[user].DisplayName  else [security].[user].UserName END from [security].[user]  where id = [legal].[ReferralDetails].AssignId),'--') AssignedName,
		[legal].[ReferralDetails].IsDeleted,		
		[legal].[ReferralDetails].CreatedBy,	
		[legal].[ReferralDetails].CreatedDate,	
		[legal].[ReferralDetails].ModifiedBy,
		[legal].[ReferralDetails].ModifiedDate,
		[legal].[ReferralDetails].IsAcknowledge,		
		[legal].[ReferralDetails].IsActive , 
		@RecordCount
	from 
	[legal].[ReferralDetails] 
	Inner Join [claim].Claim on [claim].Claim.ClaimId = [legal].[ReferralDetails].ClaimId 
	Inner Join [policy].[policy] on [policy].[policy].PolicyId =[claim].Claim.PolicyId
	Inner Join [claim].PersonEvent on [claim].PersonEvent.PersonEventId =[claim].Claim.PersonEventId
	Inner Join [claim].Event  on [claim].Event.EventId = [claim].PersonEvent.EventId
	Inner Join [client].Person on [client].Person.RolePlayerId= [claim].PersonEvent.InsuredLifeId  
	Inner Join [client].RolePlayer Employee on Employee.RolePlayerId = [claim].PersonEvent.InsuredLifeId  
	Inner join [client].RolePlayer Member on Member.RolePlayerId = [claim].PersonEvent.ClaimantId 
	left join [legal].ReferralTransactionDetails on [legal].ReferralTransactionDetails.ReferralId =[legal].[ReferralDetails].Id  
	
	where 
		[legal].[ReferralDetails].IsDeleted = 0 
		and ( [claim].Claim.ClaimReferenceNumber like ('%'+ @SearchCreatia +'%') or [policy].[policy].PolicyNumber like ('%'+ @SearchCreatia +'%') or Member.DisplayName like ('%'+ @SearchCreatia +'%')) 
		and  
		(
		 (@UserRole = 'Recovery Admin') 
		 Or
		 (@UserRole = 'Recovery Consultant' and [legal].[ReferralDetails].AssignId = @userId )
		)
		and [legal].[ReferralDetails].LegalCareReferralStatusId = @StatusCondition 
        Order by case when [legal].[ReferralDetails].LegalCareReferralStatusId = 3 then [legal].ReferralTransactionDetails.ModifiedDate else [legal].[ReferralDetails].Id END DESC   		
        OFFSET (@PageNumber+-1)* @RowsOfPage
		ROW FETCH NEXT @RowsOfPage ROWS ONLY
END

--exec [legal].[GetLegalRecoveryReferralDetails] 1620,1,10,'','','','ongoing'   -- Parameter @Status   Open = 1 ,Pending = 2 ,Ongoing = 3, Closed = 4
--exec [legal].[GetLegalRecoveryReferralDetails] 1620,1,10,'','','','open'   -- Parameter @Status   Open = 1 ,Pending = 2 ,Ongoing = 3, Closed = 4