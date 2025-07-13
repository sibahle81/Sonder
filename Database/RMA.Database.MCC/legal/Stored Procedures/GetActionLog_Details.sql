CREATE   Procedure [legal].[getActionLog_Details]
(
@LegalReferralId as Int,
@LegalModuleId As int,
@RecordCount INT = 0 OUTPUT
)
AS
Begin

DECLARE @SelectCount As NVARCHAR(MAX)

SET @SelectCount = (select 
		Count (*)
	from 
	 [legal].[ActionLog]
	where 
	[legal].[ActionLog].IsDeleted = 0
		and [legal].[ActionLog].ReferralId= @LegalReferralId
		and [legal].[ActionLog].ModuleId= @LegalModuleId)

SET @RecordCount = (select 
		Count (*)
	from 
	 [legal].[ActionLog]
	where 
	[legal].[ActionLog].IsDeleted = 0
		and [legal].[ActionLog].ReferralId= @LegalReferralId
		and [legal].[ActionLog].ModuleId= @LegalModuleId )

	select 
		[legal].[ActionLog].Id,			
		[legal].[ActionLog].ReferralId,
		[legal].[ActionLog].Title,		
		[legal].[ActionLog].Comment,				
		(select case when isnull([security].[user].DisplayName,'')='' then [security].[user].DisplayName else [security].[user].UserName END Name from [security].[user] where [security].[user].Email =[legal].[ActionLog].AddedByUser) AddedByUser  ,
		[legal].[ActionLog].AddedByUser, 
		[legal].[ActionLog].Date,
		[legal].[ActionLog].Time,
		[legal].[ActionLog].ModuleId,
		[legal].[ActionLog].ActionType,
		[legal].[ActionLog].CustomerName,
		[legal].[ActionLog].IsDeleted,		
		[legal].[ActionLog].CreatedBy,	
		[legal].[ActionLog].CreatedDate,	
		[legal].[ActionLog].ModifiedBy,
		[legal].[ActionLog].ModifiedDate--,
		,[legal].[ActionLog].IsActive
		,@RecordCount
	from 
	[legal].[ActionLog] 
	where 
		[legal].[ActionLog].IsDeleted = 0
		and [legal].[ActionLog].ReferralId= @LegalReferralId
		and [legal].[ActionLog].ModuleId= @LegalModuleId
		Order by [legal].[ActionLog].CreatedDate  Desc
END

--exec [legal].[GetActionLog_Details] 102,3  --( @LegalReferralId, @LegalModuleId  2 = ReffralId,  (module name is : 1  Recovery, 2  Collection,3  Tribunal))
----exec [legal].[GetActionLog_Details] 2,'RecoveryAdminActionLog'  --( 1 = ReffralId,  (module name is : RecoveryLegalHeadActionLog,RecoveryConsultantActionLog,CollectionsLegalAdmonActionLog,TribunalLegalSecretaryActionLog,TribunalLegalAdvisorActionLog))