-- =============================================
-- Author:		Sibahle Senda
-- Create date: 06/04/2020
-- Modified date: 22/06/2025 -- Function optimised
-- Culprits: Sibahle Senda
-- =============================================
CREATE FUNCTION dbo.GetTransactionBalance (@TransactionId INT)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @TranType        INT ,
            @IsDebit         BIT ,
            @Amount          DECIMAL(18,2) ,
            @InvoiceId       INT ,
            @ClaimRecId      INT ,
            @LinkedId        INT ,
            @StoredBalance   DECIMAL(18,2);

    SELECT  @TranType       = t.TransactionTypeId ,
            @IsDebit        = ttl.IsDebit ,
            @Amount         = t.Amount ,
            @InvoiceId      = t.InvoiceId ,
            @ClaimRecId     = t.ClaimRecoveryInvoiceId ,
            @LinkedId       = t.LinkedTransactionId ,
            @StoredBalance  = t.Balance
    FROM    billing.Transactions            t
    JOIN    billing.TransactionTypeLink     ttl ON ttl.Id = t.TransactionTypeLinkId
    WHERE   t.TransactionId = @TransactionId;

    DECLARE @Balance DECIMAL(18,2) = 0;

    -- Invoice (Type = 6)
    IF ( @TranType = 6 )
    BEGIN
        IF EXISTS ( SELECT 1
                    FROM   billing.Transactions
                    WHERE  LinkedTransactionId = @TransactionId
                      AND  TransactionTypeId   = 5 )        -- InvoiceReversal
        BEGIN
            RETURN 0;
        END

        -- allocations + linked debits once
        ;WITH alloc AS
        (
            SELECT ia.TransactionId ,
                   ia.Amount
            FROM   billing.InvoiceAllocation ia
            WHERE  ia.InvoiceId  = @InvoiceId
              AND  ia.IsDeleted  = 0
        ),
        debit AS
        (
            SELECT d.LinkedTransactionId AS AllocId ,
                   d.Amount ,
                   d.TransactionTypeId
            FROM   billing.Transactions d
            WHERE  d.LinkedTransactionId IN (SELECT TransactionId FROM alloc)
        ),
        credit AS             
        (
            SELECT  cr.TransactionId ,
                    cr.Amount
            FROM    billing.Transactions cr
            WHERE   cr.TransactionId IN (SELECT TransactionId FROM alloc)
        )
        SELECT  @Balance = @Amount -
                SUM (CASE
                         WHEN  d.TransactionTypeId IS NOT NULL
                           AND d.TransactionTypeId NOT IN (2,8,9,18)   -- excluded debit types
                           AND cr.Amount = d.Amount                    
                         THEN a.Amount - d.Amount
                         ELSE a.Amount
                     END)
        FROM    alloc  a
        LEFT    JOIN debit  d ON d.AllocId       = a.TransactionId
        LEFT    JOIN credit cr ON cr.TransactionId = a.TransactionId;

        IF ( @Balance > @Amount ) SET @Balance = @Amount;
        IF ( @Balance < 0 )       SET @Balance = 0;
        RETURN @Balance;
    END

    -- Claim-Recovery Invoice (Type = 5)
    IF ( @TranType = 5 )
    BEGIN
        ;WITH alloc AS
        (
            SELECT ia.TransactionId ,
                   ia.Amount
            FROM   billing.InvoiceAllocation ia
            WHERE  ia.ClaimRecoveryId = @ClaimRecId
              AND  ia.IsDeleted       = 0
        ),
        debit AS
        (
            SELECT d.LinkedTransactionId AS AllocId ,
                   d.Amount
            FROM   billing.Transactions d
            WHERE  d.LinkedTransactionId IN (SELECT TransactionId FROM alloc)
        )
        SELECT @Balance = @Amount -
               SUM( a.Amount - ISNULL(d.Amount,0) )
        FROM   alloc a
        LEFT   JOIN debit d ON d.AllocId = a.TransactionId;

        IF ( @Balance > @Amount ) SET @Balance = @Amount;
        IF ( @Balance < 0 )       SET @Balance = 0;
        RETURN @Balance;
    END

    -- Credit-side transactions (IsDebit = 0)
    IF ( @IsDebit = 0 )
    BEGIN
        -- base balance 
        SELECT @Balance = @Amount
                         - ISNULL( (SELECT SUM(ia.Amount)
                                    FROM   billing.InvoiceAllocation ia
                                    WHERE  ia.TransactionId = @TransactionId
                                      AND  ia.IsDeleted     = 0), 0 )
                         - ISNULL( (SELECT SUM(dta.Amount)
                                    FROM   billing.DebitTransactionAllocation dta
                                    WHERE  dta.CreditTransactionId = @TransactionId), 0 );

        SET @Balance = -@Balance;

        -- add back linked debits by type 
        IF ( @TranType IN (3,4,19) )          -- Payment, CreditNote, CreditReallocation
        BEGIN
            SET @Balance = @Balance +
                           ISNULL( (SELECT SUM(d.Amount)
                                    FROM   billing.Transactions d
                                    WHERE  d.LinkedTransactionId = @TransactionId
                                      AND  d.TransactionTypeId IN (1,2,8,9,18)), 0 );
        END
        ELSE IF ( @TranType = 1 )             -- ClaimRecoveryPayment
        BEGIN
            SET @Balance = @Balance +
                           ISNULL( (SELECT SUM(d.Amount)
                                    FROM   billing.Transactions d
                                    WHERE  d.LinkedTransactionId = @TransactionId
                                      AND  d.TransactionTypeId = 9), 0 );       -- PaymentReversal
        END
        ELSE IF ( @TranType IN (2,8) )        -- InvoiceReversal, EuropAssistPremium
        BEGIN
            RETURN 0;
        END

        IF ( @Balance > 0 ) SET @Balance = 0;
        RETURN @Balance;
    END

    -- Debit-side (non-invoice)
    IF ( @IsDebit = 1 AND @TranType <> 6 )
    BEGIN
        IF ( @TranType = 7 )   -- Interest
        BEGIN
            DECLARE @Alloc DECIMAL(18,2) =
                ISNULL( (SELECT SUM(ia.Amount)
                         FROM   billing.InvoiceAllocation ia
                         WHERE  ia.LinkedTransactionId = @TransactionId
                           AND  ia.IsDeleted = 0), 0 );

            SET @Balance = @Amount - @Alloc;
            IF ( @Balance < 0 ) SET @Balance = 0;
            RETURN @Balance;
        END

        -- DebitReallocation or InterDebtorTransfer keep stored balance 
        IF ( @LinkedId IS NOT NULL
             AND @TranType IN (18,2) )       -- 18 = DebitReallocation, 2 = InterDebtorTransfer
            RETURN ISNULL(@StoredBalance,0);

        -- DebitNote or PaymentReversal – balance = amount 
        IF ( @TranType IN (1,9) )            -- DebitNote, PaymentReversal
            RETURN @Amount;

        RETURN 0;                            -- default debit
    END

    -- default (should never fire)
    RETURN 0;
END
GO
