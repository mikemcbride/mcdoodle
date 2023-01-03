const { PrismaClient } = require('@prisma/client');
const { polls, questions, submissions, responses } = require('./data.js');
const prisma = new PrismaClient();

const load = async () => {
  try {
    await prisma.poll.deleteMany();
    console.log('Deleted records in poll table');

    await prisma.question.deleteMany();
    console.log('Deleted records in question table');

    await prisma.submission.deleteMany();
    console.log('Deleted records in submission table');

    await prisma.response.deleteMany();
    console.log('Deleted records in response table');

    await prisma.$queryRaw`ALTER TABLE Poll AUTO_INCREMENT = 1`;
    console.log('reset poll auto increment to 1');

    await prisma.$queryRaw`ALTER TABLE Question AUTO_INCREMENT = 1`;
    console.log('reset question auto increment to 1');

    await prisma.$queryRaw`ALTER TABLE Submission AUTO_INCREMENT = 1`;
    console.log('reset submission auto increment to 1');

    await prisma.$queryRaw`ALTER TABLE Response AUTO_INCREMENT = 1`;
    console.log('reset response auto increment to 1');

    await prisma.poll.createMany({
      data: polls,
    });
    console.log('Added poll data');

    await prisma.question.createMany({
      data: questions,
    });
    console.log('Added question data');

    await prisma.submission.createMany({
      data: submissions,
    });
    console.log('Added submission data');

    await prisma.response.createMany({
      data: responses,
    });
    console.log('Added response data');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load();
