
CREATE PROCEDURE [policy].[ExpenseBasedPolicyScheduleJSONCoverDetails]
	@WizardId INT 
	AS

--Declare @WizardId INT 
--Set @WizardId = 54439 --46941 


BEGIN

DECLARE
	@jsonData NVARCHAR(MAX)

	create table #QuoteData
	(
		productOptionId INT
	)

	insert into #QuoteData
	select 
		productOptionName = PO.Id
	FROM [bpm].[Wizard] WIZARD
	inner join product.ProductOption PO
	on PO.Id = json_value(WIZARD.[Data], '$[0].quote.productOptionId')
	WHERE WIZARD.[Id] = @WizardId

	SELECT @jsonData = [Data] FROM bpm.Wizard WHERE Id = @WizardId
	insert into #QuoteData
	select
		PO.Id
    FROM OpenJson(@jsonData, '$[0].quote.dependentQuotes')
	with(
	productOptionId		varchar(50)        '$.quote.productOptionId'
) as JsonData 
	inner join product.ProductOption PO
	on PO.Id = JsonData.productOptionId

	select [B].id,
	[B].[Name] as 'BenefitName',
	[B].Code,
	[B].StartDate,
	[B].EndDate,
	[B].ProductId,
	[B].BenefitTypeId,
	[B].CoverMemberTypeId,
	[BenefitType].[Name] as 'BenefitTypeName',
	[CoverMemberType].[Name] as 'CoverMemberType'
	from product.Benefit [B]
	inner join product.ProductOptionBenefit [POB] ON [POB].BenefitId = [B].id
	inner join #QuoteData [QD] on [QD].productOptionId = [POB].ProductOptionId
	Inner Join [common].[BenefitType] BenefitType On [B].BenefitTypeId = BenefitType.Id
	Inner Join [common].[CoverMemberType] CoverMemberType On [B].CoverMemberTypeId = CoverMemberType.Id
	WHERE [B].EndDate >= GETDATE()
	
	drop table #QuoteData

END