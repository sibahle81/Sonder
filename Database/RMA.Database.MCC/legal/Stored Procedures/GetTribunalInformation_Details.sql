

CREATE   Procedure [legal].[getTribunalInformation_Details]
(
@ObjectionId int
)
As
Begin 	
	
select
		[legal].[TribunalDetails].Id ,			
		[legal].TribunalDetails.ObjectionId ReferralId,
		'' Class,
		'' PolicyNumber,
		''  DateOfAccident,
		'' ClaimReferenceNumber,	
		'' LiabilityStatus,
		'' SystemReportReferal,
		'' ExpensesValue,
		'' DateOfReferral,
		'' DescriptionOfAccident,
		'' DateAssessed,
		'' Comments,
		CONVERT(bit, 1) AS IsActive,		
		'' IsDeleted,		
		[legal].TribunalDetails.CreatedBy,	
		[legal].TribunalDetails.CreatedDate,
		[legal].TribunalDetails.CreatedDate,	
		[legal].TribunalDetails.ModifiedBy,
		[legal].TribunalDetails.ModifiedDate	

from [client].FinPayee 
inner join [client].RolePlayer on [client].RolePlayer.RolePlayerId = [client].FinPayee.RolePlayerId 
inner join [legal].TribunalDetails on [legal].TribunalDetails.ObjectionId =[client].FinPayee.RolePlayerId
LEFT join [client].[RolePlayerAddress] on [client].[RolePlayerAddress].RolePlayerId  = [client].FinPayee .RolePlayerId 
LEFT join [client].Person on [client].Person.RolePlayerId = [client].FinPayee.RolePlayerId 
Left JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
Left join [common].[IndustryClass] on [common].[IndustryClass].Id = [Company].IndustryClassId 
LEFT join [common].[Language] on [common].[Language].Id = [client].Person.LanguageId 
Left join [common].Country on [common].Country.Id = [client].RolePlayerAddress.CountryId  
where [client].FinPayee.IsDeleted =0 
	and [client].FinPayee.RolePlayerId = @ObjectionId
order by [client].[Roleplayer].DisplayName  
END

--exec [legal].[GetTribunalInformation_Details] 1009987  --( 101 = @ObjectionId )