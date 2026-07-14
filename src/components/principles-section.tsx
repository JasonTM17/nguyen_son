import { workingPrinciples } from "../content/portfolio-data";

export function PrinciplesSection() {
  return (
    <section className="section section--principles" id="principles" aria-labelledby="principles-heading">
      <div className="section-heading">
        <p className="eyebrow">Working principles</p>
        <h2 id="principles-heading">Stay close to the real constraints.</h2>
      </div>
      <ol className="principle-list">
        {workingPrinciples.map((principle, index) => (
          <li key={principle}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <p>{principle}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
