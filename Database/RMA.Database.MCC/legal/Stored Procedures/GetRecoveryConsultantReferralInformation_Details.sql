CREATE   Procedure [legal].[GetRecoveryConsultantReferralInformation_Details]
(
@ReferralId as int,
@RecordCount INT = 0 OUTPUT
)
AS
Begin

DECLARE @SelectCount As NVARCHAR(MAX)

SET @RecordCount = (select 
		Count (*)
from [legal].[ReferralDetails]
Inner Join [claim].Claim on [claim].Claim.ClaimId = [legal].[ReferralDetails].ClaimId 
Inner Join [policy].[policy] on [policy].[policy].PolicyId =[claim].Claim.PolicyId
Inner Join [claim].PersonEvent on [claim].PersonEvent.PersonEventId =[claim].Claim.PersonEventId
Inner Join [claim].Event  on [claim].Event.EventId = [claim].PersonEvent.EventId
Inner Join [client].Person on [client].Person.RolePlayerId= [claim].PersonEvent.InsuredLifeId  
Inner Join [client].RolePlayer Employee on Employee.RolePlayerId = [claim].PersonEvent.InsuredLifeId 
Inner join [client].RolePlayer Member on Member.RolePlayerId = [claim].PersonEvent.ClaimantId 
Left JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = Member.RolePlayerId 
Left join [common].[IndustryClass] on [common].[IndustryClass].Id = [Company].IndustryClassId 
where 
[legal].[ReferralDetails].ClaimId =  (select [legal].[ReferralDetails].ClaimId from [legal].[ReferralDetails] where [legal].[ReferralDetails].Id=@ReferralId) and [legal].[ReferralDetails].IsDeleted  = 0  )
	select 
		[legal].[ReferralDetails].Id, 
		[legal].[ReferralDetails].Id ReferralId,
		isnull([common].[IndustryClass].Name,'-') [Class] , 
		[policy].[policy].PolicyNumber,
		[claim].Event.EventDate [DateOfAccident],
		[claim].Claim.ClaimReferenceNumber ClaimNumber,		
		(select Name from common.ClaimLiabilityStatus where common.ClaimLiabilityStatus.Id=[claim].[claim].ClaimLiabilityStatusId) [LiabilityStatus],
		'' SystemReportReferal,
		cast(0.0 as decimal(18,2)) ExpensesValue, 
		[claim].Event.EventDate [DateOfReferral] ,
		[claim].Event.Description DescriptionOfAccident,
		isnull((select top(1) [legal].ActionLog.CreatedDate from [legal].ActionLog where [legal].ActionLog.ActionType ='Potential Recovery' and [legal].ActionLog.ReferralId = [legal].[ReferralDetails].Id order by 1 desc),'') DateAssessed,
		isnull([legal].[ReferralTransactionDetails].PotentialNotes,'') Comments, 
		[legal].[ReferralDetails].IsActive, 
		[legal].[ReferralDetails].IsDeleted,		
		[legal].[ReferralDetails].CreatedBy,	
		[legal].[ReferralDetails].CreatedDate,	
		[legal].[ReferralDetails].CreatedDate,
		[legal].[ReferralDetails].ModifiedBy,
		[legal].[ReferralDetails].ModifiedDate 
from [legal].[ReferralDetails]
Inner Join [claim].Claim on [claim].Claim.ClaimId = [legal].[ReferralDetails].ClaimId 
Inner Join [policy].[policy] on [policy].[policy].PolicyId =[claim].Claim.PolicyId
Inner Join [claim].PersonEvent on [claim].PersonEvent.PersonEventId =[claim].Claim.PersonEventId
Inner Join [claim].Event  on [claim].Event.EventId = [claim].PersonEvent.EventId
Inner Join [client].Person on [client].Person.RolePlayerId= [claim].PersonEvent.InsuredLifeId  
Inner Join [client].RolePlayer Employee on Employee.RolePlayerId = [claim].PersonEvent.InsuredLifeId  
Inner join [client].RolePlayer Member on Member.RolePlayerId = [claim].PersonEvent.ClaimantId  
Left JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = Member.RolePlayerId 
Left join [common].[IndustryClass] on [common].[IndustryClass].Id = [Company].IndustryClassId 
Left Join [legal].[ReferralTransactionDetails] on [legal].[ReferralTransactionDetails].ReferralId = [legal].[ReferralDetails].Id 
where   
[legal].[ReferralDetails].ClaimId =  (select [legal].[ReferralDetails].ClaimId from [legal].[ReferralDetails] where [legal].[ReferralDetails].Id=@ReferralId)  and [legal].[ReferralDetails].IsDeleted  = 0 
END

--exec [legal].[GetRecoveryConsultantReferralInformation_Details] 6  --( 31445 = ClaimId) 