using AutoMapper;
using RMA.Common.Database.Extensions;
using RMA.Common.Enums;
using RMA.Service.ScanCare.Contracts.Entities.AutoProcessing;
using RMA.Service.ScanCare.Database.Entities;
using System;
using RMA.Service.ScanCare.Contracts.Entities;

namespace RMA.Service.ScanCare.Mappers
{
    public class ScanCareMappingProfile : Profile
    {
        /// <summary>
        /// Create the mappers that map the database types to the contract types
        /// </summary>
        public ScanCareMappingProfile()
        {
            CreateMap<documents_DocumentKey, DocumentKey>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<documents_DocumentKey>(s.Id));

            CreateMap<documents_Document, Document>()
                .ForMember(s => s.Keys, opt => opt.Ignore())
                .ForMember(s => s.FileAsBase64, opt => opt.Ignore())
                .ForMember(s => s.DocumentSet, opt => opt.Ignore())
                .ForMember(s => s.MimeType, opt => opt.Ignore())
                .ForMember(s => s.DocumentExist, opt => opt.Ignore())
                .ForMember(s => s.Required, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<documents_Document>(s.Id));

            CreateMap<documents_DocumentSetDocumentType, DocumentSetDocumentType>()
                .ForMember(s => s.DocumentTypeName, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<documents_DocumentType, DocumentType>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<documents_DocumentType>(s.Id));

            CreateMap<documents_DocumentRule, DocumentRule>()
                .ForMember(s => s.DeathTypeId, opt => opt.Ignore())
                .ForMember(s => s.DocumentSetId, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<documents_DocumentRule>(s.Id));

            CreateMap<documents_MailboxConfiguration, MailboxConfiguration>()
                .ForMember(d => d.DocumentSystemName,
                    opt => opt.MapFrom(src => GetDocumentSystemName(src.DocumentSystemNameId)));
        }



        private DocumentSystemNameEnum GetDocumentSystemName(int documentSystemNameId)
        {
            if (Enum.IsDefined(typeof(DocumentSystemNameEnum), documentSystemNameId))
            {
                return (DocumentSystemNameEnum)documentSystemNameId;
            }

            throw new ArgumentException($"Invalid DocumentSystemNameId: {documentSystemNameId}");
        }
    }
}
