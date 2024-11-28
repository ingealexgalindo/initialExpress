export interface FileStructure {
  fileId: string;
  fileName: string | null;
  createdTime: string | null;
}

export interface FolderStructure {
  folderName: string | null;
  folderId: string;
  parentFolderId: string | null;
  files: (FolderStructure | FileStructure)[];
}
