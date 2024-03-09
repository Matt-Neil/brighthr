import React, { useEffect, useState } from "react";
import "./styles/App.css";
import File from "./components/File";
import Folder from "./components/Folder";
import {
    DocumentUnion as DocumentUnionType,
    File as FileType,
    OpenedFolder as OpenedFolderType,
} from "./types/documents";
import { SortOption as SortOptionType } from "./types/sortOptions";

// I've shaped the JSON data so that it would resemble the actual data received from requests
const App = () => {
    const [openedFolders, setOpenedFolders] = useState<OpenedFolderType[]>([]);
    const [sortOption, setSortOption] = useState<SortOptionType>({ type: "name", direction: "desc" });
    const [searchPhrase, setSearchPhrase] = useState<string>("");
    const [searchResults, setSearchResults] = useState<DocumentUnionType[] | undefined>(undefined);

    const sortLogic = (a: DocumentUnionType, b: DocumentUnionType) => {
        return (
            ((a[sortOption.type as keyof DocumentUnionType] ?? "") <
            (b[sortOption.type as keyof DocumentUnionType] ?? "")
                ? -1
                : (a[sortOption.type as keyof DocumentUnionType] ?? "") >
                  (b[sortOption.type as keyof DocumentUnionType] ?? "")
                ? 1
                : 0) * (sortOption.direction === "desc" ? -1 : 1)
        );
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch("/queries/documents.json");

                if (!response) {
                    throw new Error("Data undefined");
                }

                const data = {
                    parent: { id: "documents", name: "Documents" },
                    children: (await response.json()).sort(function (a: DocumentUnionType, b: DocumentUnionType) {
                        return sortLogic(a, b);
                    }),
                };

                setOpenedFolders([data]);
            } catch (error) {
                console.error("The following error occurred: ", error);
            }
        };

        fetchDocuments();
    }, []);

    useEffect(() => {
        const sortedOpenedFolders = openedFolders.map((folder) => {
            return {
                parent: { id: folder.parent.id, name: folder.parent.name },
                children: folder.children.sort(function (a: DocumentUnionType, b: DocumentUnionType) {
                    return sortLogic(a, b);
                }),
            };
        });

        setOpenedFolders(sortedOpenedFolders);

        if (searchResults) {
            const sortedSearchResults = searchResults.sort(function (a: DocumentUnionType, b: DocumentUnionType) {
                return sortLogic(a, b);
            });

            setSearchResults(sortedSearchResults);
        }
    }, [sortOption]);

    const fetchFolder = async (id: string, name: string) => {
        try {
            const response = await fetch(`/queries/${id}.json`);

            if (!response) {
                throw new Error("Data undefined");
            }

            const data = {
                parent: { id: id, name: name },
                children: (await response.json()).sort(function (a: DocumentUnionType, b: DocumentUnionType) {
                    return sortLogic(a, b);
                }),
            };

            setOpenedFolders((current) => [...current, data]);
        } catch (error) {
            console.error("The following error occurred: ", error);
        }
    };

    const closeFolders = (id: string, name: string) => {
        setOpenedFolders((current) => [current[0]]);

        fetchFolder(id, name);
    };

    const handleSortOption = (option: string) => {
        const splitOption = option.split(",");

        setSortOption({
            type: splitOption[0] as (typeof sortOption)["type"],
            direction: splitOption[1] as (typeof sortOption)["direction"],
        });
    };

    // I'm assuming this is a global search in all directories whether they have been opened or not
    // For this scenario I am just providing hard-coded search results no matter the search input as otherwise I'd be filtering the data on the client
    // In a real scenario I would provide query strings to return actual data relevant to the search phrase
    const handleFetchSearch = async () => {
        try {
            const response = await fetch(`/queries/search.json`);

            if (!response) {
                throw new Error("Data undefined");
            }

            const data = (await response.json()).sort(function (a: DocumentUnionType, b: DocumentUnionType) {
                return sortLogic(a, b);
            });

            setSearchResults(data);
            setSearchPhrase("");
        } catch (error) {
            console.error("The following error occurred: ", error);
        }
    };

    return (
        <div className="App">
            <div className="controls">
                <h1 className="header">
                    {searchResults ? "Search results" : (openedFolders.slice(-1)[0] ?? {}).parent?.name}
                </h1>
                {searchResults ? (
                    <button
                        onClick={() => {
                            setSearchResults(undefined);
                        }}
                        className="clearSearchButton"
                    >
                        Clear search
                    </button>
                ) : (
                    <span className="foldersPath">
                        {openedFolders.map((folder, i) => {
                            return (
                                <React.Fragment key={i}>
                                    <button
                                        className="pathItem"
                                        onClick={() =>
                                            openedFolders.length > 1 &&
                                            setOpenedFolders((current) => current.slice(0, i + 1))
                                        }
                                    >
                                        {folder.parent.name}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </span>
                )}
                <span className="sortOptions">
                    <label
                        className="sortOptionsLabel"
                        htmlFor="sortOptions"
                    >
                        Sort by:{" "}
                    </label>
                    <select
                        name="sortOptions"
                        onChange={(e) => handleSortOption(e.target.value)}
                    >
                        <option value="name,desc">Name, Descending</option>
                        <option value="name,asc">Name, Ascending</option>
                        <option value="size,desc">Size, Descending</option>
                        <option value="size,asc">Size, Ascending</option>
                        <option value="dateAdded,desc">Date added, Descending</option>
                        <option value="dateAdded,asc">Date added, Ascending</option>
                    </select>
                </span>

                <span className="search">
                    <input
                        value={searchPhrase}
                        onChange={(e) => setSearchPhrase(e.target.value)}
                        className="searchInput"
                    />{" "}
                    <button
                        onClick={() => {
                            handleFetchSearch();
                        }}
                        className="searchButton"
                    >
                        Search
                    </button>
                </span>
            </div>

            <div className="documentsBody">
                {searchResults ? (
                    <div className="searchResults">
                        {searchResults.map((result, i) => {
                            return (
                                <React.Fragment key={i}>
                                    {result.type === "folder" ? (
                                        <Folder
                                            folder={result}
                                            fetchFolder={fetchFolder}
                                            closeFolders={i === 0 ? closeFolders : undefined}
                                            openedFolders={openedFolders}
                                        />
                                    ) : (
                                        <File file={result as FileType} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                ) : (
                    <>
                        {openedFolders.map((folder, i) => {
                            return (
                                <div
                                    className="documentsColumn"
                                    key={i}
                                >
                                    {folder.children.length > 0 ? (
                                        folder.children.map((document, y) => {
                                            return (
                                                <React.Fragment key={y}>
                                                    {document.type === "folder" ? (
                                                        <Folder
                                                            folder={document}
                                                            fetchFolder={fetchFolder}
                                                            closeFolders={i === 0 ? closeFolders : undefined}
                                                            openedFolders={openedFolders}
                                                        />
                                                    ) : (
                                                        <File file={document as FileType} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <p className="emptyFolder">Folder empty</p>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
};

export default App;
