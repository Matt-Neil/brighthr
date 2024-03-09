type Document = {
    id: string;
    name: string;
    type: string;
    dateAdded: string;
    size: string;
};

export type File = Document & { path: string };

export type Folder = Document;

export type OpenedFolder = { parent: { id: string; name: string }; children: (File | Folder)[] };

export type FileProps = { file: File };

export type FolderProps = {
    folder: Folder;
    fetchFolder: (id: string, name: string) => void;
    closeFolders?: (id: string, name: string) => void;
    openedFolders: OpenedFolder[];
};
