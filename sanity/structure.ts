import type { StructureResolver } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { BOARDS } from "./schemaTypes";

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      ...BOARDS.map((board) =>
        orderableDocumentListDeskItem({
          type: "project",
          title: board.title,
          id: `projects-${board.value}`,
          filter: "board == $board",
          params: { board: board.value },
          S,
          context,
        }),
      ),

      S.divider(),

      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
