import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";
import { MultiImageInput } from "../components/MultiImageInput";

export const BOARDS = [
  { title: "Universe", value: "universe" },
  { title: "Creative Direction", value: "creative-direction" },
];

const altField = defineField({
  name: "alt",
  title: "Alt text",
  type: "string",
  description: "Describes the image for screen readers and search engines.",
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

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "board",
      title: "Section",
      type: "string",
      description: "Which page this project belongs to.",
      options: { list: BOARDS, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "Shown over the cover on hover, and as the heading on the project page. Leave blank for a single image that sits on the board without a page of its own.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "The project's web address, generated from the title.",
      options: { source: "title", maxLength: 96 },
      hidden: ({ document }) => !document?.title,
    }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "image",
      options: { hotspot: true },
      description:
        "The one image that represents this project on the board. Leave empty to use the first image below.",
    }),
    defineField({
      name: "images",
      title: "Images",
      description:
        "Everything in this project, in the order it appears on the project page. Drag to reorder.",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [altField, sizeField],
          preview: {
            select: { media: "asset", title: "alt", size: "size" },
            prepare: ({ media, title, size }) => ({
              media,
              title: title || "Image",
              subtitle: size && size !== "auto" ? `Size: ${size}` : undefined,
            }),
          },
        }),
      ],
      options: { layout: "grid" },
      components: { input: MultiImageInput },
    }),
    orderRankField({ type: "project" }),
  ],
  preview: {
    select: { title: "title", board: "board", cover: "cover", first: "images.0", images: "images" },
    prepare: ({ title, board, cover, first, images }) => {
      const count = Array.isArray(images) ? images.length : 0;
      const section = BOARDS.find((entry) => entry.value === board)?.title ?? "No section";
      return {
        title: title || "Untitled",
        subtitle: `${section} · ${count} ${count === 1 ? "image" : "images"}`,
        media: cover ?? first,
      };
    },
  },
});

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

export const schemaTypes = [siteSettings, project];
