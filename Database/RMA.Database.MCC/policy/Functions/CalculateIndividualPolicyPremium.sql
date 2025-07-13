CREATE FUNCTION [policy].[CalculateIndividualPolicyPremium] (
	@baseRate decimal  (16, 10),
	@adminPercentage decimal   (8, 7),
	@commissionPercentage decimal (8, 7),
	@binderFeePercentage decimal  (8, 7)
)
returns money
as begin
	declare @premium money = [policy].[CalculateFuneralPolicyPremium] (@baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage)
	return round(@premium, 2)
end
