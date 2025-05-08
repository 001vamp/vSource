import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryFilter,
  DirectoryRequest,
  FilterType,
  Form,
  ImageRequestHandler,
  NetworkRequest,
  PageLink,
  PageLinkResolver,
  PageSection,
  PagedResult,
  Property,
  ResolvedPageSection,
  RunnerInfo,
  RunnerPreferenceProvider,
  UIPicker,
  PublicationStatus,
} from "@suwatte/daisuke";
import {
  getProperties,
  LANGUAGE_OPTIONS,
} from "./constants";
import * as cheerio from "cheerio";

export class Target
  implements
  ContentSource,
  ImageRequestHandler,
  RunnerPreferenceProvider,
  PageLinkResolver {
  info: RunnerInfo = {
    id: "vortexscans",
    name: "VortexScans",
    version: 0.59,
    website: "https://vortexscans.org",
    supportedLanguages: [],
    thumbnail: "vortexscans.png",
    minSupportedAppVersion: "5.0",
  };

  private client = new NetworkClient();
  private BASE_URL = "https://vortexscans.org";

  async getContent(contentId: string): Promise<Content> {
    const url = `${this.BASE_URL}/series/${contentId}`;
    const { data } = await this.client.get(url);
    const $ = cheerio.load(data);

    const title = $("h1.title").text().trim();
    const cover = $("div.cover img").attr("src") ?? "";
    const description = $("div.description").text().trim();
    const status = $("div.status").text().trim().toLowerCase();
    const type = $("div.type").text().trim();
    const demographic = $("div.demographic").text().trim();
    const genres = $("div.genres a")
      .map((_: number, el: cheerio.Element) => $(el).text().trim())
      .get();

    return {
      title,
      cover,
      summary: description,
      status: status === "completed" ? PublicationStatus.COMPLETED : PublicationStatus.ONGOING,
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
    };
  }

  async getChapters(contentId: string): Promise<Chapter[]> {
    const url = `${this.BASE_URL}/series/${contentId}`;
    const { data } = await this.client.get(url);
    const $ = cheerio.load(data);

    const chapters: Chapter[] = [];
    $("div.chapter-list a").each((index: number, el: cheerio.Element) => {
      const $el = $(el);
      const href = $el.attr("href") ?? "";
      const chapterMatch = href.match(/chapter-(\d+)/);
      const chapterId = chapterMatch ? chapterMatch[0] : "";
      const title = $el.find(".chapter-title").text().trim();
      const number = parseFloat(chapterId.replace("chapter-", ""));
      const date = $el.find(".chapter-date").text().trim();

      chapters.push({
        chapterId,
        index,
        number,
        title,
        date: new Date(date),
        language: "en",
      });
    });

    return chapters;
  }

  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const url = `${this.BASE_URL}/series/${contentId}/${chapterId}`;
    const { data } = await this.client.get(url);
    const $ = cheerio.load(data);

    const pages = $("div.reader-container img")
      .map((_: number, el: cheerio.Element) => {
        const src = $(el).attr("src") ?? "";
        return { url: src };
      })
      .get();

    return { pages };
  }

  async getTags?(): Promise<Property[]> {
    return getProperties();
  }

  async getDirectory(request: DirectoryRequest): Promise<PagedResult> {
    const url = `${this.BASE_URL}/series`;
    const { data } = await this.client.get(url);
    const $ = cheerio.load(data);

    const results = $("div.series-card")
      .map((_: number, el: cheerio.Element) => {
        const $el = $(el);
        const link = $el.find("a").attr("href") ?? "";
        const id = link.split("/").pop() ?? "";
        const title = $el.find(".title").text().trim();
        const cover = $el.find("img").attr("src") ?? "";

        return {
          id,
          title,
          cover,
        };
      })
      .get();

    return {
      results,
      isLastPage: true, // Since we can't paginate without an API
    };
  }

  async getDirectoryConfig(): Promise<DirectoryConfig> {
    return {
      filters: await this.getSearchFilters(),
      sort: {
        options: [],
        canChangeOrder: false,
        default: {
          id: "title",
          ascending: true,
        },
      },
    };
  }

  async getPreferenceMenu(): Promise<Form> {
    return {
      sections: [
        {
          header: "Languages",
          footer: "Language in which chapters will be available",
          children: [
            UIPicker({
              id: "chapter_lang",
              title: "Content Languages",
              options: LANGUAGE_OPTIONS,
              value: (await ObjectStore.string("chapter_lang")) ?? "en",
              async didChange(value) {
                return ObjectStore.set("chapter_lang", value);
              },
            }),
          ],
        },
      ],
    };
  }

  async getSearchFilters(): Promise<DirectoryFilter[]> {
    const properties = getProperties();
    return [
      {
        id: "content_type",
        title: "Content Type",
        type: FilterType.MULTISELECT,
        options: properties[0].tags,
      },
      {
        id: "demographic",
        title: "Demographic",
        type: FilterType.MULTISELECT,
        options: properties[1].tags,
      },
      {
        id: "genres",
        title: "Genres",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: properties[2].tags,
      },
    ];
  }

  async willRequestImage(url: string): Promise<NetworkRequest> {
    return {
      url,
      headers: {
        referer: this.BASE_URL,
      },
    };
  }

  // Homepage implementation
  async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
    if (link.id !== "home") throw new Error("Page not found");

    return [
      { id: "popular", title: "Popular Today" },
      { id: "latest", title: "Latest Update" },
      { id: "trending", title: "Trending" }
    ];
  }

  async resolvePageSection(
    _link: PageLink,
    sectionID: string,
    _pageContext?: any
  ): Promise<ResolvedPageSection> {
    const { data } = await this.client.get(this.BASE_URL);
    const $ = cheerio.load(data);

    let selector = "";
    switch (sectionID) {
      case "popular":
        selector = "h1:contains('Popular Today')";
        break;
      case "latest":
        selector = "h2:contains('Latest Update')";
        break;
      case "trending":
        selector = "h2:contains('Trending')";
        break;
      default:
        throw new Error("Unknown Section ID");
    }

    // Find the section container
    const section = $(selector).parent();
    const items: { id: string; title: string; cover: string }[] = [];

    // Extract manga cards
    section.find("a[href*='/series/']").each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href") ?? "";
      const id = href.replace("/series/", "");
      const title = $el.find("h5").text().trim();
      const cover = $el.find("img").attr("src") ?? "";

      if (id && title && cover) {
        items.push({ id, title, cover });
      }
    });

    return {
      items
    };
  }
}
