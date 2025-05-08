import {
  Chapter,
  Content,
  DirectoryRequest,
  Highlight,
  Property,
  PublicationStatus,
  ReadingMode,
} from "@suwatte/daisuke";
import { MangaExcerpt } from "./types";
import { PopulatedFilter } from "../../template/madara/types";

export const parseSearchRequest = (request: DirectoryRequest) => {
  const limit = 30;
  const sort = request.sort ?? { id: "views" };
  const page = request.page ?? 1;
  let queryString = `sort=${sort.id}`;

  const { content_type, demographic, genres, completed } = request.filters ?? {};

  if (completed) queryString += `&completed=true`;
  if (content_type) queryString += `&type=${content_type.join(",")}`;
  if (demographic) queryString += `&demographic=${demographic.join(",")}`;
  if (genres) {
    const { included, excluded } = genres;
    if (included) queryString += `&genres=${included.join(",")}`;
    if (excluded) queryString += `&exclude_genres=${excluded.join(",")}`;
  }

  return {
    queryString,
    core: {
      limit,
      page,
      q: request.query ?? "",
    },
  };
};

export const MangaToHighlight = (data: MangaExcerpt): Highlight => {
  return {
    id: data.id,
    title: data.title,
    cover: data.cover,
    ...(data.last_chapter && {
      lastChapter: {
        chapterId: data.last_chapter.id,
        number: data.last_chapter.number,
        title: data.last_chapter.title,
        date: new Date(data.last_chapter.date),
      },
    }),
  };
};

type Base = { name: string; slug: string };
export const MangaToContent = (data: any, contentId: string): Content => {
  const {
    title,
    description,
    cover,
    status,
    type,
    demographic,
    genres,
    rating,
    views,
    follows,
    last_chapter,
    created_at,
    updated_at,
  } = data;

  return {
    contentId,
    title,
    cover,
    summary: description,
    status: status === "completed" ? PublicationStatus.COMPLETED : PublicationStatus.ONGOING,
    readingMode: ReadingMode.PAGED_COMIC,
    properties: [
      {
        id: "type",
        title: "Type",
        tags: [{ id: type, title: type }],
      },
      {
        id: "demographic",
        title: "Demographic",
        tags: [{ id: demographic, title: demographic }],
      },
      {
        id: "genres",
        title: "Genres",
        tags: genres.map((g: string) => ({ id: g, title: g })),
      },
    ],
    statistics: {
      rating,
      views,
      follows,
    },
    ...(last_chapter && {
      lastChapter: {
        chapterId: last_chapter.id,
        number: last_chapter.number,
        title: last_chapter.title,
        date: new Date(last_chapter.date),
      },
    }),
    dateAdded: new Date(created_at),
    dateUpdated: new Date(updated_at),
  };
};

export const ChapterToChapter = (data: any): Omit<Chapter, "index" | "contentId"> => {
  const { id, number, title, date, language = "en" } = data;
  return {
    chapterId: id,
    number,
    title,
    date: new Date(date),
    language,
  };
};
