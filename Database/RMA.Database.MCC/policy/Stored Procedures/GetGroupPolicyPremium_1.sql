CREATE PROCEDURE [policy].[GetGroupPolicyPremium] (
	@baseRate decimal  (16, 10),
	@adminPercentage decimal   (8, 7),
	@commissionPercentage decimal (8, 7),
	@binderFeePercentage decimal  (8, 7),
	@premiumAdjustmentPercentage decimal  (18, 10) = 0
)
as begin

	/*
	
	DO NOT ADJUST THE BASE PREMIUM HERE, IT IS ALSO ADJUSTED 
	IN [policy].[CalculateGroupPolicyPremium] !!!

	--BEGIN Apply Premium Adjustment 
	IF (@premiumAdjustmentPercentage <> 0)
	BEGIN	
		SET @baseRate = @baseRate + (@baseRate * @premiumAdjustmentPercentage);
	END
	--END Apply Premium Adjustment
	*/

	declare @premium decimal(8, 2) = [policy].[CalculateGroupPolicyPremium] (@baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage, @premiumAdjustmentPercentage)
	declare @adminFee decimal(8, 2) = [policy].[CalculateServiceFee] (@baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage)
	declare @commission decimal(8, 2) = [policy].[CalculateCommission] (@baseRate, @commissionPercentage, @binderFeePercentage)
	declare @binderFee decimal(8, 2) = [policy].[CalculateBinderFee] (@baseRate, @commissionPercentage, @binderFeePercentage)

	select	@premium [Premium],
			@adminFee [AdminFee],
			@binderFee [BinderFee],
			@commission [Commission]
end
