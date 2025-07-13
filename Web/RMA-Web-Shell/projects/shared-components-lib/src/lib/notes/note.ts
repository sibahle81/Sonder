export class Note  {
    id: number;
    itemType: string;
    itemId: number;
    text: string;
    reason: string;

    isDeleted: boolean;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    modifiedDate: Date;
    isActive: boolean;

    public static copy(note: Note): Note
    {
        let newNote = new Note();
        newNote.itemType = note.itemType;
        newNote.itemId = note.itemId;
        newNote.text = note.text;
        newNote.reason = note.reason;
        newNote.isDeleted = note.isDeleted;
        return newNote;
    }
}
