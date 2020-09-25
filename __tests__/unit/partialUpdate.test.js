const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', () => {
	it('should generate a proper partial update query with just 1 field', function() {
		const { query, values } = sqlForPartialUpdate(
			'companies',
			{ name: 'Test Co.', num_employees: 10 },
			'handle',
			1
		);
		expect(query).toEqual('UPDATE companies SET name=$1, num_employees=$2 WHERE handle=$3 RETURNING *');
		expect(values).toEqual([ 'Test Co.', 10, 1 ]);
	});
});
