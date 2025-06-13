
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const PORT = process.env.PORT || 3000;

// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');
// const authRoutes = require('./utils/authRoutes');
// const machinedataroutes=require('./routes/machinedataroutes');
// const machineroute=require('./routes/machine');
// const chartroute=require('./routes/chart')
// require('dotenv').config();
 
// // async function init() {
// //   const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
// //   const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

// //   try {
// //     const existingAdmin = await prisma.user.findUnique({
// //       where: { email: adminEmail },
// //     });

// //     if (!existingAdmin) {
// //       const hashedPassword = await bcrypt.hash(adminPassword, 10);

// //       await prisma.user.create({
// //         data: {
// //           name: 'Admin',
// //           email: adminEmail,
// //           password: hashedPassword,
// //           role: 'ADMIN',
// //         },
// //       });

// //       console.log('✅ Admin user created');
// //     } else {
// //       console.log('ℹ️ Admin user already exists');
// //     }
// //   } catch (error) {
// //     console.error('❌ Error during admin init:', error);
// //   }
// // } 
// const app = express();
// app.use(morgan('dev'))
// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/machinedataroute',machinedataroutes)
// app.use('/chartroute',chartroute)
// app.use('/machineroute',machineroute)
// app.use("/", ()=> {return {"msg":"Hello World"}})
// app.listen(3000,() => {
//     console.log('Server running on http://localhost:3000');
    
// }); 



const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./utils/authRoutes');
const machinedataroutes=require('./routes/machinedataroutes');
const machineroute=require('./routes/machine');
const chartroute=require('./routes/chart')
require('dotenv').config();

const app = express();
app.use(morgan('dev'))
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/machinedataroute',machinedataroutes)
app.use('/chartroute',chartroute)
app.use('/machineroute',machineroute)


app.get('/', (req, res) => {
    res.send('Welcome to the API');

    
})


 

const port = 3001

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
