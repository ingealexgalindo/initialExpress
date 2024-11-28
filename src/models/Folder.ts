export class Folder {
  FolderName: string;
  FolderId: string;
  UserCreated: string;
  ParentFolderId?: string | null;
  DateCreated: Date;

  constructor(
    FolderName: string,
    FolderId: string,
    UserCreated: string,
    ParentFolderId?: string | null
  ) {
    this.FolderName = FolderName;
    this.FolderId = FolderId;
    this.UserCreated = UserCreated;
    this.ParentFolderId = ParentFolderId || null;
    this.DateCreated = new Date();
  }
}
