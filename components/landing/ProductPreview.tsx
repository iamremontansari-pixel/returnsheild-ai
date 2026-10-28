const stats = [
  { label: "Orders analysed", value: "140" },
  { label: "Cash on delivery return rate", value: "24%" },
  { label: "Value of returned orders", value: "₹35,366" },
];

const pincodes = [
  { code: "400070", rate: 40, detail: "4 of 10 orders returned" },
  { code: "110093", rate: 33, detail: "4 of 12 orders returned" },
  { code: "226022", rate: 31, detail: "4 of 13 orders returned" },
];

function barColor(rate: number) {
  if (rate >= 30) return "#EE7D88";
  if (rate >= 20) return "#E5B45F";
  return "#42C6A5";
}

export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D1726] shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <p className="text-sm font-medium text-white">
          Your return risk at a glance
        </p>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-[#A9B8CA]">
          Sample data
        </span>
      </div>

      <div className="grid gap-px bg-white/10 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#0D1726] px-6 py-6">
            <p className="text-sm text-[#8FA1B8]">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-6 py-7">
        <p className="text-sm font-medium text-white">Pincodes to watch</p>
        <p className="mt-1 text-sm text-[#8FA1B8]">
          Cash on delivery orders with the highest return rate
        </p>

        <ul className="mt-6 space-y-5">
          {pincodes.map((item) => (
            <li key={item.code}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-white">
                  {item.code}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: barColor(item.rate) }}
                >
                  {item.rate}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.rate}%`,
                    backgroundColor: barColor(item.rate),
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-[#8FA1B8]">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
