const express=require('express');
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');
const prisma = new PrismaClient();
const router = express.Router();


router.use(verifyToken)

router.post('/post', async (req, res) => {
  const { machine_name } = req.body;
  const created_by = req.user.userId; // fetched from token

  try {
    const machine = await prisma.machine.create({
      data: {
        machine_name,
        created_by,
      },
    });
    res.json(machine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get("/", async (req, res) => {
  const userId = req.user.userId;
  try {
    const machines = await prisma.machine.findMany({
      where: {
        created_by: userId, // Filter by the user who created the machine
      },
    });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/put/:id', async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params; // <-- FIXED
  const { machine_name } = req.body;

  try {
    const machine = await prisma.machine.findUnique({
      where: { id: parseInt(id) }, // parse to integer if `id` is a number
    });

    if (!machine || machine.created_by !== userId) {
      return res.status(403).json({ error: 'Unauthorized or machine not found' });
    }

    const updatedMachine = await prisma.machine.update({
      where: { id: parseInt(id) },
      data: { machine_name },
    });

    res.json(updatedMachine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete('/del/:id', async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params; // <-- FIXED

  try {
    const machine = await prisma.machine.findUnique({
      where: { id: parseInt(id) }, // parse to integer if `id` is a number
    });

    if (!machine || machine.created_by !== userId) {
      return res.status(403).json({ error: 'Unauthorized or machine not found' });
    }

    await prisma.machine.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



module.exports=router;