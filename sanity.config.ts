import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { media } from "sanity-plugin-media";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const SINGLETONS = ["siteSettings", "universeBoard", "creativeDirectionBoard"];

export default defineConfig({
  name: "francescoscottiuniverse",
  title: "Francesco Luigi Scotti",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), media(), visionTool({ defaultApiVersion: apiVersion })],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? actions.filter(({ action }) => action !== "duplicate" && action !== "delete")
        : actions,
  },
});
