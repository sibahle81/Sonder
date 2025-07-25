CREATE   FUNCTION [policy].[GetBaseRate] (@jsonData nvarchar(max))
RETURNS float
AS
BEGIN
	declare @rate float
	select @rate = sum([memberRate])
	from openjson(@jsonData) with (benefits nvarchar(max) '$.benefits' as json) [memberBenefits]
	outer apply (select [memberRate] = [rate] from openjson(memberBenefits.benefits) with(rate float '$.benefitBaseRateLatest')) [memberRate]
	return isnull(@rate, 0.0)
END
