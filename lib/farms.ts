import { env } from "cloudflare:workers";

export type Bloodline = { name: string; note?: string };

export type Farm = {
  id: number;
  slug: string;
  name: string;
  region: string;
  province: string;
  city: string;
  barangay: string | null;
  about: string | null;
  ownerName: string | null;
  phone: string | null;
  facebook: string | null;
  bloodlines: Bloodline[];
  isSample: boolean;
  createdAt: string;
};

type FarmRow = {
  id: number;
  slug: string;
  name: string;
  region: string;
  province: string;
  city: string;
  barangay: string | null;
  about: string | null;
  owner_name: string | null;
  phone: string | null;
  facebook: string | null;
  bloodlines: string;
  is_sample: number;
  created_at: string;
};

// Only admin-approved farms are ever shown to the public.
const SCHEMA = [
  `create table if not exists farms (
    id integer primary key autoincrement,
    slug text not null unique,
    name text not null,
    region text not null,
    province text not null,
    city text not null,
    barangay text,
    about text,
    owner_name text,
    phone text,
    facebook text,
    bloodlines text not null default '[]',
    status text not null default 'pending' check (status in ('pending','approved','rejected')),
    is_sample integer not null default 0,
    created_at text not null default (datetime('now'))
  )`,
  `create index if not exists farms_status_city on farms (status, province, city)`,
];

// Sample farms so the site has something to show before real farms sign up.
// They are marked "Sample" everywhere and can be removed with one query:
//   delete from farms where is_sample = 1;
const SAMPLES: Array<Omit<Farm, "id" | "createdAt" | "isSample" | "region" | "province">> = [
  { slug: "bukid-malaya-gamefarm", name: "Bukid Malaya Gamefarm", city: "Lipa City", barangay: null, about: null, ownerName: null, phone: null, facebook: null, bloodlines: [{ name: "Sweater" }, { name: "Kelso" }, { name: "Hatch" }] },
  { slug: "tres-lomas-farm", name: "Tres Lomas Farm", city: "Rosario", barangay: null, about: null, ownerName: null, phone: null, facebook: null, bloodlines: [{ name: "Roundhead" }, { name: "Grey" }] },
  { slug: "kalye-mabini-breeders", name: "Kalye Mabini Breeders", city: "Tanauan City", barangay: null, about: null, ownerName: null, phone: null, facebook: null, bloodlines: [{ name: "Lemon" }, { name: "Sweater" }] },
  { slug: "silangan-ridge-farm", name: "Silangan Ridge Farm", city: "Ibaan", barangay: null, about: null, ownerName: null, phone: null, facebook: null, bloodlines: [{ name: "Kelso" }, { name: "Albany" }] },
  { slug: "dos-puno-gamefowl", name: "Dos Puno Gamefowl", city: "Santo Tomas", barangay: null, about: null, ownerName: null, phone: null, facebook: null, bloodlines: [{ name: "Hatch" }, { name: "Grey" }] },
  { slug: "mataas-na-lupa-farm", name: "Mataas na Lupa Farm", city: "San Jose", barangay: null, about: null, ownerName: null, phone: null, facebook: null, bloodlines: [{ name: "Roundhead" }, { name: "Lemon" }] },
];

let ready: Promise<void> | null = null;

// Creates the table and seeds samples once per Worker instance. Safe to run
// repeatedly: "if not exists" and "insert or ignore" make it a no-op after the first time.
export function ensureFarms(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const db = env.DB;
      await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
      const insert = db.prepare(
        `insert or ignore into farms (slug, name, region, province, city, bloodlines, status, is_sample)
         values (?, ?, 'CALABARZON (Region IV-A)', 'Batangas', ?, ?, 'approved', 1)`,
      );
      await db.batch(SAMPLES.map((f) => insert.bind(f.slug, f.name, f.city, JSON.stringify(f.bloodlines))));
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

function toFarm(r: FarmRow): Farm {
  let bloodlines: Bloodline[] = [];
  try {
    bloodlines = JSON.parse(r.bloodlines);
  } catch {
    bloodlines = [];
  }
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    region: r.region,
    province: r.province,
    city: r.city,
    barangay: r.barangay,
    about: r.about,
    ownerName: r.owner_name,
    phone: r.phone,
    facebook: r.facebook,
    bloodlines,
    isSample: r.is_sample === 1,
    createdAt: r.created_at,
  };
}

export type FarmFilter = { q?: string; city?: string; lines?: string[]; limit?: number };

export async function listFarms(filter: FarmFilter = {}): Promise<Farm[]> {
  await ensureFarms();
  const where = ["status = 'approved'"];
  const args: unknown[] = [];
  if (filter.q) {
    where.push("(name like ? or bloodlines like ?)");
    const like = `%${filter.q.replace(/[%_]/g, "")}%`;
    args.push(like, like);
  }
  if (filter.city) {
    where.push("city = ?");
    args.push(filter.city);
  }
  if (filter.lines?.length) {
    where.push("(" + filter.lines.map(() => "bloodlines like ?").join(" or ") + ")");
    for (const l of filter.lines) args.push(`%"name":"${l.replace(/["%_]/g, "")}"%`);
  }
  args.push(filter.limit ?? 60);
  const { results } = await env.DB.prepare(
    `select * from farms where ${where.join(" and ")} order by is_sample asc, created_at desc, name asc limit ?`,
  )
    .bind(...args)
    .all<FarmRow>();
  return results.map(toFarm);
}

export async function getFarm(slug: string): Promise<Farm | null> {
  await ensureFarms();
  const row = await env.DB.prepare(`select * from farms where slug = ? and status = 'approved'`).bind(slug).first<FarmRow>();
  return row ? toFarm(row) : null;
}

// Cities and bloodlines that actually have approved farms, for the filters.
export async function farmFacets(): Promise<{ cities: string[]; bloodlines: string[] }> {
  const farms = await listFarms({ limit: 500 });
  const cities = [...new Set(farms.map((f) => f.city))].sort();
  const bloodlines = [...new Set(farms.flatMap((f) => f.bloodlines.map((b) => b.name)))].sort();
  return { cities, bloodlines };
}
