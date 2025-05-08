import { Option, PageSection, Property, SectionStyle } from "@suwatte/daisuke";

export const SORT_OPTIONS: Option[] = [
  { title: "Most Followed", id: "follows" },
  { title: "Most Viewed", id: "views" },
  { title: "Top Rated", id: "rating" },
  { title: "Last Updated", id: "updated_at" },
  { title: "Created At", id: "created_at" },
];

export const TYPE_OPTIONS = [
  { title: "Manga", id: "manga" },
  { title: "Manhwa", id: "manhwa" },
  { title: "Manhua", id: "manhua" },
  { title: "Comic", id: "comic" },
  { title: "Novel", id: "novel" },
];

export const DEMOGRAPHIC_OPTIONS = [
  { title: "Shounen", id: "shounen" },
  { title: "Shoujo", id: "shoujo" },
  { title: "Seinen", id: "seinen" },
  { title: "Josei", id: "josei" },
];

export const GENRE_OPTIONS = [
  { title: "Action", id: "action" },
  { title: "Adventure", id: "adventure" },
  { title: "Comedy", id: "comedy" },
  { title: "Drama", id: "drama" },
  { title: "Fantasy", id: "fantasy" },
  { title: "Horror", id: "horror" },
  { title: "Mystery", id: "mystery" },
  { title: "Romance", id: "romance" },
  { title: "Sci-Fi", id: "sci-fi" },
  { title: "Slice of Life", id: "slice-of-life" },
  { title: "Supernatural", id: "supernatural" },
  { title: "Thriller", id: "thriller" },
];

export const getProperties = () => {
  const properties: Property[] = [];

  // Type
  properties.push({
    id: "type",
    title: "Content Type",
    tags: TYPE_OPTIONS,
  });
  // Demographic
  properties.push({
    id: "demographic",
    title: "Content Demographics",
    tags: DEMOGRAPHIC_OPTIONS,
  });
  // Genre
  properties.push({
    id: "genres",
    title: "Genres",
    tags: GENRE_OPTIONS,
  });

  return properties;
};

export const LANGUAGE_OPTIONS = [
  { id: "all", title: "All Languages" },
  { id: "en", title: "English" },
  { id: "ja", title: "Japanese" },
  { id: "ko", title: "Korean" },
  { id: "zh", title: "Chinese" },
];

export const EXPLORE_COLLECTIONS: PageSection[] = [
  {
    id: "latest",
    title: "Latest Updates",
    style: SectionStyle.INFO,
  },
  {
    id: "popular",
    title: "Popular Titles",
    style: SectionStyle.DEFAULT,
  },
  {
    id: "trending",
    title: "Trending Now",
    style: SectionStyle.GALLERY,
  },
  {
    id: "completed",
    title: "Completed Titles",
    subtitle: "Binge-Worthy Completed Titles",
    style: SectionStyle.INFO,
  },
  {
    id: "new_releases",
    title: "New Releases",
    style: SectionStyle.DEFAULT,
  },
  {
    id: "recently_updated",
    title: "Recently Updated",
    style: SectionStyle.INFO,
  },
];
