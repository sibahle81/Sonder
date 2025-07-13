
CREATE     PROCEDURE [pension].[ProductBenefitList]
	@PolicyId int, @BenefitTypeId int
AS
BEGIN
SELECT distinct p.id [ProductId],p.Name [ProductName],p.Code[ProductCode],pc.Id [ProductClass],po.Name [ProductOption],po.id [ProductOptId]
, b.Name [Benefit],b.Code [BenefitCode],b.Id [BenefitId],b.BenefitTypeId,bt.Name [BenefitTypeName],pol.PolicyId,b.CoverMemberTypeId [CoverMemberType], ISNULL (br.BenefitAmount, 0) [BenefitAmount]
  FROM [policy].[Policy] pol
  inner join [product].[ProductOption] po
  on pol.ProductOptionId = po.Id
  inner join [product].ProductOptionBenefit pob
  on pob.ProductOptionId=po.Id
  inner join [product].[Benefit] b
  on pob.BenefitId = b.Id
  inner join [common].BenefitType bt
  on b.BenefitTypeId=bt.Id
  inner join product.Product p
  on po.ProductId= p.Id
  inner join [common].[ProductClass] pc
  on p.ProductClassId = pc.Id
  left join [product].[BenefitRate] br
  on br.BenefitId = b.Id
  where b.BenefitTypeId=@BenefitTypeId and pol.PolicyId=@PolicyId
  and pol.IsDeleted=0
END