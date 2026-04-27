import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOURNAMENT_ID = "c131a82b-e4b2-49fb-995d-139e153d9b1b";

interface TeamData {
  player1: string;
  player2: string;
}

interface CategoryData {
  name: string;
  level: string;
  groups: Record<string, TeamData[]>;
}

const categories: CategoryData[] = [
  {
    name: "1ª Masculina",
    level: "Avanzado",
    groups: {
      A: [
        { player1: "David", player2: "José Luis" },
        { player1: "Dani Tornero", player2: "Ángel Martínez" },
        { player1: "Toni Almendros", player2: "Hugo Tomás" },
      ],
      B: [
        { player1: "Poxo", player2: "Costa" },
        { player1: "Iván", player2: "Rober" },
        { player1: "Pesca", player2: "Simón" },
      ],
      C: [
        { player1: "Pablo Alberola", player2: "Sebas" },
        { player1: "Goyo", player2: "Carlos Fito" },
        { player1: "Hugo Navalón", player2: "Jorge García" },
      ],
      D: [
        { player1: "Charly", player2: "Jose Alberola" },
        { player1: "Cristian Díaz", player2: "Javi García" },
        { player1: "Santi Zafra", player2: "Garri" },
      ],
    },
  },
  {
    name: "2ª Masculina",
    level: "Intermedio",
    groups: {
      A: [
        { player1: "Cristian", player2: "Gerardo" },
        { player1: "Fernando García", player2: "Carlos Pinto" },
        { player1: "Josete", player2: "César" },
      ],
      B: [
        { player1: "Iván Villaescusa", player2: "Santi Egido" },
        { player1: "Rooney Pineda", player2: "Sergio Ramos" },
        { player1: "Juan Carlos Sánchez", player2: "Juan Carlos Sánchez Jr" },
      ],
      C: [
        { player1: "Andrés Estepa", player2: "Carlos Calero" },
        { player1: "Gascón", player2: "Pedro Milán" },
        { player1: "Iker", player2: "Forte" },
      ],
      D: [
        { player1: "Juan", player2: "Pablo Huerta" },
        { player1: "Santi Zafra 2M", player2: "Ángel Sánchez" },
        { player1: "Víctor Jiménez", player2: "Juan Beltrán" },
      ],
      E: [
        { player1: "Izan", player2: "Sergio Costa" },
        { player1: "Ángel Pacheco", player2: "Jorge García 2M" },
        { player1: "Isra", player2: "Lolo" },
      ],
      F: [
        { player1: "Manolo García", player2: "Jose Alberola 2M" },
        { player1: "Ful", player2: "Alex Angosto" },
        { player1: "Simón 2M", player2: "Jorge" },
      ],
      G: [
        { player1: "Rober 2M", player2: "Juanmi" },
        { player1: "Juanjo Gómez", player2: "Ángel Alpera" },
        { player1: "Batman", player2: "Chivu" },
      ],
      H: [
        { player1: "Cristian Díaz 2M", player2: "Guillermo Tomas" },
        { player1: "Juan Angel", player2: "Miguel Angel" },
        { player1: "Jose Vicente", player2: "Vicente Juan" },
      ],
    },
  },
  {
    name: "3ª Masculina",
    level: "Amateur",
    groups: {
      A: [
        { player1: "Nahuel Alvaro", player2: "Arturo Parra" },
        { player1: "Juanan", player2: "Dani Toledo" },
        { player1: "Mario Gosálvez", player2: "Miguel Angel 3M" },
      ],
      B: [
        { player1: "Pablo Sánchez", player2: "Pablo Sánchez Jr" },
        { player1: "Martin Huesca", player2: "Sergio Calatayud" },
        { player1: "Marti", player2: "Cristian Alexis" },
      ],
      C: [
        { player1: "Bélen Sánchez", player2: "Mar Albertos" },
        { player1: "Ful 3M", player2: "Juan Martínez" },
        { player1: "Iván Gandía", player2: "Jose Miguel" },
      ],
      D: [
        { player1: "Gavilán", player2: "Mario Sánchez" },
        { player1: "Mica Garcia", player2: "Joel Garcia" },
        { player1: "Antonio Jover", player2: "Paco López" },
      ],
      E: [
        { player1: "Javi Mena", player2: "Miguel Flores" },
        { player1: "Luis Milán", player2: "Armando" },
        { player1: "Felipe Daniel", player2: "Adrián Cano" },
      ],
      F: [
        { player1: "Cristian Muñoz", player2: "Chimo" },
        { player1: "Oscar González", player2: "Jorge Martínez" },
        { player1: "Pablo D", player2: "Pablo L" },
      ],
      G: [
        { player1: "Lucas Pérez", player2: "Daniel Martínez" },
        { player1: "Alejandro García", player2: "Sergio Jiménez" },
        { player1: "Fernando", player2: "Javier" },
      ],
      H: [
        { player1: "Sergio Quijada", player2: "Gonzalo Alonso" },
        { player1: "Rafael Egido", player2: "Izan 3M" },
        { player1: "Juan García", player2: "Guillermo Gómez" },
      ],
    },
  },
  {
    name: "Mixto",
    level: "Todos",
    groups: {
      A: [
        { player1: "Batman MX", player2: "Fermina Requena" },
        { player1: "Bea Sánchez", player2: "Pablo Cebrián" },
        { player1: "Belén Sánchez MX", player2: "Cristian Alcahut" },
      ],
      B: [
        { player1: "Belén Collado", player2: "Ángel Pacheco MX" },
        { player1: "Pablo MX", player2: "Dolo" },
        { player1: "Elena Sánchez", player2: "Luis Carlos" },
      ],
      C: [
        { player1: "Noe", player2: "Dani Tornero MX" },
        { player1: "Isra MX", player2: "Laura" },
        { player1: "Javi García MX", player2: "Lucia" },
      ],
    },
  },
  {
    name: "Femenino",
    level: "Todos",
    groups: {
      A: [
        { player1: "Chelo Albertos", player2: "María Belén" },
        { player1: "Elena Almendros", player2: "Belén Bonete" },
        { player1: "Maria Gomez", player2: "Lucia Romero" },
        { player1: "Ana", player2: "María José" },
      ],
    },
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("=== Seed Open Estrella Galicia ===\n");

  // Update tournament config
  await prisma.tournament.update({
    where: { id: TOURNAMENT_ID },
    data: {
      name: "Open Estrella Galicia",
      slug: "open-estrella-galicia",
      description: "Torneo Open Estrella Galicia de Almansa. Partidos a 2 sets con bola de oro en el 40-40, super tie-break a 10 en caso de empate.",
      maxTeams: 73,
      numGroups: 20, // total across all categories
      teamsPerGroup: 3,
      teamsAdvancingPerGroup: 2,
      numCourts: 5,
      status: "CLOSED",
    },
  });
  console.log("Torneo actualizado: Open Estrella Galicia (status: CLOSED)\n");

  // Track player creation to avoid unique email collisions
  let playerIndex = 0;

  for (const cat of categories) {
    // Create category
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        level: cat.level,
        tournamentId: TOURNAMENT_ID,
      },
    });
    console.log(`Categoría: ${cat.name} (${cat.level}) — ID: ${category.id}`);

    let teamCount = 0;
    for (const [groupName, teams] of Object.entries(cat.groups)) {
      for (const team of teams) {
        playerIndex++;
        const email1 = `player${playerIndex}a@open.local`;
        const email2 = `player${playerIndex}b@open.local`;

        // Create players
        const p1 = await prisma.player.create({
          data: { name: team.player1, email: email1, skillLevel: 5 },
        });
        const p2 = await prisma.player.create({
          data: { name: team.player2, email: email2, skillLevel: 5 },
        });

        // Create team
        const t = await prisma.team.create({
          data: {
            tournamentId: TOURNAMENT_ID,
            categoryId: category.id,
            player1Id: p1.id,
            player2Id: p2.id,
            teamName: `${team.player1} / ${team.player2}`,
            seed: null,
          },
        });

        // Create registration (confirmed)
        await prisma.registration.create({
          data: {
            tournamentId: TOURNAMENT_ID,
            teamId: t.id,
            status: "CONFIRMED",
            paymentConfirmed: true,
            paymentMethod: "CASH",
          },
        });

        teamCount++;
      }
    }
    console.log(`  → ${teamCount} equipos creados y confirmados\n`);
  }

  // Summary
  const totalTeams = await prisma.team.count({ where: { tournamentId: TOURNAMENT_ID } });
  const totalPlayers = await prisma.player.count();
  const totalRegs = await prisma.registration.count({ where: { tournamentId: TOURNAMENT_ID } });
  const cats = await prisma.category.count({ where: { tournamentId: TOURNAMENT_ID } });

  console.log("=== RESUMEN ===");
  console.log(`Categorías: ${cats}`);
  console.log(`Equipos: ${totalTeams}`);
  console.log(`Jugadores: ${totalPlayers}`);
  console.log(`Inscripciones confirmadas: ${totalRegs}`);
  console.log(`\nEstado del torneo: CLOSED (listo para generar grupos con OR-Tools)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
