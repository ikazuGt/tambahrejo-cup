import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const conn = postgres(url, { max: 1 });
  const db = drizzle(conn, { schema });

  // wipe all tables
  for (const table of [
    "card_events", "goal_events", "match_photos", "matches",
    "players", "referees", "teams", "tournaments", "admin_users",
  ]) {
    await db.execute(sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`));
  }

  // tournament
  await db.insert(schema.tournaments).values({
    name: "TAMBAHREJO CUP BY ZAY.AGENCY",
    season: "2026",
  });

  // admin
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(schema.adminUsers).values({ username, passwordHash });

  // 16 teams
  const teamData = [
    { name: "Garuda FC", origin: "Tambahrejo Utara", managerName: "Pak Sutrisno", logoUrl: "https://placehold.co/128x128/dc2626/ffffff?text=GFC&font=roboto" },
    { name: "Elang Muda", origin: "Tambahrejo Selatan", managerName: "Pak Hadi", logoUrl: "https://placehold.co/128x128/1d4ed8/ffffff?text=EM&font=roboto" },
    { name: "Macan Putih", origin: "Tambahrejo Timur", managerName: "Pak Bayu", logoUrl: "https://placehold.co/128x128/15803d/ffffff?text=MP&font=roboto" },
    { name: "Singa Hitam", origin: "Tambahrejo Barat", managerName: "Pak Joko", logoUrl: "https://placehold.co/128x128/1e293b/ffffff?text=SH&font=roboto" },
    { name: "Banteng Jaya", origin: "Tambahrejo Tengah", managerName: "Pak Wira", logoUrl: "https://placehold.co/128x128/b91c1c/ffffff?text=BJ&font=roboto" },
    { name: "Rajawali FC", origin: "Desa Mukti", managerName: "Pak Anton", logoUrl: "https://placehold.co/128x128/7c3aed/ffffff?text=RFC&font=roboto" },
    { name: "Harimau FC", origin: "Desa Sukamaju", managerName: "Pak Dedi", logoUrl: "https://placehold.co/128x128/d97706/ffffff?text=HFC&font=roboto" },
    { name: "Kobra United", origin: "Desa Tirta", managerName: "Pak Eko", logoUrl: "https://placehold.co/128x128/059669/ffffff?text=KU&font=roboto" },
    { name: "Persada FC", origin: "Desa Jaya", managerName: "Pak Rudi", logoUrl: "https://placehold.co/128x128/0891b2/ffffff?text=PFC&font=roboto" },
    { name: "Bintang Timur", origin: "Desa Makmur", managerName: "Pak Agus", logoUrl: "https://placehold.co/128x128/4f46e5/ffffff?text=BT&font=roboto" },
    { name: "Merpati FC", origin: "Desa Sentosa", managerName: "Pak Budi", logoUrl: "https://placehold.co/128x128/be185d/ffffff?text=MFC&font=roboto" },
    { name: "Naga Merah", origin: "Desa Harapan", managerName: "Pak Cahyo", logoUrl: "https://placehold.co/128x128/e11d48/ffffff?text=NM&font=roboto" },
    { name: "Serigala FC", origin: "Desa Maju", managerName: "Pak Dimas", logoUrl: "https://placehold.co/128x128/475569/ffffff?text=SFC&font=roboto" },
    { name: "Kuda Hitam", origin: "Desa Lestari", managerName: "Pak Feri", logoUrl: "https://placehold.co/128x128/0f172a/ffffff?text=KH&font=roboto" },
    { name: "Burung Hantu", origin: "Desa Damai", managerName: "Pak Gilang", logoUrl: "https://placehold.co/128x128/6d28d9/ffffff?text=BH&font=roboto" },
    { name: "Ular Sanca", origin: "Desa Sejahtera", managerName: "Pak Hendra", logoUrl: "https://placehold.co/128x128/065f46/ffffff?text=US&font=roboto" },
  ];
  await db.insert(schema.teams).values(teamData);
  const allTeams = await db.select().from(schema.teams);

  // players: 11 per team
  const positions = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"];
  const firstNames = ["Andi", "Budi", "Cahyo", "Dimas", "Eko", "Feri", "Gilang", "Hendra", "Ilham", "Joko", "Krisna"];
  const lastNames = ["Saputra", "Pratama", "Wijaya", "Setiawan", "Nugroho", "Hidayat", "Rahman", "Kurniawan", "Susanto", "Hartono", "Permana"];
  const playerRows: (typeof schema.players.$inferInsert)[] = [];
  for (const t of allTeams) {
    for (let i = 0; i < 11; i++) {
      const playerName = `${firstNames[i]} ${lastNames[(i + t.id) % lastNames.length]}`;
      playerRows.push({
        teamId: t.id,
        name: playerName,
        jerseyNumber: i + 1,
        position: positions[i],
        photoUrl: `https://randomuser.me/api/portraits/men/${((t.id - 1) * 11 + i) % 100}.jpg`,
      });
    }
  }
  await db.insert(schema.players).values(playerRows);

  // referees
  await db.insert(schema.referees).values([
    { name: "Bambang Sukardi", role: "CENTER", photoUrl: "https://randomuser.me/api/portraits/men/60.jpg" },
    { name: "Slamet Riyadi", role: "CENTER", photoUrl: "https://randomuser.me/api/portraits/men/61.jpg" },
    { name: "Joko Pratomo", role: "LINESMAN", photoUrl: "https://randomuser.me/api/portraits/men/62.jpg" },
    { name: "Wahyu Santoso", role: "LINESMAN", photoUrl: "https://randomuser.me/api/portraits/men/63.jpg" },
    { name: "Agus Salim", role: "LINESMAN", photoUrl: "https://randomuser.me/api/portraits/men/64.jpg" },
    { name: "Rudi Hartono", role: "LINESMAN", photoUrl: "https://randomuser.me/api/portraits/men/65.jpg" },
  ]);
  const refs = await db.select().from(schema.referees);
  const centers = refs.filter((r) => r.role === "CENTER");
  const lines = refs.filter((r) => r.role === "LINESMAN");

  // matches: R16 (8 matches, half finished), QF (2 scheduled), one LIVE demo
  const today = new Date();
  today.setHours(15, 0, 0, 0);

  const matchRows: (typeof schema.matches.$inferInsert)[] = [];
  const r16Pairs = [[0,15],[1,14],[2,13],[3,12],[4,11],[5,10],[6,9],[7,8]];
  for (let i = 0; i < r16Pairs.length; i++) {
    const [h, a] = r16Pairs[i];
    const ko = new Date(today);
    ko.setDate(today.getDate() - 3 + Math.floor(i / 2));
    ko.setHours(15 + (i % 2) * 2, 0, 0, 0);
    const isFinished = i < 4;
    matchRows.push({
      round: "R16",
      homeTeamId: allTeams[h].id,
      awayTeamId: allTeams[a].id,
      kickoffAt: ko,
      venue: "Lapangan Tambahrejo",
      status: isFinished ? "FINISHED" : "SCHEDULED",
      homeScore: isFinished ? Math.floor(Math.random() * 3) + 1 : null,
      awayScore: isFinished ? Math.floor(Math.random() * 2) : null,
      centerRefereeId: centers[i % centers.length].id,
      linesman1Id: lines[i % lines.length].id,
      linesman2Id: lines[(i + 1) % lines.length].id,
    });
  }
  // 2 QF matches scheduled
  for (let i = 0; i < 2; i++) {
    const ko = new Date(today);
    ko.setDate(today.getDate() + 3 + i);
    ko.setHours(15, 0, 0, 0);
    matchRows.push({
      round: "QF",
      homeTeamId: allTeams[i * 2].id,
      awayTeamId: allTeams[i * 2 + 2].id,
      kickoffAt: ko,
      venue: "Lapangan Tambahrejo",
      status: "SCHEDULED",
      centerRefereeId: centers[0].id,
      linesman1Id: lines[0].id,
      linesman2Id: lines[1].id,
    });
  }

  await db.insert(schema.matches).values(matchRows);
  const allMatches = await db.select().from(schema.matches);
  const finished = allMatches.filter((m) => m.status === "FINISHED");

  if (finished.length > 0) {
    const demo = finished[0];
    const homeAll = await db.select().from(schema.players).where(eq(schema.players.teamId, demo.homeTeamId!));
    const awayAll = await db.select().from(schema.players).where(eq(schema.players.teamId, demo.awayTeamId!));

    await db.insert(schema.goalEvents).values([
      { matchId: demo.id, playerId: homeAll[8].id, teamId: demo.homeTeamId!, minute: 12, type: "GOAL" },
      { matchId: demo.id, playerId: homeAll[9].id, teamId: demo.homeTeamId!, minute: 34, type: "GOAL" },
      { matchId: demo.id, playerId: awayAll[10].id, teamId: demo.awayTeamId!, minute: 56, type: "PENALTY" },
    ]);
    await db.insert(schema.cardEvents).values([
      { matchId: demo.id, playerId: awayAll[3].id, teamId: demo.awayTeamId!, minute: 23, type: "YELLOW" },
      { matchId: demo.id, playerId: homeAll[4].id, teamId: demo.homeTeamId!, minute: 67, type: "YELLOW" },
      { matchId: demo.id, playerId: awayAll[5].id, teamId: demo.awayTeamId!, minute: 88, type: "RED" },
    ]);
    await db.update(schema.matches).set({ motmPlayerId: homeAll[8].id }).where(eq(schema.matches.id, demo.id));
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${username} / ${password}`);
  console.log(`${allTeams.length} teams, ${matchRows.length} matches seeded.`);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
