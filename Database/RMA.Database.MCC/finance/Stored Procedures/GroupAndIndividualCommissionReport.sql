

CREATE PROCEDURE [finance].[GroupAndIndividualCommissionReport]
	@StartDate		As Date,
	@EndDate		AS Date 
	
AS

BEGIN 

 
select distinct top 10
bro.Name					as 'GIndividual_Broker',
sum(pol.AnnualPremium)      as 'GIndividual_AnnualPremium', 
sum(pol.InstallmentPremium)	as 'GIndividual_Premium',
pol.CommissionPercentage    as 'GIndividual_Commission',
pol.BinderFeePercentage     as 'GIndividual_BinderFeePercentage',
pro.Name					as 'GIndividual_Product',
pc.Name						as 'GIndividual_product Class' 
from [policy].[Policy] pol 
inner join  [AZD-MCC].[policy].[PolicyBroker] pb on pol.BrokerageId = pb.BrokerageId and pol.PolicyId = pb.PolicyId
inner join broker.Brokerage bro on pol.BrokerageId = bro.Id   
inner join product.ProductOption po on pol.ProductOptionId = po.Id 
inner join product.Product pro on po.ProductId = pro.Id 
inner join common.ProductClass pc on pro.ProductClassId = pc.Id 
where bro.companyType in ('Natural Person','Private')
and pol.CreatedDate between @StartDate and @EndDate
group by bro.Name, pol.CommissionPercentage, pro.Name,pol.BinderFeePercentage,pc.Name


END