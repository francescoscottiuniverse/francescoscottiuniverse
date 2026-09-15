import { useCallback, useRef, useState } from "react";
import { Button, Card, Stack, Text } from "@sanity/ui";
import {
  insert,
  setIfMissing,
  useClient,
  type ArrayOfObjectsInputProps,
} from "sanity";
import { apiVersion } from "../env";

const BATCH_SIZE = 5;

function uniqueKey() {
  return Math.random().toString(36).slice(2, 12);
}

export function MultiImageInput(props: ArrayOfObjectsInputProps) {
  const { onChange, schemaType } = props;
  const client = useClient({ apiVersion });
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const itemType = schemaType.of[0]?.name;

  const buildItem = useCallback(
    (assetId: string) => {
      const image = {
        _type: "image",
        _key: uniqueKey(),
        showOnBoard: true,
        asset: { _type: "reference", _ref: assetId },
      };
      if (itemType === "image") return image;
      return {
        _type: itemType,
        _key: uniqueKey(),
        image: { ...image, _key: undefined },
      };
    },
    [itemType],
  );

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      setError(null);
      setProgress({ done: 0, total: files.length });
      onChange(setIfMissing([]));

      try {
        for (let start = 0; start < files.length; start += BATCH_SIZE) {
          const batch = files.slice(start, start + BATCH_SIZE);
          const assets = await Promise.all(
            batch.map((file) =>
              client.assets.upload("image", file, { filename: file.name }),
            ),
          );
          onChange(insert(assets.map((asset) => buildItem(asset._id)), "after", [-1]));
          setProgress({ done: Math.min(start + batch.length, files.length), total: files.length });
        }
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      } finally {
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [buildItem, client, onChange],
  );

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}

      <Card padding={0}>
        <Stack gap={2}>
          <Button
            mode="ghost"
            tone="primary"
            text={
              progress
                ? `Uploading ${progress.done} / ${progress.total}…`
                : "Upload multiple images"
            }
            disabled={Boolean(progress)}
            onClick={() => inputRef.current?.click()}
          />
          <Text size={1} muted>
            Select many at once. They upload in batches and are added to the end of the list, then
            drag to reorder.
          </Text>
          {error ? (
            <Text size={1} style={{ color: "var(--card-badge-critical-fg-color)" }}>
              {error}
            </Text>
          ) : null}
        </Stack>
      </Card>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={(event) => handleFiles(event.currentTarget.files)}
      />
    </Stack>
  );
}
