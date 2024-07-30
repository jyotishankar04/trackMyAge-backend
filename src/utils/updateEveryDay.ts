import prisma from "../config/prismaDb";

import cron from "node-cron";

// Define the updateToday function
const updateToday = async () => {
  const date = new Date();
  const tasks = await prisma.productivityLog.findMany({
    where: {
      AND: {
        date: { not: date },
        task: {
          isActive: true,
        },
      },
    },
    select: {
      task: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });
  const toUpdateTasks = tasks.map((task) => {
    return {
      id: task.task.id,
      userId: task.task.userId,
    };
  });
  const update = await prisma.productivityLog.createMany({
    data: toUpdateTasks.map((task) => ({
      productivityRating: 0,
      taskId: task.id,
      userId: task.userId,
      date,
      idProductive: false,
      description: "Not Productive",
    })),
    skipDuplicates: true,
  });
  if (!update) {
    console.log("Error in updating today's logs");
  }
  console.log(`${date} logs updated today`);
  return;
};

// Schedule the task to run at 12 AM every day
cron.schedule("0 0 * * *", () => {
  updateToday();
});
