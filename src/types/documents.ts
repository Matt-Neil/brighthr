type Document = {
    id: string;
    name: string;
    type: string;
    dateAdded: string;
    size: string;
};

export type File = Document & { path: string };

type Folder = Document;

export type DocumentUnion = File | Folder;

export type OpenedFolder = { parent: { id: string; name: string }; children: DocumentUnion[] };

export type FileProps = { file: File };

export type FolderProps = {
    folder: Folder;
    fetchFolder: (id: string, name: string) => void;
    closeFolders?: (id: string, name: string) => void;
    openedFolders: OpenedFolder[];
};
