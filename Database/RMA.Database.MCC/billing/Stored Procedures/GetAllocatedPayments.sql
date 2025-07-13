


CREATE PROCEDURE [billing].[GetAllocatedPayments]  --exec [billing].[GetAllocatedPayments] '-1','-1',1,'0',0,2022,2

@startDate nvarchar(250) = NULL,
@endDate nvarchar(250) = NULL,
@dateType int,
@bankAccNum AS VARCHAR(50) = NULL,
@productId int =0,
@periodYear nvarchar(250) = NULL,
@periodMonth nvarchar(250) = NULL

AS
IF @startDate = '-1'
     begin
       set @startDate  = NULL
       end
IF @endDate = '-1' 
     begin
       set  @endDate = NULL
       end

IF @bankAccNum = '' OR @bankAccNum = '0'
	begin set @bankAccNum = null; 
	end

IF @periodMonth = 0 or @periodMonth = -1
     begin set  @periodMonth = NULL end
                
IF @periodYear = 1970 or  @periodYear = -1
    begin set @periodYear = NULL end

--Override startDate and endDate using period provided (multi period to be catered for)

IF @periodYear is not null
begin
	set	@endDate = (select CAST(EOMONTH(CAST(CONCAT(@periodYear,'/',@periodMonth,'/','1')as datetime))as datetime))
	set @startDate = (select (CAST(CONCAT(@periodYear,'/',@periodMonth,'/','1')as datetime) ))
end

    IF @bankAccNum is not NULL
	BEGIN
	SET @bankAccNum = '00000' + @bankAccNum;
	END     

IF @dateType = 0
    

declare @AllocatedToInvoices table( InvoiceAllocationId int, TransactionId int, BankStatementEntryId int, 
InvoiceNumber varchar(100), PolicyNumber varchar(100), AllocationAmount money,BrokerName varchar(250), PolicyStatus varchar(25))
declare @AllocatedToDebtor table( TransactionId int, BankStatementEntryId int, RolePlayerId int, Amount money)

insert @AllocatedToInvoices
 

SELECT 
		ia.InvoiceAllocationId,
		t.TransactionId, 
        T.BankStatementEntryId, 
        ISNULL(InvoiceNumber, ''),
        ISNULL(PolicyNumber, ''), 
        ia.amount,
		brokerage.[name],
		cps.[Name]                   
    FROM [billing].[Transactions] T (nolock) INNER JOIN [finance].[BankStatementEntry] B (nolock) 
       ON T.BankStatementEntryId = B.BankStatementEntryId 
        INNER JOIN [client].[RolePlayer] R (nolock)  ON T.RolePlayerId = R.RolePlayerId
        left outer join  [billing].[InvoiceAllocation] ia (nolock)  on ia.transactionid = t.transactionid
        inner join [billing].[Invoice] i (nolock)  on i.invoiceid = ia.invoiceid
        inner join policy.policy p (nolock)  on p.policyid = i.policyid
		inner join [product].productoption ppo (nolock) on p.productoptionid = ppo.id
	    inner join product.product prod  on ppo.productid = prod.id 
		left join common.policystatus cps   on p.PolicyStatusId = cps.[Id]
		left join [broker].brokerage [brokerage] (nolock) on [brokerage].id = p.brokerageid
                                  
                  --- left join billing.unallocatedpayment up on up.bankstatemententryid = b.bankstatemententryid 
       WHERE  1 = CASE 
                     WHEN @dateType = 0 THEN CASE WHEN B.[StatementDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END
                                  WHEN @dateType = 1 THEN CASE WHEN T.[CreatedDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
                                   WHEN @dateType = 2 THEN CASE WHEN B.[TransactionDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
                     ELSE 1
                           END
              AND T.IsDeleted =0
         AND ia.isdeleted = 0
		 AND B.BankAccountNumber = isnull(@bankAccNum, B.BankAccountNumber)
		 AND (prod.[Id] = @productId OR @productId IS NULL)
		 --AND (MONTH(t.TransactionDate) = @periodMonth AND YEAR(t.TransactionDate) = @periodYear OR (@periodMonth is NULL and @periodYear is NULL))



insert @AllocatedToDebtor
select 
a.TransactionId, a.BankStatementEntryId, t.RolePlayerId, (t.Amount - sum(a.AllocationAmount))
from @AllocatedToInvoices a
left join billing.Transactions t with (nolock) on t.TransactionId = a.TransactionId
group by a.TransactionId, a.BankStatementEntryId, t.RolePlayerId, amount
having  (t.Amount - sum(a.AllocationAmount)) <> 0



       DECLARE @SearchTable TABLE (
           transactionid bigint,
              DebtorPaymentId INT,
              BankStatementEntryId INT,
              DebtorName VARCHAR(250),
              InvoiceNumber VARCHAR(250),
              PolicyNumber VARCHAR(250),
              UserReference VARCHAR(250),
              TransactionDate Date,
              StatementDate Date,
              HyphenDateProcessed Date,
              HyphenDateReceived Date,
              Amount Decimal(18,2),
              BankAccountNumber bigint,
              UserReference1 VARCHAR(250),
              UserReference2 VARCHAR(250),
              TransactionType VARCHAR(100),
			  SchemeName VARCHAR(250),
			  BrokerName VARCHAR(250),
			  PolicyStatus VARCHAR(250),
              AllocationDate Date,
              DebtorNumber varchar(100)
       );

    INSERT INTO @SearchTable
       SELECT  t.TransactionId, ISNULL(InvoiceAllocationId, 0),
           T.BankStatementEntryId,
              R.DisplayName,
              ISNULL(InvoiceNumber, ''),
              ISNULL(PolicyNumber, ''),
              B.UserReference,
              B.TransactionDate,
              B.StatementDate,
              B.HyphenDateProcessed,
              B.HyphenDateReceived,
              Amount = isnull(AllocationAmount *-1,case when t.TransactionTypeLinkId = 2 then t.amount * -1 else t.Amount end),        
              CAST(B.BankAccountNumber AS bigint) AS BankAccountNumber,
              B.UserReference1,
              (SELECT CONCAT(B.[StatementNumber], '/', B.[StatementLineNumber], ' ', (SELECT FORMAT (B.[StatementDate], 'dd/MM/yyyy')))) as UserReference2,
              B.TransactionType,
			  R.DisplayName AS SchemeName,
			  ia.BrokerName,
			  ia.PolicyStatus,
			  T.[CreatedDate],
				cf.FinPayeNumber DebtorNumber
    FROM [billing].[Transactions] T  INNER JOIN [finance].[BankStatementEntry] B (nolock) 
       ON T.BankStatementEntryId = B.BankStatementEntryId 
                   INNER JOIN [client].[RolePlayer] R (nolock)  ON T.RolePlayerId = R.RolePlayerId
                   left join @AllocatedToInvoices ia on ia.TransactionId = t.TransactionId                 
                   left join client.FinPayee cf (nolock)  on cf.RolePlayerId = t.RolePlayerId
          WHERE  1 = CASE 
                     WHEN @dateType = 0 THEN CASE WHEN B.[StatementDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END
                                  WHEN @dateType = 1 THEN CASE WHEN T.[CreatedDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
                                   WHEN @dateType = 2 THEN CASE WHEN B.[TransactionDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
                     ELSE 1
                           END
              AND T.IsDeleted =0
			  --AND (prod.[Id] = @productId OR @productId IS NULL)
			  AND B.BankAccountNumber = isnull(@bankAccNum, B.BankAccountNumber)
         	  --AND (MONTH(t.TransactionDate) = @periodMonth AND YEAR(t.TransactionDate) = @periodYear OR (@periodMonth is NULL and @periodYear is NULL))


    INSERT INTO @SearchTable
       SELECT  t.TransactionId, 0,
           T.BankStatementEntryId,
              R.DisplayName,
             '',
              '',
              B.UserReference,
              B.TransactionDate,
              B.StatementDate,
              B.HyphenDateProcessed,
              B.HyphenDateReceived,
              Amount =  case when t.TransactionTypeLinkId = 2 then ia.amount * -1 else ia.Amount end,
              CAST(B.BankAccountNumber AS bigint) AS BankAccountNumber,
              B.UserReference1,
              (SELECT CONCAT(B.[StatementNumber], '/', B.[StatementLineNumber], ' ', (SELECT FORMAT (B.[StatementDate], 'dd/MM/yyyy')))) as UserReference2,
              B.TransactionType,
			  R.DisplayName AS SchemeName,
			  '',
			  '',
			  T.[CreatedDate],
			  cf.FinPayeNumber DebtorNumber
    FROM [billing].[Transactions] T  INNER JOIN [finance].[BankStatementEntry] B
       ON T.BankStatementEntryId = B.BankStatementEntryId 
                   INNER JOIN [client].[RolePlayer] R (nolock)  ON T.RolePlayerId = R.RolePlayerId
                    inner join @AllocatedToDebtor ia on ia.TransactionId = t.TransactionId                 
                    left join client.FinPayee cf (nolock)  on cf.RolePlayerId = t.RolePlayerId       
          WHERE  1 = CASE 
                     WHEN @dateType = 0 THEN CASE WHEN B.[StatementDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END
						WHEN @dateType = 1 THEN CASE WHEN T.[CreatedDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
						WHEN @dateType = 2 THEN CASE WHEN B.[TransactionDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
                     ELSE 1
                           END
       AND T.IsDeleted =0
	   AND B.BankAccountNumber = isnull(@bankAccNum, B.BankAccountNumber)
       --AND (MONTH(t.TransactionDate) = @periodMonth AND YEAR(t.TransactionDate) = @periodYear OR (@periodMonth is NULL and @periodYear is NULL))


         SELECT distinct TransactionId,  DebtorPaymentId,
              BankStatementEntryId,
              DebtorName,
              InvoiceNumber,
              PolicyNumber,
              UserReference,
              TransactionDate,
              StatementDate,
              HyphenDateProcessed,
              HyphenDateReceived,
              Amount,
              BankAccountNumber,
              UserReference1,
              UserReference2,
              TransactionType,
			  SchemeName,
			  BrokerName,
			  PolicyStatus,
              AllocationDate,
              DebtorNumber
       FROM @SearchTable