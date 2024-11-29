export class FilesToday {
  ParentFolderName: string;
  SubfolderName: string;
  SubfolderId: string;
  HasFileToday: string;

  constructor(
    ParentFolderName: string,
    SubfolderName: string,
    SubfolderId: string,
    HasFileToday: string
  ) {
    this.ParentFolderName = ParentFolderName;
    this.SubfolderName = SubfolderName;
    this.SubfolderId = SubfolderId;
    this.HasFileToday = HasFileToday;
  }
}
