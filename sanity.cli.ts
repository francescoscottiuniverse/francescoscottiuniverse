import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "francescoscottiuniverse",
  deployment: { appId: "sque69ol4l5sqrixgkmal66f", autoUpdates: true },
});
