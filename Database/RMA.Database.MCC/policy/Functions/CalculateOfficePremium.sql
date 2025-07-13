CREATE FUNCTION [policy].[CalculateOfficePremium] (
	@baseRate decimal  (16, 10),
	@commission decimal (8, 7),
	@binderFee decimal  (8, 7)
)
returns money
as begin
	declare @officePremium money = @baseRate / (1 - (@commission + @binderFee))
	return @officePremium
end
