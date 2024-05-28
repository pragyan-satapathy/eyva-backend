const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')

dotenv.config();
const sequelize = require('./config/db');
const Member = require('./models/Member');
const { Op } = require('sequelize');
const data = require('./data.json');

const app = express();
app.use(bodyParser.json());

// sequelize.sync({ force: true }).then(() => {
//   console.log('Database & tables created!');
//   for(const member of data){
//     Member.create(member);
//   }
// });

// Routes
// GET /members
app.get('/members', async (req, res) => {
  try {
    let { page, limit, sortBy = 'createdAt', order = 'asc', search = '', filter = '' } = req.query;
    const offset = page ? (page - 1) * (limit ? parseInt(limit) : 0) : null;
    const limitValue = limit ? parseInt(limit) : null;
    search = search || filter;
    const whereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { userName: { [Op.iLike]: `%${search}%` } },
        { role: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { teams: { [Op.contains]: [search] } }
      ]
    };

    const { rows: members, count } = await Member.findAndCountAll({
      where: whereClause,
      order: [[sortBy, order.toUpperCase()]],
      limit: limitValue,
      offset: offset
    });

    res.status(200).json({ members, count: limit || count });
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /members/:id
app.get('/members/:id', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (member) {
      res.status(200).json(member);
    } else {
      res.status(404).json({ error: 'Member not found' });
    }
  } catch (err) {
    console.error('Error fetching member:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /members
app.post('/members', async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    console.error('Error saving members:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /members/:id
app.put('/members/:id', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (member) {
      await member.update(req.body);
      res.status(200).json(member);
    } else {
      res.status(404).json({ error: 'Member not found' });
    }
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /members/:id
app.delete('/members/:id', async (req, res) => {
 try {
   const member = await Member.findByPk(req.params.id);
   if (member) {
     await member.destroy();
     res.status(200).json(member);
   } else {
     res.status(404).json({ error: 'Member not found' });
   }
  } catch (err) {
    console.error('Error deleting members:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// errorHandler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.stack);
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
