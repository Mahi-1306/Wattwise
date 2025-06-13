const express = require("express");
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const prisma = new PrismaClient();

router.use(verifyToken);

router.get("/data", async (req, res) => {
  try {
    let { startDate, endDate, groupBy, machineName } = req.query;
    const userId = req.user.userId;

    // Default to today's date if not provided
    if (!startDate || !endDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      startDate = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
      endDate = `${yyyy}-${mm}-${dd}T23:59:59.999Z`;
    }

    groupBy = groupBy ? groupBy.toLowerCase() : "day";

    let whereClause = `
      machinedata.date BETWEEN ? AND ?
      AND machine.created_by = ?
    `;
    const params = [new Date(startDate), new Date(endDate), userId];

    // Add machine name filter if present
    if (machineName) {
      whereClause += " AND machine.machine_name = ?";
      params.push(machineName);
    }

    // Determine group format based on groupBy
    let groupFormat;
    if (groupBy === "month") groupFormat = "%Y-%m";
    else if (groupBy === "year") groupFormat = "%Y";
    else groupFormat = "%Y-%m-%d"; // Default: group by day

    const data = await prisma.$queryRawUnsafe(`
      SELECT DATE_FORMAT(machinedata.date, '${groupFormat}') AS period,
             SUM(CAST(machinedata.data AS DECIMAL(10,2))) AS total
      FROM machinedata
      JOIN machine ON machinedata.machine_id = machine.id
      WHERE ${whereClause}
      GROUP BY period
      ORDER BY period
    `, ...params);

    res.json({
      startDate,
      endDate,
      data,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
