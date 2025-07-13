CREATE PROCEDURE [policy].[GetGroupPolicyPremium] (
	@baseRate decimal  (16, 10),
	@adminPercentage decimal   (8, 7),
	@commissionPercentage decimal (8, 7),
	@binderFeePercentage decimal  (8, 7)
)
as begin
	declare @premium decimal(8, 2) = [policy].[CalculateGroupPolicyPremium] (@baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage)
	declare @adminFee decimal(8, 2) = [policy].[CalculateServiceFee] (@baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage)
	declare @commission decimal(8, 2) = [policy].[CalculateCommission] (@baseRate, @commissionPercentage, @binderFeePercentage)
	declare @binderFee decimal(8, 2) = [policy].[CalculateBinderFee] (@baseRate, @commissionPercentage, @binderFeePercentage)

	select @premium [Premium],
		@adminFee [AdminFee],
		@binderFee [BinderFee],
		@commission [Commission]
end
