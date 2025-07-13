
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class CommonSystemNoteSearchRequest
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public NoteItemTypeEnum? NoteItemType { get; set; }
        public string Text { get; set; }
        public NoteTypeEnum? NoteType { get; set; }
        public NoteCategoryEnum? NoteCategory { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime? ModifiedDate { get; set; }
        public List<ModuleTypeEnum> ModuleType { get; set; }
        public PagedRequest PagedRequest { get; set; }
        public DateTime? StartDateFilter { get; set; }
        public DateTime? EndDateFilter { get; set; }
    }
}