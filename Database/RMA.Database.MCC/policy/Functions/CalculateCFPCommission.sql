-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [policy].[CalculateCFPCommission](@premium float, @commissionPercentage float, @memberAge float, @commissionType varchar(32))

RETURNS float
AS
BEGIN
	declare @policyAge int
	declare @commission float
	declare @annualPremium float
	declare @commissionCalcOne float
	declare @commissionCalcTwo float
	
	set @commissionPercentage = 0.85
    set @annualPremium = @premium*12

	set @commissionCalcOne = @commissionPercentage*@annualPremium
	set @commissionCalcTwo = 0.0325*(75 - @memberAge)

	if @commissionCalcTwo >= @commissionCalcOne
		set @commission = @commissionCalcOne
	else
		set @commission = @commissionCalcTwo
	
	if @commissionType = 'SECONDARY'
		set @commission = @commission/3

	return round(@commission, 2)
	
END