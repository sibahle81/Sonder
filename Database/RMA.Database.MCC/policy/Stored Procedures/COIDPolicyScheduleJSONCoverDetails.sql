
CREATE PROCEDURE [policy].[COIDPolicyScheduleJSONCoverDetails]
	@WizardId INT 
	AS

--Declare @WizardId INT 
--Set @WizardId = 64043 --46941 


BEGIN

DECLARE
	@jsonData NVARCHAR(MAX),
	@quoteId INT,
	@policyOwnerId INT,
	@productId INT,
	@productOptionId INT
	

SELECT @jsonData = [Data] FROM bpm.Wizard WHERE Id = @WizardId

SELECT
	@quoteId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].quoteId')),
	@policyOwnerId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].policyOwnerId')),
	@productId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].quote.productId')),
	@productOptionId = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].quote.productOptionId'))
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId

	select 
		Benefit.Id,Benefit.Name as 'BenefitName',Code,StartDate,EndDate,ProductId,BenefitTypeId,CoverMemberTypeId,
		BenefitType.Name as 'BenefitTypeName',
		CoverMemberType.Name as 'CoverMemberType'
		from [product].[Benefit] Benefit
		Inner Join [common].[BenefitType] BenefitType On Benefit.BenefitTypeId = BenefitType.Id
		Inner Join [common].[CoverMemberType] CoverMemberType On Benefit.CoverMemberTypeId = CoverMemberType.Id
		where productId = @productId AND EndDate >= GETDATE()

END