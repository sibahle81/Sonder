CREATE   PROCEDURE [claim].[USP_GetClaimInjuryDetailsForSTPIntegration]
      @claimReferenceNumber NVARCHAR(200)
AS
BEGIN

DECLARE @personEventId INT
SET @personEventId = (SELECT PersonEventID FROM [compcare].[claim] WHERE FileRefNumber = @claimReferenceNumber)
                             
SELECT i.InjuryID AS InjuryId,i.PhysicalDamageID AS PhysicalDamageId,i.ICD10CodeID AS Icd10CodeId,icd.ICD10Code AS Icd10Code,icd.ICD10DiagnosticGroupID AS ICD10DiagnosticGroupId,icd.ICD10SubCategoryID AS ICD10CategoryId,
CAST(1 AS BIT) AS IsPrimary,drg.Code AS ICD10DiagnosticGroupCode,cat.Code AS ICD10CategoryCode
FROM [compcare].[PhysicalDamage] AS phy
INNER JOIN [compcare].[Injury] AS i
ON  phy.PhysicalDamageID = i.PhysicalDamageID
LEFT JOIN [compcare].[SecondaryInjury] AS seci
ON i.InjuryID = seci.InjuryID
INNER JOIN [medical].[CompCareICD10Code] AS icd
ON i.ICD10CodeID = icd.ICD10CodeID
INNER JOIN [medical].[CompCareICD10DiagnosticGroup] AS drg
ON drg.ICD10DiagnosticGroupId = icd.ICD10DiagnosticGroupId
INNER JOIN [medical].[CompCareICD10SubCategory] AS subCat
ON subCat.ICD10SubCategoryId = icd.ICD10SubCategoryId
INNER JOIN [medical].[CompCareICD10Category] AS cat
ON cat.ICD10CategoryId = subCat.ICD10CategoryId
WHERE phy.PersONEventID = @personEventId

UNION

SELECT seci.InjuryID AS InjuryId,i.PhysicalDamageID AS PhysicalDamageId,seci.ICD10CodeID AS Icd10CodeId,icd.ICD10Code AS Icd10Code,icd.ICD10DiagnosticGroupID AS ICD10DiagnosticGroupId,icd.ICD10SubCategoryID AS ICD10CategoryId,
CAST(0 AS BIT) AS IsPrimary,drg.Code AS ICD10DiagnosticGroupCode,cat.Code AS ICD10CategoryCode
FROM [compcare].[PhysicalDamage] AS phy
INNER JOIN [compcare].[Injury] AS i
ON  phy.PhysicalDamageID = i.PhysicalDamageID
RIGHT JOIN [compcare].[SecondaryInjury] AS seci
ON i.InjuryID = seci.InjuryID
INNER JOIN [medical].[CompCareICD10Code] AS icd
ON i.ICD10CodeID = icd.ICD10CodeID
INNER JOIN [medical].[CompCareICD10DiagnosticGroup] AS drg
ON drg.ICD10DiagnosticGroupId = icd.ICD10DiagnosticGroupId
INNER JOIN [medical].[CompCareICD10SubCategory] AS subCat
ON subCat.ICD10SubCategoryId = icd.ICD10SubCategoryId
INNER JOIN [medical].[CompCareICD10Category] AS cat
ON cat.ICD10CategoryId = subCat.ICD10CategoryId
WHERE phy.PersONEventID = @personEventId



END
