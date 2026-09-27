import experience from "../../experience.json";

export default function Experience() {
  return (
    <div className="divide-y divide-stone-800 border-y border-stone-800">
      {experience.map((item) => (
        <article key={item.id} className="py-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h3 className="text-lg font-medium text-stone-100">
                {item.role}
              </h3>
              <p className="mt-2 text-sm text-[#91aa91]">
                {item.company}{" "}
                <span className="text-stone-600">({item.type})</span>
              </p>
            </div>
            <span className="shrink-0 pt-1 text-right font-mono text-xs text-stone-500">
              {item.startDate} - {item.endDate}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
