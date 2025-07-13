--jpk: invoice send / resend report
CREATE   PROCEDURE [billing].[InvoiceSentReport]
	@StartDate AS DATE,
	@EndDate AS DATE,
	@Success int,
	@IndustryId int
	
AS
 
	IF @IndustryId = 0
	BEGIN SELECT @IndustryId = NULL; END

	IF @Success = 2
	BEGIN SELECT @Success = NULL; END

  SELECT 
    P.PolicyNumber
   ,isnull(P.ClientReference, 'N/A') ClientRef 
   ,F.FinPayeNumber MemberNumber
   ,C.Name Member
   ,I.InvoiceNumber
   ,I.TotalInvoiceAmount Premium
   ,ind.[name] Industry
   ,ic.[Name] [IndustryClass]
   ,E.Reciepients
   ,I.InvoiceDate
   ,Convert(varchar,E.CreatedDate,6) SentDate
   ,case E.isSuccess
	when 1 then 'SUCCESS'
	when 0 then 'FAILED'
   end SendStatus
  FROM campaign.EmailAudit E
   left join billing.invoice I on E.ItemId = I.InvoiceId
   left join policy.policy P on I.policyid = P.policyId
   left join client.company C on P.PolicyOwnerId = C.RolePlayerId
   left join client.finpayee F on F.RolePlayerId = C.RolePlayerId
   left join  [common].Industry ind on ind.Id =F.IndustryId
   inner join [common].IndustryClass ic on ic.Id = ind.IndustryClassId
  WHERE E.itemtype = 'Invoice'
  AND E.CreatedDate BETWEEN @StartDate AND @EndDate
  AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
				WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
				AND ind.[Id] = ISNULL(f.IndustryId, ind.[Id]))
  AND (E.isSuccess = @Success OR @Success IS NULL)