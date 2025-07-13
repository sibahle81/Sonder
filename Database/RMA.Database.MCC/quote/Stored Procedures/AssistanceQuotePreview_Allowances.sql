CREATE PROCEDURE [quote].[AssistanceQuotePreview_Allowances]
	@WizardId INT,
	@QuoteNumber NVARCHAR(50)
	AS
BEGIN
--Declare @WizardId INT ,
--	@QuoteNumber NVARCHAR(50)

--Set @WizardId = 54251
--Set @QuoteNumber = 'QT202209-00558'
DECLARE
	@jsonData NVARCHAR(MAX),  
	@policyId INT,
    @Code VARCHAR(50),       
	@ClientType INT,
    @ReceivedDate DATETIME,
    @IndustryClassId INT,
    @RolePlayerId INT,
    @DisplayName VARCHAR(50),
    @LeadStatus INT,
    @LeadSource INT,
    @CompanyName VARCHAR(50),
    @ContactName VARCHAR(50),
    @CommunicatonTypeValue VARCHAR(100),
    @IsPreferred BIT,
    @ProductId INT,
    @ProductOptionId INT,
    @QuoteID INT,
    @QuoteNo VARCHAR(50),
    @QuoteStatusId INT,
    @AverageEmployeeCount INT,
    @AverageEarnings Decimal(18,2),
    @Premium Decimal(18,2),
    @Rate Decimal(18,2),
    @CategoryInsuredId INT,
	@AllowanceTypeId INT,
	@Allowance Decimal(18,2),
	@ProductName VARCHAR(50),
	@ProductOptionName VARCHAR(50)

  SELECT
   @policyId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].policyId')),
   @Code = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].code')),
   @ClientType = CONVERT(INT, json_value(WIZARD.[Data], '$[0].clientType')),
   @ReceivedDate = CONVERT(DATETIME, json_value(WIZARD.[Data], '$[0].receivedate')),
   @IndustryClassId = CONVERT(int, json_value(WIZARD.[Data], '$[0].company.industryClassId')),
   @RolePlayerId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].rolePlayerId')),
   @DisplayName = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].displayName')),
   @LeadStatus = CONVERT(INT, json_value(WIZARD.[Data], '$[0].leadClientStatus')),
   @LeadSource = CONVERT(INT, json_value(WIZARD.[Data], '$[0].leadSource')),
   @CompanyName = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].company.name')),
   @ContactName = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].contacts[0].name')),
   @CommunicatonTypeValue = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].contacts[0].communicationTypeValue')),
   @isPreferred = CONVERT(BIT, json_value(WIZARD.[Data], '$[0].contacts[0].isPreferred')),
   @ProductId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].leadProducts[0].productId')),
   @ProductOptionId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].leadProducts[0].productOptionId')),
   @QuoteId = CONVERT(INT, json_value(WIZARD.[Data], '$[0].leadProducts[0].quoteId')),
   @QuoteNo = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].leadProducts[0].quote.quoteNumber')),
   @QuoteStatusId = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].leadProducts[0].quote.quoteStatusId')),
   @AverageEmployeeCount = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].leadProducts[0].quote.averageEmployeeCount')),
   @AverageEarnings = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].leadProducts[0].quote.averageEarnings')),
   @Premium = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].leadProducts[0].quote.premium')),
   @Rate = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].leadProducts[0].quote.rate')),
   @CategoryInsuredId = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].leadProducts[0].quote.categoryInsured')),
   @AllowanceTypeId = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].allowanceType')),
   @Allowance = CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].allowance'))
	
  FROM [bpm].[Wizard] WIZARD
  WHERE WIZARD.[Id] = @WizardId
  AND (CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].leadProducts[0].quote.quoteNumber')) = @QuoteNumber 
		OR CONVERT(VARCHAR, json_value(WIZARD.[Data], '$[0].leadProducts[0].quote.quoteNumber')) = @QuoteNumber)

SELECT @ProductName = [Name] from [Product].[Product] Where Id = @ProductId
SELECT @ProductOptionName = [Name] from [Product].[ProductOption] Where Id = @ProductOptionId

SELECT
	@policyId as policyId,
    @Code as Code,       
	@ClientType as ClientType,
    @ReceivedDate as ReceivedDate,
    @IndustryClassId as IndustryClassId,
    @RolePlayerId as RolePlayerId,
    @DisplayName as DisplayName,
    @LeadStatus as LeadStatus,
    @LeadSource as LeadSource,
    @CompanyName as CompanyName,
    @ContactName as ContactName,
    @CommunicatonTypeValue as CommunicatonTypeValue,
    @IsPreferred as IsPreferred,
    @ProductId as ProductId,
    @ProductOptionId as ProductOptionId,
    @QuoteID as QuoteId,
    @QuoteNo as QuoteNumber,
    @QuoteStatusId as QuoteStatusId,
    @AverageEmployeeCount as AverageEmployeeCount,
    @AverageEarnings as AverageEarnings,
    @Premium as Premium,
    @Rate as Rate,
    @CategoryInsuredId as CategoryInsuredId,
	@AllowanceTypeId as AllowanceTypeId,
	@Allowance as Allowance,
	@ProductOptionName as ProductOptionName,
	@ProductName as ProductName
END