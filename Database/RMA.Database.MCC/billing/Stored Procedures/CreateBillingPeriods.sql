-- =============================================
-- Author:		Ryan Maree
-- Create date: 2020/09/07
-- EXEC [billing].[CreateBillingPeriods]
-- =============================================
CREATE PROCEDURE [billing].[CreateBillingPeriods]
AS
BEGIN  
	DECLARE @StartDate DATE
	DECLARE @EndDate DATE
	DECLARE @Count INT = 12
	DECLARE @InitialDate DATE = (SELECT TOP 1 EndDate FROM common.Period ORDER BY 1 DESC)

	declare @result int = 0

	WHILE @Count > 0 BEGIN
		SET @StartDate = (SELECT DATEADD(DAY, 1, @InitialDate))
		SET @EndDate = (SELECT EOMONTH(DATEADD(MONTH, 1, @InitialDate)))

		INSERT INTO common.Period 
		VALUES (@StartDate, @EndDate, 'Future',1,0,'system@randmutual.co.za', GETDATE(), 'system@randmutual.co.za', GETDATE())

		SET @InitialDate = (SELECT TOP 1 EndDate FROM common.Period ORDER BY 1 DESC)
		SET @Count = @Count - 1
		SET @result = @result + 1
	END

	select @result [Count]
END
