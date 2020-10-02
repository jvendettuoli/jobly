/** Start server for jobly. */

const app = require('./app');
const { PORT } = require('./config');

app.listen(PORT, function() {
	console.debug(`Server starting on port ${PORT}!`);
});
