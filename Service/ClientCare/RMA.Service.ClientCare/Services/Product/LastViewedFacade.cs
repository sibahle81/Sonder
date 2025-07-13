using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Audit.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Product
{
    public class LastViewedFacade : RemotingStatelessService, ILastViewedService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly ILastViewedV1Service _lastViewedService;
        private readonly IRepository<product_Product> _productRepository;
        private readonly IRepository<product_ProductOption> _productOptionRepository;
        private readonly IRepository<product_Benefit> _benefitRepository;
        private readonly IRepository<product_DiscountType> _discountTypeRepository;

        public LastViewedFacade(StatelessServiceContext context,
            IRepository<product_Product> productRepository,
            IRepository<product_Benefit> benefitRepository,
            IRepository<product_DiscountType> discountTypeRepository,
            IDbContextScopeFactory dbContextScopeFactory, IRepository<product_ProductOption> productOptionRepository, ILastViewedV1Service lastViewedService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _productOptionRepository = productOptionRepository;
            _lastViewedService = lastViewedService;
            _productRepository = productRepository;
            _benefitRepository = benefitRepository;
            _discountTypeRepository = discountTypeRepository;
        }

        public async Task<List<LastViewedItem>> GetLastViewedItemsForUserByName(string itemTypeName)
        {
            var detail = await _lastViewedService.GetLastViewedItemsForUser(RmaIdentity.Username, itemTypeName, 5);
            var lastViewItems = detail
                .Select(n => new LastViewedItem()
                {
                    Id = n.Id,
                    User = n.Username,
                    ItemId = n.ItemId,
                    Date = n.Date,
                }).ToList();

            ProcessLastViewedResults(lastViewItems, itemTypeName);
            return lastViewItems;
        }

        private void ProcessLastViewedResults(List<LastViewedItem> lastViewItems, string itemType)
        {
            if (lastViewItems != null && lastViewItems.Count > 0 && !string.IsNullOrEmpty(itemType))
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    if (itemType == typeof(product_Benefit).Name)
                    {
                        var benefitIds = lastViewItems.Select(lastViewed => lastViewed.ItemId);
                        var benefits = _benefitRepository.Where(p => benefitIds.Contains(p.Id)).ToList();
                        foreach (var lastViewedItem in lastViewItems)
                        {
                            var benefit = benefits.FirstOrDefault(p => p.Id == lastViewedItem.ItemId);
                            lastViewedItem.Name = benefit?.Name ?? "N/A";
                            lastViewedItem.Code = benefit?.Code ?? "N/A";
                            lastViewedItem.Description = "N/A";
                            lastViewedItem.StartDate = benefit?.StartDate ?? DateTime.MinValue;
                            lastViewedItem.EndDate = benefit?.EndDate ?? DateTime.MinValue;
                            lastViewedItem.ModifiedBy = benefit?.ModifiedBy ?? "N/A";
                            lastViewedItem.ModifiedDate = benefit?.ModifiedDate ?? DateTime.MinValue;
                            lastViewedItem.StatusText = benefit != null && benefit.EndDate.HasValue
                                ? GetProductStatus(benefit.EndDate).DisplayAttributeValue() ?? ""
                                : ProductStatusEnum.OpenForBusiness.DisplayAttributeValue();
                        }
                    }
                    else if (itemType == typeof(product_Product).Name)
                    {
                        var productIds = lastViewItems.Select(lastViewed => lastViewed.ItemId);
                        var products = _productRepository.Where(p => productIds.Contains(p.Id)).ToList();
                        foreach (var lastViewedItem in lastViewItems)
                        {
                            var product = products.FirstOrDefault(p => p.Id == lastViewedItem.ItemId);
                            if (product != null)
                            {
                                lastViewedItem.Name = product?.Name ?? "N/A";
                                lastViewedItem.Code = product?.Code ?? "N/A";
                                lastViewedItem.Description = product?.Description ?? "N/A";
                                lastViewedItem.ModifiedBy = product?.ModifiedBy ?? "N/A";
                                lastViewedItem.ModifiedDate = product?.ModifiedDate ?? DateTime.MinValue;
                                lastViewedItem.StatusText = product.EndDate.HasValue
                                    ? GetProductStatus(product.EndDate).DisplayAttributeValue() ?? ""
                                    : ProductStatusEnum.OpenForBusiness.DisplayAttributeValue();
                            }
                        }
                    }
                    else if (itemType == typeof(product_ProductOption).Name)
                    {
                        if (lastViewItems.Any())
                        {
                            var productOptionIds
                                = lastViewItems.Select(lastViewed => lastViewed.ItemId);
                            var productOptionItem =
                                _productOptionRepository.Where(p => productOptionIds.Contains(p.Id)).ToList();
                            foreach (var lastViewedItem in lastViewItems)
                            {
                                var productOption = productOptionItem.FirstOrDefault(p => p.Id == lastViewedItem.ItemId);
                                lastViewedItem.Name = productOption?.Name ?? "N/A";
                                lastViewedItem.Code = productOption?.Code ?? "N/A";
                                lastViewedItem.Description = productOption?.Description ?? "N/A";
                                lastViewedItem.ModifiedBy = productOption?.ModifiedBy ?? "N/A";
                                lastViewedItem.ModifiedDate = productOption?.ModifiedDate ?? DateTime.MinValue;
                                lastViewedItem.IsActive = !productOption?.IsDeleted ?? false;
                                lastViewedItem.StatusText = productOption != null
                                    ? productOption.EndDate.HasValue
                                        ? GetProductStatus(productOption.EndDate).DisplayAttributeValue() ?? ""
                                        : ProductStatusEnum.OpenForBusiness.DisplayAttributeValue()
                                    : "N/A";
                            }
                        }
                    }
                    else if (itemType == typeof(product_DiscountType).Name)
                    {
                        var discountTypIds
                            = lastViewItems.Select(lastViewed => lastViewed.ItemId);
                        var discountTypeItem =
                            _discountTypeRepository.Where(p => discountTypIds.Contains(p.Id)).ToList();
                        foreach (var lastViewedItem in lastViewItems)
                        {
                            var discountType = discountTypeItem.FirstOrDefault(p => p.Id == lastViewedItem.ItemId);
                            lastViewedItem.Name = discountType?.Name ?? "N/A";
                            lastViewedItem.Code = discountType?.Code ?? "N/A";
                            lastViewedItem.Description = discountType?.Description ?? "N/A";
                            lastViewedItem.ModifiedBy = discountType?.ModifiedBy ?? "N/A";
                            lastViewedItem.ModifiedDate = discountType?.ModifiedDate ?? DateTime.MinValue;
                            lastViewedItem.IsActive = discountType?.IsActive ?? false;
                        }
                    }
                }
            }
        }

        private static ProductStatusEnum GetProductStatus(DateTime? endDate)
        {
            return !endDate.HasValue || endDate.Value.Date >= DateTimeHelper.SaNow
                ? ProductStatusEnum.OpenForBusiness
                : ProductStatusEnum.ClosedForBusiness;
        }
    }
}