CREATE   FUNCTION [policy].[CalculateBinderFee]
(
	@premium float,
	@commissionPercentage float,
	@binderFeePercentage float
)
RETURNS float
AS BEGIN
	declare @officePremium float
	declare @binderFee float

    set @officePremium = @premium / (1 - (@commissionPercentage + @binderFeePercentage))
	set @binderFee = @officePremium * @binderFeePercentage

	return round(@binderFee, 2)

END