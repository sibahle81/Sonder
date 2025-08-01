-- =============================================
-- Author:		Ryan Maree
-- Create date: 2020/09/07
-- EXEC [billing].[RollBillingPeriod] 0 //CLEAN ROLL OVER WILL MOVE THE BILLING PERIOD FORWARD AND CLOSE LATEST IF LATEST IS OPEN
-- EXEC [billing].[RollBillingPeriod] 1 //CONCURRENT ROLL OVER WILL KEEP THE CURRENT PERIOD OPEN AND OPEN A LATEST PERIOD
-- =============================================
CREATE PROCEDURE [billing].[RollBillingPeriod]
	@RunPeriodConcurrently BIT
AS
BEGIN  
DECLARE @CurrentPeriodId INT = (SELECT Id FROM common.Period WHERE [Status] = 'Current')

IF (@RunPeriodConcurrently = 0)
BEGIN
	UPDATE common.Period
	SET [Status] = 'History'
	WHERE Id = (@CurrentPeriodId)

	UPDATE common.Period
	SET [Status] = 'Current'
	WHERE Id = (@CurrentPeriodId + 1)
END

IF (@RunPeriodConcurrently = 1)
BEGIN
	UPDATE common.Period
	SET [Status] = 'Latest'
	WHERE Id = (@CurrentPeriodId + 1)
END
END
