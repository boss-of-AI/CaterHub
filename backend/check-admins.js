const { PrismaClient } = require('./src/generated/prisma');
const p = new PrismaClient();
async function main() {
  const admins = await p.admin.findMany();
  console.log(JSON.stringify(admins, null, 2));
  await p['$disconnect']();
}
main();
