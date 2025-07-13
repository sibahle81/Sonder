
CREATE PROCEDURE [policy].[ExpenseBasedPolicyScheduleJSONPaymentTerms]
	@WizardId INT 
	AS

--Declare @WizardId INT 
--Set @WizardId = 54439 --46941 

BEGIN

DECLARE
	@jsonData NVARCHAR(MAX),
	@PaymentFrequency int,
	@installment decimal(18,2),
	@Premium decimal(18,2)

	create table #QuoteData
	(
		premium decimal(18,2)
	)

	create table #Temp
	(
		TotalPremium decimal(18,2),
		Installment decimal(18,2),
	)

	--inserting Parent Premium
	insert into #QuoteData
	select 
		premium = CONVERT(decimal(18,2), json_value(WIZARD.[Data], '$[0].quote.premium'))
	FROM [bpm].[Wizard] WIZARD
	WHERE WIZARD.[Id] = @WizardId

	--inserting the dependent Premium
	SELECT @jsonData = [Data] FROM bpm.Wizard WHERE Id = @WizardId
	insert into #QuoteData
	select
		JsonData.premium
    FROM OpenJson(@jsonData, '$[0].quote.dependentQuotes')
		with(premium decimal(18,2) '$.quote.premium') as JsonData 

	--Getting the Payment frequency
    set @PaymentFrequency = (select 
							paymentFrequency = CONVERT(int, json_value(WIZARD.[Data], '$[0].paymentFrequencyId'))
							FROM [bpm].[Wizard] WIZARD
							WHERE WIZARD.[Id] = @WizardId)
    --Setting total premium
	set @Premium = (select sum(premium) from #QuoteData)

	--Calculating the Installment
	if(@PaymentFrequency = 0 OR @PaymentFrequency = 1)
	begin 
	set @installment = @Premium 
	end

	if(@PaymentFrequency = 2)
	begin 
	set @installment = @Premium / 12
	end

	if(@PaymentFrequency = 3)
	begin 
	set @installment = @Premium / 4
	end

	if(@PaymentFrequency = 4)
	begin 
	set @installment = @Premium / 2
	end

	insert into #Temp
	values(@Premium, @installment )
    
	select * from  #Temp

	drop table #QuoteData
	drop table #Temp
END