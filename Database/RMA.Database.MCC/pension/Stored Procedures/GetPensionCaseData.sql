


CREATE     PROCEDURE [pension].[GetPensionCaseData] @pensionId int
AS
BEGIN

select p.PensionCaseId,
p.PensionCaseStatusId,
p.BenefitTypeId as 'BenefitType',
p.PensionCaseNumber,
p.PdPercentage,
p.EstimatedCV,
p.Caa,
p.VerifiedCV
from [pension].[PensionCase] p
where p.PensionCaseId=@pensionId
and p.IsDeleted=0
END