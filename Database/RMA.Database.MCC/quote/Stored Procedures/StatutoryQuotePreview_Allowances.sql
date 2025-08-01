﻿CREATE PROCEDURE [quote].[StatutoryQuotePreview_Allowances]
	@WizardId INT ,
	@QuoteNumber NVARCHAR(50)
	AS
BEGIN
-- EXEC [quote].[StatutoryQuotePreview] 54219, 'QT202209-00553'
--DECLARE
--	@WizardId INT,
--	@QuoteNumber NVARCHAR(50)

--Set @WizardId = 54219
--Set @QuoteNumber = 'QT202209-00553'

DECLARE @JSONData AS NVARCHAR(MAX)
SELECT @JSONData =WIZARD.[Data] 
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId

	DECLARE   @QUOTEDATA TABLE (
              LeadId INT,
              Code VARCHAR(50),
              ClientType INT,
              ReceivedDate DATETIME,
              IndustryClassId INT,
              RolePlayerId INT,
              DisplayName VARCHAR(50),
              LeadStatus INT,
              LeadSource INT,
              CompanyName NVARCHAR(50),
              ContactName NVARCHAR(50),
              CommunicatonTypeValue NVARCHAR(100),
              IsPreferred BIT,
              Notes NVARCHAR(MAX),
              ProductId INT,
              ProductOptionId INT,
              QuoteID INT,
              QuoteNumber NVARCHAR(50),
              QuoteStatusId INT,
              AverageEmployeeCount INT,
              AverageEarnings Decimal(18,2),
              Premium Decimal(18,2),
              Rate Decimal(18,2),
              CategoryInsuredId INT,
			  AllowanceTypeId INT,
			  Allowance Decimal(18,2))

       INSERT INTO @QUOTEDATA (LeadId,Code,ClientType,ReceivedDate,IndustryClassId,RolePlayerId,DisplayName,LeadStatus,LeadSource,CompanyName,ContactName,CommunicatonTypeValue,IsPreferred,Notes,
                               ProductId,ProductOptionId,QuoteID,QuoteNumber,QuoteStatusId,AverageEmployeeCount,AverageEarnings,Premium,Rate,CategoryInsuredId,AllowanceTypeId,Allowance)


	SELECT
		JSON_Value (c.value, '$.leadId') as LeadId, 
		JSON_Value (c.value, '$.code') as Code,
		JSON_Value (c.value, '$.clientType') as ClientType,
		JSON_Value (c.value, '$.receivedDate') as ReceivedDate,
		JSON_Value (c.value, '$.company.industryClassId') as IndustryClassId,
		JSON_Value (c.value, '$.rolePlayerId') as RolePlayerId,
		JSON_Value (c.value, '$.displayName') as DisplayName,
		JSON_Value (c.value, '$.leadClientStatus') as LeadStatus,
		JSON_Value (c.value, '$.leadSource') as LeadSource,
		JSON_Value (c.value, '$.company.name') as CompanyName,

		JSON_Value (p.value, '$.name') as ContactName,
		JSON_Value (p.value, '$.communicationTypeValue') as CommunicatonTypeValue,
		JSON_Value (p.value, '$.isPreferred') as IsPreferred,

		JSON_Value (n.value, '$.note') as Notes,

		JSON_Value (l.value, '$.productId') as ProductId,
		JSON_Value (l.value, '$.productOptionId') as ProductOptionId,
		JSON_Value (l.value, '$.quote.quoteId') as QuoteId,
		JSON_Value (l.value, '$.quote.quoteNumber') as QuoteNumber,
		JSON_Value (l.value, '$.quote.quoteStatusId') as QuoteStatusId,

		JSON_Value (l.value, '$.quote.averageEmployeeCount') as AverageEmployeeCount,
		JSON_Value (l.value, '$.quote.averageEarnings') as AverageEarnings,
		JSON_Value (l.value, '$.quote.premium') as Premium,
		JSON_Value (l.value, '$.quote.rate') as Rate,
		JSON_Value (l.value, '$.quote.categoryInsured') as CategoryInsuredId,

		JSON_Value (qa.value, '$.allowanceType') as AllowanceTypeId,
		JSON_Value (qa.value, '$.allowance') as Allowance
	FROM OPENJSON (@JSONData, '$') as c
	CROSS APPLY OPENJSON (c.value, '$.contacts') as p
	CROSS APPLY OPENJSON (c.value, '$.notes') as n
	CROSS APPLY OPENJSON (c.value, '$.leadProducts') as l
	CROSS APPLY OPENJSON (l.value, '$.quote.quoteAllowances') as qa

	SELECT [QuoteData].*,
	[ProductOption].[Name] AS ProductOptionName,
	[QuoteStatus].[Name] AS QuoteStatus,
	[AllowanceType].[Name] AS AllowanceType
	FROM @QUOTEDATA [QuoteData]
	INNER JOIN [product].[Product] [Product] On [QuoteData].ProductId = [Product].Id
	INNER JOIN [product].[ProductOption] [ProductOption] On [QuoteData].ProductoptionID = [ProductOption].ID
	INNER JOIN [common].[CategoryInsured] [CategoryInsured] On [QuoteData].CategoryInsuredId = [CategoryInsured].Id
	INNER JOIN [common].[QuoteStatus] [QuoteStatus] On [QuoteData].QuoteStatusId = [QuoteStatus].Id
	INNER JOIN [common].[clientType] [ClientType] On [QuoteData].ClientType = [ClientType].Id
	INNER JOIN [common].AllowanceType [AllowanceType] On AllowanceType.Id = [QuoteData].AllowanceTypeId
	WHERE [QuoteData].QuoteNumber = @QuoteNumber
END