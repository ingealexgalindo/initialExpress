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

export interface FolderInfo {
  folderName: string | null;
  folderId: string;
  parentFolderId: string | null;
}

export interface FileInfo {
  fileId: string;
  fileName: string | null;
  createdTime: string | null;
  parentFolderId: string;
}
