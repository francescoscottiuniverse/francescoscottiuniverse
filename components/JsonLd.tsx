export function JsonLd({ data }: { data: Record<string, unknown>[] }) {
  const graph = { "@context": "https://schema.org", "@graph": data };
  const json = JSON.stringify(graph).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
