import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Universe")
        .id("universeBoard")
        .child(S.document().schemaType("universeBoard").documentId("universeBoard")),

      S.listItem()
        .title("Creative Direction")
        .id("creativeDirectionBoard")
        .child(
          S.document()
            .schemaType("creativeDirectionBoard")
            .documentId("creativeDirectionBoard"),
        ),

      S.divider(),

      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
