const Express = require('express');
const BodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const cors = require('cors');

//get all the libraries needed
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema } = require('graphql');
const _ = require('lodash');

const port = 9292;
const CONNECTION_URL = 'mongodb+srv://chickennem:oui@cluster0-dkozp.mongodb.net/test?retryWrites=true';
const DATABASE_NAME = 'movies';

const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection, data;

app.listen(port, () => {
	MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
		if (error) {
			throw error;
		}
		database = client.db(DATABASE_NAME);
		collection = database.collection('movies');
		console.log('Connected to `' + DATABASE_NAME + '`!');
	});
});
app.use(cors());
async function count_() {
	let c = 0;
	await collection.countDocuments().then((count) => {
		c = count;
	});
	return c;
}

app.get('/movies/populate', async (request, response) => {
	var count = await count_();
	if (count >= 56) {
		console.log('Database is fulled!');
		response.send('Database is fulled!');
	} else {
		const denzel_movies = await imdb(DENZEL_IMDB_ID);
		collection.insertMany(denzel_movies, (err, result) => {
			if (err) {
				return response.status(500).send(err);
			}
			response.send(denzel_movies.length + ' films has been implemented');
		});
	}
});
app.get('/movies', (request, response) => {
	collection.find({ metascore: { $gte: 70 } }).toArray((error, result) => {
		if (error) {
			return response.status(500).send(error);
		}
		let random = Math.floor(Math.random() * Math.floor(result.length));
		response.send(result[random]);
	});
});

app.get('/movies/search', (request, response) => {
	let metascore = 77;
	let limit = 5;
	if (request.query['limit'] != null && Number(request.query.limit) <= 5) limit = Number(request.query.limit);
	collection.find({ metascore: { $gte: metascore } }).sort({ metascore: -1 }).toArray((error, result) => {
		if (error) {
			return response.status(500).send(error);
		}
		var res = [];
		for (let i = 0; i < limit; i++) {
			if (result[i] != null) res.push(result[i]);
		}
		response.send(res);
	});
});

app.get('/movies/:id', (request, response) => {
	collection.findOne({ id: request.params.id }, (error, result) => {
		if (error) {
			return response.status(500).send(error);
		}
		response.send(result);
	});
});

app.post('/movies/:id', (request, response) => {
	collection.updateOne({ id: request.params.id }, { $set: request.body }, (error, result) => {
		if (error) {
			return response.status(500).send(error);
		}
		response.send(result);
	});
});


app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

const { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList} = require('graphql');

const { movieType } = require('./type.js');

const queryType = new GraphQLObjectType({
	name: 'Query',
	fields: {
		hello: {
			type: GraphQLString,

			resolve: function() {
				return 'Hello World';
			}
		},
		moviepopulate: {
			type: GraphQLString,
			resolve: async function() {
				var count = await count_();
				if (count >= 56) {
					return 'Database is fulled!';
				} else {
					const denzel_movies = await imdb(DENZEL_IMDB_ID);
					await collection.insertMany(denzel_movies);
					return "It's done";
				}
			}
		},
		moviesearch: {
			type: movieType,
			args: {
				id: { type: GraphQLString }
			},
			resolve: async function(source, args) {
				data = await collection.find().toArray();
				return _.find(data, { id: args.id });
			}
		},
		moviesearchRandomly: {
			type: movieType,
			resolve: async function() {
				data = await collection.find({ metascore: { $gte: 70 } }).toArray();
				let random = Math.floor(Math.random() * Math.floor(data.length));
				return data[random];
			}
        }, 
        setDateReview: {
            type: movieType,
            args: {
                id: { type: GraphQLString },
                date:{type:GraphQLString},
                review:{type:GraphQLString}
            },
            resolve: async function (source,args) {
                data = await collection.updateOne({ "id": args.id }, { $set: {date: args.date ,review: args.review} });
                data = await collection.find().toArray();
                return _.find(data, { id: args.id });
            }

        },
		bestmovie: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(movieType))),
			resolve: async function() {
				let min_metascore = 77;
				let limit = 5;
				var res = [];
				count = 0;
				data = await collection.find({ metascore: { $gte: min_metascore } }).sort({ metascore: -1 }).toArray();
				for (let i = 0; i < limit; i++) {
					if (data[i] != null) {
						res.push(data[i]);
						console.log([ res[i] ]);
					}
				}
				return res;
			}
        }
  
	}
});
// Define the Schema
const schema = new GraphQLSchema({ query: queryType });

//Setup the nodejs GraphQL server
app.use(
	'/graphql',
	graphqlHTTP({
		schema: schema,
		graphiql: true
	})
);
console.log(`GraphQL Server Running at localhost:${port}`);
