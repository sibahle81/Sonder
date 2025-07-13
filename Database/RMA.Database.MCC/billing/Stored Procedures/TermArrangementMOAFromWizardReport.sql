-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023/03/30
-- =============================================
CREATE   PROCEDURE [billing].[TermArrangementMOAFromWizardReport] --293155
    @wizardId int
	as 
	begin
     declare @json varchar(max) =(select data from bpm.Wizard where id =@wizardId)
	declare @results table (rolePlayerId int, startdate date, termMonths int,totalAmount decimal(18,2),finPayeNumber varchar(50), companyname varchar(max), isparent bit,paymentFrequencyId int, bankAccountId int);

	insert into @results(rolePlayerId, startdate, termMonths,totalAmount,finPayeNumber, companyname,paymentFrequencyId,bankAccountId)
	SELECT *
	FROM OPENJSON(@json) WITH (
    rolePlayerId INT '$.rolePlayerId',
	startDate datetime2 '$.startDate',
    termMonths int '$.termMonths',
	totalAmount decimal(18,2) '$.totalAmount',
	finPayeNumber varchar(50) '$.memberNumber',
	 companyname varchar(max) '$.memberName',
	 paymentFrequencyId int '$.paymentFrequency',
	  bankAccountId varchar(100) '$.bankAccountId'
    ) ;
	declare @paymentFrequency varchar(100) =(select [name] from  common.PaymentFrequency where id = (select paymentFrequencyId from @results))

	update @results set isparent =1
	declare @bankAccount varchar(100) = (select accountnumber from common.BankAccount where id = (select top 1 bankaccountid from @results))
	 select ta.StartDate, DATEADD(month, ta.termMonths, ta.StartDate) EndDate,ta.TotalAmount Balance, ta.FinPayeNumber,companyname , isparent , TermMonths, @paymentFrequency PaymentFrequency,@bankAccount  from @results ta
	
   end