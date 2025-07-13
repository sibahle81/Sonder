using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System;

namespace RMA.Service.ClientCare.Mappers
{
    public class PremiumListingProfile : Profile
    {

        public PremiumListingProfile()
        {
            CreateMap<Load_PremiumListingPaymentFile, PremiumListingFile>()
                      .ForMember(s => s.PremiumListingFileId, opt => opt.MapFrom(d => d.Id))
                          .ForMember(s => s.CreatedDate, opt => opt.MapFrom(d => d.CreatedDate))
                          .ForMember(s => s.CreatedBy, opt => opt.MapFrom(d => d.CreatedBy))
                          .ForMember(s => s.FileIdentifier, opt => opt.MapFrom(d => d.FileIdentifier))
                          .ForMember(s => s.IsDeleted, opt => opt.MapFrom(d => d.IsDeleted))
                          .ForMember(s => s.ModifiedBy, opt => opt.MapFrom(d => d.ModifiedBy))
                          .ForMember(s => s.ModifiedDate, opt => opt.MapFrom(d => d.ModifiedDate))
                          .ForMember(s => s.FileProcessingStatusId, opt => opt.MapFrom(d => d.FileProcessingStatusId))
                          .ForMember(s => s.FileProcessingStatus, opt => opt.MapFrom(d => MapFileProcessingStatus(d.FileProcessingStatusId)))
                          .ReverseMap()
                          .ConstructUsing(s => MapperExtensions.GetEntity<Load_PremiumListingPaymentFile>(s.PremiumListingFileId));

            CreateMap<Load_PremiumPaymentFileValidation, PremiumListingFile>()
                     .ForMember(s => s.PremiumListingFileId, opt => opt.MapFrom(d => d.FileId))
                         .ForMember(s => s.CreatedDate, opt => opt.MapFrom(d => d.CreatedDate))
                         .ForMember(s => s.CreatedBy, opt => opt.MapFrom(d => d.CreatedBy))
                         .ForMember(s => s.FileIdentifier, opt => opt.MapFrom(d => d.FileIdentifier))
                         .ForMember(s => s.IsDeleted, opt => opt.MapFrom(d => d.IsDeleted))
                         .ForMember(s => s.ModifiedBy, opt => opt.MapFrom(d => d.ModifiedBy))
                         .ForMember(s => s.ModifiedDate, opt => opt.MapFrom(d => d.ModifiedDate))
                         .ForMember(s => s.FileProcessingStatusId, opt => opt.Ignore())
                         .ForMember(s => s.FileProcessingStatus, opt => opt.Ignore());                        
        }

        private string MapFileProcessingStatus(int? processingStatusId)
        {
            var status = UploadedFileProcessingStatusEnum.Pending.DisplayAttributeValue();

            if (processingStatusId.HasValue)
            {
                var enumValue = (UploadedFileProcessingStatusEnum)Enum.Parse(typeof(UploadedFileProcessingStatusEnum), processingStatusId.Value.ToString());
                status = enumValue.DisplayAttributeValue();
            }
            return status;
        }
    }

}

