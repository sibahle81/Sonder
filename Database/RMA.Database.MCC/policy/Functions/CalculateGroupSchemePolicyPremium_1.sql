
CREATE   FUNCTION [policy].[CalculateGroupSchemePolicyPremium] (
	@baseRate decimal  (16, 10),
	@adminPercentage decimal   (8, 7),
	@commissionPercentage decimal (8, 7),
	@binderFeePercentage decimal  (8, 7),
	@premiumAdjustmentPercentage decimal  (18, 10) = 0
)
returns money
as begin

	--BEGIN Apply Premium Adjustment 
	IF (@premiumAdjustmentPercentage <> 0) BEGIN	
		SET @baseRate = @baseRate + (@baseRate * @premiumAdjustmentPercentage);
	END
	--END Apply Premium Adjustment

	declare @premium money = [policy].[CalculateFuneralPolicyPremium] (@baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage)
	return round(@premium, 2)
end