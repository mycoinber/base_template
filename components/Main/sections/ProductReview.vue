<script setup>
import { computed } from "vue";
import { parse } from "node-html-parser";
import { resolveMediaPath } from "~/utils/mediaPath";

const props = defineProps({
  block: {
    type: Object,
    default: () => ({}),
  },
});

const SECTION_TITLES = {
  quick_facts: "Quick Facts",
  how_offer_works: "How the Offer Works",
  key_terms: "Key Terms That Matter",
  pros: "Pros",
  cons: "Cons",
  best_for: "Best For / Not Ideal For",
  bottom_line: "Bottom Line",
};

const parseParagraphNodes = (html) => {
  if (!html || typeof html !== "string") return [];

  if (import.meta.server) {
    const root = parse(html);
    const nodes = root.querySelectorAll("p");
    return nodes.map((node) => ({
      label: String(node.getAttribute("data-pr-section-label") || "").trim(),
      html: String(node.innerHTML || "").trim(),
      text: String(node.text || "").replace(/\s+/g, " ").trim(),
    }));
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll("p"));
  return nodes.map((node) => ({
    label: String(node.getAttribute("data-pr-section-label") || "").trim(),
    html: String(node.innerHTML || "").trim(),
    text: String(node.textContent || "").replace(/\s+/g, " ").trim(),
  }));
};

const toTitleFromKey = (value = "") =>
  String(value)
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const splitKeyValue = (value) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return null;
  const separators = [" - ", " — ", " – ", ": "];
  for (const separator of separators) {
    const idx = text.indexOf(separator);
    if (idx > 0 && idx < text.length - separator.length) {
      return {
        term: text.slice(0, idx).trim(),
        description: text.slice(idx + separator.length).trim(),
      };
    }
  }
  return null;
};

const structuredContent = computed(() => {
  const raw = props.block?.content || "";
  const entries = parseParagraphNodes(raw);

  const intro = [];
  const sections = [];
  let activeSection = null;

  for (const entry of entries) {
    if (!entry?.text) continue;

    if (entry.label) {
      const key = entry.label.toLowerCase();
      activeSection = {
        key,
        title: entry.text || SECTION_TITLES[key] || toTitleFromKey(key),
        paragraphs: [],
      };
      sections.push(activeSection);
      continue;
    }

    if (!activeSection) {
      intro.push(entry);
      continue;
    }

    activeSection.paragraphs.push(entry);
  }

  const normalizedSections = sections.map((section) => {
    const facts = [];
    const listItems = [];
    const audience = [];
    const extraParagraphs = [];

    for (const paragraph of section.paragraphs) {
      const pair = splitKeyValue(paragraph.text);

      if (section.key === "quick_facts" && pair) {
        facts.push(pair);
        continue;
      }

      if (section.key === "best_for" && pair) {
        audience.push(pair);
        continue;
      }

      if (section.key === "pros" || section.key === "cons") {
        listItems.push(paragraph.text);
        continue;
      }

      extraParagraphs.push(paragraph);
    }

    return {
      ...section,
      facts,
      audience,
      listItems,
      paragraphs: extraParagraphs,
    };
  });

  return { intro, sections: normalizedSections };
});

const sectionImage = computed(() => {
  if (Array.isArray(props.block?.imageUrl) && props.block.imageUrl.length) {
    return props.block.imageUrl[0];
  }
  if (props.block?.imageMedia?.path) {
    return props.block.imageMedia;
  }
  if (props.block?.image?.path) {
    return props.block.image;
  }
  return null;
});

const sectionImageSrc = computed(() => {
  const media = sectionImage.value;
  if (!media) return "";
  const variants = Array.isArray(media.variants) ? media.variants : [];
  if (variants.length) {
    const sorted = [...variants].sort((a, b) => (b?.width || 0) - (a?.width || 0));
    if (sorted[0]?.path) return resolveMediaPath(sorted[0].path);
  }
  const fallback = media.originalPath || media.path || "";
  return fallback ? resolveMediaPath(fallback) : "";
});

const sectionHeadline = computed(() => props.block?.headline || props.block?.H2 || "Product Review");
const hasStructuredContent = computed(
  () => structuredContent.value.intro.length > 0 || structuredContent.value.sections.length > 0,
);

const isImageLeft = computed(() => {
  const order = Number(props.block?.order ?? 0);
  if (!Number.isFinite(order)) return true;
  return order % 2 === 0;
});
</script>

<template>
  <section :id="block._id" class="my-8 max-[541px]:my-4">
    <div class="container">
      <div
        :class="[
          'flex flex-nowrap gap-8 w-full max-[541px]:flex-col',
          { 'flex-row-reverse': isImageLeft },
        ]"
      >
        <div
          class="flex-1 overflow-hidden [&_a]:text-color-01 max-[541px]:[&_table]:block max-[541px]:[&_table]:w-full max-[541px]:[&_table]:max-w-full max-[541px]:[&_table]:overflow-x-auto max-[541px]:[&_table]:pb-2 max-[541px]:[&_table]:pr-2"
        >
          <h2>{{ sectionHeadline }}</h2>

          <div
            v-if="structuredContent.intro.length"
            class="space-y-2"
          >
            <p v-for="(intro, index) in structuredContent.intro" :key="`intro-${index}`" v-html="intro.html" />
          </div>

          <div
            v-else-if="block?.content"
            class="prose prose-invert overflow-hidden"
            v-html="block.content"
          />

          <template v-if="hasStructuredContent">
            <section
              v-for="(section, sectionIndex) in structuredContent.sections"
              :key="`${section.key}-${sectionIndex}`"
              class="mt-6"
            >
              <h3>{{ section.title }}</h3>

              <div
                v-if="section.key === 'quick_facts' && section.facts.length"
                class="overflow-hidden max-[541px]:overflow-x-auto"
              >
                <table>
                  <tbody>
                    <tr v-for="(fact, factIndex) in section.facts" :key="`fact-${factIndex}`">
                      <th>{{ fact.term }}</th>
                      <td>{{ fact.description }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                v-else-if="section.key === 'best_for' && section.audience.length"
                class="grid grid-cols-2 gap-8 max-[541px]:grid-cols-1"
              >
                <div v-for="(entry, entryIndex) in section.audience" :key="`aud-${entryIndex}`">
                  <h4>{{ entry.term }}</h4>
                  <p>{{ entry.description }}</p>
                </div>
              </div>

              <ul
                v-else-if="(section.key === 'pros' || section.key === 'cons') && section.listItems.length"
              >
                <li
                  v-for="(item, itemIndex) in section.listItems"
                  :key="`item-${itemIndex}`"
                >
                  {{ item }}
                </li>
              </ul>

              <div v-else>
                <p
                  v-for="(paragraph, paragraphIndex) in section.paragraphs"
                  :key="`paragraph-${paragraphIndex}`"
                  v-html="paragraph.html"
                />
              </div>
            </section>
          </template>
        </div>

        <div v-if="sectionImageSrc" class="flex-1">
          <div class="w-full aspect-square rounded-[0.625rem] overflow-hidden">
            <img
              :src="sectionImageSrc"
              :alt="sectionImage?.alt || sectionHeadline"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
