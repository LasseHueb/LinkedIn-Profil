/* Startseite: Überschrift, Einleitung, Datenschutz-Hinweis, Editor, Text-Ideen und FAQ. */
import { esc, fill, editor, page, privacyNote, trustRow, faqSection, faqJsonLd, webAppJsonLd } from "../layout.mjs";

function ideasSection(ctx, ideas) {
  const cards = ideas.map((idea) => `<li class="idea">
        <h3>${esc(idea.title)}</h3>
        <p>${esc(fill(ctx, idea.text))}</p>
        <ul class="idea-examples">${idea.examples.map((x) => `<li>„${esc(x)}“</li>`).join("")}</ul>
        <button type="button" class="btn btn-ghost" data-apply-preset="${esc(idea.preset)}">Vorlage übernehmen</button>
      </li>`).join("\n      ");
  return `<section class="section" aria-labelledby="ideas-h">
    <h2 id="ideas-h">Ideen für deinen Text</h2>
    <ul class="ideas">
      ${cards}
    </ul>
  </section>`;
}

export default function pages(ctx) {
  const home = ctx.home;
  return [{
    path: "/",
    priority: "1.0",
    html: page(ctx, {
      path: "/",
      titleFull: `${fill(ctx, home.title)} | ${ctx.cfg.appName}`,
      title: fill(ctx, home.title),
      description: fill(ctx, home.description),
      og: "/img/og/home.jpg",
      editor: true,
      preset: home.preset,
      jsonLd: [webAppJsonLd(ctx, ctx.abs("/")), faqJsonLd(ctx, home.faq)],
      main: `
  <div class="hero">
    <h1>${esc(fill(ctx, home.h1))}</h1>
    <p class="lead">${esc(fill(ctx, home.lead))}</p>
    ${trustRow()}
  </div>
  ${privacyNote()}
  ${editor(ctx)}
  ${ideasSection(ctx, home.ideas)}
  ${faqSection(ctx, home.faq)}`
    })
  }];
}
