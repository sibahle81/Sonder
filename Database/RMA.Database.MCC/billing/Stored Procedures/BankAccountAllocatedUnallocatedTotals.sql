create    PROCEDURE [billing].[BankAccountAllocatedUnallocatedTotals]
AS

BEGIN  

declare @bankaccounts table (accountnumber varchar(60))

insert  into @bankaccounts
select  '0000050510037788'
insert  into @bankaccounts
select '0000050512338895'
insert  into @bankaccounts
select '0000062684073142'
insert  into @bankaccounts
select '0000062679223497'
insert  into @bankaccounts
select '0000062679223942'
insert  into @bankaccounts
select '0000062775460646'

--select * from @bankaccounts

declare @currentBankAccount varchar(60) = (select top 1 accountnumber from @bankaccounts)

while (select count(*) from @bankaccounts) > 0
	begin
		declare @bankaccount varchar(60)=(select @currentBankAccount)
		declare @startDate date = '2022-01-01'--change this to the year you are quering
		declare @financialYearEndMonth date='2022-12-01' --change this to the year you are quering
		declare @report table (Source varchar(60),BankAccount varchar(60),DateMonth  varchar(20) ,Amount decimal(18,2))

		while (@startDate) <= @financialYearEndMonth
			begin
				declare @endDate date = (SELECT EOMONTH(@startDate))
				declare @table1 table (Source varchar(60),BankAccount varchar(60),DateMonth  varchar(20) ,Amount decimal(18,2))

				insert into @table1

				select-- *--
				'Allocated' [Source],@bankaccount,(select FORMAT (@startDate, 'MMM-yyyy')), sum(case when t.TransactionTypeLinkId = 1 then t.amount * -1 else t.Amount end)  [Amount]
				from billing.Transactions t where BankStatementEntryId in(
				select BankStatementEntryId from finance.BankStatementEntry b
				where b.TransactionDate between @startDate and @endDate and b.RecordID='91' and b.BankAccountNumber in
				(
				@bankaccount)
				)
				and IsDeleted = 0

				union all

				select 'Unallocated' [Source],@bankaccount,(select FORMAT (@startDate, 'MMM-yyyy')), sum(unallocatedamount) [Amount] from billing.UnallocatedPayment where BankStatementEntryId in(
				select BankStatementEntryId from finance.BankStatementEntry b
				where b.TransactionDate between @startDate and @endDate and b.RecordID='91'
				and b.BankAccountNumber in
				(
				@bankaccount)
				)
				and IsDeleted = 0

				union all

				select 'Bank' [Source],@bankaccount,(select FORMAT (@startDate, 'MMM-yyyy')),  (select sum(NettAmount)/cast(100 as decimal(18,2)) from finance.BankStatementEntry b
				where b.TransactionDate between @startDate and @endDate and b.RecordID='91'
				and b.BankAccountNumber in (
				@bankaccount) and DebitCredit ='+') - (
				select sum(NettAmount)/cast(100 as decimal(18,2)) from finance.BankStatementEntry b
				where b.TransactionDate between @startDate and @endDate and b.RecordID='91'
				and b.BankAccountNumber in(
				@bankaccount) and DebitCredit ='-'
				)  [Amount]

				insert into @report
				select * from @table1
				union all (select 'Total', @bankaccount,(select FORMAT (@startDate, 'MMM-yyyy')),((select amount from @table1 where source='Bank') - (select sum(amount) from @table1 where source in ('Allocated','Unallocated'))))
				union all (select '','','',NULL)--blank line
		delete @table1
			set @startDate =(	SELECT DATEADD(month, 1, @startDate))
			print @startDate
			end
			
			delete from @bankaccounts where accountnumber=  @currentBankAccount
			set @currentBankAccount  = (select top 1 accountnumber from @bankaccounts)
end

	select * from @report
END