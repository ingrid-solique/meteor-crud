/**
 *
 */
MeteorPublishInterface = class MeteorPublishInterface extends BaseInterface {

	name () { return 'Publish' }

	use (name, type) {
		const iface = this;
		const crud = iface.getContext();

		if(type !== CRUD.TYPE_READ) return;

		Meteor.publish(name, function (args={}) {
			if (typeof args !== 'object') {
				console.error(`Error on ${name} [Publication] - Invalid args`);
				throw new Meteor.Error("invalid_args");
			}

			const handler = Meteor.wrapAsync(crud.handle.bind(crud));

			let req = { interface: iface, type, name, args };

			try {
				let result = handler(this, req);
				if (typeof result.data !== 'undefined' && result.data !== null) {

					// Non JSON content
					if (result.content_type !== 'application/json') {
						let doc = {
							type: result.content_type,
							data: new Buffer(result.data).toJSON(),
						};
						if (result.filename) doc.filename = result.filename;
						if (result.disposition) doc.disposition = result.disposition;
						if (result.content_encoding) doc.encoding = result.content_encoding;
						this.added(name, "FILE", doc);
						return this.ready();
					}

					if (iface._transformer) {
						result.data = iface._transformer(result.data);
					}
					/**
					 * If a non-reactive array was returned, we need to call added
					 * for each element and then ready. Try and intelligently pick
					 * _id's for the documents
					 */
					if (Array.isArray(result.data)) {
						let last_id = 1, usedIds = {};
						result.data.forEach(doc => {
							let id = doc._id || doc.id || last_id;
							while (usedIds[ EJSON.stringify(id) ]) { id = ++last_id }
							usedIds[ EJSON.stringify(id) ] = true;
							this.added(name, id, doc);
						});
						return this.ready();
					}
				}
				return result.data;
			} catch (err) {
				console.error(
					new Date(),
					`Error on ${name} [Publication] -` + iface.normalizeError(err),
					'Request args: ' + JSON.stringify(args)
				);
				throw new Meteor.Error(iface.normalizeError(err));
			}
		});
	}
}
