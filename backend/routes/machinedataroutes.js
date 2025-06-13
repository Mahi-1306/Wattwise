// machinedataroutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const verifyToken = require('../middleware/verifyToken');



// Add machine data
router.post('/add', async (req, res) => {
  const { machine_id, date, data } = req.body;

  let parsedDate = null;
  if (date) {
    parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
  }

  try {
    const result = await prisma.machinedata.create({
      data: {
        machine_id: parseInt(machine_id),
        date: parsedDate || new Date(),
        data: data,
      },
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding data:', error);
    res.status(500).json({ error: error.message });
  }
});


router.use(verifyToken)

// Get all machine data with pagination
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const userId = req.user.userId;
  const userRole = req.user.role || 'USER';

  try {
    const whereClause = userRole === 'ADMIN' ? {} : { machine: { created_by: userId } };
    const data = await prisma.machinedata.findMany({
      skip: offset,
      take: limit,
      where: whereClause,
      include: { machine: { select: { machine_name: true } } },
      orderBy: { data: 'asc' },
    });
    const totalcount = await prisma.machinedata.count({
      where: whereClause,
    })
    console.log("I'm Herereeeeeeeeeeeeeeeeeeeeeeeee",totalcount)
    res.json({data, "total":totalcount});
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get machine data by ID
router.get('/getbyid/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const data = await prisma.machinedata.findUnique({
      where: { data_id: id },
      include: { machine: { select: { machine_name: true } } },
    });
    if (!data) {
      return res.status(404).json({ error: 'Data not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching data by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get machine data by machine name
router.get('/getbyname/:name', async (req, res) => {
  const name = req.params.name;
 const userId = req.user.userId;
  try {
    const rawData = await prisma.machinedata.findMany({
      where: {
        machine: {
          machine_name: {
            contains: name,
           
          },
          created_by: userId,
        },
      },
      include: { machine: { select: { machine_name: true } } },
    });

    if (rawData.length === 0) {
      return res.status(404).json({ error: 'No data found for this machine name' });
    }

    const formattedData = rawData.map(entry => ({
      machine_name: entry.machine.machine_name,
      data: entry.data,
      date: entry.date,
    }));
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching data by name:', error);
    res.status(500).json({ error: error.message });
  }
});

/// Get machine data by date range
router.get('/bydate', async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    const userId = req.user.userId;

    if (!startDate || !endDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      startDate = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
      endDate = `${yyyy}-${mm}-${dd}T23:59:59.999Z`;
    }

    const data = await prisma.machinedata.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        machine: {
          created_by: userId, // Filter by the user who created the machine
        },
      },
      include: { machine: { select: { machine_name: true } } },
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching bydate data:', error);
    res.status(500).json({ error: error.message });
  }
}); 


// Update machine data
router.put('/update/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { machine_id, date, data } = req.body;

  let parsedDate = null;
  if (date) {
    parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
  }

  try {
    const updated = await prisma.machinedata.update({
      where: { id: id },
      data: {
        machine_id: machine_id ? parseInt(machine_id) : undefined,
        date: parsedDate,
        data: data ? parseFloat(data) : undefined,
      },
    });
    res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.error('Error updating data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete machine data
router.delete('/delete/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.machinedata.delete({
      where: { data_id: id },
    });
    res.status(200).json({ message: 'Data deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.error('Error deleting data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;