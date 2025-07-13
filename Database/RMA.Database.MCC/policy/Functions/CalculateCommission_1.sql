CREATE   FUNCTION [policy].[CalculateCommission]
(
	@premium float,
	@commissionPercentage float,
	@binderFeePercentage float
)
RETURNS float
AS BEGIN
	declare @officePremium float
	declare @commission float

    set @officePremium = @premium / (1 - (@commissionPercentage + @binderFeePercentage))
	set @commission = @officePremium * @commissionPercentage

	return round(@commission, 2)

END