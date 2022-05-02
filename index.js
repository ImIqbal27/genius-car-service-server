const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middle ware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Un-authorized access !' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
    // console.log('inside verifyjwt', authHeader);


}


////////////////////////////////////////db connection//////////////////////////////////////



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8e7vo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');
        const orderCollection = client.db('geniusCar').collection('order');


        //auth
        app.get('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send(accessToken);
        })

        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        /////////////////////single item//////////////
        // app.get('/service/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const service = await serviceCollection.findOne(query);
        //     res.send(service);

        // });

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        //post
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        });
        //delete
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        });
        //order collection
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result)
        });
        app.get('/order', verifyJWT, async (req, res) => {
            const decodeEmail = req.decoded.email;
            // const authHeader = req.headers.authorization;
            // console.log(authHeader);
            const email = req.query.email;
            // console.log(email);
            if (email === decodeEmail) {
                const query = { email: email }; // email: field e jar jar porer email ta ache seta only
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray(cursor);
                res.send(orders);
            }
            else {
                res.status(403).send({ message: 'Forbidden access' })
            }

        })
    }
    finally {

    }

}
run().catch(console.dir);


///////////////////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
    res.send('Running genius server');
});

app.listen(port, () => {
    console.log('listening', port);
})
