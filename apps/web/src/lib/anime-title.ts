type Title = {
  type?: string;
  title?: string;
};

export const getRecordTitle = (titles?: Title[] | null) => {
  const animeTitle =
    titles?.find((title) => title.type === "English")?.title ||
    titles?.find((title) => title.type === "Default")?.title ||
    "Title";
  return animeTitle;
};
