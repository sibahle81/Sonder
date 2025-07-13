CREATE FUNCTION [policy].[GetEuropAssistFee] (@commissionPercentage decimal(5,4)) RETURNS decimal(12, 2)
as begin

	DECLARE @EuropAssistRMAPremium Decimal(18, 10)
    SET @EuropAssistRMAPremium = (SELECT [BasePremium] + [ProfitExpenseLoadingPremium] FROM [common].[EuropAssistPremiumMatrix] WHERE ([EndDate] > GetDate() OR [EndDate] IS NULL) AND IsDeleted = 0)

	DECLARE @EuropAssistFee Decimal(18, 10)
	SET @EuropAssistFee = (@EuropAssistRMAPremium / (1.0 - @commissionPercentage))

	return round(@EuropAssistFee, 2)

end