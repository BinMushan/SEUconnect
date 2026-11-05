/**
 * Request-handler registry: lets a module plug business behaviour into the generic Request / approval
 * engine WITHOUT the engine knowing about the module.
 *
 *   hooks.registerRequestHandler('specialization_change', {
 *     // optional: validate / normalise the payload when a request is submitted (throw ApiError to reject)
 *     async validate({ payload, requester, req, session }) { return payload; },
 *     // runs inside the approval transaction when the FINAL step approves
 *     async onApproved({ request, req, session }) {},
 *     // runs inside the transaction when any step rejects
 *     async onRejected({ request, req, session }) {},
 *   });
 *
 * The request engine (modules/requests) looks handlers up with getRequestHandler(type).
 */
const handlers = new Map();

const registerRequestHandler = (type, handler) => {
  handlers.set(type, handler);
};
const getRequestHandler = (type) => handlers.get(type) || null;
const listRequestHandlers = () => [...handlers.keys()];

module.exports = { registerRequestHandler, getRequestHandler, listRequestHandlers };
