CREATE FUNCTION [policy].[CalculateServiceFee]
(
	@premium float,
    @adminPercentage float,
	@commissionPercentage float,
	@binderFeePercentage float
)
RETURNS float
AS BEGIN
	declare @officePremium float
	declare @adminFee float

    set @officePremium = @premium / (1 - (@commissionPercentage + @binderFeePercentage))
	set @adminFee = @officePremium * @adminPercentage

	return round(@adminFee, 2)

END
