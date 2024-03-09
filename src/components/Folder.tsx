import React from "react";
import { FolderProps } from "../types/documents";
import "../styles/folder.css";

const Document = ({ folder, fetchFolder, closeFolders, openedFolders }: FolderProps) => {
    const isOpenedFolder = openedFolders.some((openedFolder) => openedFolder.parent.id === folder.id);

    const handleFolder = () => {
        if (openedFolders[1]?.parent.id !== folder.id && closeFolders) {
            closeFolders(folder.id, folder.name);

            return;
        }

        if (!isOpenedFolder) {
            fetchFolder(folder.id, folder.name);
        }
    };

    return (
        <div className={`folder ${isOpenedFolder && "openedFolder"}`}>
            <button
                onClick={() => handleFolder()}
                className="folderButton"
            />
            <p className="folderName">{folder.name} (Folder)</p>
            <p>Size: {folder.size}</p>
            <p className="folderAdded">Added: {folder.dateAdded}</p>
        </div>
    );
};

export default Document;
