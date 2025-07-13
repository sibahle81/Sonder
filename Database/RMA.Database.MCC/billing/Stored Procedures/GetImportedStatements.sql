CREATE    PROCEDURE [billing].[GetImportedStatements]
   @statementDate date
AS

BEGIN  



DECLARE @AllAccounts Table (AccountNumber varchar(50))

INSERT INTO @AllAccounts
SELECT distinct BankAccountNumber  
FROM Finance.BankStatementEntry 
WHERE  BankAccountNumber like '0000%'   and BankAccountNumber not in ('0000062775471122') 
--AND RecordID ='91'
DECLARE @StartDate date = @statementDate
       
DECLARE @Report Table (AccountNumber varchar(50))

WHILE @StartDate <> (select (CAST( getdate() as date)))
       Begin    
              ----omit sundays
              If (SELECT (((DATEPART(DW,  @StartDate) - 1 ) + @@DATEFIRST ) % 7)) in (0)
                     Begin
                           SET @StartDate = (SELECT DATEADD(day, 1, @StartDate))
                           Continue
                  End
              ----end omit sundays
              DECLARE @FoundAccounts Table (AccountNumber varchar(50)) 
                      -- declare @foundCount int = (select count(*) from @FoundAccounts )
                         --print concat(@StartDate, '---', @foundCount)
              INSERT INTO @FoundAccounts
              SELECT distinct BankAccountNumber 
              FROM finance.BankStatementEntry WHERE BankAccountNumber like '0000%' and BankAccountNumber not in ('0000062775471122') 
              AND CAST( StatementDate as date) = @StartDate          
                 
              DECLARE @missingAccounts table (AccountNumber varchar(50))

              INSERT INTO @missingAccounts
              SELECT * 
              FROM  @AllAccounts
              WHERE   AccountNumber not in   (SELECT AccountNumber FROM @foundAccounts )
              
              WHILE (SELECT count(*) FROM @missingAccounts) > 0
                   Begin
                   DECLARE @account varchar(50) = (SELECT top 1 AccountNumber FROM @missingAccounts)
                   INSERT INTO  @Report
             values(@account);
                   delete FROM @missingAccounts WHERE AccountNumber =@account;
                   set @account = (SELECT top 1 AccountNumber FROM @missingAccounts)
                   end
                     set @StartDate = (SELECT DATEADD(day, 1, @StartDate) )
                                  delete from  @FoundAccounts
                                  delete from  @missingAccounts
End

select * from @Report
END