const { MongoClient } = require('mongodb');
const CONNECTION_URL = "mongodb+srv://chickennem:oui@cluster0-dkozp.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "movies";
module.exports = async () => {
    const client = await MongoClient.connect(CONNECTION_URL, { 'useNewUrlParser': true });

    return {
        client,
        'db': client.db(DATABASE_NAME)
    };
};