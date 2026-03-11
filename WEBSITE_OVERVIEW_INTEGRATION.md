# Website: Overview data + line breaks (from CMS)

Use this when updating the **live portfolio site** so it shows CMS profile data with **next-line (paragraph) support** and optional **stats**.

---

## 1. Data shape (from Firestore `settings/profile`)

```ts
interface Overview {
  title: string;           // About section heading
  subtitle: string;       // Role (e.g. hero "Role: Creative Technologist")
  description: string;    // Bio — can contain \n for new lines / paragraphs
  stats: { label: string; value: string }[];  // e.g. { label: "Years", value: "6+" }
}
```

---

## 2. Understanding next line (bio / description)

Render `overview.description` so line breaks are visible. Use **one** of these:

**Option A – CSS (simplest)**  
Same element that shows the bio:

```html
<div class="whitespace-pre-line">
  {{ overview.description }}
</div>
```

Tailwind: `whitespace-pre-line`  
Plain CSS: `white-space: pre-line;`

**Option B – Split by newline**  
If you can’t use `pre-line`:

- Split `overview.description` by `\n\n` for paragraphs → wrap each in `<p>…</p>`.
- Inside each paragraph, split by `\n` and join with `<br />` if you need single line breaks.

---

## 3. Optional: stats

If you want to show stats above or below the bio:

```jsx
{overview?.stats?.length > 0 && overview.stats.map((s, i) => (
  <div key={i}>
    <span class="text-muted text-xs">{s.label}</span>
    <span class="text-lg font-bold">{s.value}</span>
  </div>
))}
```

---

## Checklist for the website

- [ ] Load `overview` from Firestore (same doc the CMS uses: e.g. `settings/profile`).
- [ ] **Next line:** Render `overview.description` with `whitespace-pre-line` (or split `\n` / `\n\n` as above).
- [ ] Optionally show `overview.stats` (label + value).

After that, the site will show the same paragraph breaks (and stats) as in the CMS.
