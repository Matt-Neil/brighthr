import React from "react";
import { FileProps } from "../types/documents";
import "../styles/file.css";

const File = ({ file }: FileProps) => {
    return (
        <div className="file">
            <a
                className="fileLink"
                href={`http://localhost:3000${file.path}/${file.id}.${file.type}`}
                target="_blank"
                download
            />
            <p className="fileName">{`${file.name} (${file.type})`}</p>
            <p>Size: {file.size}</p>
            <p className="fileAdded">Added: {file.dateAdded}</p>
        </div>
    );
};

export default File;
