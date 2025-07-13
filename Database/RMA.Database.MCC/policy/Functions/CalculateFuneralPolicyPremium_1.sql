CREATE   FUNCTION [policy].[CalculateFuneralPolicyPremium] (
	@baseRate decimal  (16, 10),
	@adminPercentage decimal   (8, 7),
	@commissionPercentage decimal (8, 7),
	@binderFeePercentage decimal  (8, 7)
)
returns money
as begin
	declare @officePremium money = round([policy].[CalculateOfficePremium](@baseRate, @commissionPercentage, @binderFeePercentage), 2)
	declare @adminFee money = @officePremium * @adminPercentage
	return @officePremium + @adminFee
end