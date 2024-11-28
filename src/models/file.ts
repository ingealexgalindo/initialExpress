export class File {
  FileName: string;
  FileId: string;
  ParentFolderId: string;
  FileCreatedTime: Date;
  UserCreated: string;
  DateCreated: Date;

  constructor(
    FileName: string,
    FileId: string,
    ParentFolderId: string,
    FileCreatedTime: Date,
    UserCreated: string
  ) {
    this.FileName = FileName;
    this.FileId = FileId;
    this.ParentFolderId = ParentFolderId;
    this.UserCreated = UserCreated;
    this.FileCreatedTime = FileCreatedTime;
    this.DateCreated = new Date();
  }
}
