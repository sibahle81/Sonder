CREATE FUNCTION [policy].[CalculateGroupPolicyPremium] (
	@baseRate decimal  (16, 10),
	@adminPercentage decimal   (8, 7),
	@commissionPercentage decimal (8, 7),
	@binderFeePercentage decimal  (8, 7)
)
returns money
as begin
	declare @premium money = [policy].[CalculateFuneralPolicyPremium] (@baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage)
	-- If premium ends in multiple of 5, return the premium rounded to 2 decimal places.
	-- This will not influence the premium if it is a multiple of 10.
	if ((@premium * 10.0) % 5 = 0.0) begin
		set @premium = round(@premium, 2)
	end else begin
		set @premium = round(@premium, 2)
	end
	return @premium
end
