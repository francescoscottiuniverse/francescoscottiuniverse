import { defineArrayMember, defineField, defineType } from "sanity";
import { MultiImageInput } from "../components/MultiImageInput";

const altField = defineField({
  name: "alt",
  title: "Alt text",
  type: "string",
  description: "Describes the image for screen readers and search engines.",
});

const projectNameField = defineField({
  name: "projectName",
  title: "Hover text / Project name",
  type: "string",
  description:
    "Shown over the image on hover. Images on this board sharing the same text become one project, and only the first of them appears on the board as its cover — the rest live on the project page. Leave blank and the image stands on its own.",
});

const sizeField = defineField({
  name: "size",
  title: "Size",
  type: "string",
  initialValue: "auto",
  description:
    "How large this image sits on the page. Auto varies it slightly for a natural collage; the others force a size.",
  options: {
    list: [
      { title: "Auto", value: "auto" },
      { title: "Small", value: "small" },
      { title: "Medium", value: "medium" },
      { title: "Large", value: "large" },
      { title: "Extra large", value: "xlarge" },
    ],
    layout: "radio",
  },
});

const boardImages = (description: string) =>
  defineField({
    name: "images",
    title: "Board images",
    description,
    type: "array",
    of: [
      defineArrayMember({
        type: "image",
        options: { hotspot: true },
        fields: [altField, projectNameField, sizeField],
        preview: {
          select: { media: "asset", title: "projectName", size: "size" },
          prepare: ({ media, title, size }) => ({
            media,
            title: title || "Untitled",
            subtitle: size && size !== "auto" ? `Size: ${size}` : undefined,
          }),
        },
      }),
    ],
    options: { layout: "grid" },
    components: { input: MultiImageInput },
  });

const BOARD_HELP =
  "One tile per project. Drag to reorder; the first image of each project is the tile shown here.";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "wordmark",
      title: "Wordmark",
      type: "string",
      description: "Shown at the top of every page. Keep it to one line.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "tagline", title: "Tagline", type: "text", rows: 2 }),
    defineField({
      name: "email",
      title: "Contact email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "cover",
      title: "Homepage cover image",
      type: "image",
      options: { hotspot: true },
      description: "Fills the homepage full width and scrolls.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "about",
      title: "Story",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description:
        "One line per entry. Each line animates in separately, so keep them short. Drag to reorder.",
    }),
    defineField({
      name: "socials",
      title: "Social links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "social",
          fields: [
            defineField({ name: "title", title: "Name", type: "string" }),
            defineField({ name: "label", title: "Short label", type: "string" }),
            defineField({ name: "handle", title: "Handle", type: "string" }),
            defineField({ name: "href", title: "URL", type: "url" }),
          ],
          preview: { select: { title: "title", subtitle: "handle" } },
        }),
      ],
      description: "Drag to reorder.",
    }),
  ],
  preview: {
    select: { title: "name" },
    prepare: ({ title }) => ({ title: title ?? "Site Settings" }),
  },
});

export const universeBoard = defineType({
  name: "universeBoard",
  title: "Universe",
  type: "document",
  fields: [boardImages(`The images on the Universe page. ${BOARD_HELP}`)],
  preview: { prepare: () => ({ title: "Universe" }) },
});

export const creativeDirectionBoard = defineType({
  name: "creativeDirectionBoard",
  title: "Creative Direction",
  type: "document",
  fields: [boardImages(`The images on the Creative Direction page. ${BOARD_HELP}`)],
  preview: { prepare: () => ({ title: "Creative Direction" }) },
});

export const schemaTypes = [siteSettings, universeBoard, creativeDirectionBoard];
