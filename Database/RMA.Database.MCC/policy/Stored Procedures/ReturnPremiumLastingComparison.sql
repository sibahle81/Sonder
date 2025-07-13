---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- =============================================
-- Author:		Jvz
-- Create date: 2019/12/06
-- Description:	Checks the 
-- [policy].[ReturnPremiumLastingComparison] @companyname = 'Sibanye Gold Limited', @dateTime = '2019-09-23 01:00:00' 
-- =============================================
CREATE PROCEDURE [policy].[ReturnPremiumLastingComparison]
		@CompanyName varchar(1000),
		@DateTime datetime
	 
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
	if(Select count(1) from newclient.Company Where Name = @CompanyName) <=0
	BEGIN
		Select 'No Company Found With Name' + @CompanyName  as 'Error'
		RETURN
	END


    -- Get Only the current records.
	Select [Name],Surname,IDNumber,DateofBirth,PassportNumber,Industrynumber,Company,Country,[Date] as [Date],TotalAmount,ExecutionID,FileIdentifier,[FileName],PolicyNr
		INTO #TempFuneralForCompanyAndMonth
		from Load.FuneralPremium  P 
	Where P.Company = @CompanyName
	AND  CAST(P.Date AS DATE) = CAST(@DateTime AS DATE)

	--
	Select * from #TempFuneralForCompanyAndMonth




END
