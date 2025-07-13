

CREATE   PROCEDURE [policy].[ChildAllocationUnmetReport]
	@StartDate AS DATE,
	@EndDate AS DATE,
	@Group VARCHAR (255)
	
AS
BEGIN

	--DECLARE @StartDate AS DATE ='2023/03/01'
	--DECLARE @EndDate AS DATE='2023/03/31'
	--DECLARE @Group VARCHAR (255) =NULL

	IF @Group = 'ALL'
            BEGIN
            SELECT @Group = NULL;
            END

	Select  distinct
			bplt.Policyid,pol.PolicyNumber as MemberPolicyNumber,cr.displayname as [Schemename],bplt.InvoiceDate,cpn.firstname  as [FirstName],cpn.surname as [Surname],
			lplpf.CreatedDate,case isnull(cpn.idtypeid, 6) when 1 then cpn.idnumber else '' end [MemberIdnumber],lplp.ErrorMessage as [SourceMessage],[brokerage].[Name] AS [BrokerName],cfp.FinPayeNumber DebtorNumber,
			Datename(mm,(bplt.InvoiceDate)) + ' Premium Unpaid' as [ErrorMessage]
	from [billing].[PremiumListingTransaction] bplt (nolock)
	inner join [policy].[Policy] pol (nolock) on bplt.PolicyId = pol.PolicyId
	inner join [Load].[PremiumListingPaymentError] lplp on pol.PolicyNumber = lplp.MemberPolicyNumber
	left join [client].[person] cpn on bplt.RolePlayerId = cpn.RolePlayerId
	left join [policy].[Policy] papol (nolock) on pol.parentpolicyId = papol.PolicyId
	left join [client].[roleplayer]  cr on papol.policyownerid = cr.RolePlayerId
	left join [Load].[PremiumListingPaymentFile] lplpf on bplt.PaymentFileId = lplpf.Id
	left join [Client].[FinPayee] cfp (NOLOCK) on pol.[PolicyPayeeId] = cfp.RolePlayerID
	left join [broker].Brokerage [brokerage] ON [brokerage].Id = pol.BrokerageId
	where bplt.PaymentDate is null 
	and lplp.ErrorMessage ='Policy member was not included in the premium payment file'
	and bplt.InvoiceDate between @StartDate and @EndDate
	and (cr.DisplayName = @Group OR  @Group IS NULL)
END