/**
 * 
 */
Tinytest.add("Router", (test) => {
	/**
	 * Assert the default interfaces
	 */
	test.isNotUndefined(CRUD.Interfaces, 				"Interfaces not exported");
	test.isNotUndefined(CRUD.Interfaces.Method, 		"Interfaces.Method not exported");
	test.isNotUndefined(CRUD.Interfaces.Publication,	"Interfaces.Publish not exported");
	test.isNotUndefined(CRUD.Interfaces.HTTP, 			"Interfaces.HTTP not exported");

	/**
	 * Remove methods
	 */
	delete Meteor.server.method_handlers['read-test-no-auth.read'];
	delete Meteor.server.method_handlers['read-test-auth.read'];
	delete Meteor.server.method_handlers['create-test.create'];
	delete Meteor.server.method_handlers['update-test.update'];
	delete Meteor.server.method_handlers['delete-test.delete'];

	/**
	 * Create a new instance of the RPC router
	 * @type {CRUD}
	 */
	let crud = new CRUD();

	/**
	 * Assign some interfaces
	 */
	let authenticator = function (token, callback) {
		if (token === 'VALID') {
			callback(null, 1);
		} else {
			callback('INVALID');
		}
	};

	let interfaces = [
		new CRUD.Interfaces.Method(),
		new CRUD.Interfaces.HTTP(),
		//new CRUD.Interfaces.Publication(),
	];
	interfaces.forEach(interface => {
		interface.setAuthenticator(authenticator);
		crud.addInterface(interface);
	});

	/**
	 * Assing some operations
	 */
	crud.bind('read-test-no-auth', CRUD.TYPE_READ, {auth: false}, () => {
		return 1;
	});

	crud.bind('read-test-auth', CRUD.TYPE_READ, {auth: true}, function () {
		return 1;
	});

	crud.bind('create-test', CRUD.TYPE_CREATE, {auth: false}, (options) => {
		return options.one + options.two;
	});

	crud.bind('update-test', CRUD.TYPE_UPDATE, {auth: false}, (options) => {
		return options.one * options.two;
	});

	crud.bind('delete-test', CRUD.TYPE_DELETE, {auth: false}, (options) => {
		return options.one - options.two;
	});

});