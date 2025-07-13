
CREATE PROCEDURE [policy].[COIDPolicyScheduleJSONMemberDetails]
	@WizardId INT 
	AS

--Declare @WizardId INT 
--Set @WizardId = 64161 


BEGIN

DECLARE
	@jsonData NVARCHAR(MAX),
	@quoteId INT,
	@policyOwnerId INT,
	@policyOwner VARCHAR(50)
	

SELECT @jsonData = [Data] FROM bpm.Wizard WHERE Id = @WizardId

SELECT
	@quoteId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].quoteId')),
	@policyOwnerId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].policyOwnerId')),
	@policyOwner = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].policyOwner'))
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId

--print @policyOwnerId

	Select Top 1
		Company.Name as 'CompanyName',
		Company.Description as 'CompanyDescription',
		Company.ReferenceNumber,
		Company.CompensationFundReferenceNumber,
		CompanyIdType.Name as 'CompanyIdTypeId',
		Company.IdNumber as 'RegistrationNo',
		Company.VatRegistrationNo,
		Industry.Name as 'IndustryId',
		IndustryClass.Name as 'IndustryClassId',
		CompanyLevel.Name as 'CompanyLevelId',
		FinPayee.FinPayeNumber,
		RolePlayerAddress.AddressLine1,
		RolePlayerAddress.AddressLine2,
		RolePlayerAddress.PostalCode,
		RolePlayerAddress.City,
		RolePlayerAddress.Province,
		RolePlayerContact.Firstname,
		RolePlayerContact.Surname,
		RolePlayerContact.Firstname + ' ' + RolePlayerContact.Surname as 'ContactName',
		RolePlayerContact.ContactNumber
		from [client].[RolePlayer] RolePlayer
		Left Join [client].[company] Company On RolePlayer.RolePlayerId = Company.RolePlayerId
		Left Join [common].CompanyIdType CompanyIdType On Company.CompanyIdTypeId = CompanyIdType.Id
		Left Join [common].Industry Industry On Company.IndustryId = Industry.Id
		Left Join [common].[IndustryClass] IndustryClass On Company.IndustryClassId = IndustryClass.Id
		Left Join [common].[CompanyLevel] CompanyLevel On Company.CompanyLevelId = CompanyLevel.Id
		Left Join [Client].[FinPayee] FinPayee ON Company.RolePlayerId = FinPayee.RolePlayerId
		Left Join [client].[RolePlayerAddress] RolePlayerAddress On RolePlayer.RolePlayerId = RolePlayerAddress.RolePlayerId
		Left Join [client].[RolePlayerContact] RolePlayerContact On RolePlayer.RolePlayerId = RolePlayerContact.RolePlayerId
		where Company.RoleplayerId = @policyOwnerId
END