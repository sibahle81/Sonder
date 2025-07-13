CREATE PROCEDURE billing.CommisionStatementBrokerageDetails
	@StartDate DateTime, 
	@EndDate DateTime,
	@BrokerageId int
AS
Begin
	DECLARE @BrokerageTable TABLE (
				[StartPeriod] VARCHAR(150),
				[EndPeriod] VARCHAR(150), 
				[RecepientCode]  VARCHAR(150), 
				[RecepientName]  VARCHAR(150), 
				[AccountHolderName] VARCHAR(150),
				[AccountNumber] VARCHAR(150),
				[AccountType] VARCHAR(150),
				[Code]VARCHAR(150), 
				[BankName] VARCHAR(150),
				[AddressLine1] VARCHAR(350),
				[AddressLine2] VARCHAR(350),
				[City] VARCHAR(25),
				[PostalCode] VARCHAR(12)
		);

		
INSERT @BrokerageTable
Select DISTINCT
	StartPeriod = FORMAT(@StartDate, 'MMM-yyyy'),
	EndPeriod = FORMAT(@EndDate, 'MMM-yyyy'),
	h.Code,
	h.Name,
	bba.AccountHolderName, 
	bba.AccountNumber, 
	bat.Name as AccountType, 
	bb.Code, 
	b.Name as BankName,
	ba.AddressLine1,
	ba.AddressLine2,
	ba.City,
	ba.PostalCode
	from [broker].Brokerage h
	inner join [broker].BrokerageBankAccount bba on bba.brokerageId = h.Id
	inner join [broker].BrokerageAddress ba on ba.BrokerageId = h.Id
	inner join common.BankBranch bb on bb.Id = bba.BankBranchId
	inner join common.Bank b on b.id = bb.BankId
	inner join common.BankAccountType bat on bat.id = bba.BankAccountTypeId
	where h.id = @brokerageId and ba.AddressTypeId = 2


	Select 
		[StartPeriod],
		[EndPeriod], 
		[RecepientCode], 
		[RecepientName], 
		[AccountHolderName],
		[AccountNumber],
		[AccountType],
		[Code], 
		[BankName],
		[AddressLine1],
		[AddressLine2],
		[City],
		[PostalCode] from @BrokerageTable
END
